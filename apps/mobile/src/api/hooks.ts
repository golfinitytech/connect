import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import {
  Course,
  Event,
  EventRegistration,
  LeaderboardEntry,
  MenuItem,
  Notification,
  Order,
  Round,
  User,
  UserPreference,
} from './types';

type CreateRoundInput = {
  courseId: string;
  teeBoxId: string;
  gameMode: 'STROKE_PLAY' | 'STABLEFORD' | 'MATCH_PLAY';
  playerIds: string[];
};

type UpdateHoleScoreInput = {
  roundId: string;
  holeNumber: number;
  userId: string;
  strokes: number;
  putts: number;
  fairwayHit?: 'LEFT' | 'CENTER' | 'RIGHT';
  gir?: boolean;
};

type CreateOrderInput = {
  userId: string;
  roundId?: string;
  holeNumber?: number;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
};

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get<User>('/users/me'),
  });
}

export function useUsers(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return useQuery({
    queryKey: ['users', search ?? ''],
    queryFn: () => apiClient.get<User[]>(`/users${query}`),
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => apiClient.get<Course[]>('/courses'),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get<Event[]>('/events'),
  });
}

export function useEventRegistrations(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return useQuery({
    queryKey: ['event-registrations', userId ?? ''],
    queryFn: () => apiClient.get<EventRegistration[]>(`/events/registrations${query}`),
    enabled: Boolean(userId),
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      apiClient.post<EventRegistration>(`/events/${eventId}/register`, { userId }),
    onSuccess: (registration) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', registration.userId] });
    },
  });
}

export function useRounds() {
  return useQuery({
    queryKey: ['rounds'],
    queryFn: () => apiClient.get<Round[]>('/rounds'),
  });
}

export function useRound(roundId?: string) {
  return useQuery({
    queryKey: ['round', roundId],
    queryFn: () => apiClient.get<Round>(`/rounds/${roundId}`),
    enabled: Boolean(roundId),
    refetchInterval: 8000,
  });
}

export function useCreateRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoundInput) => apiClient.post<Round>('/rounds', payload),
    onSuccess: (round) => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.setQueryData(['round', round.id], round);
    },
  });
}

export function useUpdateHoleScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, holeNumber, ...payload }: UpdateHoleScoreInput) =>
      apiClient.put(`/rounds/${roundId}/holes/${holeNumber}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['round', variables.roundId] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
    },
  });
}

export function useFinishRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: string) => apiClient.patch(`/rounds/${roundId}/finish`, {}),
    onSuccess: (_, roundId) => {
      queryClient.invalidateQueries({ queryKey: ['round', roundId] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.get<LeaderboardEntry[]>('/leaderboard/live'),
    refetchInterval: 15000,
  });
}

export function useNotifications(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return useQuery({
    queryKey: ['notifications', userId ?? ''],
    queryFn: () => apiClient.get<Notification[]>(`/notifications${query}`),
    enabled: Boolean(userId),
    refetchInterval: 30000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) =>
      apiClient.patch<User>('/users/me', payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user);
    },
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => apiClient.get<UserPreference>('/users/me/preferences'),
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserPreference>) =>
      apiClient.patch<UserPreference>('/users/me/preferences', payload),
    onSuccess: (preferences) => {
      queryClient.setQueryData(['user-preferences'], preferences);
    },
  });
}

export function useMenu(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return useQuery({
    queryKey: ['menu', category ?? 'all'],
    queryFn: () => apiClient.get<MenuItem[]>(`/menu${query}`),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderInput) => apiClient.post<Order>('/orders', payload),
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order);
    },
  });
}

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiClient.get<Order>(`/orders/${orderId}`),
    enabled: Boolean(orderId),
    refetchInterval: 8000,
  });
}

export function useOrders(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return useQuery({
    queryKey: ['orders', userId ?? ''],
    queryFn: () => apiClient.get<Order[]>(`/orders${query}`),
    enabled: Boolean(userId),
  });
}

export function useWeather(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      if (lat === undefined || lon === undefined) return null;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh`
      );
      return response.json();
    },
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 1000 * 60 * 15, // 15 min
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: string; note?: string }) =>
      apiClient.patch<Order>(`/orders/${orderId}/status`, { status, note }),
    onSuccess: (order, variables) => {
      queryClient.setQueryData(['order', variables.orderId], order);
    },
  });
}
