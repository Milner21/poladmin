import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';
import toast from 'react-hot-toast';

export const useEliminarImpresora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => impresorasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impresoras'] });
      toast.success('Impresora eliminada correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err?.response?.data?.message || 'Error al eliminar impresora';
      toast.error(mensaje);
    },
  });
};