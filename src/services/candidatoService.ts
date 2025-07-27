// services/candidatoService.ts
import { supabase } from './supabase'
import type { Candidato } from '../types/transpotes'

export class CandidatoService {
  static async getCandidatos(): Promise<Candidato[]> {
    const { data, error } = await supabase
      .from('candidatos')
      .select('id, nombre, apellido, partido, activo')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    
    if (error) throw error
    return data as Candidato[]
  }
}