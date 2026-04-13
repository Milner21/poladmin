import type { FC, ReactNode } from 'react';
import type { ModuloPermiso } from '@dto/permiso.types';
import toast from 'react-hot-toast';
import { usePermisos } from '@hooks/usePermisos';

type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'asignar' | 'registrar';

interface ProtectedActionProps {
  modulo: ModuloPermiso;
  accion: Accion;
  children: ReactNode;
  ocultar?: boolean;
}

export const ProtectedAction: FC<ProtectedActionProps> = ({
  modulo,
  accion,
  children,
  ocultar = false,
}) => {
  const { puedeEn } = usePermisos();
  const tienePermiso = puedeEn(modulo, accion);

  if (!tienePermiso && ocultar) return null;

  if (!tienePermiso) {
    return (
      <div
        onClick={() => toast.error('No tenés permisos para realizar esta acción')}
        className="cursor-not-allowed opacity-50"
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
};