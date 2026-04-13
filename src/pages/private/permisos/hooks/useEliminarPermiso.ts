import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permisosService } from "@services/permisos.service";
import toast from "react-hot-toast";
import axios from "axios";

export const useEliminarPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permisosService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["permisos"],
        refetchType: "all",
      });
      toast.success("Permiso eliminado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al eliminar el permiso");
      }
    },
  });
};
