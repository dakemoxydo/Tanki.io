import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let ai: GoogleGenAI | null = null;

export const getGeminiAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. AI features will not work.');
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const askTacticalAdvisor = async (question: string, language: string): Promise<string> => {
  const aiClient = getGeminiAI();
  if (!aiClient) return language === 'ru' ? 'Ошибка: API ключ не найден.' : 'Error: API key not found.';

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: question,
      config: {
        systemInstruction: language === 'ru' 
          ? 'Ты опытный тактический советник в игре Tanks.io. Давай короткие, полезные советы по тактике танкового боя, позиционированию и стрельбе. Отвечай на русском языке.'
          : 'You are an expert tactical advisor in the game Tanks.io. Give short, useful tips on tank combat tactics, positioning, and shooting. Answer in English.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    
    return response.text || (language === 'ru' ? 'Нет ответа.' : 'No response.');
  } catch (error) {
    console.error('Gemini API Error:', error);
    return language === 'ru' ? 'Ошибка при получении совета.' : 'Error getting advice.';
  }
};
