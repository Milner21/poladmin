import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Creando perfiles predefinidos...');

  const perfiles = [
    // Perfiles políticos (se asignarán niveles después)
    {
      nombre: 'CANDIDATO_INTENDENTE',
      nivel_id: null,
      es_operativo: false,
      descripcion: 'Candidato a Intendente Municipal',
    },
    {
      nombre: 'CANDIDATO_CONCEJAL',
      nivel_id: null,
      es_operativo: false,
      descripcion: 'Candidato a Concejal',
    },
    {
      nombre: 'LIDER_COMUNAL',
      nivel_id: null,
      es_operativo: false,
      descripcion: 'Líder comunal o de barrio',
    },
    // Perfiles operativos
    {
      nombre: 'GESTOR',
      nivel_id: null,
      es_operativo: true,
      descripcion: 'Gestor de campaña - Actúa en nombre de su candidato superior',
    },
    {
      nombre: 'TRANSPORTISTA',
      nivel_id: null,
      es_operativo: true,
      descripcion: 'Transportista autorizado para transporte de votantes',
    },
    {
      nombre: 'OPERADOR_TRANSPORTE',
      nivel_id: null,
      es_operativo: true,
      descripcion: 'Operador encargado de confirmar viajes y gestionar transporte',
    },
    // Perfil ROOT
    {
      nombre: 'ROOT',
      nivel_id: null,
      es_operativo: false,
      descripcion: 'Usuario administrador del sistema - Acceso total',
    },
  ];

  let creados = 0;

  for (const perfil of perfiles) {
    const existe = await prisma.perfil.findUnique({
      where: { nombre: perfil.nombre },
    });

    if (!existe) {
      await prisma.perfil.create({ data: perfil });
      creados++;
      console.log(`✅ Perfil creado: ${perfil.nombre}`);
    } else {
      console.log(`⚠️  Perfil ya existe: ${perfil.nombre}`);
    }
  }

  console.log(`📊 Total perfiles creados: ${creados}`);
  console.log('🚀 Seed de perfiles completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de perfiles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });