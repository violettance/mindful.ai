
import React, { useState, useEffect } from 'react';
import { OutputEntry, PlanPhase } from '../types';
import { storageService } from '../services/storageService';

const QuarterlyOutput: React.FC = () => {
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState<PlanPhase | null>(null);
  const [formData, setFormData] = useState<OutputEntry>({
    id: '',
    quarter: '2024-Q1',
    lane1_output: '',
    lane2_output: '',
    productora_output: '',
    blockers: '',
    next_quarter_goal: '',
  });

  useEffect(() => {
    setOutputs(storageService.getOutputs());
    setCurrentPhase(storageService.getCurrentPhase());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = { ...formData, id: Date.now().toString() };
    storageService.addOutput(entry);
    setOutputs(storageService.getOutputs());
    const btn = document.getElementById('q-save-btn');
    if(btn) btn.innerText = "Kaydedildi!";
    setTimeout(() => { if(btn) btn.innerText = "Hedefleri Kaydet"; }, 2000);
  };

  const fields = [
    { key: 'lane1_output', label: 'Lane 1 Çıktısı (Rota AI)', rows: 3 },
    { key: 'lane2_output', label: 'Lane 2 Çıktısı (Psikometrik)', rows: 3 },
    { key: 'productora_output', label: 'Productora Çıktısı', rows: 3 },
  ];

  // --- NEW PROGRESS LOGIC: Input Based ---
  // 4 Key fields = 100%
  // Lane 1, Lane 2, Productora, Next Goal
  const trackedFields = ['lane1_output', 'lane2_output', 'productora_output', 'next_quarter_goal'];
  
  let filledCount = 0;
  trackedFields.forEach(field => {
      const val = (formData as any)[field];
      if (val && val.trim().length > 2) { // Minimal length check
          filledCount++;
      }
  });

  const qProgress = (filledCount / trackedFields.length) * 100;
  
  let progressLabel = "Başlangıç";
  if (qProgress === 0) progressLabel = "Henüz Veri Yok";
  else if (qProgress === 25) progressLabel = "%25 - Başlangıç";
  else if (qProgress === 50) progressLabel = "%50 - Yarılandı";
  else if (qProgress === 75) progressLabel = "%75 - Son Düzlük";
  else if (qProgress === 100) progressLabel = "Tamamlandı ✨";

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="w-full">
           <div className="flex justify-between items-center mb-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">Çeyrek Takibi</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        {currentPhase ? `Aşama ${currentPhase.id}` : 'Genel Takip'}
                    </span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border transition-colors ${
                        qProgress === 100 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    }`}>
                        {progressLabel}
                    </span>
                </div>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800 relative">
                {/* Background Grid Lines for 25% steps */}
                <div className="absolute inset-0 grid grid-cols-4 w-full h-full">
                    <div className="border-r border-slate-800/50 h-full"></div>
                    <div className="border-r border-slate-800/50 h-full"></div>
                    <div className="border-r border-slate-800/50 h-full"></div>
                </div>
                <div 
                    className={`h-full transition-all duration-700 ease-out ${
                        qProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                    }`} 
                    style={{width: `${qProgress}%`}}
                >
                    {qProgress > 10 && (
                        <div className="h-full w-full opacity-30 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
                    )}
                </div>
           </div>
           <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600 mt-2 px-1">
               <span>0</span>
               <span>1 Çıktı</span>
               <span>2 Çıktı</span>
               <span>3 Çıktı</span>
               <span>Tamamlandı</span>
           </div>
        </div>
      </header>

      {/* Main Form - Centered Stack */}
      <section className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-white">Yeni Çeyrek Hedefi</h3>
            <button onClick={() => storageService.downloadCSV('outputs')} className="text-sm text-slate-400 hover:text-white underline">
                CSV Yedeği Al
            </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-8">
            <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Çeyrek (Quarter)</label>
                <input
                  type="text"
                  value={formData.quarter}
                  onChange={e => setFormData({...formData, quarter: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xl"
                  placeholder="2024-Q1"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 border-t border-b border-slate-800 py-8">
                {fields.map(f => (
                    <div key={f.key}>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">{f.label}</label>
                            {(formData as any)[f.key].length > 2 && <span className="text-green-500 text-xs font-bold">✓ Girildi</span>}
                        </div>
                        <textarea
                            value={(formData as any)[f.key]}
                            onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                            className={`w-full bg-slate-950 border text-slate-200 rounded-xl p-5 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg leading-relaxed placeholder-slate-700 transition-all ${
                                (formData as any)[f.key].length > 2 ? 'border-blue-500/30' : 'border-slate-700'
                            }`}
                            rows={f.rows}
                            placeholder="Bu çeyrekte bu alanda ne üretildi?"
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <label className="block text-sm font-bold text-red-400 uppercase tracking-wider mb-3">⚠️ Bloklayıcılar (İlerleme Dışı)</label>
                     <textarea
                        value={formData.blockers}
                        onChange={e => setFormData({...formData, blockers: e.target.value})}
                        className="w-full bg-red-950/10 border border-red-900/30 text-red-100 rounded-xl p-5 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        rows={3}
                     />
                </div>
                <div>
                     <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-bold text-green-400 uppercase tracking-wider">🎯 Gelecek Çeyrek Hedefi</label>
                        {formData.next_quarter_goal.length > 2 && <span className="text-green-500 text-xs font-bold">✓ Girildi</span>}
                     </div>
                     <textarea
                        value={formData.next_quarter_goal}
                        onChange={e => setFormData({...formData, next_quarter_goal: e.target.value})}
                        className={`w-full bg-green-950/10 border text-green-100 rounded-xl p-5 focus:ring-2 focus:ring-green-500 outline-none resize-none ${
                             formData.next_quarter_goal.length > 2 ? 'border-green-500/30' : 'border-green-900/30'
                        }`}
                        rows={3}
                     />
                </div>
            </div>

            <button id="q-save-btn" type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 mt-4">
                Hedefleri Kaydet
            </button>
         </form>
      </section>

      {/* History List */}
      <section>
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
              <span className="h-px bg-slate-800 flex-1"></span>
              Geçmiş Çeyrek Raporları
              <span className="h-px bg-slate-800 flex-1"></span>
          </h3>

          <div className="space-y-8">
          {outputs.map(o => (
             <div key={o.id} className="bg-slate-900 border border-slate-800 p-10 rounded-3xl hover:border-slate-600 transition-colors group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
               
               <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                 <h4 className="text-3xl font-bold text-white">{o.quarter}</h4>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rapor Detayı</span>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50">
                        <strong className="block text-xs text-blue-400 uppercase mb-3 font-bold">Lane 1 (Rota AI)</strong>
                        <p className="text-slate-300 leading-relaxed">{o.lane1_output || '-'}</p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50">
                        <strong className="block text-xs text-purple-400 uppercase mb-3 font-bold">Lane 2 (Psikometrik)</strong>
                        <p className="text-slate-300 leading-relaxed">{o.lane2_output || '-'}</p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50">
                        <strong className="block text-xs text-indigo-400 uppercase mb-3 font-bold">Productora</strong>
                        <p className="text-slate-300 leading-relaxed">{o.productora_output || '-'}</p>
                    </div>
               </div>

               {(o.blockers || o.next_quarter_goal) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {o.blockers && (
                            <div className="bg-red-950/20 p-6 rounded-2xl border border-red-900/30">
                                <strong className="block text-xs text-red-500 uppercase mb-2 font-bold">⚠️ Bloklayıcılar</strong>
                                <span className="text-red-200">{o.blockers}</span>
                            </div>
                        )}
                        {o.next_quarter_goal && (
                            <div className="bg-green-950/20 p-6 rounded-2xl border border-green-900/30">
                                <strong className="block text-xs text-green-500 uppercase mb-2 font-bold">🎯 Gelecek Hedef</strong>
                                <span className="text-green-200">{o.next_quarter_goal}</span>
                            </div>
                        )}
                   </div>
               )}
             </div>
          ))}
          </div>
      </section>
    </div>
  );
};

export default QuarterlyOutput;
