import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import { ActualizarAsistenciaDto } from './dto/actualizar-asistencia.dto';
import { RegistrarAsistenciaMasivaDto } from './dto/registrar-asistencia-masiva.dto';

@Injectable()
export class AsistenciasService {
  constructor(private prisma: PrismaService) {}

  async crear(crearAsistenciaDto: CrearAsistenciaDto) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: crearAsistenciaDto.evento_id },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: crearAsistenciaDto.simpatizante_id },
    });

    if (!simpatizante) {
      throw new NotFoundException('Simpatizante no encontrado');
    }

    const asistenciaExistente = await this.prisma.asistencia.findUnique({
      where: {
        evento_id_simpatizante_id: {
          evento_id: crearAsistenciaDto.evento_id,
          simpatizante_id: crearAsistenciaDto.simpatizante_id,
        },
      },
    });

    if (asistenciaExistente) {
      throw new ConflictException('La asistencia ya está registrada');
    }

    const asistencia = await this.prisma.asistencia.create({
      data: {
        evento_id: crearAsistenciaDto.evento_id,
        simpatizante_id: crearAsistenciaDto.simpatizante_id,
        confirmado_previamente: crearAsistenciaDto.confirmado_previamente ?? false,
        asistio: crearAsistenciaDto.asistio ?? false,
      },
      include: {
        evento: {
          select: {
            id: true,
            titulo: true,
            fecha_hora_inicio: true,
            tipo_evento: true,
          },
        },
        simpatizante: true,
      },
    });

    return asistencia;
  }

  async registrarMasivo(registrarMasivaDto: RegistrarAsistenciaMasivaDto) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: registrarMasivaDto.evento_id },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    type AsistenciaCreada = Awaited<ReturnType<typeof this.prisma.asistencia.create>>;
    type ErrorRegistro = { simpatizante_id: string; error: string };

    const asistenciasCreadas: AsistenciaCreada[] = [];
    const errores: ErrorRegistro[] = [];

    for (const simpatizanteId of registrarMasivaDto.simpatizantes_ids) {
      try {
        const simpatizante = await this.prisma.simpatizante.findUnique({
          where: { id: simpatizanteId },
        });

        if (!simpatizante) {
          errores.push({ simpatizante_id: simpatizanteId, error: 'Simpatizante no encontrado' });
          continue;
        }

        const asistenciaExistente = await this.prisma.asistencia.findUnique({
          where: {
            evento_id_simpatizante_id: {
              evento_id: registrarMasivaDto.evento_id,
              simpatizante_id: simpatizanteId,
            },
          },
        });

        if (asistenciaExistente) {
          errores.push({ simpatizante_id: simpatizanteId, error: 'Asistencia ya registrada' });
          continue;
        }

        const asistencia = await this.prisma.asistencia.create({
          data: {
            evento_id: registrarMasivaDto.evento_id,
            simpatizante_id: simpatizanteId,
            confirmado_previamente: true,
          },
          include: {
            simpatizante: true,
          },
        });

        asistenciasCreadas.push(asistencia);
      } catch (error: any) {
        errores.push({ simpatizante_id: simpatizanteId, error: error.message });
      }
    }

    return {
      exitosas: asistenciasCreadas.length,
      fallidas: errores.length,
      asistencias: asistenciasCreadas,
      errores,
    };
  }

  async obtenerPorEvento(eventoId: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return this.prisma.asistencia.findMany({
      where: { evento_id: eventoId },
      include: {
        simpatizante: true,
      },
      orderBy: { fecha_hora_registro: 'desc' },
    });
  }

  async obtenerPorSimpatizante(simpatizanteId: string) {
    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: simpatizanteId },
    });

    if (!simpatizante) {
      throw new NotFoundException('Simpatizante no encontrado');
    }

    return this.prisma.asistencia.findMany({
      where: { simpatizante_id: simpatizanteId },
      include: {
        evento: {
          select: {
            id: true,
            titulo: true,
            fecha_hora_inicio: true,
            tipo_evento: true,
            direccion: true,
            ciudad: true,
          },
        },
      },
      orderBy: { fecha_hora_registro: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
      include: {
        evento: true,
        simpatizante: true,
      },
    });

    if (!asistencia) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    return asistencia;
  }

  async actualizar(id: string, actualizarAsistenciaDto: ActualizarAsistenciaDto) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    return this.prisma.asistencia.update({
      where: { id },
      data: actualizarAsistenciaDto,
      include: {
        evento: {
          select: {
            id: true,
            titulo: true,
            fecha_hora_inicio: true,
            tipo_evento: true,
          },
        },
        simpatizante: true,
      },
    });
  }

  async marcarAsistencia(id: string) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    return this.prisma.asistencia.update({
      where: { id },
      data: { asistio: true },
      include: {
        evento: {
          select: {
            id: true,
            titulo: true,
            fecha_hora_inicio: true,
            tipo_evento: true,
          },
        },
        simpatizante: true,
      },
    });
  }

  async eliminar(id: string) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    return this.prisma.asistencia.delete({
      where: { id },
    });
  }

  async obtenerEstadisticasEvento(eventoId: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const total = await this.prisma.asistencia.count({
      where: { evento_id: eventoId },
    });

    const confirmados = await this.prisma.asistencia.count({
      where: {
        evento_id: eventoId,
        confirmado_previamente: true,
      },
    });

    const asistieron = await this.prisma.asistencia.count({
      where: {
        evento_id: eventoId,
        asistio: true,
      },
    });

    return {
      evento_id: eventoId,
      total_registrados: total,
      confirmados_previamente: confirmados,
      asistieron: asistieron,
      porcentaje_asistencia: total > 0 ? ((asistieron / total) * 100).toFixed(2) : '0.00',
    };
  }
}
