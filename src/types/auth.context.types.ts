// types/auth.context.types.ts
import { type Usuario } from "@dto/auth.types";

export interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  estaAutenticado: boolean;
  cargando: boolean;
}

export interface AuthContextType extends AuthState {
  iniciarSesion: (data: {
    usuario: Usuario;
    access_token: string;
    refresh_token: string;
  }) => void;
  cerrarSesion: () => void;
  actualizarToken: (nuevoAccessToken: string) => void;
}
