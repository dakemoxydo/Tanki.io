import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const HitEffect = ({ x, z, onComplete }: { x: number, z: number, onComplete: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const duration = 0.5;
  const elapsed = useRef(0);

  useFrame((state, delta) => {
    elapsed.current += delta;
    if (elapsed.current >= duration) {
      onComplete();
      return;
    }
    const scale = 1 - (elapsed.current / duration);
    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[x, 0.5, z]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="yellow" transparent opacity={0.8} />
    </mesh>
  );
};
