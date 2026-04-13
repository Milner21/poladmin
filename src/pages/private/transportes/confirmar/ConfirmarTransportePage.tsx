import { PageHeader } from "@components";
import type { LoteConfirmado } from "@dto/transporte.types";
import { useTransportesWebSocket } from "@hooks/useTransportesWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, Eye, Printer, RefreshCw, Truck, Users } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import toast from "react-hot-toast";
import { useConfiguracionTransporte } from "../hooks/useConfiguacionTransporte";
import { useMisConfirmaciones } from "../hooks/useMisConfirmaciones";
import { ModalCarruselPasajeros } from "./components/ModalCarruselPasajeros";
import { ModalImpresionTickets } from "./components/ModalImpresionTickets";

const ConfirmarTransportePage: FC = () => {
  const queryClient = useQueryClient();
  const { data: configuracion } = useConfiguracionTransporte();
  const { data: confirmaciones, isLoading, refetch } = useMisConfirmaciones();

  const [modalImpresionOpen, setModalImpresionOpen] = useState(false);
  const [modalCarruselOpen, setModalCarruselOpen] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState<LoteConfirmado | null>(null);

  const handleLoteConfirmado = useCallback((data: {
    hash_lote: string;
    transportista_id: string;
    cantidad: number;
    pasajeros_confirmados: unknown[];
  }) => {
    toast.success(`Viaje confirmado: ${data.cantidad} pasajero(s)`);
    
    queryClient.invalidateQueries({ queryKey: ['mis-confirmaciones'] });
    
    refetch();
  }, [queryClient, refetch]);

  useTransportesWebSocket({
    onLoteConfirmado: handleLoteConfirmado,
  });

  const handleVerDatos = (lote: LoteConfirmado) => {
    setLoteSeleccionado(lote);
    
    if (configuracion?.permitir_impresion_tickets) {
      setModalImpresionOpen(true);
    } else {
      setModalCarruselOpen(true);
    }
  };

  const handleActualizar = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-tertiary">Cargando confirmaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="sticky top-0 z-10 bg-bg-content border-b border-border px-4 py-3">
        <PageHeader
          title="Gestión de Viajes"
          subtitle="Viajes confirmados desde el escáner"
          showDivider={false}
        />
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">Sistema activo</span>
            </div>
            
            <button
              onClick={handleActualizar}
              className="btn btn-outline flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>

          {confirmaciones && confirmaciones.length > 0 ? (
            <div className="bg-bg-content border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-surface border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Fecha/Hora
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Transportista
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Vehículo
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Pasajeros
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {confirmaciones.map((lote) => (
                      <tr 
                        key={lote.id}
                        className="hover:bg-bg-surface transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-text-tertiary" />
                            <span className="text-sm text-text-primary">
                              {new Date(lote.fecha_confirmacion).toLocaleString('es-PY', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {lote.transportista.nombre} {lote.transportista.apellido}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Truck size={14} className="text-text-tertiary" />
                            <div>
                              <p className="text-sm text-text-primary">
                                {lote.transportista.tipo_vehiculo}
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {lote.transportista.chapa_vehiculo}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle size={14} className="text-success" />
                            <span className="text-sm font-semibold text-success">
                              {lote.cantidad_pasajeros}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleVerDatos(lote)}
                              className="btn btn-sm btn-primary flex items-center gap-2"
                            >
                              {configuracion?.permitir_impresion_tickets ? (
                                <>
                                  <Printer size={14} />
                                  Imprimir
                                </>
                              ) : (
                                <>
                                  <Eye size={14} />
                                  Ver Datos
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-bg-content border-2 border-primary/30 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Esperando confirmaciones
              </h2>
              <p className="text-text-tertiary mb-6 max-w-md mx-auto">
                Cuando escanees un código QR desde el celular, el viaje confirmado aparecerá aquí automáticamente.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/30">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-success font-medium">WebSocket Conectado</span>
              </div>
              
              <div className="mt-8 p-4 bg-bg-surface rounded-lg border border-border max-w-md mx-auto">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Instrucciones:</h3>
                <ul className="text-xs text-text-tertiary space-y-1 text-left">
                  <li>• Dejá esta pantalla abierta en la notebook</li>
                  <li>• Usá el celular para ir a /admin/transportes/escanear</li>
                  <li>• Escaneá el código QR del transportista</li>
                  <li>• El viaje aparecerá automáticamente en esta tabla</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {loteSeleccionado && (
        <>
          <ModalImpresionTickets
            isOpen={modalImpresionOpen}
            onClose={() => {
              setModalImpresionOpen(false);
              setLoteSeleccionado(null);
            }}
            pasajeros={loteSeleccionado.pasajeros}
          />

          <ModalCarruselPasajeros
            isOpen={modalCarruselOpen}
            onClose={() => {
              setModalCarruselOpen(false);
              setLoteSeleccionado(null);
            }}
            pasajeros={loteSeleccionado.pasajeros}
          />
        </>
      )}
    </div>
  );
};

export default ConfirmarTransportePage;