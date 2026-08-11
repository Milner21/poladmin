import { useQuery } from "@tanstack/react-query";
import { impresorasService } from "@services/impresoras.service";

export const useEstadisticasImpresiones = () => {
  return useQuery({
    queryKey: ["dashboard", "estadisticas-impresiones"],
    queryFn: () => impresorasService.getEstadisticasImpresiones(),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};