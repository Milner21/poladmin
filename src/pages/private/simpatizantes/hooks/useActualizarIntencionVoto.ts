import { useMutation, useQueryClient } from '@tanstack/react-query';
import { simpatizantesService } from '@services/simpatizantes.service';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ActualizarIntencionParams {
  id: string;
  intencion_voto: string;
}

export const useActualizarIntencionVoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, intencion_voto }: ActualizarIntencionParams) =>
      simpatizantesService.actualizarIntencionVoto(id, intencion_voto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['simpatizantes'],
        refetchType: 'all',
      });
      toast.success('Intención de voto actualizada');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar intención de voto');
      }
    },
  });
};