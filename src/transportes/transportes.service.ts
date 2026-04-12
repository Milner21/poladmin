import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImpresorasService } from 'src/impresoras/impresoras.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPasajeroDto } from './dto/confirmar-pasajero.dto';
import { CreateTransportistaDto } from './dto/create-transportista.dto';
import { RegistrarPasajeroDto } from './dto/registrar-pasajero.dto';
import { EstadoVerificacion, ResolverVerificacionDto } from './dto/resolver-verificacion.dto';
import { SolicitarVerificacionDto } from './dto/solicitar-verificacion.dto';
import { UpdateConfiguracionTransporteDto } from './dto/update-configuracion-transporte.dto';
import { UpdateTransportistaDto } from './dto/update-transportista.dto';
import { TransportesGateway } from './transportes.gateway';

@Injectable()
export class TransportesService {
  constructor(
    private prisma: PrismaService,
    private transportesGateway: TransportesGateway,
    private impresorasService: ImpresorasService,
  ) {}

  // ==========================================
  // MÉTODO CENTRAL DE CONTEXTO (Seguridad ROOT y Tenant)
  // ==========================================
  private async obtenerContexto(usuarioId: string, campanaIdHeader?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuario.perfil.nombre === 'ROOT';
    const campanaId = esRoot ? campanaIdHeader : usuario.campana_id;

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
  // TRANSPORTISTAS
  // ==========================================

  async crearTransportista(
    createDto: CreateTransportistaDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportistaExistente = await this.prisma.transportista.findFirst({
      where: {
        documento: createDto.documento,
        campana_id: campanaId,
        eliminado: false,
      },
    });

    if (transportistaExistente) {
      throw new ConflictException('Ya existe un transportista con ese documento en esta campaña');
    }

    if (createDto.usuario_id) {
      const usuarioTransportista = await this.prisma.usuario.findUnique({
        where: { id: createDto.usuario_id },
      });

      if (!usuarioTransportista) {
        throw new NotFoundException('Usuario transportista no encontrado');
      }

      if (usuarioTransportista.campana_id !== campanaId) {
        throw new BadRequestException('El usuario transportista no pertenece a la misma campaña');
      }
    }

    const transportista = await this.prisma.transportista.create({
      data: {
        campana_id: campanaId,
        usuario_id: createDto.usuario_id,
        nombre: createDto.nombre,
        apellido: createDto.apellido,
        documento: createDto.documento,
        telefono: createDto.telefono,
        tipo_vehiculo: createDto.tipo_vehiculo,
        marca_vehiculo: createDto.marca_vehiculo,
        chapa_vehiculo: createDto.chapa_vehiculo,
        capacidad_pasajeros: createDto.capacidad_pasajeros,
        registrado_por_id: usuarioId,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioId,
        accion: 'CREAR',
        modulo: 'TRANSPORTES',
        entidad_id: transportista.id,
        entidad_tipo: 'Transportista',
        datos_despues: transportista as unknown as Prisma.InputJsonValue,
      },
    });

    return transportista;
  }

  async obtenerTransportistas(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    return this.prisma.transportista.findMany({
      where: {
        eliminado: false,
        campana_id: campanaId,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { pasajeros: true } },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async obtenerTransportistaPorId(id: string, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findUnique({
      where: { id },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuario: {
          select: { id: true, nombre: true, apellido: true, perfil: { select: { nombre: true } } },
        },
        registrado_por: { select: { id: true, nombre: true, apellido: true } },
        pasajeros: {
          include: {
            simpatizante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                documento: true,
                local_votacion_interna: true,
                mesa_votacion_interna: true,
                local_votacion_general: true,
                mesa_votacion_general: true,
              },
            },
          },
          orderBy: { fecha_registro: 'desc' },
        },
        _count: { select: { pasajeros: true, verificaciones: true } },
      },
    });

    if (!transportista) throw new NotFoundException('Transportista no encontrado');

    if (transportista.campana_id !== campanaId) {
      throw new ForbiddenException('El transportista pertenece a otra campaña');
    }

    return transportista;
  }

  async obtenerMiTransportista(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findFirst({
      where: {
        usuario_id: usuarioId,
        campana_id: campanaId,
        eliminado: false,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { pasajeros: true, verificaciones: true } },
      },
    });

    if (!transportista) {
      throw new NotFoundException(
        'No se encontró un registro de transportista asociado a tu usuario. Contactá al administrador.',
      );
    }

    return transportista;
  }

  async actualizarTransportista(
    id: string,
    updateDto: UpdateTransportistaDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const transportistaAnterior = await this.obtenerTransportistaPorId(
      id,
      usuarioId,
      campanaIdHeader,
    );

    const transportistaActualizado = await this.prisma.transportista.update({
      where: { id },
      data: {
        nombre: updateDto.nombre,
        apellido: updateDto.apellido,
        telefono: updateDto.telefono,
        tipo_vehiculo: updateDto.tipo_vehiculo,
        marca_vehiculo: updateDto.marca_vehiculo,
        chapa_vehiculo: updateDto.chapa_vehiculo,
        capacidad_pasajeros: updateDto.capacidad_pasajeros,
        estado: updateDto.estado,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioId,
        accion: 'EDITAR',
        modulo: 'TRANSPORTES',
        entidad_id: id,
        entidad_tipo: 'Transportista',
        datos_antes: transportistaAnterior as unknown as Prisma.InputJsonValue,
        datos_despues: transportistaActualizado as unknown as Prisma.InputJsonValue,
      },
    });

    return transportistaActualizado;
  }

  async eliminarTransportista(id: string, usuarioId: string, campanaIdHeader?: string) {
    const transportistaEliminadoInfo = await this.obtenerTransportistaPorId(
      id,
      usuarioId,
      campanaIdHeader,
    );

    const transportistaEliminado = await this.prisma.transportista.update({
      where: { id },
      data: { eliminado: true },
    });

    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioId,
        accion: 'ELIMINAR',
        modulo: 'TRANSPORTES',
        entidad_id: id,
        entidad_tipo: 'Transportista',
        datos_antes: transportistaEliminadoInfo as unknown as Prisma.InputJsonValue,
      },
    });

    return transportistaEliminado;
  }

  // ==========================================
  // PASAJEROS
  // ==========================================

  async registrarPasajero(
    registrarDto: RegistrarPasajeroDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findUnique({
      where: { id: registrarDto.transportista_id },
    });

    if (!transportista) throw new NotFoundException('Transportista no encontrado');
    if (transportista.campana_id !== campanaId) {
      throw new ForbiddenException('El transportista pertenece a otra campaña');
    }

    const pasajerosActuales = await this.prisma.pasajeroTransporte.count({
      where: {
        transportista_id: registrarDto.transportista_id,
        fue_por_cuenta: false,
        eliminado: false,
      },
    });

    if (pasajerosActuales >= transportista.capacidad_pasajeros) {
      throw new BadRequestException(
        `El transportista alcanzó su capacidad máxima de ${transportista.capacidad_pasajeros} pasajeros`,
      );
    }

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
      include: { configuracion: true, configuracion_transporte: true },
    });

    const modoEleccion = campana?.configuracion?.modo_eleccion ?? 'GENERALES';
    const permitirDuplicados = campana?.configuracion_transporte?.permitir_duplicados ?? true;

    let simpatizante = await this.prisma.simpatizante.findFirst({
      where: {
        documento: registrarDto.documento,
        campana_id: campanaId,
        eliminado: false,
      },
    });

    if (!simpatizante) {
      let datoPadron: unknown = null;
      let fuenteReal: 'PADRON_INTERNO' | 'PADRON_GENERAL' = 'PADRON_GENERAL';

      if (modoEleccion === 'INTERNAS') {
        const partidoId = campana?.partido_id ?? null;

        if (!partidoId) {
          throw new BadRequestException(
            'La campaña está en modo INTERNAS pero no tiene partido asociado',
          );
        }

        const interno = await this.prisma.padronInterno.findFirst({
          where: { ci: registrarDto.documento, partido_id: partidoId },
        });

        if (interno) {
          datoPadron = interno;
          fuenteReal = 'PADRON_INTERNO';
        } else {
          const general = await this.prisma.padronGeneral.findUnique({
            where: { ci: registrarDto.documento },
          });

          if (general) {
            datoPadron = general;
            fuenteReal = 'PADRON_GENERAL';
          }
        }
      } else {
        const general = await this.prisma.padronGeneral.findUnique({
          where: { ci: registrarDto.documento },
        });

        if (general) {
          datoPadron = general;
          fuenteReal = 'PADRON_GENERAL';
        }
      }

      if (!datoPadron) {
        throw new NotFoundException(
          'Documento no encontrado en padrón. Debe solicitar verificación al operador.',
        );
      }

      const p = datoPadron as Record<string, unknown>;
      const esOperativo = usuario.perfil.es_operativo;
      const actorId = esOperativo ? usuario.candidato_superior_id : usuarioId;

      simpatizante = await this.prisma.simpatizante.create({
        data: {
          campana_id: campanaId,
          nombre: String(p.nombre),
          apellido: String(p.apellido),
          documento: String(p.ci),
          fecha_nacimiento: p.fecha_nacimiento
            ? new Date(String(p.fecha_nacimiento)).toISOString()
            : null,
          departamento: p.departamento ? String(p.departamento) : null,
          distrito: p.distrito ? String(p.distrito) : null,
          es_afiliado: fuenteReal === 'PADRON_INTERNO',
          intencion_voto: 'INDECISO',
          necesita_transporte: true,
          origen_registro: fuenteReal,
          candidato_id: actorId,
          registrado_por_id: usuarioId,
          ...(fuenteReal === 'PADRON_INTERNO'
            ? {
                seccional_interna: p.seccional ? String(p.seccional) : null,
                local_votacion_interna: p.local_votacion ? String(p.local_votacion) : null,
                mesa_votacion_interna: p.mesa ? String(p.mesa) : null,
                orden_votacion_interna: p.orden ? String(p.orden) : null,
              }
            : {
                local_votacion_general: p.local_votacion ? String(p.local_votacion) : null,
                mesa_votacion_general: p.mesa ? String(p.mesa) : null,
                orden_votacion_general: p.orden ? String(p.orden) : null,
              }),
        },
      });
    }

    const yaRegistrado = await this.prisma.pasajeroTransporte.findFirst({
      where: {
        simpatizante_id: simpatizante.id,
        eliminado: false,
      },
    });

    const esDuplicado = !!yaRegistrado;

    if (esDuplicado && !permitirDuplicados) {
      throw new ConflictException(
        'Este votante ya está registrado en otro transporte y la configuración no permite duplicados',
      );
    }

    const pasajero = await this.prisma.pasajeroTransporte.create({
      data: {
        transportista_id: registrarDto.transportista_id,
        simpatizante_id: simpatizante.id,
        es_duplicado: esDuplicado,
        hora_recogida: registrarDto.hora_recogida ? new Date(registrarDto.hora_recogida) : null,
        registrado_por_id: usuarioId,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            local_votacion_interna: true,
            mesa_votacion_interna: true,
            orden_votacion_interna: true,
            local_votacion_general: true,
            mesa_votacion_general: true,
            orden_votacion_general: true,
          },
        },
        transportista: {
          select: { id: true, nombre: true, apellido: true, chapa_vehiculo: true },
        },
      },
    });

    this.transportesGateway.emitirPasajeroRegistrado({
      transportista_id: registrarDto.transportista_id,
      pasajero,
    });

    return pasajero;
  }

  async obtenerPasajeros(usuarioId: string, transportistaId?: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const whereClause: Prisma.PasajeroTransporteWhereInput = {
      transportista: { campana_id: campanaId },
      eliminado: false,
    };

    if (transportistaId) {
      whereClause.transportista_id = transportistaId;
    }

    return this.prisma.pasajeroTransporte.findMany({
      where: whereClause,
      include: {
        transportista: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            chapa_vehiculo: true,
            tipo_vehiculo: true,
          },
        },
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            local_votacion_interna: true,
            mesa_votacion_interna: true,
            orden_votacion_interna: true,
            local_votacion_general: true,
            mesa_votacion_general: true,
            orden_votacion_general: true,
          },
        },
        registrado_por: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  async confirmarPasajero(
    confirmarDto: ConfirmarPasajeroDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const pasajero = await this.prisma.pasajeroTransporte.findUnique({
      where: { id: confirmarDto.pasajero_id },
      include: { transportista: true },
    });

    if (!pasajero) throw new NotFoundException('Pasajero no encontrado');
    if (pasajero.transportista.campana_id !== campanaId)
      throw new ForbiddenException('No pertenece a esta campaña');
    if (pasajero.confirmado) throw new ConflictException('Este pasajero ya fue confirmado');
    if (pasajero.eliminado) {
      throw new ConflictException('Este pasajero fue eliminado');
    }

    return this.prisma.pasajeroTransporte.update({
      where: { id: confirmarDto.pasajero_id },
      data: { confirmado: true, fecha_confirmacion: new Date() },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            local_votacion_interna: true,
            mesa_votacion_interna: true,
            orden_votacion_interna: true,
            local_votacion_general: true,
            mesa_votacion_general: true,
            orden_votacion_general: true,
          },
        },
        transportista: { select: { id: true, nombre: true, apellido: true, chapa_vehiculo: true } },
      },
    });
  }

  async obtenerTicketPasajero(pasajeroId: string, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
      include: { configuracion: true, configuracion_transporte: true, partido: true },
    });

    const permitirImpresion =
      campana?.configuracion_transporte?.permitir_impresion_tickets ?? false;

    if (!permitirImpresion) {
      throw new ForbiddenException('La impresión de tickets no está habilitada en esta campaña');
    }

    const pasajero = await this.prisma.pasajeroTransporte.findUnique({
      where: { id: pasajeroId },
      include: { simpatizante: true, transportista: true },
    });

    if (!pasajero) throw new NotFoundException('Pasajero no encontrado');
    if (pasajero.transportista.campana_id !== campanaId)
      throw new ForbiddenException('Acceso denegado');

    return {
      campana: campana?.nombre,
      fecha: new Date().toLocaleString('es-PY'),
      pasajero: {
        nombre: `${pasajero.simpatizante.nombre} ${pasajero.simpatizante.apellido}`,
        documento: pasajero.simpatizante.documento,
      },
      votacion: {
        local:
          pasajero.simpatizante.local_votacion_interna ??
          pasajero.simpatizante.local_votacion_general ??
          '-',
        mesa:
          pasajero.simpatizante.mesa_votacion_interna ??
          pasajero.simpatizante.mesa_votacion_general ??
          '-',
        orden:
          pasajero.simpatizante.orden_votacion_interna ??
          pasajero.simpatizante.orden_votacion_general ??
          '-',
      },
      transporte: {
        conductor: `${pasajero.transportista.nombre} ${pasajero.transportista.apellido}`,
        vehiculo: `${pasajero.transportista.tipo_vehiculo} - ${pasajero.transportista.chapa_vehiculo}`,
      },
    };
  }

  async obtenerPasajerosAtrasados(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const whereClause: Prisma.PasajeroTransporteWhereInput = {
      confirmado: false,
      fue_por_cuenta: false,
      eliminado: false,
      hora_recogida: { lt: new Date() },
      transportista: { campana_id: campanaId },
    };

    return this.prisma.pasajeroTransporte.findMany({
      where: whereClause,
      include: {
        transportista: {
          select: { id: true, nombre: true, apellido: true, telefono: true, chapa_vehiculo: true },
        },
        simpatizante: {
          select: { id: true, nombre: true, apellido: true, documento: true, telefono: true },
        },
      },
      orderBy: { hora_recogida: 'asc' },
    });
  }

  // ==========================================
  // VERIFICACIONES (OPCIÓN B IMPLEMENTADA)
  // ==========================================

  async solicitarVerificacion(
    solicitarDto: SolicitarVerificacionDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findUnique({
      where: { id: solicitarDto.transportista_id },
    });

    if (!transportista) throw new NotFoundException('Transportista no encontrado');
    if (transportista.campana_id !== campanaId)
      throw new ForbiddenException('El transportista pertenece a otra campaña');

    return this.prisma.verificacionTransporte.create({
      data: {
        campana_id: campanaId,
        documento_buscado: solicitarDto.documento_buscado,
        nombre_referencia: solicitarDto.nombre_referencia,
        apellido_referencia: solicitarDto.apellido_referencia,
        transportista_id: solicitarDto.transportista_id,
        estado: 'PENDIENTE',
      },
      include: {
        transportista: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async obtenerVerificaciones(usuarioId: string, estado?: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const whereClause: Prisma.VerificacionTransporteWhereInput = {
      campana_id: campanaId,
    };

    if (estado) {
      whereClause.estado = estado;
    }

    return this.prisma.verificacionTransporte.findMany({
      where: whereClause,
      include: {
        transportista: { select: { id: true, nombre: true, apellido: true, telefono: true } },
        operador: { select: { id: true, nombre: true, apellido: true } },
        simpatizante: { select: { id: true, nombre: true, apellido: true, documento: true } },
      },
      orderBy: { fecha_solicitud: 'desc' },
    });
  }

  async resolverVerificacion(
    verificacionId: string,
    resolverDto: ResolverVerificacionDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { usuario, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const verificacion = await this.prisma.verificacionTransporte.findUnique({
      where: { id: verificacionId },
    });

    if (!verificacion) throw new NotFoundException('Verificación no encontrada');
    if (verificacion.campana_id !== campanaId)
      throw new ForbiddenException('No pertenece a su campaña');
    if (verificacion.estado !== 'PENDIENTE')
      throw new ConflictException('Esta verificación ya fue resuelta');

    if (resolverDto.estado === EstadoVerificacion.RECHAZADO && !resolverDto.motivo_rechazo) {
      throw new BadRequestException('Debe especificar el motivo del rechazo');
    }

    let simpatizanteId: string | null = null;

    if (resolverDto.estado === EstadoVerificacion.APROBADO) {
      if (!resolverDto.datos_simpatizante) {
        throw new BadRequestException(
          'Debe proveer los datos del simpatizante para aprobar (Opción B)',
        );
      }

      // 1. Crear el Simpatizante al vuelo
      const esOperativo = usuario.perfil?.es_operativo ?? false;
      const actorId = esOperativo ? usuario.candidato_superior_id : usuario.id;

      const nuevoSimpatizante = await this.prisma.simpatizante.create({
        data: {
          campana_id: campanaId,
          nombre: resolverDto.datos_simpatizante.nombre,
          apellido: resolverDto.datos_simpatizante.apellido,
          documento: resolverDto.datos_simpatizante.documento,
          local_votacion_general: resolverDto.datos_simpatizante.local_votacion ?? null,
          mesa_votacion_general: resolverDto.datos_simpatizante.mesa_votacion ?? null,
          orden_votacion_general: resolverDto.datos_simpatizante.orden_votacion ?? null,
          intencion_voto: 'A_FAVOR',
          necesita_transporte: true,
          origen_registro: 'VERIFICACION_TRANSPORTE',
          candidato_id: actorId,
          registrado_por_id: usuario.id,
        },
      });

      simpatizanteId = nuevoSimpatizante.id;

      // 2. Registrarlo automáticamente como pasajero de ese transporte
      await this.prisma.pasajeroTransporte.create({
        data: {
          transportista_id: verificacion.transportista_id,
          simpatizante_id: simpatizanteId,
          es_duplicado: false, // Fue autorizado manualmente
          registrado_por_id: usuario.id,
        },
      });
    }

    // 3. Actualizar el estado de la verificación
    return this.prisma.verificacionTransporte.update({
      where: { id: verificacionId },
      data: {
        estado: resolverDto.estado,
        operador_id: usuario.id,
        motivo_rechazo: resolverDto.motivo_rechazo,
        simpatizante_id: simpatizanteId,
        fecha_resolucion: new Date(),
      },
      include: {
        transportista: { select: { id: true, nombre: true, apellido: true } },
        operador: { select: { id: true, nombre: true, apellido: true } },
        simpatizante: { select: { id: true, nombre: true, apellido: true, documento: true } },
      },
    });
  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  async obtenerConfiguracion(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    let configuracion = await this.prisma.configuracionTransporte.findUnique({
      where: { campana_id: campanaId },
    });

    if (!configuracion) {
      configuracion = await this.prisma.configuracionTransporte.create({
        data: {
          campana_id: campanaId,
          permitir_impresion_tickets: false,
          permitir_duplicados: true,
        },
      });
    }

    return configuracion;
  }

  async actualizarConfiguracion(
    updateDto: UpdateConfiguracionTransporteDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { esRoot, campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    if (!esRoot) {
      throw new ForbiddenException('Solo ROOT puede modificar la configuración de transporte');
    }

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
    });

    if (!campana) throw new NotFoundException('Campaña no encontrada');

    return this.prisma.configuracionTransporte.upsert({
      where: { campana_id: campanaId },
      update: {
        permitir_impresion_tickets: updateDto.permitir_impresion_tickets,
        permitir_duplicados: updateDto.permitir_duplicados,
      },
      create: {
        campana_id: campanaId,
        permitir_impresion_tickets: updateDto.permitir_impresion_tickets ?? false,
        permitir_duplicados: updateDto.permitir_duplicados ?? true,
      },
    });
  }

  // ==========================================
  // CONFIRMACIÓN MASIVA DE VIAJE (CON LOTES)
  // ==========================================

  async generarLoteConfirmacion(
    transportistaId: string,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findUnique({
      where: { id: transportistaId },
    });

    if (!transportista) throw new NotFoundException('Transportista no encontrado');
    if (transportista.campana_id !== campanaId)
      throw new ForbiddenException('No pertenece a esta campaña');

    // Obtener pasajeros no confirmados
    const pasajerosNoConfirmados = await this.prisma.pasajeroTransporte.findMany({
      where: {
        transportista_id: transportistaId,
        confirmado: false,
        eliminado: false,
      },
      select: { id: true },
    });

    if (pasajerosNoConfirmados.length === 0) {
      throw new BadRequestException('No hay pasajeros pendientes de confirmación');
    }

    const pasajerosIds = pasajerosNoConfirmados.map((p) => p.id);

    // Generar hash único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const hashLote = `${transportistaId}-${timestamp}-${random}`;

    // Crear lote con expiración de 30 minutos
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 30);

    const lote = await this.prisma.loteConfirmacionTransporte.create({
      data: {
        transportista_id: transportistaId,
        hash_lote: hashLote,
        pasajeros_ids: pasajerosIds,
        fecha_expiracion: fechaExpiracion,
      },
    });

    return {
      hash_lote: lote.hash_lote,
      transportista_id: transportistaId,
      cantidad_pasajeros: pasajerosIds.length,
      expira_en_minutos: 30,
    };
  }

  async confirmarLote(hashLote: string, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const lote = await this.prisma.loteConfirmacionTransporte.findUnique({
      where: { hash_lote: hashLote },
      include: { transportista: true },
    });

    if (!lote) throw new NotFoundException('Lote de confirmacion no encontrado');
    if (lote.transportista.campana_id !== campanaId)
      throw new ForbiddenException('No pertenece a esta campana');

    if (new Date() > lote.fecha_expiracion) {
      throw new BadRequestException(
        'Este lote de confirmacion ya expiro. El transportista debe generar uno nuevo.',
      );
    }

    if (lote.utilizado) {
      throw new ConflictException('Este lote ya fue confirmado anteriormente');
    }

    await this.prisma.pasajeroTransporte.updateMany({
      where: {
        id: { in: lote.pasajeros_ids },
        confirmado: false,
      },
      data: {
        confirmado: true,
        fecha_confirmacion: new Date(),
      },
    });

    await this.prisma.loteConfirmacionTransporte.update({
      where: { hash_lote: hashLote },
      data: { utilizado: true },
    });

    const pasajerosConfirmados = await this.prisma.pasajeroTransporte.findMany({
      where: { id: { in: lote.pasajeros_ids } },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            local_votacion_interna: true,
            mesa_votacion_interna: true,
            orden_votacion_interna: true,
            local_votacion_general: true,
            mesa_votacion_general: true,
            orden_votacion_general: true,
          },
        },
        transportista: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            chapa_vehiculo: true,
            tipo_vehiculo: true,
          },
        },
      },
    });

    // Emitir evento WebSocket de transportes
    this.transportesGateway.emitirLoteConfirmado({
      hash_lote: hashLote,
      transportista_id: lote.transportista.id,
      cantidad: pasajerosConfirmados.length,
      pasajeros_confirmados: pasajerosConfirmados,
    });

    // ============================================
    // INTEGRACION CON IMPRESORAS
    // ============================================
    await this.procesarImpresionLote(
      usuarioId,
      campanaId,
      pasajerosConfirmados,
      lote.transportista,
    );
    // ============================================

    return {
      hash_lote: hashLote,
      transportista: {
        id: lote.transportista.id,
        nombre: lote.transportista.nombre,
        apellido: lote.transportista.apellido,
      },
      pasajeros_confirmados: pasajerosConfirmados,
      cantidad: pasajerosConfirmados.length,
      mensaje: `Se confirmaron ${pasajerosConfirmados.length} pasajero(s) exitosamente`,
    };
  }

  async obtenerEstadoConfirmacion(
    transportistaId: string,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const transportista = await this.prisma.transportista.findUnique({
      where: { id: transportistaId },
    });

    if (!transportista) throw new NotFoundException('Transportista no encontrado');
    if (transportista.campana_id !== campanaId)
      throw new ForbiddenException('No pertenece a esta campaña');

    const totalPasajeros = await this.prisma.pasajeroTransporte.count({
      where: { transportista_id: transportistaId, eliminado: false },
    });

    const pasajerosConfirmados = await this.prisma.pasajeroTransporte.count({
      where: { transportista_id: transportistaId, confirmado: true, eliminado: false },
    });

    const pasajerosPendientes = await this.prisma.pasajeroTransporte.count({
      where: { transportista_id: transportistaId, confirmado: false, eliminado: false },
    });

    return {
      transportista_id: transportistaId,
      total_pasajeros: totalPasajeros,
      pasajeros_confirmados: pasajerosConfirmados,
      pasajeros_pendientes: pasajerosPendientes,
      tiene_pendientes: pasajerosPendientes > 0,
    };
  }

  async obtenerConfirmacionesPorOperador(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const lotes = await this.prisma.loteConfirmacionTransporte.findMany({
      where: {
        utilizado: true,
        transportista: {
          campana_id: campanaId,
        },
      },
      include: {
        transportista: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            chapa_vehiculo: true,
            tipo_vehiculo: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    const lotesConPasajeros = await Promise.all(
      lotes.map(async (lote) => {
        const pasajeros = await this.prisma.pasajeroTransporte.findMany({
          where: {
            id: { in: lote.pasajeros_ids },
          },
          include: {
            simpatizante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                documento: true,
                local_votacion_interna: true,
                mesa_votacion_interna: true,
                orden_votacion_interna: true,
                local_votacion_general: true,
                mesa_votacion_general: true,
                orden_votacion_general: true,
              },
            },
          },
        });

        return {
          id: lote.id,
          hash_lote: lote.hash_lote,
          fecha_confirmacion: lote.fecha_creacion,
          transportista: lote.transportista,
          cantidad_pasajeros: pasajeros.length,
          pasajeros,
        };
      }),
    );

    return lotesConPasajeros;
  }

  private async procesarImpresionLote(
    usuarioId: string,
    campanaId: string,
    pasajeros: {
      id: string;
      hora_recogida: Date | null;
      simpatizante: {
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
        local_votacion_interna: string | null;
        mesa_votacion_interna: string | null;
        orden_votacion_interna: string | null;
        local_votacion_general: string | null;
        mesa_votacion_general: string | null;
        orden_votacion_general: string | null;
      } | null;
      transportista: {
        id: string;
        nombre: string;
        apellido: string;
        chapa_vehiculo: string;
        tipo_vehiculo: string;
      } | null;
    }[],
    transportista: { nombre: string; apellido: string },
  ) {
    try {
      const campana = await this.prisma.campana.findUnique({
        where: { id: campanaId },
        include: { configuracion_transporte: true },
      });

      const permitirImpresion =
        campana?.configuracion_transporte?.permitir_impresion_tickets ?? false;

      if (!permitirImpresion) return;

      const impresoraAsignada = await this.impresorasService.obtenerImpresoraAsignada(usuarioId);

      if (!impresoraAsignada || impresoraAsignada.estado !== 'CONECTADA') return;

      const nombreCampana = campana?.nombre || 'CAMPANA ELECTORAL';

      for (const pasajero of pasajeros) {
        const datosTrabajo = {
          campana: nombreCampana,
          pasajero: {
            nombre: pasajero.simpatizante?.nombre || '',
            apellido: pasajero.simpatizante?.apellido || '',
            documento: pasajero.simpatizante?.documento || '',
          },
          votacion: {
            local:
              pasajero.simpatizante?.local_votacion_interna ??
              pasajero.simpatizante?.local_votacion_general ??
              '-',
            mesa:
              pasajero.simpatizante?.mesa_votacion_interna ??
              pasajero.simpatizante?.mesa_votacion_general ??
              '-',
            orden:
              pasajero.simpatizante?.orden_votacion_interna ??
              pasajero.simpatizante?.orden_votacion_general ??
              '-',
          },
          transporte: {
            conductor: `${transportista.nombre} ${transportista.apellido}`,
            vehiculo: `${pasajero.transportista?.tipo_vehiculo || ''} - ${pasajero.transportista?.chapa_vehiculo || ''}`,
          },
          hora_recogida: pasajero.hora_recogida
            ? new Date(pasajero.hora_recogida).toLocaleTimeString('es-PY', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null,
        };

        await this.prisma.trabajoImpresion.create({
          data: {
            impresora_id: impresoraAsignada.id,
            usuario_id: usuarioId,
            tipo: 'TICKET_TRANSPORTE',
            datos: datosTrabajo as unknown as never,
            estado: 'PENDIENTE',
          },
        });
      }
    } catch (error) {
      console.error('Error al procesar impresion:', error);
    }
  }

  async obtenerTrabajosPendientes(usuarioId: string) {
    return this.prisma.trabajoImpresion.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'PENDIENTE',
      },
      include: {
        impresora: true,
      },
      orderBy: { creado_en: 'asc' },
    });
  }

  async actualizarEstadoTrabajo(trabajoId: string, estado: 'ENVIADO' | 'FALLIDO', error?: string) {
    return this.prisma.trabajoImpresion.update({
      where: { id: trabajoId },
      data: {
        estado,
        error: error || null,
      },
    });
  }

  async eliminarPasajero(
    pasajeroId: string,
    usuarioId: string,
    campanaIdHeader?: string,
  ): Promise<{ mensaje: string }> {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const pasajero = await this.prisma.pasajeroTransporte.findUnique({
      where: { id: pasajeroId },
      include: { transportista: true },
    });

    if (!pasajero) throw new NotFoundException('Pasajero no encontrado');

    if (pasajero.transportista.campana_id !== campanaId) {
      throw new ForbiddenException('El pasajero no pertenece a esta campaña');
    }

    if (pasajero.confirmado) {
      throw new ConflictException('No se puede eliminar un pasajero ya confirmado');
    }

    if (pasajero.eliminado) {
      throw new ConflictException('El pasajero ya fue eliminado');
    }

    await this.prisma.pasajeroTransporte.update({
      where: { id: pasajeroId },
      data: { eliminado: true },
    });

    return { mensaje: 'Pasajero eliminado correctamente' };
  }
}
