import { useState, type FC } from 'react';
import { X, Phone, MapPin, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { useCrearSeguimiento } from '../../hooks/useCrearSeguimiento';
import type { Simpatizante } from '@dto/simpatizante.types';
import type { TipoContacto, ResultadoContacto, IntencionVoto } from '@dto/seguimiento.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  simpatizante: Simpatizante;
}

const TIPOS_CONTACTO: Array<{ value: TipoContacto; label: string; icon: typeof Phone }> = [
  { value: 'LLAMADA', label: 'Llamada', icon: Phone },
  { value: 'VISITA', label: 'Visita', icon: MapPin },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { value: 'EVENTO', label: 'Evento', icon: Calendar },
];

const RESULTADOS: Array<{ value: ResultadoContacto; label: string; color: string }> = [
  { value: 'EXITOSO', label: 'Contacto exitoso', color: 'bg-success/10 text-success border-success/30' },
  { value: 'NO_CONTESTA', label: 'No contesta', color: 'bg-warning/10 text-warning border-warning/30' },
  { value: 'RECHAZA', label: 'Rechaza', color: 'bg-danger/10 text-danger border-danger/30' },
  { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-info/10 text-info border-info/30' },
];

const INTENCIONES: Array<{ value: IntencionVoto; label: string; color: string }> = [
  { value: 'SEGURO', label: 'Voto Seguro', color: 'bg-success text-white' },
  { value: 'PROBABLE', label: 'Probable', color: 'bg-info text-white' },
  { value: 'INDECISO', label: 'Indeciso', color: 'bg-warning text-white' },
  { value: 'CONTRARIO', label: 'Contrario', color: 'bg-danger text-white' },
];

export const ModalContacto: FC<Props> = ({ isOpen, onClose, simpatizante }) => {
  const [tipoContacto, setTipoContacto] = useState<TipoContacto>('LLAMADA');
  const [resultado, setResultado] = useState<ResultadoContacto>('EXITOSO');
  const [intencionVoto, setIntencionVoto] = useState<IntencionVoto | ''>('');
  const [observaciones, setObservaciones] = useState('');

  const crearMutation = useCrearSeguimiento();

  const handleSubmit = () => {
    crearMutation.mutate(
      {
        simpatizante_id: simpatizante.id,
        tipo_contacto: tipoContacto,
        resultado,
        intencion_voto: resultado === 'EXITOSO' && intencionVoto ? intencionVoto : undefined,
        observaciones: observaciones.trim() || undefined,
      },
      {
        onSuccess: () => {
          // Limpiar form
          setTipoContacto('LLAMADA');
          setResultado('EXITOSO');
          setIntencionVoto('');
          setObservaciones('');
          onClose();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        bg-bg-content border border-border rounded-xl shadow-xl
        w-full max-w-lg z-50 p-6 max-h-[90vh] overflow-y-auto
      ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0">
              Registrar Contacto
            </h3>
            <p className="text-sm text-text-tertiary mt-1">
              {simpatizante.nombre} {simpatizante.apellido} — CI: {simpatizante.documento}
            </p>
            {simpatizante.telefono && (
              <a
                href={`tel:${simpatizante.telefono}`}
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <Phone size={12} />
                {simpatizante.telefono}
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tipo de contacto */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tipo de contacto
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIPOS_CONTACTO.map((tipo) => {
              const IconComponent = tipo.icon;
              return (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoContacto(tipo.value)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors text-sm
                    ${tipoContacto === tipo.value
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-text-secondary hover:bg-bg-hover'
                    }
                  `}
                >
                  <IconComponent size={18} />
                  {tipo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultado */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Resultado del contacto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RESULTADOS.map((res) => (
              <button
                key={res.value}
                type="button"
                onClick={() => setResultado(res.value)}
                className={`
                  px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${resultado === res.value
                    ? res.color + ' border-current'
                    : 'border-border text-text-secondary hover:bg-bg-hover'
                  }
                `}
              >
                {resultado === res.value && <CheckCircle size={14} className="inline mr-1" />}
                {res.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intención de voto (solo si fue exitoso) */}
        {resultado === 'EXITOSO' && (
          <div className="mb-5 p-4 bg-success/5 border border-success/20 rounded-lg">
            <label className="block text-sm font-medium text-text-primary mb-2">
              ¿Cuál es su intención de voto?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTENCIONES.map((int) => (
                <button
                  key={int.value}
                  type="button"
                  onClick={() => setIntencionVoto(int.value)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${intencionVoto === int.value
                      ? int.color
                      : 'bg-bg-base text-text-secondary hover:bg-bg-hover border border-border'
                    }
                  `}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Observaciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Dice que va a votar por nosotros, está muy entusiasmado..."
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg bg-bg-base text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={crearMutation.isPending}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
          >
            {crearMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Registrar Contacto'
            )}
          </button>
        </div>
      </div>
    </>
  );
};