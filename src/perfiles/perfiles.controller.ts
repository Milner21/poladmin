import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { CrearPerfilDto } from './dto/crear-perfil.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('perfiles')
@UseGuards(JwtAuthGuard)
export class PerfilesController {
  constructor(private perfilesService: PerfilesService) {}

  @Post()
  crear(@Body() crearPerfilDto: CrearPerfilDto, @Req() req: any) {
    return this.perfilesService.crear(crearPerfilDto, req.user.id);
  }

  @Get()
  obtenerTodos() {
    return this.perfilesService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.perfilesService.obtenerPorId(id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarPerfilDto: ActualizarPerfilDto,
    @Req() req: any,
  ) {
    return this.perfilesService.actualizar(id, actualizarPerfilDto, req.user.id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.perfilesService.eliminar(id);
  }

  @Post(':id/permisos')
  asignarPermisos(@Param('id') id: string, @Body('permisos_ids') permisosIds: string[]) {
    return this.perfilesService.asignarPermisos(id, permisosIds);
  }
}