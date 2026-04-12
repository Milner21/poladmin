import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { FiltrosReporteDto } from './dto/filtros-reporte.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('captacion')
  async reporteCaptacion(@Req() req: any, @Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteCaptacion(req.user.id, filtros);
  }

  @Get('mapa-calor')
  async reporteMapaCalor(@Req() req: any, @Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteMapaCalor(req.user.id, filtros);
  }

  @Get('top-registradores')
  async reporteTopRegistradores(@Req() req: any, @Query() filtros: FiltrosReporteDto) {
    return this.reportesService.reporteTopRegistradores(req.user.id, filtros);
  }
}