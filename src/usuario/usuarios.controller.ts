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
  Query,
  Headers,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto, @Req() req: any) {
    return this.usuariosService.crear(crearUsuarioDto, req.user.id);
  }

  @Get()
  obtenerTodos(@Req() req: any, @Query('campana_id') campanaId?: string) {
    return this.usuariosService.obtenerTodos(req.user.id, campanaId);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.obtenerPorId(id, req.user.id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
    @Req() req: any,
  ) {
    return this.usuariosService.actualizar(id, actualizarUsuarioDto, req.user.id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.eliminar(id, req.user.id);
  }

  @Post(':id/cambiar-password')
  cambiarPassword(
    @Param('id') id: string,
    @Body() cambiarPasswordDto: CambiarPasswordDto,
    @Req() req: any,
  ) {
    return this.usuariosService.cambiarPassword(id, cambiarPasswordDto, req.user.id);
  }

  @Get(':id/subordinados')
  obtenerSubordinados(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.obtenerSubordinados(id, req.user.id);
  }

  @Get('candidatos-superiores/:campanaId/:nivelOrden')
  obtenerCandidatosSuperiores(
    @Param('campanaId') campanaId: string,
    @Param('nivelOrden') nivelOrden: string,
    @Req() req: any,
  ) {
    // Solo ROOT puede usar este endpoint
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede consultar candidatos superiores');
    }
    return this.usuariosService.obtenerCandidatosSuperiores(campanaId, parseInt(nivelOrden, 10));
  }

  @Get('estadisticas/:campanaId')
  obtenerEstadisticas(@Param('campanaId') campanaId: string, @Req() req: any) {
    return this.usuariosService.obtenerEstadisticasPorCampana(campanaId, req.user.id);
  }

  @Get('red/con-simpatizantes')
  obtenerRedConConteoSimpatizantes(@Req() req: any, @Headers('x-campana-id') campanaId?: string) {
    return this.usuariosService.obtenerRedConConteoSimpatizantes(req.user.id, campanaId);
  }
}
