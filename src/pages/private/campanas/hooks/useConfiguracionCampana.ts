import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campanasService } from '@services/campanas.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useConfiguracionCampana = (campanaId: string) => {
  return useQuery({
    queryKey: ['configuracion-campana', campanaId],
    queryFn: () => campanasService.getById(campanaId),
    staleTime: 30000,
    enabled: !!campanaId,
  });
};

export const useActualizarConfiguracionCampana = (campanaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      permitir_duplicados_simpatizantes?: boolean;
      permitir_registro_manual_fuera_padron?: boolean;
    }) => campanasService.actualizarConfiguracion(campanaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-campana', campanaId] });
      queryClient.invalidateQueries({ queryKey: ['campanas'] });
      toast.success('Configuración actualizada correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al actualizar configuración';
      toast.error(mensaje);
    },
  });
};