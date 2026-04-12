export const ERROR_MESSAGES = {
  // Usuario
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',
  USUARIO_NO_AUTENTICADO: 'Usuario no autenticado',
  USUARIO_YA_EXISTE: 'Usuario con ese username ya existe',
  DOCUMENTO_YA_EXISTE: 'Usuario con ese documento ya existe',
  NO_SE_PUEDE_ELIMINAR_ROOT: 'No se puede eliminar el usuario ROOT',
  NO_SE_PUEDE_MODIFICAR_ROOT: 'No se puede modificar el usuario ROOT',
  SOLO_PUEDES_CREAR_USUARIOS_INFERIOR: 'Solo puedes crear usuarios de nivel inferior',
  SOLO_PUEDES_EDITAR_USUARIOS_INFERIOR: 'Solo puedes editar usuarios de nivel inferior',
  SOLO_PUEDES_ELIMINAR_USUARIOS_INFERIOR: 'Solo puedes eliminar usuarios de nivel inferior',
  SOLO_PUEDES_ASIGNAR_PERFILES_INFERIOR: 'Solo puedes asignar perfiles de nivel inferior',
  NO_TIENES_PERMISO_VER_USUARIO: 'No tienes permiso para ver este usuario',
  NO_TIENES_PERMISO_VER_SUBORDINADOS: 'No tienes permiso para ver los subordinados de este usuario',
  CONTRASENA_ACTUAL_REQUERIDA: 'La contraseña actual es requerida para realizar este cambio',
  CONTRASENA_ACTUAL_INCORRECTA: 'Contraseña actual incorrecta',
  USUARIO_SIN_PASSWORD_VALIDA: 'Error interno: El usuario no tiene una contraseña válida',
  CONTRASENA_ACTUALIZADA: 'Contraseña actualizada exitosamente',
  CONTRASENA_ACTUALIZADA_ROOT: 'Contraseña actualizada exitosamente por ROOT',

  // Perfil
  PERFIL_NO_ENCONTRADO: 'Perfil no encontrado',
  PERFIL_NO_EXISTE: 'Perfil no existe',

  // Permiso
  PERMISO_NO_ENCONTRADO: 'Permiso no encontrado',

  // Auth
  CREDENTIALS_INVALIDAS: 'usuario y/o contraseña incorrecta',
  USUARIO_INACTIVO: 'El usuario está inactivo',

  // Simpatizante
  SIMPATIZANTE_NO_ENCONTRADO: 'Simpatizante no encontrado',

  // Evento
  EVENTO_NO_ENCONTRADO: 'Evento no encontrado',

  // Asistencia
  ASISTENCIA_NO_ENCONTRADA: 'Asistencia no encontrada',

  // Validación de nivel
  SOLO_ROOT_PUEDE_CAMBIAR_CONTRASENA_OTRO: 'Solo ROOT puede cambiar la contraseña de otro usuario',
};
