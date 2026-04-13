import { useQuery } from "@tanstack/react-query";
import { usuariosService } from "@services/usuarios.service";

export const useRedConSimpatizantes = () => {
  return useQuery({
    queryKey: ["usuarios", "red-con-simpatizantes"],
    queryFn: () => usuariosService.getRedConSimpatizantes(),
    staleTime: 0,
  });
};