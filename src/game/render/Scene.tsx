import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky, Environment } from '@react-three/drei';
import { EntityManager } from './entities/EntityManager';
import { Particles } from './entities/Particles';
import { ClientEngine } from '../core/ClientEngine';
import { useGameSyncStore } from '../../store/gameSyncStore';

interface SceneProps {
  socketId: string;
  engine: ClientEngine;
  explosions?: { id: string, x: number, z: number }[];
}

export const Scene: React.FC<SceneProps> = ({ socketId, engine, explosions = [] }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    const serverState = useGameSyncStore.getState().gameState;
    if (serverState && socketId) {
      engine.update(delta, serverState, socketId);
      
      if (engine.cameraTarget && engine.cameraLookAt) {
        camera.position.lerp(
          new THREE.Vector3(engine.cameraTarget.x, engine.cameraTarget.y, engine.cameraTarget.z),
          15 * delta
        );
        camera.lookAt(engine.cameraLookAt.x, engine.cameraLookAt.y, engine.cameraLookAt.z);
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
    </>
  );
};
