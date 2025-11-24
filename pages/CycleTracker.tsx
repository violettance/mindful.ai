import React, { useState } from 'react';
import { CycleEntry } from '../types';
import { storageService } from '../services/storageService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

const CycleTracker: React.FC = () => {
  const [formData, setFormData] = useState<CycleEntry>({
    date: new Date().toISOString().split('T')[0],
    cycle_day: 1,
    symptom_notes: '',
  });
  const [saved, setSaved] = useState(false);

  const moods = storageService.getMoods();
  const cycles = storageService.getCycles();
  const config = storageService.getCycleConfig();

  const chartData = cycles
    .map(c => {
      const m = moods.find(mood => mood.date === c.date);
      return {
        date: c.date,
        day: c.cycle_day,
        energy: m ? m.energy : null
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addCycle(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!config.lastPeriodDate) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl">⚙️</div>
            <h2 className="text-3xl font-bold text-white">Döngü Yapılandırması Eksik</h2>
            <p className="text-slate-400 max-w-md text-lg">Otomatik döngü takibi için lütfen ayarlardan döngü bilgilerini gir.</p>
            <Link to="/settings" className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-bold transition-colors">Ayarlara Git</Link>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-center pb-8 border-b border-slate-800">
        <div>
           <h2 className="text-4xl font-bold text-white tracking-tight">Döngü & Semptomlar</h2>
           <p className="text-lg text-slate-400 mt-2">
               Döngü: <span className="text-white font-bold">{config.cycleLength} gün</span> | Adet: <span className="text-white font-bold">{config.periodLength} gün</span>
           </p>
        </div>
        <button onClick={() => storageService.downloadCSV('cycle')} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-colors">
          CSV İndir
        </button>
      </header>

      {/* Main Layout - Stacked */}
      <div className="space-y-12">
        
        {/* Symptom Entry Form */}
        <section className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Günlük Semptom Girişi</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tarih</label>
                    <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                    required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Döngü Günü (Manuel)</label>
                    <input
                    type="number"
                    min="1"
                    max="35"
                    value={formData.cycle_day}
                    onChange={e => setFormData({...formData, cycle_day: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Semptom Notları</label>
                    <textarea
                    value={formData.symptom_notes}
                    onChange={e => setFormData({...formData, symptom_notes: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder-slate-600 text-lg"
                    rows={4}
                    placeholder="Ağrı, şişkinlik, baş ağrısı vb."
                    />
                </div>
                <div className="md:col-span-2">
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-900/20">
                        {saved ? 'Kaydedildi ✓' : 'Semptom Kaydet'}
                    </button>
                </div>
            </form>
        </section>

        {/* Chart Section */}
        <section className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8">Döngü Günü vs Enerji Analizi</h3>
            <div className="h-96 w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="day" label={{ value: 'Döngü Günü', position: 'insideBottom', offset: -5, fill: '#64748b' }} stroke="#64748b" tick={{fill: '#94a3b8'}} />
                    <YAxis stroke="#64748b" domain={[0, 5]} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', padding: '12px', borderRadius: '12px' }}
                        itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="energy" stroke="#a78bfa" strokeWidth={4} dot={{r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} name="Enerji" />
                </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                    <span className="text-4xl mb-4">📊</span>
                    <p className="text-lg">Grafik için günlük akışta enerji verisi girin.</p>
                </div>
            )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default CycleTracker;