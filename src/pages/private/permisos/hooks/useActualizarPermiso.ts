import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permisosService } from "@services/permisos.service";
import type { UpdatePermisoDto } from "@dto/permiso.types";
import toast from "react-hot-toast";
import axios from "axios";

interface ActualizarPermisoParams {
  id: string;
  data: UpdatePermisoDto;
}

export const useActualizarPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: ActualizarPermisoParams) =>
      permisosService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["permisos"],
        refetchType: "all",
      });
      toast.success("Permiso actualizado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al actualizar el permiso");
      }
    },
  });
};
