import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import toast from "react-hot-toast";
import axios from "axios";

export const useEliminarSimpatizante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simpatizantesService.eliminar(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["simpatizantes"],
        refetchType: "all",
      });
      toast.success("Simpatizante eliminado correctamente");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al eliminar simpatizante");
      }
    },
  });
};