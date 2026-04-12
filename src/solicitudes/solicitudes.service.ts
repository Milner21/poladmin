import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { AsignarSolicitudDto } from './dto/asignar-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { AgendarSolicitudDto } from './dto/agendar-solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async crear(createSolicitudDto: CreateSolicitudDto, usuarioId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    if (!usuarioActual.campana_id && usuarioActual.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('El usuario no pertenece a ninguna campaña.');
    }

    // Verificar que el simpatizante exista y sea de la misma campaña
    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: createSolicitudDto.simpatizante_id },
    });

    if (!simpatizante) {
      throw new NotFoundException('Simpatizante no encontrado');
    }

    const campanaId = usuarioActual.campana_id ?? simpatizante.campana_id;

    if (usuarioActual.perfil.nombre !== 'ROOT' && simpatizante.campana_id !== campanaId) {
      throw new ForbiddenException('El simpatizante pertenece a otra campaña');
    }

    // Determinar jerarquía
    const esOperativo = usuarioActual.perfil.es_operativo;
    const actorId = esOperativo ? usuarioActual.candidato_superior_id : usuarioId;

    if (esOperativo && !actorId) {
      throw new ForbiddenException('El usuario operativo no tiene un candidato superior asignado.');
    }

    // Crear la solicitud
    const solicitud = await this.prisma.solicitud.create({
      data: {
        campana_id: campanaId,
        simpatizante_id: createSolicitudDto.simpatizante_id,
        titulo: createSolicitudDto.titulo,
        descripcion: createSolicitudDto.descripcion,
        prioridad: createSolicitudDto.prioridad ?? 'MEDIA',
        estado: 'PENDIENTE',
        registrado_por_id: usuarioId,
        asignado_a_id: createSolicitudDto.asignado_a_id,
        candidato_id: simpatizante.candidato_id,
        lider_id: simpatizante.lider_id,
        fecha_limite: createSolicitudDto.fecha_limite
          ? new Date(createSolicitudDto.fecha_limite)
          : null,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        registrado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Registrar movimiento inicial
    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_id: usuarioId,
        accion: 'CREAR',
        estado_nuevo: 'PENDIENTE',
        comentario: 'Solicitud creada',
      },
    });

    // Auditoría
    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioId,
        accion: 'CREAR',
        modulo: 'SOLICITUDES',
        entidad_id: solicitud.id,
        entidad_tipo: 'Solicitud',
        datos_despues: solicitud,
      },
    });

    return solicitud;
  }

  async obtenerTodos(usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true },
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';
    const esOperativo = usuarioActual.perfil.es_operativo;

    // Si es ROOT, ve todo
    if (esRoot) {
      return this.prisma.solicitud.findMany({
        where: { eliminado: false },
        include: {
          simpatizante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
            },
          },
          registrado_por: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          asignado_a: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          campana: {
            select: {
              id: true,
              nombre: true,
            },
          },
          _count: {
            select: { movimientos: true },
          },
        },
        orderBy: [{ estado: 'asc' }, { prioridad: 'desc' }, { fecha_registro: 'desc' }],
      });
    }

    // Si es operativo, ve lo mismo que su candidato
    const actorId = esOperativo ? usuarioActual.candidato_superior_id : usuarioActualId;

    if (!actorId) {
      throw new ForbiddenException('No se pudo determinar el actor jerárquico');
    }

    // Obtener subordinados en cascada
    const subordinadosIds = await this.obtenerSubordinadosRecursivo(actorId);
    const idsPermitidos = [actorId, ...subordinadosIds];

    return this.prisma.solicitud.findMany({
      where: {
        eliminado: false,
        campana_id: usuarioActual.campana_id!,
        OR: [
          { candidato_id: { in: idsPermitidos } },
          { lider_id: { in: idsPermitidos } },
          { registrado_por_id: usuarioActualId },
          { asignado_a_id: usuarioActualId },
        ],
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        registrado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        _count: {
          select: { movimientos: true },
        },
      },
      orderBy: [{ estado: 'asc' }, { prioridad: 'desc' }, { fecha_registro: 'desc' }],
    });
  }

  async obtenerPorId(id: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true },
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        simpatizante: true,
        registrado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            perfil: { select: { nombre: true } },
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            perfil: { select: { nombre: true } },
          },
        },
        candidato: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        lider: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        campana: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';

    if (!esRoot && solicitud.campana_id !== usuarioActual.campana_id) {
      throw new ForbiddenException('La solicitud pertenece a otra campaña');
    }

    // Verificar visibilidad jerárquica
    if (!esRoot) {
      const tieneAcceso = await this.verificarAccesoSolicitud(solicitud.id, usuarioActualId);
      if (!tieneAcceso) {
        throw new ForbiddenException('No tenés acceso a esta solicitud');
      }
    }

    return solicitud;
  }

  async actualizar(id: string, updateSolicitudDto: UpdateSolicitudDto, usuarioActualId: string) {
    const solicitudAnterior = await this.obtenerPorId(id, usuarioActualId);

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        titulo: updateSolicitudDto.titulo,
        descripcion: updateSolicitudDto.descripcion,
        prioridad: updateSolicitudDto.prioridad,
        fecha_limite: updateSolicitudDto.fecha_limite
          ? new Date(updateSolicitudDto.fecha_limite)
          : undefined,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        registrado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Registrar movimiento
    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: id,
        usuario_id: usuarioActualId,
        accion: 'ACTUALIZAR',
        comentario: 'Solicitud actualizada',
      },
    });

    // Auditoría
    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioActualId,
        accion: 'EDITAR',
        modulo: 'SOLICITUDES',
        entidad_id: id,
        entidad_tipo: 'Solicitud',
        datos_antes: solicitudAnterior,
        datos_despues: solicitudActualizada,
      },
    });

    return solicitudActualizada;
  }

  async asignar(id: string, asignarDto: AsignarSolicitudDto, usuarioActualId: string) {
    const solicitud = await this.obtenerPorId(id, usuarioActualId);

    // Verificar que el usuario asignado exista y sea de la misma campaña
    const usuarioAsignado = await this.prisma.usuario.findUnique({
      where: { id: asignarDto.asignado_a_id },
    });

    if (!usuarioAsignado) {
      throw new NotFoundException('Usuario a asignar no encontrado');
    }

    if (solicitud.campana_id !== usuarioAsignado.campana_id) {
      throw new BadRequestException('El usuario a asignar no pertenece a la misma campaña');
    }

    // Validar jerarquía: solo puede asignar un superior
    const esRoot = (
      await this.prisma.usuario.findUnique({
        where: { id: usuarioActualId },
        include: { perfil: true },
      })
    )?.perfil.nombre === 'ROOT';

    if (!esRoot) {
      const esSuperior = await this.esUsuarioSuperior(usuarioActualId, asignarDto.asignado_a_id);
      if (!esSuperior && usuarioActualId !== asignarDto.asignado_a_id) {
        throw new ForbiddenException(
          'Solo podés asignar solicitudes a vos mismo o a tus subordinados',
        );
      }
    }

    const asignadoAnteriorId = solicitud.asignado_a_id;

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        asignado_a_id: asignarDto.asignado_a_id,
        estado: solicitud.estado === 'PENDIENTE' ? 'EN_PROCESO' : solicitud.estado,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Registrar movimiento
    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: id,
        usuario_id: usuarioActualId,
        accion: 'ASIGNAR',
        comentario: asignarDto.comentario ?? 'Solicitud asignada',
        asignado_anterior_id: asignadoAnteriorId ?? undefined,
        asignado_nuevo_id: asignarDto.asignado_a_id,
      },
    });

    return solicitudActualizada;
  }

  async cambiarEstado(id: string, cambiarEstadoDto: CambiarEstadoSolicitudDto, usuarioActualId: string) {
    const solicitud = await this.obtenerPorId(id, usuarioActualId);

    const estadoAnterior = solicitud.estado;

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: cambiarEstadoDto.estado,
        fecha_cierre:
          cambiarEstadoDto.estado === 'CUMPLIDA' || cambiarEstadoDto.estado === 'RECHAZADA'
            ? new Date()
            : null,
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Registrar movimiento
    const accion =
      cambiarEstadoDto.estado === 'CUMPLIDA'
        ? 'CUMPLIR'
        : cambiarEstadoDto.estado === 'RECHAZADA'
          ? 'RECHAZAR'
          : 'ACTUALIZAR';

    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: id,
        usuario_id: usuarioActualId,
        accion,
        comentario: cambiarEstadoDto.comentario,
        estado_anterior: estadoAnterior,
        estado_nuevo: cambiarEstadoDto.estado,
      },
    });

    return solicitudActualizada;
  }

  async agendar(id: string, agendarDto: AgendarSolicitudDto, usuarioActualId: string) {
    const solicitud = await this.obtenerPorId(id, usuarioActualId);

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        fecha_limite: new Date(agendarDto.fecha_limite),
        estado: 'AGENDADA',
      },
      include: {
        simpatizante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        asignado_a: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Registrar movimiento
    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: id,
        usuario_id: usuarioActualId,
        accion: 'AGENDAR',
        comentario: agendarDto.comentario ?? `Agendada para ${agendarDto.fecha_limite}`,
        estado_anterior: solicitud.estado,
        estado_nuevo: 'AGENDADA',
      },
    });

    return solicitudActualizada;
  }

  async obtenerMovimientos(solicitudId: string, usuarioActualId: string) {
    await this.obtenerPorId(solicitudId, usuarioActualId);

    return this.prisma.movimientoSolicitud.findMany({
      where: { solicitud_id: solicitudId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            perfil: { select: { nombre: true } },
          },
        },
      },
      orderBy: { fecha_movimiento: 'desc' },
    });
  }

  async eliminar(id: string, usuarioActualId: string) {
    await this.obtenerPorId(id, usuarioActualId);

    const solicitudEliminada = await this.prisma.solicitud.update({
      where: { id },
      data: { eliminado: true },
    });

    // Registrar movimiento
    await this.prisma.movimientoSolicitud.create({
      data: {
        solicitud_id: id,
        usuario_id: usuarioActualId,
        accion: 'ELIMINAR',
        comentario: 'Solicitud eliminada',
      },
    });

    // Auditoría
    await this.prisma.auditoriaLog.create({
      data: {
        usuario_id: usuarioActualId,
        accion: 'ELIMINAR',
        modulo: 'SOLICITUDES',
        entidad_id: id,
        entidad_tipo: 'Solicitud',
        datos_antes: solicitudEliminada,
      },
    });

    return solicitudEliminada;
  }

  async obtenerDashboard(usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true },
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuarioActual.perfil.nombre === 'ROOT';
    const esOperativo = usuarioActual.perfil.es_operativo;

    const actorId = esOperativo ? usuarioActual.candidato_superior_id : usuarioActualId;

    let whereClause = {};

    if (esRoot) {
      whereClause = { eliminado: false };
    } else {
      const subordinadosIds = await this.obtenerSubordinadosRecursivo(actorId!);
      const idsPermitidos = [actorId!, ...subordinadosIds];

      whereClause = {
        eliminado: false,
        campana_id: usuarioActual.campana_id!,
        OR: [
          { candidato_id: { in: idsPermitidos } },
          { lider_id: { in: idsPermitidos } },
          { registrado_por_id: usuarioActualId },
          { asignado_a_id: usuarioActualId },
        ],
      };
    }

    const [
      totalSolicitudes,
      pendientes,
      enProceso,
      agendadas,
      cumplidas,
      rechazadas,
      porPrioridad,
    ] = await Promise.all([
      this.prisma.solicitud.count({ where: whereClause }),
      this.prisma.solicitud.count({ where: { ...whereClause, estado: 'PENDIENTE' } }),
      this.prisma.solicitud.count({ where: { ...whereClause, estado: 'EN_PROCESO' } }),
      this.prisma.solicitud.count({ where: { ...whereClause, estado: 'AGENDADA' } }),
      this.prisma.solicitud.count({ where: { ...whereClause, estado: 'CUMPLIDA' } }),
      this.prisma.solicitud.count({ where: { ...whereClause, estado: 'RECHAZADA' } }),
      this.prisma.solicitud.groupBy({
        by: ['prioridad'],
        where: { ...whereClause, estado: { in: ['PENDIENTE', 'EN_PROCESO', 'AGENDADA'] } },
        _count: true,
      }),
    ]);

    return {
      total: totalSolicitudes,
      por_estado: {
        pendientes,
        en_proceso: enProceso,
        agendadas,
        cumplidas,
        rechazadas,
      },
      por_prioridad: porPrioridad.reduce(
        (acc, item) => {
          acc[item.prioridad.toLowerCase()] = item._count;
          return acc;
        },
        { alta: 0, media: 0, baja: 0 },
      ),
    };
  }

  // Métodos auxiliares
  private async obtenerSubordinadosRecursivo(usuarioId: string): Promise<string[]> {
    const subordinados = await this.prisma.usuario.findMany({
      where: { candidato_superior_id: usuarioId, eliminado: false },
      select: { id: true },
    });

    let todosLosIds: string[] = subordinados.map((s) => s.id);

    for (const subordinado of subordinados) {
      const subSubordinados = await this.obtenerSubordinadosRecursivo(subordinado.id);
      todosLosIds = [...todosLosIds, ...subSubordinados];
    }

    return todosLosIds;
  }

  private async verificarAccesoSolicitud(solicitudId: string, usuarioId: string): Promise<boolean> {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) return false;

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) return false;

    const esOperativo = usuario.perfil.es_operativo;
    const actorId = esOperativo ? usuario.candidato_superior_id : usuarioId;

    if (!actorId) return false;

    const subordinadosIds = await this.obtenerSubordinadosRecursivo(actorId);
    const idsPermitidos = [actorId, ...subordinadosIds];

    return (
      idsPermitidos.includes(solicitud.candidato_id ?? '') ||
      idsPermitidos.includes(solicitud.lider_id ?? '') ||
      solicitud.registrado_por_id === usuarioId ||
      solicitud.asignado_a_id === usuarioId
    );
  }

  private async esUsuarioSuperior(superiorId: string, subordinadoId: string): Promise<boolean> {
    const subordinado = await this.prisma.usuario.findUnique({
      where: { id: subordinadoId },
    });

    if (!subordinado) return false;
    if (subordinado.candidato_superior_id === superiorId) return true;
    if (!subordinado.candidato_superior_id) return false;

    return this.esUsuarioSuperior(superiorId, subordinado.candidato_superior_id);
  }
}