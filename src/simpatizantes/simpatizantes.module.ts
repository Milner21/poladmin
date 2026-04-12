import { Module } from '@nestjs/common';
import { SimpatizantesController } from './simpatizantes.controller';
import { SimpatizantesService } from './simpatizantes.service';

@Module({
  controllers: [SimpatizantesController],
  providers: [SimpatizantesService],
  exports: [SimpatizantesService],
})
export class SimpatizantesModule {}