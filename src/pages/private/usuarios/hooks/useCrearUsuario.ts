import type { CreateUsuarioDto } from "@dto/usuario.types";
import { usuariosService } from "@services/usuarios.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioDto) => usuariosService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["usuarios"],
        refetchType: "all",
      });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al crear el usuario");
      }
    },
  });
};
