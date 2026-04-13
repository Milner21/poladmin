import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campanasService } from '@services/campanas.service';
import type { UpdateCampanaDto } from '@dto/campana.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useActualizarCampana = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampanaDto }) =>
      campanasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanas'] });
      toast.success('Campaña actualizada exitosamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al actualizar la campaña';
      toast.error(mensaje);
    },
  });
};