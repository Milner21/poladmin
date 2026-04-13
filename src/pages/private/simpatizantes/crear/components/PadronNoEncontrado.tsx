import { ExternalLink, UserPlus, AlertTriangle } from 'lucide-react';
import type { FC } from 'react';

interface Props {
  cedula: string;
  tienePermisoManual: boolean;
  onRegistrarManual: () => void;
}

export const PadronNoEncontrado: FC<Props> = ({
  cedula,
  tienePermisoManual,
  onRegistrarManual,
}) => {
  const handleConsultarTSJE = () => {
    window.open(import.meta.env.VITE_TSJE_CONSULTA_URL, '_blank');
  };

  return (
    <div className="bg-bg-content border-2 border-error/30 rounded-xl p-6 my-4">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-error shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-error mb-2">
            CI {cedula} no encontrada en el padrón
          </h3>
          <p className="text-text-secondary text-sm">
            Esta cédula no figura en el padrón electoral cargado en el sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Consultar TSJE */}
        <button
          type="button"
          onClick={handleConsultarTSJE}
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Consultar en TSJE
        </button>

        {/* Registrar Manual */}
        {tienePermisoManual ? (
          <button
            type="button"
            onClick={onRegistrarManual}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Registrar Manualmente
          </button>
        ) : (
          <div className="flex items-center justify-center px-4 py-3 bg-bg-base border border-border rounded-lg text-text-secondary text-sm">
            <p>Contactá con tu supervisor para registro manual</p>
          </div>
        )}
      </div>

      {!tienePermisoManual && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-xs text-text-secondary">
            💡 <strong>Nota:</strong> No tenés permiso para registrar simpatizantes manualmente.
            Podés consultar en TSJE para verificar donde figura la persona.
          </p>
        </div>
      )}
    </div>
  );
};