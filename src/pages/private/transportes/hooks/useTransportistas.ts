import { useQuery } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";

export const useTransportistas = () => {
  return useQuery({
    queryKey: ["transportistas"],
    queryFn: transportesService.getAllTransportistas,
    staleTime: 30000,
  });
};