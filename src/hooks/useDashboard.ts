import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/services/dashboard.service';

export const useDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const eventosQuery = useQuery({
    queryKey: ['eventos-proximos'],
    queryFn: dashboardService.getEventosProximos,
  });

  return {
    stats: statsQuery.data,
    eventos: eventosQuery.data,
    isLoading: statsQuery.isLoading || eventosQuery.isLoading,
    isError: statsQuery.isError || eventosQuery.isError,
  };
};