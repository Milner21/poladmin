import { useEffect, useRef, useState, type FC } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import { Camera, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type EstadoEscaner = "esperando" | "procesando" | "exito" | "error";

interface EscanerQRProps {
  onScanSuccess: (hashLote: string) => void;
  bloqueado: boolean;
  estado: EstadoEscaner;
}

export const EscanerQR: FC<EscanerQRProps> = ({ onScanSuccess, bloqueado, estado }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-container";
  
  const initGuardRef = useRef(false);
  const bloqueadoRef = useRef(bloqueado);
  const onScanSuccessRef = useRef(onScanSuccess);
  
  const ultimoHashProcesadoRef = useRef<string>("");
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
          setErrorCamara("Error de inicialización. Recargá la página.");
          setIniciando(false);
          return;
        }

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
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
            decodedText === ultimoHashProcesadoRef.current && 
            tiempoDesdeUltimaLectura < 2000
          ) {
            return;
          }

          if (!decodedText || decodedText.length < 20 || !decodedText.includes("-")) {
            return;
          }

          ultimoHashProcesadoRef.current = decodedText;
          tiempoUltimaLecturaRef.current = ahora;
          bloqueadoRef.current = true;

          onScanSuccessRef.current(decodedText);
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
            msg = "Permisos de cámara denegados. Por favor, habilitá el acceso en tu navegador.";
          } else if (errorMsg.includes("notfound")) {
            msg = "No se encontró ninguna cámara en este dispositivo.";
          } else if (errorMsg.includes("notreadable")) {
            msg = "La cámara está siendo usada por otra aplicación. Cerrá otras apps y volvé a intentar.";
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
        ultimoHashProcesadoRef.current = "";
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
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        id={scannerId}
        className="rounded-xl overflow-hidden border-4 border-primary/30 min-h-87.5"
      />

      {iniciando && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <Camera size={48} className="text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-primary font-medium">Iniciando cámara...</p>
            <p className="text-xs text-text-tertiary mt-2">
              Esperá unos segundos
            </p>
          </div>
        </div>
      )}

      {estado === "procesando" && (
        <div className="absolute inset-0 bg-warning/90 flex items-center justify-center backdrop-blur-sm rounded-xl z-10">
          <div className="text-center text-white">
            <Loader2 size={48} className="animate-spin mx-auto mb-2" />
            <p className="font-bold">Procesando...</p>
          </div>
        </div>
      )}

      {estado === "exito" && (
        <div className="absolute inset-0 bg-success/90 flex items-center justify-center backdrop-blur-sm rounded-xl z-10">
          <div className="text-center text-white">
            <CheckCircle size={48} className="mx-auto mb-2" />
            <p className="font-bold text-xl">Confirmado</p>
          </div>
        </div>
      )}

      {estado === "error" && (
        <div className="absolute inset-0 bg-danger/90 flex items-center justify-center backdrop-blur-sm rounded-xl z-10">
          <div className="text-center text-white">
            <AlertCircle size={48} className="mx-auto mb-2" />
            <p className="font-bold">Error</p>
          </div>
        </div>
      )}

      {estado === "esperando" && !iniciando && (
        <div className="absolute top-2 right-2 bg-success/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">ACTIVO</span>
        </div>
      )}
    </div>
  );
};