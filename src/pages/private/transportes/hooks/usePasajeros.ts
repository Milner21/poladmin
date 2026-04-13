import { useQuery } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";

export const usePasajeros = (transportistaId?: string) => {
  return useQuery({
    queryKey: ["pasajeros", transportistaId],
    queryFn: () => transportesService.getAllPasajeros(transportistaId),
    staleTime: 30000,
  });
};