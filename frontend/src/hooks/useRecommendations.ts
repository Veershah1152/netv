import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '../api/recommendations.api';
import { useAuthStore } from '../store/useAuthStore';

export const useRecommendations = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => getRecommendations(),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
};
