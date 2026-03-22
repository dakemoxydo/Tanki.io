import { ObstacleData } from './types.js';

export const checkCollision = (x: number, z: number, radius: number, obstacles: ObstacleData[]) => {
  for (const obs of obstacles) {
    const minX = obs.x - obs.width / 2 - radius;
    const maxX = obs.x + obs.width / 2 + radius;
    const minZ = obs.z - obs.depth / 2 - radius;
    const maxZ = obs.z + obs.depth / 2 + radius;
    
    if (x > minX && x < maxX && z > minZ && z < maxZ) {
      return true;
    }
  }
  return false;
};
