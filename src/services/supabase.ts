import { createClient } from '@supabase/supabase-js';

// Definimos las credenciales de Supabase (reemplázalas con tus datos)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el cliente de Supabase usando las credenciales
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
