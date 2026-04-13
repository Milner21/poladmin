import { useState, type FC } from "react";
import { X, ChevronLeft, ChevronRight, User } from "lucide-react";
import type { PasajeroTransporte } from "@dto/transporte.types";

interface ModalCarruselPasajerosProps {
  isOpen: boolean;
  onClose: () => void;
  pasajeros: PasajeroTransporte[];
}

export const ModalCarruselPasajeros: FC<ModalCarruselPasajerosProps> = ({
  isOpen,
  onClose,
  pasajeros,
}) => {
  const [indiceActual, setIndiceActual] = useState(0);

  if (!isOpen || pasajeros.length === 0) return null;

  const pasajeroActual = pasajeros[indiceActual];

  const handleAnterior = () => {
    setIndiceActual((prev) => (prev > 0 ? prev - 1 : pasajeros.length - 1));
  };

  const handleSiguiente = () => {
    setIndiceActual((prev) => (prev < pasajeros.length - 1 ? prev + 1 : 0));
  };

  const handleCerrar = () => {
    setIndiceActual(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-bg-content w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <User size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Registro Manual</h3>
              <p className="text-xs text-text-tertiary">
                Pasajero {indiceActual + 1} de {pasajeros.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleCerrar}
            className="p-2 rounded-lg hover:bg-bg-base transition-colors text-text-tertiary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Carrusel */}
        <div className="p-8">
          <div className="bg-bg-surface rounded-xl p-6 border-2 border-border">
            {/* Nombre */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-text-primary mb-2">
                {pasajeroActual.simpatizante?.nombre} {pasajeroActual.simpatizante?.apellido}
              </h2>
              <p className="text-xl text-text-tertiary">CI: {pasajeroActual.simpatizante?.documento}</p>
            </div>

            {/* Datos de votación */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-bg-content rounded-lg p-4 border border-border">
                <p className="text-xs text-text-tertiary uppercase mb-1">Local de Votación</p>
                <p className="text-lg font-bold text-text-primary">
                  {pasajeroActual.simpatizante?.local_votacion_general || pasajeroActual.simpatizante?.local_votacion_interna || 'No especificado'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-content rounded-lg p-4 border border-border">
                  <p className="text-xs text-text-tertiary uppercase mb-1">Mesa</p>
                  <p className="text-2xl font-bold text-primary text-center">
                    {pasajeroActual.simpatizante?.mesa_votacion_general || pasajeroActual.simpatizante?.mesa_votacion_interna || '-'}
                  </p>
                </div>

                <div className="bg-bg-content rounded-lg p-4 border border-border">
                  <p className="text-xs text-text-tertiary uppercase mb-1">Orden</p>
                  <p className="text-2xl font-bold text-primary text-center">
                    {pasajeroActual.simpatizante?.orden_votacion_general || pasajeroActual.simpatizante?.orden_votacion_interna || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-warning/10 rounded-lg p-3 border border-warning/30">
              <p className="text-sm text-warning text-center">
                📝 Anotá estos datos manualmente en tu planilla
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Navegación */}
        <div className="p-4 border-t border-border bg-bg-surface flex justify-between items-center">
          <button
            onClick={handleAnterior}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-bg-base transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex gap-2">
            {pasajeros.map((_, index) => (
              <button
                key={index}
                onClick={() => setIndiceActual(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === indiceActual
                    ? 'bg-primary w-6'
                    : 'bg-text-tertiary/30 hover:bg-text-tertiary/50'
                }`}
              />
            ))}
          </div>

          {indiceActual < pasajeros.length - 1 ? (
            <button
              onClick={handleSiguiente}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCerrar}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-success hover:bg-success/90 transition-colors"
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};