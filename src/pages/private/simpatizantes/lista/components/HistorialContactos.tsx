import { type FC } from 'react';
import { X, Phone, MapPin, MessageCircle, Calendar, Clock } from 'lucide-react';
import { useSeguimientos } from '../../hooks/useSeguimientos';
import type { Simpatizante } from '@dto/simpatizante.types';
import type { TipoContacto, ResultadoContacto } from '@dto/seguimiento.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  simpatizante: Simpatizante;
  onNuevoContacto: () => void;
}

const iconosTipo: Record<TipoContacto, typeof Phone> = {
  LLAMADA: Phone,
  VISITA: MapPin,
  WHATSAPP: MessageCircle,
  EVENTO: Calendar,
};

const coloresResultado: Record<ResultadoContacto, string> = {
  EXITOSO: 'bg-success/10 text-success border-success/30',
  NO_CONTESTA: 'bg-warning/10 text-warning border-warning/30',
  RECHAZA: 'bg-danger/10 text-danger border-danger/30',
  PENDIENTE: 'bg-info/10 text-info border-info/30',
};

const coloresIntencion: Record<string, string> = {
  SEGURO: 'bg-success text-white',
  PROBABLE: 'bg-info text-white',
  INDECISO: 'bg-warning text-white',
  CONTRARIO: 'bg-danger text-white',
};

export const HistorialContactos: FC<Props> = ({ isOpen, onClose, simpatizante, onNuevoContacto }) => {
  const { data: seguimientos, isLoading } = useSeguimientos(isOpen ? simpatizante.id : undefined);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        bg-bg-content border border-border rounded-xl shadow-xl
        w-full max-w-lg z-50 max-h-[90vh] flex flex-col
      ">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0">
              {simpatizante.nombre} {simpatizante.apellido}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-tertiary">
                CI: {simpatizante.documento}
              </span>
              {simpatizante.telefono && (
                <a
                  href={`tel:${simpatizante.telefono}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Phone size={10} />
                  {simpatizante.telefono}
                </a>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${coloresIntencion[simpatizante.intencion_voto] || 'bg-text-tertiary text-white'}`}>
                {simpatizante.intencion_voto}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info rápida */}
        <div className="px-6 py-3 bg-bg-base border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span>📍 {simpatizante.barrio || 'Sin barrio'}</span>
              {simpatizante.es_afiliado && <span className="text-success font-medium">Afiliado</span>}
              {simpatizante.necesita_transporte && <span>🚗 Transporte</span>}
            </div>
            <span className="text-xs text-text-tertiary">
              {seguimientos?.length || 0} contactos
            </span>
          </div>
        </div>

        {/* Lista de seguimientos */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : seguimientos && seguimientos.length > 0 ? (
            <div className="space-y-4">
              {seguimientos.map((seg) => {
                const IconoTipo = iconosTipo[seg.tipo_contacto as TipoContacto] || Phone;

                return (
                  <div
                    key={seg.id}
                    className="relative pl-8 pb-4 border-l-2 border-border last:border-0"
                  >
                    {/* Punto en la línea temporal */}
                    <div className={`
                      absolute -left-2.25 top-0 w-4 h-4 rounded-full border-2 border-bg-content
                      ${seg.resultado === 'EXITOSO' ? 'bg-success' :
                        seg.resultado === 'NO_CONTESTA' ? 'bg-warning' :
                        seg.resultado === 'RECHAZA' ? 'bg-danger' : 'bg-info'}
                    `} />

                    {/* Contenido */}
                    <div className="bg-bg-base rounded-lg p-3 border border-border">
                      {/* Encabezado */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IconoTipo size={14} className="text-primary" />
                          <span className="text-sm font-medium text-text-primary">
                            {seg.tipo_contacto}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${coloresResultado[seg.resultado as ResultadoContacto]}`}>
                            {seg.resultado === 'NO_CONTESTA' ? 'No contesta' :
                             seg.resultado === 'EXITOSO' ? 'Exitoso' :
                             seg.resultado === 'RECHAZA' ? 'Rechaza' : 'Pendiente'}
                          </span>
                        </div>
                        {seg.intencion_voto && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${coloresIntencion[seg.intencion_voto]}`}>
                            {seg.intencion_voto}
                          </span>
                        )}
                      </div>

                      {/* Observaciones */}
                      {seg.observaciones && (
                        <p className="text-sm text-text-secondary mb-2">
                          {seg.observaciones}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span>
                          Por: {seg.usuario?.nombre} {seg.usuario?.apellido}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(seg.fecha_contacto).toLocaleString('es-PY', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-text-tertiary">
              <Phone size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Sin contactos registrados</p>
              <p className="text-xs mt-1">Registrá el primer contacto con esta persona</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onNuevoContacto}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            Registrar Nuevo Contacto
          </button>
        </div>
      </div>
    </>
  );
};