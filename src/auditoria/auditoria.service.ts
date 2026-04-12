import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AccionAuditoria =
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'CAMBIAR_CAMPANA'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CAMBIAR_PASSWORD';

export type ModuloAuditoria =
  | 'USUARIOS'
  | 'SIMPATIZANTES'
  | 'EVENTOS'
  | 'CAMPANAS'
  | 'NIVELES'
  | 'PERFILES'
  | 'PERMISOS'
  | 'PADRON'
  | 'AUTH';

interface DatosAuditoria {
  [key: string]: string | number | boolean | null | undefined;
}

interface RegistrarAuditoriaParams {
  usuarioId?: string;
  accion: AccionAuditoria;
  modulo: ModuloAuditoria;
  entidadId?: string;
  entidadTipo?: string;
  datosAntes?: DatosAuditoria;
  datosDespues?: DatosAuditoria;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async registrar(params: RegistrarAuditoriaParams) {
    try {
      return await this.prisma.auditoriaLog.create({
        data: {
          usuario_id: params.usuarioId,
          accion: params.accion,
          modulo: params.modulo,
          entidad_id: params.entidadId,
          entidad_tipo: params.entidadTipo,
          datos_antes: params.datosAntes ? JSON.parse(JSON.stringify(params.datosAntes)) : null,
          datos_despues: params.datosDespues
            ? JSON.parse(JSON.stringify(params.datosDespues))
            : null,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
        },
      });
    } catch (error) {
      // No lanzar error para no afectar la operación principal
      console.error('Error al registrar auditoría:', error);
    }
  }

  async obtenerLogs(
    usuarioId: string,
    filtros?: {
      modulo?: ModuloAuditoria;
      accion?: AccionAuditoria;
      fechaDesde?: Date;
      fechaHasta?: Date;
      limit?: number;
    },
  ) {
    const esRoot = await this.esUsuarioRoot(usuarioId);

    return this.prisma.auditoriaLog.findMany({
      where: {
        ...(filtros?.modulo && { modulo: filtros.modulo }),
        ...(filtros?.accion && { accion: filtros.accion }),
        ...(filtros?.fechaDesde && { fecha_accion: { gte: filtros.fechaDesde } }),
        ...(filtros?.fechaHasta && { fecha_accion: { lte: filtros.fechaHasta } }),
        // Si no es ROOT, solo ve sus propios logs
        ...(!esRoot && { usuario_id: usuarioId }),
      },
      orderBy: { fecha_accion: 'desc' },
      take: filtros?.limit ?? 100,
    });
  }

  private async esUsuarioRoot(usuarioId: string): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfil: true },
    });
    return usuario?.perfil?.nombre === 'ROOT';
  }
}