import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '@services/niveles.service';
import type { CreateNivelDto } from '@dto/nivel.types';
import toast from 'react-hot-toast';
import axios from 'axios';

export const useCrearNivel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNivelDto) => nivelesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['niveles'],
        refetchType: 'all',
      });
      toast.success('Nivel creado exitosamente');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al crear el nivel');
      }
    },
  });
};