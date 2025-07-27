// services/voterService.ts
import { supabase } from './supabase'
import type { 
  FormattedVoterData, 
  VoterResponse, 
  CreateVoterResult,
  SavedVoterData 
} from '../types/votantes'

export class VoterService {
  // Crear votante usando función de Supabase
  static async createVoter(voterData: FormattedVoterData, registered_by: string = 'usuario'): Promise<CreateVoterResult> {
    try {
      const { data, error } = await supabase.rpc('register_voter', {
        p_ci: voterData.ci,
        p_nombre: voterData.nombre,
        p_apellido: voterData.apellido,
        p_telefono: voterData.telefono,
        p_sexo: voterData.sexo,
        p_edad: voterData.edad,
        p_barrio: voterData.barrio,
        p_lider_id: voterData.lider_id,
        p_registered_by: registered_by
      })

      if (error) {
        console.error('Error en Supabase RPC:', error)
        return {
          success: false,
          error: 'Error de conexión con la base de datos'
        }
      }

      // Tipear la respuesta de la función de Supabase
      const response = data as VoterResponse

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Votante registrado exitosamente'
        }
      } else {
        return {
          success: false,
          error: response.error || 'Error desconocido al registrar votante'
        }
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error inesperado'
      }
    }
  }

  // Obtener todos los votantes (tipado mejorado)
  static async getVoters(): Promise<SavedVoterData[]> {
    const { data, error } = await supabase
      .from('votantes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as SavedVoterData[]
  }

  // Obtener votante por CI
  static async getVoterByCI(ci: string): Promise<SavedVoterData | null> {
    const { data, error } = await supabase
      .from('votantes')
      .select('*')
      .eq('ci', ci)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No encontrado
      throw error
    }
    
    return data as SavedVoterData
  }
}