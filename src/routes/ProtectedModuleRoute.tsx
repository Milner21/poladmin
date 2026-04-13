import type { ModuloPermiso } from '@dto/permiso.types';
import { Outlet, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import RoutesConfig from './RoutesConfig';
import { usePermisos } from '@hooks/usePermisos';
import { useAuth } from '@hooks/useAuth';

interface ProtectedModuleRouteProps {
  modulo: ModuloPermiso;
}

export const ProtectedModuleRoute = ({ modulo }: ProtectedModuleRouteProps) => {
  const { puedeVer } = usePermisos();
  const { usuario } = useAuth();
  const hasShownToast = useRef(false);
  const tieneAcceso = puedeVer(modulo);

  useEffect(() => {
    // Solo mostrar toast si hay usuario autenticado
    if (usuario && !tieneAcceso && !hasShownToast.current) {
      toast.error('No tenés permisos para acceder a esta sección');
      hasShownToast.current = true;
    }

    // Reset cuando cambia el módulo
    return () => {
      hasShownToast.current = false;
    };
  }, [tieneAcceso, usuario, modulo]);

  // Si no hay usuario, lo maneja ProtectedRoute padre
  if (!usuario) return null;

  // Si no tiene acceso, redirigir sin toast duplicado
  if (!tieneAcceso) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  return <Outlet />;
};