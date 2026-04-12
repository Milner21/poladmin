import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción ajustar según tus dominios
    credentials: true,
  },
  namespace: 'transportes', // Namespace específico para transportes
})
export class TransportesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TransportesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir evento cuando se confirma un lote
  emitirLoteConfirmado(data: {
    hash_lote: string;
    transportista_id: string;
    cantidad: number;
    pasajeros_confirmados: unknown[];
  }) {
    this.logger.log(`Emitiendo evento: lote-confirmado para ${data.hash_lote}`);
    this.server.emit('lote-confirmado', data);
  }

  // Emitir evento cuando se registra un nuevo pasajero
  emitirPasajeroRegistrado(data: {
    transportista_id: string;
    pasajero: unknown;
  }) {
    this.logger.log(`Emitiendo evento: pasajero-registrado`);
    this.server.emit('pasajero-registrado', data);
  }
}