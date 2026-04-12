import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { AuthModule } from './auth/auth.module';
import configuracion from './config/configuracion';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventosModule } from './eventos/eventos.module';
import { NivelesModule } from './niveles/niveles.module';
import { PerfilesModule } from './perfiles/perfiles.module';
import { PermisosModule } from './permisos/permisos.module';
import { PrismaModule } from './prisma/prisma.module';
import { SimpatizantesModule } from './simpatizantes/simpatizantes.module';
import { UsuariosModule } from './usuario/usuarios.module';
import { CampanasModule } from './campanas/campanas.module';
import { PadronModule } from './padron/padron.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeguimientosModule } from './seguimientos/seguimientos.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { TransportesModule } from './transportes/transportes.module';
import { ImpresorasModule } from './impresoras/impresoras.module';
import { PartidosModule } from './partidos/partidos.module';

@Module({
  imports: [
    AuthModule,
    PerfilesModule,
    PermisosModule,
    UsuariosModule,
    EventosModule,
    SimpatizantesModule,
    AsistenciasModule,
    DashboardModule,
    PrismaModule,
    NivelesModule,
    CampanasModule,
    PadronModule,
    DireccionesModule, 
    AuditoriaModule,
    ReportesModule,
    SeguimientosModule,
    SolicitudesModule,
    TransportesModule,
    ImpresorasModule,
    PartidosModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuracion] }),
  ],
})
export class AppModule {}
