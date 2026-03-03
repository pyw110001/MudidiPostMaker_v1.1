import { GoogleGenAI } from "@google/genai";

export async function generatePoster(
  prompt: string,
  ratio: string,
  referenceImageBase64?: string,
  mimeType?: string
) {
  // Create a new instance right before making the call to ensure it uses the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

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
