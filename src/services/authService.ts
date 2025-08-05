import { EMAIL_DOMAIN } from "../config/authConfig";
import { supabase } from "../api/supabaseClient";

export const authService = {
    /**Login de usuario */
  loginUser: async (username: string, password: string) => {
    const email = `${username}@${EMAIL_DOMAIN}`;  // Transformamos username en formato de correo

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "Error al iniciar sesión.");
      }

      return { success: true, data };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error en loginUser:", err.message);
        return { success: false, error: err.message };
      } else {
        console.error("Error inesperado en loginUser:", err);
        return { success: false, error: "Error inesperado." };
      }
    }
  },
};
