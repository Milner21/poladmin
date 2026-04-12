import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { CampanasService } from './campanas.service';
import { CrearCampanaDto } from './dto/crear-campana.dto';
import { ActualizarCampanaDto } from './dto/actualizar-campana.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActualizarConfiguracionCampanaDto } from './dto/actualizar-configuracion-campana.dto';

@Controller('campanas')
@UseGuards(JwtAuthGuard)
export class CampanasController {
  constructor(private campanasService: CampanasService) {}

  @Post()
  crear(@Body() crearCampanaDto: CrearCampanaDto, @Req() req: any) {
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede crear campañas');
    }
    return this.campanasService.crear(crearCampanaDto);
  }

  @Get()
  obtenerTodas(@Req() req: any) {
    const perfil = req.user.perfil?.nombre || '';
    const campanaId = req.user.campana_id || null;
    return this.campanasService.obtenerTodas(perfil, campanaId);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    const perfil = req.user.perfil?.nombre || '';
    const campanaId = req.user.campana_id || null;
    return this.campanasService.obtenerPorId(id, perfil, campanaId);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarCampanaDto: ActualizarCampanaDto,
    @Req() req: any,
  ) {
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede modificar campañas');
    }
    return this.campanasService.actualizar(id, actualizarCampanaDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede eliminar campañas');
    }
    return this.campanasService.eliminar(id);
  }

  @Patch(':id/configuracion')
  actualizarConfiguracion(
    @Param('id') id: string,
    @Body() dto: ActualizarConfiguracionCampanaDto,
    @Req() req: any,
  ) {
    const perfil = req.user.perfil?.nombre || '';
    return this.campanasService.actualizarConfiguracion(id, dto, perfil);
  }
}
