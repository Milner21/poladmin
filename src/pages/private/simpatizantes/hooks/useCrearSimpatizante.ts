import { useMutation, useQueryClient } from '@tanstack/react-query';
import { simpatizantesService } from '@services/simpatizantes.service';
import type { CreateSimpatizanteDto } from '@dto/simpatizante.types';
import { AxiosError } from 'axios';

interface ErrorDuplicadoPayload {
  codigo: 'SIMPATIZANTE_DUPLICADO_NO_PERMITIDO' | 'SIMPATIZANTE_DUPLICADO_CONFIRMABLE';
  mensaje: string;
  simpatizante_id: string;
}

interface ErrorResponse {
  message: string | ErrorDuplicadoPayload;
}

export type { ErrorDuplicadoPayload };

export const useCrearSimpatizante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSimpatizanteDto) => simpatizantesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simpatizantes'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const payload = error?.response?.data?.message;

      if (typeof payload === 'object' && payload !== null) {
        return;
      }
    },
  });
};