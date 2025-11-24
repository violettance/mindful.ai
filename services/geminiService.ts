import { GoogleGenAI, Type } from "@google/genai";
import { MoodEntry, TriggerEntry, CycleEntry, InsightResult } from "../types";

export const analyzeDataWithGemini = async (
  moods: MoodEntry[],
  triggers: TriggerEntry[],
  cycles: CycleEntry[]
): Promise<InsightResult[]> => {
  try {
    if (!process.env.API_KEY) {
      return [{
        title: "API Anahtarı Eksik",
        description: "Lütfen Gemini API anahtarınızı yapılandırın.",
        type: "neutral"
      }];
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare recent data (last 30 entries to save tokens)
    const recentMoods = moods.slice(-30);
    const recentTriggers = triggers.slice(-10);
    const recentCycles = cycles.slice(-30);

    const contextData = JSON.stringify({
      moods: recentMoods,
      triggers: recentTriggers,
      cycles: recentCycles
    });

    const prompt = `
      Sen "Mindful AI" sisteminin analitik motorusun. Aşağıdaki JSON verisi bir kullanıcının son günlerdeki modunu, tetikleyicilerini (trigger) ve hormonal döngüsünü içerir.
      
      Veri: ${contextData}
      
      Görevin:
      1. Verilerdeki kalıpları analiz et.
      2. Aşağıdaki gibi uyarılar veya içgörüler oluştur:
         - Enerji düşüşleri (ör: 5 gün üst üste 3'ün altındaysa tükenmişlik riski).
         - Hormonal döngü ile odaklanma arasındaki ilişki (ör: Ovülasyon haftasında yüksek odak).
         - Tetikleyici analizleri (ör: Sık tekrar eden tetikleyiciler).
         - Mod ve üretim modu arasındaki uyum (ör: Kaplan günleri İnşa Et modu ile uyumlu mu?).
      
      Yanıtı JSON formatında ver. Şema şöyle olmalı:
      {
        "insights": [
          { "title": "...", "description": "...", "type": "warning" | "positive" | "neutral" }
        ]
      }
      
      Türkçe yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["warning", "positive", "neutral"] }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const result = JSON.parse(text);
    return result.insights || [];

  } catch (error) {
    console.error("Gemini Error:", error);
    return [{
      title: "Analiz Hatası",
      description: "Veriler analiz edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      type: "warning"
    }];
  }
};