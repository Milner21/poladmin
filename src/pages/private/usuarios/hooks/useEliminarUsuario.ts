import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosService } from "@services/usuarios.service";
import toast from "react-hot-toast";
import axios from "axios";

export const useEliminarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usuariosService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["usuarios"],
        refetchType: "all",
      });
      toast.success("Usuario eliminado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al eliminar el usuario");
      }
    },
  });
};
