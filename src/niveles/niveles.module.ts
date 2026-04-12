import { Module } from '@nestjs/common';
import { NivelesController } from './niveles.controller';
import { NivelesService } from './niveles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NivelesController],
  providers: [NivelesService],
  exports: [NivelesService],
})
export class NivelesModule {}