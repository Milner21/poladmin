import { useState, type FC } from "react";
import { PageHeader } from "@components";
import { Search, CheckCircle, XCircle, Printer, UserPlus, Clock } from "lucide-react";
import { useConsultaVotante } from "../hooks/useConsultaVotante";
import { useMarcarVoto } from "@pages/private/simpatizantes/hooks/useMarcarVoto";
import { useImprimirPadron } from "@pages/private/impresoras/hooks/useImprimirPadron";
import { useMiImpresora } from "@pages/private/impresoras/hooks/useMiImpresora";
import type { ResultadoConsultaVotante } from "@dto/padron.types";
import ModalRegistrarSimpatizante from "./components/ModalRegistrarSimpatizante";

const ConsultaVotantePage: FC = () => {
  const [ci, setCi] = useState("");
  const [ciBuscada, setCiBuscada] = useState("");
  const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false);
  const [resultadoActual, setResultadoActual] = useState<ResultadoConsultaVotante | null>(null);

  const { data: resultado, isLoading, refetch } = useConsultaVotante(ciBuscada, !!ciBuscada);
  const marcarVotoMutation = useMarcarVoto();
  const imprimirMutation = useImprimirPadron();
  const { data: miImpresora } = useMiImpresora();

  const handleBuscar = () => {
    const ciLimpia = ci.trim().replace(/\./g, "");
    if (ciLimpia.length === 0) {
      return;
    }
    setCiBuscada(ciLimpia);
  };

  const handleMarcarVoto = async () => {
    if (!resultado?.simpatizante_id) return;

    await marcarVotoMutation.mutateAsync(resultado.simpatizante_id);
    refetch();
  };

  const handleImprimir = async () => {
    if (!ciBuscada) return;
    await imprimirMutation.mutateAsync(ciBuscada);
  };

  const handleAbrirModalRegistrar = () => {
    if (resultado) {
      setResultadoActual(resultado);
      setModalRegistrarOpen(true);
    }
  };

  const handleRegistroExitoso = () => {
    setModalRegistrarOpen(false);
    refetch();
  };

  const renderEstadoVoto = () => {
    if (!resultado) return null;

    const { modo_eleccion, voto_internas, voto_generales, fecha_voto_internas, fecha_voto_generales } = resultado;

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
            <p className="font-semibold text-warning">Pendiente de votar en Internas</p>
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
                <p className="text-sm font-medium text-primary">Votó en Internas</p>
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
                <p className="font-semibold text-success">Ya votó en Generales</p>
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
              <p className="font-semibold text-warning">Pendiente de votar en Generales</p>
            </div>
          )}
        </div>
      );
    }
  };

  const puedeMarcarVoto = () => {
    if (!resultado || resultado.estado !== "SIMPATIZANTE_REGISTRADO") return false;

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
          <div className="flex gap-3">
            <input
              type="text"
              className="input flex-1"
              placeholder="Ingresá el número de CI"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBuscar();
              }}
            />
            <button
              onClick={handleBuscar}
              disabled={isLoading || ci.trim().length === 0}
              className="btn btn-primary flex items-center gap-2"
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
            <div className="mt-6 space-y-4">
              {resultado.estado === "NO_ENCONTRADO" ? (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
                  <XCircle size={48} className="mx-auto mb-3 text-danger" />
                  <p className="font-semibold text-danger text-lg">
                    No se encontró la CI en el sistema
                  </p>
                  <p className="text-sm text-text-tertiary mt-2">
                    Esta persona no figura en el padrón ni como simpatizante registrado
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
                        <span className="text-sm text-text-tertiary">Nombre completo</span>
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
                        <span className="text-sm text-text-tertiary">Local</span>
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
                        <span className="text-sm text-text-tertiary">Orden</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {resultado.datos?.orden || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {renderEstadoVoto()}

                  <div className="flex gap-3">
                    {resultado.estado === "SIMPATIZANTE_REGISTRADO" && puedeMarcarVoto() && (
                      <button
                        onClick={handleMarcarVoto}
                        disabled={marcarVotoMutation.isPending}
                        className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        {marcarVotoMutation.isPending ? "Marcando..." : "Marcar que ya votó"}
                      </button>
                    )}

                    {resultado.estado === "EN_PADRON_NO_REGISTRADO" && (
                      <button
                        onClick={handleAbrirModalRegistrar}
                        className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} />
                        Registrar como Simpatizante
                      </button>
                    )}

                    {tieneImpresora && resultado.datos && (
                      <button
                        onClick={handleImprimir}
                        disabled={imprimirMutation.isPending}
                        className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                      >
                        <Printer size={18} />
                        {imprimirMutation.isPending ? "Imprimiendo..." : "Imprimir Ticket"}
                      </button>
                    )}
                  </div>

                  {!tieneImpresora && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                      <p className="text-xs text-warning">
                        No tenés una impresora conectada. Pedile a un administrador que te asigne una.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {resultadoActual && (
        <ModalRegistrarSimpatizante
          isOpen={modalRegistrarOpen}
          onClose={() => setModalRegistrarOpen(false)}
          datos={resultadoActual.datos}
          onSuccess={handleRegistroExitoso}
        />
      )}
    </div>
  );
};

export default ConsultaVotantePage;