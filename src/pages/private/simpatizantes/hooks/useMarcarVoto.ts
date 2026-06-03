import { useMutation, useQueryClient } from '@tanstack/react-query';
import { simpatizantesService } from '@services/simpatizantes.service';
import toast from 'react-hot-toast';

export const useMarcarVoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (simpatizanteId: string) =>
      simpatizantesService.marcarVoto(simpatizanteId),
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ['simpatizantes'] });
      queryClient.invalidateQueries({ queryKey: ['simpatizante'] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || 'Error al marcar el voto';
      toast.error(mensaje);
    },
  });
};