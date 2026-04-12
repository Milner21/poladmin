import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed a nivel Nacional...');

  // ============================================
  // 1. PERFIL ROOT (sin nivel, controla todo)
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
  // 2. USUARIO ROOT (No pertenece a ninguna campaña)
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
      apellido: 'Nacional',
      username: adminUsername,
      documento: adminDocumento,
      password: passwordHash,
      perfil_id: perfilRoot.id,
      nivel_id: null,
      campana_id: null, // ROOT ve TODAS las campañas
      estado: true,
    },
  });
  console.log('✅ Usuario ROOT creado:', adminUsuario.username);

  // ============================================
  // 3. PRIMERA CAMPAÑA DE PRUEBA
  // ============================================
  const campanaDemo = await prisma.campana.create({
  data: {
    nombre: 'Campaña Demo Ciudad del Este 2026',
    nivel_campana: 'DISTRITO',
    departamento: 'ALTO PARANA',
    distrito: 'CIUDAD DEL ESTE',
    estado: true,
    configuracion: {
      create: {
        modo_eleccion: 'INTERNAS',
      },
    },
  },
});
  console.log('✅ Campaña Demo creada:', campanaDemo.nombre);

  // ============================================
  // 4. NIVELES JERÁRQUICOS Y DE FACTURACIÓN
  // ============================================
  const nivelesData = [
    {
      nombre: 'Intendente',
      orden: 1,
      descripcion: 'Candidato Principal (Facturable)',
      permite_operadores: true,
      exclusivo_root: true, // SOLO ROOT PUEDE CREARLOS
    },
    {
      nombre: 'Concejal',
      orden: 2,
      descripcion: 'Candidato a Concejal (Facturable)',
      permite_operadores: true,
      exclusivo_root: true, // SOLO ROOT PUEDE CREARLOS
    },
    {
      nombre: 'Lider',
      orden: 3,
      descripcion: 'Líder de Barrio / Operador Territorial (Libre)',
      permite_operadores: false,
      exclusivo_root: false, // EL INTENDENTE/CONCEJAL PUEDE CREARLOS LIBREMENTE
    },
  ];

  const niveles: Record<string, { id: string }> = {};
  for (const nivelData of nivelesData) {
    const nivel = await prisma.nivel.upsert({
      where: { nombre: nivelData.nombre },
      update: {
        orden: nivelData.orden,
        permite_operadores: nivelData.permite_operadores,
        exclusivo_root: nivelData.exclusivo_root,
      },
      create: {
        ...nivelData,
        creado_por_id: adminUsuario.id,
      },
    });
    niveles[nivelData.nombre] = nivel;
  }
  console.log('✅ Niveles jerárquicos creados');

  // ============================================
  // 5. PERFILES BASE
  // ============================================
  const perfilesPoliticos = [
    { nombre: 'INTENDENTE', nivel_nombre: 'Intendente' },
    { nombre: 'CONCEJAL', nivel_nombre: 'Concejal' },
    { nombre: 'LIDER', nivel_nombre: 'Lider' },
  ];

  for (const perfilData of perfilesPoliticos) {
    await prisma.perfil.upsert({
      where: { nombre: perfilData.nombre },
      update: { nivel_id: niveles[perfilData.nivel_nombre].id },
      create: {
        nombre: perfilData.nombre,
        nivel_id: niveles[perfilData.nivel_nombre].id,
        es_operativo: false,
        estado: true,
      },
    });
  }

  // PERFILES OPERATIVOS (Sin nivel jerárquico fijo)
  await prisma.perfil.upsert({
    where: { nombre: 'GESTOR' },
    update: { es_operativo: true, nivel_id: null },
    create: {
      nombre: 'GESTOR',
      nivel_id: null,
      es_operativo: true,
      estado: true,
    },
  });
  console.log('✅ Perfiles políticos y operativos creados');

  // ============================================
// 6. PERMISOS DEL SISTEMA
// ============================================
const permisos = [
  // Campañas (SaaS)
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
  { nombre: 'crear_simpatizante', descripcion: 'Crear simpatizantes', modulo: 'simpatizantes', accion: 'crear' },
  { nombre: 'editar_simpatizante', descripcion: 'Editar datos completos de simpatizantes', modulo: 'simpatizantes', accion: 'editar' },
  { nombre: 'eliminar_simpatizante', descripcion: 'Eliminar simpatizantes', modulo: 'simpatizantes', accion: 'eliminar' },
  { nombre: 'crear_simpatizante_manual', descripcion: 'Registrar simpatizante sin padrón', modulo: 'simpatizantes', accion: 'crear_manual' },
  { nombre: 'ver_lista_simpatizantes', descripcion: 'Ver listado completo de simpatizantes', modulo: 'simpatizantes', accion: 'ver_lista' },
  { nombre: 'actualizar_intencion_voto', descripcion: 'Actualizar intención de voto de simpatizantes', modulo: 'simpatizantes', accion: 'actualizar_intencion' },
  
  // Asistencias
  { nombre: 'ver_asistencia', descripcion: 'Ver asistencias', modulo: 'asistencias', accion: 'ver' },
  { nombre: 'registrar_asistencia', descripcion: 'Registrar asistencias', modulo: 'asistencias', accion: 'registrar' },
  { nombre: 'crear_asistencia', descripcion: 'Crear asistencias', modulo: 'asistencias', accion: 'crear' },
  { nombre: 'editar_asistencia', descripcion: 'Editar asistencias', modulo: 'asistencias', accion: 'editar' },
  { nombre: 'eliminar_asistencia', descripcion: 'Eliminar asistencias', modulo: 'asistencias', accion: 'eliminar' },
  
  // Padrón (solo ROOT)
  { nombre: 'ver_padron', descripcion: 'Ver padrón electoral', modulo: 'padron', accion: 'ver' },
  { nombre: 'cargar_padron', descripcion: 'Cargar padrón electoral desde Excel', modulo: 'padron', accion: 'cargar' },
  
  // Direcciones
  { nombre: 'ver_direccion', descripcion: 'Ver catálogo de direcciones/barrios', modulo: 'direcciones', accion: 'ver' },
  { nombre: 'crear_direccion', descripcion: 'Crear nuevos barrios en el catálogo', modulo: 'direcciones', accion: 'crear' },
  
  // Solicitudes
  { nombre: 'ver_solicitud', modulo: 'solicitudes', accion: 'ver' },
  { nombre: 'crear_solicitud', modulo: 'solicitudes', accion: 'crear' },
  { nombre: 'editar_solicitud', modulo: 'solicitudes', accion: 'editar' },
  { nombre: 'eliminar_solicitud', modulo: 'solicitudes', accion: 'eliminar' },
  { nombre: 'asignar_solicitud', modulo: 'solicitudes', accion: 'asignar' },
  { nombre: 'agendar_solicitud', modulo: 'solicitudes', accion: 'agendar' },

  // Transportes
  { nombre: 'ver_transporte', modulo: 'transportes', accion: 'ver' },
  { nombre: 'registrar_transportista', modulo: 'transportes', accion: 'registrar' },
  { nombre: 'cargar_pasajero', modulo: 'transportes', accion: 'cargar' },
  { nombre: 'confirmar_transporte', modulo: 'transportes', accion: 'confirmar' },
  { nombre: 'verificar_transporte', modulo: 'transportes', accion: 'verificar' },
  { nombre: 'imprimir_ticket', modulo: 'transportes', accion: 'imprimir' },
  { nombre: 'config_transporte', modulo: 'transportes', accion: 'config' },

];

  for (const permiso of permisos) {
    const permisoCreado = await prisma.permiso.upsert({
      where: { nombre: permiso.nombre },
      update: { descripcion: permiso.descripcion },
      create: permiso,
    });

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
  console.log('🚀 Seed Nacional completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });