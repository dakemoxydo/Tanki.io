import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Crosshair } from 'lucide-react';
import { NetworkClient } from '../game/network/NetworkClient';
import { InputManager } from '../game/core/InputManager';
import { ClientEngine } from '../game/core/ClientEngine';
import { Scene } from '../game/render/Scene';
import { useTranslation } from 'react-i18next';

export const Game = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<any>(null);
  const [socketId, setSocketId] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [killFeed, setKillFeed] = useState<{ id: string, message: string }[]>([]);
  const [explosions, setExplosions] = useState<{ id: string, x: number, z: number }[]>([]);

  const networkRef = useRef<NetworkClient | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const engineRef = useRef<ClientEngine | null>(null);

  useEffect(() => {
    const network = new NetworkClient();
    const input = new InputManager();
    const engine = new ClientEngine(network, input);

    networkRef.current = network;
    inputRef.current = input;
    engineRef.current = engine;

    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      network.disconnect();
      input.cleanup();
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !networkRef.current || !inputRef.current || !engineRef.current) return;

    setIsLoading(true);
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const url = import.meta.env.VITE_APP_URL || window.location.origin;
    
    networkRef.current.onInit = (data) => {
      setGameState((prev: any) => ({ ...prev, obstacles: data.obstacles }));
      setIsLoading(false);
      setIsJoined(true);
    };

    networkRef.current.onStateUpdate = (state) => {
      setGameState((prev: any) => ({ ...state, obstacles: prev?.obstacles || [] }));
      if (!socketId && networkRef.current?.socket?.id) {
        setSocketId(networkRef.current.socket.id);
      }
    };

    networkRef.current.onPlayerKilled = (data) => {
      addMessageToFeed(`${t('Player')} ${data.victimId.substring(0, 4)} ${t('was killed by')} ${data.killerId.substring(0, 4)}`);
    };

    networkRef.current.onBotKilled = (data) => {
      addMessageToFeed(`${t('Bot was destroyed by')} ${data.killerId.substring(0, 4)}`);
    };

    networkRef.current.onBulletDestroyed = (id) => {
      setGameState((prevState: any) => {
        if (prevState && prevState.bullets && prevState.bullets[id]) {
          const b = prevState.bullets[id];
          setExplosions(prev => [...prev, { id, x: b.x, z: b.z }].slice(-20));
        }
        return prevState;
      });
    };

    networkRef.current.connect(url, playerName, color);
    inputRef.current.init();
  };

  const addMessageToFeed = (message: string) => {
    const id = Math.random().toString();
    setKillFeed(prev => [...prev, { id, message }].slice(-5));
    setTimeout(() => {
      setKillFeed(prev => prev.filter(m => m.id !== id));
    }, 3000);
  };

  const requestPointerLock = async () => {
    try {
      await document.body.requestPointerLock();
    } catch (e) {
      console.warn('Pointer lock failed:', e);
    }
  };

  const addBot = async () => {
    await fetch('/api/add-bot', { method: 'POST' });
  };

  const clearBots = async () => {
    await fetch('/api/clear-bots', { method: 'POST' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
          {t('Connecting to server...')}
        </h2>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96">
          <h1 className="text-4xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            TANKS.IO
          </h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">{t('Nickname')}</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('Enter your name...')}
                maxLength={15}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {t('PLAY NOW')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 relative" onClick={!isLocked ? requestPointerLock : undefined}>
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
          TANKS.IO
        </h2>
        
        {/* Player Stats */}
        {gameState?.players && gameState.players[socketId] && (
          <div className="bg-slate-800/80 p-4 rounded-lg backdrop-blur-sm w-48 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 text-sm font-bold uppercase">{t('Health')}</span>
              <span className={`font-mono font-bold ${gameState.players[socketId].health > 30 ? 'text-green-400' : 'text-red-500'}`}>
                {Math.max(0, Math.round(gameState.players[socketId].health))}
              </span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${gameState.players[socketId].health > 30 ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
                style={{ width: `${Math.max(0, gameState.players[socketId].health)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-slate-300 text-sm font-bold uppercase">{t('Score')}</span>
              <span className="font-mono font-bold text-blue-400">
                {gameState.players[socketId].score}
              </span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-slate-800/80 p-4 rounded-lg backdrop-blur-sm w-48 mt-4">
          <h3 className="font-bold text-slate-300 mb-2 uppercase text-xs tracking-wider">{t('Leaderboard')}</h3>
          {gameState?.players && Object.values(gameState.players)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 5)
            .map((p: any, i) => (
              <div key={p.id} className={`flex justify-between text-sm ${p.id === socketId ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                <span className="truncate pr-2">{i + 1}. {p.name}</span>
                <span>{p.score}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Admin Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={addBot} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold pointer-events-auto">
          {t('Add Bot')}
        </button>
        <button onClick={clearBots} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-bold pointer-events-auto">
          {t('Clear Bots')}
        </button>
      </div>

      {/* Kill Feed */}
      <div className="absolute top-20 right-4 z-10 flex flex-col items-end gap-1 pointer-events-none">
        {killFeed.map(msg => (
          <div key={msg.id} className="bg-slate-800/80 text-white px-3 py-1 rounded text-sm font-medium animate-fade-in">
            {msg.message}
          </div>
        ))}
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <Crosshair className="text-white/50 w-8 h-8" />
      </div>

      {/* Pointer Lock Overlay */}
      {!isLocked && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-800 p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">{t('Game Paused')}</h3>
            <p className="text-slate-400">{t('Click anywhere to resume and lock cursor')}</p>
            <p className="text-slate-500 text-sm mt-4">{t('Press F1 or ESC to unlock')}</p>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 10, 15], fov: 60 }}>
        {gameState && engineRef.current && (
          <Scene serverState={gameState} socketId={socketId} engine={engineRef.current} explosions={explosions} />
        )}
      </Canvas>
    </div>
  );
};
