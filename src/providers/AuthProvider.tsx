import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { AuthContext } from '@context/AuthContext';
import type { AuthContextType } from '@interfaces/AuthContextType';


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Estado para almacenar el usuario autenticado o null si no hay sesión
  const [user, setUser] = useState<AuthContextType['user']>(null);
  // Estado para controlar si la carga de la sesión está en proceso
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al montar el componente, obtener la sesión actual de Supabase
    supabase.auth.getSession().then(({ data }) => {
      // Actualizar el estado con el usuario si existe sesión, o null si no
      setUser(data.session?.user ?? null);
      // Cambiar loading a false porque ya se obtuvo la sesión
      setLoading(false);
    });

    // Suscribirse a los cambios en el estado de autenticación (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Actualizar el estado del usuario según la nueva sesión
      setUser(session?.user ?? null);
    });

    // Cleanup: al desmontar el componente, cancelar la suscripción para evitar fugas de memoria
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Proveer el contexto con el usuario y el estado de carga a todos los hijos
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};