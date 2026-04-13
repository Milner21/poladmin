import { useMutation, useQueryClient } from "@tanstack/react-query";
import { perfilesService } from "@services/perfiles.service";
import type { UpdatePerfilDto } from "@dto/perfil.types";
import toast from "react-hot-toast";
import axios from "axios";

interface ActualizarPerfilParams {
  id: string;
  data: UpdatePerfilDto;
}

export const useActualizarPerfil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: ActualizarPerfilParams) =>
      perfilesService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["perfiles"],
        refetchType: "all",
      });
      toast.success("Perfil actualizado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al actualizar el perfil");
      }
    },
  });
};
