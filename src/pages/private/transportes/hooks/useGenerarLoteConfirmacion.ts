import { useMutation } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useGenerarLoteConfirmacion = () => {
  return useMutation({
    mutationFn: (transportistaId: string) =>
      transportesService.generarLoteConfirmacion(transportistaId),
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al generar lote de confirmación';
      toast.error(mensaje);
    },
  });
};