import { useAuth } from './useAuth';
import type { ModuloPermiso } from '@dto/permiso.types';

type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'asignar' | 'registrar';

export const usePermisos = () => {
  const { usuario } = useAuth();

  const esRoot = usuario?.perfil?.nombre === 'ROOT';
  const esOperativo = usuario?.perfil?.es_operativo === true;

  const obtenerTodosLosPermisos = (): string[] => {
    if (!usuario) return [];

    const permisosDelPerfil =
      usuario.perfil?.permisos?.map((pp) => pp.permiso.nombre) ?? [];

    const permisosPersonalizados =
      usuario.permisos_personalizados?.map((pp) => pp.permiso.nombre) ?? [];

    return [...new Set([...permisosDelPerfil, ...permisosPersonalizados])];
  };

  const tienePermiso = (nombrePermiso: string): boolean => {
    if (esRoot) return true;
    return obtenerTodosLosPermisos().includes(nombrePermiso);
  };

  const puedeEn = (modulo: ModuloPermiso, accion: Accion): boolean => {
    if (esRoot) return true;
    const moduloSingular = modulo.replace(/es$/, '').replace(/s$/, '');
    const nombrePermiso = `${accion}_${moduloSingular}`;
    return tienePermiso(nombrePermiso);
  };

  const puedeVer = (modulo: ModuloPermiso): boolean => {
    if (esRoot) return true;
    const permisos = obtenerTodosLosPermisos();
    const moduloSingular = modulo.replace(/es$/, '').replace(/s$/, '');
    return permisos.some((p) => p.includes(moduloSingular));
  };

  // Obtener nivel efectivo del usuario
  const getNivelOrden = (): number => {
    if (esRoot) return 0;
    // Si es operativo, usar nivel del candidato_superior (viene ya del backend)
    if (usuario?.nivel) return usuario.nivel.orden;
    return 9999;
  };

  return {
    esRoot,
    esOperativo,
    tienePermiso,
    puedeEn,
    puedeVer,
    obtenerTodosLosPermisos,
    getNivelOrden,
  };
};