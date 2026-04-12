import { Module } from '@nestjs/common';
import { SeguimientosService } from './seguimientos.service';
import { SeguimientosController } from './seguimientos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}