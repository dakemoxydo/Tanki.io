import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameSyncStore } from '../../store/gameSyncStore';

interface GameHUDProps {
  socketId: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({ socketId }) => {
  const { t } = useTranslation();
  
  const p = useGameSyncStore(state => state.gameState?.players?.[socketId]);

  const playerData = useMemo(() => {
    return p ? { health: p.health, score: p.score } : null;
  }, [p?.health, p?.score]);

  return (
    <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
        TANKS.IO
      </h2>
      
      {playerData && (
        <div className="bg-slate-800/80 p-4 rounded-lg backdrop-blur-sm w-48 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm font-bold uppercase">{t('Health')}</span>
            <span className={`font-mono font-bold ${playerData.health > 30 ? 'text-green-400' : 'text-red-500'}`}>
              {Math.max(0, Math.round(playerData.health))}
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full ${playerData.health > 30 ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
              style={{ width: `${Math.max(0, playerData.health)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-slate-300 text-sm font-bold uppercase">{t('Score')}</span>
            <span className="font-mono font-bold text-blue-400">
              {playerData.score}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
