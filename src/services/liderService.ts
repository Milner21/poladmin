import { supabase } from '../api/supabaseClient'
import type { Lider } from '../types/votantes'

export class LiderService {
  static async getLideres(): Promise<Lider[]> {
    const { data, error } = await supabase
      .from('lideres') 
      .select('id, ci, nombre, apellido, telefono, candidato, activo')
      .eq('activo', true)
      .order('candidato', { ascending: true })
      .order('nombre', { ascending: true })
    
    if (error) throw error
    return data as Lider[]
  }
}