import { useEffect } from 'react';
import { GameState } from '../../shared/types';
import { NetworkClient } from '../game/network/NetworkClient';
import { useGameSyncStore } from '../store/gameSyncStore';

export const useGameStateSync = (network: NetworkClient) => {
  const setGameState = useGameSyncStore(state => state.setGameState);
  const removePlayer = useGameSyncStore(state => state.removePlayer);
  const clearGameState = useGameSyncStore(state => state.clearGameState);

  useEffect(() => {
    const onInit = (data: GameState) => {
      setGameState({ ...data, obstacles: data.obstacles || [] });
    };

    const onStateUpdate = (stateDelta: Partial<GameState>) => {
      const prev = useGameSyncStore.getState().gameState;
      
      if (!prev) {
        setGameState({ 
          players: {}, 
          bots: {}, 
          bullets: {}, 
          obstacles: [], 
          ...stateDelta 
        } as GameState);
        return;
      }
      
      const newPlayers = { ...prev.players };
      if (stateDelta.players) {
        for (const id in stateDelta.players) {
          if (stateDelta.players[id] === null) {
            delete newPlayers[id];
          } else {
            newPlayers[id] = { ...newPlayers[id], ...stateDelta.players[id] };
          }
        }
      }
      
      const newBots = { ...prev.bots };
      if (stateDelta.bots) {
        for (const id in stateDelta.bots) {
          if (stateDelta.bots[id] === null) {
            delete newBots[id];
          } else {
            newBots[id] = { ...newBots[id], ...stateDelta.bots[id] };
          }
        }
      }
      
      const newBullets = { ...(prev.bullets || {}) };
      if (stateDelta.bullets) {
        for (const id in stateDelta.bullets) {
          if (stateDelta.bullets[id] === null) {
            delete newBullets[id];
          } else {
            newBullets[id] = { ...newBullets[id], ...stateDelta.bullets[id] };
          }
        }
      }
      
      setGameState({
        ...prev,
        players: newPlayers,
        bots: newBots,
        bullets: newBullets,
        obstacles: stateDelta.obstacles || prev.obstacles || []
      });
    };

    const onPlayerLeft = (playerId: string) => {
      removePlayer(playerId);
    };

    network.on('init', onInit);
    network.on('stateUpdate', onStateUpdate);
    network.on('playerLeft', onPlayerLeft);

    return () => {
      network.off('init', onInit);
      network.off('stateUpdate', onStateUpdate);
      network.off('playerLeft', onPlayerLeft);
      clearGameState();
    };
  }, [network, setGameState, removePlayer, clearGameState]);

  // We no longer return state from here to avoid re-renders.
  // Components should use `useGameSyncStore` directly.
  return null;
};
