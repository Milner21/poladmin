import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImpresoraDto } from './dto/create-impresora.dto';
import { UpdateImpresoraDto } from './dto/update-impresora.dto';
import { AsignarUsuarioDto } from './dto/asignar-usuario.dto';

@Injectable()
export class ImpresorasService {
  constructor(private prisma: PrismaService) {}

  private async obtenerContexto(usuarioId: string, campanaIdHeader?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuario.perfil.nombre === 'ROOT';
    const campanaId = esRoot ? campanaIdHeader : usuario.campana_id;

    if (!campanaId) {
      throw new ForbiddenException(
        esRoot
          ? 'Seleccioná una campaña en el selector superior'
          : 'El usuario no pertenece a ninguna campaña',
      );
    }

    return { usuario, esRoot, campanaId };
  }

  async crearImpresora(createDto: CreateImpresoraDto, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const existe = await this.prisma.impresora.findUnique({
      where: { codigo: createDto.codigo },
    });

    if (existe) {
      throw new ConflictException('Ya existe una impresora con ese código');
    }

    return this.prisma.impresora.create({
      data: {
        campana_id: campanaId,
        codigo: createDto.codigo,
        nombre: createDto.nombre,
        descripcion: createDto.descripcion,
        ubicacion: createDto.ubicacion,
        creado_por_id: usuarioId,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        creado_por: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async obtenerImpresoras(usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    return this.prisma.impresora.findMany({
      where: { campana_id: campanaId },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            trabajos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerImpresoraPorId(id: string, usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const impresora = await this.prisma.impresora.findUnique({
      where: { id },
      include: {
        campana: { select: { id: true, nombre: true } },
        creado_por: { select: { id: true, nombre: true, apellido: true } },
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                username: true,
              },
            },
          },
        },
        trabajos: {
          take: 10,
          orderBy: { creado_en: 'desc' },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        _count: {
          select: {
            trabajos: true,
          },
        },
      },
    });

    if (!impresora) {
      throw new NotFoundException('Impresora no encontrada');
    }

    if (impresora.campana_id !== campanaId) {
      throw new ForbiddenException('La impresora pertenece a otra campaña');
    }

    return impresora;
  }

  async actualizarImpresora(
    id: string,
    updateDto: UpdateImpresoraDto,
    usuarioId: string,
    campanaIdHeader?: string,
  ) {
    await this.obtenerImpresoraPorId(id, usuarioId, campanaIdHeader);

    return this.prisma.impresora.update({
      where: { id },
      data: {
        nombre: updateDto.nombre,
        descripcion: updateDto.descripcion,
        ubicacion: updateDto.ubicacion,
      },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });
  }

  async eliminarImpresora(id: string, usuarioId: string, campanaIdHeader?: string) {
    await this.obtenerImpresoraPorId(id, usuarioId, campanaIdHeader);

    return this.prisma.impresora.delete({
      where: { id },
    });
  }

  async asignarUsuario(dto: AsignarUsuarioDto) {
    const existe = await this.prisma.usuarioImpresora.findUnique({
      where: {
        usuario_id_impresora_id: {
          usuario_id: dto.usuario_id,
          impresora_id: dto.impresora_id,
        },
      },
    });

    if (existe) {
      throw new ConflictException('El usuario ya está asignado a esta impresora');
    }

    return this.prisma.usuarioImpresora.create({
      data: {
        usuario_id: dto.usuario_id,
        impresora_id: dto.impresora_id,
        es_principal: dto.es_principal ?? true,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        impresora: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });
  }

  async desasignarUsuario(usuarioId: string, impresoraId: string) {
    const asignacion = await this.prisma.usuarioImpresora.findUnique({
      where: {
        usuario_id_impresora_id: {
          usuario_id: usuarioId,
          impresora_id: impresoraId,
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    return this.prisma.usuarioImpresora.delete({
      where: { id: asignacion.id },
    });
  }

  async obtenerPorCodigo(codigo: string) {
    const impresora = await this.prisma.impresora.findUnique({
      where: { codigo },
      include: {
        campana: { select: { id: true, nombre: true } },
        usuarios: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!impresora) {
      throw new NotFoundException('Código de impresora no válido');
    }

    return impresora;
  }

  async registrarConexion(codigo: string, ip: string, hostname: string) {
    const impresora = await this.obtenerPorCodigo(codigo);

    return this.prisma.impresora.update({
      where: { id: impresora.id },
      data: {
        estado: 'CONECTADA',
        ip_ultima: ip,
        hostname_ultimo: hostname,
        ultima_conexion: new Date(),
      },
    });
  }

  async marcarDesconectada(codigo: string) {
    const impresora = await this.prisma.impresora.findUnique({
      where: { codigo },
    });

    if (impresora) {
      return this.prisma.impresora.update({
        where: { id: impresora.id },
        data: { estado: 'DESCONECTADA' },
      });
    }
  }

  async obtenerImpresoraAsignada(usuarioId: string) {
    const asignacion = await this.prisma.usuarioImpresora.findFirst({
      where: {
        usuario_id: usuarioId,
        es_principal: true,
      },
      include: {
        impresora: true,
      },
    });

    return asignacion?.impresora || null;
  }

  async crearTrabajoImpresion(usuarioId: string, tipo: string, datos: unknown) {
    const asignacion = await this.prisma.usuarioImpresora.findFirst({
      where: {
        usuario_id: usuarioId,
        es_principal: true,
      },
      include: {
        impresora: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException('No tenés una impresora asignada');
    }

    if (asignacion.impresora.estado !== 'CONECTADA') {
      throw new ForbiddenException('La impresora asignada no está conectada');
    }

    return this.prisma.trabajoImpresion.create({
      data: {
        impresora_id: asignacion.impresora.id,
        usuario_id: usuarioId,
        tipo,
        datos: datos as unknown as never,
        estado: 'PENDIENTE',
      },
      include: {
        impresora: true,
      },
    });
  }

  async marcarTrabajoCompletado(trabajoId: string) {
    return this.prisma.trabajoImpresion.update({
      where: { id: trabajoId },
      data: {
        estado: 'COMPLETADO',
        procesado_en: new Date(),
      },
    });
  }

  async marcarTrabajoFallido(trabajoId: string, error: string) {
    return this.prisma.trabajoImpresion.update({
      where: { id: trabajoId },
      data: {
        estado: 'FALLIDO',
        error,
        procesado_en: new Date(),
      },
    });
  }

  async imprimirTicketsPorIds(pasajerosIds: string[], usuarioId: string, campanaIdHeader?: string) {
    const { campanaId } = await this.obtenerContexto(usuarioId, campanaIdHeader);

    const impresoraAsignada = await this.obtenerImpresoraAsignada(usuarioId);

    if (!impresoraAsignada) {
      throw new NotFoundException('No tenés una impresora asignada');
    }

    if (impresoraAsignada.estado !== 'CONECTADA') {
      throw new ForbiddenException('La impresora asignada no está conectada');
    }

    const campana = await this.prisma.campana.findUnique({
      where: { id: campanaId },
    });

    const pasajeros = await this.prisma.pasajeroTransporte.findMany({
      where: { id: { in: pasajerosIds } },
      include: {
        simpatizante: true,
        transportista: true,
      },
    });

    // Preparar trabajos SIN enviar al gateway
    const trabajos: {
      trabajoId: string;
      codigoImpresora: string;
      datos: Record<string, unknown>;
    }[] = [];

    for (const pasajero of pasajeros) {
      const datosTrabajo = {
        campana: campana?.nombre || 'CAMPANA ELECTORAL',
        pasajero: {
          nombre: pasajero.simpatizante?.nombre || '',
          apellido: pasajero.simpatizante?.apellido || '',
          documento: pasajero.simpatizante?.documento || '',
        },
        votacion: {
          local:
            pasajero.simpatizante?.local_votacion_interna ??
            pasajero.simpatizante?.local_votacion_general ??
            '-',
          mesa:
            pasajero.simpatizante?.mesa_votacion_interna ??
            pasajero.simpatizante?.mesa_votacion_general ??
            '-',
          orden:
            pasajero.simpatizante?.orden_votacion_interna ??
            pasajero.simpatizante?.orden_votacion_general ??
            '-',
        },
        transporte: {
          conductor: `${pasajero.transportista?.nombre || ''} ${pasajero.transportista?.apellido || ''}`,
          vehiculo: `${pasajero.transportista?.tipo_vehiculo || ''} - ${pasajero.transportista?.chapa_vehiculo || ''}`,
        },
        hora_recogida: pasajero.hora_recogida
          ? new Date(pasajero.hora_recogida).toLocaleTimeString('es-PY', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
      };

      const trabajo = await this.prisma.trabajoImpresion.create({
        data: {
          impresora_id: impresoraAsignada.id,
          usuario_id: usuarioId,
          tipo: 'TICKET_TRANSPORTE',
          datos: datosTrabajo as unknown as never,
          estado: 'PENDIENTE',
        },
      });

      trabajos.push({
        trabajoId: trabajo.id,
        codigoImpresora: impresoraAsignada.codigo,
        datos: datosTrabajo,
      });
    }

    return {
      trabajos,
      impresoraAsignada,
    };
  }

  async actualizarEstadoTrabajo(trabajoId: string, estado: 'ENVIADO' | 'FALLIDO', error?: string) {
    return this.prisma.trabajoImpresion.update({
      where: { id: trabajoId },
      data: {
        estado,
        error: error || null,
      },
    });
  }
}
