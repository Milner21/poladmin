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
  Headers,
} from '@nestjs/common';
import { ImpresorasService } from './impresoras.service';
import { CreateImpresoraDto } from './dto/create-impresora.dto';
import { UpdateImpresoraDto } from './dto/update-impresora.dto';
import { AsignarUsuarioDto } from './dto/asignar-usuario.dto';
import { CrearTrabajoDto } from './dto/crear-trabajo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ImpresorasGateway } from './impresoras.gateway';

interface AuthRequest extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('impresoras')
@UseGuards(JwtAuthGuard)
export class ImpresorasController {
  constructor(
    private readonly impresorasService: ImpresorasService,
    private readonly impresorasGateway: ImpresorasGateway,
  ) {}

  @Post()
  crearImpresora(
    @Body() createDto: CreateImpresoraDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.impresorasService.crearImpresora(createDto, req.user.id, campanaId);
  }

  @Get()
  obtenerImpresoras(@Request() req: AuthRequest, @Headers('x-campana-id') campanaId?: string) {
    return this.impresorasService.obtenerImpresoras(req.user.id, campanaId);
  }

  @Get('mi-impresora')
  obtenerMiImpresora(@Request() req: AuthRequest) {
    return this.impresorasService.obtenerImpresoraAsignada(req.user.id);
  }

  @Get(':id')
  obtenerImpresoraPorId(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.impresorasService.obtenerImpresoraPorId(id, req.user.id, campanaId);
  }

  @Patch(':id')
  actualizarImpresora(
    @Param('id') id: string,
    @Body() updateDto: UpdateImpresoraDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.impresorasService.actualizarImpresora(id, updateDto, req.user.id, campanaId);
  }

  @Delete(':id')
  eliminarImpresora(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.impresorasService.eliminarImpresora(id, req.user.id, campanaId);
  }

  @Post('asignar-usuario')
  asignarUsuario(@Body() dto: AsignarUsuarioDto) {
    return this.impresorasService.asignarUsuario(dto);
  }

  @Delete('desasignar-usuario/:usuarioId/:impresoraId')
  desasignarUsuario(
    @Param('usuarioId') usuarioId: string,
    @Param('impresoraId') impresoraId: string,
  ) {
    return this.impresorasService.desasignarUsuario(usuarioId, impresoraId);
  }

  @Post('crear-trabajo')
  crearTrabajo(@Body() dto: CrearTrabajoDto, @Request() req: AuthRequest) {
    return this.impresorasService.crearTrabajoImpresion(req.user.id, dto.tipo, dto.datos);
  }

  @Post('imprimir-tickets')
  async imprimirTickets(
    @Body() body: { pasajeros_ids: string[] },
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    const { trabajos } = await this.impresorasService.imprimirTicketsPorIds(
      body.pasajeros_ids,
      req.user.id,
      campanaId,
    );

    let exitosos = 0;
    let fallidos = 0;

    for (const trabajo of trabajos) {
      const enviado = this.impresorasGateway.enviarTrabajoImpresion(trabajo.codigoImpresora, {
        id: trabajo.trabajoId,
        tipo: 'TICKET_TRANSPORTE',
        datos: trabajo.datos,
      });

      if (enviado) {
        await this.impresorasService.actualizarEstadoTrabajo(trabajo.trabajoId, 'ENVIADO');
        exitosos++;
      } else {
        await this.impresorasService.actualizarEstadoTrabajo(
          trabajo.trabajoId,
          'FALLIDO',
          'Impresora desconectada al momento del envio',
        );
        fallidos++;
      }
    }

    return {
      exitosos,
      fallidos,
      mensaje: `${exitosos} ticket(s) enviados a la impresora`,
    };
  }
}
