import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import type { UpdateConfiguracionTransporteDto } from '@dto/transporte.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useConfiguracionTransporte = () => {
  return useQuery({
    queryKey: ['configuracion-transporte'],
    queryFn: transportesService.getConfiguracion,
    staleTime: 30000,
  });
};

export const useActualizarConfiguracionTransporte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConfiguracionTransporteDto) =>
      transportesService.actualizarConfiguracion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-transporte'] });
      toast.success('Configuración actualizada correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al actualizar configuración';
      toast.error(mensaje);
    },
  });
};