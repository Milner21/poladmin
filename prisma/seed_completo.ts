import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando estructura completa de niveles y perfiles...');

  // === CREAR NIVELES ===
  console.log('\n--- Creando niveles ---');
  
  const nivelesData = [
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

  const nivelesCreados: any[] = [];
  for (const nivelData of nivelesData) {
    const existe = await prisma.nivel.findUnique({
      where: { nombre: nivelData.nombre },
    });

    if (!existe) {
      const nivel = await prisma.nivel.create({ data: nivelData });
      nivelesCreados.push(nivel);
      console.log(`✅ Nivel creado: ${nivel.nombre}`);
    } else {
      nivelesCreados.push(existe);
      console.log(`⚠️  Nivel ya existe: ${existe.nombre}`);
    }
  }

  // Crear mapa de niveles por nombre
  const nivelMap = nivelesCreados.reduce((acc, nivel) => {
    acc[nivel.nombre] = nivel;
    return acc;
  }, {} as Record<string, any>);

  // === CREAR PERFILES ===
  console.log('\n--- Creando perfiles ---');
  
  const perfilesData = [
    // Perfiles políticos con nivel
    {
      nombre: 'CANDIDATO_INTENDENTE',
      nivel_id: nivelMap['INTENDENTE'].id,
      es_operativo: false,
      estado: true,
    },
    {
      nombre: 'CANDIDATO_CONCEJAL',
      nivel_id: nivelMap['CONCEJAL'].id,
      es_operativo: false,
      estado: true,
    },
    {
      nombre: 'LIDER_COMUNAL',
      nivel_id: nivelMap['LIDER'].id,
      es_operativo: false,
      estado: true,
    },
    // Perfiles operativos (sin nivel)
    {
      nombre: 'GESTOR',
      nivel_id: null,
      es_operativo: true,
      estado: true,
    },
    {
      nombre: 'TRANSPORTISTA',
      nivel_id: null,
      es_operativo: true,
      estado: true,
    },
    {
      nombre: 'OPERADOR_TRANSPORTE',
      nivel_id: null,
      es_operativo: true,
      estado: true,
    },
    // Perfil ROOT
    {
      nombre: 'ROOT',
      nivel_id: null,
      es_operativo: false,
      estado: true,
    },
  ];

  let perfilesCreados = 0;
  for (const perfilData of perfilesData) {
    const existe = await prisma.perfil.findUnique({
      where: { nombre: perfilData.nombre },
    });

    if (!existe) {
      await prisma.perfil.create({ data: perfilData });
      perfilesCreados++;
      console.log(`✅ Perfil creado: ${perfilData.nombre}`);
    } else {
      console.log(`⚠️  Perfil ya existe: ${perfilData.nombre}`);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   • Niveles creados: ${nivelesCreados.length}`);
  console.log(`   • Perfiles creados: ${perfilesCreados}`);
  console.log('🚀 Seed completo ejecutado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed completo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });