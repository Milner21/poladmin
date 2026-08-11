import type { DatosVotante } from "@dto/padron.types";
import { useCrearSimpatizante } from "@pages/private/simpatizantes/hooks/useCrearSimpatizante";
import { UserPlus, Users, X } from "lucide-react";
import { type FC } from "react";

/**
 * @deprecated Este componente ya no se usa. El registro automatico de simpatizantes organicos
 * ahora ocurre internamente al imprimir el ticket (Fase 4). Conservado por compatibilidad.
 */

interface ModalRegistrarSimpatizanteProps {
  isOpen: boolean;
  onClose: () => void;
  datos: DatosVotante | null;
  onSuccess: () => void;
}

const ModalRegistrarSimpatizante: FC<ModalRegistrarSimpatizanteProps> = ({
  isOpen,
  onClose,
  datos,
  onSuccess,
}) => {

  const crearMutation = useCrearSimpatizante();


    const handleSubmit = async () => {
    if (!datos) return;

    try {
      await crearMutation.mutateAsync({
        nombre: datos.nombre,
        apellido: datos.apellido,
        documento: datos.ci,
        departamento: datos.departamento || undefined,
        distrito: datos.distrito || undefined,
        local_votacion_general: datos.local_votacion || undefined,
        mesa_votacion_general: datos.mesa || undefined,
        orden_votacion_general: datos.orden || undefined,
        origen_registro: "PADRON_GENERAL",
        intencion_voto: "PROBABLE",
        marcar_voto_automatico: true,
        es_registro_dia_d: true, 
      });

      onSuccess();
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  if (!isOpen || !datos) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-lg z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Registrar como Simpatizante
              </h3>
              <p className="text-sm text-text-tertiary">
                {datos.nombre} {datos.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-surface transition-colors"
          >
            <X size={18} className="text-text-tertiary" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-surface border border-border rounded-lg p-4">
            <p className="text-xs text-text-tertiary mb-2">Datos del padrón</p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                {datos.nombre} {datos.apellido}
              </p>
              <p className="text-xs text-text-tertiary">CI: {datos.ci}</p>
              {datos.local_votacion && (
                <p className="text-xs text-text-tertiary">
                  Local: {datos.local_votacion} | Mesa: {datos.mesa} | Orden:{" "}
                  {datos.orden}
                </p>
              )}
            </div>
          </div>
          <div className="bg-success/10 border border-success/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <UserPlus size={16} className="text-success mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success">
                  Registro orgánico - Día D
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Esta persona llegó sola al puesto y será registrada como
                  simpatizante orgánico. Se asignará automáticamente a tu
                  candidato superior.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Users size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary">
                  Se registrará automáticamente
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Al confirmar, esta persona quedará registrada como
                  simpatizante y se marcará que ya votó.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              disabled={crearMutation.isPending}
              className="flex-1 btn btn-outline"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={crearMutation.isPending}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              {crearMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Registrar y marcar voto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalRegistrarSimpatizante;
