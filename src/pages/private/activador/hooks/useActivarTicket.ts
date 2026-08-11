import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";
import type { ActivarTicketDto } from "@dto/activador.types";
import toast from "react-hot-toast";

export const useActivarTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivarTicketDto) => activadorService.activarTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activador", "mis-activaciones"] });
      queryClient.invalidateQueries({ queryKey: ["activador", "mi-cupo"] });
      toast.success("Ticket activado correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al activar el ticket");
      } else {
        toast.error("Error al activar el ticket");
      }
    },
  });
};