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

export const checkLineRectCollision = (x1: number, z1: number, x2: number, z2: number, rectX: number, rectZ: number, width: number, depth: number, radius: number) => {
  const minX = rectX - width / 2 - radius;
  const maxX = rectX + width / 2 + radius;
  const minZ = rectZ - depth / 2 - radius;
  const maxZ = rectZ + depth / 2 + radius;

  // Check if either end point is inside the rect
  if (x1 >= minX && x1 <= maxX && z1 >= minZ && z1 <= maxZ) return true;
  if (x2 >= minX && x2 <= maxX && z2 >= minZ && z2 <= maxZ) return true;

  // Check intersection with each of the 4 edges of the AABB
  const checkLineIntersection = (x3: number, z3: number, x4: number, z4: number) => {
    const den = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
    if (den === 0) return false;
    
    const t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (z1 - z3) - (z1 - z2) * (x1 - x3)) / den;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  return checkLineIntersection(minX, minZ, maxX, minZ) || // Top edge
         checkLineIntersection(maxX, minZ, maxX, maxZ) || // Right edge
         checkLineIntersection(maxX, maxZ, minX, maxZ) || // Bottom edge
         checkLineIntersection(minX, maxZ, minX, minZ);   // Left edge
};

export const checkLineCircleCollision = (x1: number, z1: number, x2: number, z2: number, cx: number, cz: number, radius: number) => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const fx = cx - x1;
  const fz = cz - z1;
  
  const dLenSq = dx * dx + dz * dz;
  if (dLenSq === 0) return Math.hypot(fx, fz) < radius;
  
  const t = Math.max(0, Math.min(1, (fx * dx + fz * dz) / dLenSq));
  const nearestX = x1 + t * dx;
  const nearestZ = z1 + t * dz;
  
  const distSq = (nearestX - cx) ** 2 + (nearestZ - cz) ** 2;
  return distSq < radius * radius;
};
