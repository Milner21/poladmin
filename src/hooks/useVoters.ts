import { useState } from 'react'
import { VoterService } from '../services/voterService'
import type { FormattedVoterData } from '../types/votantes'

export const useVoters = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVoter = async (voterData: FormattedVoterData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await VoterService.createVoter(voterData)
      
      if (result.success) {
        return { 
          success: true, 
          data: result.data,
          message: 'Votante registrado exitosamente' 
        }
      } else {
        // La función de Supabase retornó un error controlado
        setError(result.error || 'Error desconocido')
        return { 
          success: false, 
          error: result.error || 'Error desconocido' 
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    createVoter,
    loading,
    error,
    clearError: () => setError(null)
  }
}