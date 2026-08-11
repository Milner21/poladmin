import { PageHeader } from "@components";
import type { ResultadoConsultaVotante } from "@dto/padron.types";
import { usePermisos } from "@hooks/usePermisos";
import { useImprimirPadron } from "@pages/private/impresoras/hooks/useImprimirPadron";
import { useMiImpresora } from "@pages/private/impresoras/hooks/useMiImpresora";
import { useMarcarVoto } from "@pages/private/simpatizantes/hooks/useMarcarVoto";
import RoutesConfig from "@routes/RoutesConfig";
import {
  CheckCircle,
  Clock,
  Printer,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useState, type FC } from "react";
import { Navigate } from "react-router";
import { useConsultaVotante } from "../hooks/useConsultaVotante";

const ConsultaVotantePage: FC = () => {
  const [ci, setCi] = useState("");
  const [ciBuscada, setCiBuscada] = useState("");
  const { tienePermiso } = usePermisos();
  const puedeMarcarVotoPermiso = tienePermiso("marcar_voto");
  useState<ResultadoConsultaVotante | null>(null);

  const {
    data: resultado,
    isLoading,
    refetch,
  } = useConsultaVotante(ciBuscada, !!ciBuscada);
  const marcarVotoMutation = useMarcarVoto();
  const imprimirMutation = useImprimirPadron();
  const { data: miImpresora } = useMiImpresora();

  if (!tienePermiso("consultar_padron")) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleBuscar = () => {
    const ciLimpia = ci.trim().replace(/\./g, "");
    if (ciLimpia.length === 0) {
      return;
    }
    setCiBuscada(ciLimpia);
  };

  const handleLimpiarCi = () => {
    setCi("");
    setCiBuscada("");
  };

  const handleMarcarVoto = async () => {
    if (!resultado?.simpatizante_id) return;

    await marcarVotoMutation.mutateAsync(resultado.simpatizante_id);
    refetch();
  };

  const handleImprimirExitoso = () => {
    refetch();
  };

  const renderEstadoVoto = () => {
    if (!resultado) return null;

    const {
      modo_eleccion,
      voto_internas,
      voto_generales,
      fecha_voto_internas,
      fecha_voto_generales,
    } = resultado;

    if (modo_eleccion === "INTERNAS") {
      if (voto_internas) {
        return (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-success" />
            <div>
              <p className="font-semibold text-success">Ya votó en Internas</p>
              {fecha_voto_internas && (
                <p className="text-xs text-text-tertiary mt-1">
                  {new Date(fecha_voto_internas).toLocaleString("es-PY")}
                </p>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-3">
            <Clock size={20} className="text-warning" />
            <p className="font-semibold text-warning">
              Pendiente de votar en Internas
            </p>
          </div>
        );
      }
    } else {
      const tieneVotoInternas = voto_internas;
      const tieneVotoGenerales = voto_generales;

      return (
        <div className="space-y-3">
          {tieneVotoInternas && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Votó en Internas
                </p>
                {fecha_voto_internas && (
                  <p className="text-xs text-text-tertiary">
                    {new Date(fecha_voto_internas).toLocaleString("es-PY")}
                  </p>
                )}
              </div>
            </div>
          )}

          {tieneVotoGenerales ? (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-success" />
              <div>
                <p className="font-semibold text-success">
                  Ya votó en Generales
                </p>
                {fecha_voto_generales && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(fecha_voto_generales).toLocaleString("es-PY")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-3">
              <Clock size={20} className="text-warning" />
              <p className="font-semibold text-warning">
                Pendiente de votar en Generales
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  const puedeMarcarVoto = () => {
    if (!resultado || resultado.estado !== "SIMPATIZANTE_REGISTRADO")
      return false;

    const { modo_eleccion, voto_internas, voto_generales } = resultado;

    if (modo_eleccion === "INTERNAS") {
      return !voto_internas;
    } else {
      return !voto_generales;
    }
  };

  const tieneImpresora = miImpresora && miImpresora.estado === "CONECTADA";

  return (
    <div className="p-6">
      <PageHeader
        title="Consulta de Votantes"
        subtitle="Consultá el estado de votación y datos de padrón"
      />

      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-bg-content border border-border rounded-xl p-6">
          {/* Input y botón Buscar - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative w-full">
              <input
                type="text"
                className="w-full px-4 py-2 pr-10 rounded-lg border border-border bg-bg-content
                  text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-all resize-none"
                placeholder="Ingresá el número de CI"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBuscar();
                }}
              />
              {ci.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleLimpiarCi}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                    p-1 rounded-full text-text-tertiary
                    hover:text-text-primary hover:bg-bg-surface
                    transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={handleBuscar}
              disabled={isLoading || ci.trim().length === 0}
              className="flex items-center px-4 py-2
                bg-primary hover:bg-primary-hover
                text-white text-sm font-medium rounded-lg
                transition-colors gap-2 w-full sm:w-auto"
            >
              <Search size={18} />
              Buscar
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {resultado && !isLoading && (
            <div className="space-y-4">
              {!resultado.datos ? (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
                  <XCircle size={48} className="mx-auto mb-3 text-danger" />
                  <p className="font-semibold text-danger text-lg">
                    No se encontró la CI en el sistema
                  </p>
                  <p className="text-sm text-text-tertiary mt-2">
                    Esta persona no figura en el padrón ni como simpatizante
                    registrado
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-bg-surface border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-text-tertiary uppercase mb-3">
                      Datos Personales
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-tertiary">
                          Nombre completo
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {resultado.datos?.nombre} {resultado.datos?.apellido}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-tertiary">CI</span>
                        <span className="text-sm font-mono font-semibold text-text-primary">
                          {resultado.datos?.ci}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-surface border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-text-tertiary uppercase mb-3">
                      Datos de Votación
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-tertiary">
                          Local
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {resultado.datos?.local_votacion || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-tertiary">Mesa</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {resultado.datos?.mesa || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-tertiary">
                          Orden
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {resultado.datos?.orden || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {renderEstadoVoto()}

                  {/* Botones de accion */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {resultado.estado === "SIMPATIZANTE_REGISTRADO" &&
                      puedeMarcarVoto() &&
                      puedeMarcarVotoPermiso && (
                        <button
                          onClick={handleMarcarVoto}
                          disabled={marcarVotoMutation.isPending}
                          className="flex items-center px-4 py-2
                            bg-primary hover:bg-primary-hover
                            text-white text-sm font-medium rounded-lg
                            transition-colors gap-2 w-full sm:w-auto"
                        >
                          <CheckCircle size={18} />
                          {marcarVotoMutation.isPending
                            ? "Marcando..."
                            : "Marcar que ya votó"}
                        </button>
                      )}

                    {tieneImpresora &&
                      resultado.datos &&
                      resultado.estado !== "NO_ENCONTRADO" &&
                      (() => {
                        const yaImpreso =
                          resultado.modo_eleccion === "INTERNAS"
                            ? resultado.ticket_impreso_internas
                            : resultado.ticket_impreso_generales;

                        const fechaImpresion =
                          resultado.modo_eleccion === "INTERNAS"
                            ? resultado.fecha_impresion_internas
                            : resultado.fecha_impresion_generales;

                        if (yaImpreso && !resultado.puede_reimprimir) {
                          return (
                            <div className="bg-bg-surface border border-border rounded-lg px-4 py-2 flex items-center gap-2">
                              <Printer
                                size={16}
                                className="text-text-tertiary"
                              />
                              <div>
                                <p className="text-xs font-medium text-text-tertiary">
                                  Ticket ya impreso
                                </p>
                                {fechaImpresion && (
                                  <p className="text-xs text-text-tertiary">
                                    {new Date(fechaImpresion).toLocaleString(
                                      "es-PY",
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() => {
                              imprimirMutation.mutate(ciBuscada, {
                                onSuccess: (data) => {
                                  if (data.exitoso) handleImprimirExitoso();
                                },
                              });
                            }}
                            disabled={imprimirMutation.isPending}
                            className="flex items-center px-4 py-2
                            bg-primary hover:bg-primary-hover
                            text-white text-sm font-medium rounded-lg
                            transition-colors gap-2 w-full sm:w-auto"
                          >
                            {yaImpreso ? (
                              <RefreshCw size={18} />
                            ) : (
                              <Printer size={18} />
                            )}
                            {imprimirMutation.isPending
                              ? "Imprimiendo..."
                              : yaImpreso
                                ? "Reimprimir Ticket"
                                : "Imprimir Ticket"}
                          </button>
                        );
                      })()}
                  </div>

                  {!tieneImpresora && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                      <p className="text-xs text-warning">
                        No tenés una impresora conectada. Pedile a un
                        administrador que te asigne una.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaVotantePage;
