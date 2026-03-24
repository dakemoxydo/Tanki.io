import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Brain, X, Send, Loader2 } from 'lucide-react';

export const AIAssistant = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "Ты — экспертный ИИ-помощник по игре Tanks.io. Твоя задача — помогать игрокам с глубокой стратегией, анализом тактики и советами по улучшению игры. Отвечай на языке пользователя (русский или английский). Будь лаконичным, но информативным."
        },
      });

      setResponse(result.text || 'No response');
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-bottom border-slate-700 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-400">
            <Brain size={24} />
            <h2 className="text-xl font-bold tracking-tight">{t('AI Assistant')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {response && (
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('AI Response')}</h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">{t('Thinking...')}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={t('Ask AI for strategy...')}
              className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
              disabled={isLoading}
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white p-2 rounded-xl transition-all flex items-center justify-center min-w-[44px]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
