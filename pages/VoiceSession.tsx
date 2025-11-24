
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import AudioVisualizer from '../components/AudioVisualizer';
import { storageService } from '../services/storageService';
import { AnalysisReport, VoiceSessionEntry } from '../types';

const VoiceSession: React.FC = () => {
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<VoiceSessionEntry[]>([]);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Data Refs
  const transcriptRef = useRef<{role: 'user'|'model', text: string}[]>([]);
  const currentSessionRef = useRef<any>(null);

  // Initial Load
  useEffect(() => {
    setHistory(storageService.getVoiceSessions());
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    if (audioInputContextRef.current) {
      try { audioInputContextRef.current.close(); } catch(e) {}
      audioInputContextRef.current = null;
    }
    sourceNodesRef.current.forEach(node => {
        try { node.stop(); } catch(e) {}
    });
    sourceNodesRef.current = [];
    currentSessionRef.current = null;
  };

  const startSession = async () => {
    if (!process.env.API_KEY) {
        alert("API Anahtarı eksik (process.env.API_KEY).");
        return;
    }

    try {
        stopAudio(); 
        setConnectionState('connecting');
        setReport(null);
        transcriptRef.current = [];
        nextStartTimeRef.current = 0;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        // Output Context
        const outCtx = new AudioContextClass({ sampleRate: 24000 });
        const analyser = outCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5;
        audioContextRef.current = outCtx;
        analyserRef.current = analyser;

        // Input Context
        const inCtx = new AudioContextClass({ sampleRate: 16000 });
        audioInputContextRef.current = inCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1
            } 
        });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    setConnectionState('connected');
                    const source = inCtx.createMediaStreamSource(stream);
                    const processor = inCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmData = float32ToInt16(inputData);
                        const base64Data = arrayBufferToBase64(pcmData.buffer);
                        
                        if (currentSessionRef.current) {
                            currentSessionRef.current.sendRealtimeInput({ 
                                media: {
                                    mimeType: "audio/pcm;rate=16000",
                                    data: base64Data
                                }
                            });
                        }
                    };
                    
                    source.connect(processor);
                    processor.connect(inCtx.destination);
                },
                onmessage: (msg: LiveServerMessage) => {
                    handleServerMessage(msg, outCtx, analyser);
                },
                onclose: () => {
                    if (connectionState === 'connected') setConnectionState('idle');
                },
                onerror: (err: any) => {
                    console.error("Session Error", err);
                    alert("Bağlantı hatası");
                    setConnectionState('idle');
                    stopAudio();
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
                },
                inputAudioTranscription: {}, 
                outputAudioTranscription: {},
                systemInstruction: "Sen 'Mindful AI' asistanısın. Türkçe konuşuyorsun. Empatik, sakin, iyi bir dinleyici ve bilge bir terapistsin. Kullanıcıyı yargılama. Rahatlatıcı cevaplar ver."
            }
        };

        const session = await ai.live.connect(config);
        currentSessionRef.current = session;

    } catch (err) {
        console.error("Start Failed:", err);
        alert("Mikrofon hatası.");
        setConnectionState('idle');
        stopAudio();
    }
  };

  const handleServerMessage = async (msg: LiveServerMessage, ctx: AudioContext, analyser: AnalyserNode) => {
      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (audioData) {
          try {
              const audioBuffer = await decodeAudioData(base64ToArrayBuffer(audioData), ctx);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(analyser); 
              analyser.connect(ctx.destination); 
              
              if (nextStartTimeRef.current < ctx.currentTime) {
                  nextStartTimeRef.current = ctx.currentTime;
              }
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourceNodesRef.current.push(source);
              source.onended = () => {
                  sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== source);
              };
          } catch (e) {}
      }

      if (msg.serverContent?.interrupted) {
          sourceNodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} });
          sourceNodesRef.current = [];
          nextStartTimeRef.current = ctx.currentTime;
      }

      const outText = msg.serverContent?.outputTranscription?.text;
      if (outText) transcriptRef.current.push({ role: 'model', text: outText });
      
      const inText = msg.serverContent?.inputTranscription?.text;
      if (inText) transcriptRef.current.push({ role: 'user', text: inText });
  };

  const endSession = async () => {
      stopAudio();
      setConnectionState('idle');
      setIsAnalyzing(true);
      await generateMoodReport();
      setIsAnalyzing(false);
  };

  const generateMoodReport = async () => {
      const historyText = transcriptRef.current.map(t => `${t.role === 'user' ? 'Kullanıcı' : 'Terapist'}: ${t.text}`).join('\n');
      
      if (historyText.length < 20) return;

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
            Terapi Seansı Transkripti:
            ${historyText}
            
            Görevin: Bu konuşmayı analiz et ve Türkçe JSON formatında bir rapor sun.
            Kriterler:
            - moodScore: 1-10 arası.
            - dominantEmotion: Tek kelime (ör: Kaygılı, Umutlu).
            - therapistNote: Kullanıcıya hitaben 2 cümlelik, içgörü dolu bir not.
            - keyTopics: 3 tane konu etiketi.
          `;
          
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          moodScore: { type: Type.NUMBER },
                          dominantEmotion: { type: Type.STRING },
                          therapistNote: { type: Type.STRING },
                          keyTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                  }
              }
          });
          
          if (response.text) {
              const newReport = JSON.parse(response.text);
              setReport(newReport);
              
              // Save to Storage
              const entry: VoiceSessionEntry = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  timestamp: Date.now(),
                  report: newReport
              };
              storageService.saveVoiceSession(entry);
              setHistory(prev => [entry, ...prev]);
          }
      } catch (e) {
          console.error("Report Gen Error", e);
      }
  };

  const deleteHistoryItem = (id: string) => {
      storageService.deleteVoiceSession(id);
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  // --- Utils ---
  const float32ToInt16 = (float32: Float32Array) => {
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i])); 
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return int16;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
  };

  const decodeAudioData = (arrayBuffer: ArrayBuffer, ctx: AudioContext): Promise<AudioBuffer> => {
      const pcmData = new Int16Array(arrayBuffer);
      const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcmData.length; i++) {
          channelData[i] = pcmData[i] / 32768.0;
      }
      return Promise.resolve(audioBuffer);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      
      {/* Active Session Area */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold text-white tracking-tight">Sesli Seans</h2>
            <p className="text-xl text-slate-400 max-w-lg mx-auto">
                <span className="text-indigo-400">Gemini Live</span> seni dinliyor.
            </p>
        </div>

        <div className="w-full max-w-2xl relative group">
            <AudioVisualizer 
                isActive={connectionState === 'connected'} 
                audioContext={audioContextRef.current} 
                analyser={analyserRef.current} 
            />
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                {connectionState === 'idle' ? (
                    <button 
                        onClick={startSession}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-indigo-900/40 hover:scale-105 transition-all text-lg"
                    >
                        <span>🎙️</span> Seansı Başlat
                    </button>
                ) : connectionState === 'connecting' ? (
                    <button disabled className="flex items-center gap-3 bg-slate-700 text-slate-300 px-8 py-4 rounded-full font-bold cursor-wait text-lg">
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        Bağlanıyor...
                    </button>
                ) : (
                    <button 
                        onClick={endSession}
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-900/40 hover:scale-105 transition-all text-lg animate-pulse"
                    >
                        <span>⏹️</span> Bitir & Analiz Et
                    </button>
                )}
            </div>
        </div>

        {isAnalyzing && (
            <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400">Rapor oluşturuluyor ve kaydediliyor...</p>
            </div>
        )}

        {/* Current Report Display */}
        {report && connectionState === 'idle' && !isAnalyzing && (
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2"><span>📄</span> Yeni Rapor</h3>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mood Skoru</span>
                        <span className={`text-4xl font-bold ${report.moodScore >= 7 ? 'text-green-400' : report.moodScore >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>{report.moodScore}/10</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Baskın Duygu</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-lg font-medium">{report.dominantEmotion}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Konular</label>
                        <div className="flex flex-wrap gap-2">
                            {report.keyTopics.map((topic, i) => (
                                <span key={i} className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg text-sm">#{topic}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Terapist Notu</label>
                    <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-6 text-indigo-200 leading-relaxed italic">"{report.therapistNote}"</div>
                </div>
            </div>
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
          <div className="w-full max-w-4xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                <span className="h-px bg-slate-800 flex-1"></span>
                Geçmiş Seanslar
                <span className="h-px bg-slate-800 flex-1"></span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.map((entry) => (
                      <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all group relative">
                          <button 
                             onClick={() => deleteHistoryItem(entry.id)}
                             className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Sil"
                          >
                             ✕
                          </button>
                          
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                                  {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                              </span>
                              <span className={`text-xl font-bold ${entry.report.moodScore >= 7 ? 'text-green-400' : entry.report.moodScore >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {entry.report.moodScore}/10
                              </span>
                          </div>
                          
                          <h4 className="text-white font-bold text-lg mb-2">{entry.report.dominantEmotion}</h4>
                          <p className="text-slate-400 text-sm line-clamp-2 italic mb-4">"{entry.report.therapistNote}"</p>
                          
                          <div className="flex flex-wrap gap-2">
                              {entry.report.keyTopics.slice(0, 2).map((t, i) => (
                                  <span key={i} className="text-xs text-slate-500 border border-slate-800 px-2 py-1 rounded">#{t}</span>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};

export default VoiceSession;
