import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '@services/niveles.service';
import toast from 'react-hot-toast';
import axios from 'axios';

export const useEliminarNivel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => nivelesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['niveles'],
        refetchType: 'all',
      });
      toast.success('Nivel eliminado exitosamente');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al eliminar el nivel');
      }
    },
  });
};