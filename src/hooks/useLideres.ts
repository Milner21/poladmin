import { useQuery } from "@tanstack/react-query";
import { LiderService } from "../services/liderService";

export const useLideres = () => {
  return useQuery({
    queryKey: ["lideres"], // ← Nuevo key
    queryFn: LiderService.getLideres,
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 60 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
