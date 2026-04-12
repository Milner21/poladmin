import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';

@Injectable()
export class PartidosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearPartidoDto, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede crear partidos');
    }

    const existeNombre = await this.prisma.partido.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existeNombre) {
      throw new ConflictException('Ya existe un partido con ese nombre');
    }

    const existeSigla = await this.prisma.partido.findUnique({
      where: { sigla: dto.sigla },
    });

    if (existeSigla) {
      throw new ConflictException('Ya existe un partido con esa sigla');
    }

    return this.prisma.partido.create({
      data: {
        nombre: dto.nombre,
        sigla: dto.sigla,
        descripcion: dto.descripcion,
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.partido.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { campanas: true },
        },
      },
    });
  }

  async obtenerPorId(id: string) {
    const partido = await this.prisma.partido.findUnique({
      where: { id },
      include: {
        campanas: {
          where: { estado: true },
          select: {
            id: true,
            nombre: true,
            nivel_campana: true,
            tipo_campana: true,
          },
        },
        _count: {
          select: { campanas: true, padron_interno: true },
        },
      },
    });

    if (!partido) {
      throw new NotFoundException('Partido no encontrado');
    }

    return partido;
  }

  async actualizar(id: string, dto: ActualizarPartidoDto, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede modificar partidos');
    }

    const partido = await this.prisma.partido.findUnique({
      where: { id },
    });

    if (!partido) {
      throw new NotFoundException('Partido no encontrado');
    }

    if (dto.nombre && dto.nombre !== partido.nombre) {
      const existeNombre = await this.prisma.partido.findUnique({
        where: { nombre: dto.nombre },
      });

      if (existeNombre) {
        throw new ConflictException('Ya existe un partido con ese nombre');
      }
    }

    if (dto.sigla && dto.sigla !== partido.sigla) {
      const existeSigla = await this.prisma.partido.findUnique({
        where: { sigla: dto.sigla },
      });

      if (existeSigla) {
        throw new ConflictException('Ya existe un partido con esa sigla');
      }
    }

    return this.prisma.partido.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        sigla: dto.sigla,
        descripcion: dto.descripcion,
        estado: dto.estado,
      },
    });
  }

  async eliminar(id: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede eliminar partidos');
    }

    const partido = await this.prisma.partido.findUnique({
      where: { id },
      include: {
        _count: {
          select: { campanas: true, padron_interno: true },
        },
      },
    });

    if (!partido) {
      throw new NotFoundException('Partido no encontrado');
    }

    if (partido._count.campanas > 0) {
      throw new ConflictException(
        'No se puede eliminar un partido que tiene campañas asociadas',
      );
    }

    if (partido._count.padron_interno > 0) {
      throw new ConflictException(
        'No se puede eliminar un partido que tiene registros de padrón interno',
      );
    }

    return this.prisma.partido.update({
      where: { id },
      data: { estado: false },
    });
  }
}