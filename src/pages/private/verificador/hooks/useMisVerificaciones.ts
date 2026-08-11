//src/pages/private/verificador/hooks/useMisVerificaciones.ts
import { useQuery } from "@tanstack/react-query";
import { verificadorService } from "@services/verificador.service";

export const useMisVerificaciones = () => {
  return useQuery({
    queryKey: ["verificador", "mis-verificaciones"],
    queryFn: () => verificadorService.getMisVerificaciones(),
  });
};