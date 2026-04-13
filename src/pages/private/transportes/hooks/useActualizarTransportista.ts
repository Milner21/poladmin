import { useMutation } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';
import toast from 'react-hot-toast';
import type { UpdateTransportistaDto } from '@dto/transporte.types';

export const useActualizarTransportista = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransportistaDto }) =>
      transportesService.actualizarTransportista(id, data),
    onSuccess: () => {
      toast.success('Transportista actualizado correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err?.response?.data?.message || 'Error al actualizar el transportista';
      toast.error(mensaje);
    },
  });
};