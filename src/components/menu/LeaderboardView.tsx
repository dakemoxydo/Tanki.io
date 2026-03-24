import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import { UserProfile } from '../../../shared/types';
import { WindowContainer } from '../ui/WindowContainer';

interface LeaderboardViewProps {
  leaderboard: UserProfile[];
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard, isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <WindowContainer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('Leaderboard')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-4 p-3 bg-slate-900 rounded-lg font-bold text-sm text-slate-400">
          <div className="col-span-2">{t('Player')}</div>
          <div className="text-center">{t('Kills')}</div>
          <div className="text-center">{t('Matches')}</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {leaderboard.map((player, idx) => (
            <div key={player.uid || idx} className="grid grid-cols-4 gap-4 p-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700/50 transition-colors">
              <div className="col-span-2 font-medium flex items-center gap-3 text-white">
                <span className="text-slate-500 w-4">{idx + 1}.</span>
                {player.displayName}
              </div>
              <div className="text-center font-mono text-green-400">{player.kills}</div>
              <div className="text-center font-mono text-blue-400">{player.matchesPlayed}</div>
            </div>
          ))}
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center p-4 text-slate-500">{t('No data yet')}</div>
        )}
      </div>
    </WindowContainer>
  );
};
