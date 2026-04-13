import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permisosService } from "@services/permisos.service";
import type { CreatePermisoDto } from "@dto/permiso.types";
import toast from "react-hot-toast";
import axios from "axios";

export const useCrearPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermisoDto) => permisosService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["permisos"],
        refetchType: "all",
      });
      toast.success("Permiso creado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al crear el permiso");
      }
    },
  });
};
