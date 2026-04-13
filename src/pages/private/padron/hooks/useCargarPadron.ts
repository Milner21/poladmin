import { useMutation, useQueryClient } from '@tanstack/react-query';
import { padronService } from '@services/padron.service';
import type { TipoPadron } from '@dto/padron.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useCargarPadron = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      archivo,
      tipo,
      partido_id,
    }: {
      archivo: File;
      tipo: TipoPadron;
      partido_id?: string;
    }) => padronService.cargar(archivo, tipo, partido_id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['padron'] });

      const mensaje = `Carga completada: ${data.insertados} insertados, ${data.actualizados} actualizados`;

      if (data.errores_count > 0) {
        toast.success(`${mensaje} (${data.errores_count} errores)`, { duration: 5000 });
      } else {
        toast.success(mensaje);
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al cargar el archivo';
      toast.error(mensaje);
    },
  });
};