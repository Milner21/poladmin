import { useState, useRef, useEffect, type FC } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Opcion {
  id: string;
  nombre: string;
  apellido: string;
  nivel: {
    nombre: string;
  };
}

interface SelectConBusquedaProps {
  opciones: Opcion[];
  valor: string;
  onCambio: (valor: string) => void;
  placeholder: string;
}

const SelectConBusqueda: FC<SelectConBusquedaProps> = ({
  opciones,
  valor,
  onCambio,
  placeholder,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const opcionSeleccionada = opciones.find(o => o.id === valor);

  const opcionesFiltradas = opciones.filter(opcion =>
    `${opcion.nombre} ${opcion.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    opcion.nivel.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false);
        setBusqueda("");
      }
    };

    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  const handleAbrir = () => {
    setAbierto(true);
    setBusqueda("");
  };

  const handleSeleccionar = (opcion: Opcion) => {
    onCambio(opcion.id);
    setAbierto(false);
    setBusqueda("");
  };

  const handleLimpiar = () => {
    onCambio("");
    setAbierto(false);
    setBusqueda("");
  };

  return (
    <div ref={contenedorRef} className="relative">
      {/* Trigger del select */}
      <button
        type="button"
        onClick={handleAbrir}
        className="w-full px-4 py-3 text-left border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base flex items-center justify-between"
      >
        <span className={opcionSeleccionada ? "text-text-primary" : "text-text-tertiary"}>
          {opcionSeleccionada 
            ? `${opcionSeleccionada.nombre} ${opcionSeleccionada.apellido} - ${opcionSeleccionada.nivel.nombre}`
            : placeholder
          }
        </span>
        <ChevronDown size={16} className="text-text-tertiary" />
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-bg-content border border-border rounded-lg shadow-lg">
          {/* Input de búsqueda */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base text-sm"
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="max-h-60 overflow-y-auto">
            {/* Opción para limpiar */}
            <button
              type="button"
              onClick={handleLimpiar}
              className="w-full px-4 py-3 text-left hover:bg-bg-hover text-text-tertiary text-sm border-b border-border"
            >
              {placeholder}
            </button>

            {/* Opciones filtradas */}
            {opcionesFiltradas.length > 0 ? (
              opcionesFiltradas.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => handleSeleccionar(opcion)}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${
                    valor === opcion.id ? "bg-primary/10 text-primary" : "text-text-primary"
                  }`}
                >
                  <div className="font-medium">{opcion.nombre} {opcion.apellido}</div>
                  <div className="text-xs text-text-tertiary">{opcion.nivel.nombre}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-text-tertiary text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectConBusqueda;