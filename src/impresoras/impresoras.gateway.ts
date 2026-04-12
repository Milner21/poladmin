import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ImpresorasService } from './impresoras.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: 'impresoras',
})
export class ImpresorasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ImpresorasGateway.name);
  private agentes = new Map<string, string>();

  constructor(private impresorasService: ImpresorasService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);

    for (const [codigo, socketId] of this.agentes.entries()) {
      if (socketId === client.id) {
        this.agentes.delete(codigo);
        this.impresorasService.marcarDesconectada(codigo);
        this.logger.log(`Impresora ${codigo} desconectada`);
        break;
      }
    }
  }

  @SubscribeMessage('registrar_agente')
  async handleRegistrarAgente(
    client: Socket,
    data: {
      codigo_impresora: string;
      hostname: string;
      ip: string;
    },
  ) {
    try {
      const impresora = await this.impresorasService.obtenerPorCodigo(data.codigo_impresora);

      this.logger.log(`Agente registrado: ${data.codigo_impresora} - ${impresora.nombre}`);

      this.agentes.set(data.codigo_impresora, client.id);

      await this.impresorasService.registrarConexion(
        data.codigo_impresora,
        data.ip,
        data.hostname,
      );

      client.emit('registrado', {
        ok: true,
        impresora: {
          id: impresora.id,
          codigo: impresora.codigo,
          nombre: impresora.nombre,
          descripcion: impresora.descripcion,
        },
      });

      this.server.emit('impresora_conectada', {
        codigo: data.codigo_impresora,
        nombre: impresora.nombre,
      });
    } catch (error) {
      this.logger.error(`Error al registrar agente: ${error.message}`);
      client.emit('error_registro', {
        ok: false,
        mensaje: error.message,
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket, data: { codigo_impresora: string; timestamp: string }) {
    this.logger.debug(`Heartbeat de ${data.codigo_impresora}`);
  }

  @SubscribeMessage('trabajo_completado')
  async handleTrabajoCompletado(
    client: Socket,
    data: {
      trabajo_id: string;
    },
  ) {
    await this.impresorasService.marcarTrabajoCompletado(data.trabajo_id);
    this.logger.log(`Trabajo completado: ${data.trabajo_id}`);
  }

  @SubscribeMessage('trabajo_fallido')
  async handleTrabajoFallido(
    client: Socket,
    data: {
      trabajo_id: string;
      error: string;
    },
  ) {
    await this.impresorasService.marcarTrabajoFallido(data.trabajo_id, data.error);
    this.logger.error(`Trabajo fallido: ${data.trabajo_id} - ${data.error}`);
  }

  enviarTrabajoImpresion(codigoImpresora: string, trabajo: unknown) {
    const socketId = this.agentes.get(codigoImpresora);

    if (socketId) {
      this.server.to(socketId).emit('imprimir', trabajo);
      return true;
    }

    this.logger.warn(`Impresora ${codigoImpresora} no está conectada`);
    return false;
  }

  obtenerImpresorasConectadas(): string[] {
    return Array.from(this.agentes.keys());
  }
}