import { authService } from '@services/authService';
import { useState } from 'react';

export const useAuthActions = () => {
  // Estado para controlar si la operación de login está en proceso
  const [loading, setLoading] = useState(false);
  // Estado para almacenar mensajes de error en el login
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para iniciar sesión con username y password.
   * Convierte username a email internamente en el servicio.
   * @param username - nombre de usuario en formato nombre.apellido
   * @param password - contraseña del usuario
   * @returns boolean indicando si el login fue exitoso
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Llamada al servicio que hace la autenticación con Supabase
      const response = await authService.loginUser(username, password);

      // Si la respuesta indica error, actualizar estado y retornar false
      if (!response.success) {
        setError(response.error || 'Error inesperado.');
        console.error('Error en el inicio de sesión:', response.error);
        setLoading(false);
        return false;
      }

      // Login exitoso
      setLoading(false);
      return true;
    } catch (err: unknown) {
      // Manejo de errores inesperados
      if (err instanceof Error) {
        console.error('Error inesperado en login:', err.message);
        setError(err.message);
      } else {
        console.error('Error no manejado:', err);
        setError('Error inesperado.');
      }
      setLoading(false);
      return false;
    }
  };

  // Exponer la función login y los estados para usar en componentes
  return {
    login,
    loading,
    error,
  };
};