import { AlertTriangle, X, UserPlus } from 'lucide-react';
import type { FC } from 'react';

interface Props {
  isOpen: boolean;
  cedula: string;
  permiteRegistroManual: boolean;
  onRegistrarManual: () => void;
  onCancelar: () => void;
}

export const ModalNoEncontrado: FC<Props> = ({
  isOpen,
  cedula,
  permiteRegistroManual,
  onRegistrarManual,
  onCancelar,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            CI {cedula} no encontrada
          </h3>
          <p className="text-sm text-text-secondary">
            Esta persona no figura en simpatizantes ni en los padrones disponibles.
            Es posible que esté registrada en otra localidad o región.
          </p>
        </div>

        <div className="flex gap-3">
          {permiteRegistroManual ? (
            <button
              type="button"
              onClick={onRegistrarManual}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Registrar manualmente
            </button>
          ) : (
            <div className="flex-1 px-4 py-3 bg-bg-base border border-border rounded-lg text-center">
              <p className="text-sm text-text-secondary">
                Contactá con tu supervisor para registro manual
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};