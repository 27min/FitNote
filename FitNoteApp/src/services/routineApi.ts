import { apiClient } from '../utils/api';

export interface RoutineItem {
  id: number;
  name: string;
  description?: string;
}

export interface RoutinePayload {
  name: string;
  description?: string;
}

export async function fetchRoutines(): Promise<RoutineItem[]> {
  const { data } = await apiClient.get<RoutineItem[]>('/api/routines');
  return data;
}

export async function fetchRoutine(id: number): Promise<RoutineItem> {
  const { data } = await apiClient.get<RoutineItem>(`/api/routines/${id}`);
  return data;
}

export async function createRoutine(payload: RoutinePayload): Promise<RoutineItem> {
  const { data } = await apiClient.post<RoutineItem>('/api/routines', payload);
  return data;
}

export async function updateRoutine(id: number, payload: RoutinePayload): Promise<RoutineItem> {
  const { data } = await apiClient.put<RoutineItem>(`/api/routines/${id}` , payload);
  return data;
}

export async function deleteRoutine(id: number): Promise<void> {
  await apiClient.delete(`/api/routines/${id}`);
}
