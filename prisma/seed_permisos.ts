
//src/prisma/seed_permisos.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Actualizando permisos del sistema...');

  const permisos = [
    // ==========================================
    // CAMPAÑAS (SaaS Multi-Tenant)
    // ==========================================
    { nombre: 'ver_campana', descripcion: 'Ver campañas del sistema', modulo: 'campanas', accion: 'ver' },
    { nombre: 'crear_campana', descripcion: 'Crear nuevas campañas', modulo: 'campanas', accion: 'crear' },
    { nombre: 'editar_campana', descripcion: 'Editar campañas', modulo: 'campanas', accion: 'editar' },
    { nombre: 'eliminar_campana', descripcion: 'Eliminar campañas', modulo: 'campanas', accion: 'eliminar' },

    // ==========================================
    // DASHBOARD
    // ==========================================
    { nombre: 'ver_dashboard', descripcion: 'Ver el dashboard', modulo: 'dashboard', accion: 'ver' },

    // ==========================================
    // NIVELES
    // ==========================================
    { nombre: 'ver_nivel', descripcion: 'Ver niveles', modulo: 'niveles', accion: 'ver' },
    { nombre: 'crear_nivel', descripcion: 'Crear niveles', modulo: 'niveles', accion: 'crear' },
    { nombre: 'editar_nivel', descripcion: 'Editar niveles', modulo: 'niveles', accion: 'editar' },
    { nombre: 'eliminar_nivel', descripcion: 'Eliminar niveles', modulo: 'niveles', accion: 'eliminar' },

    // ==========================================
    // USUARIOS
    // ==========================================
    { nombre: 'ver_usuario', descripcion: 'Ver usuarios', modulo: 'usuarios', accion: 'ver' },
    { nombre: 'crear_usuario', descripcion: 'Crear usuarios', modulo: 'usuarios', accion: 'crear' },
    { nombre: 'editar_usuario', descripcion: 'Editar usuarios', modulo: 'usuarios', accion: 'editar' },
    { nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios', modulo: 'usuarios', accion: 'eliminar' },

    // ==========================================
    // PERFILES
    // ==========================================
    { nombre: 'ver_perfil', descripcion: 'Ver perfiles', modulo: 'perfiles', accion: 'ver' },
    { nombre: 'crear_perfil', descripcion: 'Crear perfiles', modulo: 'perfiles', accion: 'crear' },
    { nombre: 'editar_perfil', descripcion: 'Editar perfiles', modulo: 'perfiles', accion: 'editar' },
    { nombre: 'eliminar_perfil', descripcion: 'Eliminar perfiles', modulo: 'perfiles', accion: 'eliminar' },

    // ==========================================
    // PERMISOS
    // ==========================================
    { nombre: 'ver_permiso', descripcion: 'Ver permisos', modulo: 'permisos', accion: 'ver' },
    { nombre: 'crear_permiso', descripcion: 'Crear permisos', modulo: 'permisos', accion: 'crear' },
    { nombre: 'editar_permiso', descripcion: 'Editar permisos', modulo: 'permisos', accion: 'editar' },
    { nombre: 'eliminar_permiso', descripcion: 'Eliminar permisos', modulo: 'permisos', accion: 'eliminar' },

    // ==========================================
    // EVENTOS
    // ==========================================
    { nombre: 'ver_evento', descripcion: 'Ver eventos', modulo: 'eventos', accion: 'ver' },
    { nombre: 'crear_evento', descripcion: 'Crear eventos', modulo: 'eventos', accion: 'crear' },
    { nombre: 'editar_evento', descripcion: 'Editar eventos', modulo: 'eventos', accion: 'editar' },
    { nombre: 'eliminar_evento', descripcion: 'Eliminar eventos', modulo: 'eventos', accion: 'eliminar' },

    // ==========================================
    // SIMPATIZANTES
    // ==========================================
    { nombre: 'ver_simpatizante', descripcion: 'Ver simpatizantes', modulo: 'simpatizantes', accion: 'ver' },
    { nombre: 'crear_simpatizante', descripcion: 'Crear simpatizantes', modulo: 'simpatizantes', accion: 'crear' },
    { nombre: 'editar_simpatizante', descripcion: 'Editar datos completos de simpatizantes', modulo: 'simpatizantes', accion: 'editar' },
    { nombre: 'eliminar_simpatizante', descripcion: 'Eliminar simpatizantes', modulo: 'simpatizantes', accion: 'eliminar' },
    { nombre: 'crear_simpatizante_manual', descripcion: 'Registrar simpatizante sin padrón', modulo: 'simpatizantes', accion: 'crear_manual' },
    { nombre: 'ver_lista_simpatizantes', descripcion: 'Ver listado completo de simpatizantes', modulo: 'simpatizantes', accion: 'ver_lista' },
    { nombre: 'actualizar_intencion_voto', descripcion: 'Actualizar intención de voto de simpatizantes', modulo: 'simpatizantes', accion: 'actualizar_intencion' },
    { nombre: 'gestionar_duplicados_simpatizantes', descripcion: 'Gestionar y resolver duplicados de simpatizantes', modulo: 'simpatizantes', accion: 'gestionar_duplicados' },
    { nombre: 'gestionar_red_simpatizantes', descripcion: 'Ver y gestionar simpatizantes de usuarios en su red jerárquica', modulo: 'simpatizantes', accion: 'gestionar_red' },
    { nombre: 'registrar_seguimiento_simpatizante', descripcion: 'Registrar contactos y seguimientos a simpatizantes', modulo: 'simpatizantes', accion: 'registrar_seguimiento' },

    // ==========================================
    // ASISTENCIAS
    // ==========================================
    { nombre: 'ver_asistencia', descripcion: 'Ver asistencias', modulo: 'asistencias', accion: 'ver' },
    { nombre: 'registrar_asistencia', descripcion: 'Registrar asistencias', modulo: 'asistencias', accion: 'registrar' },
    { nombre: 'crear_asistencia', descripcion: 'Crear asistencias', modulo: 'asistencias', accion: 'crear' },
    { nombre: 'editar_asistencia', descripcion: 'Editar asistencias', modulo: 'asistencias', accion: 'editar' },
    { nombre: 'eliminar_asistencia', descripcion: 'Eliminar asistencias', modulo: 'asistencias', accion: 'eliminar' },

    // ==========================================
    // PADRÓN (solo ROOT)
    // ==========================================
    { nombre: 'ver_padron', descripcion: 'Ver padrón electoral', modulo: 'padron', accion: 'ver' },
    { nombre: 'cargar_padron', descripcion: 'Cargar padrón electoral desde Excel', modulo: 'padron', accion: 'cargar' },

    // ==========================================
    // DIRECCIONES
    // ==========================================
    { nombre: 'ver_direccion', descripcion: 'Ver catálogo de direcciones/barrios', modulo: 'direcciones', accion: 'ver' },
    { nombre: 'crear_direccion', descripcion: 'Crear nuevos barrios en el catálogo', modulo: 'direcciones', accion: 'crear' },

    // ==========================================
    // SEGUIMIENTOS
    // ==========================================
    { nombre: 'ver_seguimiento', descripcion: 'Ver seguimientos de simpatizantes', modulo: 'seguimientos', accion: 'ver' },
    { nombre: 'crear_seguimiento', descripcion: 'Registrar seguimientos/contactos', modulo: 'seguimientos', accion: 'crear' },
    { nombre: 'editar_seguimiento', descripcion: 'Editar seguimientos', modulo: 'seguimientos', accion: 'editar' },

    // ==========================================
    // REPORTES
    // ==========================================
    { nombre: 'ver_reportes', descripcion: 'Ver reportes y estadísticas', modulo: 'reportes', accion: 'ver' },
    { nombre: 'exportar_reportes', descripcion: 'Exportar reportes a Excel/PDF', modulo: 'reportes', accion: 'exportar' },

    // ==========================================
    // AUDITORÍA
    // ==========================================
    { nombre: 'ver_auditoria', descripcion: 'Ver logs de auditoría del sistema', modulo: 'auditoria', accion: 'ver' },

    // ==========================================
    // SOLICITUDES DE SIMPATIZANTES
    // ==========================================
    { nombre: 'ver_solicitud', descripcion: 'Ver solicitudes de simpatizantes', modulo: 'solicitudes', accion: 'ver' },
    { nombre: 'crear_solicitud', descripcion: 'Crear solicitudes', modulo: 'solicitudes', accion: 'crear' },
    { nombre: 'editar_solicitud', descripcion: 'Editar solicitudes', modulo: 'solicitudes', accion: 'editar' },
    { nombre: 'eliminar_solicitud', descripcion: 'Eliminar solicitudes', modulo: 'solicitudes', accion: 'eliminar' },
    { nombre: 'asignar_solicitud', descripcion: 'Asignar solicitud a otro usuario', modulo: 'solicitudes', accion: 'asignar' },
    { nombre: 'reasignar_solicitud', descripcion: 'Reasignar solicitud (solo superiores)', modulo: 'solicitudes', accion: 'reasignar' },
    { nombre: 'cambiar_estado_solicitud', descripcion: 'Cambiar estado de solicitudes', modulo: 'solicitudes', accion: 'cambiar_estado' },
    { nombre: 'agendar_solicitud', descripcion: 'Agendar fecha límite de solicitud', modulo: 'solicitudes', accion: 'agendar' },
    { nombre: 'ver_historial_solicitud', descripcion: 'Ver historial de movimientos de solicitudes', modulo: 'solicitudes', accion: 'ver_historial' },

    // ==========================================
    // TRANSPORTES
    // ==========================================
    { nombre: 'ver_transporte', descripcion: 'Ver transportes y transportistas', modulo: 'transportes', accion: 'ver' },
    { nombre: 'registrar_transportista', descripcion: 'Registrar nuevo transportista', modulo: 'transportes', accion: 'registrar' },
    { nombre: 'editar_transportista', descripcion: 'Editar datos de transportista', modulo: 'transportes', accion: 'editar' },
    { nombre: 'eliminar_transportista', descripcion: 'Eliminar transportista', modulo: 'transportes', accion: 'eliminar' },
    { nombre: 'cargar_pasajero', descripcion: 'Cargar pasajeros a transporte', modulo: 'transportes', accion: 'cargar' },
    { nombre: 'confirmar_transporte', descripcion: 'Confirmar viajes con QR (operador de transporte)', modulo: 'transportes', accion: 'confirmar' },
    { nombre: 'solicitar_verificacion', descripcion: 'Solicitar verificación de votante (transportista)', modulo: 'transportes', accion: 'solicitar_verificacion' },
    { nombre: 'verificar_transporte', descripcion: 'Aprobar/rechazar verificaciones (operador)', modulo: 'transportes', accion: 'verificar' },
    { nombre: 'imprimir_ticket', descripcion: 'Imprimir tickets de transporte', modulo: 'transportes', accion: 'imprimir' },
    { nombre: 'ver_pasajeros_atrasados', descripcion: 'Ver pasajeros con recogida atrasada', modulo: 'transportes', accion: 'ver_atrasados' },
    { nombre: 'config_transporte', descripcion: 'Configurar opciones de transporte de campaña', modulo: 'transportes', accion: 'config' },
    { nombre: 'ver_operativa_transportista', descripcion: 'Acceder a la vista operativa del transportista (Mi Operativa)', modulo: 'transportes', accion: 'ver_operativa' },
    { nombre: 'ver_gestion_transportes', descripcion: 'Ver gestión completa de transportes (administradores/operadores)', modulo: 'transportes', accion: 'ver_gestion' },

    // ==========================================
    // IMPRESORAS
    // ==========================================
    { nombre: 'ver_impresora', descripcion: 'Ver impresoras registradas', modulo: 'impresoras', accion: 'ver' },
    { nombre: 'crear_impresora', descripcion: 'Registrar nueva impresora', modulo: 'impresoras', accion: 'crear' },
    { nombre: 'editar_impresora', descripcion: 'Editar datos de impresora', modulo: 'impresoras', accion: 'editar' },
    { nombre: 'eliminar_impresora', descripcion: 'Eliminar impresora', modulo: 'impresoras', accion: 'eliminar' },
    { nombre: 'asignar_impresora', descripcion: 'Asignar impresora a usuario', modulo: 'impresoras', accion: 'asignar' },
    { nombre: 'gestionar_impresoras', descripcion: 'Gestión completa de impresoras (admin)', modulo: 'impresoras', accion: 'gestionar' },
    { nombre: 'ver_trabajos_impresion', descripcion: 'Ver historial de trabajos de impresión', modulo: 'impresoras', accion: 'ver_trabajos' },
  ];

  const perfilRoot = await prisma.perfil.findUnique({
    where: { nombre: 'ROOT' },
  });

  if (!perfilRoot) {
    console.error('❌ ERROR: No existe el perfil ROOT. Ejecutá primero el seed principal.');
    process.exit(1);
  }

  let nuevos = 0;
  let actualizados = 0;

  for (const permiso of permisos) {
    const permisoExistente = await prisma.permiso.findUnique({
      where: { nombre: permiso.nombre },
    });

    if (!permisoExistente) {
      const permisoCreado = await prisma.permiso.create({
        data: permiso,
      });

      await prisma.perfilPermiso.create({
        data: {
          perfil_id: perfilRoot.id,
          permiso_id: permisoCreado.id,
        },
      });

      nuevos++;
    } else {
      await prisma.permiso.update({
        where: { nombre: permiso.nombre },
        data: { descripcion: permiso.descripcion },
      });

      const asignacion = await prisma.perfilPermiso.findUnique({
        where: {
          perfil_id_permiso_id: {
            perfil_id: perfilRoot.id,
            permiso_id: permisoExistente.id,
          },
        },
      });

      if (!asignacion) {
        await prisma.perfilPermiso.create({
          data: {
            perfil_id: perfilRoot.id,
            permiso_id: permisoExistente.id,
          },
        });
      }

      actualizados++;
    }
  }

  console.log(`✅ Permisos nuevos creados: ${nuevos}`);
  console.log(`✅ Permisos actualizados: ${actualizados}`);
  console.log(`✅ Total de permisos en el sistema: ${permisos.length}`);
  console.log('🚀 Seed de permisos completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de permisos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });