import { useCallback, useEffect, useRef, useState } from 'react';

interface VersionInfo {
  version: string;
  fecha?: string;
  cambios: string[];
}

interface UseActualizacionReturn {
  versionInfo: VersionInfo | null;
  mostrarModal: boolean;
  isUpdating: boolean;
  handleActualizar: () => Promise<void>;
  handlePosponer: () => void;
}

const CLAVE_VERSION = 'poladmin_version';
const CLAVE_POSPUESTO = 'poladmin_update_postponed_until';
const INTERVALO_CONSULTA = 5 * 60 * 1000;

export const useActualizacion = (): UseActualizacionReturn => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const consultandoRef = useRef(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const estaPospuesto = useCallback((): boolean => {
    const pospuestoHasta = localStorage.getItem(CLAVE_POSPUESTO);
    if (!pospuestoHasta) return false;

    const hasta = parseInt(pospuestoHasta, 10);
    if (Date.now() >= hasta) {
      localStorage.removeItem(CLAVE_POSPUESTO);
      return false;
    }
    return true;
  }, []);

  const consultarVersion = useCallback(async () => {
    if (consultandoRef.current) return;
    consultandoRef.current = true;

    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const data: VersionInfo = await response.json();
      const versionGuardada = localStorage.getItem(CLAVE_VERSION);

      if (!versionGuardada) {
        localStorage.setItem(CLAVE_VERSION, data.version);
        return;
      }

      if (data.version !== versionGuardada && !estaPospuesto()) {
        setVersionInfo(data);
        setMostrarModal(true);
      }
    } catch {
      // Silenciar errores de red
    } finally {
      consultandoRef.current = false;
    }
  }, [estaPospuesto]);

  useEffect(() => {
    const timerInicial = setTimeout(consultarVersion, 2000);

    intervaloRef.current = setInterval(consultarVersion, INTERVALO_CONSULTA);

    const handleFocus = () => { void consultarVersion(); };
    const handleOnline = () => { void consultarVersion(); };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timerInicial);
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [consultarVersion]);

  const handleActualizar = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const nuevaVersion = versionInfo?.version;

    try {
      // 1. Notificar al SW que se actualice
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      // 2. Limpiar todos los caches del SW
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 3. Desregistrar todos los SW
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // 4. Guardar nueva version
      if (nuevaVersion) {
        localStorage.setItem(CLAVE_VERSION, nuevaVersion);
      }
      localStorage.removeItem(CLAVE_POSPUESTO);

      // 5. Recargar forzando descarga nueva
      window.location.reload();
    } catch {
      // Si algo falla igual recargamos
      if (nuevaVersion) {
        localStorage.setItem(CLAVE_VERSION, nuevaVersion);
      }
      window.location.reload();
    }
  }, [isUpdating, versionInfo]);

  const handlePosponer = useCallback(() => {
    const unaHora = Date.now() + 60 * 60 * 1000;
    localStorage.setItem(CLAVE_POSPUESTO, unaHora.toString());
    setMostrarModal(false);
  }, []);

  return {
    versionInfo,
    mostrarModal,
    isUpdating,
    handleActualizar,
    handlePosponer,
  };
};