import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useGameSyncStore } from '../../../store/gameSyncStore';

interface TankViewProps {
  id: string;
  isLocal?: boolean;
  localState?: any;
  isBot?: boolean;
}

export const TankView: React.FC<TankViewProps> = ({ id, isLocal, localState, isBot }) => {
  const groupRef = useRef<THREE.Group>(null);
  const hullRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);

  const initialized = useRef(false);
  const stateBuffer = useRef<{time: number, x: number, z: number, rot: number, tRot: number}[]>([]);

  // Only re-render when these specific properties change
  const staticData = useGameSyncStore(useShallow(state => {
    const p = isBot ? state.gameState?.bots?.[id] : state.gameState?.players?.[id];
    return p ? { name: p.name, color: p.color, isVisible: p.isVisible } : null;
  }));

  const health = useGameSyncStore(state => {
    const p = isBot ? state.gameState?.bots?.[id] : state.gameState?.players?.[id];
    return p ? p.health : 0;
  });

  useFrame((state, delta) => {
    if (!groupRef.current || !hullRef.current || !turretRef.current) return;

    if (isLocal && localState && localState.initialized) {
      groupRef.current.position.set(localState.x, 0, localState.z);
      hullRef.current.rotation.y = localState.rotation;
      turretRef.current.rotation.y = localState.turretRotation;
      initialized.current = true;
    } else {
      // Read current position from store without triggering re-render
      const serverState = useGameSyncStore.getState().gameState;
      const data = isBot ? serverState?.bots?.[id] : serverState?.players?.[id];
      
      if (!data) return;

      if (!initialized.current) {
        groupRef.current.position.set(data.x, 0, data.z);
        hullRef.current.rotation.y = data.rotation;
        turretRef.current.rotation.y = data.turretRotation;
        initialized.current = true;
      } else {
        // Snapshot Interpolation
        const lastState = stateBuffer.current[stateBuffer.current.length - 1];
        if (!lastState || lastState.x !== data.x || lastState.z !== data.z || lastState.rot !== data.rotation || lastState.tRot !== data.turretRotation) {
          stateBuffer.current.push({
            time: Date.now(),
            x: data.x,
            z: data.z,
            rot: data.rotation,
            tRot: data.turretRotation
          });
          if (stateBuffer.current.length > 10) {
            stateBuffer.current.shift();
          }
        }

        let targetX = data.x;
        let targetZ = data.z;
        let targetRot = data.rotation;
        let targetTRot = data.turretRotation;

        const renderTime = Date.now() - 100; // 100ms interpolation delay
        
        let s0, s1;
        for (let i = stateBuffer.current.length - 1; i >= 0; i--) {
          if (stateBuffer.current[i].time <= renderTime) {
            s0 = stateBuffer.current[i];
            s1 = stateBuffer.current[i + 1];
            break;
          }
        }

        if (s0 && s1) {
          const t = Math.max(0, Math.min(1, (renderTime - s0.time) / (s1.time - s0.time)));
          targetX = s0.x + (s1.x - s0.x) * t;
          targetZ = s0.z + (s1.z - s0.z) * t;
          
          let rotDiff = s1.rot - s0.rot;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          targetRot = s0.rot + rotDiff * t;

          let tRotDiff = s1.tRot - s0.tRot;
          while (tRotDiff < -Math.PI) tRotDiff += Math.PI * 2;
          while (tRotDiff > Math.PI) tRotDiff -= Math.PI * 2;
          targetTRot = s0.tRot + tRotDiff * t;
        } else if (s0) {
          targetX = s0.x;
          targetZ = s0.z;
          targetRot = s0.rot;
          targetTRot = s0.tRot;
        }

        const targetPos = new THREE.Vector3(targetX, 0, targetZ);
        groupRef.current.position.copy(targetPos);
        
        hullRef.current.rotation.y = targetRot;
        turretRef.current.rotation.y = targetTRot;
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
