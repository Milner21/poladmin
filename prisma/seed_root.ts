import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seeder de ROOT...');

  // 1. Asegurar que existe el perfil ROOT
  // El perfil ROOT no necesita nivel jerárquico asociado
  const perfilRoot = await prisma.perfil.upsert({
    where: { nombre: 'ROOT' },
    update: {},
    create: {
      nombre: 'ROOT',
      es_operativo: false,
      estado: true,
    },
  });

  // 2. Crear o actualizar el usuario ROOT
  const passwordHash = await bcrypt.hash('123456', 10);

  const rootUser = await prisma.usuario.upsert({
    where: { username: 'admin' }, 
    update: {
      // Si ya existe, le reseteamos la contraseña por si te olvidaste
      password: passwordHash,
      perfil_id: perfilRoot.id,
      estado: true,
      eliminado: false,
    },
    create: {
      nombre: 'Super',
      apellido: 'Administrador',
      username: 'admin',
      documento: '0000000', // Documento especial para ROOT
      password: passwordHash,
      perfil_id: perfilRoot.id,
      estado: true,
      eliminado: false,
      campana_id: null, // ROOT no pertenece a una campaña específica
    },
  });

  console.log('✅ Usuario ROOT creado/actualizado exitosamente.');
  console.log('------------------------------------------------');
  console.log(`👤 Usuario:   ${rootUser.username}`);
  console.log(`🔑 Password:  123456`);
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });