import { useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import { useConfirmarPasajero } from '../../hooks/useConfirmarPasajero';
import { useConfiguracionTransporte } from '../../hooks/useConfiguacionTransporte';
import { CheckCircle, X, Printer, Eye, QrCode } from 'lucide-react';
import type { PasajeroTransporte } from '@dto/transporte.types';
import { ModalTicket } from './ModalTicket';

interface Props {
  isOpen: boolean;
  pasajeroId: string | null;
  onClose: () => void;
  onSiguiente: () => void;
}

export const ModalConfirmarPasajero: FC<Props> = ({
  isOpen,
  pasajeroId,
  onClose,
  onSiguiente,
}) => {
  const [confirmado, setConfirmado] = useState(false);
  const [pasajeroConfirmado, setPasajeroConfirmado] = useState<PasajeroTransporte | null>(null);
  const [modalTicketOpen, setModalTicketOpen] = useState(false);

  const confirmarMutation = useConfirmarPasajero();
  const { data: configuracion } = useConfiguracionTransporte();

  const { data: pasajeros } = useQuery({
    queryKey: ['pasajeros'],
    queryFn: () => transportesService.getAllPasajeros(),
    enabled: !!pasajeroId && isOpen,
  });

  const pasajero = pasajeros?.find((p) => p.id === pasajeroId) ?? null;

  const handleConfirmar = () => {
    if (!pasajeroId) return;

    confirmarMutation.mutate(pasajeroId, {
      onSuccess: (pasajeroActualizado) => {
        setConfirmado(true);
        setPasajeroConfirmado(pasajeroActualizado);
      },
    });
  };

  const handleCerrar = () => {
    setConfirmado(false);
    setPasajeroConfirmado(null);
    onClose();
  };

  const handleSiguiente = () => {
    setConfirmado(false);
    setPasajeroConfirmado(null);
    onSiguiente();
  };

  if (!isOpen || !pasajeroId) return null;

  if (!pasajero) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCerrar} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-sm z-50 p-6 text-center">
          <p className="text-danger text-sm">Pasajero no encontrado en el sistema</p>
          <button onClick={handleCerrar} className="btn btn-outline mt-4 w-full">
            Cerrar
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCerrar} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-sm z-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-text-primary">
              {confirmado ? 'Pasajero Confirmado' : 'Confirmar Pasajero'}
            </h3>
          </div>
          <button onClick={handleCerrar} className="text-text-tertiary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Estado: No confirmado */}
        {!confirmado && (
          <>
            <div className="bg-bg-base rounded-lg p-4 mb-4 space-y-2">
              <p className="text-lg font-semibold text-text-primary">
                {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
              </p>
              <p className="text-sm text-text-tertiary">
                CI: {pasajero.simpatizante?.documento}
              </p>
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <p className="text-sm text-text-primary">
                  <span className="text-text-tertiary">Local: </span>
                  {pasajero.simpatizante?.local_votacion_general || pasajero.simpatizante?.local_votacion_interna || '-'}
                </p>
                <p className="text-sm text-text-primary">
                  <span className="text-text-tertiary">Mesa: </span>
                  {pasajero.simpatizante?.mesa_votacion_general || pasajero.simpatizante?.mesa_votacion_interna || '-'}
                  <span className="text-text-tertiary ml-3">Orden: </span>
                  {pasajero.simpatizante?.orden_votacion_general || pasajero.simpatizante?.orden_votacion_interna || '-'}
                </p>
                <p className="text-sm text-text-primary">
                  <span className="text-text-tertiary">Transporte: </span>
                  {pasajero.transportista?.chapa_vehiculo}
                </p>
              </div>
            </div>

            {pasajero.es_duplicado && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-warning">
                  ⚠️ Este pasajero está registrado en otro transporte
                </p>
              </div>
            )}

            <button
              onClick={handleConfirmar}
              disabled={confirmarMutation.isPending}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {confirmarMutation.isPending ? 'Confirmando...' : 'Confirmar Pasajero'}
            </button>
          </>
        )}

        {/* Estado: Confirmado */}
        {confirmado && pasajeroConfirmado && (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="text-lg font-semibold text-success">¡Confirmado!</p>
              <p className="text-sm text-text-secondary mt-1">
                {pasajeroConfirmado.simpatizante?.nombre} {pasajeroConfirmado.simpatizante?.apellido}
              </p>
              <p className="text-xs text-text-tertiary">
                Mesa: {pasajeroConfirmado.simpatizante?.mesa_votacion_general || pasajeroConfirmado.simpatizante?.mesa_votacion_interna} |
                Orden: {pasajeroConfirmado.simpatizante?.orden_votacion_general || pasajeroConfirmado.simpatizante?.orden_votacion_interna}
              </p>
            </div>

            <div className="flex gap-2 mb-3">
              {configuracion?.permitir_impresion_tickets ? (
                <button
                  onClick={() => setModalTicketOpen(true)}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir Ticket
                </button>
              ) : (
                <button
                  onClick={() => setModalTicketOpen(true)}
                  className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Ver Datos
                </button>
              )}
            </div>

            <button
              onClick={handleSiguiente}
              className="w-full btn btn-outline"
            >
              Escanear Siguiente
            </button>
          </>
        )}
      </div>

      {/* Modal Ticket */}
      {pasajeroConfirmado && (
        <ModalTicket
          isOpen={modalTicketOpen}
          onClose={() => setModalTicketOpen(false)}
          pasajero={pasajeroConfirmado}
          permitirImpresion={configuracion?.permitir_impresion_tickets ?? false}
        />
      )}
    </>
  );
};