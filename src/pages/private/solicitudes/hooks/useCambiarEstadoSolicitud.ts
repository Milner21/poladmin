import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '@services/solicitudes.service';
import type { CambiarEstadoSolicitudDto } from '@dto/solicitud.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useCambiarEstadoSolicitud = (solicitudId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoSolicitudDto) =>
      solicitudesService.cambiarEstado(solicitudId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['solicitud', solicitudId] });
      await queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      await queryClient.invalidateQueries({ queryKey: ['movimientos-solicitud', solicitudId] });
      toast.success('Estado actualizado correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al cambiar el estado';
      toast.error(mensaje);
    },
  });
};