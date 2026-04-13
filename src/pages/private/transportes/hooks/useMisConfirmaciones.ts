import { useQuery } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';

export const useMisConfirmaciones = () => {
  return useQuery({
    queryKey: ['mis-confirmaciones'],
    queryFn: () => transportesService.getMisConfirmaciones(),
    refetchInterval: 30000,
  });
};