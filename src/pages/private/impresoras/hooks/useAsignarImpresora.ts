import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';
import toast from 'react-hot-toast';
import type { AsignarUsuarioDto } from '@dto/impresora.types';

export const useAsignarImpresora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AsignarUsuarioDto) => impresorasService.asignarUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impresoras'] });
      queryClient.invalidateQueries({ queryKey: ['impresora'] });
      toast.success('Usuario asignado correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err?.response?.data?.message || 'Error al asignar usuario';
      toast.error(mensaje);
    },
  });
};