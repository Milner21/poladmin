import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '@services/solicitudes.service';
import type { AsignarSolicitudDto } from '@dto/solicitud.types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useAsignarSolicitud = (solicitudId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AsignarSolicitudDto) =>
      solicitudesService.asignar(solicitudId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['solicitud', solicitudId] });
      await queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      await queryClient.invalidateQueries({ queryKey: ['movimientos-solicitud', solicitudId] });
      toast.success('Solicitud asignada correctamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al asignar la solicitud';
      toast.error(mensaje);
    },
  });
};