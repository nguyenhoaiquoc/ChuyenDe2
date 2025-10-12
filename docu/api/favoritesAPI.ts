import { api } from './api';

export const FavoritesAPI = {
  add: (productId: number) => api.post(`/favorites/${productId}`),
  remove: (productId: number) => api.delete(`/favorites/${productId}`),
  count: (productId: number) => api.get<{ count: number }>(`/favorites/${productId}/count`),
  check: (productId: number) => api.get<boolean>(`/favorites/${productId}/check`),
};