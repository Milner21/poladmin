import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { direccionesService } from '@services/direcciones.service';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const useBuscarBarrios = (departamento: string, ciudad: string, busqueda?: string) => {
  return useQuery({
    queryKey: ['direcciones', departamento, ciudad, busqueda],
    queryFn: () => direccionesService.buscarBarrios(departamento, ciudad, busqueda),
    enabled: !!departamento && !!ciudad,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useCrearDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departamento, ciudad, barrio }: { departamento: string; ciudad: string; barrio: string }) =>
      direccionesService.crear(departamento, ciudad, barrio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Barrio agregado exitosamente');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje = error?.response?.data?.message ?? 'Error al agregar el barrio';
      toast.error(mensaje);
    },
  });
};