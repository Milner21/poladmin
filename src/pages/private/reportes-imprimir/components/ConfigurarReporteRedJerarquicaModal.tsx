import { useState, useEffect, type FC } from 'react';
import { X, FileDown, FileSpreadsheet, Filter, Network } from 'lucide-react';
import { useCampanaSeleccionada } from '@hooks/useCampanaSeleccionada';
import { useAuth } from '@hooks/useAuth';
import { useReporteRedJerarquica } from '../hooks/useReporteRedJerarquica';
import { 
  opcionesVisualizacion, 
  opcionesDetalle,
  columnasRedJerarquica
} from '../reportes/usuarios/RedJerarquicaConfig';
import type { ColumnaReporte, FiltrosReporte } from '@dto/reportes.types';
import { pdf } from '@react-pdf/renderer';
import { ReporteRedJerarquicaPDF } from '../reportes/usuarios/ReporteRedJerarquicaPDF';
import { generarExcelRedJerarquica } from '../reportes/usuarios/ReporteRedJerarquicaExcel';

interface ConfigurarReporteRedJerarquicaModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfigurarReporteRedJerarquicaModal: FC<ConfigurarReporteRedJerarquicaModalProps> = ({
  visible,
  onClose,
}) => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { usuario } = useAuth();

  const [filtros, setFiltros] = useState<FiltrosReporte>({
    campana_id: campanaSeleccionada,
    estado: undefined,
  });

  const [columnas, setColumnas] = useState<ColumnaReporte[]>(columnasRedJerarquica);
  const [tipoVisualizacion, setTipoVisualizacion] = useState('arbol');
  const [nivelDetalle, setNivelDetalle] = useState('completo');
  const [incluirEstadisticas, setIncluirEstadisticas] = useState(true);
  const [soloActivos, setSoloActivos] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    setFiltros(prev => ({ ...prev, campana_id: campanaSeleccionada }));
  }, [campanaSeleccionada]);

  useEffect(() => {
    setFiltros(prev => ({ 
      ...prev, 
      estado: soloActivos ? true : undefined 
    }));
  }, [soloActivos]);

  const { data: datosRed, isLoading } = useReporteRedJerarquica(filtros);

  const handleColumnaToggle = (key: string) => {
    setColumnas(prev => prev.map(col =>
      col.key === key ? { ...col, enabled: !col.enabled } : col
    ));
  };

  const handleSeleccionarTodasColumnas = () => {
    setColumnas(prev => prev.map(col => ({ ...col, enabled: true })));
  };

  const handleDeseleccionarTodasColumnas = () => {
    setColumnas(prev => prev.map(col => ({ ...col, enabled: false })));
  };

  const handleGenerarPDF = async () => {
    if (!datosRed?.arbol_jerarquico?.length) return;
    
    setGenerando(true);
    try {
      const configuracion = {
        campana: campanaActual?.nombre || campanaSeleccionada || 'Sin campaña',
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        tipoVisualizacion,
        nivelDetalle,
        incluirEstadisticas,
        soloActivos,
      };

      const columnasSeleccionadas = columnas.filter(c => c.enabled);

      const doc = (
        <ReporteRedJerarquicaPDF
          datos={datosRed}
          columnas={columnasSeleccionadas}
          configuracion={configuracion}
        />
      );

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      onClose();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error generando PDF');
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = async () => {
    if (!datosRed?.arbol_jerarquico?.length) return;
    
    setGenerando(true);
    try {
      const configuracion = {
        campana: campanaActual?.nombre || campanaSeleccionada || 'Sin campaña',
        generadoPor: `${usuario?.nombre} ${usuario?.apellido} (@${usuario?.username})`,
        tipoVisualizacion,
        nivelDetalle,
        incluirEstadisticas,
        soloActivos,
      };

      const columnasSeleccionadas = columnas.filter(c => c.enabled);

      generarExcelRedJerarquica({
        datos: datosRed,
        columnas: columnasSeleccionadas,
        configuracion,
      });

      onClose();
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error generando Excel');
    } finally {
      setGenerando(false);
    }
  };

  const columnasSeleccionadas = columnas.filter(c => c.enabled).length;
  const hayDatos = datosRed?.total_usuarios ?? 0;

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] z-50 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2">
              <Network size={20} />
              Configurar Reporte - Red Jerárquica
            </h3>
            <p className="text-sm text-text-tertiary mt-1 m-0">
              {isLoading ? 'Cargando datos...' : `${hayDatos} usuarios políticos encontrados en ${datosRed?.total_niveles || 0} niveles`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter size={16} />
              Configuración de Visualización
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Tipo de Visualización
                </label>
                <select
                  value={tipoVisualizacion}
                  onChange={(e) => setTipoVisualizacion(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {opcionesVisualizacion.map((opcion) => (
                    <option key={opcion.key} value={opcion.key}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nivel de Detalle
                </label>
                <select
                  value={nivelDetalle}
                  onChange={(e) => setNivelDetalle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {opcionesDetalle.map((opcion) => (
                    <option key={opcion.key} value={opcion.key}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {tipoVisualizacion === 'tabla' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Network size={16} />
                  Columnas a mostrar ({columnasSeleccionadas} de {columnas.length})
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
          )}

          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Opciones
            </h4>
            <div className="space-y-3">
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
                    Agrega una página inicial con estadísticas por nivel y resumen de la estructura
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-bg-base rounded-lg hover:bg-bg-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={soloActivos}
                  onChange={(e) => setSoloActivos(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    Solo usuarios activos
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 m-0">
                    Excluye usuarios inactivos del reporte
                  </p>
                </div>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : datosRed && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary mb-3">Vista Previa de la Estructura</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {datosRed.estadisticas_por_nivel.map((stat) => (
                  <div key={stat.nivel} className="bg-bg-content p-3 rounded border border-border">
                    <p className="font-medium text-text-primary m-0">{stat.nivel}</p>
                    <p className="text-text-tertiary m-0">
                      {stat.total} usuarios ({stat.activos} activos)
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-tertiary mt-3 m-0">
                Total: {datosRed.total_usuarios} usuarios en {datosRed.total_niveles} niveles
              </p>
            </div>
          )}
        </div>

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
              disabled={generando || !hayDatos || (tipoVisualizacion === 'tabla' && columnasSeleccionadas === 0)}
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
              disabled={generando || !hayDatos || (tipoVisualizacion === 'tabla' && columnasSeleccionadas === 0)}
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