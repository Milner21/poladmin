import { useDebounce } from "@hooks/useDebounce";
import { MapPin, Plus, Search, X } from "lucide-react";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { useBuscarBarrios, useCrearDireccion } from "../../hooks/useDirecciones";

interface Props {
  value: string;
  onChange: (value: string) => void;
  departamento: string;
  ciudad: string;
}

export const SelectorBarrioInteligente: FC<Props> = ({
  value,
  onChange,
  departamento,
  ciudad,
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoBarrio, setNuevoBarrio] = useState("");

  // Debounce para evitar muchas consultas
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Consulta con debounce
  const { data: direcciones = [], isLoading } = useBuscarBarrios(
    departamento,
    ciudad,
    busquedaDebounced || undefined,
  );

  const crearMutation = useCrearDireccion();

  // Filtrar direcciones que coincidan exactamente con la búsqueda
  const direccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return direcciones;
    return direcciones.filter((d) =>
      d.barrio.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [direcciones, busqueda]);

  // Verificar si la búsqueda actual ya existe
  const barrioExiste = direcciones.some(
    (d) => d.barrio.toLowerCase() === busqueda.toLowerCase(),
  );

  const handleInputChange = (valor: string) => {
    setBusqueda(valor);
    onChange(valor);
    setMostrarLista(true);
  };

  const handleSeleccionarBarrio = (barrio: string) => {
    onChange(barrio);
    setBusqueda("");
    setMostrarLista(false);
  };

  const handleLimpiarInput = () => {
    setBusqueda("");
    onChange(""); 
    setMostrarLista(false);
  };

  const handleAgregarNuevo = async () => {
    if (!nuevoBarrio.trim()) return;

    try {
      const nuevaDireccion = await crearMutation.mutateAsync({
        departamento,
        ciudad,
        barrio: nuevoBarrio.trim(),
      });

      // Seleccionar automáticamente el barrio recién creado
      onChange(nuevaDireccion.barrio);
      setNuevoBarrio("");
      setMostrarModal(false);
      setBusqueda("");
      setMostrarLista(false);
    } catch {
      // El error ya se maneja en el hook
    }
  };

  const abrirModal = () => {
    setNuevoBarrio(busqueda.trim().toUpperCase()); // ← UPPERCASE
    setMostrarModal(true);
  };

  // Mostrar el valor seleccionado o la búsqueda
  const valorMostrado = value;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-primary mb-2">
        <MapPin className="w-4 h-4 inline mr-1" />
        Barrio en {ciudad}, {departamento}
      </label>

      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
        <input
          type="text"
          value={valorMostrado}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setMostrarLista(true)}
          placeholder="Buscar barrio..."
          className="w-full pl-10 pr-10 py-3 text-lg border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base"
        />

        {/* Botón limpiar */}
        {valorMostrado && (
          <button
            type="button"
            onClick={handleLimpiarInput}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Spinner de carga */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Lista de resultados */}
      {mostrarLista && (
        <div className="absolute z-10 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {direccionesFiltradas.length > 0 ? (
            <>
              {direccionesFiltradas.map((direccion) => (
                <button
                  key={direccion.id}
                  type="button"
                  onClick={() => handleSeleccionarBarrio(direccion.barrio)}
                  className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-text-primary">
                      {direccion.barrio}
                    </span>
                  </div>
                </button>
              ))}

              {/* Botón agregar nuevo (solo si no existe) */}
              {busqueda.trim() && !barrioExiste && (
                <button
                  type="button"
                  onClick={abrirModal}
                  className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-t border-border text-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Agregar "{busqueda.toUpperCase()}" como nuevo barrio
                  </span>
                </button>
              )}
            </>
          ) : busqueda.trim() ? (
            <button
              type="button"
              onClick={abrirModal}
              className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors text-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar "{busqueda.toUpperCase()}" como nuevo barrio</span>
            </button>
          ) : (
            <div className="px-4 py-3 text-text-secondary text-center">
              Escribí para buscar barrios...
            </div>
          )}
        </div>
      )}

      {/* Modal para confirmar nuevo barrio */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-content rounded-xl p-6 mx-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Agregar nuevo barrio
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nombre del barrio
                </label>
                <input
                  type="text"
                  value={nuevoBarrio}
                  onChange={(e) => setNuevoBarrio(e.target.value.toUpperCase())} // ← UPPERCASE
                  placeholder="EJ: VILLA NUEVA"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base uppercase" // ← CLASE UPPERCASE
                  autoFocus
                />
              </div>

              <div className="text-sm text-text-secondary">
                <p>
                  <strong>Departamento:</strong> {departamento}
                </p>
                <p>
                  <strong>Ciudad:</strong> {ciudad}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                disabled={crearMutation.isPending}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarNuevo}
                disabled={!nuevoBarrio.trim() || crearMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {crearMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agregando...
                  </>
                ) : (
                  "Agregar barrio"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar lista */}
      {mostrarLista && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setMostrarLista(false)}
        />
      )}
    </div>
  );
};
