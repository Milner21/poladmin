import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CONFIG = {
  numIntendentes: 1,
  gestoresPorIntendente: 2,
  lideresPorIntendente: 5,
  concejalesPorIntendente: 6,
  gestoresPorConcejal: 2,
  lideresPorConcejal: 5,
  passwordDefault: 'password_default_123',
} as const;

// Helper para crear usuario si no existe
async function crearUsuarioSiNoExiste(data: {
  nombre: string;
  apellido: string;
  username: string;
  documento: string;
  password: string;
  perfil_id: string;
  nivel_id: string | null;
  candidato_superior_id: string | null;
  registrado_por_id: string;
  creado_por_id: string;
}) {
  const existente = await prisma.usuario.findUnique({
    where: { username: data.username },
  });

  if (existente) {
    console.log(`⚠️  Usuario '${data.username}' ya existe, saltando...`);
    return existente;
  }

  return prisma.usuario.create({
    data: {
      ...data,
      estado: true,
    },
  });
}

async function main() {
  console.log('Inicio del seed DISTRITAL...');

  // ============================================
  // OBTENER NIVELES DEL SEED PRINCIPAL
  // ============================================
  const nivelIntendente = await prisma.nivel.findUnique({
    where: { nombre: 'Intendente' },
  });
  const nivelConcejal = await prisma.nivel.findUnique({
    where: { nombre: 'Concejal' },
  });
  const nivelLider = await prisma.nivel.findUnique({
    where: { nombre: 'Lider' },
  });

  if (!nivelIntendente || !nivelConcejal || !nivelLider) {
    throw new Error(
      'Niveles no encontrados. Ejecutá el seed principal primero: npx prisma db seed',
    );
  }

  // ============================================
  // OBTENER PERFILES DEL SEED PRINCIPAL
  // ============================================
  const perfilIntendente = await prisma.perfil.findUnique({
    where: { nombre: 'INTENDENTE' },
  });
  const perfilConcejal = await prisma.perfil.findUnique({
    where: { nombre: 'CONCEJAL' },
  });
  const perfilLider = await prisma.perfil.findUnique({
    where: { nombre: 'LIDER' },
  });
  const perfilGestor = await prisma.perfil.findUnique({
    where: { nombre: 'GESTOR' },
  });
  const adminUsuario = await prisma.usuario.findUnique({
    where: { username: 'admin.app' },
  });

  if (
    !perfilIntendente ||
    !perfilConcejal ||
    !perfilLider ||
    !perfilGestor ||
    !adminUsuario
  ) {
    throw new Error(
      'Perfiles o usuario ROOT no encontrados. Ejecutá el seed principal primero.',
    );
  }

  console.log('✅ Niveles y perfiles encontrados');

  const passwordHash = await bcrypt.hash(CONFIG.passwordDefault, 10);

  // ============================================
  // CREAR INTENDENTE
  // ============================================
  const intendente = await crearUsuarioSiNoExiste({
    nombre: 'Intendente',
    apellido: 'Distrital',
    username: 'intendente.distrital',
    documento: 'INT000000001',
    password: passwordHash,
    perfil_id: perfilIntendente.id,
    nivel_id: nivelIntendente.id,
    candidato_superior_id: null,
    registrado_por_id: adminUsuario.id,
    creado_por_id: adminUsuario.id,
  });

  console.log(`✅ INTENDENTE '${intendente.username}' listo`);

  // ============================================
  // GESTORES BAJO EL INTENDENTE
  // ============================================
  for (let j = 0; j < CONFIG.gestoresPorIntendente; j++) {
    const gestor = await crearUsuarioSiNoExiste({
      nombre: `Gestor ${j + 1}`,
      apellido: 'Del Intendente',
      username: `gestor.intendente.${j + 1}`,
      documento: `GI${String(j + 1).padStart(8, '0')}`,
      password: passwordHash,
      perfil_id: perfilGestor.id,
      nivel_id: null,
      candidato_superior_id: intendente.id,
      registrado_por_id: adminUsuario.id,
      creado_por_id: adminUsuario.id,
    });
    console.log(`✅ GESTOR '${gestor.username}' listo bajo INTENDENTE`);
  }

  // ============================================
  // LIDERES BAJO EL INTENDENTE
  // ============================================
  for (let k = 0; k < CONFIG.lideresPorIntendente; k++) {
    const lider = await crearUsuarioSiNoExiste({
      nombre: `Lider ${k + 1}`,
      apellido: 'Del Intendente',
      username: `lider.intendente.${k + 1}`,
      documento: `LI${String(k + 1).padStart(8, '0')}`,
      password: passwordHash,
      perfil_id: perfilLider.id,
      nivel_id: nivelLider.id,
      candidato_superior_id: intendente.id,
      registrado_por_id: adminUsuario.id,
      creado_por_id: adminUsuario.id,
    });
    console.log(`✅ LIDER '${lider.username}' listo bajo INTENDENTE`);
  }

  // ============================================
  // CONCEJALES BAJO EL INTENDENTE
  // ============================================
  const concejales: Array<{ id: string; username: string; nombre: string }> = [];

  for (let i = 0; i < CONFIG.concejalesPorIntendente; i++) {
    const concejal = await crearUsuarioSiNoExiste({
      nombre: `Concejal ${i + 1}`,
      apellido: 'Municipal',
      username: `concejal.municipal.${i + 1}`,
      documento: `CM${String(i + 1).padStart(8, '0')}`,
      password: passwordHash,
      perfil_id: perfilConcejal.id,
      nivel_id: nivelConcejal.id,
      candidato_superior_id: intendente.id,
      registrado_por_id: adminUsuario.id,
      creado_por_id: adminUsuario.id,
    });
    concejales.push({
      id: concejal.id,
      username: concejal.username,
      nombre: concejal.nombre,
    });
    console.log(`✅ CONCEJAL '${concejal.username}' listo bajo INTENDENTE`);
  }

  // ============================================
  // GESTORES Y LIDERES BAJO CADA CONCEJAL
  // ============================================
  for (const concejal of concejales) {
    const numConcejal = concejal.nombre.split(' ')[1] ?? String(concejales.indexOf(concejal) + 1);

    // Gestores del Concejal
    for (let j = 0; j < CONFIG.gestoresPorConcejal; j++) {
      const gestor = await crearUsuarioSiNoExiste({
        nombre: `Gestor ${j + 1}`,
        apellido: `Del Concejal ${numConcejal}`,
        username: `gestor.concejal.${numConcejal}.${j + 1}`,
        documento: `GC${numConcejal}${String(j + 1).padStart(6, '0')}`,
        password: passwordHash,
        perfil_id: perfilGestor.id,
        nivel_id: null,
        candidato_superior_id: concejal.id,
        registrado_por_id: adminUsuario.id,
        creado_por_id: adminUsuario.id,
      });
      console.log(
        `✅ GESTOR '${gestor.username}' listo bajo CONCEJAL ${numConcejal}`,
      );
    }

    // Lideres del Concejal
    for (let k = 0; k < CONFIG.lideresPorConcejal; k++) {
      const lider = await crearUsuarioSiNoExiste({
        nombre: `Lider ${k + 1}`,
        apellido: `Del Concejal ${numConcejal}`,
        username: `lider.concejal.${numConcejal}.${k + 1}`,
        documento: `LC${numConcejal}${String(k + 1).padStart(6, '0')}`,
        password: passwordHash,
        perfil_id: perfilLider.id,
        nivel_id: nivelLider.id,
        candidato_superior_id: concejal.id,
        registrado_por_id: adminUsuario.id,
        creado_por_id: adminUsuario.id,
      });
      console.log(
        `✅ LIDER '${lider.username}' listo bajo CONCEJAL ${numConcejal}`,
      );
    }
  }

  // ============================================
  // RESUMEN
  // ============================================
  const totalLideres =
    CONFIG.lideresPorIntendente +
    CONFIG.lideresPorConcejal * CONFIG.concejalesPorIntendente;

  const totalGestores =
    CONFIG.gestoresPorIntendente +
    CONFIG.gestoresPorConcejal * CONFIG.concejalesPorIntendente;

  console.log('\n--- Seed DISTRITAL completado ---');
  console.log(`✅ 1 Intendente`);
  console.log(`✅ ${CONFIG.concejalesPorIntendente} Concejales`);
  console.log(`✅ ${totalGestores} Gestores (operativos)`);
  console.log(`✅ ${totalLideres} Líderes`);
  console.log(`✅ Contraseña por defecto: ${CONFIG.passwordDefault}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed DISTRITAL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });