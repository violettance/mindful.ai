
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { PlanPhase } from '../types';

const AnnualPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual');
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [planPhases, setPlanPhases] = useState<PlanPhase[]>([]);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [overrideId, setOverrideId] = useState<number | null>(null);

  useEffect(() => {
    // Load text plan
    setText(storageService.getAnnualPlan());
    
    // Load structural plan
    const phases = storageService.getStrategicPlan();
    setPlanPhases(phases);

    // Identify current phase (including override)
    const current = storageService.getCurrentPhase();
    if (current) setActivePhaseId(current.id);

    // Check if override is set
    setOverrideId(storageService.getActivePhaseOverride());
  }, []);

  const handleSaveText = () => {
    storageService.saveAnnualPlan(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleOverride = (phaseId: number) => {
    if (overrideId === phaseId) {
        // Clear override
        storageService.setActivePhaseOverride(null);
        setOverrideId(null);
        // Refresh active phase based on date
        const current = storageService.getCurrentPhase();
        setActivePhaseId(current ? current.id : null);
    } else {
        // Set override
        storageService.setActivePhaseOverride(phaseId);
        setOverrideId(phaseId);
        setActivePhaseId(phaseId);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
           <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-white tracking-tight">Yıllık Strateji</h2>
              {overrideId && (
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                      Manuel Mod Aktif
                  </span>
              )}
           </div>
           <p className="text-slate-400 mt-2 text-lg">2025 Vizyonu & Yol Haritası</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mt-4 md:mt-0">
            <button
                onClick={() => setActiveTab('visual')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visual' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Görsel Harita
            </button>
            <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Serbest Notlar
            </button>
        </div>
      </header>
      
      {activeTab === 'visual' ? (
        <div className="space-y-8 animate-fade-in relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 hidden md:block"></div>
            
            {planPhases.map((phase, index) => {
                const isActive = phase.id === activePhaseId;
                const isManual = overrideId === phase.id;
                const isLeft = index % 2 === 0;

                return (
                    <div key={phase.id} className={`flex flex-col md:flex-row gap-8 relative ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                        
                        {/* Center Dot (Desktop) */}
                        <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 top-8 w-6 h-6 rounded-full border-4 z-10 items-center justify-center ${isActive ? 'bg-indigo-600 border-indigo-900 shadow-lg shadow-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}>
                             {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                        </div>

                        {/* Content Card */}
                        <div className="w-full md:w-1/2">
                            <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 hover:border-slate-600 relative overflow-hidden group ${
                                isActive 
                                ? 'bg-slate-900 border-indigo-500/50 shadow-2xl shadow-indigo-900/10' 
                                : 'bg-slate-900/50 border-slate-800'
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                                        isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                        {isActive ? (isManual ? 'Manuel Olarak Seçildi' : 'Otomatik: Aktif Aşama') : `Aşama ${phase.id}`}
                                    </span>
                                    <span className="text-slate-400 font-mono text-sm">{phase.dateRange}</span>
                                </div>
                                
                                <h3 className={`text-2xl font-bold mb-6 ${isActive ? 'text-white' : 'text-slate-300'}`}>{phase.title}</h3>
                                
                                <div className="space-y-6">
                                    <div className="relative pl-4 border-l-2 border-indigo-500/30">
                                        <h4 className="text-indigo-400 font-bold text-sm uppercase mb-2">🎯 Primary: {phase.primary.title}</h4>
                                        <ul className="space-y-1">
                                            {phase.primary.tasks.map((t, i) => (
                                                <li key={i} className="text-slate-300 text-sm leading-relaxed">• {t}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="relative pl-4 border-l-2 border-blue-500/30">
                                        <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">📘 Secondary: {phase.secondary.title}</h4>
                                        <ul className="space-y-1">
                                            {phase.secondary.tasks.map((t, i) => (
                                                <li key={i} className="text-slate-400 text-sm leading-relaxed">• {t}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {phase.reviewDate && (
                                        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-yellow-500/80 font-mono flex items-center gap-2">
                                            <span>⚠️</span> {phase.reviewDate}
                                        </div>
                                    )}
                                </div>

                                {/* Override Button */}
                                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                                    <button 
                                        onClick={() => toggleOverride(phase.id)}
                                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                                            isManual 
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white'
                                        }`}
                                    >
                                        {isManual ? 'Otomatik Moda Dön (Seçimi Kaldır)' : 'Bunu Aktif Strateji Yap'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Spacer for desktop layout */}
                        <div className="w-full md:w-1/2 hidden md:block"></div>
                    </div>
                );
            })}

             <div className="text-center pt-12 pb-8">
                 <p className="text-slate-600 text-sm">2025 Stratejik Planı</p>
             </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-250px)] flex flex-col relative">
           <div className="absolute top-4 right-4 z-10">
                <button 
                onClick={handleSaveText}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                    saved 
                    ? 'bg-green-600 text-white shadow-green-900/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                }`}
                >
                {saved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
                </button>
           </div>
           <div className="flex-1 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group hover:border-slate-700 transition-colors">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full p-8 bg-slate-950 border-0 rounded-xl focus:ring-0 outline-none font-mono text-slate-300 leading-relaxed resize-none selection:bg-purple-500/30 text-lg"
            placeholder="Yıllık strateji notları..."
            spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualPlan;
