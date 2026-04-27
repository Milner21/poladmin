import { type FC } from 'react';
import { CheckCircle, XCircle, AlertCircle, UserPlus } from 'lucide-react';
import type { EstadoSimpatizanteResponse } from '@dto/usuario.types';

interface SimpatizanteStatusCardProps {
  estadoSimpatizante: EstadoSimpatizanteResponse | undefined;
  cargandoEstado: boolean;
  onReactivar: () => void;
  reactivandoSimpatizante: boolean;
}

export const SimpatizanteStatusCard: FC<SimpatizanteStatusCardProps> = ({
  estadoSimpatizante,
  cargandoEstado,
  onReactivar,
  reactivandoSimpatizante,
}) => {
  if (cargandoEstado) {
    return (
      <div className="mb-6 p-4 bg-bg-base border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-tertiary">Verificando estado de simpatizante...</span>
        </div>
      </div>
    );
  }

  if (!estadoSimpatizante) return null;

  const getStatusIcon = () => {
    if (estadoSimpatizante.es_simpatizante) return <CheckCircle size={20} className="text-success" />;
    if (estadoSimpatizante.esta_eliminado) return <AlertCircle size={20} className="text-warning" />;
    if (estadoSimpatizante.esta_en_padron) return <UserPlus size={20} className="text-info" />;
    return <XCircle size={20} className="text-text-tertiary" />;
  };

  const getBgColor = () => {
    if (estadoSimpatizante.es_simpatizante) return 'bg-success/10 border-success/30';
    if (estadoSimpatizante.esta_eliminado) return 'bg-warning/10 border-warning/30';
    if (estadoSimpatizante.esta_en_padron) return 'bg-info/10 border-info/30';
    return 'bg-bg-base border-border';
  };

  const getStatusTitle = () => {
    if (estadoSimpatizante.es_simpatizante) return 'Simpatizante Activo';
    if (estadoSimpatizante.esta_eliminado) return 'Simpatizante Eliminado';
    if (estadoSimpatizante.esta_en_padron) return 'En Padrón (No Registrado)';
    return 'No es Simpatizante';
  };

  const getStatusColor = () => {
    if (estadoSimpatizante.es_simpatizante) return 'text-success';
    if (estadoSimpatizante.esta_eliminado) return 'text-warning';
    if (estadoSimpatizante.esta_en_padron) return 'text-info';
    return 'text-text-tertiary';
  };

  return (
    <div className={`mb-6 p-4 border rounded-lg ${getBgColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusTitle()}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              {estadoSimpatizante.mensaje}
            </p>
            {estadoSimpatizante.es_simpatizante && (
              <div className="flex gap-3 mt-2 text-xs text-text-tertiary">
                <span>Intención: {estadoSimpatizante.intencion_voto}</span>
                <span>Afiliado: {estadoSimpatizante.es_afiliado ? 'Sí' : 'No'}</span>
                {estadoSimpatizante.fecha_registro_simpatizante && (
                  <span>
                    Registrado: {new Date(estadoSimpatizante.fecha_registro_simpatizante).toLocaleDateString('es-PY')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {estadoSimpatizante.puede_reactivar && (
          <button
            onClick={onReactivar}
            disabled={reactivandoSimpatizante}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {reactivandoSimpatizante ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Reactivar Simpatizante
          </button>
        )}
      </div>
    </div>
  );
};