import { Module } from '@nestjs/common';
import { TransportesService } from './transportes.service';
import { TransportesController } from './transportes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TransportesGateway } from './transportes.gateway';
import { ImpresorasModule } from '../impresoras/impresoras.module';

@Module({
  imports: [PrismaModule, ImpresorasModule],
  controllers: [TransportesController],
  providers: [TransportesService, TransportesGateway],
  exports: [TransportesService],
})
export class TransportesModule {}