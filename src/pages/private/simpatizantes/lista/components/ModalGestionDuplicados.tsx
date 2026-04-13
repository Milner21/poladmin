import { X, CheckCircle, Loader2, User, Crown, AlertTriangle } from "lucide-react";
import { type FC, useState } from "react";
import { useDuplicadosPorSimpatizante } from "../../hooks/useDuplicadosPorSimpatizante";
import { useResolverDuplicado } from "../../hooks/useResolverDuplicado";
import type { AxiosError } from "axios";

interface Props {
  isOpen: boolean;
  simpatizanteId: string | null;
  onClose: () => void;
}

type EtapaModal =
  | "lista"
  | "confirmacion"
  | "advertencia_operativo";

export const ModalGestionDuplicados: FC<Props> = ({
  isOpen,
  simpatizanteId,
  onClose,
}) => {
  const { data, isLoading } = useDuplicadosPorSimpatizante(simpatizanteId);
  const resolverMutation = useResolverDuplicado();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<EtapaModal>("lista");

  if (!isOpen) return null;

  const handleSeleccionar = (duplicadoId: string) => {
    setConfirmandoId(duplicadoId);
    setEtapa("confirmacion");
  };

  const handleConfirmar = () => {
    if (!confirmandoId) return;

    resolverMutation.mutate(
      { duplicadoId: confirmandoId, forzar: false },
      {
        onSuccess: () => {
          setConfirmandoId(null);
          setEtapa("lista");
          onClose();
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<{ message: string; codigo?: string }>;
          const codigo = axiosError?.response?.data?.codigo;
          if (codigo === "RESOLUCION_FAVORECE_OPERATIVO") {
            setEtapa("advertencia_operativo");
          }
        },
      },
    );
  };

  const handleForzarConfirmacion = () => {
    if (!confirmandoId) return;

    resolverMutation.mutate(
      { duplicadoId: confirmandoId, forzar: true },
      {
        onSuccess: () => {
          setConfirmandoId(null);
          setEtapa("lista");
          onClose();
        },
      },
    );
  };

  const handleCancelar = () => {
    setConfirmandoId(null);
    setEtapa("lista");
  };

  const duplicadoSeleccionado = data?.duplicados.find(
    (d) => d.id === confirmandoId,
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-lg z-50 p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Gestion de duplicados
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X size={18} className="text-text-tertiary" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="bg-bg-base border border-border rounded-lg p-3 mb-5">
              <p className="text-xs text-text-tertiary mb-1">Simpatizante</p>
              <p className="text-sm font-semibold text-text-primary">
                {data.simpatizante.nombre} {data.simpatizante.apellido}
              </p>
              <p className="text-xs text-text-tertiary">
                CI: {data.simpatizante.documento}
              </p>
            </div>

            {/* Etapa: confirmacion inicial */}
            {etapa === "confirmacion" && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-5">
                <p className="text-sm font-semibold text-text-primary mb-2">
                  Confirmas que este es el dueno real del simpatizante?
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  <strong>
                    {duplicadoSeleccionado?.quien_intento.nombre}{" "}
                    {duplicadoSeleccionado?.quien_intento.apellido}
                  </strong>{" "}
                  pasara a ser el registrador del simpatizante. Los demas quedaran como duplicados.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmar}
                    disabled={resolverMutation.isPending}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    {resolverMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {resolverMutation.isPending ? "Guardando..." : "Si, confirmar"}
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={resolverMutation.isPending}
                    className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Etapa: advertencia operativo sobre lider */}
            {etapa === "advertencia_operativo" && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">
                      Atencion: estas favoreciendo a un operativo sobre un lider politico
                    </p>
                    <p className="text-sm text-text-secondary">
                      El registrador original es un lider politico que trabaja en campo.
                      Asignar el simpatizante a un operativo (gestor) va en contra de la
                      prioridad establecida. Esta accion queda registrada.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleForzarConfirmacion}
                    disabled={resolverMutation.isPending}
                    className="flex-1 px-4 py-3 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    {resolverMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {resolverMutation.isPending ? "Guardando..." : "Confirmar de todas formas"}
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={resolverMutation.isPending}
                    className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Etapa: lista principal */}
            {etapa === "lista" && (
              <>
                <p className="text-sm text-text-secondary mb-3">
                  Hace doble clic sobre un registro para asignarlo como dueno real del simpatizante.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={14} className="text-warning" />
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                      Registrador actual
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <Crown size={16} className="text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {data.registrador_actual?.nombre ?? "Desconocido"}{" "}
                        {data.registrador_actual?.apellido ?? ""}
                      </p>
                      <p className="text-xs text-text-tertiary">Registrador actual</p>
                    </div>
                  </div>

                  {data.duplicados.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mt-4 mb-1">
                        <User size={14} className="text-text-tertiary" />
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                          Duplicantes - selecciona el dueno real
                        </p>
                      </div>

                      {data.duplicados.map((duplicado) => (
                        <button
                          key={duplicado.id}
                          onDoubleClick={() => handleSeleccionar(duplicado.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                            duplicado.es_dueno_confirmado
                              ? "border-primary/30 bg-primary/5"
                              : "border-border hover:bg-bg-hover hover:border-primary/30"
                          }`}
                          title="Doble clic para asignar como dueno real"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              duplicado.es_dueno_confirmado
                                ? "bg-primary/20"
                                : "bg-bg-base"
                            }`}
                          >
                            <User
                              size={16}
                              className={
                                duplicado.es_dueno_confirmado
                                  ? "text-primary"
                                  : "text-text-tertiary"
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">
                              {duplicado.quien_intento.nombre}{" "}
                              {duplicado.quien_intento.apellido}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {new Date(duplicado.fecha_intento).toLocaleDateString(
                                "es-PY",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          {duplicado.es_dueno_confirmado && (
                            <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                              Confirmado
                            </span>
                          )}
                        </button>
                      ))}

                      <p className="text-xs text-text-tertiary text-center mt-3">
                        Doble clic sobre un nombre para iniciar el proceso de asignacion
                      </p>
                    </>
                  )}

                  {data.duplicados.length === 0 && (
                    <div className="text-center py-6 text-text-tertiary text-sm">
                      No hay duplicantes activos para este simpatizante
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};