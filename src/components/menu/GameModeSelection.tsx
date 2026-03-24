import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Search, Play } from 'lucide-react';

interface GameModeSelectionProps {
  onQuickPlay: () => void;
  onShowRoomSelection: () => void;
  onPlayVsBots: () => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  onQuickPlay,
  onShowRoomSelection,
  onPlayVsBots
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onQuickPlay}
          className="flex flex-col items-center justify-center gap-2 py-6 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <Zap size={32} />
          {t('Quick Play')}
        </button>
        
        <button 
          onClick={onShowRoomSelection}
          className="flex flex-col items-center justify-center gap-2 py-6 bg-blue-500 hover:bg-blue-400 text-slate-900 font-bold rounded-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <Search size={32} />
          {t('Server List')}
        </button>
      </div>
      
      <button 
        onClick={onPlayVsBots}
        className="flex items-center justify-center gap-3 w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-2xl transition-transform hover:scale-105 active:scale-95"
      >
        <Play size={28} />
        {t('Play vs Bots')}
      </button>
    </div>
  );
};
