import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarSimpatizanteDto } from './dto/actualizar-simpatizante.dto';
import { CrearSimpatizanteDto } from './dto/crear-simpatizante.dto';
import { ActualizarIntencionVotoDto } from './dto/actualizar-intencion-voto.dto';
import type {
  DatosBusquedaInteligente,
  EncontradoEn,
  ResultadoBusquedaInteligente,
} from './dto/resultado-busqueda-inteligente.dto';
import { Prisma } from '@prisma/client';

type UsuarioConContexto = Prisma.UsuarioGetPayload<{
  include: {
    perfil: {
      include: {
        permisos: { include: { permiso: true } };
      };
    };
    permisos_personalizados: { include: { permiso: true } };
  };
}>;

type SimpatizanteRecord = Prisma.SimpatizanteGetPayload<Record<string, never>>;

type PadronInternoRecord = Prisma.PadronInternoGetPayload<Record<string, never>>;

type PadronGeneralRecord = Prisma.PadronGeneralGetPayload<Record<string, never>>;

@Injectable()
export class SimpatizantesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CONTEXTO UNIFICADO
  // ==========================================
  private async obtenerContexto(usuarioId: string, campanaIdHeader?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfil: {
          include: {
            permisos: { include: { permiso: true } },
          },
        },
        permisos_personalizados: { include: { permiso: true } },
      },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuario.perfil.nombre === 'ROOT';
    const campanaId = esRoot ? campanaIdHeader : (usuario.campana_id ?? undefined);

    if (!campanaId) {
      throw new ForbiddenException(
        esRoot
          ? 'Seleccioná una campaña en el selector superior para operar'
          : 'El usuario no pertenece a ninguna campaña',
      );
    }

    return { usuario, esRoot, campanaId };
  }

  // ==========================================
  // MAPPERS PRIVADOS
  // ==========================================
  private mapearDesdeSimpatizante(s: SimpatizanteRecord): DatosBusquedaInteligente {
    return {
      ci: s.documento,
      nombre: s.nombre,
      apellido: s.apellido,
      fecha_nacimiento: s.fecha_nacimiento ?? null,
      departamento: s.departamento ?? null,
      distrito: s.distrito ?? null,
      seccional: s.seccional_interna ?? null,
      local_votacion: s.local_votacion_interna ?? s.local_votacion_general ?? null,
      mesa: s.mesa_votacion_interna ?? s.mesa_votacion_general ?? null,
      orden: s.orden_votacion_interna ?? s.orden_votacion_general ?? null,
    };
  }

  private mapearDesdePadronInterno(p: PadronInternoRecord): DatosBusquedaInteligente {
    return {
      ci: p.ci,
      nombre: p.nombre,
      apellido: p.apellido,
      fecha_nacimiento: p.fecha_nacimiento ?? null,
      departamento: p.departamento ?? null,
      distrito: p.distrito ?? null,
      seccional: p.seccional ?? null,
      local_votacion: p.local_votacion ?? null,
      mesa: p.mesa ?? null,
      orden: p.orden ?? null,
    };
  }

  private mapearDesdePadronGeneral(p: PadronGeneralRecord): DatosBusquedaInteligente {
    return {
      ci: p.ci,
      nombre: p.nombre,
      apellido: p.apellido,
      fecha_nacimiento: p.fecha_nacimiento ?? null,
      departamento: p.departamento ?? null,
      distrito: p.distrito ?? null,
      seccional: null,
      local_votacion: p.local_votacion ?? null,
      mesa: p.mesa ?? null,
      orden: p.orden ?? null,
    };
  }

  private async obtenerRedJerarquica(actorId: string, campanaId: string): Promise<string[]> {
    const obtenerRecursivo = async (ids: string[]): Promise<string[]> => {
      const subordinados = await this.prisma.usuario.findMany({
        where: {
          candidato_superior_id: { in: ids },
          eliminado: false,
          campana_id: campanaId,
        },
        select: { id: true },
      });

      if (!subordinados.length) return ids;

      const nuevosIds = subordinados.map((s) => s.id).filter((id) => !ids.includes(id));

      if (!nuevosIds.length) return ids;

      return obtenerRecursivo([...ids, ...nuevosIds]);
    };

    return obtenerRecursivo([actorId]);
  }

  // ==========================================
  // BUSQUEDA INTELIGENTE
  // ==========================================
  async busquedaInteligente(
    cedula: string,
    usuarioId: string,
    campanaIdHeader?: string,
  ): Promise<ResultadoBusquedaInteligente> {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
      include: { configuracion: true },
    });

    if (!campana) throw new NotFoundException('Campaña no encontrada');

    const configuracion = campana.configuracion;
    const modoEleccion = configuracion?.modo_eleccion ?? 'GENERALES';
    const permiteRegistroManual = configuracion?.permitir_registro_manual_fuera_padron ?? false;
    const permiteDuplicados = configuracion?.permitir_duplicados_simpatizantes ?? false;

    // Paso 1: buscar en simpatizantes de la campana
    const simpatizanteExistente = await this.prisma.simpatizante.findFirst({
      where: {
        documento: cedula,
        campana_id: campanaId,
        eliminado: false,
      },
    });

    if (simpatizanteExistente) {
      return {
        encontrado_en: 'SIMPATIZANTE',
        simpatizante_existente: true,
        simpatizante_id: simpatizanteExistente.id,
        permite_registro_manual: permiteRegistroManual,
        permite_duplicados_simpatizantes: permiteDuplicados,
        datos: this.mapearDesdeSimpatizante(simpatizanteExistente),
        mensaje: 'La persona ya fue registrada como simpatizante en esta campaña',
      };
    }

    // Paso 2: buscar en padrones segun modo
    let encontradoEn: EncontradoEn = 'NO_ENCONTRADO';
    let datos: DatosBusquedaInteligente | null = null;

    if (modoEleccion === 'INTERNAS') {
      const partidoId = campana.partido_id;

      if (!partidoId) {
        throw new BadRequestException(
          'La campaña está en modo INTERNAS pero no tiene partido asociado',
        );
      }

      const padronInterno = await this.prisma.padronInterno.findFirst({
        where: { ci: cedula, partido_id: partidoId },
      });

      if (padronInterno) {
        encontradoEn = 'PADRON_INTERNO';
        datos = this.mapearDesdePadronInterno(padronInterno);
      } else {
        const padronGeneral = await this.prisma.padronGeneral.findUnique({
          where: { ci: cedula },
        });

        if (padronGeneral) {
          encontradoEn = 'PADRON_GENERAL';
          datos = this.mapearDesdePadronGeneral(padronGeneral);
        }
      }
    } else {
      const padronGeneral = await this.prisma.padronGeneral.findUnique({
        where: { ci: cedula },
      });

      if (padronGeneral) {
        encontradoEn = 'PADRON_GENERAL';
        datos = this.mapearDesdePadronGeneral(padronGeneral);
      }
    }

    const mensajes: Record<EncontradoEn, string> = {
      PADRON_INTERNO: 'Persona encontrada en padrón interno',
      PADRON_GENERAL: 'Persona encontrada en padrón general',
      NO_ENCONTRADO: 'La persona no figura en simpatizantes ni en los padrones disponibles',
      SIMPATIZANTE: 'La persona ya fue registrada como simpatizante en esta campaña',
    };

    return {
      encontrado_en: encontradoEn,
      simpatizante_existente: false,
      simpatizante_id: null,
      permite_registro_manual: permiteRegistroManual,
      permite_duplicados_simpatizantes: permiteDuplicados,
      datos,
      mensaje: mensajes[encontradoEn],
    };
  }

  // ==========================================
  // CREAR SIMPATIZANTE
  // ==========================================
  async crear(
    crearSimpatizanteDto: CrearSimpatizanteDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const configuracion = await this.prisma.configuracionCampana.findUnique({
      where: { campana_id: campanaId },
    });

    const permiteDuplicados = configuracion?.permitir_duplicados_simpatizantes ?? false;

    const simpatizanteExistente = await this.prisma.simpatizante.findFirst({
      where: {
        documento: crearSimpatizanteDto.documento,
        campana_id: campanaId,
      },
    });

    // Simpatizante activo: flujo de duplicados
    if (simpatizanteExistente && !simpatizanteExistente.eliminado) {
      if (!permiteDuplicados) {
        throw new ConflictException({
          codigo: 'SIMPATIZANTE_DUPLICADO_NO_PERMITIDO',
          mensaje: 'Esta persona ya fue registrada en esta campaña',
          simpatizante_id: simpatizanteExistente.id,
        });
      }

      if (!crearSimpatizanteDto.confirmar_duplicado) {
        throw new ConflictException({
          codigo: 'SIMPATIZANTE_DUPLICADO_CONFIRMABLE',
          mensaje:
            'Esta persona ya fue registrada. Si deseás, podés registrar el intento duplicado.',
          simpatizante_id: simpatizanteExistente.id,
        });
      }

      await this.prisma.duplicadoSimpatizante.create({
        data: {
          campana_id: campanaId,
          simpatizante_id: simpatizanteExistente.id,
          registrado_por_id_original: simpatizanteExistente.registrado_por_id,
          intento_registrar_id: usuarioId,
        },
      });

      return {
        duplicado_registrado: true,
        simpatizante_id: simpatizanteExistente.id,
        mensaje: 'Intento de duplicado registrado correctamente',
      };
    }

    const esOperativo = usuario.perfil.es_operativo;
    const actorId = esOperativo ? usuario.candidato_superior_id : usuarioId;

    if (esOperativo && !actorId) {
      throw new ForbiddenException('El usuario operativo no tiene un candidato superior asignado.');
    }

    const candidatoId = crearSimpatizanteDto.candidato_id ?? actorId!;

    const dataCreacion = {
      nombre: crearSimpatizanteDto.nombre,
      apellido: crearSimpatizanteDto.apellido,
      documento: crearSimpatizanteDto.documento,
      telefono: crearSimpatizanteDto.telefono,
      fecha_nacimiento: crearSimpatizanteDto.fecha_nacimiento,
      departamento: crearSimpatizanteDto.departamento,
      distrito: crearSimpatizanteDto.distrito,
      barrio: crearSimpatizanteDto.barrio,
      seccional_interna: crearSimpatizanteDto.seccional_interna,
      local_votacion_interna: crearSimpatizanteDto.local_votacion_interna,
      mesa_votacion_interna: crearSimpatizanteDto.mesa_votacion_interna,
      orden_votacion_interna: crearSimpatizanteDto.orden_votacion_interna,
      local_votacion_general: crearSimpatizanteDto.local_votacion_general,
      mesa_votacion_general: crearSimpatizanteDto.mesa_votacion_general,
      orden_votacion_general: crearSimpatizanteDto.orden_votacion_general,
      es_afiliado: crearSimpatizanteDto.es_afiliado ?? false,
      intencion_voto: crearSimpatizanteDto.intencion_voto ?? 'INDECISO',
      observaciones: crearSimpatizanteDto.observaciones,
      necesita_transporte: crearSimpatizanteDto.necesita_transporte ?? false,
      latitud: crearSimpatizanteDto.latitud,
      longitud: crearSimpatizanteDto.longitud,
      origen_registro: crearSimpatizanteDto.origen_registro ?? 'PADRON_INTERNO',
      lider_id: crearSimpatizanteDto.lider_id,
      candidato_id: candidatoId,
      campana_id: campanaId,
      registrado_por_id: usuarioId,
      eliminado: false,
    };

    // Simpatizante eliminado: reactivar
    if (simpatizanteExistente && simpatizanteExistente.eliminado) {
      return this.prisma.simpatizante.update({
        where: { id: simpatizanteExistente.id },
        data: dataCreacion,
      });
    }

    return this.prisma.simpatizante.create({ data: dataCreacion });
  }

  // ==========================================
  // OBTENER TODOS
  // ==========================================
  async obtenerTodos(usuarioId: string, campanaIdHeader?: string, soloPropios = false) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    if (esRoot) {
      return this.prisma.simpatizante.findMany({
        where: { eliminado: false, campana_id: campanaId },
        include: { _count: { select: { asistencias: true } } },
        orderBy: { fecha_registro: 'desc' },
      });
    }

    const esOperativo = usuario.perfil.es_operativo;
    const actorId = esOperativo ? (usuario.candidato_superior_id ?? usuarioId) : usuarioId;

    if (soloPropios) {
      return this.prisma.simpatizante.findMany({
        where: {
          eliminado: false,
          campana_id: campanaId,
          registrado_por_id: usuarioId,
        },
        include: { _count: { select: { asistencias: true } } },
        orderBy: { fecha_registro: 'desc' },
      });
    }

    const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

    return this.prisma.simpatizante.findMany({
      where: {
        eliminado: false,
        campana_id: campanaId,
        registrado_por_id: { in: redIds },
      },
      include: { _count: { select: { asistencias: true } } },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  // ==========================================
  // OBTENER POR ID
  // ==========================================
  async obtenerPorId(id: string, usuarioId: string, campanaIdHeader?: string) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id },
      include: {
        asistencias: {
          include: {
            evento: {
              select: {
                id: true,
                titulo: true,
                fecha_hora_inicio: true,
                tipo_evento: true,
              },
            },
          },
        },
      },
    });

    if (!simpatizante) throw new NotFoundException('Simpatizante no encontrado');

    if (!esRoot) {
      if (simpatizante.campana_id !== campanaId) {
        throw new ForbiddenException('El simpatizante pertenece a otra campaña');
      }

      const esOperativo = usuario.perfil.es_operativo;
      const actorId = esOperativo ? (usuario.candidato_superior_id ?? usuarioId) : usuarioId;

      const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

      if (!redIds.includes(simpatizante.registrado_por_id)) {
        throw new ForbiddenException('No tenés permiso para ver este simpatizante');
      }
    }

    return simpatizante;
  }

  // ==========================================
  // OBTENER DUPLICADOS POR SIMPATIZANTE
  // ==========================================
  async obtenerDuplicadosPorSimpatizante(
    simpatizanteId: string,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const tienePermiso =
      esRoot ||
      usuario.perfil.permisos.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      ) ||
      usuario.permisos_personalizados.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      );

    if (!tienePermiso) {
      throw new ForbiddenException('No tenés permiso para gestionar duplicados');
    }

    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: simpatizanteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        documento: true,
        registrado_por_id: true,
        campana_id: true,
      },
    });

    if (!simpatizante) throw new NotFoundException('Simpatizante no encontrado');

    if (simpatizante.campana_id !== campanaId) {
      throw new ForbiddenException('No pertenece a esta campaña');
    }

    const registradorActual = await this.prisma.usuario.findUnique({
      where: { id: simpatizante.registrado_por_id },
      select: { id: true, nombre: true, apellido: true },
    });

    const duplicados = await this.prisma.duplicadoSimpatizante.findMany({
      where: {
        simpatizante_id: simpatizanteId,
        campana_id: campanaId,
        eliminado: false,
      },
      include: {
        quien_intento: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fecha_intento: 'asc' },
    });

    return {
      simpatizante,
      registrador_actual: registradorActual,
      duplicados,
    };
  }

  // ==========================================
  // OBTENER DUPLICADOS
  // ==========================================
  async obtenerDuplicados(usuarioId: string, campanaIdHeader?: string) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    if (esRoot) {
      return this.prisma.duplicadoSimpatizante.findMany({
        where: { campana_id: campanaId, eliminado: false },
        include: {
          simpatizante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              intencion_voto: true,
              es_afiliado: true,
              barrio: true,
              telefono: true,
              fecha_registro: true,
              registrado_por_id: true,
            },
          },
          quien_intento: { select: { id: true, nombre: true, apellido: true } },
          registrador_original: { select: { id: true, nombre: true, apellido: true } },
          resuelto_por: { select: { id: true, nombre: true, apellido: true } },
        },
        orderBy: { fecha_intento: 'desc' },
      });
    }

    const esOperativo = usuario.perfil.es_operativo;
    const actorId = esOperativo ? (usuario.candidato_superior_id ?? usuarioId) : usuarioId;

    const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

    const tienePermisoGestion =
      usuario.perfil.permisos.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      ) ||
      usuario.permisos_personalizados.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      );

    if (tienePermisoGestion) {
      return this.prisma.duplicadoSimpatizante.findMany({
        where: {
          campana_id: campanaId,
          eliminado: false,
          OR: [
            { intento_registrar_id: { in: redIds } },
            { registrado_por_id_original: { in: redIds } },
          ],
        },
        include: {
          simpatizante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              intencion_voto: true,
              es_afiliado: true,
              barrio: true,
              telefono: true,
              fecha_registro: true,
              registrado_por_id: true,
            },
          },
          quien_intento: { select: { id: true, nombre: true, apellido: true } },
          registrador_original: { select: { id: true, nombre: true, apellido: true } },
          resuelto_por: { select: { id: true, nombre: true, apellido: true } },
        },
        orderBy: { fecha_intento: 'desc' },
      });
    }

    return this.prisma.duplicadoSimpatizante.findMany({
      where: {
        campana_id: campanaId,
        eliminado: false,
        intento_registrar_id: usuarioId,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            intencion_voto: true,
            es_afiliado: true,
            barrio: true,
            telefono: true,
            fecha_registro: true,
            registrado_por_id: true,
          },
        },
        quien_intento: { select: { id: true, nombre: true, apellido: true } },
        registrador_original: { select: { id: true, nombre: true, apellido: true } },
        resuelto_por: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fecha_intento: 'desc' },
    });
  }

  // ==========================================
  // ELIMINAR DUPLICADO INDIVIDUAL
  // ==========================================
  async eliminarDuplicado(duplicadoId: string, usuarioId: string, campanaIdHeader?: string) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const duplicado = await this.prisma.duplicadoSimpatizante.findUnique({
      where: { id: duplicadoId },
      include: { simpatizante: true },
    });

    if (!duplicado) throw new NotFoundException('Duplicado no encontrado');
    if (duplicado.campana_id !== campanaId) {
      throw new ForbiddenException('No pertenece a esta campaña');
    }
    if (duplicado.eliminado) {
      throw new ConflictException('Este duplicado ya fue eliminado');
    }

    if (!esRoot) {
      const tienePermisoGestion =
        usuario.perfil.permisos.some(
          (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
        ) ||
        usuario.permisos_personalizados.some(
          (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
        );

      if (tienePermisoGestion) {
        // El gestor solo puede eliminar su propio intento duplicado
        if (duplicado.intento_registrar_id === usuarioId) {
          // Puede eliminar su propio intento sin restriccion
        } else {
          // Para eliminar el de otro, ambos deben estar en su red y el gestor no puede ser el origen
          const esOperativo = usuario.perfil.es_operativo;
          const actorId = esOperativo ? (usuario.candidato_superior_id ?? usuarioId) : usuarioId;
          const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

          const origenEnRed = redIds.includes(duplicado.registrado_por_id_original);
          const duplicanteEnRed = redIds.includes(duplicado.intento_registrar_id);

          if (!origenEnRed || !duplicanteEnRed) {
            throw new ForbiddenException(
              'No podés eliminar este duplicado porque involucra usuarios fuera de tu red. Debe resolverlo un gestor o político de nivel superior.',
            );
          }

          if (duplicado.es_dueno_confirmado && duplicado.registrado_por_id_original === usuarioId) {
            throw new ForbiddenException(
              'No podés eliminar este registro porque fuiste confirmado como dueño por un gestor.',
            );
          }
        }
      } else {
        // Usuario normal: solo puede eliminar su propio intento o su propio origen no confirmado
        const esElOrigen = duplicado.simpatizante.registrado_por_id === usuarioId;
        const esElDuplicado = duplicado.intento_registrar_id === usuarioId;

        if (!esElOrigen && !esElDuplicado) {
          throw new ForbiddenException('No tenés permiso para eliminar este duplicado');
        }

        if (esElOrigen && duplicado.es_dueno_confirmado) {
          throw new ForbiddenException(
            'No podés eliminar este registro porque fuiste confirmado como dueño por un gestor.',
          );
        }
      }
    }

    await this.prisma.duplicadoSimpatizante.update({
      where: { id: duplicadoId },
      data: {
        eliminado: true,
        eliminado_por_id: usuarioId,
        fecha_eliminacion: new Date(),
      },
    });

    const esElOrigen = duplicado.simpatizante.registrado_por_id === usuarioId;

    if (esElOrigen) {
      const primerDuplicadoPendiente = await this.prisma.duplicadoSimpatizante.findFirst({
        where: {
          simpatizante_id: duplicado.simpatizante_id,
          campana_id: campanaId,
          eliminado: false,
          id: { not: duplicadoId },
        },
        orderBy: { fecha_intento: 'asc' },
      });

      if (primerDuplicadoPendiente) {
        await this.prisma.simpatizante.update({
          where: { id: duplicado.simpatizante_id },
          data: { registrado_por_id: primerDuplicadoPendiente.intento_registrar_id },
        });

        await this.prisma.duplicadoSimpatizante.update({
          where: { id: primerDuplicadoPendiente.id },
          data: {
            eliminado: true,
            eliminado_por_id: usuarioId,
            fecha_eliminacion: new Date(),
          },
        });
      }
    }

    return { mensaje: 'Duplicado eliminado correctamente' };
  }

  // ==========================================
  // RESOLVER DUPLICADO (GESTOR)
  // ==========================================
  async resolverDuplicado(
    duplicadoId: string,
    usuarioId: string,
    campanaIdHeader?: string,
    forzar?: boolean,
  ) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const tienePermiso =
      esRoot ||
      usuario.perfil.permisos.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      ) ||
      usuario.permisos_personalizados.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      );

    if (!tienePermiso) {
      throw new ForbiddenException('No tenés permiso para gestionar duplicados');
    }

    const duplicado = await this.prisma.duplicadoSimpatizante.findUnique({
      where: { id: duplicadoId },
      include: {
        simpatizante: true,
        quien_intento: { include: { perfil: true } },
        registrador_original: { include: { perfil: true } },
      },
    });

    if (!duplicado) throw new NotFoundException('Duplicado no encontrado');
    if (duplicado.campana_id !== campanaId) {
      throw new ForbiddenException('No pertenece a esta campaña');
    }
    if (duplicado.eliminado) {
      throw new ConflictException('Este duplicado fue eliminado');
    }

    if (!esRoot) {
      // El gestor no puede resolver si él mismo es uno de los involucrados
      if (duplicado.registrado_por_id_original === usuarioId) {
        throw new ForbiddenException(
          'No podés resolver este duplicado porque vos sos el registrador original. Solo podés eliminar tu propio registro.',
        );
      }

      if (duplicado.intento_registrar_id === usuarioId) {
        throw new ForbiddenException(
          'No podés resolver este duplicado porque vos sos el duplicante. Solo podés eliminar tu propio intento.',
        );
      }

      const esOperativo = usuario.perfil.es_operativo;
      const actorId = esOperativo ? (usuario.candidato_superior_id ?? usuarioId) : usuarioId;
      const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

      const origenEnRed = redIds.includes(duplicado.registrado_por_id_original);
      const duplicanteEnRed = redIds.includes(duplicado.intento_registrar_id);

      if (!origenEnRed || !duplicanteEnRed) {
        throw new ForbiddenException(
          'No podés resolver este duplicado porque involucra usuarios fuera de tu red. Debe resolverlo un gestor o político de nivel superior.',
        );
      }

      // Advertencia: se está dando prioridad al gestor sobre un lider politico
      const origenEsOperativo = duplicado.registrador_original.perfil.es_operativo;
      const duplicanteEsOperativo = duplicado.quien_intento.perfil.es_operativo;

      if (!origenEsOperativo && duplicanteEsOperativo && !forzar) {
        throw new ConflictException({
          codigo: 'RESOLUCION_FAVORECE_OPERATIVO',
          mensaje:
            'Estás asignando el simpatizante a un operativo (gestor) cuando el registrador original es un líder político. Los líderes tienen prioridad en campo. ¿Confirmás esta acción?',
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Quitar confirmacion de todos los duplicados del simpatizante
      await tx.duplicadoSimpatizante.updateMany({
        where: {
          simpatizante_id: duplicado.simpatizante_id,
          campana_id: campanaId,
          eliminado: false,
        },
        data: { es_dueno_confirmado: false },
      });

      // Marcar el duplicado resuelto como eliminado para que desaparezca de todas las tablas
      await tx.duplicadoSimpatizante.update({
        where: { id: duplicadoId },
        data: {
          es_dueno_confirmado: true,
          eliminado: true,
          eliminado_por_id: usuarioId,
          fecha_eliminacion: new Date(),
          resuelto_por_id: usuarioId,
          fecha_resolucion: new Date(),
        },
      });

      // Asignar el simpatizante al nuevo dueno real
      await tx.simpatizante.update({
        where: { id: duplicado.simpatizante_id },
        data: { registrado_por_id: duplicado.intento_registrar_id },
      });
    });

    return { mensaje: 'Duplicado resuelto correctamente' };
  }

  // ==========================================
  // REVERTIR RESOLUCION (GESTOR)
  // ==========================================
  async revertirResolucion(duplicadoId: string, usuarioId: string, campanaIdHeader?: string) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const tienePermiso =
      esRoot ||
      usuario.perfil.permisos.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      ) ||
      usuario.permisos_personalizados.some(
        (p) => p.permiso.nombre === 'gestionar_duplicados_simpatizantes',
      );

    if (!tienePermiso) {
      throw new ForbiddenException('No tenés permiso para gestionar duplicados');
    }

    const duplicado = await this.prisma.duplicadoSimpatizante.findUnique({
      where: { id: duplicadoId },
      include: { simpatizante: true },
    });

    if (!duplicado) throw new NotFoundException('Duplicado no encontrado');
    if (duplicado.campana_id !== campanaId) {
      throw new ForbiddenException('No pertenece a esta campaña');
    }
    if (!duplicado.es_dueno_confirmado) {
      throw new ConflictException('Este duplicado no tiene una resolución activa');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.duplicadoSimpatizante.update({
        where: { id: duplicadoId },
        data: {
          es_dueno_confirmado: false,
          resuelto_por_id: null,
          fecha_resolucion: null,
        },
      });

      await tx.simpatizante.update({
        where: { id: duplicado.simpatizante_id },
        data: { registrado_por_id: duplicado.registrado_por_id_original },
      });
    });

    return { mensaje: 'Resolución revertida correctamente' };
  }

  // ==========================================
  // ACTUALIZAR
  // ==========================================
  async actualizar(
    id: string,
    actualizarSimpatizanteDto: ActualizarSimpatizanteDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    await this.obtenerPorId(id, usuarioId, campanaIdHeader);

    return this.prisma.simpatizante.update({
      where: { id },
      data: {
        nombre: actualizarSimpatizanteDto.nombre,
        apellido: actualizarSimpatizanteDto.apellido,
        telefono: actualizarSimpatizanteDto.telefono,
        fecha_nacimiento: actualizarSimpatizanteDto.fecha_nacimiento,
        departamento: actualizarSimpatizanteDto.departamento,
        distrito: actualizarSimpatizanteDto.distrito,
        barrio: actualizarSimpatizanteDto.barrio,
        seccional_interna: actualizarSimpatizanteDto.seccional_interna,
        local_votacion_interna: actualizarSimpatizanteDto.local_votacion_interna,
        mesa_votacion_interna: actualizarSimpatizanteDto.mesa_votacion_interna,
        orden_votacion_interna: actualizarSimpatizanteDto.orden_votacion_interna,
        local_votacion_general: actualizarSimpatizanteDto.local_votacion_general,
        mesa_votacion_general: actualizarSimpatizanteDto.mesa_votacion_general,
        orden_votacion_general: actualizarSimpatizanteDto.orden_votacion_general,
        es_afiliado: actualizarSimpatizanteDto.es_afiliado,
        intencion_voto: actualizarSimpatizanteDto.intencion_voto,
        observaciones: actualizarSimpatizanteDto.observaciones,
        necesita_transporte: actualizarSimpatizanteDto.necesita_transporte,
        latitud: actualizarSimpatizanteDto.latitud,
        longitud: actualizarSimpatizanteDto.longitud,
        lider_id: actualizarSimpatizanteDto.lider_id,
        candidato_id: actualizarSimpatizanteDto.candidato_id,
      },
    });
  }

  // ==========================================
  // ELIMINAR
  // ==========================================
  async eliminar(id: string, usuarioId: string, campanaIdHeader?: string) {
    await this.obtenerPorId(id, usuarioId, campanaIdHeader);

    return this.prisma.simpatizante.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  // ==========================================
  // BUSCAR PADRON (mantener por compatibilidad)
  // ==========================================
  async buscarPadron(cedula: string, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
      include: { configuracion: true },
    });

    if (!campana) throw new NotFoundException('Campaña no encontrada');

    const modoEleccion = campana.configuracion?.modo_eleccion ?? 'GENERALES';

    if (modoEleccion === 'INTERNAS') {
      const partidoId = campana.partido_id;

      if (!partidoId) {
        throw new BadRequestException(
          'La campaña está en modo INTERNAS pero no tiene partido asociado',
        );
      }

      const resultado = await this.prisma.padronInterno.findFirst({
        where: { ci: cedula, partido_id: partidoId },
      });

      if (!resultado) {
        throw new NotFoundException(`CI ${cedula} no encontrada en el padrón interno`);
      }

      return {
        ci: resultado.ci,
        nombre: resultado.nombre,
        apellido: resultado.apellido,
        fecha_nacimiento: resultado.fecha_nacimiento,
        departamento: resultado.departamento,
        distrito: resultado.distrito,
        seccional: resultado.seccional,
        local_votacion: resultado.local_votacion,
        mesa_votacion: resultado.mesa,
        orden_votacion: resultado.orden,
        es_afiliado: true,
      };
    }

    const resultado = await this.prisma.padronGeneral.findUnique({
      where: { ci: cedula },
    });

    if (!resultado) {
      throw new NotFoundException(`CI ${cedula} no encontrada en el padrón general`);
    }

    return {
      ci: resultado.ci,
      nombre: resultado.nombre,
      apellido: resultado.apellido,
      fecha_nacimiento: resultado.fecha_nacimiento,
      departamento: resultado.departamento,
      distrito: resultado.distrito,
      seccional: null,
      local_votacion: resultado.local_votacion,
      mesa_votacion: resultado.mesa,
      orden_votacion: resultado.orden,
      es_afiliado: false,
    };
  }

  // ==========================================
  // ACTUALIZAR INTENCION DE VOTO
  // ==========================================
  async actualizarIntencionVoto(
    id: string,
    actualizarIntencionDto: ActualizarIntencionVotoDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const simpatizante = await this.prisma.simpatizante.findUnique({ where: { id } });

    if (!simpatizante) throw new NotFoundException('Simpatizante no encontrado');

    const tienePermiso =
      esRoot ||
      usuario.perfil.permisos.some((p) => p.permiso.nombre === 'actualizar_intencion_voto') ||
      usuario.permisos_personalizados.some((p) => p.permiso.nombre === 'actualizar_intencion_voto');

    if (!tienePermiso) {
      throw new ForbiddenException('No tenés permiso para actualizar intención de voto');
    }

    if (!esRoot && simpatizante.campana_id !== campanaId) {
      throw new ForbiddenException('El simpatizante pertenece a otra campaña');
    }

    const simpatizanteActualizado = await this.prisma.simpatizante.update({
      where: { id },
      data: { intencion_voto: actualizarIntencionDto.intencion_voto },
    });

    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioId,
        accion: 'EDITAR',
        modulo: 'SIMPATIZANTES',
        entidad_id: id,
        entidad_tipo: 'Simpatizante',
        datos_antes: { intencion_voto: simpatizante.intencion_voto },
        datos_despues: { intencion_voto: actualizarIntencionDto.intencion_voto },
      },
    });

    return simpatizanteActualizado;
  }

  // ==========================================
  // VER REGISTROS POR USUARIO DE LA RED
  // ==========================================
  async obtenerPorUsuario(
    usuarioObjetivoId: string,
    usuarioActualId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, esRoot, campanaId } = await this.obtenerContexto(
      usuarioActualId,
      campanaIdHeader,
    );

    const usuarioObjetivo = await this.prisma.usuario.findUnique({
      where: { id: usuarioObjetivoId },
      include: { perfil: true, nivel: true },
    });

    if (!usuarioObjetivo) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!esRoot) {
      if (usuarioObjetivo.campana_id !== campanaId) {
        throw new ForbiddenException('El usuario pertenece a otra campaña');
      }

      const esOperativo = usuario.perfil.es_operativo;
      const actorId = esOperativo
        ? (usuario.candidato_superior_id ?? usuarioActualId)
        : usuarioActualId;

      const redIds = await this.obtenerRedJerarquica(actorId, campanaId);

      if (!redIds.includes(usuarioObjetivoId)) {
        throw new ForbiddenException('No tenés permiso para ver los simpatizantes de este usuario');
      }
    }

    const simpatizantes = await this.prisma.simpatizante.findMany({
      where: {
        eliminado: false,
        campana_id: campanaId,
        registrado_por_id: usuarioObjetivoId,
      },
      include: {
        _count: { select: { asistencias: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    });

    return {
      usuario: {
        id: usuarioObjetivo.id,
        nombre: usuarioObjetivo.nombre,
        apellido: usuarioObjetivo.apellido,
        username: usuarioObjetivo.username,
        nivel: usuarioObjetivo.nivel,
        perfil: {
          id: usuarioObjetivo.perfil.id,
          nombre: usuarioObjetivo.perfil.nombre,
          es_operativo: usuarioObjetivo.perfil.es_operativo,
        },
      },
      simpatizantes,
      total: simpatizantes.length,
    };
  }
}
