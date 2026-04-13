export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USUARIOS: '/usuarios',
  PERFILES: '/perfiles',
  PERMISOS: '/permisos',
  EVENTOS: '/eventos',
  SIMPATIZANTES: '/simpatizantes',
  ASISTENCIAS: '/asistencias',
  PADRON: '/padron',
};