import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';
import { useAuth } from '@hooks/useAuth';
import type { Usuario } from '@dto/usuario.types';

type UsuarioRed = {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  telefono: string | null;
  nivel: { id: string; nombre: string; orden: number } | null;
  perfil: {
    id: string;
    nombre: string;
    es_operativo: boolean;
    nivel: { id: string; nombre: string; orden: number } | null;
  };
  estado: boolean;
  total_simpatizantes: number;
};

interface CandidatoFormateado {
  id: string;
  nombre: string;
  apellido: string;
  nivel: {
    id: string;
    nombre: string;
    orden: number;
  };
}

export const useCandidatosRed = (campanaId: string) => {
  const { usuario } = useAuth();
  const esRoot = usuario?.perfil?.nombre === 'ROOT';

  return useQuery({
    queryKey: ['candidatos-red', campanaId, esRoot],
    queryFn: (): Promise<Usuario[] | UsuarioRed[]> => {
      if (esRoot) {
        return usuariosService.getAll(campanaId);
      } else {
        return usuariosService.getRedConSimpatizantes();
      }
    },
    enabled: !!campanaId,
    staleTime: 1000 * 60 * 5,
    select: (data: Usuario[] | UsuarioRed[]): CandidatoFormateado[] => {
      if (esRoot) {
        const usuarios = data as Usuario[];
        return usuarios
          .filter((user: Usuario) => 
            user.nivel_id !== null && 
            !user.perfil.es_operativo &&
            user.nivel !== null &&
            user.nivel !== undefined
          )
          .map((user: Usuario) => ({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            nivel: {
              id: user.nivel!.id,
              nombre: user.nivel!.nombre,
              orden: user.nivel!.orden,
            },
          }));
      } else {
        const usuariosRed = data as UsuarioRed[];
        return usuariosRed
          .filter((user: UsuarioRed) => 
            !user.perfil.es_operativo && 
            user.perfil.nivel !== null
          )
          .map((user: UsuarioRed) => ({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            nivel: {
              id: user.perfil.nivel!.id,
              nombre: user.perfil.nivel!.nombre,
              orden: user.perfil.nivel!.orden,
            },
          }));
      }
    },
  });
};