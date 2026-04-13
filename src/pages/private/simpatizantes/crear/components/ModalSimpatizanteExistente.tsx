import { AlertTriangle, X, CheckCircle } from "lucide-react";
import type { FC } from "react";
import type { DatosBusquedaInteligente } from "@dto/padron.types";

interface Props {
  isOpen: boolean;
  datos: DatosBusquedaInteligente;
  permiteDuplicados: boolean;
  isPending: boolean;
  onConfirmarDuplicado: () => void;
  onCancelar: () => void;
}

export const ModalSimpatizanteExistente: FC<Props> = ({
  isOpen,
  datos,
  permiteDuplicados,
  isPending,
  onConfirmarDuplicado,
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

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Persona ya registrada
          </h3>
          <p className="text-sm text-text-secondary">
            Esta persona ya fue registrada como simpatizante en esta campaña.
          </p>
        </div>

        <div className="bg-bg-base border border-border rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Nombre</span>
            <span className="text-text-primary font-medium">
              {datos.nombre} {datos.apellido}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">CI</span>
            <span className="text-text-primary font-medium">{datos.ci}</span>
          </div>
        </div>

        {permiteDuplicados ? (
          <>
            <p className="text-sm text-text-secondary text-center mb-4">
              Si deseás, podés registrar este intento para auditoría.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  console.log("click confirmar duplicado");
                  onConfirmarDuplicado();
                }}
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {isPending ? "Registrando..." : "Registrar intento"}
              </button>
              <button
                type="button"
                onClick={onCancelar}
                disabled={isPending}
                className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onCancelar}
            className="w-full px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Entendido
          </button>
        )}
      </div>
    </>
  );
};
