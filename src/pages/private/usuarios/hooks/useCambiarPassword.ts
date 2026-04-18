import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosService } from "@services/usuarios.service";
import toast from "react-hot-toast";
import axios from "axios";

interface CambiarPasswordParams {
  id: string;
  password_nuevo: string;
  password_actual?: string;
}

export const useCambiarPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password_nuevo, password_actual }: CambiarPasswordParams) =>
      usuariosService.cambiarPassword(id, { password_nuevo, password_actual }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["usuarios"],
        refetchType: "all",
      });
      toast.success(data.mensaje || "Contraseña actualizada exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al cambiar la contraseña");
      }
    },
  });
};