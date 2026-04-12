import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Iniciando seed de prueba...');

  // ============================================
  // 1. PERFIL ROOT
  // ============================================
  const perfilRoot = await prisma.perfil.upsert({
    where: { nombre: 'ROOT' },
    update: {},
    create: {
      nombre: 'ROOT',
      nivel_id: null,
      es_operativo: false,
      estado: true,
    },
  });
  console.log('✅ Perfil ROOT creado');

  // ============================================
  // 2. USUARIO ROOT
  // ============================================
  const adminUsername = process.env.ADMIN_USERNAME || 'admin.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminDocumento = process.env.ADMIN_DOCUMENTO || '00000000';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUsuario = await prisma.usuario.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      nombre: 'Admin',
      apellido: 'Test',
      username: adminUsername,
      documento: adminDocumento,
      password: passwordHash,
      perfil_id: perfilRoot.id,
      nivel_id: null,
      campana_id: null,
      estado: true,
    },
  });
  console.log('✅ Usuario ROOT creado:', adminUsuario.username);

  // ============================================
  // 3. PERMISOS COMPLETOS DEL SISTEMA
  // ============================================
  const permisos = [
    // Campañas
    { nombre: 'ver_campana', descripcion: 'Ver campañas del sistema', modulo: 'campanas', accion: 'ver' },
    { nombre: 'crear_campana', descripcion: 'Crear nuevas campañas', modulo: 'campanas', accion: 'crear' },
    { nombre: 'editar_campana', descripcion: 'Editar campañas', modulo: 'campanas', accion: 'editar' },
    { nombre: 'eliminar_campana', descripcion: 'Eliminar campañas', modulo: 'campanas', accion: 'eliminar' },

    // Dashboard
    { nombre: 'ver_dashboard', descripcion: 'Ver el dashboard', modulo: 'dashboard', accion: 'ver' },

    // Niveles
    { nombre: 'ver_nivel', descripcion: 'Ver niveles', modulo: 'niveles', accion: 'ver' },
    { nombre: 'crear_nivel', descripcion: 'Crear niveles', modulo: 'niveles', accion: 'crear' },
    { nombre: 'editar_nivel', descripcion: 'Editar niveles', modulo: 'niveles', accion: 'editar' },
    { nombre: 'eliminar_nivel', descripcion: 'Eliminar niveles', modulo: 'niveles', accion: 'eliminar' },

    // Usuarios
    { nombre: 'ver_usuario', descripcion: 'Ver usuarios', modulo: 'usuarios', accion: 'ver' },
    { nombre: 'crear_usuario', descripcion: 'Crear usuarios', modulo: 'usuarios', accion: 'crear' },
    { nombre: 'editar_usuario', descripcion: 'Editar usuarios', modulo: 'usuarios', accion: 'editar' },
    { nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios', modulo: 'usuarios', accion: 'eliminar' },

    // Perfiles
    { nombre: 'ver_perfil', descripcion: 'Ver perfiles', modulo: 'perfiles', accion: 'ver' },
    { nombre: 'crear_perfil', descripcion: 'Crear perfiles', modulo: 'perfiles', accion: 'crear' },
    { nombre: 'editar_perfil', descripcion: 'Editar perfiles', modulo: 'perfiles', accion: 'editar' },
    { nombre: 'eliminar_perfil', descripcion: 'Eliminar perfiles', modulo: 'perfiles', accion: 'eliminar' },

    // Permisos
    { nombre: 'ver_permiso', descripcion: 'Ver permisos', modulo: 'permisos', accion: 'ver' },
    { nombre: 'crear_permiso', descripcion: 'Crear permisos', modulo: 'permisos', accion: 'crear' },
    { nombre: 'editar_permiso', descripcion: 'Editar permisos', modulo: 'permisos', accion: 'editar' },
    { nombre: 'eliminar_permiso', descripcion: 'Eliminar permisos', modulo: 'permisos', accion: 'eliminar' },

    // Eventos
    { nombre: 'ver_evento', descripcion: 'Ver eventos', modulo: 'eventos', accion: 'ver' },
    { nombre: 'crear_evento', descripcion: 'Crear eventos', modulo: 'eventos', accion: 'crear' },
    { nombre: 'editar_evento', descripcion: 'Editar eventos', modulo: 'eventos', accion: 'editar' },
    { nombre: 'eliminar_evento', descripcion: 'Eliminar eventos', modulo: 'eventos', accion: 'eliminar' },

    // Simpatizantes
    { nombre: 'ver_simpatizante', descripcion: 'Ver simpatizantes', modulo: 'simpatizantes', accion: 'ver' },
    { nombre: 'crear_simpatizante', descripcion: 'Crear simpatizantes desde padrón', modulo: 'simpatizantes', accion: 'crear' },
    { nombre: 'editar_simpatizante', descripcion: 'Editar simpatizantes', modulo: 'simpatizantes', accion: 'editar' },
    { nombre: 'eliminar_simpatizante', descripcion: 'Eliminar simpatizantes', modulo: 'simpatizantes', accion: 'eliminar' },
    { nombre: 'crear_simpatizante_manual', descripcion: 'Crear simpatizantes manualmente sin padrón', modulo: 'simpatizantes', accion: 'crear' },

    // Asistencias
    { nombre: 'ver_asistencia', descripcion: 'Ver asistencias', modulo: 'asistencias', accion: 'ver' },
    { nombre: 'registrar_asistencia', descripcion: 'Registrar asistencias', modulo: 'asistencias', accion: 'registrar' },
    { nombre: 'crear_asistencia', descripcion: 'Crear asistencias', modulo: 'asistencias', accion: 'crear' },
    { nombre: 'editar_asistencia', descripcion: 'Editar asistencias', modulo: 'asistencias', accion: 'editar' },
    { nombre: 'eliminar_asistencia', descripcion: 'Eliminar asistencias', modulo: 'asistencias', accion: 'eliminar' },

    // Padrón
    { nombre: 'ver_padron', descripcion: 'Ver padrón electoral', modulo: 'padron', accion: 'ver' },
    { nombre: 'cargar_padron', descripcion: 'Cargar archivos de padrón', modulo: 'padron', accion: 'crear' },

    // Direcciones
    { nombre: 'ver_direccion', descripcion: 'Ver direcciones/barrios', modulo: 'direcciones', accion: 'ver' },
    { nombre: 'crear_direccion', descripcion: 'Crear nuevos barrios', modulo: 'direcciones', accion: 'crear' },
  ];

  for (const permiso of permisos) {
    const permisoCreado = await prisma.permiso.upsert({
      where: { nombre: permiso.nombre },
      update: { descripcion: permiso.descripcion },
      create: permiso,
    });

    // Asignar todos los permisos al ROOT
    await prisma.perfilPermiso.upsert({
      where: {
        perfil_id_permiso_id: {
          perfil_id: perfilRoot.id,
          permiso_id: permisoCreado.id,
        },
      },
      update: {},
      create: {
        perfil_id: perfilRoot.id,
        permiso_id: permisoCreado.id,
      },
    });
  }

  console.log(`✅ ${permisos.length} permisos creados y asignados al ROOT`);
  console.log('🧪 Seed de prueba completado exitosamente.');
  console.log('\n📝 Usuario ROOT:');
  console.log(`   Username: ${adminUsuario.username}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n🎯 Ahora podés crear el resto manualmente desde la interfaz.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de prueba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });