import { useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosService } from '@services/partidos.service';
import type { UpdatePartidoDto } from '@dto/partido.types';
import toast from 'react-hot-toast';

export const useActualizarPartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartidoDto }) =>
      partidosService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partidos'] });
      toast.success('Partido actualizado correctamente');
    },
    onError: (error: unknown) => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const err = error as { response: { data: { message: string } } };
        toast.error(err.response.data.message || 'Error al actualizar el partido');
      } else {
        toast.error('Error al actualizar el partido');
      }
    },
  });
};