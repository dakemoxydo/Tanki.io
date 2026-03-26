import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameSyncStore } from '../../store/gameSyncStore';
import { PlayerData } from '../../../shared/types';

interface InGameLeaderboardProps {
  socketId: string;
}

export const InGameLeaderboard: React.FC<InGameLeaderboardProps> = ({ socketId }) => {
  const { t } = useTranslation();
  
  const players = useGameSyncStore(state => state.gameState?.players);

  const leaderboard = useMemo(() => {
    return Object.values((players || {}) as Record<string, PlayerData>)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.name, score: p.score }));
  }, [players]);

  return (
    <div className="bg-slate-800/80 p-4 rounded-lg backdrop-blur-sm w-48 mt-4 pointer-events-none">
      <h3 className="font-bold text-slate-300 mb-2 uppercase text-xs tracking-wider">{t('Leaderboard')}</h3>
      {leaderboard.map((p, i) => (
        <div key={p.id} className={`flex justify-between text-sm ${p.id === socketId ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
          <span className="truncate pr-2">{i + 1}. {p.name}</span>
          <span>{p.score}</span>
        </div>
      ))}
    </div>
  );
};
