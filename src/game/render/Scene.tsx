import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import { TankView } from './entities/TankView';
import { BulletView } from './entities/BulletView';
import { ObstacleView } from './entities/ObstacleView';
import { Particles } from './entities/Particles';
import { ClientEngine } from '../core/ClientEngine';

interface SceneProps {
  serverState: any;
  socketId: string;
  engine: ClientEngine;
  explosions?: { id: string, x: number, z: number }[];
}

export const Scene: React.FC<SceneProps> = ({ serverState, socketId, engine, explosions = [] }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (serverState && socketId) {
      engine.update(delta, serverState, socketId, camera);
    }
  });

  if (!serverState) return null;

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[50, 50, 50]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[100, 100, '#334155', '#334155']} position={[0, 0.01, 0]} />

      {/* Obstacles */}
      {serverState.obstacles && serverState.obstacles.map((obs: any) => (
        <ObstacleView key={obs.id} data={obs} />
      ))}

      {/* Players */}
      {Object.values(serverState.players).map((p: any) => (
        <TankView 
          key={p.id} 
          id={p.id} 
          data={p} 
          isLocal={p.id === socketId} 
          localState={p.id === socketId ? engine.localState : undefined} 
        />
      ))}

      {/* Bots */}
      {Object.values(serverState.bots).map((b: any) => (
        <TankView key={b.id} id={b.id} data={b} />
      ))}

      {/* Bullets */}
      {Object.values(serverState.bullets)
        .filter((b: any) => b.ownerId !== socketId)
        .map((b: any) => (
          <BulletView key={b.id} data={b} />
      ))}
      {engine.localBullets.map((b: any) => (
        <BulletView key={b.id} data={b} />
      ))}

      {/* Particles */}
      <Particles explosions={explosions} />
    </>
  );
};
