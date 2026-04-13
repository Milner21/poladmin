import { type FC } from 'react';
import { RefreshCw, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useActualizacion } from '@hooks/useActualizacion';

export const ModalActualizacion: FC = () => {
  const {
    versionInfo,
    mostrarModal,
    isUpdating,
    handleActualizar,
    handlePosponer,
  } = useActualizacion();

  if (!mostrarModal || !versionInfo) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-content border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Nueva version disponible
              </h2>
              <p className="text-white/75 text-sm mt-0.5">
                Version {versionInfo.version}
                {versionInfo.fecha && (
                  <span className="ml-2">· {versionInfo.fecha}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">

          {/* Lista de cambios */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Novedades en esta version
            </p>
            <ul className="space-y-2">
              {versionInfo.cambios.map((cambio, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle
                    size={15}
                    className="text-success shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-text-primary">{cambio}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Aviso */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs text-warning leading-relaxed">
              La actualizacion limpiara el cache del navegador para garantizar
              que uses la version mas reciente.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleActualizar}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Actualizar ahora
                </>
              )}
            </button>

            <button
              onClick={handlePosponer}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-text-secondary rounded-xl hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Clock size={14} />
              Posponer 1 hora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};