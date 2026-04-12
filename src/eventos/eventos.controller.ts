import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { ActualizarEventoDto } from './dto/actualizar-evento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  crear(@Body() crearEventoDto: CrearEventoDto, @Req() req: any) {
    return this.eventosService.crear(crearEventoDto, req.user.id);
  }

  @Get()
  obtenerTodos(@Req() req: any) {
    return this.eventosService.obtenerTodos(req.user.id);
  }

  @Get('proximos')
  obtenerProximos(@Req() req: any) {
    return this.eventosService.obtenerProximos(req.user.id);
  }

  @Get('pasados')
  obtenerPasados(@Req() req: any) {
    return this.eventosService.obtenerPasados(req.user.id);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.eventosService.obtenerPorId(id, req.user.id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarEventoDto: ActualizarEventoDto,
    @Req() req: any,
  ) {
    return this.eventosService.actualizar(id, actualizarEventoDto, req.user.id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    return this.eventosService.eliminar(id, req.user.id);
  }
}