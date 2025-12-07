import { apiClient } from '../utils/api';

export interface HistoryItem {
  id: number;
  title: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;
}

export interface HistoryPayload {
  title: string;
  startedAt?: string;
  endedAt?: string;
  notes?: string;
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const { data } = await apiClient.get<HistoryItem[]>('/api/history');
  return data;
}

export async function createHistory(payload: HistoryPayload): Promise<HistoryItem> {
  const { data } = await apiClient.post<HistoryItem>('/api/history', payload);
  return data;
}
