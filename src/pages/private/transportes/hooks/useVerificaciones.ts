import { useQuery } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";

export const useVerificaciones = (estado?: string) => {
  return useQuery({
    queryKey: ["verificaciones", estado],
    queryFn: () => transportesService.getAllVerificaciones(estado),
    staleTime: 30000,
  });
};