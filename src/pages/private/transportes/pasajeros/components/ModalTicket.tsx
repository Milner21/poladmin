import { useRef, type FC } from 'react';
import { X, Printer } from 'lucide-react';
import type { PasajeroTransporte } from '@dto/transporte.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pasajero: PasajeroTransporte;
  permitirImpresion: boolean;
}

export const ModalTicket: FC<Props> = ({
  isOpen,
  onClose,
  pasajero,
  permitirImpresion,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleImprimir = () => {
    if (!ticketRef.current) return;

    const contenido = ticketRef.current.innerHTML;
    const ventana = window.open('', '_blank', 'width=300,height=500');
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Ticket de Transporte</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 280px;
              padding: 10px;
            }
            .ticket-titulo {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px dashed #000;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .ticket-fila {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .ticket-label { font-weight: bold; }
            .ticket-separador {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .ticket-centro { text-align: center; }
          </style>
        </head>
        <body>
          ${contenido}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-sm z-60 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            {permitirImpresion ? 'Ticket de Transporte' : 'Datos del Pasajero'}
          </h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Contenido del ticket */}
        <div
          ref={ticketRef}
          className="bg-white border border-border rounded-lg p-4 font-mono text-sm text-black"
        >
          <div className="ticket-titulo text-center font-bold border-b border-dashed border-gray-400 pb-2 mb-3">
            TICKET DE TRANSPORTE
          </div>

          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span className="font-bold">NOMBRE:</span>
              <span className="text-right">
                {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">CI:</span>
              <span>{pasajero.simpatizante?.documento}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 mb-3 space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">LOCAL:</span>
            </div>
            <p className="text-xs">{pasajero.simpatizante?.local_votacion_general || pasajero.simpatizante?.local_votacion_interna || '-'}</p>
            <div className="flex justify-between mt-1">
              <span className="font-bold">MESA:</span>
              <span>{pasajero.simpatizante?.mesa_votacion_general || pasajero.simpatizante?.mesa_votacion_interna || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">ORDEN:</span>
              <span>{pasajero.simpatizante?.orden_votacion_general || pasajero.simpatizante?.orden_votacion_interna || '-'}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">CONDUCTOR:</span>
              <span>
                {pasajero.transportista?.nombre} {pasajero.transportista?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">VEHÍCULO:</span>
              <span>
                {pasajero.transportista?.tipo_vehiculo} - {pasajero.transportista?.chapa_vehiculo}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 mt-3 pt-2 text-center text-xs text-gray-500">
            {new Date().toLocaleString('es-PY')}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-4">
          {permitirImpresion && (
            <button
              onClick={handleImprimir}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Imprimir
            </button>
          )}
          <button onClick={onClose} className="flex-1 btn btn-outline">
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};