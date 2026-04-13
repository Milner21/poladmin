import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosService } from "@services/usuarios.service";
import type { UpdateUsuarioDto } from "@dto/usuario.types";
import toast from "react-hot-toast";
import axios from "axios";

interface ActualizarUsuarioParams {
  id: string;
  data: UpdateUsuarioDto;
}

export const useActualizarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: ActualizarUsuarioParams) =>
      usuariosService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["usuarios"],
        refetchType: "all",
      });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al actualizar el usuario");
      }
    },
  });
};
