import React from 'react';
import { useShallow } from 'zustand/react/shallow';
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
  
  // Use selectors to only re-render when the LIST of players/bots/obstacles changes
  const playerIds = useGameSyncStore(useShallow(state => Object.keys(state.gameState?.players || {})));
  const botIds = useGameSyncStore(useShallow(state => Object.keys(state.gameState?.bots || {})));
  const obstacles = useGameSyncStore(useShallow(state => state.gameState?.obstacles || []));

  return (
    <>
      {/* 1. Obstacles - Optimized with InstancedMesh for static environment objects */}
      {obstacles.length > 0 && <ObstacleInstancedView obstacles={obstacles} />}

      {/* 2. Players - Human controlled tanks */}
      {playerIds.map(id => (
        <TankView 
          key={id} 
          id={id} 
          isLocal={id === socketId} 
          localState={id === socketId ? engine.localState : undefined} 
          isBot={false}
        />
      ))}

      {/* 3. Bots - AI controlled tanks */}
      {botIds.map(id => (
        <TankView 
          key={id} 
          id={id} 
          isBot={true} 
        />
      ))}

      {/* 4. Bullets - Optimized with InstancedMesh for performance */}
      <BulletInstancedView socketId={socketId} engine={engine} />
    </>
  );
};
