import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@utils/constants';

interface LoteConfirmadoPayload {
  hash_lote: string;
  transportista_id: string;
  cantidad: number;
  pasajeros_confirmados: unknown[];
}

interface PasajeroRegistradoPayload {
  transportista_id: string;
  pasajero: unknown;
}

interface UseTransportesWebSocketProps {
  onLoteConfirmado?: (data: LoteConfirmadoPayload) => void;
  onPasajeroRegistrado?: (data: PasajeroRegistradoPayload) => void;
}

export const useTransportesWebSocket = ({
  onLoteConfirmado,
  onPasajeroRegistrado,
}: UseTransportesWebSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al namespace de transportes
    const socket = io(`${API_BASE_URL}/transportes`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado a transportes');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
    });

    // Eventos de negocio
    if (onLoteConfirmado) {
      socket.on('lote-confirmado', onLoteConfirmado);
    }

    if (onPasajeroRegistrado) {
      socket.on('pasajero-registrado', onPasajeroRegistrado);
    }

    // Cleanup al desmontar
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('lote-confirmado');
      socket.off('pasajero-registrado');
      socket.close();
    };
  }, [onLoteConfirmado, onPasajeroRegistrado]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
};