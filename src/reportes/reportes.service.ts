import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // Verificar acceso del usuario
  private async verificarAcceso(usuarioId: string, campanaId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const esRoot = usuario.perfil.nombre === 'ROOT';

    if (!esRoot && usuario.campana_id !== campanaId) {
      throw new UnauthorizedException('No tenés acceso a esta campaña');
    }

    return { usuario, esRoot };
  }

  private async obtenerRedJerarquica(actorId: string, campanaId: string): Promise<string[]> {
    const obtenerRecursivo = async (ids: string[]): Promise<string[]> => {
      const subordinados = await this.prisma.usuario.findMany({
        where: {
          candidato_superior_id: { in: ids },
          eliminado: false,
          campana_id: campanaId,
        },
        select: { id: true },
      });

      if (!subordinados.length) return ids;

      const nuevosIds = subordinados.map((s) => s.id).filter((id) => !ids.includes(id));

      if (!nuevosIds.length) return ids;

      return obtenerRecursivo([...ids, ...nuevosIds]);
    };

    return obtenerRecursivo([actorId]);
  }

  // === REPORTE: CAPTACIÓN DE SIMPATIZANTES ===
  async reporteCaptacion(usuarioId: string, filtros: FiltrosReporteDto) {
    const campanaId = filtros.campana_id;
    if (!campanaId) {
      throw new UnauthorizedException('Debe especificar una campaña');
    }

    await this.verificarAcceso(usuarioId, campanaId);

    // Construir filtro de fechas
    const fechaDesde = filtros.fecha_desde ? new Date(filtros.fecha_desde) : undefined;
    const fechaHasta = filtros.fecha_hasta ? new Date(filtros.fecha_hasta) : undefined;

    // Obtener simpatizantes del período
    const simpatizantes = await this.prisma.simpatizante.findMany({
      where: {
        campana_id: campanaId,
        eliminado: false,
        ...(fechaDesde && { fecha_registro: { gte: fechaDesde } }),
        ...(fechaHasta && { fecha_registro: { lte: fechaHasta } }),
        ...(filtros.departamento && { departamento: filtros.departamento }),
        ...(filtros.distrito && { distrito: filtros.distrito }),
        ...(filtros.barrio && { barrio: filtros.barrio }),
        ...(filtros.candidato_id && { candidato_id: filtros.candidato_id }),
        ...(filtros.lider_id && { lider_id: filtros.lider_id }),
      },
      select: {
        id: true,
        fecha_registro: true,
        departamento: true,
        distrito: true,
        barrio: true,
        es_afiliado: true,
        intencion_voto: true,
      },
    });

    // Agrupar por día
    const agrupacion = filtros.agrupacion || 'dia';
    const grupos = this.agruparPorPeriodo(simpatizantes, agrupacion);

    // Calcular estadísticas
    const total = simpatizantes.length;
    const afiliados = simpatizantes.filter((s) => s.es_afiliado).length;
    const seguros = simpatizantes.filter((s) => s.intencion_voto === 'SEGURO').length;

    return {
      periodo: grupos,
      total_periodo: total,
      total_afiliados: afiliados,
      total_seguros: seguros,
      porcentaje_afiliados: total > 0 ? ((afiliados / total) * 100).toFixed(2) : 0,
      porcentaje_seguros: total > 0 ? ((seguros / total) * 100).toFixed(2) : 0,
    };
  }

  // === REPORTE: MAPA DE CALOR (Datos para el mapa) ===
  async reporteMapaCalor(usuarioId: string, filtros: FiltrosReporteDto) {
    const campanaId = filtros.campana_id;
    if (!campanaId) {
      throw new UnauthorizedException('Debe especificar una campaña');
    }

    const { esRoot } = await this.verificarAcceso(usuarioId, campanaId);

    let redIds: string[] | null = null;

    if (!esRoot) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          candidato_superior_id: true,
          perfil: { select: { es_operativo: true } },
        },
      });

      const esOperativo = usuario?.perfil?.es_operativo ?? false;
      const actorId = esOperativo ? (usuario?.candidato_superior_id ?? usuarioId) : usuarioId;

      redIds = await this.obtenerRedJerarquica(actorId, campanaId);

      console.log('UsuarioId:', usuarioId);
      console.log('CampanaId:', campanaId);
      console.log('EsRoot:', esRoot);
      console.log('RedIds:', redIds);
    }

    const filtroBase = {
      campana_id: campanaId,
      eliminado: false,
      ...(redIds ? { registrado_por_id: { in: redIds } } : {}),
      ...(filtros.departamento && { departamento: filtros.departamento }),
      ...(filtros.distrito && { distrito: filtros.distrito }),
      ...(filtros.barrio && { barrio: filtros.barrio }),
    };

    const simpatizantes = await this.prisma.simpatizante.findMany({
      where: {
        ...filtroBase,
        latitud: { not: null },
        longitud: { not: null },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        latitud: true,
        longitud: true,
        barrio: true,
        intencion_voto: true,
        es_afiliado: true,
        necesita_transporte: true,
      },
    });

    const densidadPorBarrio = await this.prisma.simpatizante.groupBy({
      by: ['barrio'],
      where: {
        ...filtroBase,
        barrio: { not: null },
      },
      _count: { id: true },
    });

    const totalSimpatizantes = await this.prisma.simpatizante.count({
      where: filtroBase,
    });

    return {
      puntos: simpatizantes,
      densidad_por_barrio: densidadPorBarrio.map((d) => ({
        barrio: d.barrio,
        cantidad: d._count.id,
      })),
      estadisticas: {
        total: totalSimpatizantes,
        con_gps: simpatizantes.length,
        sin_gps: totalSimpatizantes - simpatizantes.length,
        porcentaje_con_gps:
          totalSimpatizantes > 0
            ? ((simpatizantes.length / totalSimpatizantes) * 100).toFixed(2)
            : '0',
      },
    };
  }

  // === REPORTE: TOP REGISTRADORES ===
  async reporteTopRegistradores(usuarioId: string, filtros: FiltrosReporteDto) {
    const campanaId = filtros.campana_id;
    if (!campanaId) {
      throw new UnauthorizedException('Debe especificar una campaña');
    }

    await this.verificarAcceso(usuarioId, campanaId);

    const fechaDesde = filtros.fecha_desde ? new Date(filtros.fecha_desde) : undefined;
    const fechaHasta = filtros.fecha_hasta ? new Date(filtros.fecha_hasta) : undefined;

    const registros = await this.prisma.simpatizante.groupBy({
      by: ['registrado_por_id'],
      where: {
        campana_id: campanaId,
        eliminado: false,
        ...(fechaDesde && { fecha_registro: { gte: fechaDesde } }),
        ...(fechaHasta && { fecha_registro: { lte: fechaHasta } }),
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Obtener info de cada usuario
    const topConInfo = await Promise.all(
      registros.map(async (r) => {
        const usuario = await this.prisma.usuario.findUnique({
          where: { id: r.registrado_por_id },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            perfil: {
              select: {
                nombre: true,
              },
            },
            nivel: {
              select: {
                nombre: true,
                orden: true,
              },
            },
          },
        });

        return {
          usuario,
          cantidad: r._count.id,
        };
      }),
    );

    return topConInfo;
  }

  // Helper: Agrupar por período
  private agruparPorPeriodo(
    simpatizantes: Array<{ fecha_registro: Date }>,
    agrupacion: 'dia' | 'semana' | 'mes',
  ) {
    const grupos: Record<string, number> = {};

    simpatizantes.forEach((s) => {
      const fecha = new Date(s.fecha_registro);
      let clave: string;

      if (agrupacion === 'dia') {
        clave = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (agrupacion === 'semana') {
        const inicioSemana = new Date(fecha);
        inicioSemana.setDate(fecha.getDate() - fecha.getDay());
        clave = inicioSemana.toISOString().split('T')[0];
      } else {
        clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      }

      grupos[clave] = (grupos[clave] || 0) + 1;
    });

    return Object.entries(grupos)
      .map(([fecha, cantidad]) => ({ fecha, cantidad }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
}
