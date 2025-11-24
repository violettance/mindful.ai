
import React, { useState, useEffect } from 'react';
import { DailyArchetype, HormonePhase, MoodEntry, ProductionMode, PlanPhase } from '../types';
import { storageService } from '../services/storageService';
import { Link } from 'react-router-dom';

const DailyMood: React.FC = () => {
  const [formData, setFormData] = useState<MoodEntry>({
    date: new Date().toISOString().split('T')[0],
    energy: 3,
    focus: 3,
    emotional_reactivity: 3,
    production_mode: ProductionMode.BUILD,
    daily_archetype: DailyArchetype.WARRIOR,
    hormone_phase: HormonePhase.FOLLICULAR,
    notes: '',
  });

  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<PlanPhase | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Initial Load and Date Change
  useEffect(() => {
    // 1. Calculate hormone phase (Always dynamic based on date + config)
    const calculatedPhase = storageService.calculateHormonePhase(formData.date);
    
    // 2. Load existing entry if any
    const moods = storageService.getMoods();
    const existingEntry = moods.find(m => m.date === formData.date);

    // 3. Get Strategic Plan Context
    // Crucial: Call this every time to catch manual overrides saved in local storage
    const activePhase = storageService.getCurrentPhase(formData.date);
    setCurrentPlan(activePhase);
    
    // Check override status
    const override = storageService.getActivePhaseOverride();
    setIsManualOverride(!!override);

    // 4. Calculate Streak
    let currentStreak = 0;
    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedMoods.length > 0) currentStreak = sortedMoods.length; 
    setStreak(currentStreak);

    if (existingEntry) {
      setFormData({ ...existingEntry, hormone_phase: calculatedPhase });
    } else {
      setFormData(prev => ({ ...prev, hormone_phase: calculatedPhase }));
    }
  }, [formData.date]); 

  // Listener for storage events (in case changed in another tab/window)
  useEffect(() => {
      const handleStorageChange = () => {
          const activePhase = storageService.getCurrentPhase(formData.date);
          setCurrentPlan(activePhase);
          setIsManualOverride(!!storageService.getActivePhaseOverride());
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, [formData.date]);

  const handleChange = (field: keyof MoodEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addMood(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getPhaseColor = (phase: HormonePhase) => {
    switch(phase) {
        case HormonePhase.MENSTRUAL: return 'text-red-400 border-red-500/30 bg-red-500/10';
        case HormonePhase.OVULATION: return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
        case HormonePhase.FOLLICULAR: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
        case HormonePhase.LUTEAL: return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const getArchetypeColor = (arch: DailyArchetype) => {
    switch (arch) {
        case DailyArchetype.WARRIOR: return 'bg-red-600 border-red-500 shadow-red-900/20'; 
        case DailyArchetype.SAGE: return 'bg-blue-600 border-blue-500 shadow-blue-900/20'; 
        case DailyArchetype.MAGICIAN: return 'bg-purple-600 border-purple-500 shadow-purple-900/20'; 
        case DailyArchetype.HEALER: return 'bg-emerald-600 border-emerald-500 shadow-emerald-900/20'; 
        default: return 'bg-slate-700';
    }
  };

  const isPrepPhase = currentPlan && !isManualOverride && new Date(formData.date) < new Date(currentPlan.startDate);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Günlük Akış</h2>
          <p className="text-lg text-slate-400 mt-2">Bugünün zihinsel ve fiziksel envanteri.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Veri Zinciri</span>
                <span className="text-2xl font-bold text-indigo-400">{streak} Gün</span>
            </div>
             <button
                onClick={() => storageService.downloadCSV('mood')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-all"
                >
                CSV İndir
            </button>
            <button
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-xl font-bold text-white transition-all shadow-lg transform active:scale-95 ${
                saved ? 'bg-green-600 shadow-green-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
            }`}
            >
            {saved ? 'Kaydedildi' : 'Kaydet'}
            </button>
        </div>
      </header>

      {currentPlan ? (
        <div className="bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl leading-none font-bold select-none text-white">
            {currentPlan.id}
          </div>
          
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse border ${
                    isPrepPhase ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                    {isPrepPhase ? 'Hazırlık Modu' : 'Aktif Strateji'}
                </span>
                <Link to="/annual" className="text-xs font-bold text-slate-500 hover:text-white uppercase transition-colors">
                    Planı Gör →
                </Link>
             </div>
             
             <div className="flex flex-col md:flex-row gap-8">
                 <div className="flex-1">
                     <h3 className="text-2xl font-bold text-white mb-1">
                        {isPrepPhase ? `Hazırlık: ${currentPlan.title}` : currentPlan.title}
                     </h3>
                     <p className="text-slate-400 text-sm mb-4 font-mono">{currentPlan.dateRange}</p>
                     
                     <div className="space-y-2">
                         <div className="flex items-start gap-3">
                             <span className="text-lg">🎯</span>
                             <div>
                                 <strong className="block text-indigo-400 text-sm uppercase font-bold">Ana Odak (Primary)</strong>
                                 <span className="text-slate-200 font-medium">{currentPlan.primary.title}</span>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8 flex flex-col justify-center space-y-4">
                     <div className="flex items-start gap-3">
                         <span className="text-lg">📚</span>
                         <div>
                             <strong className="block text-blue-400 text-xs uppercase font-bold">İkincil Odak</strong>
                             <span className="text-slate-300 text-sm">{currentPlan.secondary.title}</span>
                         </div>
                     </div>
                     <div className="flex items-start gap-3">
                         <span className="text-lg">🔄</span>
                         <div>
                             <strong className="block text-slate-500 text-xs uppercase font-bold">Always-On</strong>
                             <span className="text-slate-400 text-sm">Productora & SEO</span>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
      ) : (
         <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center">
             <p className="text-slate-400">Şu an aktif bir stratejik faz planlanmamış.</p>
             <Link to="/annual" className="text-indigo-400 font-bold hover:underline">Yıllık Plan Oluştur</Link>
         </div>
      )}

      <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
             <div className="w-full md:w-auto">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tarih Seçimi</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full md:w-64 bg-slate-950 border border-slate-700 text-white text-lg rounded-xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
             </div>
             
             <div className={`w-full md:w-auto px-8 py-4 rounded-2xl border flex flex-col md:flex-row md:items-center gap-2 md:gap-4 ${getPhaseColor(formData.hormone_phase)}`}>
                 <span className="text-xs font-bold uppercase tracking-wider opacity-70">Otomatik Hormon Fazı</span>
                 <span className="text-2xl font-bold">{formData.hormone_phase}</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
                label="Enerji Seviyesi" 
                value={formData.energy} 
                onChange={(v) => handleChange('energy', v)} 
                lowLabel="Bitkin" highLabel="Zirve" 
                accentColor="text-yellow-400"
                sliderColor="accent-yellow-500"
            />
             <MetricCard 
                label="Odaklanma" 
                value={formData.focus} 
                onChange={(v) => handleChange('focus', v)} 
                lowLabel="Dağınık" highLabel="Lazer" 
                accentColor="text-blue-400"
                sliderColor="accent-blue-500"
            />
             <MetricCard 
                label="Duygusal Tepki" 
                value={formData.emotional_reactivity} 
                onChange={(v) => handleChange('emotional_reactivity', v)} 
                lowLabel="Zen" highLabel="Patlamaya Hazır" 
                accentColor="text-red-400"
                sliderColor="accent-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                <label className="text-sm font-bold text-slate-400 mb-6 block uppercase tracking-wide flex items-center gap-2">
                    🛠 Üretim Modu
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(ProductionMode).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => handleChange('production_mode', mode)}
                            className={`p-4 rounded-2xl text-sm font-bold border transition-all text-left ${
                                formData.production_mode === mode 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                <label className="text-sm font-bold text-slate-400 mb-6 block uppercase tracking-wide flex items-center gap-2">
                    🔮 Günlük Arketip (Jungian)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(DailyArchetype).map((arch) => (
                        <button
                            key={arch}
                            onClick={() => handleChange('daily_archetype', arch)}
                            className={`p-4 rounded-2xl text-sm font-bold border transition-all text-left ${
                                formData.daily_archetype === arch 
                                ? `${getArchetypeColor(arch)} text-white`
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                            }`}
                        >
                            {arch}
                        </button>
                    ))}
                </div>
             </div>
          </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <label className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-wide">
                    📝 Notlar & İçgörüler
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-200 focus:ring-2 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none resize-none leading-relaxed text-lg placeholder-slate-600 transition-all"
                    placeholder="Bugün zihnini meşgul eden düşünceler, rüyalar veya olaylar..."
                    rows={4}
                />
            </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, onChange, lowLabel, highLabel, accentColor, sliderColor }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-end mb-6">
            <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{label}</span>
            <span className={`text-4xl font-bold ${accentColor}`}>{value}</span>
        </div>
        <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer ${sliderColor} hover:brightness-110 transition-all`}
        />
        <div className="flex justify-between mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
        </div>
    </div>
);

export default DailyMood;
