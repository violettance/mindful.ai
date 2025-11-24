import React, { useState, useEffect } from 'react';
import { TriggerEntry } from '../types';
import { storageService } from '../services/storageService';

const TriggerLog: React.FC = () => {
  const [triggers, setTriggers] = useState<TriggerEntry[]>([]);
  const [formData, setFormData] = useState<Omit<TriggerEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    trigger_event: '',
    emotional_response: '',
    duration_hours: 1,
    resolution_note: '',
  });

  useEffect(() => {
    setTriggers(storageService.getTriggers().reverse());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TriggerEntry = {
      ...formData,
      id: Date.now().toString(),
    };
    storageService.addTrigger(newEntry);
    setTriggers([newEntry, ...triggers]);
    setFormData(prev => ({
      ...prev,
      trigger_event: '',
      emotional_response: '',
      duration_hours: 1,
      resolution_note: ''
    }));
  };

  // Quick Stats
  const thisMonthTriggers = triggers.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).length;
  const avgDuration = triggers.length > 0 
    ? (triggers.reduce((a, b) => a + b.duration_hours, 0) / triggers.length).toFixed(1) 
    : '0';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-8">
        <div>
           <h2 className="text-4xl font-bold text-white tracking-tight">Tetikleyici Günlüğü</h2>
           <p className="text-lg text-slate-400 mt-2">Duygusal rezonansı yönet ve analiz et.</p>
        </div>
        <button onClick={() => storageService.downloadCSV('triggers')} className="hidden md:block px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-colors">
          CSV İndir
        </button>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bu Ay</span>
            <span className="text-3xl font-bold text-white">{thisMonthTriggers} <span className="text-sm text-slate-600 font-normal">Kayıt</span></span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ort. Süre</span>
            <span className="text-3xl font-bold text-white">{avgDuration} <span className="text-sm text-slate-600 font-normal">Saat</span></span>
        </div>
      </div>

      {/* Main Entry Form - Full Width */}
      <section className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-orange-600"></div>
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-500 text-sm">⚡</span>
          Yeni Tetikleyici Kaydı
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tarih</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none text-lg"
                        required
                    />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Olay (Trigger)</label>
                    <input
                        type="text"
                        value={formData.trigger_event}
                        onChange={e => setFormData({...formData, trigger_event: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none text-lg placeholder-slate-600"
                        placeholder="Örn: Beklenmedik bir eleştiri..."
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Duygusal Tepki</label>
                <input
                    type="text"
                    value={formData.emotional_response}
                    onChange={e => setFormData({...formData, emotional_response: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none placeholder-slate-600"
                    placeholder="Örn: Öfke, yetersizlik hissi..."
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Etki Süresi (Saat)</label>
                <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.duration_hours}
                    onChange={e => setFormData({...formData, duration_hours: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Not / Çözüm</label>
                <textarea
                    value={formData.resolution_note}
                    onChange={e => setFormData({...formData, resolution_note: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none resize-none placeholder-slate-600"
                    rows={3}
                    placeholder="Nasıl sakinleştin? Bu durumdan ne öğrendin?"
                />
            </div>

            <div className="md:col-span-2 pt-4">
                 <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-900/20 transform active:scale-[0.99]">
                    Kaydı Ekle
                </button>
            </div>
        </form>
      </section>

      {/* History List - Below the form */}
      <section>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
              <span className="h-px bg-slate-800 flex-1"></span>
              Geçmiş Kayıtlar
              <span className="h-px bg-slate-800 flex-1"></span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {triggers.length === 0 ? (
              <div className="col-span-2 text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                  <p className="text-slate-500 text-lg">Henüz tetikleyici kaydı bulunmuyor.</p>
              </div>
            ) : (
              triggers.map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-slate-600 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-sm font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{t.date}</span>
                    <span className="text-sm bg-red-500/10 text-red-400 px-4 py-1 rounded-full font-bold border border-red-500/20">{t.duration_hours} saat</span>
                  </div>
                  <h4 className="font-bold text-xl text-slate-100 group-hover:text-red-400 transition-colors mb-3">{t.trigger_event}</h4>
                  <div className="space-y-3">
                      <p className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-slate-600 uppercase text-xs font-bold mt-1">Tepki:</span> 
                          {t.emotional_response}
                      </p>
                      {t.resolution_note && (
                        <div className="pt-4 border-t border-slate-800/50 mt-4">
                            <p className="text-slate-400 italic leading-relaxed">"{t.resolution_note}"</p>
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
      </section>
    </div>
  );
};

export default TriggerLog;