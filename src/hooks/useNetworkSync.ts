import { useSocketConnection } from './useSocketConnection';
import { useGameStateSync } from './useGameStateSync';
import { useGameEvents } from './useGameEvents';

export const useNetworkSync = () => {
  const { network, socketId, isLoading, isJoined, createRoom } = useSocketConnection();
  useGameStateSync(network);
  const { killFeed, explosions, respawnTime } = useGameEvents(network, socketId);

  return {
    socketId,
    isLoading,
    isJoined,
    killFeed,
    explosions,
    respawnTime,
    network,
    createRoom
  };
};

