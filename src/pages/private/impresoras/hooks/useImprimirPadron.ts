import { useMutation } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';
import toast from 'react-hot-toast';

export const useImprimirPadron = () => {
  return useMutation({
    mutationFn: (ci: string) => impresorasService.imprimirPadron(ci),
    onSuccess: (data) => {
      if (data.exitoso) {
        toast.success(data.mensaje);
      } else {
        toast.error(data.mensaje);
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || 'Error al enviar a la impresora';
      toast.error(mensaje);
    },
  });
};