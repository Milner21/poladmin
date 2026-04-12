import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { AsistenciaPorEventoItemDto } from './dto/asistencias-por-evento.dto';
import { DistribucionRedItemDto } from './dto/distribucion-red.dto';
import { EstadisticasDto } from './dto/estadisticas.dto';
import { EventoRecienteItemDto } from './dto/eventos-recientes.dto';
import { SimpatizantesEvolucionDiariaDto } from './dto/simpatizantes-evolucion-diaria.dto';
import { SimpatizanteEvolucionItemDto } from './dto/simpatizantes-evolucion.dto';
import { Top10RegistrosDto } from './dto/top-10-registros.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('estadisticas')
  async obtenerEstadisticas(@Req() req): Promise<{ success: boolean; data: EstadisticasDto }> {
    const usuarioId = req.user.id;
    const data = await this.dashboardService.obtenerEstadisticas(usuarioId);
    return {
      success: true,
      data,
    };
  }

  @Get('simpatizantes-evolucion')
  async simpatizantesEvolucion(
    @Req() req,
    @Query('semanas', new DefaultValuePipe(6), ParseIntPipe) semanas: number,
  ): Promise<{ success: boolean; data: SimpatizanteEvolucionItemDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }
    const data = await this.dashboardService.obtenerEvolucionSimpatizantesSemanal(
      usuarioId,
      semanas,
    );
    return { success: true, data };
  }

  @Get('simpatizantes-evolucion-diaria')
  async simpatizantesEvolucionDiaria(
    @Req() req,
    @Query('dias', new DefaultValuePipe(7), ParseIntPipe) dias: number,
  ): Promise<{ success: boolean; data: SimpatizantesEvolucionDiariaDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }
    const data = await this.dashboardService.obtenerEvolucionSimpatizantesDiaria(usuarioId, dias);
    return { success: true, data };
  }

  @Get('asistencias-por-evento')
  async asistenciasPorEvento(
    @Req() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('mas_asistencias')) order: 'mas_asistencias' | 'recientes',
  ): Promise<{ success: boolean; data: AsistenciaPorEventoItemDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }

    // Validar order
    const ordenValida = order === 'recientes' ? 'recientes' : 'mas_asistencias';

    const data = await this.dashboardService.obtenerAsistenciasPorEvento(
      usuarioId,
      limit,
      ordenValida,
    );
    return { success: true, data };
  }

  @Get('distribucion-red')
  async distribucionRed(@Req() req): Promise<{ success: boolean; data: DistribucionRedItemDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }
    const data = await this.dashboardService.obtenerDistribucionRed(usuarioId);
    return { success: true, data };
  }

  @Get('eventos-recientes')
  async eventosRecientes(
    @Req() req,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<{ success: boolean; data: EventoRecienteItemDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }

    const data = await this.dashboardService.obtenerEventosRecientes(usuarioId, limit);
    return { success: true, data };
  }

  @Get('top10-registros')
  async top10Registros(@Req() req): Promise<{ success: boolean; data: Top10RegistrosDto[] }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return { success: false, data: [] };
    }
    const data = await this.dashboardService.obtenerTop10Registros(usuarioId);
    return { success: true, data };
  }

  @Get('intencion-voto')
  async intencionVoto(@Req() req): Promise<{
    success: boolean;
    data: {
      seguro: number;
      probable: number;
      indeciso: number;
      contrario: number;
      total: number;
    };
  }> {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return {
        success: false,
        data: { seguro: 0, probable: 0, indeciso: 0, contrario: 0, total: 0 },
      };
    }
    const data = await this.dashboardService.obtenerIntencionVoto(usuarioId);
    return { success: true, data };
  }
}
