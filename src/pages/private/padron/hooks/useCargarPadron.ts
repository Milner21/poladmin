import { useMutation, useQueryClient } from '@tanstack/react-query';
import { padronService } from '@services/padron.service';
import type { TipoPadron } from '@dto/padron.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponseSimple {
  message: string;
}

interface ErrorResponseColumnas {
  mensaje: string;
  columnas_faltantes: string[];
  columnas_requeridas: string[];
  columnas_encontradas: string[];
}

type ErrorResponse = ErrorResponseSimple | ErrorResponseColumnas;

function esErrorColumnas(data: ErrorResponse): data is ErrorResponseColumnas {
  return 'columnas_faltantes' in data && Array.isArray((data as ErrorResponseColumnas).columnas_faltantes);
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
      void queryClient.invalidateQueries({ queryKey: ['padron-resumen'] });
      void queryClient.invalidateQueries({ queryKey: ['padron-stats'] });

      const mensaje = `Carga completada: ${data.insertados} insertados, ${data.omitidos} ya existian`;

      if (data.errores_count > 0) {
        toast.success(`${mensaje} (${data.errores_count} errores)`, { duration: 5000 });
      } else {
        toast.success(mensaje);
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const data = error?.response?.data;

      if (!data) {
        toast.error('Error al cargar el archivo. Verificá tu conexion.');
        return;
      }

      if (esErrorColumnas(data)) {
        const faltantes = data.columnas_faltantes.join(', ');
        toast.error(
          `Columnas faltantes en el Excel: ${faltantes}`,
          { duration: 6000 },
        );
        return;
      }

      if ('message' in data) {
        toast.error(data.message);
        return;
      }

      toast.error('Error al cargar el archivo');
    },
  });
};