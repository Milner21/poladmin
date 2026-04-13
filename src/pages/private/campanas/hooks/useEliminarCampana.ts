import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campanasService } from '@services/campanas.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useEliminarCampana = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campanasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanas'] });
      toast.success('Campaña eliminada exitosamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al eliminar la campaña';
      toast.error(mensaje);
    },
  });
};