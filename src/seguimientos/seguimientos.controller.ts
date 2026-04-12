import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SeguimientosService } from './seguimientos.service';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('seguimientos')
@UseGuards(JwtAuthGuard)
export class SeguimientosController {
  constructor(private seguimientosService: SeguimientosService) {}

  @Post()
  crear(@Body() crearSeguimientoDto: CrearSeguimientoDto, @Req() req: any) {
    return this.seguimientosService.crear(crearSeguimientoDto, req.user.id);
  }

  @Get('simpatizante/:id')
  obtenerPorSimpatizante(@Param('id') id: string, @Req() req: any) {
    return this.seguimientosService.obtenerPorSimpatizante(id, req.user.id);
  }

  @Get('estadisticas')
  obtenerEstadisticas(@Query('campana_id') campanaId: string, @Req() req: any) {
    return this.seguimientosService.obtenerEstadisticas(campanaId, req.user.id);
  }
}