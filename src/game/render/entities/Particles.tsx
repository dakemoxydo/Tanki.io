import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ParticlesProps {
  explosions: { id: string, x: number, z: number }[];
}

export const Particles: React.FC<ParticlesProps> = ({ explosions }) => {
  const particlesRef = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  const processedExplosions = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (explosions.length === 0) {
      processedExplosions.current.clear();
      return;
    }
    
    const newParticles: Particle[] = [];
    explosions.forEach(exp => {
      if (processedExplosions.current.has(exp.id)) return;
      processedExplosions.current.add(exp.id);
      
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: Math.random(),
          position: new THREE.Vector3(exp.x, 1.5, exp.z),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 10,
            (Math.random() - 0.5) * 10
          ),
          life: 0,
          maxLife: 0.5 + Math.random() * 0.5
        });
      }
    });

    particlesRef.current.push(...newParticles);
  }, [explosions]);

  useFrame((state, delta) => {
    if (!meshRef.current || particlesRef.current.length === 0) return;

    let aliveParticles = [];
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      p.life += delta;
      
      if (p.life < p.maxLife) {
        p.velocity.y -= 20 * delta; // gravity
        p.position.addScaledVector(p.velocity, delta);
        
        const scale = 1 - (p.life / p.maxLife);
        dummy.position.copy(p.position);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(aliveParticles.length, dummy.matrix);
        aliveParticles.push(p);
      }
    }

    meshRef.current.count = aliveParticles.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
    particlesRef.current = aliveParticles;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 500]} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
    </instancedMesh>
  );
};
