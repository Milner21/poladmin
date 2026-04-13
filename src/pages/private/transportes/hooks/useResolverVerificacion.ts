import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import type { ResolverVerificacionDto } from '@dto/transporte.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useResolverVerificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolverVerificacionDto }) =>
      transportesService.resolverVerificacion(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['verificaciones'] });
      toast.success('Verificación resuelta correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al resolver verificación';
      toast.error(mensaje);
    },
  });
};