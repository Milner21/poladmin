import { useMutation, useQueryClient } from "@tanstack/react-query";
import { perfilesService } from "@services/perfiles.service";
import type { CreatePerfilDto } from "@dto/perfil.types";
import toast from "react-hot-toast";
import axios from "axios";

export const useCrearPerfil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerfilDto) => perfilesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["perfiles"],
        refetchType: "all",
      });
      toast.success("Perfil creado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al crear el perfil");
      }
    },
  });
};
