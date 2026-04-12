import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { ActualizarEventoDto } from './dto/actualizar-evento.dto';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  async crear(crearEventoDto: CrearEventoDto, usuarioId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true }
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    if (!usuarioActual.campana_id && usuarioActual.perfil.nombre !== 'ROOT') {
       throw new InternalServerErrorException('El usuario no pertenece a ninguna campaña.');
    }

    const esOperativo = usuarioActual.perfil.es_operativo;
    const actorId = esOperativo ? usuarioActual.candidato_superior_id : usuarioId;

    if (esOperativo && !actorId) {
      throw new ForbiddenException('El usuario operativo no tiene candidato superior.');
    }

    // El dueño del evento es el candidato
    const candidatoId = crearEventoDto.candidato_id || actorId;

    const evento = await this.prisma.evento.create({
      data: {
        titulo: crearEventoDto.titulo,
        fecha_hora_inicio: new Date(crearEventoDto.fecha_hora_inicio),
        direccion: crearEventoDto.direccion,
        barrio: crearEventoDto.barrio,
        ciudad: crearEventoDto.ciudad,
        tipo_evento: crearEventoDto.tipo_evento,
        capacidad_estimada: crearEventoDto.capacidad_estimada,
        candidato_id: candidatoId!, // Sabemos que no es nulo por la lógica anterior
        creado_por_id: usuarioId, 
        campana_id: usuarioActual.campana_id || 'ID_ROOT', // Si es ROOT y crea sin campaña, evitamos error (aunque en la práctica no lo haga)
      },
    });

    return evento;
  }

  async obtenerTodos(usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true }
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    // ROOT ve todo
    if (usuarioActual.perfil.nombre === 'ROOT') {
      return this.prisma.evento.findMany({
        where: { eliminado: false },
        orderBy: [{ campana_id: 'asc' }, { fecha_hora_inicio: 'desc' }],
      });
    }

    // Los demás solo ven lo de su campaña
    return this.prisma.evento.findMany({
      where: { 
        eliminado: false,
        campana_id: usuarioActual.campana_id!
      },
      orderBy: { fecha_hora_inicio: 'desc' },
    });
  }

  async obtenerPorId(id: string, usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true }
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: {
        asistencias: {
          include: { simpatizante: true },
        },
      },
    });

    if (!evento) throw new NotFoundException('Evento no encontrado');

    if (usuarioActual.perfil.nombre !== 'ROOT' && evento.campana_id !== usuarioActual.campana_id) {
       throw new ForbiddenException('El evento pertenece a otra campaña');
    }

    return evento;
  }

  async actualizar(id: string, actualizarEventoDto: ActualizarEventoDto, usuarioActualId: string) {
    const evento = await this.obtenerPorId(id, usuarioActualId);

    const dataActualizar: any = {
      titulo: actualizarEventoDto.titulo,
      direccion: actualizarEventoDto.direccion,
      barrio: actualizarEventoDto.barrio,
      ciudad: actualizarEventoDto.ciudad,
      tipo_evento: actualizarEventoDto.tipo_evento,
      capacidad_estimada: actualizarEventoDto.capacidad_estimada,
      estado: actualizarEventoDto.estado,
    };

    if (actualizarEventoDto.fecha_hora_inicio) {
      dataActualizar.fecha_hora_inicio = new Date(actualizarEventoDto.fecha_hora_inicio);
    }

    return this.prisma.evento.update({
      where: { id },
      data: dataActualizar,
    });
  }

  async eliminar(id: string, usuarioActualId: string) {
    // Validamos permisos obteniéndolo primero
    await this.obtenerPorId(id, usuarioActualId);

    return this.prisma.evento.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  async obtenerProximos(usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true }
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    return this.prisma.evento.findMany({
      where: {
        eliminado: false,
        estado: 'planificado',
        fecha_hora_inicio: { gte: new Date() },
        ...(usuarioActual.perfil.nombre !== 'ROOT' ? { campana_id: usuarioActual.campana_id! } : {})
      },
      include: { _count: { select: { asistencias: true } } },
      orderBy: { fecha_hora_inicio: 'asc' },
    });
  }

  async obtenerPasados(usuarioActualId: string) {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id: usuarioActualId },
      include: { perfil: true }
    });

    if (!usuarioActual) throw new UnauthorizedException('Usuario no autenticado');

    return this.prisma.evento.findMany({
     where: {
        eliminado: false,
        fecha_hora_inicio: { lt: new Date() },
        ...(usuarioActual.perfil.nombre !== 'ROOT' ? { campana_id: usuarioActual.campana_id! } : {})
      },
      include: { _count: { select: { asistencias: true } } },
      orderBy: { fecha_hora_inicio: 'desc' },
    });
  }
}