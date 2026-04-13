import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useConfirmarPasajero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pasajeroId: string) =>
      transportesService.confirmarPasajero({ pasajero_id: pasajeroId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pasajeros'] });
      toast.success('Pasajero confirmado correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al confirmar pasajero';
      toast.error(mensaje);
    },
  });
};