import { ClipboardList } from 'lucide-react';
import type { FC } from 'react';
import type { PrioridadSolicitud } from '@dto/solicitud.types';

interface SolicitudFormData {
  titulo: string;
  descripcion: string;
  prioridad: PrioridadSolicitud;
}

interface Props {
  activa: boolean;
  onToggle: (activa: boolean) => void;
  data: SolicitudFormData;
  onChange: (field: keyof SolicitudFormData, value: string) => void;
}

const PRIORIDADES: Array<{ value: PrioridadSolicitud; label: string; color: string }> = [
  { value: 'BAJA', label: 'Baja', color: 'bg-info/10 text-info border-info/30' },
  { value: 'MEDIA', label: 'Media', color: 'bg-warning/10 text-warning border-warning/30' },
  { value: 'ALTA', label: 'Alta', color: 'bg-danger/10 text-danger border-danger/30' },
];

export const SeccionSolicitud: FC<Props> = ({ activa, onToggle, data, onChange }) => {
  return (
    <div className="bg-bg-content rounded-xl shadow-sm overflow-hidden">
      {/* Toggle header */}
      <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-bg-hover transition-colors">
        <input
          type="checkbox"
          checked={activa}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-5 h-5 text-primary rounded"
        />
        <ClipboardList className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium text-text-primary">¿Tiene alguna solicitud o pedido?</p>
          <p className="text-xs text-text-tertiary">Podés registrar una solicitud junto al simpatizante</p>
        </div>
      </label>

      {/* Formulario de solicitud */}
      {activa && (
        <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
          {/* Título (campo corto) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Solicita <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={data.titulo}
              onChange={(e) => onChange('titulo', e.target.value)}
              placeholder="Ej: Arreglo de calle, trabajo, medicamentos..."
              maxLength={100}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base text-text-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Resumen corto de lo que solicita
            </p>
          </div>

          {/* Descripción (textarea) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Detalle <span className="text-danger">*</span>
            </label>
            <textarea
              value={data.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              placeholder="Describí con más detalle la situación y lo que necesita..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base resize-none text-text-primary"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Prioridad
            </label>
            <div className="flex gap-2">
              {PRIORIDADES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange('prioridad', p.value)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    data.prioridad === p.value
                      ? p.color + ' border-current'
                      : 'border-border text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};