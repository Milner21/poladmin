import { useMutation, useQueryClient } from '@tanstack/react-query';
import { perfilesService } from '@services/perfiles.service';
import toast from 'react-hot-toast';

interface AsignarPermisosParams {
  id: string;
  permisos_ids: string[];
}

export const useAsignarPermisos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permisos_ids }: AsignarPermisosParams) =>
      perfilesService.asignarPermisos(id, permisos_ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['perfiles'],
        refetchType: 'all',
      });
      toast.success('Permisos asignados exitosamente');
    },
    onError: () => {
      toast.error('Error al asignar permisos');
    },
  });
};