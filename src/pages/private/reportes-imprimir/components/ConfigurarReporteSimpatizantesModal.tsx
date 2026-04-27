import { useState, useEffect, useMemo, type FC } from "react";
import {
  X,
  FileDown,
  FileSpreadsheet,
  Filter,
  Columns,
  Calendar,
  ChevronDown,
  Search,
} from "lucide-react";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useUsuarios } from "@pages/private/usuarios/hooks/useUsuarios";
import { useReporteSimpatizantes } from "../hooks/useReporteSimpatizantes";
import { pdf } from "@react-pdf/renderer";
import { useAuth } from "@hooks/useAuth";
import { ReporteSimpatizantesPDF } from "../reportes/simpatizantes/ReporteSimpatizantesPDF";
import { generarExcelSimpatizantes } from "../reportes/simpatizantes/ReporteSimpatizantesExcel";
import {
  columnasSimpatizantes,
  intencionesVoto,
  origenes,
  opcionesAfiliacion,
  opcionesTransporte,
} from "../reportes/simpatizantes/ReporteSimpatizantesConfig";
import type { ColumnaReporte, FiltrosReporte } from "@dto/reportes.types";

interface ConfigurarReporteSimpatizantesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfigurarReporteSimpatizantesModal: FC<
  ConfigurarReporteSimpatizantesModalProps
> = ({ visible, onClose }) => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada(); // ← Debe incluir campanaActual
  const { usuario } = useAuth(); // ← Debe estar esta línea
  const { data: usuarios } = useUsuarios(campanaSeleccionada);

  // Fechas por defecto (últimos 30 días)
  const { fechaDesde, fechaHasta } = useMemo(() => {
    const hasta = new Date().toISOString().split("T")[0];
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    return {
      fechaDesde: desde.toISOString().split("T")[0],
      fechaHasta: hasta,
    };
  }, []);

  // Estados del modal
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    campana_id: campanaSeleccionada,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
    candidato_id: undefined,
    departamento: undefined,
    distrito: undefined,
    barrio: undefined,
    intencion_voto: undefined,
    es_afiliado: undefined,
    necesita_transporte: undefined,
    origen_registro: undefined,
  });

  const [columnas, setColumnas] = useState<ColumnaReporte[]>(
    columnasSimpatizantes,
  );
  const [agruparPorCandidato, setAgruparPorCandidato] = useState(false);
  const [incluirUbicacion, setIncluirUbicacion] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [searchCandidato, setSearchCandidato] = useState("");
  const [dropdownCandidatoAbierto, setDropdownCandidatoAbierto] =
    useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  // Actualizar campana_id cuando cambie
  useEffect(() => {
    setFiltros((prev) => ({ ...prev, campana_id: campanaSeleccionada }));
    setCandidatoSeleccionado(null);
  }, [campanaSeleccionada]);

  // Hook para obtener datos
  const { data: datosSimpatizantes, isLoading } =
    useReporteSimpatizantes(filtros);

  // Filtrar usuarios que son candidatos (no operativos)
  const candidatos = useMemo(() => {
    const candidatosFiltrados =
      usuarios?.filter((u) => !u.perfil.es_operativo && u.estado) || [];
    return candidatosFiltrados
      .map((u) => ({
        id: u.id,
        nombre: `${u.nombre} ${u.apellido}`,
        perfil: u.perfil.nombre,
        username: u.username,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre)); // ← Ordenar alfabéticamente
  }, [usuarios]);

  const candidatosFiltrados = useMemo(() => {
    if (!searchCandidato.trim()) return candidatos;
    return candidatos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(searchCandidato.toLowerCase()) ||
        c.perfil.toLowerCase().includes(searchCandidato.toLowerCase()) ||
        c.username.toLowerCase().includes(searchCandidato.toLowerCase()),
    );
  }, [candidatos, searchCandidato]);

  const handleSeleccionarCandidato = (
    candidato: { id: string; nombre: string } | null,
  ) => {
    setCandidatoSeleccionado(candidato);
    handleFiltroChange("candidato_id", candidato?.id || "todos");
    setDropdownCandidatoAbierto(false);
    setSearchCandidato("");
  };

  const handleFiltroChange = (campo: keyof FiltrosReporte, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor === "todos" ? undefined : valor,
    }));
  };

  const handleFiltroFecha = (
    campo: "fecha_desde" | "fecha_hasta",
    valor: string,
  ) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleColumnaToggle = (key: string) => {
    setColumnas((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, enabled: !col.enabled } : col,
      ),
    );
  };

  const handleSeleccionarTodasColumnas = () => {
    setColumnas((prev) => prev.map((col) => ({ ...col, enabled: true })));
  };

  const handleDeseleccionarTodasColumnas = () => {
    setColumnas((prev) => prev.map((col) => ({ ...col, enabled: false })));
  };

  const handleGenerarPDF = async () => {
    if (!datosSimpatizantes?.simpatizantes?.length) return;

    setGenerando(true);
    try {
      const configuracionReporte = {
        campana: campanaActual?.nombre || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorCandidato,
        incluirUbicacion,
      };

      const columnasSeleccionadas = columnas.filter((c) => c.enabled);

      const doc = (
        <ReporteSimpatizantesPDF
          datos={datosSimpatizantes}
          columnas={columnasSeleccionadas}
          configuracion={configuracionReporte}
        />
      );

      // Generar PDF y abrir en nueva pestaña
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error generando PDF de simpatizantes");
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = async () => {
    if (!datosSimpatizantes?.simpatizantes?.length) return;

    setGenerando(true);
    try {
      const configuracionReporte = {
        campana: campanaActual?.nombre || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorCandidato,
        incluirUbicacion,
      };

      const columnasSeleccionadas = columnas.filter((c) => c.enabled);

      generarExcelSimpatizantes({
        datos: datosSimpatizantes,
        columnas: columnasSeleccionadas,
        configuracion: configuracionReporte,
      });

      onClose();
    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error generando Excel de simpatizantes");
    } finally {
      setGenerando(false);
    }
  };

  const columnasSeleccionadas = columnas.filter((c) => c.enabled).length;
  const hayDatos = datosSimpatizantes?.simpatizantes?.length ?? 0;

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2">
              <Filter size={20} />
              Configurar Reporte - Simpatizantes
            </h3>
            <p className="text-sm text-text-tertiary mt-1 m-0">
              {isLoading
                ? "Cargando datos..."
                : `${hayDatos} simpatizantes encontrados`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filtros */}
          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter size={16} />
              Filtros
            </h4>

            {/* Primera fila de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Candidato/Registrador con búsqueda */}
              <div className="relative">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Candidato/Registrador
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setDropdownCandidatoAbierto(!dropdownCandidatoAbierto)
                    }
                    className="w-full px-3 py-2 text-left border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
                  >
                    <span className="truncate">
                      {candidatoSeleccionado
                        ? candidatoSeleccionado.nombre
                        : "Todos los candidatos"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform ${dropdownCandidatoAbierto ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {dropdownCandidatoAbierto && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
                      {/* Campo de búsqueda */}
                      <div className="p-3 border-b border-border">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                          />
                          <input
                            type="text"
                            value={searchCandidato}
                            onChange={(e) => setSearchCandidato(e.target.value)}
                            placeholder="Buscar candidato..."
                            className="w-full pl-9 pr-8 py-2 border border-border rounded bg-bg-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                          {searchCandidato && (
                            <button
                              onClick={() => setSearchCandidato("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lista de opciones */}
                      <div className="max-h-48 overflow-y-auto">
                        {/* Opción "Todos" */}
                        <button
                          onClick={() => handleSeleccionarCandidato(null)}
                          className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                            !candidatoSeleccionado
                              ? "bg-primary/10 text-primary"
                              : "text-text-primary"
                          }`}
                        >
                          <div>
                            <div className="font-medium">
                              Todos los candidatos
                            </div>
                            <div className="text-xs text-text-tertiary">
                              Sin filtro por candidato
                            </div>
                          </div>
                        </button>

                        {/* Candidatos filtrados */}
                        {candidatosFiltrados.length > 0 ? (
                          candidatosFiltrados.map((candidato) => (
                            <button
                              key={candidato.id}
                              onClick={() =>
                                handleSeleccionarCandidato({
                                  id: candidato.id,
                                  nombre: candidato.nombre,
                                })
                              }
                              className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                                candidatoSeleccionado?.id === candidato.id
                                  ? "bg-primary/10 text-primary"
                                  : "text-text-primary"
                              }`}
                            >
                              <div>
                                <div className="font-medium">
                                  {candidato.nombre}
                                </div>
                                <div className="text-xs text-text-tertiary">
                                  {candidato.perfil} • @{candidato.username}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-text-tertiary text-sm">
                            No se encontraron candidatos
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay para cerrar dropdown */}
                {dropdownCandidatoAbierto && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownCandidatoAbierto(false)}
                  />
                )}
              </div>

              {/* Resto de filtros igual... */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Intención de Voto
                </label>
                <select
                  value={filtros.intencion_voto || "todos"}
                  onChange={(e) =>
                    handleFiltroChange("intencion_voto", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {intencionesVoto.map((intencion) => (
                    <option key={intencion.key} value={intencion.key}>
                      {intencion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Origen de Registro
                </label>
                <select
                  value={filtros.origen_registro || "todos"}
                  onChange={(e) =>
                    handleFiltroChange("origen_registro", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {origenes.map((origen) => (
                    <option key={origen.key} value={origen.key}>
                      {origen.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Segunda fila de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Afiliación
                </label>
                <select
                  value={
                    filtros.es_afiliado !== undefined
                      ? filtros.es_afiliado
                        ? "afiliados"
                        : "no_afiliados"
                      : "todos"
                  }
                  onChange={(e) =>
                    handleFiltroChange(
                      "es_afiliado",
                      e.target.value === "afiliados"
                        ? "true"
                        : e.target.value === "no_afiliados"
                          ? "false"
                          : "todos",
                    )
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {opcionesAfiliacion.map((opcion) => (
                    <option key={opcion.key} value={opcion.key}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Transporte
                </label>
                <select
                  value={
                    filtros.necesita_transporte !== undefined
                      ? filtros.necesita_transporte
                        ? "necesita"
                        : "no_necesita"
                      : "todos"
                  }
                  onChange={(e) =>
                    handleFiltroChange(
                      "necesita_transporte",
                      e.target.value === "necesita"
                        ? "true"
                        : e.target.value === "no_necesita"
                          ? "false"
                          : "todos",
                    )
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {opcionesTransporte.map((opcion) => (
                    <option key={opcion.key} value={opcion.key}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Desde
                </label>
                <input
                  type="date"
                  value={filtros.fecha_desde || ""}
                  onChange={(e) =>
                    handleFiltroFecha("fecha_desde", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fecha_hasta || ""}
                  onChange={(e) =>
                    handleFiltroFecha("fecha_hasta", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Tercera fila - Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={filtros.departamento || ""}
                  onChange={(e) =>
                    handleFiltroChange("departamento", e.target.value)
                  }
                  placeholder="ej: Alto Paraná"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Distrito
                </label>
                <input
                  type="text"
                  value={filtros.distrito || ""}
                  onChange={(e) =>
                    handleFiltroChange("distrito", e.target.value)
                  }
                  placeholder="ej: Hernandarias"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  value={filtros.barrio || ""}
                  onChange={(e) => handleFiltroChange("barrio", e.target.value)}
                  placeholder="ej: Centro"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Columnas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Columns size={16} />
                Columnas a mostrar ({columnasSeleccionadas} de {columnas.length}
                )
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleSeleccionarTodasColumnas}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  Seleccionar todas
                </button>
                <button
                  onClick={handleDeseleccionarTodasColumnas}
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Deseleccionar todas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {columnas.map((columna) => (
                <label
                  key={columna.key}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-base cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={columna.enabled}
                    onChange={() => handleColumnaToggle(columna.key)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-text-primary">
                    {columna.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Opciones adicionales */}
          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Opciones
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={agruparPorCandidato}
                  onChange={(e) => setAgruparPorCandidato(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Agrupar por candidato asignado
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Organiza los simpatizantes por el candidato que los tiene
                    asignados
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={incluirUbicacion}
                  onChange={(e) => setIncluirUbicacion(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Incluir información de geolocalización
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Agrega columnas de latitud, longitud y estado de GPS
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview de datos */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hayDatos > 0 ? (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-success">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm font-medium">
                  {hayDatos} simpatizantes encontrados con los filtros aplicados
                </span>
              </div>
              <div className="text-xs text-text-tertiary mt-2 space-y-1">
                <p className="m-0">
                  Se mostrarán {columnasSeleccionadas} columnas en el reporte
                </p>
                <p className="m-0">
                  Período: {filtros.fecha_desde} a {filtros.fecha_hasta}
                </p>
                {filtros.candidato_id && (
                  <p className="m-0">
                    Candidato: {candidatoSeleccionado?.nombre}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-warning">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm font-medium">
                  No se encontraron simpatizantes con los filtros aplicados
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-1 m-0">
                Intentá ajustar los filtros para obtener resultados
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-base transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleGenerarExcel}
              disabled={generando || !hayDatos || columnasSeleccionadas === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-success hover:bg-success/80 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generando ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              Generar Excel
            </button>

            <button
              onClick={handleGenerarPDF}
              disabled={generando || !hayDatos || columnasSeleccionadas === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generando ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown size={16} />
              )}
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
