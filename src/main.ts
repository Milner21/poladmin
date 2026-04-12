import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { networkInterfaces } from 'os';

function getLocalIp(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;

    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const localIp = getLocalIp();

  app.enableCors({
    origin: true, // Permitir CUALQUIER origen en desarrollo
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'X-Requested-With',
      'Accept',
      'x-campana-id',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  const puerto = process.env.PORT || 4000;

  await app.listen(puerto, '0.0.0.0');

  console.log(`🚀 Server running on:`);
  console.log(`   - Local:   http://localhost:${puerto}`);
  console.log(`   - Network: http://${localIp}:${puerto}`);
}
bootstrap();
