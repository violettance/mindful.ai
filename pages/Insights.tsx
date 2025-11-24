import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { analyzeDataWithGemini } from '../services/geminiService';
import { InsightResult } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const Insights: React.FC = () => {
  const [insights, setInsights] = useState<InsightResult[]>([]);
  const [loading, setLoading] = useState(false);

  const moods = useMemo(() => storageService.getMoods(), []);
  const triggers = useMemo(() => storageService.getTriggers(), []);
  const cycles = useMemo(() => storageService.getCycles(), []);

  // Prepare Chart Data (Last 14 days)
  const chartData = useMemo(() => {
    return moods.slice(-14).map(m => ({
      date: m.date.slice(5), // MM-DD
      energy: m.energy,
      focus: m.focus,
      reactivity: m.emotional_reactivity
    }));
  }, [moods]);

  const handleGeminiAnalysis = async () => {
    setLoading(true);
    const results = await analyzeDataWithGemini(moods, triggers, cycles);
    setInsights(results);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Analiz & Görüler</h2>
           <p className="text-slate-400 mt-1">Gemini destekli örüntü tanıma.</p>
        </div>
        <button
          onClick={handleGeminiAnalysis}
          disabled={loading}
          className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-105 transition-all ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
        >
          {loading ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <>
                <span className="text-lg">✨</span>
                <span className="font-medium">Gemini ile Analiz Et</span>
            </>
          )}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <StatCard label="Ort. Enerji" value={(moods.reduce((a, b) => a + b.energy, 0) / (moods.length || 1)).toFixed(1)} icon="⚡" />
         <StatCard label="Kayıtlı Gün" value={moods.length} icon="📅" />
         <StatCard label="Tetikleyiciler" value={triggers.length} icon="⚠️" />
         <StatCard label="Döngü Verisi" value={cycles.length} icon="🔄" />
      </div>

      {/* Gemini Results Section */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border shadow-xl backdrop-blur-sm ${
                insight.type === 'warning' ? 'bg-red-950/20 border-red-900/50' : 
                insight.type === 'positive' ? 'bg-green-950/20 border-green-900/50' : 'bg-blue-950/20 border-blue-900/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                 <div className={`w-2 h-2 rounded-full ${
                    insight.type === 'warning' ? 'bg-red-500' : 
                    insight.type === 'positive' ? 'bg-green-500' : 'bg-blue-500'
                 }`}></div>
                 <h4 className={`font-bold text-lg ${
                    insight.type === 'warning' ? 'text-red-400' : 
                    insight.type === 'positive' ? 'text-green-400' : 'text-blue-400'
                 }`}>{insight.title}</h4>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{insight.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Energy & Focus Trend */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Enerji ve Odak Trendi (Son 14 Gün)</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                 <XAxis dataKey="date" stroke="#64748b" fontSize={12} tick={{fill: '#94a3b8'}} />
                 <YAxis domain={[0, 6]} stroke="#64748b" hide />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ color: '#e2e8f0' }}
                 />
                 <Legend wrapperStyle={{paddingTop: '20px'}} />
                 <Line type="monotone" dataKey="energy" stroke="#a78bfa" strokeWidth={3} dot={{r: 4}} name="Enerji" />
                 <Line type="monotone" dataKey="focus" stroke="#22d3ee" strokeWidth={3} dot={{r: 4}} name="Odak" />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Reactivity Bar */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Duygusal Tepkisellik</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                 <XAxis dataKey="date" stroke="#64748b" fontSize={12} tick={{fill: '#94a3b8'}} />
                 <YAxis domain={[0, 5]} stroke="#64748b" tick={{fill: '#94a3b8'}} />
                 <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                 />
                 <Bar dataKey="reactivity" fill="#f87171" name="Tepkisellik" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:bg-slate-800 transition-colors">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{label}</div>
  </div>
);

export default Insights;