import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResultadoPadronDto } from './dto/resultado-padron.dto';
import * as XLSX from 'xlsx';

type TipoPadron = 'INTERNO' | 'GENERAL';

interface FilaPadronInterno {
  CI: string | number;
  NOMBRE: string;
  APELLIDO: string;
  FECHA_NACIMIENTO?: string;
  DEPARTAMENTO?: string;
  DISTRITO?: string;
  SECCIONAL?: string;
  LOCAL_VOTACION?: string;
  MESA?: string;
  ORDEN?: string;
}

interface FilaPadronGeneral {
  CI: string | number;
  NOMBRE: string;
  APELLIDO: string;
  FECHA_NACIMIENTO?: string;
  DEPARTAMENTO?: string;
  DISTRITO?: string;
  LOCAL_VOTACION?: string;
  MESA?: string;
  ORDEN?: string;
}

@Injectable()
export class PadronService {
  constructor(private readonly prisma: PrismaService) {}

  private validarColumnas(columnasArchivo: string[], columnasRequeridas: string[]): string[] {
    return columnasRequeridas.filter((col) => !columnasArchivo.includes(col));
  }

  async cargarExcel(
    archivo: Express.Multer.File,
    tipo: TipoPadron,
    usuarioId: string,
    partidoId?: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');
    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede cargar padrones');
    }

    if (tipo === 'INTERNO' && !partidoId) {
      throw new BadRequestException('Debe especificar el partido para cargar un padron interno');
    }

    if (tipo === 'INTERNO' && partidoId) {
      const partido = await this.prisma.partido.findUnique({
        where: { id: partidoId },
      });
      if (!partido) throw new NotFoundException('Partido no encontrado');
    }

    const workbook = XLSX.read(archivo.buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja, { defval: '' }) as Record<
      string,
      string | number
    >[];

    if (!filas.length) {
      throw new BadRequestException('El archivo Excel esta vacio');
    }

    const columnasArchivo = Object.keys(filas[0]).map((c) => c.trim().toUpperCase());

    const columnasInterno = [
      'CI',
      'NOMBRE',
      'APELLIDO',
      'FECHA_NACIMIENTO',
      'DEPARTAMENTO',
      'DISTRITO',
      'SECCIONAL',
      'LOCAL_VOTACION',
      'MESA',
      'ORDEN',
    ];

    const columnasGeneral = [
      'CI',
      'NOMBRE',
      'APELLIDO',
      'FECHA_NACIMIENTO',
      'DEPARTAMENTO',
      'DISTRITO',
      'LOCAL_VOTACION',
      'MESA',
      'ORDEN',
    ];

    const columnasRequeridas = tipo === 'INTERNO' ? columnasInterno : columnasGeneral;
    const faltantes = this.validarColumnas(columnasArchivo, columnasRequeridas);

    if (faltantes.length > 0) {
      throw new BadRequestException({
        mensaje: 'El archivo no tiene todas las columnas requeridas',
        columnas_faltantes: faltantes,
        columnas_requeridas: columnasRequeridas,
        columnas_encontradas: columnasArchivo,
      });
    }

    let insertados = 0;
    let actualizados = 0;
    const errores: { fila: number; motivo: string }[] = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const numeroFila = i + 2;

      try {
        const ci = String(fila['CI'] ?? '').trim();

        if (!ci) {
          errores.push({ fila: numeroFila, motivo: 'CI vacia' });
          continue;
        }

        const nombre = String(fila['NOMBRE'] ?? '').trim();
        const apellido = String(fila['APELLIDO'] ?? '').trim();

        if (!nombre || !apellido) {
          errores.push({ fila: numeroFila, motivo: 'Nombre o Apellido vacio' });
          continue;
        }

        if (tipo === 'INTERNO') {
          const data: FilaPadronInterno = {
            CI: ci,
            NOMBRE: nombre,
            APELLIDO: apellido,
            FECHA_NACIMIENTO: String(fila['FECHA_NACIMIENTO'] ?? '').trim() || undefined,
            DEPARTAMENTO: String(fila['DEPARTAMENTO'] ?? '').trim() || undefined,
            DISTRITO: String(fila['DISTRITO'] ?? '').trim() || undefined,
            SECCIONAL: String(fila['SECCIONAL'] ?? '').trim() || undefined,
            LOCAL_VOTACION: String(fila['LOCAL_VOTACION'] ?? '').trim() || undefined,
            MESA: String(fila['MESA'] ?? '').trim() || undefined,
            ORDEN: String(fila['ORDEN'] ?? '').trim() || undefined,
          };

          const existente = await this.prisma.padronInterno.findFirst({
            where: { ci, partido_id: partidoId },
          });

          if (existente) {
            await this.prisma.padronInterno.update({
              where: { id: existente.id },
              data: {
                nombre: data.NOMBRE,
                apellido: data.APELLIDO,
                fecha_nacimiento: data.FECHA_NACIMIENTO,
                departamento: data.DEPARTAMENTO,
                distrito: data.DISTRITO,
                seccional: data.SECCIONAL,
                local_votacion: data.LOCAL_VOTACION,
                mesa: data.MESA,
                orden: data.ORDEN,
                fecha_carga: new Date(),
              },
            });
            actualizados++;
          } else {
            await this.prisma.padronInterno.create({
              data: {
                ci,
                partido_id: partidoId,
                nombre: data.NOMBRE,
                apellido: data.APELLIDO,
                fecha_nacimiento: data.FECHA_NACIMIENTO,
                departamento: data.DEPARTAMENTO,
                distrito: data.DISTRITO,
                seccional: data.SECCIONAL,
                local_votacion: data.LOCAL_VOTACION,
                mesa: data.MESA,
                orden: data.ORDEN,
              },
            });
            insertados++;
          }
        } else {
          const data: FilaPadronGeneral = {
            CI: ci,
            NOMBRE: nombre,
            APELLIDO: apellido,
            FECHA_NACIMIENTO: String(fila['FECHA_NACIMIENTO'] ?? '').trim() || undefined,
            DEPARTAMENTO: String(fila['DEPARTAMENTO'] ?? '').trim() || undefined,
            DISTRITO: String(fila['DISTRITO'] ?? '').trim() || undefined,
            LOCAL_VOTACION: String(fila['LOCAL_VOTACION'] ?? '').trim() || undefined,
            MESA: String(fila['MESA'] ?? '').trim() || undefined,
            ORDEN: String(fila['ORDEN'] ?? '').trim() || undefined,
          };

          const existente = await this.prisma.padronGeneral.findUnique({
            where: { ci },
          });

          if (existente) {
            await this.prisma.padronGeneral.update({
              where: { ci },
              data: {
                nombre: data.NOMBRE,
                apellido: data.APELLIDO,
                fecha_nacimiento: data.FECHA_NACIMIENTO,
                departamento: data.DEPARTAMENTO,
                distrito: data.DISTRITO,
                local_votacion: data.LOCAL_VOTACION,
                mesa: data.MESA,
                orden: data.ORDEN,
                fecha_carga: new Date(),
              },
            });
            actualizados++;
          } else {
            await this.prisma.padronGeneral.create({
              data: {
                ci,
                nombre: data.NOMBRE,
                apellido: data.APELLIDO,
                fecha_nacimiento: data.FECHA_NACIMIENTO,
                departamento: data.DEPARTAMENTO,
                distrito: data.DISTRITO,
                local_votacion: data.LOCAL_VOTACION,
                mesa: data.MESA,
                orden: data.ORDEN,
              },
            });
            insertados++;
          }
        }
      } catch {
        errores.push({ fila: numeroFila, motivo: 'Error inesperado procesando la fila' });
      }
    }

    return {
      tipo,
      total_filas: filas.length,
      insertados,
      actualizados,
      errores_count: errores.length,
      errores: errores.slice(0, 50),
    };
  }

  async buscarPorCi(ci: string, usuarioId: string): Promise<ResultadoPadronDto> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfil: true,
        campana: {
          include: {
            configuracion: true,
            partido: true,
          },
        },
      },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');

    const esRoot = usuario.perfil.nombre === 'ROOT';

    const modoEleccion = usuario.campana?.configuracion?.modo_eleccion ?? 'GENERALES';
    const partidoId = usuario.campana?.partido_id ?? null;
    const distritoCampana = usuario.campana?.distrito ?? null;

    if (modoEleccion === 'INTERNAS') {
      if (!esRoot && !partidoId) {
        throw new BadRequestException(
          'La campana esta en modo INTERNAS pero no tiene partido asociado',
        );
      }

      const whereInterno: {
        ci: string;
        partido_id?: string;
        distrito?: string;
      } = { ci };

      if (!esRoot) {
        if (partidoId) whereInterno.partido_id = partidoId;
        if (distritoCampana) whereInterno.distrito = distritoCampana;
      }

      const resultado = await this.prisma.padronInterno.findFirst({
        where: whereInterno,
      });

      if (!resultado) {
        const detalle =
          !esRoot && distritoCampana ? ` del partido y distrito ${distritoCampana}` : '';
        throw new NotFoundException(`CI ${ci} no encontrada en el padron interno${detalle}`);
      }

      return {
        ci: resultado.ci,
        nombre: resultado.nombre,
        apellido: resultado.apellido,
        fecha_nacimiento: resultado.fecha_nacimiento,
        departamento: resultado.departamento,
        distrito: resultado.distrito,
        seccional: resultado.seccional,
        local_votacion: resultado.local_votacion,
        mesa: resultado.mesa,
        orden: resultado.orden,
        es_afiliado: true,
      };
    }

    // modo GENERALES
    const whereGeneral: {
      ci: string;
      distrito?: string;
    } = { ci };

    if (!esRoot && distritoCampana) {
      whereGeneral.distrito = distritoCampana;
    }

    const resultadoGeneral = await this.prisma.padronGeneral.findFirst({
      where: whereGeneral,
    });

    if (!resultadoGeneral) {
      const detalle = !esRoot && distritoCampana ? ` del distrito ${distritoCampana}` : '';
      throw new NotFoundException(`CI ${ci} no encontrada en el padron general${detalle}`);
    }

    return {
      ci: resultadoGeneral.ci,
      nombre: resultadoGeneral.nombre,
      apellido: resultadoGeneral.apellido,
      fecha_nacimiento: resultadoGeneral.fecha_nacimiento,
      departamento: resultadoGeneral.departamento,
      distrito: resultadoGeneral.distrito,
      seccional: null,
      local_votacion: resultadoGeneral.local_votacion,
      mesa: resultadoGeneral.mesa,
      orden: resultadoGeneral.orden,
      es_afiliado: false,
    };
  }

  async obtenerStats(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');
    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede ver las estadisticas del padron');
    }

    const [totalInterno, totalGeneral] = await Promise.all([
      this.prisma.padronInterno.count(),
      this.prisma.padronGeneral.count(),
    ]);

    return {
      padron_interno: totalInterno,
      padron_general: totalGeneral,
    };
  }

  async obtenerListado(usuarioId: string, tipo: TipoPadron, limite = 50) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');
    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede ver el listado del padron');
    }

    const maxLimite = Math.min(Math.max(limite, 1), 100);

    if (tipo === 'INTERNO') {
      const registros = await this.prisma.padronInterno.findMany({
        take: maxLimite,
        orderBy: { fecha_carga: 'desc' },
        include: { partido: { select: { id: true, nombre: true, sigla: true } } },
      });

      const total = await this.prisma.padronInterno.count();

      return { tipo, total, registros };
    } else {
      const registros = await this.prisma.padronGeneral.findMany({
        take: maxLimite,
        orderBy: { fecha_carga: 'desc' },
      });

      const total = await this.prisma.padronGeneral.count();

      return { tipo, total, registros };
    }
  }

  async resumenPorDistrito(usuarioId: string, tipo: TipoPadron) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');
    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede ver el resumen del padron');
    }

    if (tipo === 'INTERNO') {
      const agrupado = await this.prisma.padronInterno.groupBy({
        by: ['departamento', 'distrito'],
        _count: { id: true },
        orderBy: [{ departamento: 'asc' }, { distrito: 'asc' }],
      });

      const mapa = new Map<string, { distrito: string; total: number }[]>();

      for (const fila of agrupado) {
        const dep = fila.departamento ?? 'SIN DEPARTAMENTO';
        const dis = fila.distrito ?? 'SIN DISTRITO';
        const total = fila._count.id;

        if (!mapa.has(dep)) {
          mapa.set(dep, []);
        }
        mapa.get(dep)!.push({ distrito: dis, total });
      }

      const departamentos = Array.from(mapa.entries()).map(([departamento, distritos]) => ({
        departamento,
        total: distritos.reduce((acc, d) => acc + d.total, 0),
        distritos,
      }));

      return { tipo, departamentos };
    } else {
      const agrupado = await this.prisma.padronGeneral.groupBy({
        by: ['departamento', 'distrito'],
        _count: { id: true },
        orderBy: [{ departamento: 'asc' }, { distrito: 'asc' }],
      });

      const mapa = new Map<string, { distrito: string; total: number }[]>();

      for (const fila of agrupado) {
        const dep = fila.departamento ?? 'SIN DEPARTAMENTO';
        const dis = fila.distrito ?? 'SIN DISTRITO';
        const total = fila._count.id;

        if (!mapa.has(dep)) {
          mapa.set(dep, []);
        }
        mapa.get(dep)!.push({ distrito: dis, total });
      }

      const departamentos = Array.from(mapa.entries()).map(([departamento, distritos]) => ({
        departamento,
        total: distritos.reduce((acc, d) => acc + d.total, 0),
        distritos,
      }));

      return { tipo, departamentos };
    }
  }

  async obtenerPorDistrito(
    usuarioId: string,
    tipo: TipoPadron,
    departamento: string,
    distrito: string,
    pagina: number,
    limite: number,
    buscar?: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no autenticado');
    if (usuario.perfil.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede ver el detalle del padron');
    }

    const paginaFinal = Math.max(pagina, 1);
    const limiteFinal = Math.min(Math.max(limite, 1), 100);
    const skip = (paginaFinal - 1) * limiteFinal;

    const depFiltro = departamento === 'SIN DEPARTAMENTO' ? null : departamento;
    const disFiltro = distrito === 'SIN DISTRITO' ? null : distrito;

    if (tipo === 'INTERNO') {
      const whereBase: {
        departamento: string | null;
        distrito: string | null;
        OR?: {
          ci?: { contains: string; mode: 'insensitive' };
          nombre?: { contains: string; mode: 'insensitive' };
          apellido?: { contains: string; mode: 'insensitive' };
        }[];
      } = {
        departamento: depFiltro,
        distrito: disFiltro,
      };

      if (buscar && buscar.trim().length > 0) {
        const termino = buscar.trim();
        whereBase.OR = [
          { ci: { contains: termino, mode: 'insensitive' } },
          { nombre: { contains: termino, mode: 'insensitive' } },
          { apellido: { contains: termino, mode: 'insensitive' } },
        ];
      }

      const [total, registros] = await Promise.all([
        this.prisma.padronInterno.count({ where: whereBase }),
        this.prisma.padronInterno.findMany({
          where: whereBase,
          skip,
          take: limiteFinal,
          orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
          include: {
            partido: { select: { id: true, nombre: true, sigla: true } },
          },
        }),
      ]);

      return {
        tipo,
        departamento,
        distrito,
        total,
        pagina: paginaFinal,
        limite: limiteFinal,
        total_paginas: Math.ceil(total / limiteFinal),
        registros,
      };
    } else {
      const whereBase: {
        departamento: string | null;
        distrito: string | null;
        OR?: {
          ci?: { contains: string; mode: 'insensitive' };
          nombre?: { contains: string; mode: 'insensitive' };
          apellido?: { contains: string; mode: 'insensitive' };
        }[];
      } = {
        departamento: depFiltro,
        distrito: disFiltro,
      };

      if (buscar && buscar.trim().length > 0) {
        const termino = buscar.trim();
        whereBase.OR = [
          { ci: { contains: termino, mode: 'insensitive' } },
          { nombre: { contains: termino, mode: 'insensitive' } },
          { apellido: { contains: termino, mode: 'insensitive' } },
        ];
      }

      const [total, registros] = await Promise.all([
        this.prisma.padronGeneral.count({ where: whereBase }),
        this.prisma.padronGeneral.findMany({
          where: whereBase,
          skip,
          take: limiteFinal,
          orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
        }),
      ]);

      return {
        tipo,
        departamento,
        distrito,
        total,
        pagina: paginaFinal,
        limite: limiteFinal,
        total_paginas: Math.ceil(total / limiteFinal),
        registros,
      };
    }
  }
}
