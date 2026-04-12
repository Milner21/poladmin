import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AsistenciaPorEventoItemDto } from './dto/asistencias-por-evento.dto';
import { DistribucionRedItemDto } from './dto/distribucion-red.dto';
import { EstadisticasDto } from './dto/estadisticas.dto';
import { EventoRecienteItemDto } from './dto/eventos-recientes.dto';
import { SimpatizanteEvolucionItemDto } from './dto/simpatizantes-evolucion.dto';
import { SimpatizantesEvolucionDiariaDto } from './dto/simpatizantes-evolucion-diaria.dto';
import { Top10RegistrosDto } from './dto/top-10-registros.dto';

type FiltroSimpatizante = Prisma.SimpatizanteWhereInput;
type FiltroEvento = Prisma.EventoWhereInput;
type FiltroAsistencia = Prisma.AsistenciaWhereInput;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // 1) Obtener red jerárquica (incluye al usuario)
  async obtenerRedJerarquica(usuarioId: string): Promise<string[]> {
    const red: string[] = [];
    red.push(usuarioId);

    // Recursivo: buscar subordinados directos y seguir
    const obtenerSubordinados = async (ids: string[]) => {
      if (!ids.length) return;
      const subordinados = await this.prisma.usuario.findMany({
        where: { candidato_superior_id: { in: ids } },
        select: { id: true },
      });
      const nuevos = subordinados.map((s) => s.id).filter((id) => !red.includes(id));
      if (!nuevos.length) return;
      red.push(...nuevos);
      await obtenerSubordinados(nuevos);
    };

    await obtenerSubordinados([usuarioId]);
    return red;
  }

  // 2) Rango semana (semana que contiene la fecha, lunes->domingo)
  private obtenerRangoSemana(fecha: Date): { inicio: Date; fin: Date } {
    const copia = new Date(fecha);
    copia.setHours(0, 0, 0, 0);
    const dia = copia.getDay(); // 0 domingo ... 6 sábado
    const offsetLunes = dia === 0 ? 6 : dia - 1;
    const inicio = new Date(copia);
    inicio.setDate(copia.getDate() - offsetLunes);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    return { inicio, fin };
  }

  private obtenerRangoSemanaAnterior(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const { inicio } = this.obtenerRangoSemana(hoy);
    const inicioAnterior = new Date(inicio);
    inicioAnterior.setDate(inicio.getDate() - 7);
    inicioAnterior.setHours(0, 0, 0, 0);

    const finAnterior = new Date(inicio);
    finAnterior.setDate(inicio.getDate() - 1);
    finAnterior.setHours(23, 59, 59, 999);

    return { inicio: inicioAnterior, fin: finAnterior };
  }

  // Helper: devuelve inicio y fin (Date) de la semana que contiene `fecha` (lunes->domingo)
  private rangoSemanaPorFecha(fecha: Date): { inicio: Date; fin: Date } {
    const copia = new Date(fecha);
    copia.setHours(0, 0, 0, 0);
    const dia = copia.getDay(); // 0 domingo
    const offsetLunes = dia === 0 ? 6 : dia - 1;
    const inicio = new Date(copia);
    inicio.setDate(copia.getDate() - offsetLunes);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    return { inicio, fin };
  }

  // Helper: etiqueta de semana en formato YYYY-WW (a modo informativo)
  private etiquetaSemana(inicio: Date): string {
    // Obtener año y número de semana ISO simple
    const fecha = new Date(inicio);
    // Ajuste para cálculo de semana ISO (Mon-based)
    const tmp = new Date(fecha.getTime());
    tmp.setHours(0, 0, 0, 0);
    // Thursday in current week decides year
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    const semanaNum =
      1 +
      Math.round(
        ((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
      );
    return `${tmp.getFullYear()}-W${String(semanaNum).padStart(2, '0')}`;
  }

  // Totales de la semana actual (domingo -> día actual) ---
  async obtenerTotalesSemanaActual(red_ids: string[] | null, es_admin: boolean) {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // 0 es domingo
    inicioSemana.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy); // El día actual es el fin del rango
    finDia.setHours(23, 59, 59, 999);

    // --- Simpatizantes de la semana ---
    const filtro_simpatizante_semana: FiltroSimpatizante = {
      fecha_registro: { gte: inicioSemana, lte: finDia },
      ...(es_admin ? {} : { candidato_id: { in: red_ids! }, eliminado: false }),
    };

    const total_simpatizantes_semana = await this.prisma.simpatizante.count({
      where: filtro_simpatizante_semana,
    });

    return {
      total_simpatizantes_semana,
    };
  }

  // 4) Totales semana anterior
  async obtenerTotalesSemanaAnterior(redIds: string[] | null, esAdmin: boolean) {
    const { inicio, fin } = this.obtenerRangoSemanaAnterior();

    // --- Simpatizantes ---
    const filtroSimpatizante: FiltroSimpatizante = {
      fecha_registro: { gte: inicio, lte: fin },
      ...(esAdmin ? {} : { candidato_id: { in: redIds! }, eliminado: false }),
    };

    const total_simpatizantes = await this.prisma.simpatizante.count({
      where: filtroSimpatizante,
    });

    // --- Eventos ---
    const filtroEvento: FiltroEvento = {
      fecha_registro: { gte: inicio, lte: fin },
      ...(esAdmin ? {} : { creado_por_id: { in: redIds! }, eliminado: false }),
    };

    const total_eventos = await this.prisma.evento.count({
      where: filtroEvento,
    });

    // --- Asistencias ---
    const filtroAsistencia: FiltroAsistencia = {
      fecha_hora_registro: { gte: inicio, lte: fin },
      ...(esAdmin ? {} : { evento: { creado_por_id: { in: redIds! } } }),
    };

    const total_asistencias = await this.prisma.asistencia.count({
      where: filtroAsistencia,
    });

    const total_mi_red = esAdmin ? await this.prisma.usuario.count() : redIds!.length;

    return { total_simpatizantes, total_eventos, total_asistencias, total_mi_red };
  }

  // --- NUEVA FUNCIÓN: Totales del mes actual (1ro del mes -> día actual) ---
  async obtenerTotalesMesActual(red_ids: string[] | null, es_admin: boolean) {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1); // 1ro del mes actual
    inicioMes.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy); // El día actual es el fin del rango
    finDia.setHours(23, 59, 59, 999);

    // --- Simpatizantes del mes ---
    const filtro_simpatizante_mes: FiltroSimpatizante = {
      fecha_registro: { gte: inicioMes, lte: finDia },
      ...(es_admin ? {} : { candidato_id: { in: red_ids! }, eliminado: false }),
    };

    const total_simpatizantes_mes = await this.prisma.simpatizante.count({
      where: filtro_simpatizante_mes,
    });

    return {
      total_simpatizantes_mes,
    };
  }

  async obtenerTotalesDiaActual(red_ids: string[] | null, es_admin: boolean) {
    const hoy = new Date();
    const inicioDia = new Date(hoy);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);

    // --- Simpatizantes del día ---
    const filtro_simpatizante_dia: FiltroSimpatizante = {
      fecha_registro: { gte: inicioDia, lte: finDia },
      ...(es_admin ? {} : { candidato_id: { in: red_ids! }, eliminado: false }),
    };

    const total_simpatizantes_dia = await this.prisma.simpatizante.count({
      where: filtro_simpatizante_dia,
    });

    // Puedes agregar eventos, asistencias, etc. si lo necesitas para otros campos
    // Por ahora, solo devolvemos simpatizantes
    return {
      total_simpatizantes_dia,
    };
  }

  // --- NUEVA FUNCIÓN: Totales acumulados (sin filtro de fecha) ---
  async obtenerTotalesAcumulados(red_ids: string[] | null, es_admin: boolean) {
    // --- Simpatizantes ---
    const filtro_simpatizante_total: FiltroSimpatizante = {
      ...(es_admin ? {} : { candidato_id: { in: red_ids! }, eliminado: false }),
    };

    const total_simpatizantes_acumulado = await this.prisma.simpatizante.count({
      where: filtro_simpatizante_total,
    });

    // --- Eventos Confirmados ---
    const filtro_evento_confirmado: FiltroEvento = {
      ...(es_admin ? {} : { creado_por_id: { in: red_ids! }, eliminado: false }),
      estado: 'CONFIRMADO', // <-- Valor correcto
    };

    const total_eventos_confirmados = await this.prisma.evento.count({
      where: filtro_evento_confirmado,
    });

    // --- Eventos No Confirmados (Planificado, Cancelado, Postergado) ---
    const filtro_evento_no_confirmado: FiltroEvento = {
      ...(es_admin ? {} : { creado_por_id: { in: red_ids! }, eliminado: false }),
      estado: { not: 'CONFIRMADO' }, // <-- Valor correcto
    };

    const total_eventos_no_confirmados = await this.prisma.evento.count({
      where: filtro_evento_no_confirmado,
    });

    // --- Asistencias Confirmadas (asistieron) ---
    const filtro_asistencia_confirmada: FiltroAsistencia = {
      ...(es_admin ? {} : { evento: { creado_por_id: { in: red_ids! } } }),
      asistio: true, // Asumiendo que tienes un campo booleano 'asistio' en Asistencia
    };

    const total_asistencias_confirmadas = await this.prisma.asistencia.count({
      where: filtro_asistencia_confirmada,
    });

    // --- Asistencias Ausencias (no asistieron) ---
    const filtro_asistencia_ausente: FiltroAsistencia = {
      ...(es_admin ? {} : { evento: { creado_por_id: { in: red_ids! } } }),
      asistio: false, // Asumiendo que tienes un campo booleano 'asistio' en Asistencia
    };

    const total_asistencias_ausencias = await this.prisma.asistencia.count({
      where: filtro_asistencia_ausente,
    });

    // --- Total Mi Red ---
    const total_mi_red = es_admin
      ? await this.prisma.usuario.count()
      : red_ids && red_ids.length > 0
        ? red_ids.length - 1
        : 0;

    return {
      total_simpatizantes_acumulado,
      total_eventos_confirmados,
      total_eventos_no_confirmados,
      total_asistencias_confirmadas,
      total_asistencias_ausencias,
      total_mi_red,
    };
  }

  // 5) Calcular % cambio con protección contra division by zero
  private calcularPorcentajeCambio(actual: number, anterior: number): number {
    if (anterior === 0) {
      return actual > 0 ? 100 : 0;
    }
    const valor = ((actual - anterior) / anterior) * 100;
    return parseFloat(valor.toFixed(1));
  }

  // 6) Método público que devuelve el DTO final
  async obtenerEstadisticas(usuarioId: string): Promise<EstadisticasDto> {
    try {
      // Obtener el nivel del usuario actual
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          perfil: {
            select: { nombre: true },
          },
        },
      });

      // ROOT tiene acceso total
      const es_admin_total = usuario?.perfil?.nombre === 'ROOT';

      let totales_acumulados, totales_dia_actual, totales_semana_actual, totales_mes_actual;

      if (es_admin_total) {
        // Para administradores totales
        totales_acumulados = await this.obtenerTotalesAcumulados(null, true);
        totales_dia_actual = await this.obtenerTotalesDiaActual(null, true);
        totales_semana_actual = await this.obtenerTotalesSemanaActual(null, true);
        totales_mes_actual = await this.obtenerTotalesMesActual(null, true);
      } else {
        // Para usuarios no administradores
        const redIds = await this.obtenerRedJerarquica(usuarioId);
        totales_acumulados = await this.obtenerTotalesAcumulados(redIds, false);
        totales_dia_actual = await this.obtenerTotalesDiaActual(redIds, false);
        totales_semana_actual = await this.obtenerTotalesSemanaActual(redIds, false);
        totales_mes_actual = await this.obtenerTotalesMesActual(redIds, false);
      }

      // Calcular porcentaje de asistencia
      // Tipamos las variables para evitar 'any'
      const totalAsistenciasPosibles: number =
        totales_acumulados.total_asistencias_confirmadas +
        totales_acumulados.total_asistencias_ausencias;
      const porcentajeAsistencia: number =
        totalAsistenciasPosibles > 0
          ? (totales_acumulados.total_asistencias_confirmadas / totalAsistenciasPosibles) * 100
          : 0;

      const dto: EstadisticasDto = {
        total_simpatizantes_hoy: totales_dia_actual.total_simpatizantes_dia,
        total_simpatizantes_semana: totales_semana_actual.total_simpatizantes_semana,
        total_simpatizantes_mes: totales_mes_actual.total_simpatizantes_mes,
        total_simpatizantes: totales_acumulados.total_simpatizantes_acumulado,
        total_eventos_confirmados: totales_acumulados.total_eventos_confirmados,
        total_eventos_no_confirmados: totales_acumulados.total_eventos_no_confirmados,
        total_asistencias_confirmadas: totales_acumulados.total_asistencias_confirmadas,
        total_asistencias_ausencias: totales_acumulados.total_asistencias_ausencias,
        porcentaje_asistencia: parseFloat(porcentajeAsistencia.toFixed(2)), // Redondear a 2 decimales
        total_mi_red: totales_acumulados.total_mi_red,
      };

      return dto;
    } catch (error) {
      // Puedes agregar logger aquí si querés
      console.error('Error en obtenerEstadisticas:', error); // Agregar log para debug
      throw new InternalServerErrorException('Error calculando estadísticas');
    }
  }

  /**
   * Obtener evolución semanal de simpatizantes para las últimas N semanas.
   * Devuelve array ordenado de más antiguo a más reciente.
   */
  async obtenerEvolucionSimpatizantesSemanal(
    usuarioId: string,
    semanas = 6,
  ): Promise<SimpatizanteEvolucionItemDto[]> {
    // límite razonable
    const MAX_SEMANAS = 52;
    const n = Math.min(Math.max(semanas, 1), MAX_SEMANAS);

    // 1) construir red jerárquica
    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 2) calcular semanas: desde (n-1) semanas antes hasta semana actual
    const hoy = new Date();
    const { inicio: inicioSemanaActual } = this.rangoSemanaPorFecha(hoy);

    // prepararnos para generar rangos
    const semanasArray: { inicio: Date; fin: Date }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const inicio = new Date(inicioSemanaActual);
      inicio.setDate(inicioSemanaActual.getDate() - i * 7);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      semanasArray.push({ inicio, fin });
    }

    // 3) Ejecutar conteos por semana (en paralelo)
    const promises = semanasArray.map(({ inicio, fin }) =>
      this.prisma.simpatizante.count({
        where: {
          candidato_id: { in: redIds },
          fecha_registro: { gte: inicio, lte: fin },
          eliminado: false,
        },
      }),
    );

    const totals = await Promise.all(promises);

    // 4) Armar array de DTOs (ordenado antiguo->reciente)
    const resultado: SimpatizanteEvolucionItemDto[] = semanasArray.map(({ inicio, fin }, idx) => {
      const etiqueta = this.etiquetaSemana(inicio);
      return {
        semana: etiqueta,
        semana_inicio: inicio.toISOString(),
        semana_fin: fin.toISOString(),
        total: totals[idx] ?? 0,
      };
    });

    return resultado;
  }

  async obtenerEvolucionSimpatizantesDiaria(
    usuarioId: string,
    dias = 7,
  ): Promise<SimpatizantesEvolucionDiariaDto[]> {
    const MAX_DIAS = 365;
    const n = Math.min(Math.max(dias, 1), MAX_DIAS);

    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 2) calcular días: desde (n-1) días antes hasta hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Asegurar inicio del día

    // prepararnos para generar rangos diarios
    const diasArray: { inicio: Date; fin: Date }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - i);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio);
      fin.setHours(23, 59, 59, 999);
      diasArray.push({ inicio, fin });
    }

    //Ejecutar conteos por día (en paralelo)
    const promises = diasArray.map(({ inicio, fin }) =>
      this.prisma.simpatizante.count({
        where: {
          candidato_id: { in: redIds },
          fecha_registro: { gte: inicio, lte: fin }, // Filtrar por día
          eliminado: false,
        },
      }),
    );

    const totals = await Promise.all(promises);

    // Armar array de DTOs (ordenado antiguo->reciente)
    const resultado: SimpatizantesEvolucionDiariaDto[] = diasArray.map(({ inicio, fin }, idx) => {
      // Formatear la fecha como string YYYY-MM-DD para el DTO
      const fechaStr = inicio.toISOString().split('T')[0]; // 'YYYY-MM-DD'

      return {
        dia: fechaStr,
        dia_inicio: inicio.toISOString(),
        dia_fin: fin.toISOString(),
        total: totals[idx] ?? 0,
      };
    });

    return resultado;
  }

  /**
   * Obtener asistencias agrupadas por evento para la red del usuario.
   * order: 'mas_asistencias' | 'recientes'
   */
  async obtenerAsistenciasPorEvento(
    usuarioId: string,
    limit = 10,
    order: 'mas_asistencias' | 'recientes' = 'mas_asistencias',
  ): Promise<AsistenciaPorEventoItemDto[]> {
    const LIMITE_MAX = 50;
    const top = Math.min(Math.max(limit, 1), LIMITE_MAX);

    // 1) obtener ids de la red
    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 2) construir orden
    let orderBy: any;
    if (order === 'recientes') {
      orderBy = { fecha_hora_inicio: 'desc' };
    } else {
      // order === 'mas_asistencias'
      // Usamos orderBy por conteo de asistencias si Prisma lo permite
      orderBy = [{ asistencias: { _count: 'desc' } }, { fecha_hora_inicio: 'desc' }];
    }

    // 3) buscar eventos creados por usuarios de la red y traer el _count de asistencias
    const eventos = await this.prisma.evento.findMany({
      where: {
        creado_por_id: { in: redIds },
        eliminado: false,
      },
      take: top,
      orderBy,
      select: {
        id: true,
        titulo: true,
        fecha_hora_inicio: true,
        _count: {
          select: { asistencias: true },
        },
      },
    });

    // 4) mapear al DTO esperado (fecha en YYYY-MM-DD)
    const resultado: AsistenciaPorEventoItemDto[] = eventos.map((e) => {
      const fechaISO = e.fecha_hora_inicio
        ? new Date(e.fecha_hora_inicio).toISOString().slice(0, 10)
        : 'N/A';
      return {
        evento_id: e.id,
        evento_nombre: e.titulo,
        total_asistencias: e._count?.asistencias ?? 0,
        fecha_evento: fechaISO,
      };
    });

    return resultado;
  }

  //Devuelve la distribución de usuarios en la red por perfil.
  async obtenerDistribucionRed(usuarioId: string): Promise<DistribucionRedItemDto[]> {
    // 1) obtener ids de la red
    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 2) Agrupar usuarios por perfil_id y contar
    // Usamos groupBy para obtener conteos por perfil
    const agrupado = await this.prisma.usuario.groupBy({
      by: ['perfil_id'],
      where: {
        id: { in: redIds },
        eliminado: false,
      },
      _count: {
        perfil_id: true,
      },
    });

    if (!agrupado.length) return [];

    // 3) Obtener los perfiles relacionados para mapear nombres
    const perfilIds = agrupado.map((a) => a.perfil_id);
    const perfiles = await this.prisma.perfil.findMany({
      where: { id: { in: perfilIds } },
      select: { id: true, nombre: true },
    });

    const perfilesMap = new Map(perfiles.map((p) => [p.id, p.nombre]));

    // 4) Mapear al DTO
    const resultado: DistribucionRedItemDto[] = agrupado.map((item) => {
      const perfilNombre = perfilesMap.get(item.perfil_id) ?? 'UNKNOWN';
      return {
        rol: perfilNombre,
        rol_nombre: perfilNombre, // usamos el mismo nombre (no inventamos nombres amigables)
        total: item._count?.perfil_id ?? 0,
      };
    });

    // 5) Opcional: ordenar por total descendente
    resultado.sort((a, b) => b.total - a.total);

    return resultado;
  }

  async obtenerEventosRecientes(usuarioId: string, limit = 5): Promise<EventoRecienteItemDto[]> {
    const LIMITE_MAX = 50;
    const top = Math.min(Math.max(limit, 1), LIMITE_MAX);

    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 1) Traer eventos SIN la relación creado_por (no existe en schema)
    const eventos = await this.prisma.evento.findMany({
      where: {
        creado_por_id: { in: redIds },
        eliminado: false,
      },
      take: top,
      orderBy: { fecha_registro: 'desc' },
      select: {
        id: true,
        titulo: true,
        direccion: true,
        fecha_hora_inicio: true,
        fecha_registro: true,
        creado_por_id: true,
        _count: {
          select: { asistencias: true },
        },
      },
    });

    // 2) Obtener los IDs únicos de creadores
    const creadoreIds = [...new Set(eventos.map((e) => e.creado_por_id))];

    // 3) Buscar los usuarios creadores en una sola query
    const creadores = await this.prisma.usuario.findMany({
      where: { id: { in: creadoreIds } },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        perfil: {
          select: { nombre: true },
        },
      },
    });

    // 4) Construir un Map para acceso O(1)
    const creadoresMap = new Map(creadores.map((u) => [u.id, u]));

    // 5) Mapear al DTO
    const resultado: EventoRecienteItemDto[] = eventos.map((e) => {
      const fh = e.fecha_hora_inicio ? new Date(e.fecha_hora_inicio).toISOString() : null;
      const fecha = fh ? fh.slice(0, 10) : 'N/A';
      const hora = fh ? fh.slice(11, 16) : 'N/A';

      const creador = creadoresMap.get(e.creado_por_id);

      return {
        id: e.id,
        nombre: e.titulo,
        lugar: e.direccion ?? '',
        fecha,
        hora,
        total_asistencias: e._count?.asistencias ?? 0,
        creado_por: {
          id: creador?.id ?? 'UNKNOWN',
          nombre: creador?.nombre ?? '',
          apellido: creador?.apellido ?? '',
          rol: creador?.perfil?.nombre ?? 'UNKNOWN',
        },
        fecha_registro: e.fecha_registro ? new Date(e.fecha_registro).toISOString() : '',
      };
    });

    return resultado;
  }

  async obtenerTop10Registros(usuarioId: string): Promise<Top10RegistrosDto[]> {
    const redIds = await this.obtenerRedJerarquica(usuarioId);

    // 1) Agrupar simpatizantes por registrado_por_id y contar
    // (la relación no existe en schema, usamos groupBy en Simpatizante)
    const conteos = await this.prisma.simpatizante.groupBy({
      by: ['registrado_por_id'],
      where: {
        registrado_por_id: { in: redIds },
        eliminado: false,
      },
      _count: {
        registrado_por_id: true,
      },
      orderBy: {
        _count: {
          registrado_por_id: 'desc',
        },
      },
      take: 10,
    });

    if (!conteos.length) return [];

    // 2) Obtener los IDs de los registradores
    const registradoresIds = conteos.map((c) => c.registrado_por_id);

    // 3) Buscar los usuarios en una sola query
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        id: { in: registradoresIds },
        eliminado: false,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        perfil: {
          select: { nombre: true },
        },
      },
    });

    // 4) Map para acceso O(1)
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));

    // 5) Mapear respetando el orden del groupBy (ya viene ordenado por conteo desc)
    const resultado: Top10RegistrosDto[] = conteos.map((c) => {
      const usuario = usuariosMap.get(c.registrado_por_id);
      return {
        id: c.registrado_por_id,
        nombre: usuario?.nombre ?? 'UNKNOWN',
        apellido: usuario?.apellido ?? '',
        perfil: usuario?.perfil?.nombre ?? 'UNKNOWN',
        total_simpatizantes_registrados: c._count?.registrado_por_id ?? 0,
      };
    });

    return resultado;
  }

  async obtenerIntencionVoto(usuarioId: string): Promise<{
    seguro: number;
    probable: number;
    indeciso: number;
    contrario: number;
    total: number;
  }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { perfil: { select: { nombre: true } } },
    });

    const esRoot = usuario?.perfil?.nombre === 'ROOT';

    const where = esRoot
      ? { eliminado: false }
      : { eliminado: false, registrado_por_id: { in: await this.obtenerRedJerarquica(usuarioId) } };

    const [seguro, probable, indeciso, contrario] = await Promise.all([
      this.prisma.simpatizante.count({ where: { ...where, intencion_voto: 'SEGURO' } }),
      this.prisma.simpatizante.count({ where: { ...where, intencion_voto: 'PROBABLE' } }),
      this.prisma.simpatizante.count({ where: { ...where, intencion_voto: 'INDECISO' } }),
      this.prisma.simpatizante.count({ where: { ...where, intencion_voto: 'CONTRARIO' } }),
    ]);

    return {
      seguro,
      probable,
      indeciso,
      contrario,
      total: seguro + probable + indeciso + contrario,
    };
  }
}
