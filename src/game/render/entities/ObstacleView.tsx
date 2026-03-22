import React from 'react';

interface ObstacleViewProps {
  data: any;
}

export const ObstacleView: React.FC<ObstacleViewProps> = ({ data }) => {
  return (
    <mesh position={[data.x, 2, data.z]} castShadow receiveShadow>
      <boxGeometry args={[data.width, 4, data.depth]} />
      <meshStandardMaterial color="#475569" />
    </mesh>
  );
};
