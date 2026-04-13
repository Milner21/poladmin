import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '@services/niveles.service';
import type { UpdateNivelDto } from '@dto/nivel.types';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ActualizarNivelParams {
  id: string;
  data: UpdateNivelDto;
}

export const useActualizarNivel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: ActualizarNivelParams) =>
      nivelesService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['niveles'],
        refetchType: 'all',
      });
      toast.success('Nivel actualizado exitosamente');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar el nivel');
      }
    },
  });
};