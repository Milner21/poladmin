import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { CrearDireccionDto } from './dto/crear-direccion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('direcciones')
@UseGuards(JwtAuthGuard)
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Get('buscar')
  buscarBarrios(
    @Query('departamento') departamento: string,
    @Query('ciudad') ciudad: string,
    @Query('q') busqueda?: string,
  ) {
    return this.direccionesService.buscarBarrios(departamento, ciudad, busqueda);
  }

  @Post()
  crear(@Body() crearDireccionDto: CrearDireccionDto, @Req() req: { user: { id: string } }) {
    return this.direccionesService.crear(crearDireccionDto, req.user.id);
  }
}