import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PartidosService } from './partidos.service';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';

@Controller('partidos')
@UseGuards(JwtAuthGuard)
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Post()
  crear(
    @Body() dto: CrearPartidoDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.partidosService.crear(dto, req.user.id);
  }

  @Get()
  obtenerTodos() {
    return this.partidosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.partidosService.obtenerPorId(id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarPartidoDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.partidosService.actualizar(id, dto, req.user.id);
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.partidosService.eliminar(id, req.user.id);
  }
}