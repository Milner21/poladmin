import { useState, useEffect, useRef, type FC } from "react";
import { X, CheckCircle, Loader2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEstadoConfirmacion } from "../../hooks/useEstadoConfirmacion";
import { useGenerarLoteConfirmacion } from "../../hooks/useGenerarLoteConfirmacion";
import toast from "react-hot-toast";

interface ModalConfirmarViajeProps {
  isOpen: boolean;
  onClose: () => void;
  transportistaId: string;
  onSuccess: () => void;
}

export const ModalConfirmarViaje: FC<ModalConfirmarViajeProps> = ({
  isOpen,
  onClose,
  transportistaId,
  onSuccess,
}) => {
  const [hashLote, setHashLote] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const generandoLote = useRef(false); // ← Control de ejecución única

  const { data: estadoConfirmacion, refetch } = useEstadoConfirmacion(
    transportistaId,
    isOpen
  );

  const generarLoteMutation = useGenerarLoteConfirmacion();

  // Generar lote al abrir el modal (solo una vez)
  useEffect(() => {
    if (isOpen && !hashLote && !generandoLote.current) {
      generandoLote.current = true;
      
      generarLoteMutation.mutate(transportistaId, {
        onSuccess: (data) => {
          setHashLote(data.hash_lote);
          generandoLote.current = false;
        },
        onError: (error) => {
          console.error('Error generando lote:', error);
          generandoLote.current = false;
          handleCerrar();
        }
      });
    }
  }, [isOpen]);

  const handleVerificar = async () => {
    setVerificando(true);
    
    toast("Verificando confirmación...", { icon: "🔍", duration: 2000 });
    
    const resultado = await refetch();
    
    if (resultado.data && !resultado.data.tiene_pendientes) {
      // Todos los pasajeros fueron confirmados
      setConfirmado(true);
      toast.success("¡Viaje confirmado exitosamente!");
      setTimeout(() => {
        onSuccess();
        handleCerrar();
      }, 2500);
    } else {
      // Aún hay pasajeros pendientes
      setVerificando(false);
      toast("El operador aún no confirmó el viaje. Aguardá un momento y volvé a verificar.", {
        icon: "⏳",
        duration: 4000,
      });
    }
  };

  const handleCerrar = () => {
    setHashLote(null);
    setVerificando(false);
    setConfirmado(false);
    generandoLote.current = false;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-content w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <QrCode size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Confirmar Viaje</h3>
              <p className="text-xs text-text-tertiary">
                {estadoConfirmacion?.pasajeros_pendientes || 0} pasajero(s) pendiente(s)
              </p>
            </div>
          </div>
          <button
            onClick={handleCerrar}
            disabled={verificando || confirmado || generarLoteMutation.isPending}
            className="p-2 rounded-lg hover:bg-bg-base transition-colors text-text-tertiary disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {generarLoteMutation.isPending ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-text-tertiary">Generando código QR...</p>
              <p className="text-xs text-text-tertiary mt-2">Esto puede tardar unos segundos</p>
            </div>
          ) : generarLoteMutation.isError ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-danger" />
              </div>
              <h3 className="text-lg font-bold text-danger mb-2">Error al generar QR</h3>
              <p className="text-sm text-text-tertiary mb-4">
                No se pudo crear el código de confirmación
              </p>
              <button
                onClick={handleCerrar}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                Cerrar
              </button>
            </div>
          ) : !confirmado ? (
            <>
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary text-center font-medium">
                  📱 Mostrá este código QR al operador del puesto de comando
                </p>
              </div>

              {/* QR Code */}
              {hashLote && (
                <div className="flex justify-center mb-6 bg-white rounded-xl p-6 shadow-inner">
                  <QRCodeSVG
                    value={hashLote}
                    size={256}
                    level="H"
                    includeMargin={true}
                    fgColor="#1a1a1a"
                    bgColor="#ffffff"
                  />
                </div>
              )}

              {/* Instrucciones */}
              <div className="mb-4 p-3 bg-bg-surface rounded-lg border border-border">
                <p className="text-xs text-text-tertiary text-center leading-relaxed">
                  <strong className="text-text-primary">Instrucciones:</strong><br />
                  1️⃣ Mostrá el QR al operador<br />
                  2️⃣ Esperá a que lo escanee<br />
                  3️⃣ Presioná "Verificar Confirmación"
                </p>
              </div>

              {/* Botón Verificar */}
              <button
                onClick={handleVerificar}
                disabled={verificando || !hashLote}
                className="w-full px-6 py-4 bg-success text-white rounded-xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
              >
                {verificando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verificar Confirmación
                  </>
                )}
              </button>

              <p className="text-xs text-text-tertiary text-center mt-3">
                Presioná después de que el operador escanee el código
              </p>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={40} className="text-success" />
              </div>
              <h3 className="text-2xl font-bold text-success mb-2">¡Viaje Confirmado!</h3>
              <p className="text-text-tertiary mb-1">
                {estadoConfirmacion?.pasajeros_confirmados} pasajero(s) registrado(s)
              </p>
              <p className="text-xs text-text-tertiary mt-4">
                Podés continuar con el siguiente viaje...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};