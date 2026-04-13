import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seguimientosService } from '@services/seguimientos.service';
import type { CrearSeguimientoDto } from '@dto/seguimiento.types';
import toast from 'react-hot-toast';
import axios from 'axios';

export const useCrearSeguimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearSeguimientoDto) => seguimientosService.crear(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['seguimientos'],
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: ['simpatizantes'],
        refetchType: 'all',
      });
      toast.success('Seguimiento registrado exitosamente');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al registrar seguimiento');
      }
    },
  });
};