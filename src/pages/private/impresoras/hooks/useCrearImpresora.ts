import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';
import toast from 'react-hot-toast';
import type { CreateImpresoraDto } from '@dto/impresora.types';

export const useCrearImpresora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImpresoraDto) => impresorasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impresoras'] });
      toast.success('Impresora creada correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err?.response?.data?.message || 'Error al crear impresora';
      toast.error(mensaje);
    },
  });
};