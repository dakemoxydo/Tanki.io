import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky, Environment } from '@react-three/drei';
import { EntityManager } from './entities/EntityManager';
import { Particles } from './entities/Particles';
import { ClientEngine } from '../core/ClientEngine';
import { useGameSyncStore } from '../../store/gameSyncStore';
import { HitEffect } from './effects/HitEffect';

interface SceneProps {
  socketId: string;
  engine: ClientEngine;
  explosions?: { id: string, x: number, z: number }[];
  effects: { id: string, x: number, z: number }[];
  removeEffect: (id: string) => void;
}

export const Scene: React.FC<SceneProps> = ({ socketId, engine, explosions = [], effects, removeEffect }) => {
  const { camera } = useThree();

  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const serverState = useGameSyncStore.getState().gameState;
    if (serverState && socketId) {
      engine.update(delta, serverState, socketId);
      
      if (engine.cameraTarget && engine.cameraLookAt) {
        const targetPos = new THREE.Vector3(engine.cameraTarget.x, engine.cameraTarget.y, engine.cameraTarget.z);
        const lookAtPos = new THREE.Vector3(engine.cameraLookAt.x, engine.cameraLookAt.y, engine.cameraLookAt.z);
        
        camera.position.lerp(targetPos, 15 * delta);
        currentLookAt.current.lerp(lookAtPos, 15 * delta);
        camera.lookAt(currentLookAt.current);
      }
    }
  });

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

      {/* Game Entities - Managed by EntityManager */}
      <EntityManager socketId={socketId} engine={engine} />

      {/* Particles */}
      <Particles explosions={explosions} />

      {/* Effects */}
      {effects.map((effect) => (
        <HitEffect 
          key={effect.id} 
          x={effect.x} 
          z={effect.z} 
          onComplete={() => removeEffect(effect.id)} 
        />
      ))}
    </>
  );
};
