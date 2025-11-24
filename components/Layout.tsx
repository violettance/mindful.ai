import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Günlük Akış', icon: 'Sun' },
    { path: '/voice', label: 'Sesli Seans', icon: 'Mic' },
    { path: '/cycle', label: 'Döngü & Hormon', icon: 'RefreshCcw' },
    { path: '/triggers', label: 'Tetikleyiciler', icon: 'AlertTriangle' },
    { path: '/insights', label: 'Analiz Paneli', icon: 'BarChart2' },
    { path: '/outputs', label: 'Stratejik Çıktılar', icon: 'Target' },
    { path: '/annual', label: 'Yıllık Vizyon', icon: 'Map' },
    { path: '/settings', label: 'Ayarlar & Veri', icon: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="hidden xl:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-30">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/20">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">Mindful AI</h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Pro Tracker</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span className={`mr-3 text-lg transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? 'opacity-100' : 'opacity-70 grayscale'}`}>
                {getIcon(item.icon)}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="text-xs text-slate-400">Sistem Aktif</div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="xl:hidden fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 z-40 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">M</div>
           <span className="font-bold text-white">Mindful AI</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
           {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 bg-slate-950 z-30 pt-20 px-6 animate-fade-in">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-4 text-base font-medium rounded-xl border ${
                  isActive(item.path)
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="mr-3">{getIcon(item.icon)}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 xl:ml-64 w-full bg-slate-950 min-h-screen">
        <div className="w-full max-w-[1920px] mx-auto p-6 pt-24 xl:pt-8 xl:p-8 animate-fade-in">
            {children}
        </div>
      </main>
    </div>
  );
};

const getIcon = (name: string) => {
  switch (name) {
    case 'Sun': return '☀️';
    case 'AlertTriangle': return '⚡';
    case 'RefreshCcw': return '🔄';
    case 'BarChart2': return '📊';
    case 'Target': return '🎯';
    case 'Map': return '🗺️';
    case 'Settings': return '⚙️';
    case 'Mic': return '🎙️';
    default: return '•';
  }
};

export default Layout;