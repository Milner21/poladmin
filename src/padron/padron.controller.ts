import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PadronService } from './padron.service';
import { CargaPadronDto } from './dto/carga-padron.dto';

@Controller('padron')
@UseGuards(JwtAuthGuard)
export class PadronController {
  constructor(private readonly padronService: PadronService) {}

  @Post('cargar')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      fileFilter: (_, file, callback) => {
        const extensionesPermitidas = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        if (extensionesPermitidas.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async cargarExcel(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() cargaPadronDto: CargaPadronDto,
    @Req() req: { user: { id: string } },
  ) {
    if (!archivo) {
      throw new BadRequestException('No se recibio ningun archivo');
    }

    return this.padronService.cargarExcel(
      archivo,
      cargaPadronDto.tipo,
      req.user.id,
      cargaPadronDto.partido_id,
    );
  }

  @Get('buscar/:ci')
  buscarPorCi(@Param('ci') ci: string, @Req() req: { user: { id: string } }) {
    return this.padronService.buscarPorCi(ci, req.user.id);
  }

  @Get('stats')
  obtenerStats(@Req() req: { user: { id: string } }) {
    return this.padronService.obtenerStats(req.user.id);
  }

  @Get('listado/:tipo')
  obtenerListado(@Param('tipo') tipo: 'INTERNO' | 'GENERAL', @Req() req: { user: { id: string } }) {
    return this.padronService.obtenerListado(req.user.id, tipo, 50);
  }

  @Get('resumen/:tipo')
  resumenPorDistrito(
    @Param('tipo') tipo: 'INTERNO' | 'GENERAL',
    @Req() req: { user: { id: string } },
  ) {
    return this.padronService.resumenPorDistrito(req.user.id, tipo);
  }

  @Get('distrito/:tipo')
  obtenerPorDistrito(
    @Param('tipo') tipo: 'INTERNO' | 'GENERAL',
    @Query('departamento') departamento: string,
    @Query('distrito') distrito: string,
    @Query('pagina') pagina: string,
    @Query('limite') limite: string,
    @Query('buscar') buscar: string | undefined,
    @Req() req: { user: { id: string } },
  ) {
    if (!departamento || !distrito) {
      throw new BadRequestException('Los parametros departamento y distrito son requeridos');
    }

    return this.padronService.obtenerPorDistrito(
      req.user.id,
      tipo,
      departamento,
      distrito,
      pagina ? parseInt(pagina, 10) : 1,
      limite ? parseInt(limite, 10) : 50,
      buscar,
    );
  }
}
