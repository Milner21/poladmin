import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPermisoDto } from './dto/crear-permiso.dto';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto';
import { AsignarPermisoPersonalizadoDto } from './dto/asignar-permiso-personalizado.dto';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  async crear(crearPermisoDto: CrearPermisoDto) {
    const permisoExistente = await this.prisma.permiso.findUnique({
      where: { nombre: crearPermisoDto.nombre },
    });

    if (permisoExistente) {
      throw new ConflictException('El permiso ya existe');
    }

    return this.prisma.permiso.create({
      data: crearPermisoDto,
    });
  }

  async obtenerTodos() {
    return this.prisma.permiso.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }],
    });
  }

  async obtenerPorId(id: string) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return permiso;
  }

  async obtenerPorModulo(modulo: string) {
    return this.prisma.permiso.findMany({
      where: { modulo },
      orderBy: { accion: 'asc' },
    });
  }

  async actualizar(id: string, actualizarPermisoDto: ActualizarPermisoDto) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    if (actualizarPermisoDto.nombre) {
      const permisoExistente = await this.prisma.permiso.findFirst({
        where: {
          nombre: actualizarPermisoDto.nombre,
          id: { not: id },
        },
      });

      if (permisoExistente) {
        throw new ConflictException('Ya existe un permiso con ese nombre');
      }
    }

    return this.prisma.permiso.update({
      where: { id },
      data: actualizarPermisoDto,
    });
  }

  async eliminar(id: string) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id },
      include: {
        perfiles: true,
        permisos_personalizados: true,
      },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    if (permiso.perfiles.length > 0 || permiso.permisos_personalizados.length > 0) {
      throw new ConflictException('No se puede eliminar un permiso asignado a perfiles o usuarios');
    }

    return this.prisma.permiso.delete({
      where: { id },
    });
  }

  async asignarPermisoPersonalizado(
    asignarPermisoDto: AsignarPermisoPersonalizadoDto,
    asignadoPorId: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: asignarPermisoDto.usuario_id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const permiso = await this.prisma.permiso.findUnique({
      where: { id: asignarPermisoDto.permiso_id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    const permisoExistente = await this.prisma.permisoPersonalizado.findUnique({
      where: {
        usuario_id_permiso_id: {
          usuario_id: asignarPermisoDto.usuario_id,
          permiso_id: asignarPermisoDto.permiso_id,
        },
      },
    });

    if (permisoExistente) {
      throw new ConflictException('El usuario ya tiene este permiso personalizado');
    }

    return this.prisma.permisoPersonalizado.create({
      data: {
        usuario_id: asignarPermisoDto.usuario_id,
        permiso_id: asignarPermisoDto.permiso_id,
        asignado_por_id: asignadoPorId,
      },
      include: {
        permiso: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });
  }

  async quitarPermisoPersonalizado(usuarioId: string, permisoId: string) {
    const permisoPersonalizado = await this.prisma.permisoPersonalizado.findUnique({
      where: {
        usuario_id_permiso_id: {
          usuario_id: usuarioId,
          permiso_id: permisoId,
        },
      },
    });

    if (!permisoPersonalizado) {
      throw new NotFoundException('Permiso personalizado no encontrado');
    }

    return this.prisma.permisoPersonalizado.delete({
      where: {
        usuario_id_permiso_id: {
          usuario_id: usuarioId,
          permiso_id: permisoId,
        },
      },
    });
  }

  async obtenerPermisosPersonalizadosPorUsuario(usuarioId: string) {
    return this.prisma.permisoPersonalizado.findMany({
      where: { usuario_id: usuarioId },
      include: {
        permiso: true,
      },
    });
  }
}