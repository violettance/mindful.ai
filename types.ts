
export enum ProductionMode {
  BUILD = 'İnşa Et',
  LEARN = 'Öğren',
  IDEATE = 'Fikir Üret',
  REST = 'Dinlen'
}

export enum DailyArchetype {
  WARRIOR = 'Savaşçı',
  SAGE = 'Bilge',
  MAGICIAN = 'Büyücü',
  HEALER = 'Şifacı'
}

export enum HormonePhase {
  FOLLICULAR = 'Foliküler',
  OVULATION = 'Ovülasyon',
  LUTEAL = 'Luteal',
  MENSTRUAL = 'Menstrüel'
}

export interface CycleConfig {
  lastPeriodDate: string;
  cycleLength: number; // e.g. 21
  periodLength: number; // e.g. 5
}

export interface MoodEntry {
  date: string;
  energy: number; // 1-5
  focus: number; // 1-5
  emotional_reactivity: number; // 1-5
  production_mode: ProductionMode;
  daily_archetype: DailyArchetype;
  hormone_phase: HormonePhase; // Calculated automatically now
  notes: string;
}

export interface TriggerEntry {
  id: string;
  date: string;
  trigger_event: string;
  emotional_response: string;
  duration_hours: number;
  resolution_note: string;
}

export interface CycleEntry {
  date: string;
  cycle_day: number; // Calculated or manually adjusted
  symptom_notes: string;
}

export interface OutputEntry {
  id: string;
  quarter: string; // e.g., "2023-Q4"
  lane1_output: string;
  lane2_output: string;
  productora_output: string;
  blockers: string;
  next_quarter_goal: string;
}

export interface InsightResult {
  title: string;
  description: string;
  type: 'warning' | 'positive' | 'neutral';
}

export interface PlanPhase {
  id: number;
  title: string;
  dateRange: string; // Display text like "Aralık - Şubat"
  startDate: string; // ISO format for logic
  endDate: string;   // ISO format for logic
  primary: {
    title: string;
    tasks: string[];
  };
  secondary: {
    title: string;
    tasks: string[];
  };
  alwaysOn: string[];
  reviewDate?: string;
}

export interface AnalysisReport {
  moodScore: number;
  dominantEmotion: string;
  therapistNote: string;
  keyTopics: string[];
}

export interface VoiceSessionEntry {
  id: string;
  date: string; // ISO String
  timestamp: number;
  report: AnalysisReport;
}

export interface BackupData {
  moods: MoodEntry[];
  triggers: TriggerEntry[];
  cycles: CycleEntry[];
  outputs: OutputEntry[];
  annualPlan: string;
  cycleConfig: CycleConfig;
  activePhaseOverride: number | null;
  voiceSessions: VoiceSessionEntry[];
}
