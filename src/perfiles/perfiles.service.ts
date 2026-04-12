import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearPerfilDto } from './dto/crear-perfil.dto';

@Injectable()
export class PerfilesService {
  constructor(private prisma: PrismaService) {}

  async crear(crearPerfilDto: CrearPerfilDto, usuarioId: string) {
    const perfilExistente = await this.prisma.perfil.findUnique({
      where: { nombre: crearPerfilDto.nombre },
      include: {
        permisos: { include: { permiso: true } },
        nivel: true,
      },
    });

    // Si existe y está activo → conflict
    if (perfilExistente && perfilExistente.estado === true) {
      throw new ConflictException('El perfil ya existe y está activo');
    }

    // Si existe pero está inactivo → reactivar y actualizar
    if (perfilExistente && perfilExistente.estado === false) {
      return this.prisma.perfil.update({
        where: { id: perfilExistente.id },
        data: {
          nivel_id: crearPerfilDto.nivel_id ?? null,
          es_operativo: crearPerfilDto.es_operativo ?? false,
          username_manual: crearPerfilDto.username_manual ?? false,
          estado: true,
        },
        include: {
          permisos: { include: { permiso: true } },
          nivel: true,
        },
      });
    }

    // Validar que si no es operativo, tenga nivel_id
    if (!crearPerfilDto.es_operativo && !crearPerfilDto.nivel_id) {
      throw new ConflictException('Un perfil político debe tener un nivel asignado');
    }

    // Validar que el nivel exista
    if (crearPerfilDto.nivel_id) {
      const nivel = await this.prisma.nivel.findUnique({
        where: { id: crearPerfilDto.nivel_id },
      });
      if (!nivel) {
        throw new NotFoundException('Nivel no encontrado');
      }
    }

    return this.prisma.perfil.create({
      data: {
        nombre: crearPerfilDto.nombre,
        nivel_id: crearPerfilDto.nivel_id ?? null,
        es_operativo: crearPerfilDto.es_operativo ?? false,
        username_manual: crearPerfilDto.username_manual ?? false,
      },
      include: {
        permisos: { include: { permiso: true } },
        nivel: true,
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.perfil.findMany({
      where: { estado: true },
      include: {
        permisos: { include: { permiso: true } },
        nivel: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
      include: {
        permisos: { include: { permiso: true } },
        nivel: true,
      },
    });

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return perfil;
  }

  async actualizar(id: string, actualizarPerfilDto: ActualizarPerfilDto, usuarioId: string) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (perfil.nombre === 'ROOT') {
      throw new ForbiddenException('No se puede modificar el perfil ROOT');
    }

    if (actualizarPerfilDto.nombre) {
      const perfilExistente = await this.prisma.perfil.findFirst({
        where: {
          nombre: actualizarPerfilDto.nombre,
          id: { not: id },
        },
      });

      if (perfilExistente) {
        throw new ConflictException('Ya existe un perfil con ese nombre');
      }
    }

    // Validar nivel si se envía
    if (actualizarPerfilDto.nivel_id) {
      const nivel = await this.prisma.nivel.findUnique({
        where: { id: actualizarPerfilDto.nivel_id },
      });
      if (!nivel) {
        throw new NotFoundException('Nivel no encontrado');
      }
    }

    return this.prisma.perfil.update({
      where: { id },
      data: {
        ...actualizarPerfilDto,
      },
      include: {
        permisos: { include: { permiso: true } },
        nivel: true,
      },
    });
  }

  async eliminar(id: string) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
      include: {
        usuarios: {
          where: { eliminado: false },
        },
      },
    });

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (perfil.nombre === 'ROOT') {
      throw new ForbiddenException('No se puede eliminar el perfil ROOT');
    }

    if (perfil.usuarios.length > 0) {
      throw new ConflictException('No se puede eliminar un perfil con usuarios activos asignados');
    }

    return this.prisma.perfil.update({
      where: { id },
      data: { estado: false },
    });
  }

  async asignarPermisos(perfilId: string, permisosIds: string[]) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id: perfilId },
    });

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (perfil.nombre === 'ROOT') {
      throw new ForbiddenException('No se puede modificar los permisos del perfil ROOT');
    }

    // Eliminar permisos actuales
    await this.prisma.perfilPermiso.deleteMany({
      where: { perfil_id: perfilId },
    });

    // Asignar nuevos permisos
    if (permisosIds.length > 0) {
      const perfilPermisos = permisosIds.map((permisoId) => ({
        perfil_id: perfilId,
        permiso_id: permisoId,
      }));

      await this.prisma.perfilPermiso.createMany({
        data: perfilPermisos,
      });
    }

    return this.obtenerPorId(perfilId);
  }
}