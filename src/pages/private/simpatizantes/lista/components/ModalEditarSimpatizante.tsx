import {
  X,
  Loader2,
  Phone,
  MapPin,
  MessageSquare,
  Car,
} from "lucide-react";
import { type FC, useState, useEffect } from "react";
import type { Simpatizante } from "@dto/simpatizante.types";
import { useActualizarSimpatizante } from "../../hooks/useActualizarSimpatizante";
import { ModalGPS } from "../../crear/components/ModalGPS";

interface Props {
  isOpen: boolean;
  simpatizante: Simpatizante | null;
  onClose: () => void;
}

interface FormData {
  telefono: string;
  barrio: string;
  observaciones: string;
  necesita_transporte: boolean;
  latitud: number | null;
  longitud: number | null;
}

export const ModalEditarSimpatizante: FC<Props> = ({
  isOpen,
  simpatizante,
  onClose,
}) => {
  const actualizarMutation = useActualizarSimpatizante();
  const [mostrarModalGPS, setMostrarModalGPS] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    telefono: "",
    barrio: "",
    observaciones: "",
    necesita_transporte: false,
    latitud: null,
    longitud: null,
  });

  useEffect(() => {
    if (simpatizante) {
      setFormData({
        telefono: simpatizante.telefono ?? "",
        barrio: simpatizante.barrio ?? "",
        observaciones: simpatizante.observaciones ?? "",
        necesita_transporte: simpatizante.necesita_transporte,
        latitud: simpatizante.latitud,
        longitud: simpatizante.longitud,
      });
    }
  }, [simpatizante]);

  if (!isOpen || !simpatizante) return null;

  const handleChange = (
    field: keyof FormData,
    value: string | boolean | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    actualizarMutation.mutate(
      {
        id: simpatizante.id,
        data: {
          telefono: formData.telefono.trim() || undefined,
          barrio: formData.barrio.trim() || undefined,
          observaciones: formData.observaciones.trim() || undefined,
          necesita_transporte: formData.necesita_transporte,
          latitud: formData.latitud ?? undefined,
          longitud: formData.longitud ?? undefined,
        },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-lg z-50 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Editar simpatizante
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X size={18} className="text-text-tertiary" />
          </button>
        </div>

        <div className="bg-bg-base border border-border rounded-lg p-3 mb-5">
          <p className="text-xs text-text-tertiary mb-1">Simpatizante</p>
          <p className="text-sm font-semibold text-text-primary">
            {simpatizante.nombre} {simpatizante.apellido}
          </p>
          <p className="text-xs text-text-tertiary">
            CI: {simpatizante.documento}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Telefono */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Phone size={14} className="inline mr-1" />
              Telefono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="Ej: 0981123456"
              className="w-full px-3 py-2 border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Barrio */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <MapPin size={14} className="inline mr-1" />
              Barrio
            </label>
            <input
              type="text"
              value={formData.barrio}
              onChange={(e) => handleChange("barrio", e.target.value)}
              placeholder="Ej: San Pablo"
              className="w-full px-3 py-2 border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-bg-hover transition-colors">
              <input
                type="checkbox"
                checked={formData.necesita_transporte}
                onChange={(e) =>
                  handleChange("necesita_transporte", e.target.checked)
                }
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <Car size={16} className="text-primary" />
              <span className="text-sm font-medium text-text-primary">
                Necesita transporte
              </span>
            </label>
          </div>

          {/* GPS */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <MapPin size={14} className="inline mr-1" />
              Ubicacion GPS
            </label>
            <button
              type="button"
              onClick={() => setMostrarModalGPS(true)}
              className="w-full px-3 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors flex items-center justify-center gap-2 text-text-primary text-sm"
            >
              <MapPin size={14} />
              {formData.latitud ? "Actualizar ubicacion" : "Obtener ubicacion"}
            </button>
            {formData.latitud && formData.longitud && (
              <p className="text-xs text-success mt-1">
                {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <MessageSquare size={14} className="inline mr-1" />
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Comentarios adicionales..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={actualizarMutation.isPending}
              className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actualizarMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              {actualizarMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {actualizarMutation.isPending
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      <ModalGPS
        isOpen={mostrarModalGPS}
        onClose={() => setMostrarModalGPS(false)}
        onUbicacionObtenida={(lat, lng) => {
          handleChange("latitud", lat);
          handleChange("longitud", lng);
          setMostrarModalGPS(false);
        }}
      />
    </>
  );
};
