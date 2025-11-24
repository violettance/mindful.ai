
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { CycleConfig } from '../types';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<CycleConfig>({
    lastPeriodDate: '',
    cycleLength: 21,
    periodLength: 5
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Explicitly load config on mount to ensure persistent data is shown
    const loadedConfig = storageService.getCycleConfig();
    if(loadedConfig) setConfig(loadedConfig);
  }, []);

  const handleSaveConfig = () => {
    storageService.saveCycleConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const success = await storageService.restoreBackup(file);
      if (success) {
        alert("Yedek başarıyla geri yüklendi! Sayfa yenileniyor...");
        window.location.reload();
      } else {
        alert("Yedek yüklenirken bir hata oluştu. Dosya bozuk olabilir.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Ayarlar & Veri Yönetimi</h2>
        <p className="text-slate-400 mt-2">Uygulama yapılandırması ve güvenli yedekleme.</p>
      </header>

      {/* Cycle Configuration */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-purple-400">⚡</span> Döngü Yapılandırması
        </h3>
        <p className="text-slate-400 text-sm mb-6">
            Hormon fazlarını doğru hesaplamak için lütfen döngü bilgilerini gir.
            Bu veriler otomatik hesaplamalarda kullanılır ve tarayıcıda saklanır.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Son Adet Başlangıcı</label>
                <input
                    type="date"
                    value={config.lastPeriodDate}
                    onChange={(e) => setConfig({ ...config, lastPeriodDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Döngü Süresi (Gün)</label>
                <input
                    type="number"
                    value={config.cycleLength}
                    onChange={(e) => setConfig({ ...config, cycleLength: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Örn: 21"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Adet Süresi (Gün)</label>
                <input
                    type="number"
                    value={config.periodLength}
                    onChange={(e) => setConfig({ ...config, periodLength: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Örn: 5"
                />
            </div>
        </div>
        
        <div className="mt-6 flex justify-end">
            <button
                onClick={handleSaveConfig}
                className={`px-6 py-3 rounded-xl font-medium text-white transition-all shadow-lg ${
                    saved ? 'bg-green-600 shadow-green-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                }`}
            >
                {saved ? 'Kalıcı Olarak Kaydedildi ✓' : 'Ayarları Kaydet'}
            </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-blue-400">💾</span> Veri Güvenliği
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                <h4 className="font-bold text-white mb-2">Tam Yedek Al (Backup)</h4>
                <p className="text-sm text-slate-400 mb-6">
                    Tüm mod girişlerini, döngü verilerini, ayarlarını, <strong>sesli seans raporlarını</strong> ve tetikleyicilerini tek bir JSON dosyası olarak indir.
                </p>
                <button
                    onClick={() => storageService.createFullBackup()}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium border border-slate-700 transition-colors"
                >
                    ⬇️ Yedek Dosyasını İndir
                </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                <h4 className="font-bold text-white mb-2">Yedekten Geri Dön (Restore)</h4>
                <p className="text-sm text-slate-400 mb-6">
                    Daha önce aldığın .json yedek dosyasını yükleyerek tüm verilerini (ses analizleri dahil) geri getir.
                </p>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleRestore}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium border border-slate-700 transition-colors"
                >
                    ⬆️ Yedek Yükle
                </button>
            </div>
        </div>
      </section>
      
      <div className="text-center text-xs text-slate-600 pt-8 pb-4">
        Mindful AI v2.2 - Local-First & Voice Memory
      </div>
    </div>
  );
};

export default Settings;
