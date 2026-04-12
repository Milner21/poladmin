import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';

@Injectable()
export class SeguimientosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(crearSeguimientoDto: CrearSeguimientoDto, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfil: {
          include: {
            permisos: { include: { permiso: true } },
          },
        },
        permisos_personalizados: { include: { permiso: true } },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: crearSeguimientoDto.simpatizante_id },
    });

    if (!simpatizante) {
      throw new NotFoundException('Simpatizante no encontrado');
    }

    const esRoot = usuario.perfil.nombre === 'ROOT';

    // Verificar que sea de su campaña
    if (!esRoot && simpatizante.campana_id !== usuario.campana_id) {
      throw new ForbiddenException('El simpatizante pertenece a otra campaña');
    }

    // Crear el seguimiento
    const seguimiento = await this.prisma.seguimientoSimpatizante.create({
      data: {
        simpatizante_id: crearSeguimientoDto.simpatizante_id,
        usuario_id: usuarioId,
        tipo_contacto: crearSeguimientoDto.tipo_contacto,
        resultado: crearSeguimientoDto.resultado,
        intencion_voto: crearSeguimientoDto.intencion_voto,
        observaciones: crearSeguimientoDto.observaciones,
      },
    });

    // Si el resultado fue EXITOSO y se calificó la intención, actualizar el simpatizante
    if (
      crearSeguimientoDto.resultado === 'EXITOSO' &&
      crearSeguimientoDto.intencion_voto
    ) {
      const intencionAnterior = simpatizante.intencion_voto;

      await this.prisma.simpatizante.update({
        where: { id: crearSeguimientoDto.simpatizante_id },
        data: {
          intencion_voto: crearSeguimientoDto.intencion_voto,
        },
      });

      // Auditoría del cambio de intención
      await this.auditoriaService.registrar({
        usuarioId,
        accion: 'EDITAR',
        modulo: 'SIMPATIZANTES',
        entidadId: crearSeguimientoDto.simpatizante_id,
        entidadTipo: 'Simpatizante',
        datosAntes: { intencion_voto: intencionAnterior },
        datosDespues: { intencion_voto: crearSeguimientoDto.intencion_voto },
      });
    }

    // Auditoría del seguimiento
    await this.auditoriaService.registrar({
      usuarioId,
      accion: 'CREAR',
      modulo: 'SIMPATIZANTES',
      entidadId: seguimiento.id,
      entidadTipo: 'Seguimiento',
      datosDespues: {
        tipo_contacto: seguimiento.tipo_contacto,
        resultado: seguimiento.resultado,
        intencion_voto: seguimiento.intencion_voto || undefined,
      },
    });

    return seguimiento;
  }

  async obtenerPorSimpatizante(simpatizanteId: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const simpatizante = await this.prisma.simpatizante.findUnique({
      where: { id: simpatizanteId },
    });

    if (!simpatizante) {
      throw new NotFoundException('Simpatizante no encontrado');
    }

    const esRoot = usuario.perfil.nombre === 'ROOT';

    if (!esRoot && simpatizante.campana_id !== usuario.campana_id) {
      throw new ForbiddenException('El simpatizante pertenece a otra campaña');
    }

    // Obtener seguimientos con info del usuario que contactó
    const seguimientos = await this.prisma.seguimientoSimpatizante.findMany({
      where: { simpatizante_id: simpatizanteId },
      orderBy: { fecha_contacto: 'desc' },
    });

    // Obtener info de cada usuario que contactó
    const seguimientosConUsuario = await Promise.all(
      seguimientos.map(async (seg) => {
        const usuarioContacto = await this.prisma.usuario.findUnique({
          where: { id: seg.usuario_id },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        });

        return {
          ...seg,
          usuario: usuarioContacto,
        };
      }),
    );

    return seguimientosConUsuario;
  }

  async obtenerEstadisticas(campanaId: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const esRoot = usuario.perfil.nombre === 'ROOT';
    const campanaFinal = esRoot ? campanaId : usuario.campana_id;

    if (!campanaFinal) {
      throw new ForbiddenException('No pertenecés a ninguna campaña');
    }

    // Total de simpatizantes
    const totalSimpatizantes = await this.prisma.simpatizante.count({
      where: { campana_id: campanaFinal, eliminado: false },
    });

    // Simpatizantes contactados (que tienen al menos 1 seguimiento)
    const contactados = await this.prisma.seguimientoSimpatizante.groupBy({
      by: ['simpatizante_id'],
      where: {
        simpatizante: {
          campana_id: campanaFinal,
          eliminado: false,
        },
      },
    });

    // Total de seguimientos hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const seguimientosHoy = await this.prisma.seguimientoSimpatizante.count({
      where: {
        fecha_contacto: { gte: hoy },
        simpatizante: {
          campana_id: campanaFinal,
          eliminado: false,
        },
      },
    });

    // Seguimientos por resultado
    const porResultado = await this.prisma.seguimientoSimpatizante.groupBy({
      by: ['resultado'],
      where: {
        simpatizante: {
          campana_id: campanaFinal,
          eliminado: false,
        },
      },
      _count: { id: true },
    });

    return {
      total_simpatizantes: totalSimpatizantes,
      total_contactados: contactados.length,
      pendientes_contacto: totalSimpatizantes - contactados.length,
      seguimientos_hoy: seguimientosHoy,
      por_resultado: porResultado.map((r) => ({
        resultado: r.resultado,
        cantidad: r._count.id,
      })),
    };
  }
}