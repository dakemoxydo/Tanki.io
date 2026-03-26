import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkClient } from '../game/network/NetworkClient';
import { useGameSyncStore } from '../store/gameSyncStore';

export const useGameEvents = (network: NetworkClient, socketId: string, addExplosion: (x: number, z: number) => void) => {
  const { t } = useTranslation();
  const [killFeed, setKillFeed] = useState<{ id: string, message: string }[]>([]);
  const [respawnTime, setRespawnTime] = useState<number>(0);

  const addMessageToFeed = (message: string) => {
    const id = Math.random().toString();
    setKillFeed(prev => [...prev, { id, message }].slice(-5));
    setTimeout(() => {
      setKillFeed(prev => prev.filter(m => m.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const onPlayerKilled = (data: any) => {
      addMessageToFeed(`${data.victimName} ${t('was killed by')} ${data.killerName}`);
    };

    const onBotKilled = (data: any) => {
      addMessageToFeed(`${data.victimName} ${t('was destroyed by')} ${data.killerName}`);
    };

    const onBulletDestroyed = (id: string) => {
      const gameState = useGameSyncStore.getState().gameState;
      if (gameState && gameState.bullets && gameState.bullets[id]) {
        const b = gameState.bullets[id];
        // Only trigger explosion if it's NOT our own bullet (our own is handled locally)
        if (b.ownerId !== socketId) {
          addExplosion(b.x, b.z);
        }
      }
    };

    network.on('playerKilled', onPlayerKilled);
    network.on('botKilled', onBotKilled);
    network.on('bulletDestroyed', onBulletDestroyed);

    return () => {
      network.off('playerKilled', onPlayerKilled);
      network.off('botKilled', onBotKilled);
      network.off('bulletDestroyed', onBulletDestroyed);
    };
  }, [network, t, socketId, addExplosion]);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameSyncStore.getState().gameState;
      if (state?.players && state.players[socketId]?.isDead) {
        const deathTime = state.players[socketId].deathTime;
        if (deathTime) {
          const timeLeft = Math.max(0, Math.ceil((5000 - (Date.now() - deathTime)) / 1000));
          setRespawnTime(timeLeft);
        }
      } else {
        setRespawnTime(0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [socketId]);

  return { killFeed, respawnTime };
};
