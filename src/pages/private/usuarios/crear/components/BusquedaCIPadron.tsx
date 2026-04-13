import { Search, Loader2 } from "lucide-react";
import { type FC } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBuscar: () => void;
  isLoading: boolean;
}

export const BusquedaCIPadron: FC<Props> = ({
  value,
  onChange,
  onBuscar,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onBuscar();
    }
  };

  return (
    <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-base font-semibold text-text-primary mb-2">
        Buscar en padron
      </h3>
      <p className="text-sm text-text-tertiary mb-4">
        Ingresa el numero de cedula. Si esta en el padron, los datos se cargan automaticamente.
      </p>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            size={20}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: 1234567"
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-bg-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={onBuscar}
          disabled={isLoading || !value.trim()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar
            </>
          )}
        </button>
      </div>
    </div>
  );
};