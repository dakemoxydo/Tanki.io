import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameSyncStore } from '../../../store/gameSyncStore';
import { ClientEngine } from '../../core/ClientEngine';

interface TankViewProps {
  id: string;
  isLocal?: boolean;
  localState?: any;
  isBot?: boolean;
  engine?: ClientEngine;
}

export const TankView: React.FC<TankViewProps> = ({ id, isLocal, localState, isBot, engine }) => {
  const groupRef = useRef<THREE.Group>(null);
  const hullRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);

  const p = useGameSyncStore(state => isBot ? state.gameState?.bots?.[id] : state.gameState?.players?.[id]);

  const staticData = useMemo(() => {
    return p ? { name: p.name, color: p.color, isVisible: p.isVisible } : null;
  }, [p?.name, p?.color, p?.isVisible]);

  const health = p ? p.health : 0;

  useFrame(() => {
    if (!groupRef.current || !hullRef.current || !turretRef.current) return;

    if (isLocal && localState && localState.initialized) {
      groupRef.current.position.set(localState.x, 0, localState.z);
      hullRef.current.rotation.y = localState.rotation;
      turretRef.current.rotation.y = localState.turretRotation;
    } else if (engine) {
      const data = isBot ? engine.renderState.bots?.[id] : engine.renderState.players?.[id];
      if (data) {
        groupRef.current.position.set(data.x, 0, data.z);
        hullRef.current.rotation.y = data.rotation;
        turretRef.current.rotation.y = data.turretRotation;
      }
    }

    // Keep turret attached to hull with an offset
    const hullRot = hullRef.current.rotation.y;
    turretRef.current.position.set(
      Math.sin(hullRot) * 0.2,
      1.2,
      Math.cos(hullRot) * 0.2
    );
  });

  if (!staticData) return null;

  return (
    <group ref={groupRef} visible={staticData.isVisible !== false}>
      {/* Hull */}
      <group ref={hullRef}>
        {/* Left Track */}
        <mesh position={[-0.9, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.8, 3.2]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
        {/* Right Track */}
        <mesh position={[0.9, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.8, 3.2]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
        
        {/* Main Body */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.8, 3]} />
          <meshStandardMaterial color={staticData.color || '#4ade80'} roughness={0.7} metalness={0.2} />
        </mesh>
        
        {/* Engine Deck (Back) */}
        <mesh position={[0, 0.9, -1]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.2, 0.8]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
      </group>

      {/* Turret */}
      <group ref={turretRef} position={[0, 1.2, 0.2]}>
        {/* Turret Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.6, 1.4]} />
          <meshStandardMaterial color={staticData.color || '#4ade80'} roughness={0.6} metalness={0.3} />
        </mesh>
        
        {/* Hatch */}
        <mesh position={[0, 0.31, -0.3]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
          <meshStandardMaterial color="#374151" />
        </mesh>

        {/* Barrel */}
        <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 1.8, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.5} />
        </mesh>
        
        {/* Muzzle Brake */}
        <mesh position={[0, 0, 2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        {/* Laser Sight for local player */}
        {isLocal && (
          <mesh position={[0, 0, 25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 50]} />
            <meshBasicMaterial color="red" transparent opacity={0.15} />
          </mesh>
        )}
      </group>

      {/* Name and Health */}
      <Billboard position={[0, 2.8, 0]}>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="black"
          fontWeight="bold"
        >
          {staticData.name}
        </Text>
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[-1 + (Math.max(0, health) / 100), 0, 0.01]}>
            <planeGeometry args={[2 * (Math.max(0, health) / 100), 0.2]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
            fontWeight="bold"
          >
            {Math.max(0, Math.round(health))} / 100
          </Text>
        </group>
      </Billboard>
    </group>
  );
};
