import { useState, useEffect, type FC } from "react";
import { X, Printer, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { PasajeroTransporte } from "@dto/transporte.types";
import { impresorasService } from "@services/impresoras.service";
import toast from "react-hot-toast";

interface ModalImpresionTicketsProps {
  isOpen: boolean;
  onClose: () => void;
  pasajeros: PasajeroTransporte[];
}

type EstadoImpresion = "verificando" | "agente" | "navegador" | "imprimiendo" | "completado" | "error";

export const ModalImpresionTickets: FC<ModalImpresionTicketsProps> = ({
  isOpen,
  onClose,
  pasajeros,
}) => {
  const [estado, setEstado] = useState<EstadoImpresion>("verificando");
  const [nombreImpresora, setNombreImpresora] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ exitosos: number; fallidos: number } | null>(null);

  // Verificar agente al abrir
  useEffect(() => {
    if (!isOpen) {
      setEstado("verificando");
      setNombreImpresora(null);
      setResultado(null);
      return;
    }

    verificarAgente();
  }, [isOpen]);

  const verificarAgente = async () => {
    setEstado("verificando");

    try {
      const { conectada, impresora } = await impresorasService.verificarAgente();

      if (conectada && impresora) {
        setNombreImpresora(impresora);
        setEstado("agente");
      } else {
        setEstado("navegador");
      }
    } catch {
      setEstado("navegador");
    }
  };

  const handleImprimirConAgente = async () => {
    setEstado("imprimiendo");

    try {
      const ids = pasajeros.map((p) => p.id);
      const res = await impresorasService.imprimirTickets(ids);

      setResultado({ exitosos: res.exitosos, fallidos: res.fallidos });
      setEstado("completado");

      if (res.exitosos > 0) {
        toast.success(`${res.exitosos} ticket(s) enviados a la impresora`);
      }

      if (res.fallidos > 0) {
        toast.error(`${res.fallidos} ticket(s) fallaron`);
      }
    } catch (error) {
      console.error("Error al imprimir:", error);
      toast.error("Error al enviar tickets a la impresora");
      setEstado("agente");
    }
  };

  const handleImprimirConNavegador = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-content w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Printer size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Tickets de Transporte</h3>
              <p className="text-xs text-text-tertiary">{pasajeros.length} pasajero(s) confirmado(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-base transition-colors text-text-tertiary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner de estado del agente */}
        <div className="px-4 pt-4">
          {estado === "verificando" && (
            <div className="flex items-center gap-3 p-3 bg-bg-surface border border-border rounded-lg">
              <Loader2 size={18} className="text-primary animate-spin" />
              <p className="text-sm text-text-secondary">Verificando impresora disponible...</p>
            </div>
          )}

          {estado === "agente" && (
            <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle size={18} className="text-success" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-success">
                  Impresora conectada: {nombreImpresora}
                </p>
                <p className="text-xs text-text-tertiary">
                  Los tickets se enviarán directamente a la impresora térmica
                </p>
              </div>
            </div>
          )}

          {estado === "navegador" && (
            <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <AlertTriangle size={18} className="text-warning" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-warning">
                  Sin agente de impresión detectado
                </p>
                <p className="text-xs text-text-tertiary">
                  Se usará la impresión del navegador. Asegurate de tener la impresora térmica configurada.
                </p>
              </div>
              <button
                onClick={verificarAgente}
                className="text-xs text-primary underline whitespace-nowrap"
              >
                Reintentar
              </button>
            </div>
          )}

          {estado === "imprimiendo" && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <Loader2 size={18} className="text-primary animate-spin" />
              <p className="text-sm font-semibold text-primary">
                Enviando tickets a la impresora...
              </p>
            </div>
          )}

          {estado === "completado" && resultado && (
            <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle size={18} className="text-success" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-success">
                  Impresión completada
                </p>
                <p className="text-xs text-text-tertiary">
                  {resultado.exitosos} ticket(s) impresos
                  {resultado.fallidos > 0 && `, ${resultado.fallidos} fallidos`}
                </p>
              </div>
            </div>
          )}

          {estado === "error" && (
            <div className="flex items-center gap-3 p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <AlertTriangle size={18} className="text-danger" />
              <p className="text-sm text-danger">Error al imprimir</p>
            </div>
          )}
        </div>

        {/* Vista previa de tickets */}
        <div className="flex-1 overflow-y-auto p-4 print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
            {pasajeros.map((pasajero, index) => (
              <div
                key={pasajero.id}
                className="border-2 border-dashed border-border rounded-lg p-4 bg-white text-black print:break-inside-avoid print:mb-4"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
                  <h4 className="text-lg font-bold uppercase">Ticket de Transporte</h4>
                  <p className="text-xs text-gray-600">Elecciones 2024</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Pasajero:</span>
                    <span className="text-sm font-bold text-right">
                      {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">CI:</span>
                    <span className="text-sm font-bold">{pasajero.simpatizante?.documento}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Local:</span>
                    <span className="text-sm font-semibold text-right max-w-[60%]">
                      {pasajero.simpatizante?.local_votacion_general || pasajero.simpatizante?.local_votacion_interna || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Mesa:</span>
                    <span className="text-sm font-semibold">
                      {pasajero.simpatizante?.mesa_votacion_general || pasajero.simpatizante?.mesa_votacion_interna || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Orden:</span>
                    <span className="text-sm font-semibold">
                      {pasajero.simpatizante?.orden_votacion_general || pasajero.simpatizante?.orden_votacion_interna || 'N/A'}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Transportista:</span>
                    <span className="text-xs font-medium text-right">
                      {pasajero.transportista?.nombre} {pasajero.transportista?.apellido}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-600 uppercase">Vehiculo:</span>
                    <span className="text-xs font-medium">
                      {pasajero.transportista?.tipo_vehiculo} - {pasajero.transportista?.chapa_vehiculo}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-300 text-center">
                  <p className="text-[10px] text-gray-500">
                    Confirmado: {new Date().toLocaleDateString('es-PY')} {new Date().toLocaleTimeString('es-PY')}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Ticket #{index + 1} de {pasajeros.length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Botones */}
        <div className="p-4 border-t border-border bg-bg-surface flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-base transition-colors"
          >
            Cerrar
          </button>

          {/* Siempre disponible como fallback */}
          {(estado === "navegador" || estado === "completado") && (
            <button
              onClick={handleImprimirConNavegador}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-primary hover:bg-bg-surface transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Imprimir con Navegador
            </button>
          )}

          {/* Botón principal: agente o navegador */}
          {estado === "agente" && (
            <button
              onClick={handleImprimirConAgente}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Imprimir en {nombreImpresora}
            </button>
          )}

          {estado === "navegador" && (
            <button
              onClick={handleImprimirConNavegador}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Imprimir Tickets
            </button>
          )}

          {estado === "imprimiendo" && (
            <button
              disabled
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-primary/50 cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" />
              Imprimiendo...
            </button>
          )}

          {estado === "completado" && (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-success hover:bg-success/90 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Listo
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:p-0, .print\\:p-0 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
};