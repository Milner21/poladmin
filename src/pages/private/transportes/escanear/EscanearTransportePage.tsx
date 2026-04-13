import { useState, useRef, useCallback, type FC } from "react";
import { PageHeader } from "@components";
import { CheckCircle, Loader2, QrCode, XCircle, AlertTriangle } from "lucide-react";
import { EscanerQR } from "./components/EscanerQR";
import { useConfirmarLote } from "../hooks/useConfirmarLote";
import type { ResultadoConfirmacionLote } from "@dto/transporte.types";

type EstadoEscaner = "esperando" | "procesando" | "exito" | "error";

const EscanearTransportePage: FC = () => {
  const [estado, setEstado] = useState<EstadoEscaner>("esperando");
  const [resultado, setResultado] = useState<ResultadoConfirmacionLote | null>(null);
  const [mensajeError, setMensajeError] = useState<string>("");
  const confirmarLoteMutation = useConfirmarLote();
  
  // Este ref es la fuente de verdad para bloquear escaneos
  const bloqueado = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScanSuccess = useCallback((hashLote: string) => {
    // Si está bloqueado, ignorar completamente
    if (bloqueado.current) {
      return;
    }

    // Bloquear INMEDIATAMENTE
    bloqueado.current = true;
    setEstado("procesando");

    confirmarLoteMutation.mutate(hashLote, {
      onSuccess: (data) => {
        setResultado(data);
        setEstado("exito");

        // Desbloquear después de 4 segundos
        timerRef.current = setTimeout(() => {
          bloqueado.current = false;
          setEstado("esperando");
          setResultado(null);
        }, 4000);
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Error al confirmar el viaje";
        setMensajeError(msg);
        setEstado("error");

        // Desbloquear después de 5 segundos
        timerRef.current = setTimeout(() => {
          bloqueado.current = false;
          setEstado("esperando");
          setMensajeError("");
        }, 5000);
      },
    });
  }, []); // Sin dependencias para que no se recree

  const handleReintentar = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    bloqueado.current = false;
    setEstado("esperando");
    setMensajeError("");
    setResultado(null);
    confirmarLoteMutation.reset();
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <div className="bg-bg-content border-b border-border px-4 py-3">
        <PageHeader
          title="Escáner de Transportes"
          subtitle="Escaneá el QR del transportista para confirmar su viaje"
          showDivider={false}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        
        {/* Escáner SIEMPRE MONTADO */}
        <div className="w-full max-w-md">
          <div className={`bg-bg-content border-2 rounded-2xl p-6 shadow-xl transition-all ${
            estado === "esperando" ? "border-primary/30" :
            estado === "procesando" ? "border-warning/30" :
            estado === "exito" ? "border-success/30" :
            "border-danger/30"
          }`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <QrCode size={24} className="text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">
                {estado === "esperando" ? "Apuntá al código QR" :
                 estado === "procesando" ? "Procesando..." :
                 estado === "exito" ? "¡Confirmado!" :
                 "Error al confirmar"}
              </h3>
            </div>

            {/* El escáner SIEMPRE está montado, solo varía el overlay */}
            <EscanerQR
              onScanSuccess={handleScanSuccess}
              bloqueado={bloqueado.current}
              estado={estado}
            />

            <p className="text-xs text-text-tertiary text-center mt-3">
              {estado === "esperando" && "El sistema confirmará el viaje automáticamente"}
              {estado === "procesando" && "Aguardá mientras se procesa..."}
              {estado === "exito" && "Volviendo al escáner en 4 segundos..."}
              {estado === "error" && "Volviendo al escáner en 5 segundos..."}
            </p>
          </div>
        </div>

        {/* Panel de estado DEBAJO del escáner */}
        {estado === "procesando" && (
          <div className="w-full max-w-md bg-warning/10 border border-warning/30 rounded-xl p-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-warning mx-auto mb-2" />
            <p className="text-sm font-semibold text-warning">Confirmando viaje...</p>
          </div>
        )}

        {estado === "exito" && resultado && (
          <div className="w-full max-w-md bg-success/10 border border-success/30 rounded-xl p-4 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
            <h4 className="text-lg font-bold text-success mb-1">¡Viaje Confirmado!</h4>
            <p className="text-sm text-text-primary">
              {resultado.cantidad} pasajero(s) confirmado(s)
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Transportista: {resultado.transportista.nombre} {resultado.transportista.apellido}
            </p>
            <div className="mt-3 p-2 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-xs text-warning font-medium flex items-center gap-1 justify-center">
                <AlertTriangle size={14} />
                Pedile al transportista que aleje el celular
              </p>
            </div>
          </div>
        )}

        {estado === "error" && (
          <div className="w-full max-w-md bg-danger/10 border border-danger/30 rounded-xl p-4 text-center">
            <XCircle className="w-10 h-10 text-danger mx-auto mb-2" />
            <h4 className="text-lg font-bold text-danger mb-1">Error al Confirmar</h4>
            <p className="text-sm text-danger mb-3">{mensajeError}</p>
            <button
              onClick={handleReintentar}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              Reintentar ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscanearTransportePage;