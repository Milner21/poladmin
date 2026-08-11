//src/pages/private/verificador/components/EscanerQRVerificador.tsx
import { useEffect, useRef, useState, type FC } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import { Camera, AlertCircle, CheckCircle, X } from "lucide-react";

interface EscanerQRVerificadorProps {
  onScanSuccess: (pin: string) => void;
  onClose: () => void;
  bloqueado: boolean;
}

export const EscanerQRVerificador: FC<EscanerQRVerificadorProps> = ({ 
  onScanSuccess, 
  onClose, 
  bloqueado 
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-verificador-container";
  
  const initGuardRef = useRef(false);
  const bloqueadoRef = useRef(bloqueado);
  const onScanSuccessRef = useRef(onScanSuccess);
  
  const ultimoPinProcesadoRef = useRef<string>("");
  const tiempoUltimaLecturaRef = useRef<number>(0);
  
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
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
          console.error("Elemento del escáner no encontrado en el DOM");
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
          const tiempoDesdeUltimaLectura = ahora - tiempoUltimaLecturaRef.current;

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
          undefined
        );

        if (activo) {
          setIniciando(false);
        }

      } catch (err) {
        if (!activo) return;

        console.error("Error al iniciar escáner:", err);
        
        let msg = "No se pudo acceder a la cámara";

        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();
          
          if (errorMsg.includes("permission") || errorMsg.includes("notallowed")) {
            msg = "Permisos de cámara denegados. Habilitá el acceso en tu navegador.";
          } else if (errorMsg.includes("notfound")) {
            msg = "No se encontró ninguna cámara en este dispositivo.";
          } else if (errorMsg.includes("notreadable")) {
            msg = "La cámara está siendo usada por otra aplicación.";
          } else if (errorMsg.includes("notsupported") || errorMsg.includes("https")) {
            msg = "Tu navegador requiere HTTPS para usar la cámara.";
          } else {
            msg = `Error: ${err.message}`;
          }
        }

        setErrorCamara(msg);
        setIniciando(false);
        toast.error(msg);
      }
    };

    const timer = setTimeout(() => {
      iniciarEscaner();
    }, 200);

    return () => {
      clearTimeout(timer);
      activo = false;
      initGuardRef.current = false;

      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            const estadoScanner = scannerRef.current.getState();
            if (estadoScanner === 2) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          } catch (e) {
            console.warn("Error en cleanup:", e);
          }
          scannerRef.current = null;
        }
      };

      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!bloqueado) {
      const timer = setTimeout(() => {
        ultimoPinProcesadoRef.current = "";
        tiempoUltimaLecturaRef.current = 0;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [bloqueado]);

  if (errorCamara) {
    return (
      <div className="rounded-xl border-4 border-danger/30 bg-danger/10 p-8 text-center">
        <AlertCircle size={48} className="text-danger mx-auto mb-4" />
        <p className="text-sm text-danger font-medium mb-2">Error de Cámara</p>
        <p className="text-xs text-text-tertiary mb-3 whitespace-pre-line">{errorCamara}</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        title="Cerrar escáner"
      >
        <X size={16} />
      </button>

      <div 
        id={scannerId}
        className="rounded-xl overflow-hidden border-4 border-primary/30 min-h-80"
      />

      {iniciando && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <Camera size={48} className="text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-primary font-medium">Iniciando cámara...</p>
          </div>
        </div>
      )}

      {bloqueado && (
        <div className="absolute inset-0 bg-success/90 flex items-center justify-center backdrop-blur-sm rounded-xl z-10">
          <div className="text-center text-white">
            <CheckCircle size={48} className="mx-auto mb-2" />
            <p className="font-bold text-xl">PIN Detectado</p>
            <p className="text-sm">Procesando verificación...</p>
          </div>
        </div>
      )}

      {!iniciando && !bloqueado && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded-lg text-center z-10">
          <p className="font-medium">Apuntá la cámara al código QR del ticket</p>
        </div>
      )}
    </div>
  );
};