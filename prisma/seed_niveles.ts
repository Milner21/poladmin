//src/prisma/seed_niveles.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando niveles para elecciones municipales...');

  const niveles = [
    {
      nombre: 'INTENDENTE',
      orden: 1,
      descripcion: 'Candidato a Intendente Municipal',
      permite_operadores: true,
      exclusivo_root: false,
    },
    {
      nombre: 'CONCEJAL',
      orden: 2,
      descripcion: 'Candidato a Concejal',
      permite_operadores: true,
      exclusivo_root: false,
    },
    {
      nombre: 'LIDER',
      orden: 3,
      descripcion: 'Líder comunal o de barrio',
      permite_operadores: true,
      exclusivo_root: false,
    },
    {
      nombre: 'FACTURACION',
      orden: 99,
      descripcion: 'Perfil exclusivo para facturación y administración del sistema',
      permite_operadores: false,
      exclusivo_root: true,
    },
  ];

  let creados = 0;

  for (const nivel of niveles) {
    const existe = await prisma.nivel.findUnique({
      where: { nombre: nivel.nombre },
    });

    if (!existe) {
      await prisma.nivel.create({ data: nivel });
      creados++;
      console.log(`✅ Nivel creado: ${nivel.nombre}`);
    } else {
      console.log(`⚠️  Nivel ya existe: ${nivel.nombre}`);
    }
  }

  console.log(`📊 Total niveles creados: ${creados}`);
  console.log('🚀 Seed de niveles completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de niveles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });