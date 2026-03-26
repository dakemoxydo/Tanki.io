import React, { useMemo } from 'react';
import { TankView } from './TankView';
import { BulletInstancedView } from './BulletInstancedView';
import { ObstacleInstancedView } from './ObstacleInstancedView';
import { ClientEngine } from '../../core/ClientEngine';
import { useGameSyncStore } from '../../../store/gameSyncStore';

interface EntityManagerProps {
  socketId: string;
  engine: ClientEngine;
}

/**
 * EntityManager (Architectural Constructor)
 * Manages the lifecycle and rendering of all game entities.
 * Standardizes how players, bots, bullets, and obstacles are displayed.
 */
export const EntityManager: React.FC<EntityManagerProps> = ({ socketId, engine }) => {
  
  const players = useGameSyncStore(state => state.gameState?.players);
  const bots = useGameSyncStore(state => state.gameState?.bots);
  const obstacles = useGameSyncStore(state => state.gameState?.obstacles);

  const playerIds = useMemo(() => Object.keys(players || {}), [players]);
  const botIds = useMemo(() => Object.keys(bots || {}), [bots]);

  return (
    <>
      {/* 1. Obstacles - Optimized with InstancedMesh for static environment objects */}
      {obstacles && obstacles.length > 0 && <ObstacleInstancedView obstacles={obstacles} />}

      {/* 2. Players - Human controlled tanks */}
      {playerIds.map(id => (
        <TankView 
          key={id} 
          id={id} 
          isLocal={id === socketId} 
          localState={id === socketId ? engine.localPlayer : undefined} 
          isBot={false}
          engine={engine}
        />
      ))}

      {/* 3. Bots - AI controlled tanks */}
      {botIds.map(id => (
        <TankView 
          key={id} 
          id={id} 
          isBot={true} 
          engine={engine}
        />
      ))}

      {/* 4. Bullets - Optimized with InstancedMesh for performance */}
      <BulletInstancedView socketId={socketId} engine={engine} />
    </>
  );
};
