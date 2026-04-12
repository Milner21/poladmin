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
} from '@nestjs/common';
import { NivelesService } from './niveles.service';
import { CrearNivelDto } from './dto/crear-nivel.dto';
import { ActualizarNivelDto } from './dto/actualizar-nivel.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('niveles')
@UseGuards(JwtAuthGuard)
export class NivelesController {
  constructor(private nivelesService: NivelesService) {}

  @Post()
  crear(@Body() crearNivelDto: CrearNivelDto, @Req() req: any) {
    // Solo ROOT puede crear niveles
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede crear niveles');
    }
    return this.nivelesService.crear(crearNivelDto, req.user.id);
  }

  @Get()
  obtenerTodos() {
    return this.nivelesService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.nivelesService.obtenerPorId(id);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() actualizarNivelDto: ActualizarNivelDto,
    @Req() req: any,
  ) {
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede modificar niveles');
    }
    return this.nivelesService.actualizar(id, actualizarNivelDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    if (req.user.perfil?.nombre !== 'ROOT') {
      throw new ForbiddenException('Solo ROOT puede eliminar niveles');
    }
    return this.nivelesService.eliminar(id);
  }
}