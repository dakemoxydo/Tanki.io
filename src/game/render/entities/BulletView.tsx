import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BulletViewProps {
  data: any;
}

export const BulletView: React.FC<BulletViewProps> = ({ data }) => {
  const ref = useRef<THREE.Mesh>(null);
  const initialized = useRef(false);

  useFrame((state, delta) => {
    if (ref.current) {
      if (!initialized.current) {
        ref.current.position.set(data.x, 1.2, data.z);
        initialized.current = true;
      } else {
        ref.current.position.lerp(new THREE.Vector3(data.x, 1.2, data.z), 30 * delta);
      }
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.2]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
    </mesh>
  );
};
