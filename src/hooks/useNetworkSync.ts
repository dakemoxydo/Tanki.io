import { useSocketConnection } from './useSocketConnection';
import { useGameStateSync } from './useGameStateSync';
import { useGameEvents } from './useGameEvents';

export const useNetworkSync = (addExplosion?: (x: number, z: number) => void) => {
  const { network, socketId, isLoading, isJoined, createRoom } = useSocketConnection();
  useGameStateSync(network);
  const { killFeed, respawnTime } = useGameEvents(network, socketId, addExplosion || (() => {}));

  return {
    socketId,
    isLoading,
    isJoined,
    killFeed,
    respawnTime,
    network,
    createRoom
  };
};

