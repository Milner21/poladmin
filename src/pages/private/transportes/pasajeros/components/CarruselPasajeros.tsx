import { useState, type FC } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PasajeroTransporte } from '@dto/transporte.types';

interface Props {
  isOpen: boolean;
  pasajeros: PasajeroTransporte[];
  onClose: () => void;
}

export const CarruselPasajeros: FC<Props> = ({ isOpen, pasajeros, onClose }) => {
  const [indiceActual, setIndiceActual] = useState(0);

  if (!isOpen || pasajeros.length === 0) return null;

  const pasajero = pasajeros[indiceActual];
  const total = pasajeros.length;

  const handleAnterior = () => {
    setIndiceActual((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleSiguiente = () => {
    setIndiceActual((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-sm z-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Registro Manual
          </h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleAnterior}
            className="p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-text-primary">
            {indiceActual + 1} / {total}
          </span>
          <button
            onClick={handleSiguiente}
            className="p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Tarjeta del pasajero */}
        <div className="bg-bg-base border-2 border-border rounded-xl p-6 space-y-4">
          <div className="text-center border-b border-border pb-4">
            <p className="text-xl font-bold text-text-primary uppercase">
              {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              CI: {pasajero.simpatizante?.documento}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-tertiary uppercase font-medium mb-1">
                Local de Votación
              </p>
              <p className="text-base font-semibold text-text-primary">
                {pasajero.simpatizante?.local_votacion_general || pasajero.simpatizante?.local_votacion_interna || '-'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-tertiary uppercase font-medium mb-1">Mesa</p>
                <p className="text-2xl font-bold text-primary">
                  {pasajero.simpatizante?.mesa_votacion_general || pasajero.simpatizante?.mesa_votacion_interna || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase font-medium mb-1">Orden</p>
                <p className="text-2xl font-bold text-primary">
                  {pasajero.simpatizante?.orden_votacion_general || pasajero.simpatizante?.orden_votacion_interna || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación inferior */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnterior}
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <button
            onClick={handleSiguiente}
            className="flex-1 btn btn-outline flex items-center justify-center gap-2"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>

        <button onClick={onClose} className="w-full btn btn-outline mt-2">
          Cerrar
        </button>
      </div>
    </>
  );
};