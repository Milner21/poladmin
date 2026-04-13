import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';
import toast from 'react-hot-toast';
import type { UpdateImpresoraDto } from '@dto/impresora.types';

export const useActualizarImpresora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImpresoraDto }) =>
      impresorasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impresoras'] });
      queryClient.invalidateQueries({ queryKey: ['impresora'] });
      toast.success('Impresora actualizada correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err?.response?.data?.message || 'Error al actualizar impresora';
      toast.error(mensaje);
    },
  });
};