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
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { AsignarSolicitudDto } from './dto/asignar-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { AgendarSolicitudDto } from './dto/agendar-solicitud.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  crear(@Body() createSolicitudDto: CreateSolicitudDto, @Request() req: any) {
    return this.solicitudesService.crear(createSolicitudDto, req.user.id);
  }

  @Get()
  obtenerTodos(@Request() req: any) {
    return this.solicitudesService.obtenerTodos(req.user.id);
  }

  @Get('dashboard')
  obtenerDashboard(@Request() req: any) {
    return this.solicitudesService.obtenerDashboard(req.user.id);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Request() req: any) {
    return this.solicitudesService.obtenerPorId(id, req.user.id);
  }

  @Get(':id/movimientos')
  obtenerMovimientos(@Param('id') id: string, @Request() req: any) {
    return this.solicitudesService.obtenerMovimientos(id, req.user.id);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() updateSolicitudDto: UpdateSolicitudDto,
    @Request() req: any,
  ) {
    return this.solicitudesService.actualizar(id, updateSolicitudDto, req.user.id);
  }

  @Patch(':id/asignar')
  asignar(@Param('id') id: string, @Body() asignarDto: AsignarSolicitudDto, @Request() req: any) {
    return this.solicitudesService.asignar(id, asignarDto, req.user.id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() cambiarEstadoDto: CambiarEstadoSolicitudDto,
    @Request() req: any,
  ) {
    return this.solicitudesService.cambiarEstado(id, cambiarEstadoDto, req.user.id);
  }

  @Patch(':id/agendar')
  agendar(@Param('id') id: string, @Body() agendarDto: AgendarSolicitudDto, @Request() req: any) {
    return this.solicitudesService.agendar(id, agendarDto, req.user.id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req: any) {
    return this.solicitudesService.eliminar(id, req.user.id);
  }
}