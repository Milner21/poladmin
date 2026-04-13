import { useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosService } from '@services/partidos.service';
import type { CreatePartidoDto } from '@dto/partido.types';
import toast from 'react-hot-toast';

export const useCrearPartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartidoDto) => partidosService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partidos'] });
      toast.success('Partido creado correctamente');
    },
    onError: (error: unknown) => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const err = error as { response: { data: { message: string } } };
        toast.error(err.response.data.message || 'Error al crear el partido');
      } else {
        toast.error('Error al crear el partido');
      }
    },
  });
};