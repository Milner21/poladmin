import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarNivelDto } from './dto/actualizar-nivel.dto';
import { CrearNivelDto } from './dto/crear-nivel.dto';

@Injectable()
export class NivelesService {
  constructor(private prisma: PrismaService) {}

  async crear(crearNivelDto: CrearNivelDto, usuarioId: string) {
    // Verificar que no exista un nivel con el mismo nombre
    const nivelExistente = await this.prisma.nivel.findUnique({
      where: { nombre: crearNivelDto.nombre },
    });

    if (nivelExistente && nivelExistente.estado) {
      throw new ConflictException('Ya existe un nivel con ese nombre');
    }

    // Verificar que no exista un nivel con el mismo orden
    const ordenExistente = await this.prisma.nivel.findUnique({
      where: { orden: crearNivelDto.orden },
    });

    if (ordenExistente && ordenExistente.estado) {
      throw new ConflictException('Ya existe un nivel con ese orden');
    }

    // Si existe inactivo → reactivar
    if (nivelExistente && !nivelExistente.estado) {
      return this.prisma.nivel.update({
        where: { id: nivelExistente.id },
        data: {
          orden: crearNivelDto.orden,
          descripcion: crearNivelDto.descripcion,
          permite_operadores: crearNivelDto.permite_operadores ?? false,
          exclusivo_root: crearNivelDto.exclusivo_root ?? false, // ← AGREGADO
          estado: true,
        },
      });
    }

    return this.prisma.nivel.create({
      data: {
        nombre: crearNivelDto.nombre,
        orden: crearNivelDto.orden,
        descripcion: crearNivelDto.descripcion,
        permite_operadores: crearNivelDto.permite_operadores ?? false,
        exclusivo_root: crearNivelDto.exclusivo_root ?? false, // ← AGREGADO
        creado_por_id: usuarioId,
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.nivel.findMany({
      where: { estado: true },
      include: {
        perfiles: {
          where: { estado: true },
          select: {
            id: true,
            nombre: true,
            es_operativo: true,
          },
        },
      },
      orderBy: { orden: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const nivel = await this.prisma.nivel.findUnique({
      where: { id },
      include: {
        perfiles: {
          where: { estado: true },
          select: {
            id: true,
            nombre: true,
            es_operativo: true,
          },
        },
      },
    });

    if (!nivel) {
      throw new NotFoundException('Nivel no encontrado');
    }

    return nivel;
  }

  async actualizar(id: string, actualizarNivelDto: ActualizarNivelDto) {
    const nivel = await this.prisma.nivel.findUnique({ where: { id } });

    if (!nivel) {
      throw new NotFoundException('Nivel no encontrado');
    }

    // Verificar nombre duplicado
    if (actualizarNivelDto.nombre) {
      const nivelExistente = await this.prisma.nivel.findFirst({
        where: {
          nombre: actualizarNivelDto.nombre,
          id: { not: id },
        },
      });
      if (nivelExistente) {
        throw new ConflictException('Ya existe un nivel con ese nombre');
      }
    }

    // Verificar orden duplicado
    if (actualizarNivelDto.orden) {
      const ordenExistente = await this.prisma.nivel.findFirst({
        where: {
          orden: actualizarNivelDto.orden,
          id: { not: id },
        },
      });
      if (ordenExistente) {
        throw new ConflictException('Ya existe un nivel con ese orden');
      }
    }

    return this.prisma.nivel.update({
      where: { id },
      data: actualizarNivelDto,
    });
  }

  async eliminar(id: string) {
    const nivel = await this.prisma.nivel.findUnique({
      where: { id },
      include: {
        perfiles: { where: { estado: true } },
        usuarios: { where: { eliminado: false } },
      },
    });

    if (!nivel) {
      throw new NotFoundException('Nivel no encontrado');
    }

    if (nivel.perfiles.length > 0) {
      throw new ConflictException('No se puede eliminar un nivel con perfiles activos asignados');
    }

    if (nivel.usuarios.length > 0) {
      throw new ConflictException('No se puede eliminar un nivel con usuarios activos asignados');
    }

    return this.prisma.nivel.update({
      where: { id },
      data: { estado: false },
    });
  }
}
