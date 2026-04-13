import { useMutation } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useConfirmarLote = () => {
  return useMutation({
    mutationFn: (hashLote: string) =>
      transportesService.confirmarLote(hashLote),
    onSuccess: (data) => {
      toast.success(data.mensaje || 'Lote confirmado correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al confirmar lote';
      toast.error(mensaje);
    },
  });
};