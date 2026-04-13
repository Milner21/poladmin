import { useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosService } from '@services/partidos.service';
import toast from 'react-hot-toast';

export const useEliminarPartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partidosService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partidos'] });
      toast.success('Partido eliminado correctamente');
    },
    onError: (error: unknown) => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const err = error as { response: { data: { message: string } } };
        toast.error(err.response.data.message || 'Error al eliminar el partido');
      } else {
        toast.error('Error al eliminar el partido');
      }
    },
  });
};