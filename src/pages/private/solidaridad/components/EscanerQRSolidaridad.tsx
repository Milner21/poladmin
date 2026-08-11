//src/pages/private/solidaridad/components/EscanerQRSolidaridad.tsx
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle, X } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import toast from "react-hot-toast";

interface EscanerQRSolidaridadProps {
  onScanSuccess: (pin: string) => void;
  onClose: () => void;
  bloqueado: boolean;
}

export const EscanerQRSolidaridad: FC<EscanerQRSolidaridadProps> = ({
  onScanSuccess,
  onClose,
  bloqueado,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-solidaridad-container";

  const initGuardRef = useRef(false);
  const bloqueadoRef = useRef(bloqueado);
  const onScanSuccessRef = useRef(onScanSuccess);

  const ultimoPinProcesadoRef = useRef<string>("");
  const tiempoUltimaLecturaRef = useRef<number>(0);

  const [, setErrorCamara] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    bloqueadoRef.current = bloqueado;
  }, [bloqueado]);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (initGuardRef.current) {
      return;
    }
    initGuardRef.current = true;

    let activo = true;

    const iniciarEscaner = async () => {
      try {
        const elemento = document.getElementById(scannerId);
        if (!elemento) {
          setErrorCamara("Error de inicialización. Cerrá e intentá de nuevo.");
          setIniciando(false);
          return;
        }

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0,
        };

        const onScanSuccessCallback = (decodedText: string) => {
          if (!activo) return;

          const ahora = Date.now();
          const tiempoDesdeUltimaLectura =
            ahora - tiempoUltimaLecturaRef.current;

          if (bloqueadoRef.current) {
            return;
          }

          if (
            decodedText === ultimoPinProcesadoRef.current &&
            tiempoDesdeUltimaLectura < 1500
          ) {
            return;
          }

          const pin = decodedText.trim().toUpperCase();
          if (!/^[A-Z0-9]{6}$/.test(pin)) {
            toast.error("QR no válido. Debe contener un PIN de 6 caracteres.");
            return;
          }

          ultimoPinProcesadoRef.current = pin;
          tiempoUltimaLecturaRef.current = ahora;
          bloqueadoRef.current = true;

          onScanSuccessRef.current(pin);
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccessCallback,
          undefined,
        );

        if (activo) {
          setIniciando(false);
        }
      } catch (err) {
        if (!activo) return;
        let msg = "No se pudo acceder a la cámara";
        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();
          if (errorMsg.includes("permission"))
            msg = "Permisos de cámara denegados.";
          else if (errorMsg.includes("notfound"))
            msg = "No se encontró cámara.";
          else msg = err.message;
        }
        setErrorCamara(msg);
        setIniciando(false);
        toast.error(msg);
      }
    };

    const timer = setTimeout(() => iniciarEscaner(), 200);

    return () => {
      clearTimeout(timer);
      activo = false;
      initGuardRef.current = false;
      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            if (scannerRef.current.getState() === 2)
              await scannerRef.current.stop();
            await scannerRef.current.clear();
          } catch (e) {
            console.warn(e);
          }
          scannerRef.current = null;
        }
      };
      cleanup();
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
      >
        <X size={16} />
      </button>
      <div
        id={scannerId}
        className="rounded-xl overflow-hidden border-4 border-primary/30 min-h-80"
      />
      {iniciando && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-xl">
          <Camera size={48} className="text-primary animate-pulse" />
        </div>
      )}
      {bloqueado && (
        <div className="absolute inset-0 bg-success/90 flex items-center justify-center backdrop-blur-sm rounded-xl z-10">
          <div className="text-center text-white">
            <CheckCircle size={48} className="mx-auto mb-2" />
            <p className="font-bold">PIN Detectado</p>
          </div>
        </div>
      )}
    </div>
  );
};
