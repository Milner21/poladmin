import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  // Eliminar acentos
  private eliminarAcentos(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Generar username único
  private async generarUsernameUnico(
    nombreCompleto: string,
    apellidoCompleto: string,
  ): Promise<string> {
    const nombres = nombreCompleto.trim().split(/\s+/);
    const apellidos = apellidoCompleto.trim().split(/\s+/);

    const primerNombre = this.eliminarAcentos(nombres[0] || '');
    const segundoNombre = nombres[1] ? this.eliminarAcentos(nombres[1]) : '';
    const primerApellido = this.eliminarAcentos(apellidos[0] || '');
    const segundoApellido = apellidos[1] ? this.eliminarAcentos(apellidos[1]) : '';

    const intentos: string[] = [];
    intentos.push(`${primerNombre}.${primerApellido}`);
    if (segundoApellido) intentos.push(`${primerNombre}.${segundoApellido}`);
    if (segundoNombre) intentos.push(`${segundoNombre}.${primerApellido}`);
    if (segundoNombre && segundoApellido) intentos.push(`${segundoNombre}.${segundoApellido}`);

    for (const username of intentos) {
      const existe = await this.prisma.usuario.findUnique({ where: { username } });
      if (!existe) return username;
    }

    throw new ConflictException(
      'No se pudo generar un username único. Por favor proporcioná un username manualmente.',
    );
  }

  // Obtener nivel orden del usuario para comparaciones
  private async obtenerOrdenNivel(usuarioId: string): Promise<number> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfil: true,
        nivel: true,
      },
    });

    if (!usuario) return 9999;
    if (usuario.perfil.nombre === 'ROOT') return 0;
    if (!usuario.nivel) return 9999; // operativo sin nivel jerárquico

    return usuario.nivel.orden;
  }

  private async buscarEnPadron(
    documento: string,
    campanaId: string,
  ): Promise<{
    nombre: string;
    apellido: string;
    fecha_nacimiento: string | null;
    departamento: string | null;
    distrito: string | null;
    seccional: string | null;
    local_votacion: string | null;
    mesa: string | null;
    orden: string | null;
    es_afiliado: boolean;
    origen: 'PADRON_INTERNO' | 'PADRON_GENERAL' | 'NO_ENCONTRADO';
  } | null> {
    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
      include: { configuracion: true },
    });

    if (!campana) return null;

    const modoEleccion = campana.configuracion?.modo_eleccion ?? 'GENERALES';

    if (modoEleccion === 'INTERNAS' && campana.partido_id) {
      const padronInterno = await this.prisma.padronInterno.findFirst({
        where: { ci: documento, partido_id: campana.partido_id },
      });

      if (padronInterno) {
        return {
          nombre: padronInterno.nombre,
          apellido: padronInterno.apellido,
          fecha_nacimiento: padronInterno.fecha_nacimiento ?? null,
          departamento: padronInterno.departamento ?? null,
          distrito: padronInterno.distrito ?? null,
          seccional: padronInterno.seccional ?? null,
          local_votacion: padronInterno.local_votacion ?? null,
          mesa: padronInterno.mesa ?? null,
          orden: padronInterno.orden ?? null,
          es_afiliado: true,
          origen: 'PADRON_INTERNO',
        };
      }
    }

    const padronGeneral = await this.prisma.padronGeneral.findUnique({
      where: { ci: documento },
    });

    if (padronGeneral) {
      return {
        nombre: padronGeneral.nombre,
        apellido: padronGeneral.apellido,
        fecha_nacimiento: padronGeneral.fecha_nacimiento ?? null,
        departamento: padronGeneral.departamento ?? null,
        distrito: padronGeneral.distrito ?? null,
        seccional: null,
        local_votacion: padronGeneral.local_votacion ?? null,
        mesa: padronGeneral.mesa ?? null,
        orden: padronGeneral.orden ?? null,
        es_afiliado: false,
        origen: 'PADRON_GENERAL',
      };
    }

    return null;
  }

  private async registrarComoSimpatizante(
    usuarioId: string,
    documento: string,
    campanaId: string,
    datosPadron: {
      nombre: string;
      apellido: string;
      fecha_nacimiento: string | null;
      departamento: string | null;
      distrito: string | null;
      seccional: string | null;
      local_votacion: string | null;
      mesa: string | null;
      orden: string | null;
      es_afiliado: boolean;
      origen: 'PADRON_INTERNO' | 'PADRON_GENERAL' | 'NO_ENCONTRADO';
    } | null,
    nombreManual: string,
    apellidoManual: string,
  ): Promise<void> {
    const simpatizanteExistente = await this.prisma.simpatizante.findFirst({
      where: { documento, campana_id: campanaId, eliminado: false },
    });

    if (simpatizanteExistente) return;

    const esInterno = datosPadron?.origen === 'PADRON_INTERNO';

    await this.prisma.simpatizante.create({
      data: {
        campana_id: campanaId,
        nombre: datosPadron?.nombre ?? nombreManual,
        apellido: datosPadron?.apellido ?? apellidoManual,
        documento,
        fecha_nacimiento: datosPadron?.fecha_nacimiento ?? null,
        departamento: datosPadron?.departamento ?? null,
        distrito: datosPadron?.distrito ?? null,
        es_afiliado: datosPadron?.es_afiliado ?? false,
        seccional_interna: esInterno ? (datosPadron?.seccional ?? null) : null,
        local_votacion_interna: esInterno ? (datosPadron?.local_votacion ?? null) : null,
        mesa_votacion_interna: esInterno ? (datosPadron?.mesa ?? null) : null,
        orden_votacion_interna: esInterno ? (datosPadron?.orden ?? null) : null,
        local_votacion_general: !esInterno ? (datosPadron?.local_votacion ?? null) : null,
        mesa_votacion_general: !esInterno ? (datosPadron?.mesa ?? null) : null,
        orden_votacion_general: !esInterno ? (datosPadron?.orden ?? null) : null,
        intencion_voto: 'INDECISO',
        necesita_transporte: false,
        origen_registro: datosPadron?.origen ?? 'MANUAL',
        candidato_id: usuarioId,
        registrado_por_id: usuarioId,
        eliminado: false,
      },
    });
  }

  async crear(crearUsuarioDto: CrearUsuarioDto, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: {
        perfil: { include: { permisos: true } },
        nivel: true,
        permisos_personalizados: true,
      },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';
    const esOperativo = usuarioActual.perfil.es_operativo;

    if (esOperativo && !usuarioActual.candidato_superior_id) {
      throw new ForbiddenException('El usuario operativo no tiene candidato superior asignado');
    }

    const operadorId = esOperativo ? usuarioActual.candidato_superior_id! : usuarioActualId;

    const operador = esOperativo
      ? await this.prisma.usuario.findUnique({
          where: { id: operadorId },
          include: {
            perfil: { include: { permisos: true } },
            nivel: true,
            permisos_personalizados: true,
          },
        })
      : usuarioActual;

    if (!operador) {
      throw new UnauthorizedException('No se encontró el candidato superior');
    }

    let username: string;
    if (crearUsuarioDto.username) {
      username = this.eliminarAcentos(crearUsuarioDto.username);
    } else {
      username = await this.generarUsernameUnico(crearUsuarioDto.nombre, crearUsuarioDto.apellido);
    }

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ documento: crearUsuarioDto.documento }, { username }],
      },
    });

    if (usuarioExistente) {
      if (usuarioExistente.documento === crearUsuarioDto.documento) {
        throw new ConflictException('Usuario con ese documento ya existe');
      }
      if (usuarioExistente.username === username) {
        throw new ConflictException('Usuario con ese username ya existe');
      }
    }

    const perfilDestino = await this.prisma.perfil.findUnique({
      where: { id: crearUsuarioDto.perfil_id },
      include: { nivel: true },
    });

    if (!perfilDestino) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // === VALIDACIONES SAAS Y FACTURACIÓN ===
    if (!esRoot && perfilDestino.nivel?.exclusivo_root) {
      throw new ForbiddenException(
        'No puedes crear usuarios de este nivel. Contacta al administrador para adquirir más cuentas de este tipo.',
      );
    }

    if (!esRoot) {
      if (perfilDestino.es_operativo) {
        const nivelOperador = operador.nivel;
        if (!nivelOperador?.permite_operadores) {
          throw new ForbiddenException('Tu nivel jerárquico no permite crear usuarios operativos');
        }
      } else {
        if (!perfilDestino.nivel) {
          throw new ForbiddenException('El perfil político debe tener un nivel asignado');
        }
        const ordenOperador = operador.nivel?.orden ?? 9999;
        const ordenDestino = perfilDestino.nivel.orden;

        if (ordenDestino <= ordenOperador) {
          throw new ForbiddenException('Solo puedes crear usuarios de un nivel inferior al tuyo');
        }
      }
    }

    if (perfilDestino.es_operativo && esOperativo) {
      throw new ForbiddenException(
        'Un usuario operativo no puede crear a otros usuarios operativos',
      );
    }

    if (perfilDestino.es_operativo && crearUsuarioDto.permisos_ids?.length) {
      if (!esRoot) {
        const permisosDelOperador = new Set([
          ...operador.perfil.permisos.map((p) => p.permiso_id),
          ...operador.permisos_personalizados.map((p) => p.permiso_id),
        ]);

        for (const permisoId of crearUsuarioDto.permisos_ids) {
          if (!permisosDelOperador.has(permisoId)) {
            throw new ForbiddenException('Estás intentando asignar un permiso que no posees');
          }
        }
      }
    }

    const passwordHash = await bcrypt.hash(crearUsuarioDto.password, 10);

    // === ASIGNACIÓN DE CAMPAÑA ===
    // Si soy ROOT, la campaña viene en el DTO (Elijo a qué campaña lo meto)
    // Si NO soy root, el usuario que creo HEREDA mi campaña obligatoriamente.
    const campanaAsignada = esRoot
      ? crearUsuarioDto.campana_id // ROOT puede crear usuarios sueltos sin campaña si quiere (null)
      : usuarioActual.campana_id;

    if (!esRoot && !campanaAsignada) {
      throw new InternalServerErrorException(
        'Error crítico: El creador no pertenece a ninguna campaña.',
      );
    }

    // === CALCULAR CANDIDATO SUPERIOR ===
    const candidatoSuperiorId = esOperativo
      ? usuarioActual.candidato_superior_id
      : (crearUsuarioDto.candidato_superior_id ?? usuarioActualId);

    // ⚠️ VALIDACIÓN: Si ROOT especificó candidato_superior_id, verificar que sea de la misma campaña
    if (esRoot && crearUsuarioDto.candidato_superior_id && campanaAsignada) {
      const candidatoSuperior = await this.prisma.usuario.findUnique({
        where: { id: crearUsuarioDto.candidato_superior_id },
        select: { campana_id: true },
      });

      if (!candidatoSuperior) {
        throw new NotFoundException('El candidato superior especificado no existe');
      }

      if (candidatoSuperior.campana_id !== campanaAsignada) {
        throw new ForbiddenException('No podés asignar un candidato superior de otra campaña');
      }
    }

    const nivelId = perfilDestino.es_operativo
      ? null
      : (perfilDestino.nivel_id ?? crearUsuarioDto.nivel_id ?? null);

    // === CREAR USUARIO ===
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre: crearUsuarioDto.nombre,
        apellido: crearUsuarioDto.apellido,
        username,
        documento: crearUsuarioDto.documento,
        telefono: crearUsuarioDto.telefono,
        password: passwordHash,
        perfil_id: crearUsuarioDto.perfil_id,
        nivel_id: nivelId,
        campana_id: campanaAsignada,
        candidato_superior_id: candidatoSuperiorId,
        creado_por_id: operadorId,
      },
    });

    if (perfilDestino.es_operativo && crearUsuarioDto.permisos_ids?.length) {
      const permisosData = crearUsuarioDto.permisos_ids.map((permisoId) => ({
        usuario_id: nuevoUsuario.id,
        permiso_id: permisoId,
        asignado_por_id: usuarioActualId,
      }));

      await this.prisma.permisoPersonalizado.createMany({
        data: permisosData,
      });
    }

    const usuarioCreadoCompleto = await this.prisma.usuario.findUnique({
      where: { id: nuevoUsuario.id },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
        campana: true,
        candidato_superior: { select: { id: true, nombre: true, apellido: true, username: true } },
        permisos_personalizados: { include: { permiso: true } },
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrar({
      usuarioId: usuarioActualId,
      accion: 'CREAR',
      modulo: 'USUARIOS',
      entidadId: nuevoUsuario.id,
      entidadTipo: 'Usuario',
      datosDespues: {
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        username: nuevoUsuario.username,
        perfil_id: nuevoUsuario.perfil_id,
        nivel_id: nuevoUsuario.nivel_id,
        campana_id: nuevoUsuario.campana_id,
      },
    });

    const { password, refresh_token, ...usuarioSinPassword } = usuarioCreadoCompleto!;

    // Registrar automaticamente como simpatizante si tiene campana asignada
    if (campanaAsignada) {
      try {
        const datosPadron = await this.buscarEnPadron(crearUsuarioDto.documento, campanaAsignada);
        await this.registrarComoSimpatizante(
          nuevoUsuario.id,
          crearUsuarioDto.documento,
          campanaAsignada,
          datosPadron,
          crearUsuarioDto.nombre,
          crearUsuarioDto.apellido,
        );
      } catch {
        // No interrumpir la creacion del usuario si falla el registro como simpatizante
      }
    }

    return usuarioSinPassword;
  }

  // ==== OBTENER TODOS LOS USUARIOS ===
  async obtenerTodos(usuarioActualId: string, campanaIdFiltro?: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: {
        perfil: true,
        nivel: true,
        candidato_superior: {
          include: { nivel: true },
        },
      },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // ROOT ve usuarios filtrados por campaña seleccionada (si envió el filtro)
    if (usuarioActual.perfil.nombre === 'ROOT') {
      return this.prisma.usuario.findMany({
        where: {
          eliminado: false,
          // Si ROOT envió campana_id, filtrar por esa campaña
          ...(campanaIdFiltro && { campana_id: campanaIdFiltro }),
        },
        include: {
          perfil: { include: { nivel: true } },
          nivel: true,
          campana: true,
          candidato_superior: {
            select: { id: true, nombre: true, apellido: true, username: true },
          },
        },
        orderBy: [{ campana_id: 'asc' }, { fecha_registro: 'desc' }],
      });
    }

    const esOperativo = usuarioActual.perfil.es_operativo;
    const actorId = esOperativo ? usuarioActual.candidato_superior_id! : usuarioActualId;
    const ordenEfectivo =
      esOperativo && usuarioActual.candidato_superior
        ? (usuarioActual.candidato_superior.nivel?.orden ?? 9999)
        : (usuarioActual.nivel?.orden ?? 9999);

    // Obtener recursivamente por candidato_superior_id (sin filtrar por creado_por_id)
    const obtenerRedCompleta = async (ids: string[]): Promise<string[]> => {
      const subordinados = await this.prisma.usuario.findMany({
        where: {
          candidato_superior_id: { in: ids },
          eliminado: false,
          campana_id: usuarioActual.campana_id,
        },
        select: { id: true },
      });

      if (!subordinados.length) return ids;

      const nuevosIds = subordinados.map((s) => s.id).filter((id) => !ids.includes(id));

      if (!nuevosIds.length) return ids;

      const todosIds = [...ids, ...nuevosIds];
      return obtenerRedCompleta(todosIds);
    };

    const todaLaRed = await obtenerRedCompleta([actorId]);

    console.log('🔍 DEBUG obtenerTodos:', {
      actorId,
      ordenEfectivo,
      todaLaRed,
    });

    return this.prisma.usuario.findMany({
      where: {
        eliminado: false,
        campana_id: usuarioActual.campana_id,
        id: { in: todaLaRed },
      },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
        campana: true,
        candidato_superior: {
          select: { id: true, nombre: true, apellido: true, username: true },
        },
      },
      orderBy: [{ nivel: { orden: 'asc' } }, { fecha_registro: 'desc' }],
    });
  }

  async obtenerPorId(id: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true, nivel: true },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        perfil: {
          include: {
            permisos: { include: { permiso: true } },
            nivel: true,
          },
        },
        nivel: true,
        permisos_personalizados: { include: { permiso: true } },
        candidato_superior: {
          select: { id: true, nombre: true, apellido: true, username: true },
        },
        subordinados: {
          select: { id: true, nombre: true, apellido: true, username: true, nivel_id: true },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, refresh_token, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  async actualizar(
    id: string,
    actualizarUsuarioDto: ActualizarUsuarioDto,
    usuarioActualId: string,
  ) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: {
        perfil: { include: { permisos: true, nivel: true } },
        nivel: true,
        permisos_personalizados: true,
      },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        perfil: {
          include: { nivel: true },
        },
        nivel: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.perfil.nombre === 'ROOT') {
      throw new ForbiddenException('No se puede modificar el usuario ROOT');
    }

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';

    // ⚠️ PROTECCIÓN: Solo ROOT puede editar usuarios con nivel exclusivo_root
    if (!esRoot && usuario.perfil.nivel?.exclusivo_root) {
      throw new ForbiddenException(
        'No tenés permiso para editar este usuario. Solo el administrador puede modificar usuarios de este nivel.',
      );
    }

    // ⚠️ PROTECCIÓN: Un usuario exclusivo_root no puede cambiar su propio perfil/nivel
    if (!esRoot && id === usuarioActualId && usuario.perfil.nivel?.exclusivo_root) {
      if (actualizarUsuarioDto.perfil_id && actualizarUsuarioDto.perfil_id !== usuario.perfil_id) {
        throw new ForbiddenException(
          'No podés cambiar tu propio perfil. Contactá al administrador.',
        );
      }
      if (actualizarUsuarioDto.nivel_id && actualizarUsuarioDto.nivel_id !== usuario.nivel_id) {
        throw new ForbiddenException(
          'No podés cambiar tu propio nivel. Contactá al administrador.',
        );
      }
    }

    // ⚠️ VALIDACIÓN: Si se está cambiando el candidato_superior, verificar que sea de la misma campaña
    if (
      actualizarUsuarioDto.candidato_superior_id &&
      actualizarUsuarioDto.candidato_superior_id !== usuario.candidato_superior_id
    ) {
      const candidatoSuperior = await this.prisma.usuario.findUnique({
        where: { id: actualizarUsuarioDto.candidato_superior_id },
        select: { campana_id: true },
      });

      if (!candidatoSuperior) {
        throw new NotFoundException('El candidato superior especificado no existe');
      }

      if (candidatoSuperior.campana_id !== usuario.campana_id) {
        throw new ForbiddenException('No podés asignar un candidato superior de otra campaña');
      }
    }

    const username =
      actualizarUsuarioDto.nombre && actualizarUsuarioDto.apellido
        ? `${this.eliminarAcentos(actualizarUsuarioDto.nombre)}.${this.eliminarAcentos(actualizarUsuarioDto.apellido)}`
        : actualizarUsuarioDto.nombre
          ? `${this.eliminarAcentos(actualizarUsuarioDto.nombre)}.${this.eliminarAcentos(usuario.apellido)}`
          : actualizarUsuarioDto.apellido
            ? `${this.eliminarAcentos(usuario.nombre)}.${this.eliminarAcentos(actualizarUsuarioDto.apellido)}`
            : undefined;

    // === GESTIÓN DE PERMISOS PARA OPERATIVOS ===
    if (actualizarUsuarioDto.permisos_ids !== undefined) {
      // 1. Si no es root, validar que no esté dando permisos que no tiene
      if (!esRoot) {
        const permisosDelOperador = new Set([
          ...usuarioActual.perfil.permisos.map((p) => p.permiso_id),
          ...usuarioActual.permisos_personalizados.map((p) => p.permiso_id),
        ]);

        for (const permisoId of actualizarUsuarioDto.permisos_ids) {
          if (!permisosDelOperador.has(permisoId)) {
            throw new ForbiddenException('Estás intentando asignar un permiso que no posees');
          }
        }
      }

      // 2. Transacción: Borrar los viejos e insertar los nuevos
      await this.prisma.$transaction(async (tx) => {
        await tx.permisoPersonalizado.deleteMany({
          where: { usuario_id: id },
        });

        if (actualizarUsuarioDto.permisos_ids!.length > 0) {
          const nuevosPermisosData = actualizarUsuarioDto.permisos_ids!.map((permisoId) => ({
            usuario_id: id,
            permiso_id: permisoId,
            asignado_por_id: usuarioActualId,
          }));

          await tx.permisoPersonalizado.createMany({
            data: nuevosPermisosData,
          });
        }
      });
    }

    // Guardar estado anterior para auditoría
    const estadoAnterior = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      perfil_id: usuario.perfil_id,
      nivel_id: usuario.nivel_id,
      estado: usuario.estado,
      candidato_superior_id: usuario.candidato_superior_id,
    };

    // Actualizar los datos básicos
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: actualizarUsuarioDto.nombre,
        apellido: actualizarUsuarioDto.apellido,
        telefono: actualizarUsuarioDto.telefono,
        perfil_id: actualizarUsuarioDto.perfil_id,
        nivel_id: actualizarUsuarioDto.nivel_id,
        estado: actualizarUsuarioDto.estado,
        candidato_superior_id: actualizarUsuarioDto.candidato_superior_id,
        ...(username && { username }),
      },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
        candidato_superior: {
          select: { id: true, nombre: true, apellido: true, username: true },
        },
        permisos_personalizados: { include: { permiso: true } },
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrar({
      usuarioId: usuarioActualId,
      accion: 'EDITAR',
      modulo: 'USUARIOS',
      entidadId: id,
      entidadTipo: 'Usuario',
      datosAntes: estadoAnterior,
      datosDespues: {
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        telefono: usuarioActualizado.telefono,
        perfil_id: usuarioActualizado.perfil_id,
        nivel_id: usuarioActualizado.nivel_id,
        estado: usuarioActualizado.estado,
        candidato_superior_id: usuarioActualizado.candidato_superior_id,
      },
    });

    const { password, refresh_token, ...usuarioSinPassword } = usuarioActualizado;
    return usuarioSinPassword;
  }

  async eliminar(id: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
      },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.perfil.nombre === 'ROOT') {
      throw new ForbiddenException('No se puede eliminar el usuario ROOT');
    }

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';

    // ⚠️ PROTECCIÓN: Solo ROOT puede eliminar usuarios con nivel exclusivo_root
    if (!esRoot && usuario.perfil.nivel?.exclusivo_root) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar este usuario. Solo el administrador puede eliminar usuarios de este nivel.',
      );
    }

    const usuarioEliminado = await this.prisma.usuario.update({
      where: { id },
      data: {
        eliminado: true,
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrar({
      usuarioId: usuarioActualId,
      accion: 'ELIMINAR',
      modulo: 'USUARIOS',
      entidadId: id,
      entidadTipo: 'Usuario',
      datosAntes: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        username: usuario.username,
      },
    });

    return usuarioEliminado;
  }

  async cambiarPassword(
    id: string,
    cambiarPasswordDto: CambiarPasswordDto,
    usuarioActualId: string,
  ) {
    try {
      const usuarioActual = await this.prisma.usuario.findUnique({
        where: { id: usuarioActualId },
        include: { perfil: true },
      });

      if (!usuarioActual) {
        throw new UnauthorizedException('Usuario no autenticado');
      }

      if (!usuarioActual.perfil) {
        throw new InternalServerErrorException('Usuario autenticado no tiene un perfil asignado.');
      }

      const esRoot = usuarioActual.perfil.nombre?.toUpperCase() === 'ROOT';

      if (!esRoot && id !== usuarioActualId) {
        throw new ForbiddenException('Solo puedes cambiar tu propia contraseña');
      }

      const usuario = await this.prisma.usuario.findUnique({ where: { id } });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (esRoot && id !== usuarioActualId) {
        const passwordHash = await bcrypt.hash(cambiarPasswordDto.password_nuevo, 10);
        await this.prisma.usuario.update({
          where: { id },
          data: { password: passwordHash },
        });
        return { mensaje: 'Contraseña actualizada exitosamente por ROOT' };
      }

      if (!cambiarPasswordDto.password_actual) {
        throw new UnauthorizedException('La contraseña actual es requerida');
      }

      if (!usuario.password) {
        throw new InternalServerErrorException('El usuario no tiene una contraseña válida');
      }

      const passwordValido = await bcrypt.compare(
        cambiarPasswordDto.password_actual,
        usuario.password,
      );

      if (!passwordValido) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const passwordHash = await bcrypt.hash(cambiarPasswordDto.password_nuevo, 10);

      await this.prisma.usuario.update({
        where: { id },
        data: { password: passwordHash },
      });

      return { mensaje: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      console.error('Error en cambiarPassword:', error);
      throw error;
    }
  }

  async obtenerSubordinados(id: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true },
    });

    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.usuario.findMany({
      where: {
        candidato_superior_id: id,
        eliminado: false,
      },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
      },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  // === OBTENER CANDIDATOS SUPERIORES VÁLIDOS ===
  // Para que ROOT pueda asignar correctamente el jefe de un nuevo usuario
  async obtenerCandidatosSuperiores(campanaId: string, nivelOrden: number) {
    // Buscar usuarios de la campaña con nivel MENOR (más alto en jerarquía)
    // que el nivel del usuario que se va a crear
    return this.prisma.usuario.findMany({
      where: {
        campana_id: campanaId,
        eliminado: false,
        estado: true,
        // Solo usuarios políticos (con nivel asignado)
        nivel_id: { not: null },
        // Con nivel de orden MENOR al que queremos crear
        nivel: {
          orden: { lt: nivelOrden },
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        username: true,
        nivel: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
      },
      orderBy: [{ nivel: { orden: 'asc' } }, { nombre: 'asc' }],
    });
  }

  // === ESTADÍSTICAS DE USUARIOS POR CAMPAÑA ===
  async obtenerEstadisticasPorCampana(campanaId: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';

    // Si no es ROOT, solo puede ver stats de su propia campaña
    const campanaFinal = esRoot ? campanaId : usuarioActual.campana_id;

    if (!campanaFinal) {
      throw new ForbiddenException('No pertenecés a ninguna campaña');
    }

    // Contar usuarios por nivel
    const usuariosPorNivel = await this.prisma.usuario.groupBy({
      by: ['nivel_id'],
      where: {
        campana_id: campanaFinal,
        eliminado: false,
        nivel_id: { not: null }, // Solo políticos con nivel
      },
      _count: {
        id: true,
      },
    });

    // Obtener info de cada nivel
    const nivelesConConteo = await Promise.all(
      usuariosPorNivel.map(async (item) => {
        const nivel = await this.prisma.nivel.findUnique({
          where: { id: item.nivel_id! },
          select: {
            id: true,
            nombre: true,
            orden: true,
            exclusivo_root: true,
          },
        });

        return {
          nivel,
          cantidad: item._count.id,
        };
      }),
    );

    // Contar operativos
    const operativos = await this.prisma.usuario.count({
      where: {
        campana_id: campanaFinal,
        eliminado: false,
        perfil: { es_operativo: true },
      },
    });

    // Total de usuarios
    const total = await this.prisma.usuario.count({
      where: {
        campana_id: campanaFinal,
        eliminado: false,
      },
    });

    // Usuarios activos vs inactivos
    const activos = await this.prisma.usuario.count({
      where: {
        campana_id: campanaFinal,
        eliminado: false,
        estado: true,
      },
    });

    return {
      campana_id: campanaFinal,
      total,
      activos,
      inactivos: total - activos,
      operativos,
      por_nivel: nivelesConConteo.sort((a, b) => (a.nivel?.orden ?? 999) - (b.nivel?.orden ?? 999)),
    };
  }

  async obtenerRedConConteoSimpatizantes(usuarioActualId: string, campanaIdHeader?: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: {
        perfil: true,
        nivel: true,
      },
    });

    if (!usuarioActual) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';
    const esOperativo = usuarioActual.perfil.es_operativo;

    const campanaId = esRoot ? campanaIdHeader : (usuarioActual.campana_id ?? undefined);

    if (!campanaId) {
      throw new ForbiddenException(
        esRoot ? 'Seleccioná una campaña para operar' : 'El usuario no pertenece a ninguna campaña',
      );
    }

    const actorId = esOperativo
      ? (usuarioActual.candidato_superior_id ?? usuarioActualId)
      : usuarioActualId;

    const obtenerRedCompleta = async (ids: string[]): Promise<string[]> => {
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

      return obtenerRedCompleta([...ids, ...nuevosIds]);
    };

    const todaLaRed = await obtenerRedCompleta([actorId]);

    // Excluir al actor mismo, solo mostrar subordinados
    const subordinadosIds = todaLaRed.filter((id) => id !== actorId);

    if (!subordinadosIds.length) return [];

    const usuarios = await this.prisma.usuario.findMany({
      where: {
        id: { in: subordinadosIds },
        eliminado: false,
        campana_id: campanaId,
      },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
        _count: {
          select: {
            simpatizantes_registrados: {
              where: { eliminado: false },
            },
          },
        },
      },
      orderBy: [{ nivel: { orden: 'asc' } }, { nombre: 'asc' }],
    });

    return usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      username: u.username,
      telefono: u.telefono,
      nivel: u.nivel,
      perfil: {
        id: u.perfil.id,
        nombre: u.perfil.nombre,
        es_operativo: u.perfil.es_operativo,
        nivel: u.perfil.nivel,
      },
      estado: u.estado,
      total_simpatizantes: u._count.simpatizantes_registrados,
    }));
  }
}
