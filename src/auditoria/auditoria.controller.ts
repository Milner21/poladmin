import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get('logs')
  async obtenerLogs(
    @Req() req: any,
    @Query('modulo') modulo?: string,
    @Query('accion') accion?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditoriaService.obtenerLogs(req.user.id, {
      modulo: modulo as any,
      accion: accion as any,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }
}