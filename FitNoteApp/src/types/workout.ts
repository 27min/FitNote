export interface WorkoutSummary {
  id: string;
  date: string; // ISO date string
  routineName: string;
  totalSets: number;
  totalVolumeKg: number;
  durationMinutes?: number;
}