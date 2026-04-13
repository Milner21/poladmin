import { useMutation, useQueryClient } from "@tanstack/react-query";
import { perfilesService } from "@services/perfiles.service";
import toast from "react-hot-toast";
import axios from "axios";

export const useEliminarPerfil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => perfilesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["perfiles"],
        refetchType: "all",
      });
      toast.success("Perfil eliminado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al eliminar el perfil");
      }
    },
  });
};
