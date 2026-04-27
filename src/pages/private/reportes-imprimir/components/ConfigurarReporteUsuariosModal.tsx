//src/pages/private/reportes-imprimir/components/ConfigurarReporteUsuariosModal.tsx

import { useState, useEffect, type FC } from "react";
import {
  X,
  FileDown,
  FileSpreadsheet,
  Filter,
  Columns,
  Calendar,
} from "lucide-react";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePerfiles } from "@pages/private/perfiles/hooks/usePerfiles";
import { useNiveles } from "@pages/private/niveles/hooks/useNiveles";
import { useReporteUsuarios } from "../hooks/useReporteUsuarios";
import { columnasUsuarios } from "../reportes/usuarios/ReporteUsuariosConfig";
import type { ColumnaReporte, FiltrosReporte } from "@dto/reportes.types";
import { useAuth } from "@hooks/useAuth";
import { ReporteUsuariosPDF } from "../reportes/usuarios/ReporteUsuariosPDF";
import { pdf } from "@react-pdf/renderer";
import { generarExcelUsuarios } from "../reportes/usuarios/ReporteUsuariosExcel";

interface ConfigurarReporteUsuariosModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfigurarReporteUsuariosModal: FC<
  ConfigurarReporteUsuariosModalProps
> = ({ visible, onClose }) => {
  const { campanaSeleccionada } = useCampanaSeleccionada();
  const { data: perfiles } = usePerfiles();
  const { data: niveles } = useNiveles();

  // Estados del modal
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    campana_id: campanaSeleccionada,
    perfil_id: undefined,
    nivel_id: undefined,
    estado: undefined,
    candidato_superior_id: undefined,
    fecha_registro_desde: undefined,
    fecha_registro_hasta: undefined,
    tiene_telefono: undefined,
    tiene_nivel: undefined,
  });
  const { usuario } = useAuth();
  const [columnas, setColumnas] = useState<ColumnaReporte[]>(columnasUsuarios);
  const [agruparPorNivel, setAgruparPorNivel] = useState(false);
  const [incluirEstadisticas, setIncluirEstadisticas] = useState(false);
  const [generando, setGenerando] = useState(false);

  // Actualizar campana_id cuando cambie
  useEffect(() => {
    setFiltros((prev) => ({ ...prev, campana_id: campanaSeleccionada }));
  }, [campanaSeleccionada]);

  // Hook para obtener datos
  const { data: datosUsuarios, isLoading } = useReporteUsuarios(filtros);

 

  const handleFiltroChange = (campo: keyof FiltrosReporte, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor === "todos" ? undefined : valor,
    }));
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
    if (!datosUsuarios?.usuarios?.length) return;

    setGenerando(true);
    try {
      const configuracion = {
        campana: campanaSeleccionada || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorNivel,
        incluirEstadisticas, // ← AGREGAR ESTA LÍNEA
      };

      const columnasSeleccionadas = columnas.filter((c) => c.enabled);

      const doc = (
        <ReporteUsuariosPDF
          datos={datosUsuarios}
          columnas={columnasSeleccionadas}
          configuracion={configuracion}
        />
      );

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error generando PDF");
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = async () => {
    if (!datosUsuarios?.usuarios?.length) return;

    setGenerando(true);
    try {
      const configuracion = {
        campana: campanaSeleccionada || "Sin campaña",
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        agruparPorNivel,
        incluirEstadisticas, // ← AGREGAR ESTA LÍNEA
      };

      const columnasSeleccionadas = columnas.filter((c) => c.enabled);

      generarExcelUsuarios({
        datos: datosUsuarios,
        columnas: columnasSeleccionadas,
        configuracion,
      });

      onClose();
    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error generando Excel");
    } finally {
      setGenerando(false);
    }
  };

  const columnasSeleccionadas = columnas.filter((c) => c.enabled).length;
  const hayDatos = datosUsuarios?.usuarios?.length ?? 0;

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2">
              <Filter size={20} />
              Configurar Reporte - Usuarios
            </h3>
            <p className="text-sm text-text-tertiary mt-1 m-0">
              {isLoading
                ? "Cargando datos..."
                : `${hayDatos} usuarios encontrados`}
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
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Filtros
            </h4>

            {/* Primera fila de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Perfil
                </label>
                <select
                  value={filtros.perfil_id || "todos"}
                  onChange={(e) =>
                    handleFiltroChange("perfil_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos los perfiles</option>
                  {perfiles?.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.nombre} {perfil.es_operativo ? "(Operativo)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nivel
                </label>
                <select
                  value={filtros.nivel_id || "todos"}
                  onChange={(e) =>
                    handleFiltroChange("nivel_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos los niveles</option>
                  {niveles?.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>
                      {nivel.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Estado
                </label>
                <select
                  value={
                    filtros.estado !== undefined
                      ? String(filtros.estado)
                      : "todos"
                  }
                  onChange={(e) => handleFiltroChange("estado", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos</option>
                  <option value="true">Solo activos</option>
                  <option value="false">Solo inactivos</option>
                </select>
              </div>
            </div>

            {/* Segunda fila - Candidato Superior */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Candidato Superior
                </label>
                <select
                  value={filtros.candidato_superior_id || "todos"}
                  onChange={(e) =>
                    handleFiltroChange("candidato_superior_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos los candidatos superiores</option>
                  {/* Obtener candidatos únicos de la lista de usuarios */}
                  {Array.from(
                    new Set(
                      datosUsuarios?.usuarios
                        ?.filter((u) => u.candidato_superior)
                        ?.map((u) =>
                          JSON.stringify({
                            id: u.candidato_superior,
                            nombre: u.candidato_superior,
                          }),
                        ),
                    ),
                  )
                    .map((jsonStr) => JSON.parse(jsonStr))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map((candidato: { id: string; nombre: string }) => (
                      <option key={candidato.nombre} value={candidato.nombre}>
                        {candidato.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Tercera fila - Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Fecha de registro desde
                </label>
                <input
                  type="date"
                  value={filtros.fecha_registro_desde || ""}
                  onChange={(e) =>
                    handleFiltroChange("fecha_registro_desde", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Fecha de registro hasta
                </label>
                <input
                  type="date"
                  value={filtros.fecha_registro_hasta || ""}
                  onChange={(e) =>
                    handleFiltroChange("fecha_registro_hasta", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Cuarta fila - Filtros adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Teléfono
                </label>
                <select
                  value={
                    filtros.tiene_telefono !== undefined
                      ? String(filtros.tiene_telefono)
                      : "todos"
                  }
                  onChange={(e) =>
                    handleFiltroChange("tiene_telefono", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos</option>
                  <option value="true">Solo con teléfono</option>
                  <option value="false">Solo sin teléfono</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nivel asignado
                </label>
                <select
                  value={
                    filtros.tiene_nivel !== undefined
                      ? String(filtros.tiene_nivel)
                      : "todos"
                  }
                  onChange={(e) =>
                    handleFiltroChange("tiene_nivel", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos</option>
                  <option value="true">Solo con nivel asignado</option>
                  <option value="false">Solo sin nivel asignado</option>
                </select>
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  checked={agruparPorNivel}
                  onChange={(e) => setAgruparPorNivel(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Agrupar por nivel jerárquico
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Organiza los usuarios por su nivel en la estructura
                    organizacional (Intendente → Concejal → Coordinador, etc.)
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={incluirEstadisticas}
                  onChange={(e) => setIncluirEstadisticas(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Incluir página de estadísticas
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Agrega una página inicial con resumen de conteos por nivel y
                    perfil
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
                  {hayDatos} usuarios encontrados con los filtros aplicados
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-1 m-0">
                Se mostrarán {columnasSeleccionadas} columnas en el reporte
              </p>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-warning">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm font-medium">
                  No se encontraron usuarios con los filtros aplicados
                </span>
              </div>
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
