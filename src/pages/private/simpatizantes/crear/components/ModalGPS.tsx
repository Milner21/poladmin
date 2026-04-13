import { useState } from 'react';
import { MapPin, Check, AlertTriangle, X } from 'lucide-react';
import type { FC } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUbicacionObtenida: (lat: number, lng: number) => void;
}

type EstadoGPS = 'inicial' | 'obteniendo' | 'exito' | 'error' | 'denegado';

export const ModalGPS: FC<Props> = ({ isOpen, onClose, onUbicacionObtenida }) => {
  const [estado, setEstado] = useState<EstadoGPS>('inicial');
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setEstado('error');
      setMensajeError('Tu dispositivo no soporta geolocalización');
      return;
    }

    setEstado('obteniendo');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordenadas({ lat: latitude, lng: longitude });
        setEstado('exito');
        
        // Auto-cerrar después de 1.5 segundos y enviar coordenadas
        setTimeout(() => {
          onUbicacionObtenida(latitude, longitude);
          handleCerrar();
        }, 1500);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setEstado('denegado');
            setMensajeError('Permiso de ubicación denegado. Habilitá la ubicación en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setEstado('error');
            setMensajeError('Ubicación no disponible. Verificá tu conexión GPS.');
            break;
          case error.TIMEOUT:
            setEstado('error');
            setMensajeError('Tiempo agotado. Intentá de nuevo.');
            break;
          default:
            setEstado('error');
            setMensajeError('Error desconocido obteniendo ubicación.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 segundos
        maximumAge: 60000, // 1 minuto de cache
      }
    );
  };

  const handleCerrar = () => {
    setEstado('inicial');
    setCoordenadas(null);
    setMensajeError('');
    onClose();
  };

  const handleReintentar = () => {
    setEstado('inicial');
    setMensajeError('');
    obtenerUbicacion();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-content rounded-xl p-6 mx-4 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Obtener Ubicación GPS
          </h3>
          <button
            onClick={handleCerrar}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido según estado */}
        <div className="text-center">
          {estado === 'inicial' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-text-primary font-medium mb-2">
                  ¿Obtener tu ubicación actual?
                </p>
                <p className="text-sm text-text-secondary">
                  Esto nos ayuda a ubicar mejor al simpatizante en el mapa electoral.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCerrar}
                  className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={obtenerUbicacion}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Obtener ubicación
                </button>
              </div>
            </div>
          )}

          {estado === 'obteniendo' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-text-primary font-medium mb-2">
                  Obteniendo ubicación...
                </p>
                <p className="text-sm text-text-secondary">
                  Asegurate de permitir el acceso a la ubicación cuando te lo solicite el navegador.
                </p>
              </div>
              {/* Barra de progreso animada */}
              <div className="w-full bg-bg-base rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {estado === 'exito' && coordenadas && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-success animate-bounce" />
              </div>
              <div>
                <p className="text-success font-medium mb-2">
                  ¡Ubicación obtenida!
                </p>
                <div className="text-sm text-text-secondary space-y-1">
                  <p>Latitud: {coordenadas.lat.toFixed(6)}</p>
                  <p>Longitud: {coordenadas.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}

          {(estado === 'error' || estado === 'denegado') && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <div>
                <p className="text-error font-medium mb-2">
                  {estado === 'denegado' ? 'Permiso denegado' : 'Error de ubicación'}
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  {mensajeError}
                </p>
                {estado === 'denegado' && (
                  <div className="text-xs text-text-tertiary bg-bg-base p-3 rounded-lg">
                    <p className="font-medium mb-1">💡 Para habilitar la ubicación:</p>
                    <p>1. Hacé clic en el ícono de ubicación en la barra de direcciones</p>
                    <p>2. Seleccioná "Permitir" o "Siempre permitir"</p>
                    <p>3. Recargá la página si es necesario</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCerrar}
                  className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleReintentar}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};