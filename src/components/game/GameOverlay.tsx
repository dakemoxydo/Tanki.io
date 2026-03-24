import React from 'react';
import { Crosshair } from 'lucide-react';
import { GameHUD } from './GameHUD';
import { InGameLeaderboard } from './InGameLeaderboard';
import { InGameMenu } from './InGameMenu';
import { DeathScreen } from './DeathScreen';
import { KillFeed } from './KillFeed';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Scoreboard } from './Scoreboard';
import { useGameSyncStore } from '../../store/gameSyncStore';

interface GameOverlayProps {
  socketId: string;
  isLocked: boolean;
  isJoined: boolean;
  isMenuOpen: boolean;
  isTabPressed: boolean;
  killFeed: any[];
  respawnTime: number;
  ping: number;
  language: 'ru' | 'en';
  toggleLanguage: () => void;
  requestPointerLock: () => void;
  addBot: () => void;
  clearBots: () => void;
  handleBackToMenu: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  socketId,
  isLocked,
  isJoined,
  isMenuOpen,
  isTabPressed,
  killFeed,
  respawnTime,
  ping,
  language,
  toggleLanguage,
  requestPointerLock,
  addBot,
  clearBots,
  handleBackToMenu
}) => {
  const isDead = useGameSyncStore(state => state.gameState?.players?.[socketId]?.isDead || false);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <GameHUD socketId={socketId} />
      </div>
      
      <div className="absolute top-28 right-4 z-10 pointer-events-none">
        <InGameLeaderboard socketId={socketId} />
      </div>
      
      <PerformanceMonitor ping={ping} />
      
      {isTabPressed && <Scoreboard socketId={socketId} />}
      
      <KillFeed messages={killFeed} />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <Crosshair className="text-white/50 w-8 h-8" />
      </div>

      {!isLocked && isJoined && isMenuOpen && (
        <InGameMenu 
          language={language}
          toggleLanguage={toggleLanguage}
          onRequestPointerLock={requestPointerLock}
          onAddBot={addBot}
          onClearBots={clearBots}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {isDead && (
        <DeathScreen respawnTime={respawnTime} />
      )}
    </>
  );
};
