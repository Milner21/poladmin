import { useState, type FC, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditoriaService } from '@services/auditoria.service';
import { Eye, FileEdit, Trash2, LogIn, LogOut, Key, RefreshCw } from 'lucide-react';
import type { AccionAuditoria } from '@dto/auditoria.types';

const iconosAccion: Record<AccionAuditoria, ReactNode> = {
  CREAR: <Eye className="text-success" size={16} />,
  EDITAR: <FileEdit className="text-warning" size={16} />,
  ELIMINAR: <Trash2 className="text-danger" size={16} />,
  CAMBIAR_CAMPANA: <RefreshCw className="text-info" size={16} />,
  LOGIN: <LogIn className="text-success" size={16} />,
  LOGOUT: <LogOut className="text-text-secondary" size={16} />,
  CAMBIAR_PASSWORD: <Key className="text-warning" size={16} />,
};

const coloresAccion: Record<AccionAuditoria, string> = {
  CREAR: 'bg-success/10 text-success border-success/30',
  EDITAR: 'bg-warning/10 text-warning border-warning/30',
  ELIMINAR: 'bg-danger/10 text-danger border-danger/30',
  CAMBIAR_CAMPANA: 'bg-info/10 text-info border-info/30',
  LOGIN: 'bg-success/10 text-success border-success/30',
  LOGOUT: 'bg-text-secondary/10 text-text-secondary border-text-secondary/30',
  CAMBIAR_PASSWORD: 'bg-warning/10 text-warning border-warning/30',
};

export const LogsAuditoria: FC = () => {
  const [limit] = useState(20);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['auditoria-logs', limit],
    queryFn: () => auditoriaService.getLogs({ limit }),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const obtenerNombreCompleto = (datos: Record<string, unknown> | null): string => {
    if (!datos) return '';
    const nombre = datos.nombre as string | undefined;
    const apellido = datos.apellido as string | undefined;
    if (nombre && apellido) return `${nombre} ${apellido}`;
    if (nombre) return nombre;
    return '';
  };

  if (isLoading) {
    return (
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-content border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary m-0">
          Actividad Reciente
        </h3>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
        >
          <RefreshCw size={16} className="text-text-secondary" />
        </button>
      </div>

      {logs && logs.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => {
            const nombreCompleto = obtenerNombreCompleto(
              log.datos_despues as Record<string, unknown> | null
            );

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover transition-colors"
              >
                <div className={`p-2 rounded-lg border ${coloresAccion[log.accion]}`}>
                  {iconosAccion[log.accion]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${coloresAccion[log.accion]}`}>
                      {log.accion}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {log.modulo}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-primary">
                    {log.accion === 'CREAR' && `Se creó ${log.entidad_tipo?.toLowerCase() || 'registro'}`}
                    {log.accion === 'EDITAR' && `Se editó ${log.entidad_tipo?.toLowerCase() || 'registro'}`}
                    {log.accion === 'ELIMINAR' && `Se eliminó ${log.entidad_tipo?.toLowerCase() || 'registro'}`}
                    {log.accion === 'CAMBIAR_CAMPANA' && 'Cambio de campaña'}
                    {log.accion === 'LOGIN' && 'Inicio de sesión'}
                    {log.accion === 'LOGOUT' && 'Cierre de sesión'}
                    {log.accion === 'CAMBIAR_PASSWORD' && 'Cambio de contraseña'}
                    
                    {nombreCompleto && ` — ${nombreCompleto}`}
                  </p>
                  
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(log.fecha_accion).toLocaleString('es-PY', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-text-tertiary text-center py-6">
          No hay actividad registrada
        </p>
      )}
    </div>
  );
};