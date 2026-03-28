import { GoogleGenAI } from "@google/genai";

async function resolveApiKey(): Promise<string> {
  if (typeof window !== "undefined" && window.mudidiElectron?.getApiKey) {
    const k = await window.mudidiElectron.getApiKey();
    if (k?.trim()) return k.trim();
  }
  return (process.env.API_KEY || process.env.GEMINI_API_KEY || "").trim();
}

export async function generatePoster(
  prompt: string,
  ratio: string,
  referenceImageBase64?: string,
  mimeType?: string
) {
  const apiKey = await resolveApiKey();
  if (!apiKey) {
    throw new Error(
      "缺少 API Key。请在桌面版首次启动时填写，或在 .env 中配置 GEMINI_API_KEY。"
    );
  }
  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  
  if (referenceImageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: referenceImageBase64.split(',')[1],
        mimeType: mimeType,
      },
    });
  }
  
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: ratio,
        imageSize: "1K"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
}
