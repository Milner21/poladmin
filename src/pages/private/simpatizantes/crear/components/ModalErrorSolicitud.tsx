import { AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import type { FC } from 'react';

interface Props {
  isOpen: boolean;
  isPending: boolean;
  onReintentar: () => void;
  onOmitir: () => void;
}

export const ModalErrorSolicitud: FC<Props> = ({
  isOpen,
  isPending,
  onReintentar,
  onOmitir,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
        {/* Ícono */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </div>

        {/* Texto */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No se pudo registrar la solicitud
          </h3>
          <p className="text-sm text-text-secondary">
            El simpatizante fue registrado correctamente, pero hubo un problema al guardar la solicitud.
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            Podés reintentar o continuar sin la solicitud.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReintentar}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            {isPending ? 'Reintentando...' : 'Reintentar'}
          </button>
          <button
            type="button"
            onClick={onOmitir}
            disabled={isPending}
            className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Omitir
          </button>
        </div>
      </div>
    </>
  );
};