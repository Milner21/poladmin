import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campanasService } from '@services/campanas.service';
import type { CreateCampanaDto } from '@dto/campana.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useCrearCampana = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampanaDto) => campanasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanas'] });
      toast.success('Campaña creada exitosamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al crear la campaña';
      toast.error(mensaje);
    },
  });
};