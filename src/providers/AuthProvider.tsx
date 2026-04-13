import { useEffect, useState, type JSX, type ReactNode } from "react";
import { AuthContext } from "@context/AuthContext";
import { type Usuario } from "@dto/auth.types";
import { storage } from "@utils/storage";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [authState, setAuthState] = useState<{
    usuario: Usuario | null;
    accessToken: string | null;
    refreshToken: string | null;
    estaAutenticado: boolean;
    cargando: boolean;
  }>(() => {
    // Usar storage en lugar de localStorage directamente
    const usuarioGuardado = storage.getUser();
    const accessTokenGuardado = storage.getToken();

    if (usuarioGuardado && accessTokenGuardado) {
      return {
        usuario: usuarioGuardado,
        accessToken: accessTokenGuardado,
        refreshToken: null,
        estaAutenticado: true,
        cargando: false,
      };
    }

    return {
      usuario: null,
      accessToken: null,
      refreshToken: null,
      estaAutenticado: false,
      cargando: true,
    };
  });

  useEffect(() => {
    setAuthState((prev) => ({ ...prev, cargando: false }));
  }, []);

  const iniciarSesion = (data: {
    usuario: Usuario;
    access_token: string;
    refresh_token?: string; // <-- Hacer opcional
  }) => {
    const { usuario, access_token, refresh_token } = data;

    // Usar storage en lugar de localStorage directamente
    storage.setUser(usuario);
    storage.setToken(access_token);
    
    // Guardar refresh_token si viene (está en cookie, pero por si acaso)
    if (refresh_token) {
      storage.setRefreshToken(refresh_token);
    }

    setAuthState({
      usuario,
      accessToken: access_token,
      refreshToken: refresh_token || null,
      estaAutenticado: true,
      cargando: false,
    });
  };

  const cerrarSesion = () => {
    // Usar storage.clearAuth() que limpia todo
    storage.clearAuth();

    setAuthState({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      estaAutenticado: false,
      cargando: false,
    });
  };

  const actualizarToken = (nuevoAccessToken: string) => {
    setAuthState((prev) => {
      storage.setToken(nuevoAccessToken);
      return {
        ...prev,
        accessToken: nuevoAccessToken,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        iniciarSesion,
        cerrarSesion,
        actualizarToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};