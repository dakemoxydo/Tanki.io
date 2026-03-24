import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameSyncStore } from '../../../store/gameSyncStore';
import { ClientEngine } from '../../core/ClientEngine';
import { BulletData } from '../../../../shared/types';

interface BulletInstancedViewProps {
  socketId: string;
  engine: ClientEngine;
  color?: string;
}

const tempObject = new THREE.Object3D();

export const BulletInstancedView: React.FC<BulletInstancedViewProps> = ({ socketId, engine, color = '#facc15' }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    const serverState = useGameSyncStore.getState().gameState;
    if (!serverState) return;

    const serverBullets = serverState.bullets ? Object.values(serverState.bullets)
      .filter((b: any) => b.ownerId !== socketId) : [];
    
    const activeLocalBullets = engine.localBullets.filter(b => b.active);
    const allBullets = [...serverBullets, ...activeLocalBullets] as any[];

    allBullets.forEach((bullet, i) => {
      tempObject.position.set(bullet.x, 0.5, bullet.z);
      
      // Calculate rotation based on velocity if available
      if (bullet.vx !== 0 || bullet.vz !== 0) {
        tempObject.rotation.y = Math.atan2(bullet.vx, bullet.vz);
      }
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.count = allBullets.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 1000]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2} 
        roughness={0.3} 
        metalness={0.8} 
      />
    </instancedMesh>
  );
};
