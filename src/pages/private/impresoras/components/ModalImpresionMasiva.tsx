// src/pages/private/impresoras/components/ModalImpresionMasiva.tsx

import type {
  ImprimirLoteFiltros,
  LotePreviewResponse,
} from "@dto/impresora.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useCandidatosSuperiores } from "@pages/private/usuarios/hooks/useCandidatosSuperiores";
import { impresorasService } from "@services/impresoras.service";
import {
  Building2,
  Loader2,
  MapPin,
  Printer,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import { useMiImpresora } from "../hooks/useMiImpresora";

interface ModalImpresionMasivaProps {
  isOpen: boolean;
  onClose: () => void;
  onImpresionCompletada?: () => void;
}

export const ModalImpresionMasiva: FC<ModalImpresionMasivaProps> = ({
  isOpen,
  onClose,
  onImpresionCompletada,
}) => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { data: miImpresora } = useMiImpresora();
  const { data: candidatos } = useCandidatosSuperiores(campanaSeleccionada, 99);

  const [filtros, setFiltros] = useState<ImprimirLoteFiltros>({
    candidato_id: "",
    barrio: "",
    local_votacion: "",
    solo_pendientes: true,
    modo_eleccion: undefined,
  });

  const [previewData, setPreviewData] = useState<LotePreviewResponse | null>(
    null,
  );
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);

  const impresoraConectada = miImpresora && miImpresora.estado === "CONECTADA";

  useEffect(() => {
    const modo = campanaActual?.configuracion?.modo_eleccion;
    if (modo) {
      setFiltros((prev) => ({
        ...prev,
        modo_eleccion: modo as "INTERNAS" | "GENERALES",
      }));
    }
  }, [campanaActual]);

  const cargarPreview = async (filtrosActuales: ImprimirLoteFiltros) => {
    setCargandoPreview(true);
    try {
      const payload: ImprimirLoteFiltros = {
        ...filtrosActuales,
        candidato_id: filtrosActuales.candidato_id || undefined,
        barrio: filtrosActuales.barrio?.trim() || undefined,
        local_votacion: filtrosActuales.local_votacion?.trim() || undefined,
      };
      const res = await impresorasService.previewLote(payload);
      setPreviewData(res);
    } catch {
      toast.error("Error al obtener preview de simpatizantes");
    } finally {
      setCargandoPreview(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarPreview(filtros);
    }
  }, [isOpen, filtros]);

  const handleFiltroChange = (
    campo: keyof ImprimirLoteFiltros,
    valor: string | boolean,
  ) => {
    setFiltros((prev) => {
      const nuevos = { ...prev, [campo]: valor };
      return nuevos;
    });
  };

  const handleBuscarManual = () => {
    cargarPreview(filtros);
  };

  const handleEjecutarImpresion = async () => {
    if (!impresoraConectada) {
      toast.error("No tenés una impresora conectada");
      return;
    }

    if (!previewData || previewData.total === 0) {
      toast.error("No hay tickets para imprimir con los filtros seleccionados");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmás la impresión de ${previewData.total} tickets en la impresora ${miImpresora?.nombre || "asignada"}? Los tickets se imprimirán y cortarán uno por uno.`,
    );
    if (!confirmar) return;

    setImprimiendo(true);
    try {
      const payload: ImprimirLoteFiltros = {
        ...filtros,
        candidato_id: filtros.candidato_id || undefined,
        barrio: filtros.barrio?.trim() || undefined,
        local_votacion: filtros.local_votacion?.trim() || undefined,
      };
      const res = await impresorasService.imprimirLote(payload);
      toast.success(res.mensaje);
      if (onImpresionCompletada) onImpresionCompletada();
      onClose();
    } catch {
      toast.error("Error al despachar el lote de impresión");
    } finally {
      setImprimiendo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Printer size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary m-0">
                Impresión Masiva de Tickets
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5 m-0">
                Imprime y corta tickets secuencialmente por candidato o zona
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Estado de la impresora */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between text-sm ${
              impresoraConectada
                ? "bg-success/10 border-success/30 text-success"
                : "bg-warning/10 border-warning/30 text-warning"
            }`}
          >
            <div className="flex items-center gap-2">
              <Printer size={16} />
              <span>
                Impresora:{" "}
                <strong>
                  {miImpresora ? miImpresora.nombre : "Sin impresora asignada"}
                </strong>
              </span>
            </div>
            <span className="font-semibold text-xs uppercase px-2 py-0.5 rounded bg-bg-content/50">
              {impresoraConectada ? "Lista / Conectada" : "Desconectada"}
            </span>
          </div>

          {/* Filtros */}
          <div className="bg-bg-base border border-border rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Filtros del Lote
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1">
                  <Users size={14} /> Candidato / Líder
                </label>
                <select
                  value={filtros.candidato_id || ""}
                  onChange={(e) =>
                    handleFiltroChange("candidato_id", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    Todos los simpatizantes de la campaña
                  </option>
                  {candidatos?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} ({c.nivel?.nombre || "Candidato"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1">
                  <MapPin size={14} /> Barrio
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por barrio..."
                  value={filtros.barrio || ""}
                  onChange={(e) => handleFiltroChange("barrio", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscarManual()}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1">
                  <Building2 size={14} /> Local de Votación
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por escuela/local..."
                  value={filtros.local_votacion || ""}
                  onChange={(e) =>
                    handleFiltroChange("local_votacion", e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleBuscarManual()}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Etapa / Modo
                </label>
                <select
                  value={filtros.modo_eleccion || "GENERALES"}
                  onChange={(e) =>
                    handleFiltroChange(
                      "modo_eleccion",
                      e.target.value as "INTERNAS" | "GENERALES",
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INTERNAS">Internas</option>
                  <option value="GENERALES">Generales</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.solo_pendientes}
                  onChange={(e) =>
                    handleFiltroChange("solo_pendientes", e.target.checked)
                  }
                  className="w-4 h-4 accent-primary cursor-pointer rounded"
                />
                <span className="text-sm font-medium text-text-primary">
                  Imprimir solo tickets no impresos anteriormente
                </span>
              </label>

              <button
                type="button"
                onClick={handleBuscarManual}
                disabled={cargandoPreview}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-bg-content hover:bg-bg-hover text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <Search size={13} />
                Actualizar vista previa
              </button>
            </div>
          </div>

          {/* Resumen y lista previa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Vista Previa de Impresión
              </h4>
              {previewData && (
                <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                  {previewData.total} tickets encontrados
                </span>
              )}
            </div>

            {cargandoPreview ? (
              <div className="p-8 border border-border rounded-lg bg-bg-base text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span className="text-xs text-text-tertiary">
                  Consultando simpatizantes para el lote...
                </span>
              </div>
            ) : previewData && previewData.total > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-bg-base text-text-tertiary uppercase sticky top-0 border-b border-border">
                    <tr>
                      <th className="p-2.5">CI</th>
                      <th className="p-2.5">Nombre y Apellido</th>
                      <th className="p-2.5">Barrio</th>
                      <th className="p-2.5">Local / Mesa</th>
                      <th className="p-2.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewData.simpatizantes.map((s) => (
                      <tr key={s.id} className="hover:bg-bg-base/50">
                        <td className="p-2.5 font-mono font-medium text-text-primary">
                          {s.documento}
                        </td>
                        <td className="p-2.5 text-text-primary">
                          {s.nombre} {s.apellido}
                        </td>
                        <td className="p-2.5 text-text-secondary">
                          {s.barrio || "-"}
                        </td>
                        <td className="p-2.5 text-text-secondary">
                          {s.local_votacion || "-"} (Mesa: {s.mesa || "-"})
                        </td>
                        <td className="p-2.5">
                          {s.ticket_impreso ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">
                              Reimpresión
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 border border-border rounded-lg bg-bg-base text-center text-text-tertiary text-xs">
                No se encontraron simpatizantes con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-5 flex justify-between items-center bg-bg-base/50 rounded-b-xl">
          <div className="text-xs text-text-tertiary">
            {previewData && previewData.total > 0
              ? `Se enviarán ${previewData.total} trabajos secuenciales a la ticketera.`
              : "Selecciona los filtros para comenzar."}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={imprimiendo}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-content transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleEjecutarImpresion}
              disabled={
                imprimiendo ||
                !impresoraConectada ||
                !previewData ||
                previewData.total === 0
              }
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {imprimiendo ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Despachando tickets...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  Imprimir {previewData?.total ?? 0} Tickets
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
