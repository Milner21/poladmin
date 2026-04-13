import { Search } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBuscar: () => void;
  isLoading: boolean;
}

export const BusquedaCI: FC<Props> = ({ value, onChange, onBuscar, isLoading }) => {
  return (
    <div className="bg-bg-content rounded-xl p-4 mb-4 shadow-sm">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Cédula de Identidad
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder="Ej: 1234567"
            className="flex-1 px-4 py-3 text-lg border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base"
            disabled={isLoading}
          />
          <button
            onClick={onBuscar}
            disabled={isLoading || !value.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            <Search className="w-5 h-5" />
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
    </div>
  );
};