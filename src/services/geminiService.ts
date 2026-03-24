import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const generateComplexResponse = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
  });
  return response.text;
};
