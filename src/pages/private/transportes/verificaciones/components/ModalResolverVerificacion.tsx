import type { EstadoVerificacion, VerificacionTransporte } from "@dto/transporte.types";
import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { FC } from "react";
import toast from "react-hot-toast";
import { useResolverVerificacion } from "../../hooks/useResolverVerificacion";

interface ModalResolverVerificacionProps {
  isOpen: boolean;
  onClose: () => void;
  verificacion: VerificacionTransporte | null;
}

const ModalResolverVerificacion: FC<ModalResolverVerificacionProps> = ({
  isOpen,
  onClose,
  verificacion,
}) => {
  const { mutateAsync: resolverVerificacion, isPending } = useResolverVerificacion();

  const [estado, setEstado] = useState<EstadoVerificacion | null>(null);
  
  // Datos Rechazo
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Datos Aprobación (Simpatizante)
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [localVotacion, setLocalVotacion] = useState("");
  const [mesaVotacion, setMesaVotacion] = useState("");
  const [ordenVotacion, setOrdenVotacion] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && verificacion) {
      setEstado(null);
      setMotivoRechazo("");
      setNombre(verificacion.nombre_referencia || "");
      setApellido(verificacion.apellido_referencia || "");
      setDocumento(verificacion.documento_buscado || "");
      setLocalVotacion("");
      setMesaVotacion("");
      setOrdenVotacion("");
    }
  }, [isOpen, verificacion]);

  if (!isOpen || !verificacion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estado) {
      toast("Debes seleccionar Aprobar o Rechazar", { icon: "ℹ️" });
      return;
    }

    try {
      if (estado === "RECHAZADO") {
        if (!motivoRechazo.trim()) {
          toast("Debes ingresar un motivo de rechazo", { icon: "ℹ️" });
          return;
        }
        await resolverVerificacion({
          id: verificacion.id,
          data: { estado: "RECHAZADO", motivo_rechazo: motivoRechazo },
        });
      } else if (estado === "APROBADO") {
        if (!nombre.trim() || !apellido.trim() || !documento.trim() || !localVotacion.trim()) {
          toast("Completa los datos obligatorios del votante", { icon: "ℹ️" });
          return;
        }
        await resolverVerificacion({
          id: verificacion.id,
          data: {
            estado: "APROBADO",
            datos_simpatizante: {
              nombre,
              apellido,
              documento,
              local_votacion: localVotacion,
              mesa_votacion: mesaVotacion,
              orden_votacion: ordenVotacion,
            },
          },
        });
      }

      onClose();
    } catch (error) {
      // El error ya es manejado por el hook con toast.error
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-content w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-surface">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Resolver Verificación</h3>
            <p className="text-sm text-text-tertiary">
              CI Buscado: {verificacion.documento_buscado}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-base transition-colors text-text-tertiary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <form id="form-resolver" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Selector de Estado */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setEstado("APROBADO")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  estado === "APROBADO"
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-bg-surface text-text-tertiary hover:border-success/50"
                }`}
              >
                <CheckCircle size={32} className="mb-2" />
                <span className="font-semibold">Aprobar y Registrar</span>
              </button>

              <button
                type="button"
                onClick={() => setEstado("RECHAZADO")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  estado === "RECHAZADO"
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-border bg-bg-surface text-text-tertiary hover:border-danger/50"
                }`}
              >
                <XCircle size={32} className="mb-2" />
                <span className="font-semibold">Rechazar Viaje</span>
              </button>
            </div>

            {/* Formulario Dinámico */}
            {estado === "RECHAZADO" && (
              <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                <label className="text-sm font-medium text-text-primary">Motivo del rechazo <span className="text-danger">*</span></label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="Ej: No vota en este local, documento no válido..."
                />
              </div>
            )}

            {estado === "APROBADO" && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    Al aprobar, este votante se registrará automáticamente como pasajero confirmado del transportista.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Nombre <span className="text-danger">*</span></label>
                    <input required value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Apellido <span className="text-danger">*</span></label>
                    <input required value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-tertiary">Documento (CI) <span className="text-danger">*</span></label>
                  <input required value={documento} onChange={(e) => setDocumento(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-tertiary">Local de Votación <span className="text-danger">*</span></label>
                  <input required value={localVotacion} onChange={(e) => setLocalVotacion(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Mesa (Opcional)</label>
                    <input value={mesaVotacion} onChange={(e) => setMesaVotacion(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-tertiary">Orden (Opcional)</label>
                    <input value={ordenVotacion} onChange={(e) => setOrdenVotacion(e.target.value)} type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-bg-surface flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-base transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-resolver"
            disabled={!estado || isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Procesando..." : "Confirmar Resolución"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResolverVerificacion;