import { useQuery } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';

export const useMiTransportista = () => {
  return useQuery({
    queryKey: ['mi-transportista'],
    queryFn: transportesService.getMiTransportista,
    staleTime: 300000, // 5 minutos
    retry: 1,
  });
};