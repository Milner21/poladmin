import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import { ActualizarAsistenciaDto } from './dto/actualizar-asistencia.dto';
import { RegistrarAsistenciaMasivaDto } from './dto/registrar-asistencia-masiva.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('asistencias')
@UseGuards(JwtAuthGuard)
export class AsistenciasController {
  constructor(private asistenciasService: AsistenciasService) {}

  @Post()
  crear(@Body() crearAsistenciaDto: CrearAsistenciaDto) {
    return this.asistenciasService.crear(crearAsistenciaDto);
  }

  @Post('masivo')
  registrarMasivo(@Body() registrarMasivaDto: RegistrarAsistenciaMasivaDto) {
    return this.asistenciasService.registrarMasivo(registrarMasivaDto);
  }

  @Get('evento/:evento_id')
  obtenerPorEvento(@Param('evento_id') eventoId: string) {
    return this.asistenciasService.obtenerPorEvento(eventoId);
  }

  @Get('simpatizante/:simpatizante_id')
  obtenerPorSimpatizante(@Param('simpatizante_id') simpatizanteId: string) {
    return this.asistenciasService.obtenerPorSimpatizante(simpatizanteId);
  }

  @Get('estadisticas/:evento_id')
  obtenerEstadisticasEvento(@Param('evento_id') eventoId: string) {
    return this.asistenciasService.obtenerEstadisticasEvento(eventoId);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.asistenciasService.obtenerPorId(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() actualizarAsistenciaDto: ActualizarAsistenciaDto) {
    return this.asistenciasService.actualizar(id, actualizarAsistenciaDto);
  }

  @Patch(':id/marcar-asistencia')
  marcarAsistencia(@Param('id') id: string) {
    return this.asistenciasService.marcarAsistencia(id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.asistenciasService.eliminar(id);
  }
}