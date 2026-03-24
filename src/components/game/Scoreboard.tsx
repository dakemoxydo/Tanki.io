import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useGameSyncStore } from '../../store/gameSyncStore';
import { PlayerData } from '../../../shared/types';

interface ScoreboardProps {
  socketId: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ socketId }) => {
  const { t } = useTranslation();
  
  // Only re-render if the list of players/bots or their scores/kills/deaths change
  const leaderboardData = useGameSyncStore(useShallow(state => {
    const players = (state.gameState?.players || {}) as Record<string, PlayerData>;
    const bots = (state.gameState?.bots || {}) as Record<string, PlayerData>;
    return [...Object.values(players), ...Object.values(bots)]
      .sort((a, b) => b.score - a.score)
      .map(p => ({
        id: p.id,
        name: p.name,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        score: p.score
      }));
  }));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900/90 p-6 rounded-lg w-full max-w-2xl border border-slate-700">
        <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">{t('Scoreboard')}</h2>
        <div className="grid grid-cols-4 gap-4 text-slate-400 text-sm mb-2 border-b border-slate-700 pb-2">
          <div>{t('Name')}</div>
          <div className="text-center">{t('Kills')}</div>
          <div className="text-center">{t('Deaths')}</div>
          <div className="text-center">{t('Score')}</div>
        </div>
        <div className="space-y-2">
          {leaderboardData.map((p) => (
            <div key={p.id} className={`grid grid-cols-4 gap-4 text-sm p-2 rounded ${p.id === socketId ? 'bg-green-900/30 text-green-400' : 'text-slate-200'}`}>
              <div className="truncate">{p.name}</div>
              <div className="text-center">{p.kills}</div>
              <div className="text-center">{p.deaths}</div>
              <div className="text-center font-bold">{p.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
