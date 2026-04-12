import { Module } from '@nestjs/common';
import { ImpresorasService } from './impresoras.service';
import { ImpresorasController } from './impresoras.controller';
import { ImpresorasGateway } from './impresoras.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImpresorasController],
  providers: [ImpresorasService, ImpresorasGateway],
  exports: [ImpresorasService, ImpresorasGateway],
})
export class ImpresorasModule {}