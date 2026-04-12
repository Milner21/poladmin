import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Headers,
  Query,
} from '@nestjs/common';
import { SimpatizantesService } from './simpatizantes.service';
import { CrearSimpatizanteDto } from './dto/crear-simpatizante.dto';
import { ActualizarSimpatizanteDto } from './dto/actualizar-simpatizante.dto';
import { ActualizarIntencionVotoDto } from './dto/actualizar-intencion-voto.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('simpatizantes')
@UseGuards(JwtAuthGuard)
export class SimpatizantesController {
  constructor(private simpatizantesService: SimpatizantesService) {}

  @Post()
  crear(
    @Body() crearSimpatizanteDto: CrearSimpatizanteDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.crear(crearSimpatizanteDto, req.user.id, campanaId);
  }

  @Get()
  obtenerTodos(
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
    @Query('solo_propios') soloPropios?: string,
  ) {
    return this.simpatizantesService.obtenerTodos(req.user.id, campanaId, soloPropios === 'true');
  }

  @Get('buscar-padron/:cedula')
  buscarPadron(
    @Param('cedula') cedula: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.buscarPadron(cedula, req.user.id, campanaId);
  }

  @Get('busqueda-inteligente/:cedula')
  busquedaInteligente(
    @Param('cedula') cedula: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.busquedaInteligente(cedula, req.user.id, campanaId);
  }

  @Get('duplicados')
  obtenerDuplicados(@Request() req: AuthRequest, @Headers('x-campana-id') campanaId?: string) {
    return this.simpatizantesService.obtenerDuplicados(req.user.id, campanaId);
  }

  @Delete('duplicados/:id')
  eliminarDuplicado(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.eliminarDuplicado(id, req.user.id, campanaId);
  }

  @Patch('duplicados/:id/resolver')
  resolverDuplicado(
    @Param('id') id: string,
    @Body() body: { forzar?: boolean },
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.resolverDuplicado(id, req.user.id, campanaId, body.forzar);
  }

  @Patch('duplicados/:id/revertir')
  revertirResolucion(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.revertirResolucion(id, req.user.id, campanaId);
  }

  @Get('duplicados/por-simpatizante/:simpatizanteId')
  obtenerDuplicadosPorSimpatizante(
    @Param('simpatizanteId') simpatizanteId: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.obtenerDuplicadosPorSimpatizante(
      simpatizanteId,
      req.user.id,
      campanaId,
    );
  }

  @Get('por-usuario/:usuarioId')
  obtenerPorUsuario(
    @Param('usuarioId') usuarioId: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.obtenerPorUsuario(usuarioId, req.user.id, campanaId);
  }

  @Get(':id')
  obtenerPorId(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.obtenerPorId(id, req.user.id, campanaId);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarSimpatizanteDto: ActualizarSimpatizanteDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.actualizar(
      id,
      actualizarSimpatizanteDto,
      req.user.id,
      campanaId,
    );
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.eliminar(id, req.user.id, campanaId);
  }

  @Patch(':id/intencion-voto')
  actualizarIntencionVoto(
    @Param('id') id: string,
    @Body() actualizarIntencionDto: ActualizarIntencionVotoDto,
    @Request() req: AuthRequest,
    @Headers('x-campana-id') campanaId?: string,
  ) {
    return this.simpatizantesService.actualizarIntencionVoto(
      id,
      actualizarIntencionDto,
      req.user.id,
      campanaId,
    );
  }
}
