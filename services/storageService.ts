
import { MoodEntry, TriggerEntry, CycleEntry, OutputEntry, CycleConfig, HormonePhase, BackupData, PlanPhase, VoiceSessionEntry } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
  MOOD: 'mindful_mood_csv',
  TRIGGERS: 'mindful_triggers_csv',
  CYCLE: 'mindful_cycle_csv',
  OUTPUTS: 'mindful_outputs_csv',
  ANNUAL_PLAN: 'mindful_annual_plan_txt',
  CYCLE_CONFIG: 'mindful_cycle_config',
  ACTIVE_PHASE_OVERRIDE: 'mindful_active_phase_override',
  VOICE_SESSIONS: 'mindful_voice_sessions_json',
};

// --- DEFAULT STRATEGY DATA (2025 Vision) ---
const STRATEGIC_PLAN: PlanPhase[] = [
  {
    id: 1,
    title: "Aşama 1: Temel & Mimari",
    dateRange: "1 Aralık '24 – 28 Şubat '25",
    startDate: "2024-12-01",
    endDate: "2025-02-28",
    primary: {
      title: "Rota AI – Planlama & Geliştirme",
      tasks: [
        "Ürün planlaması ve feature list oluşturma",
        "Mimari tasarım ve veri akışı",
        "İlk geliştirme sprinti (Ocak)",
        "İkinci geliştirme sprinti (Şubat)"
      ]
    },
    secondary: {
      title: "Psikometrik Test – Literatür",
      tasks: [
        "Visual attention ve Jung/Nardi literatür taraması",
        "Metodolojik çerçeve oluşturma",
        "Görsel/Soru tasarım teknik notları"
      ]
    },
    alwaysOn: ["Satya blog ve rapor hazırlığı", "Dönemsel SEO işleri"]
  },
  {
    id: 2,
    title: "Aşama 2: Prototip & İlk Test",
    dateRange: "1 Mart '25 – 31 Mayıs '25",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    reviewDate: "Mayıs sonu plan değerlendirmesi",
    primary: {
      title: "Psikometrik Test – Üretim",
      tasks: [
        "Görsel konseptlerin üretilmesi (Mart)",
        "İlk prototip oluşturma (Nisan)",
        "Profilic üzerinde ilk test ve veri toplama (Mayıs)"
      ]
    },
    secondary: {
      title: "Rota AI – Marketing Faz 1",
      tasks: [
        "GTM stratejisi ve içerik hazırlığı",
        "Waitlist çalışması",
        "Persona ve hedefleme denemeleri"
      ]
    },
    alwaysOn: ["Satya blog ve rapor hazırlığı", "Dönemsel SEO işleri"]
  },
  {
    id: 3,
    title: "Aşama 3: Analiz & İyileştirme",
    dateRange: "1 Haziran '25 – 31 Ağustos '25",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    primary: {
      title: "Psikometrik Test – İstatistik",
      tasks: [
        "EFA, CFA, reliability analizleri",
        "Madde iyileştirmeleri",
        "Final versiyon hazırlığı"
      ]
    },
    secondary: {
      title: "Rota AI – Maintenance",
      tasks: [
        "UX ve mimari iyileştirmeleri",
        "Kullanıcı geri bildirimlerine göre düzeltmeler"
      ]
    },
    alwaysOn: ["Satya blog ve rapor hazırlığı", "Dönemsel SEO işleri"]
  },
  {
    id: 4,
    title: "Aşama 4: Raporlama & Lansman",
    dateRange: "1 Eylül '25 – 30 Kasım '25",
    startDate: "2025-09-01",
    endDate: "2025-11-30",
    reviewDate: "Kasım sonu plan değerlendirmesi",
    primary: {
      title: "Psikometrik Test – Yayın",
      tasks: [
        "Akademik rapor yazımı",
        "Yayın ve dağıtım hazırlığı",
        "Gerekirse 2. test uygulaması"
      ]
    },
    secondary: {
      title: "Rota AI – Marketing Faz 2",
      tasks: [
        "Okul dönemi marketing kampanyası",
        "TikTok vb. kanallarda 2. dalga görünürlük"
      ]
    },
    alwaysOn: ["Satya blog ve rapor hazırlığı", "Dönemsel SEO işleri"]
  }
];

// Generic helper to get data
const getData = <T>(key: string): T[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

// Generic helper to save data
const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  // --- STRATEGIC PLAN LOGIC ---
  getStrategicPlan: (): PlanPhase[] => {
    return STRATEGIC_PLAN;
  },

  // Set manual override
  setActivePhaseOverride: (phaseId: number | null) => {
    if (phaseId === null) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE);
    } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE, phaseId.toString());
    }
  },

  // Get currently active override ID
  getActivePhaseOverride: (): number | null => {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE);
      return stored ? parseInt(stored) : null;
  },

  getCurrentPhase: (targetDateStr?: string): PlanPhase | null => {
    // 1. Check for Manual Override FIRST
    const overrideId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE);
    if (overrideId) {
        const manualPhase = STRATEGIC_PLAN.find(p => p.id === parseInt(overrideId));
        if (manualPhase) return manualPhase;
    }

    // 2. Date Logic (Fallback)
    const now = new Date();
    const dateObj = targetDateStr ? new Date(targetDateStr) : now;
    const targetISO = dateObj.toISOString().split('T')[0];
    const targetTime = new Date(targetISO).getTime();

    // SPECIAL LOGIC: "Preparation Mode"
    const phase1Start = new Date(STRATEGIC_PLAN[0].startDate).getTime();
    if (targetTime < phase1Start) {
        return STRATEGIC_PLAN[0];
    }

    // Standard Logic
    const current = STRATEGIC_PLAN.find(phase => {
        const start = new Date(phase.startDate).getTime();
        const end = new Date(phase.endDate).getTime();
        return targetTime >= start && targetTime <= end;
    });
    
    return current || null; 
  },

  // Cycle Config
  getCycleConfig: (): CycleConfig => {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLE_CONFIG);
    return stored ? JSON.parse(stored) : { lastPeriodDate: '', cycleLength: 21, periodLength: 5 };
  },
  saveCycleConfig: (config: CycleConfig) => {
    localStorage.setItem(STORAGE_KEYS.CYCLE_CONFIG, JSON.stringify(config));
  },

  // Helper to calculate current hormone phase based on config and date
  calculateHormonePhase: (targetDateStr: string): HormonePhase => {
    const config = storageService.getCycleConfig();
    if (!config.lastPeriodDate) return HormonePhase.FOLLICULAR; 

    const start = new Date(config.lastPeriodDate).getTime();
    const target = new Date(targetDateStr).getTime();
    const diffTime = target - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return HormonePhase.FOLLICULAR; 

    const currentDay = (diffDays % config.cycleLength) + 1;

    if (currentDay <= config.periodLength) return HormonePhase.MENSTRUAL;
    
    const midCycle = Math.floor(config.cycleLength / 2);
    if (currentDay >= midCycle - 2 && currentDay <= midCycle + 2) return HormonePhase.OVULATION;

    if (currentDay < midCycle - 2) return HormonePhase.FOLLICULAR;

    return HormonePhase.LUTEAL;
  },

  // Mood
  getMoods: (): MoodEntry[] => getData<MoodEntry>(STORAGE_KEYS.MOOD),
  addMood: (entry: MoodEntry) => {
    const data = getData<MoodEntry>(STORAGE_KEYS.MOOD);
    const existingIndex = data.findIndex(d => d.date === entry.date);
    if (existingIndex >= 0) {
      data[existingIndex] = entry;
    } else {
      data.push(entry);
    }
    saveData(STORAGE_KEYS.MOOD, data);
  },

  // Triggers
  getTriggers: (): TriggerEntry[] => getData<TriggerEntry>(STORAGE_KEYS.TRIGGERS),
  addTrigger: (entry: TriggerEntry) => {
    const data = getData<TriggerEntry>(STORAGE_KEYS.TRIGGERS);
    data.push(entry);
    saveData(STORAGE_KEYS.TRIGGERS, data);
  },

  // Cycle Logs
  getCycles: (): CycleEntry[] => getData<CycleEntry>(STORAGE_KEYS.CYCLE),
  addCycle: (entry: CycleEntry) => {
    const data = getData<CycleEntry>(STORAGE_KEYS.CYCLE);
    const existingIndex = data.findIndex(d => d.date === entry.date);
    if (existingIndex >= 0) {
      data[existingIndex] = entry;
    } else {
      data.push(entry);
    }
    saveData(STORAGE_KEYS.CYCLE, data);
  },

  // Outputs
  getOutputs: (): OutputEntry[] => getData<OutputEntry>(STORAGE_KEYS.OUTPUTS),
  addOutput: (entry: OutputEntry) => {
    const data = getData<OutputEntry>(STORAGE_KEYS.OUTPUTS);
    const existingIndex = data.findIndex(d => d.quarter === entry.quarter);
    if (existingIndex >= 0) {
      data[existingIndex] = entry;
    } else {
      data.push(entry);
    }
    saveData(STORAGE_KEYS.OUTPUTS, data);
  },

  // Voice Sessions (NEW)
  getVoiceSessions: (): VoiceSessionEntry[] => getData<VoiceSessionEntry>(STORAGE_KEYS.VOICE_SESSIONS),
  saveVoiceSession: (entry: VoiceSessionEntry) => {
    const data = getData<VoiceSessionEntry>(STORAGE_KEYS.VOICE_SESSIONS);
    data.push(entry);
    // Sort by date desc (newest first)
    data.sort((a, b) => b.timestamp - a.timestamp);
    saveData(STORAGE_KEYS.VOICE_SESSIONS, data);
  },
  deleteVoiceSession: (id: string) => {
    const data = getData<VoiceSessionEntry>(STORAGE_KEYS.VOICE_SESSIONS);
    const newData = data.filter(s => s.id !== id);
    saveData(STORAGE_KEYS.VOICE_SESSIONS, newData);
  },

  // Annual Plan
  getAnnualPlan: (): string => localStorage.getItem(STORAGE_KEYS.ANNUAL_PLAN) || '',
  saveAnnualPlan: (text: string) => localStorage.setItem(STORAGE_KEYS.ANNUAL_PLAN, text),

  // Backup & Restore
  createFullBackup: (): void => {
    const backup: BackupData = {
      moods: getData(STORAGE_KEYS.MOOD),
      triggers: getData(STORAGE_KEYS.TRIGGERS),
      cycles: getData(STORAGE_KEYS.CYCLE),
      outputs: getData(STORAGE_KEYS.OUTPUTS),
      voiceSessions: getData(STORAGE_KEYS.VOICE_SESSIONS),
      annualPlan: localStorage.getItem(STORAGE_KEYS.ANNUAL_PLAN) || '',
      cycleConfig: storageService.getCycleConfig(),
      activePhaseOverride: storageService.getActivePhaseOverride(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mindful_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  restoreBackup: (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup: BackupData = JSON.parse(content);
          
          if (backup.moods) saveData(STORAGE_KEYS.MOOD, backup.moods);
          if (backup.triggers) saveData(STORAGE_KEYS.TRIGGERS, backup.triggers);
          if (backup.cycles) saveData(STORAGE_KEYS.CYCLE, backup.cycles);
          if (backup.outputs) saveData(STORAGE_KEYS.OUTPUTS, backup.outputs);
          if (backup.voiceSessions) saveData(STORAGE_KEYS.VOICE_SESSIONS, backup.voiceSessions);
          
          if (backup.annualPlan) localStorage.setItem(STORAGE_KEYS.ANNUAL_PLAN, backup.annualPlan);
          if (backup.cycleConfig) localStorage.setItem(STORAGE_KEYS.CYCLE_CONFIG, JSON.stringify(backup.cycleConfig));
          if (backup.activePhaseOverride !== undefined) {
             if (backup.activePhaseOverride === null) localStorage.removeItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE);
             else localStorage.setItem(STORAGE_KEYS.ACTIVE_PHASE_OVERRIDE, backup.activePhaseOverride.toString());
          }
          
          resolve(true);
        } catch (error) {
          console.error("Backup restoration failed", error);
          reject(false);
        }
      };
      reader.readAsText(file);
    });
  },

  // Export to CSV
  downloadCSV: (type: 'mood' | 'triggers' | 'cycle' | 'outputs') => {
    let data: any[] = [];
    let filename = `${type}.csv`;
    let headers: string[] = [];

    switch (type) {
      case 'mood':
        data = getData(STORAGE_KEYS.MOOD);
        headers = ['date', 'energy', 'focus', 'emotional_reactivity', 'production_mode', 'daily_archetype', 'hormone_phase', 'notes'];
        break;
      case 'triggers':
        data = getData(STORAGE_KEYS.TRIGGERS);
        headers = ['date', 'trigger_event', 'emotional_response', 'duration_hours', 'resolution_note'];
        break;
      case 'cycle':
        data = getData(STORAGE_KEYS.CYCLE);
        headers = ['date', 'cycle_day', 'symptom_notes'];
        break;
      case 'outputs':
        data = getData(STORAGE_KEYS.OUTPUTS);
        headers = ['quarter', 'lane1_output', 'lane2_output', 'productora_output', 'blockers', 'next_quarter_goal'];
        break;
    }

    if (data.length === 0) {
      alert("İndirilecek veri bulunamadı. Lütfen önce veri girişi yapın.");
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const val = (row as any)[fieldName];
        if (val === null || val === undefined) return '';
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ].join('\n');

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
