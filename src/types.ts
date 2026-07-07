export interface WeightLog {
  id: string; // "YYYY-MM-DD"
  date: string; // "YYYY-MM-DD"
  weight: number; // in kg
  mood: string; // emoji representation e.g., "😊", "🤩", "😐", "😴", "🍕"
  notes: string;
  time: string; // "HH:MM"
  createdAt: number; // timestamp
}

export interface UserProfile {
  name: string;
  height: number; // in cm
  targetWeight: number; // in kg
  initialWeight: number; // in kg
}

export interface DailyStats {
  currentWeight: number;
  weightChange: number; // change from previous day or initial
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  progressPercent: number;
  streakDays: number;
  averageWeight: number;
}
