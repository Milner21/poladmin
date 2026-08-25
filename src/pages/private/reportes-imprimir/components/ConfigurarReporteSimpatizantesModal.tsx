// src/pages/private/reportes-imprimir/components/ConfigurarReporteSimpatizantesModal.tsx

import type { ColumnaReporte, FiltrosReporte } from "@dto/reportes.types";
import { useAuth } from "@hooks/useAuth";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useUsuarios } from "@pages/private/usuarios/hooks/useUsuarios";
import { pdf } from "@react-pdf/renderer";
import {
  Calendar,
  ChevronDown,
  Columns,
  FileDown,
  FileSpreadsheet,
  Filter,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { useReporteSimpatizantes } from "../hooks/useReporteSimpatizantes";
import {
  COLUMNAS_VOTACION_KEYS,
  columnasSimpatizantes,
  CONFIG_VOTACION_INICIAL,
  opcionesAfiliacion,
  opcionesTransporte,
  type ConfigVotacion,
} from "../reportes/simpatizantes/ReporteSimpatizantesConfig";
import { generarExcelSimpatizantes } from "../reportes/simpatizantes/ReporteSimpatizantesExcel";
import { ReporteSimpatizantesPDF } from "../reportes/simpatizantes/ReporteSimpatizantesPDF";

interface ConfigurarReporteSimpatizantesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfigurarReporteSimpatizantesModal: FC<
  ConfigurarReporteSimpatizantesModalProps
> = ({ visible, onClose }) => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { usuario } = useAuth();
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
    registrado_por_id: undefined,
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
  const [configVotacion, setConfigVotacion] = useState<ConfigVotacion>(
    CONFIG_VOTACION_INICIAL,
  );
  const [columnasVotacionEnabled, setColumnasVotacionEnabled] = useState({
    local_votacion: true,
    mesa_votacion: true,
    orden_votacion: true,
  });
  const [generando, setGenerando] = useState(false);

  // Estados de Candidato
  const [searchCandidato, setSearchCandidato] = useState("");
  const [dropdownCandidatoAbierto, setDropdownCandidatoAbierto] =
    useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  // Estados de Registrador / Creador
  const [searchRegistrador, setSearchRegistrador] = useState("");
  const [dropdownRegistradorAbierto, setDropdownRegistradorAbierto] =
    useState(false);
  const [registradorSeleccionado, setRegistradorSeleccionado] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  // Actualizar campana_id cuando cambie
  useEffect(() => {
    setFiltros((prev) => ({ ...prev, campana_id: campanaSeleccionada }));
    setCandidatoSeleccionado(null);
    setRegistradorSeleccionado(null);
  }, [campanaSeleccionada]);

  // Hook para obtener datos
  const { data: datosSimpatizantes, isLoading } =
    useReporteSimpatizantes(filtros);

  // Candidatos disponibles para filtrar
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
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  // Registradores disponibles para filtrar (incluye administradores y operativos)
  const registradores = useMemo(() => {
    const todosLosUsuarios = usuarios?.filter((u) => u.estado) || [];
    return todosLosUsuarios
      .map((u) => ({
        id: u.id,
        nombre: `${u.nombre} ${u.apellido}`,
        perfil: u.perfil.nombre,
        username: u.username,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [usuarios]);

  const registradoresFiltrados = useMemo(() => {
    if (!searchRegistrador.trim()) return registradores;
    return registradores.filter(
      (r) =>
        r.nombre.toLowerCase().includes(searchRegistrador.toLowerCase()) ||
        r.perfil.toLowerCase().includes(searchRegistrador.toLowerCase()) ||
        r.username.toLowerCase().includes(searchRegistrador.toLowerCase()),
    );
  }, [registradores, searchRegistrador]);

  // Columnas base + columnas de votación inyectadas dinámicamente
  const columnasConVotacion = useMemo((): ColumnaReporte[] => {
    const base = [...columnas];

    if (!configVotacion.incluir) return base;

    if (configVotacion.local) {
      base.push({
        key: COLUMNAS_VOTACION_KEYS.local,
        label: "Local",
        enabled: columnasVotacionEnabled.local_votacion,
      });
    }

    if (configVotacion.mesa) {
      base.push({
        key: COLUMNAS_VOTACION_KEYS.mesa,
        label: "Mesa",
        enabled: columnasVotacionEnabled.mesa_votacion,
      });
    }

    if (configVotacion.orden) {
      base.push({
        key: COLUMNAS_VOTACION_KEYS.orden,
        label: "Orden",
        enabled: columnasVotacionEnabled.orden_votacion,
      });
    }

    return base;
  }, [columnas, configVotacion, columnasVotacionEnabled]);

  const columnasSeleccionadas = columnasConVotacion.filter(
    (c) => c.enabled,
  ).length;

  const hayDatos = datosSimpatizantes?.simpatizantes?.length ?? 0;

  // Handlers
  const handleSeleccionarCandidato = useCallback(
    (candidato: { id: string; nombre: string } | null) => {
      setCandidatoSeleccionado(candidato);
      setFiltros((prev) => ({
        ...prev,
        candidato_id: candidato?.id ?? undefined,
      }));
      setDropdownCandidatoAbierto(false);
      setSearchCandidato("");
    },
    [],
  );

  const handleSeleccionarRegistrador = useCallback(
    (registrador: { id: string; nombre: string } | null) => {
      setRegistradorSeleccionado(registrador);
      setFiltros((prev) => ({
        ...prev,
        registrado_por_id: registrador?.id ?? undefined,
      }));
      setDropdownRegistradorAbierto(false);
      setSearchRegistrador("");
    },
    [],
  );

  const handleFiltroChange = useCallback(
    (campo: keyof FiltrosReporte, valor: string) => {
      setFiltros((prev) => ({
        ...prev,
        [campo]: valor === "todos" ? undefined : valor,
      }));
    },
    [],
  );

  const handleFiltroFecha = useCallback(
    (campo: "fecha_desde" | "fecha_hasta", valor: string) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    [],
  );

  const handleColumnaToggle = useCallback((key: string) => {
    if (
      key === COLUMNAS_VOTACION_KEYS.local ||
      key === COLUMNAS_VOTACION_KEYS.mesa ||
      key === COLUMNAS_VOTACION_KEYS.orden
    ) {
      setColumnasVotacionEnabled((prev) => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev],
      }));
    } else {
      setColumnas((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, enabled: !col.enabled } : col,
        ),
      );
    }
  }, []);

  const handleSeleccionarTodasColumnas = useCallback(() => {
    setColumnas((prev) => prev.map((col) => ({ ...col, enabled: true })));
    setColumnasVotacionEnabled({
      local_votacion: true,
      mesa_votacion: true,
      orden_votacion: true,
    });
  }, []);

  const handleDeseleccionarTodasColumnas = useCallback(() => {
    setColumnas((prev) => prev.map((col) => ({ ...col, enabled: false })));
    setColumnasVotacionEnabled({
      local_votacion: false,
      mesa_votacion: false,
      orden_votacion: false,
    });
  }, []);

  const handleGenerarPDF = useCallback(async () => {
    if (!datosSimpatizantes?.simpatizantes?.length) return;

    setGenerando(true);
    try {
      const configuracionReporte = {
        campana: campanaActual?.nombre || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorCandidato,
        incluirUbicacion,
        tipoVotacion: configVotacion.incluir ? configVotacion.tipo : undefined,
      };

      const columnasParaReporte = columnasConVotacion.filter((c) => c.enabled);

      const doc = (
        <ReporteSimpatizantesPDF
          datos={datosSimpatizantes}
          columnas={columnasParaReporte}
          configuracion={configuracionReporte}
        />
      );

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error generando PDF de simpatizantes");
    } finally {
      setGenerando(false);
    }
  }, [
    datosSimpatizantes,
    campanaActual,
    usuario,
    agruparPorCandidato,
    incluirUbicacion,
    configVotacion,
    columnasConVotacion,
  ]);

  const handleGenerarExcel = useCallback(async () => {
    if (!datosSimpatizantes?.simpatizantes?.length) return;

    setGenerando(true);
    try {
      const configuracionReporte = {
        campana: campanaActual?.nombre || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorCandidato,
        incluirUbicacion,
        tipoVotacion: configVotacion.incluir ? configVotacion.tipo : undefined,
      };

      const columnasParaReporte = columnasConVotacion.filter((c) => c.enabled);

      generarExcelSimpatizantes({
        datos: datosSimpatizantes,
        columnas: columnasParaReporte,
        configuracion: configuracionReporte,
      });
    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error generando Excel de simpatizantes");
    } finally {
      setGenerando(false);
    }
  }, [
    datosSimpatizantes,
    campanaActual,
    usuario,
    agruparPorCandidato,
    incluirUbicacion,
    configVotacion,
    columnasConVotacion,
  ]);

  // Return condicional SIEMPRE después de todos los hooks
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
            type="button"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Selector de Candidato Político */}
              <div className="relative">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Candidato Político
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownCandidatoAbierto(!dropdownCandidatoAbierto);
                      setDropdownRegistradorAbierto(false);
                    }}
                    className="w-full px-3 py-2 text-left border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
                  >
                    <span className="truncate">
                      {candidatoSeleccionado
                        ? candidatoSeleccionado.nombre
                        : "Todos los candidatos"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform ${
                        dropdownCandidatoAbierto ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownCandidatoAbierto && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <input
                          type="text"
                          value={searchCandidato}
                          onChange={(e) => setSearchCandidato(e.target.value)}
                          placeholder="Buscar candidato..."
                          className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleSeleccionarCandidato(null)}
                          className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                            !candidatoSeleccionado
                              ? "bg-primary/10 text-primary"
                              : "text-text-primary"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            Todos los candidatos
                          </div>
                        </button>
                        {candidatosFiltrados.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              handleSeleccionarCandidato({
                                id: c.id,
                                nombre: c.nombre,
                              })
                            }
                            className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                              candidatoSeleccionado?.id === c.id
                                ? "bg-primary/10 text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {c.nombre}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {c.perfil} • @{c.username}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de Registrado Por / Creador */}
              <div className="relative">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Registrado Por (Administrador/Operativo)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownRegistradorAbierto(
                        !dropdownRegistradorAbierto,
                      );
                      setDropdownCandidatoAbierto(false);
                    }}
                    className="w-full px-3 py-2 text-left border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
                  >
                    <span className="truncate">
                      {registradorSeleccionado
                        ? registradorSeleccionado.nombre
                        : "Todos los registradores"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform ${
                        dropdownRegistradorAbierto ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownRegistradorAbierto && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <input
                          type="text"
                          value={searchRegistrador}
                          onChange={(e) => setSearchRegistrador(e.target.value)}
                          placeholder="Buscar usuario o administrador..."
                          className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleSeleccionarRegistrador(null)}
                          className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                            !registradorSeleccionado
                              ? "bg-primary/10 text-primary"
                              : "text-text-primary"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            Todos los registradores
                          </div>
                        </button>
                        {registradoresFiltrados.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() =>
                              handleSeleccionarRegistrador({
                                id: r.id,
                                nombre: r.nombre,
                              })
                            }
                            className={`w-full px-3 py-2 text-left hover:bg-bg-base transition-colors ${
                              registradorSeleccionado?.id === r.id
                                ? "bg-primary/10 text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {r.nombre}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {r.perfil} • @{r.username}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                Columnas a mostrar ({columnasSeleccionadas} de{" "}
                {columnasConVotacion.length})
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSeleccionarTodasColumnas}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  onClick={handleDeseleccionarTodasColumnas}
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Deseleccionar todas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {columnasConVotacion.map((columna) => (
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

              <label className="flex items-center gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={configVotacion.incluir}
                  onChange={(e) =>
                    setConfigVotacion((prev) => ({
                      ...prev,
                      incluir: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Datos de votación
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Incluye local, mesa y orden del padrón electoral
                  </p>
                </div>
              </label>

              {configVotacion.incluir && (
                <div className="ml-2 border border-border rounded-lg p-4 bg-bg-content space-y-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider m-0">
                    Configuración de datos de votación
                  </p>

                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2 m-0">
                      Tipo de padrón
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo_votacion"
                          value="general"
                          checked={configVotacion.tipo === "general"}
                          onChange={() =>
                            setConfigVotacion((prev) => ({
                              ...prev,
                              tipo: "general",
                            }))
                          }
                          className="accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-text-primary">
                          Generales
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo_votacion"
                          value="interna"
                          checked={configVotacion.tipo === "interna"}
                          onChange={() =>
                            setConfigVotacion((prev) => ({
                              ...prev,
                              tipo: "interna",
                            }))
                          }
                          className="accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-text-primary">
                          Internas
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2 m-0">
                      Columnas a incluir
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configVotacion.local}
                          onChange={(e) =>
                            setConfigVotacion((prev) => ({
                              ...prev,
                              local: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-text-primary">Local</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configVotacion.mesa}
                          onChange={(e) =>
                            setConfigVotacion((prev) => ({
                              ...prev,
                              mesa: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-text-primary">Mesa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configVotacion.orden}
                          onChange={(e) =>
                            setConfigVotacion((prev) => ({
                              ...prev,
                              orden: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-text-primary">Orden</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
                {filtros.registrado_por_id && (
                  <p className="m-0">
                    Registrado Por: {registradorSeleccionado?.nombre}
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
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-base transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
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
              type="button"
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