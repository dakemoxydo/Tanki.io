import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ObstacleData } from '../../../../shared/types';

interface ObstacleInstancedViewProps {
  obstacles: ObstacleData[];
}

const tempObject = new THREE.Object3D();

export const ObstacleInstancedView: React.FC<ObstacleInstancedViewProps> = ({ obstacles }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // We only need to update the matrices once if obstacles are static
  // But since they come from serverState which might change (initially), 
  // we can update them when the obstacles array changes.
  useEffect(() => {
    if (!meshRef.current) return;

    obstacles.forEach((obs, i) => {
      tempObject.position.set(obs.x, 2, obs.z);
      tempObject.scale.set(obs.width, 4, obs.depth);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.count = obstacles.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [obstacles]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 500]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#475569" roughness={0.8} metalness={0.2} />
    </instancedMesh>
  );
};
