import { type FC } from "react";
import { X, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ModalSolicitarVerificacionProps {
  isOpen: boolean;
  onClose: () => void;
  transportistaId: string;
  documentoBuscado: string;
  nombreReferencia: string;
  apellidoReferencia: string;
  onNombreChange: (valor: string) => void;
  onApellidoChange: (valor: string) => void;
  onSuccess: () => void;
}

interface ErrorResponse {
  message: string;
}

export const ModalSolicitarVerificacion: FC<ModalSolicitarVerificacionProps> = ({
  isOpen,
  onClose,
  transportistaId,
  documentoBuscado,
  nombreReferencia,
  apellidoReferencia,
  onNombreChange,
  onApellidoChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const solicitarMutation = useMutation({
    mutationFn: transportesService.solicitarVerificacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verificaciones"] });
      toast.success("Solicitud de verificación enviada al operador");
      onSuccess();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? "Error al solicitar verificación";
      toast.error(mensaje);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    solicitarMutation.mutate({
      transportista_id: transportistaId,
      documento_buscado: documentoBuscado,
      nombre_referencia: nombreReferencia || undefined,
      apellido_referencia: apellidoReferencia || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-content w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Solicitar Verificación</h3>
              <p className="text-xs text-text-tertiary">CI: {documentoBuscado}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-base transition-colors text-text-tertiary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              Esta persona no figura en el padrón. Completá los datos de referencia para que el operador pueda verificar manualmente.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary">
              Nombre (Referencia)
            </label>
            <input
              type="text"
              value={nombreReferencia}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Nombre aproximado..."
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary">
              Apellido (Referencia)
            </label>
            <input
              type="text"
              value={apellidoReferencia}
              onChange={(e) => onApellidoChange(e.target.value)}
              placeholder="Apellido aproximado..."
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-base transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={solicitarMutation.isPending}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {solicitarMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};