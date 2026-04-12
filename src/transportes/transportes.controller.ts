import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Headers,
} from '@nestjs/common';
import { TransportesService } from './transportes.service';
import { CreateTransportistaDto } from './dto/create-transportista.dto';
import { UpdateTransportistaDto } from './dto/update-transportista.dto';
import { RegistrarPasajeroDto } from './dto/registrar-pasajero.dto';
import { ConfirmarPasajeroDto } from './dto/confirmar-pasajero.dto';
import { SolicitarVerificacionDto } from './dto/solicitar-verificacion.dto';
import { ResolverVerificacionDto } from './dto/resolver-verificacion.dto';
import { UpdateConfiguracionTransporteDto } from './dto/update-configuracion-transporte.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GenerarLoteConfirmacionDto } from './dto/generar-lote-confirmacion.dto';
import { ImpresorasGateway } from 'src/impresoras/impresoras.gateway';

// Eliminamos el 'any' de la request definiendo la interfaz correcta
interface AuthRequest extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('transportes')
@UseGuards(JwtAuthGuard)
export class TransportesController {
  constructor(
    private readonly transportesService: TransportesService,
    private readonly impresorasGateway: ImpresorasGateway,
  ) {}

  // ==========================================
  // TRANSPORTISTAS
  // ==========================================

  @Post('transportistas')
  crearTransportista(
    @Body() createDto: CreateTransportistaDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.crearTransportista(createDto, req.user.id, campanaId);
  }

  @Get('transportistas')
  obtenerTransportistas(@Request() req: AuthRequest, @Headers('x-campana-id') campanaId?: string) {
    return this.transportesService.obtenerTransportistas(req.user.id, campanaId);
  }

  @Get('transportistas/:id')
  obtenerTransportistaPorId(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerTransportistaPorId(id, req.user.id, campanaId);
  }

  @Get('mi-transportista')
  obtenerMiTransportista(@Request() req: AuthRequest, @Headers('x-campana-id') campanaId?: string) {
    return this.transportesService.obtenerMiTransportista(req.user.id, campanaId);
  }

  @Patch('transportistas/:id')
  actualizarTransportista(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransportistaDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.actualizarTransportista(id, updateDto, req.user.id, campanaId);
  }

  @Delete('transportistas/:id')
  eliminarTransportista(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.eliminarTransportista(id, req.user.id, campanaId);
  }

  // ==========================================
  // PASAJEROS
  // ==========================================

  @Post('pasajeros')
  registrarPasajero(
    @Body() registrarDto: RegistrarPasajeroDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.registrarPasajero(registrarDto, req.user.id, campanaId);
  }

  @Get('pasajeros')
  obtenerPasajeros(
    @Request() req: AuthRequest,
    @Query('transportista_id') transportistaId?: string,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerPasajeros(req.user.id, transportistaId, campanaId);
  }

  @Patch('pasajeros/confirmar')
  confirmarPasajero(
    @Body() confirmarDto: ConfirmarPasajeroDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.confirmarPasajero(confirmarDto, req.user.id, campanaId);
  }

  @Get('pasajeros/:id/ticket')
  obtenerTicketPasajero(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerTicketPasajero(id, req.user.id, campanaId);
  }

  @Get('pasajeros-atrasados')
  obtenerPasajerosAtrasados(
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerPasajerosAtrasados(req.user.id, campanaId);
  }

  @Delete('pasajeros/:id')
  eliminarPasajero(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.eliminarPasajero(id, req.user.id, campanaId);
  }

  // ==========================================
  // VERIFICACIONES
  // ==========================================

  @Post('verificaciones')
  solicitarVerificacion(
    @Body() solicitarDto: SolicitarVerificacionDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.solicitarVerificacion(solicitarDto, req.user.id, campanaId);
  }

  @Get('verificaciones')
  obtenerVerificaciones(
    @Request() req: AuthRequest,
    @Query('estado') estado?: string,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerVerificaciones(req.user.id, estado, campanaId);
  }

  @Patch('verificaciones/:id/resolver')
  resolverVerificacion(
    @Param('id') id: string,
    @Body() resolverDto: ResolverVerificacionDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.resolverVerificacion(id, resolverDto, req.user.id, campanaId);
  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  @Get('configuracion')
  obtenerConfiguracion(@Request() req: AuthRequest, @Headers('x-campana-id') campanaId?: string) {
    return this.transportesService.obtenerConfiguracion(req.user.id, campanaId);
  }

  @Patch('configuracion')
  actualizarConfiguracion(
    @Body() updateDto: UpdateConfiguracionTransporteDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.actualizarConfiguracion(updateDto, req.user.id, campanaId);
  }

  // ==========================================
  // CONFIRMACIÓN MASIVA DE VIAJE
  // ==========================================

  @Patch('transportistas/:id/confirmar-viaje')
  confirmarViaje(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.confirmarLote(id, req.user.id, campanaId);
  }

  @Get('transportistas/:id/estado-confirmacion')
  obtenerEstadoConfirmacion(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerEstadoConfirmacion(id, req.user.id, campanaId);
  }

  @Get('mis-confirmaciones')
  obtenerMisConfirmaciones(
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.obtenerConfirmacionesPorOperador(req.user.id, campanaId);
  }

  // ==========================================
  // CONFIRMACIÓN MASIVA DE VIAJE (CON LOTES)
  // ==========================================

  @Post('generar-lote-confirmacion')
  generarLoteConfirmacion(
    @Body() dto: GenerarLoteConfirmacionDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.transportesService.generarLoteConfirmacion(
      dto.transportista_id,
      req.user.id,
      campanaId,
    );
  }

  @Patch('confirmar-lote/:hashLote')
  async confirmarLote(
    @Param('hashLote') hashLote: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    const resultado = await this.transportesService.confirmarLote(hashLote, req.user.id, campanaId);

    // Enviar trabajos de impresión pendientes al agente
    await this.enviarTrabajosImpresionPendientes(req.user.id);

    return resultado;
  }

  private async enviarTrabajosImpresionPendientes(usuarioId: string) {
    // Obtener trabajos pendientes del usuario
    const trabajosPendientes = await this.transportesService.obtenerTrabajosPendientes(usuarioId);

    for (const trabajo of trabajosPendientes) {
      const enviado = this.impresorasGateway.enviarTrabajoImpresion(trabajo.impresora.codigo, {
        id: trabajo.id,
        tipo: trabajo.tipo,
        datos: trabajo.datos,
      });

      await this.transportesService.actualizarEstadoTrabajo(
        trabajo.id,
        enviado ? 'ENVIADO' : 'FALLIDO',
        enviado ? undefined : 'Impresora desconectada',
      );
    }
  }
}
