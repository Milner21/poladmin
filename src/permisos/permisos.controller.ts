import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CrearPermisoDto } from './dto/crear-permiso.dto';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto';
import { AsignarPermisoPersonalizadoDto } from './dto/asignar-permiso-personalizado.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('permisos')
@UseGuards(JwtAuthGuard)
export class PermisosController {
  constructor(private permisosService: PermisosService) {}

  @Post()
  crear(@Body() crearPermisoDto: CrearPermisoDto) {
    return this.permisosService.crear(crearPermisoDto);
  }

  @Get()
  obtenerTodos(@Query('modulo') modulo?: string) {
    if (modulo) {
      return this.permisosService.obtenerPorModulo(modulo);
    }
    return this.permisosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.permisosService.obtenerPorId(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() actualizarPermisoDto: ActualizarPermisoDto) {
    return this.permisosService.actualizar(id, actualizarPermisoDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.permisosService.eliminar(id);
  }

  @Post('personalizado')
  asignarPermisoPersonalizado(
    @Body() asignarPermisoDto: AsignarPermisoPersonalizadoDto,
    @Req() req: any,
  ) {
    return this.permisosService.asignarPermisoPersonalizado(asignarPermisoDto, req.user.id);
  }

  @Delete('personalizado/:usuario_id/:permiso_id')
  quitarPermisoPersonalizado(
    @Param('usuario_id') usuarioId: string,
    @Param('permiso_id') permisoId: string,
  ) {
    return this.permisosService.quitarPermisoPersonalizado(usuarioId, permisoId);
  }

  @Get('personalizado/usuario/:usuario_id')
  obtenerPermisosPersonalizadosPorUsuario(@Param('usuario_id') usuarioId: string) {
    return this.permisosService.obtenerPermisosPersonalizadosPorUsuario(usuarioId);
  }
}