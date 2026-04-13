import { Car, MapPin, MessageSquare, Phone, User } from "lucide-react";
import { useState, type FC } from "react";
import { SelectorBarrioInteligente } from "./SelectorBarrioInteligente";
import { ModalGPS } from "./ModalGPS";

interface FormData {
  telefono: string;
  barrio: string;
  necesita_transporte: boolean;
  observaciones: string;
  latitud: number | null;
  longitud: number | null;
}

interface Props {
  formData: FormData;
  onChange: (
    field: keyof FormData,
    value: string | boolean | number | null,
  ) => void;
  departamento: string;
  ciudad: string;
}

export const FormularioSimpatizante: FC<Props> = ({
  formData,
  onChange,
  departamento,
  ciudad,
}) => {
  const [mostrarModalGPS, setMostrarModalGPS] = useState(false);

  const handleUbicacionObtenida = (lat: number, lng: number) => {
    onChange("latitud", lat);
    onChange("longitud", lng);
  };

  return (
    <div className="bg-bg-content rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-text-primary">Completá los datos</h3>
      </div>

      <div className="space-y-4">
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
            placeholder="Ej: 0981123456"
            className="w-full px-4 py-3 text-lg border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base"
          />
        </div>

        {/* Selector de Barrio */}
        <SelectorBarrioInteligente
          value={formData.barrio}
          onChange={(value) => onChange("barrio", value)}
          departamento={departamento}
          ciudad={ciudad}
        />

        {/* Necesita transporte */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-bg-hover transition-colors">
            <input
              type="checkbox"
              checked={formData.necesita_transporte}
              onChange={(e) =>
                onChange("necesita_transporte", e.target.checked)
              }
              className="w-5 h-5 text-primary rounded"
            />
            <Car className="w-5 h-5 text-primary" />
            <span className="font-medium text-text-primary">
              Necesita transporte
            </span>
          </label>
        </div>

        {/* GPS */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Ubicación GPS (opcional)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarModalGPS(true)}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-bg-hover transition-colors flex items-center justify-center gap-2 text-text-primary"
            >
              <MapPin className="w-4 h-4" />
              {formData.latitud ? "Actualizar ubicación" : "Obtener ubicación"}
            </button>
          </div>
          {formData.latitud && formData.longitud && (
            <div className="mt-2 p-2 bg-success/10 rounded text-sm text-success">
              📍 {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
            </div>
          )}
        </div>

        {/* Modal GPS */}
        <ModalGPS
          isOpen={mostrarModalGPS}
          onClose={() => setMostrarModalGPS(false)}
          onUbicacionObtenida={handleUbicacionObtenida}
        />

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Observaciones (opcional)
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => onChange("observaciones", e.target.value)}
            placeholder="Comentarios adicionales..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base resize-none"
          />
        </div>
      </div>
    </div>
  );
};
