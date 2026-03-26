import { ObstacleData } from './types.js';

export const checkCollision = (x: number, z: number, radius: number, obstacles: ObstacleData[]) => {
  for (const obs of obstacles) {
    const halfWidth = obs.width / 2;
    const halfDepth = obs.depth / 2;
    
    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(obs.x - halfWidth, Math.min(x, obs.x + halfWidth));
    const closestZ = Math.max(obs.z - halfDepth, Math.min(z, obs.z + halfDepth));
    
    // Calculate the distance between the circle's center and this closest point
    const distanceX = x - closestX;
    const distanceZ = z - closestZ;
    
    // If the distance is less than the circle's radius, an intersection occurs
    if ((distanceX * distanceX + distanceZ * distanceZ) < (radius * radius)) {
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

  // Early out: check if line segment's AABB intersects the rect's AABB
  const lineMinX = Math.min(x1, x2);
  const lineMaxX = Math.max(x1, x2);
  const lineMinZ = Math.min(z1, z2);
  const lineMaxZ = Math.max(z1, z2);

  if (lineMaxX < minX || lineMinX > maxX || lineMaxZ < minZ || lineMinZ > maxZ) {
    return false;
  }

  // Check if either end point is inside the rect
  if (x1 >= minX && x1 <= maxX && z1 >= minZ && z1 <= maxZ) return true;
  if (x2 >= minX && x2 <= maxX && z2 >= minZ && z2 <= maxZ) return true;

  // Ray-AABB intersection (Liang-Barsky algorithm)
  const dx = x2 - x1;
  const dz = z2 - z1;

  let t0 = 0;
  let t1 = 1;

  const p = [-dx, dx, -dz, dz];
  const q = [x1 - minX, maxX - x1, z1 - minZ, maxZ - z1];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }

  return t0 <= t1;
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
