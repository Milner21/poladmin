import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCampanaDto } from './dto/crear-campana.dto';
import { ActualizarCampanaDto } from './dto/actualizar-campana.dto';
import { ActualizarConfiguracionCampanaDto } from './dto/actualizar-configuracion-campana.dto';

@Injectable()
export class CampanasService {
  constructor(private prisma: PrismaService) {}

  private validarTipoCampana(
    tipo_campana: 'PARTIDO' | 'MOVIMIENTO',
    partido_id: string | undefined,
    modo_eleccion: string | undefined,
  ) {
    if (tipo_campana === 'PARTIDO' && !partido_id) {
      throw new BadRequestException('Debe seleccionar un partido para campanas de tipo PARTIDO');
    }

    if (tipo_campana === 'MOVIMIENTO' && partido_id) {
      throw new BadRequestException(
        'Las campanas de tipo MOVIMIENTO no pueden tener partido asociado',
      );
    }

    if (tipo_campana === 'MOVIMIENTO' && modo_eleccion === 'INTERNAS') {
      throw new BadRequestException('Las campanas de tipo MOVIMIENTO no pueden usar modo INTERNAS');
    }

    if (modo_eleccion === 'INTERNAS' && tipo_campana !== 'PARTIDO') {
      throw new BadRequestException(
        'El modo INTERNAS solo esta disponible para campanas de tipo PARTIDO',
      );
    }
  }

  async crear(crearCampanaDto: CrearCampanaDto) {
    const { modo_eleccion, nivel_campana, tipo_campana, partido_id, ...campanaData } =
      crearCampanaDto;

    if (nivel_campana === 'DEPARTAMENTO' && !campanaData.departamento) {
      throw new ConflictException(
        'El departamento es obligatorio para campanas de nivel DEPARTAMENTO',
      );
    }

    if (nivel_campana === 'DISTRITO') {
      if (!campanaData.departamento || !campanaData.distrito) {
        throw new ConflictException(
          'El departamento y distrito son obligatorios para campanas de nivel DISTRITO',
        );
      }
    }

    this.validarTipoCampana(tipo_campana, partido_id, modo_eleccion);

    if (partido_id) {
      const partido = await this.prisma.partido.findUnique({
        where: { id: partido_id },
      });
      if (!partido) throw new NotFoundException('Partido no encontrado');
      if (!partido.estado) throw new BadRequestException('El partido seleccionado no esta activo');
    }

    const campanaExistente = await this.prisma.campana.findFirst({
      where: { nombre: campanaData.nombre },
    });

    if (campanaExistente) {
      throw new ConflictException('Ya existe una campana con este nombre');
    }

    const modoEleccionFinal =
      tipo_campana === 'MOVIMIENTO' ? 'GENERALES' : (modo_eleccion ?? 'INTERNAS');

    return this.prisma.campana.create({
      data: {
        ...campanaData,
        nivel_campana: nivel_campana ?? 'DISTRITO',
        tipo_campana,
        partido_id: partido_id ?? null,
        configuracion: {
          create: {
            modo_eleccion: modoEleccionFinal,
          },
        },
      },
      include: {
        configuracion: true,
        partido: { select: { id: true, nombre: true, sigla: true } },
      },
    });
  }

  async obtenerTodas(usuarioPerfil: string, usuarioCampanaId: string | null) {
    if (usuarioPerfil === 'ROOT') {
      return this.prisma.campana.findMany({
        where: { estado: true },
        include: {
          configuracion: true,
          partido: { select: { id: true, nombre: true, sigla: true } },
          _count: { select: { usuarios: true, simpatizantes: true } },
        },
        orderBy: { fecha_registro: 'desc' },
      });
    }

    if (!usuarioCampanaId) return [];

    return this.prisma.campana.findMany({
      where: { id: usuarioCampanaId, estado: true },
      include: {
        configuracion: true,
        partido: { select: { id: true, nombre: true, sigla: true } },
      },
    });
  }

  async obtenerPorId(id: string, usuarioPerfil: string, usuarioCampanaId: string | null) {
    if (usuarioPerfil !== 'ROOT' && id !== usuarioCampanaId) {
      throw new ForbiddenException('No tienes permiso para ver esta campana');
    }

    const campana = await this.prisma.campana.findUnique({
      where: { id },
      include: {
        configuracion: true,
        partido: { select: { id: true, nombre: true, sigla: true } },
      },
    });

    if (!campana) throw new NotFoundException('Campana no encontrada');

    return campana;
  }

  async actualizar(id: string, actualizarCampanaDto: ActualizarCampanaDto) {
    const { modo_eleccion, nivel_campana, tipo_campana, partido_id, ...campanaData } =
      actualizarCampanaDto;

    const campana = await this.prisma.campana.findUnique({ where: { id } });
    if (!campana) throw new NotFoundException('Campana no encontrada');

    if (nivel_campana === 'DEPARTAMENTO' && !campanaData.departamento && !campana.departamento) {
      throw new ConflictException(
        'El departamento es obligatorio para campanas de nivel DEPARTAMENTO',
      );
    }

    if (nivel_campana === 'DISTRITO') {
      const dept = campanaData.departamento ?? campana.departamento;
      const dist = campanaData.distrito ?? campana.distrito;
      if (!dept || !dist) {
        throw new ConflictException(
          'El departamento y distrito son obligatorios para campanas de nivel DISTRITO',
        );
      }
    }

    const tipoCampanaFinal = tipo_campana ?? (campana.tipo_campana as 'PARTIDO' | 'MOVIMIENTO');
    const partidoIdFinal =
      partido_id !== undefined ? partido_id : (campana.partido_id ?? undefined);
    const modoEleccionFinal = modo_eleccion;

    this.validarTipoCampana(tipoCampanaFinal, partidoIdFinal, modoEleccionFinal);

    if (partidoIdFinal) {
      const partido = await this.prisma.partido.findUnique({
        where: { id: partidoIdFinal },
      });
      if (!partido) throw new NotFoundException('Partido no encontrado');
      if (!partido.estado) throw new BadRequestException('El partido seleccionado no esta activo');
    }

    const modoEleccionCalculado =
      tipoCampanaFinal === 'MOVIMIENTO' ? 'GENERALES' : modoEleccionFinal;

    return this.prisma.$transaction(async (tx) => {
      await tx.campana.update({
        where: { id },
        data: {
          ...campanaData,
          ...(nivel_campana && { nivel_campana }),
          tipo_campana: tipoCampanaFinal,
          partido_id: tipoCampanaFinal === 'MOVIMIENTO' ? null : (partidoIdFinal ?? null),
        },
      });

      if (modoEleccionCalculado) {
        await tx.configuracionCampana.upsert({
          where: { campana_id: id },
          update: { modo_eleccion: modoEleccionCalculado },
          create: { campana_id: id, modo_eleccion: modoEleccionCalculado },
        });
      }

      return tx.campana.findUnique({
        where: { id },
        include: {
          configuracion: true,
          partido: { select: { id: true, nombre: true, sigla: true } },
        },
      });
    });
  }

  async eliminar(id: string) {
    const campana = await this.prisma.campana.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usuarios: true, simpatizantes: true },
        },
      },
    });

    if (!campana) throw new NotFoundException('Campana no encontrada');

    if (campana._count.usuarios > 0 || campana._count.simpatizantes > 0) {
      throw new ConflictException(
        'No se puede eliminar una campana que tiene usuarios o simpatizantes activos. Debe desactivarla.',
      );
    }

    return this.prisma.campana.update({
      where: { id },
      data: { estado: false },
    });
  }

  async actualizarConfiguracion(
    campanaId: string,
    dto: ActualizarConfiguracionCampanaDto,
    usuarioPerfil: string,
  ) {
    if (usuarioPerfil !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede modificar la configuración de campaña');
    }

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
    });

    if (!campana) throw new NotFoundException('Campaña no encontrada');

    return this.prisma.configuracionCampana.upsert({
      where: { campana_id: campanaId },
      update: {
        ...(dto.permitir_duplicados_simpatizantes !== undefined && {
          permitir_duplicados_simpatizantes: dto.permitir_duplicados_simpatizantes,
        }),
        ...(dto.permitir_registro_manual_fuera_padron !== undefined && {
          permitir_registro_manual_fuera_padron: dto.permitir_registro_manual_fuera_padron,
        }),
      },
      create: {
        campana_id: campanaId,
        modo_eleccion: 'GENERALES',
        permitir_duplicados_simpatizantes: dto.permitir_duplicados_simpatizantes ?? false,
        permitir_registro_manual_fuera_padron: dto.permitir_registro_manual_fuera_padron ?? false,
      },
    });
  }
}
