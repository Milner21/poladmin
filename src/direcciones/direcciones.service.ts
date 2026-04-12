import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearDireccionDto } from './dto/crear-direccion.dto';

@Injectable()
export class DireccionesService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarBarrios(departamento: string, ciudad: string, busqueda?: string) {
    const where = {
      departamento: departamento.toUpperCase(),
      ciudad: ciudad.toUpperCase(),
      activo: true,
      ...(busqueda && {
        barrio: {
          contains: busqueda.toUpperCase(), // ← AGREGAR .toUpperCase()
          mode: 'insensitive' as const,
        },
      }),
    };

    const direcciones = await this.prisma.direccion.findMany({
      where,
      select: {
        id: true,
        departamento: true,
        ciudad: true,
        barrio: true,
      },
      orderBy: { barrio: 'asc' },
      take: 20,
    });

    return direcciones;
  }

  async crear(crearDireccionDto: CrearDireccionDto, usuarioId: string) {
    const { departamento, ciudad, barrio } = crearDireccionDto;

    // Verificar si ya existe
    const existe = await this.prisma.direccion.findUnique({
      where: {
        departamento_ciudad_barrio: {
          departamento: departamento.toUpperCase(),
          ciudad: ciudad.toUpperCase(),
          barrio: barrio.trim().toUpperCase(),
        },
      },
    });

    if (existe) {
      throw new ConflictException('Este barrio ya existe');
    }

    return this.prisma.direccion.create({
      data: {
        departamento: departamento.toUpperCase(),
        ciudad: ciudad.toUpperCase(),
        barrio: barrio.trim().toUpperCase(),
        creado_por_id: usuarioId,
      },
    });
  }
}
