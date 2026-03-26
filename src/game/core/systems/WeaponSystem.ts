import { checkLineCircleCollision, checkLineRectCollision } from '../../../../shared/physics';
import { TANK_RADIUS, BULLET_RADIUS, BULLET_LIFETIME } from '../../../../shared/constants';
import { LocalBullet } from '../ClientEngine';
import { Obstacle } from '../../../../shared/entities/Obstacle';
import { Tank } from '../../../../shared/entities/Tank';

export class WeaponSystem {
  static updateBullets(localBullets: LocalBullet[], delta: number, obstacles: Obstacle[], players: Record<string, Tank>, bots: Record<string, Tank>, socketId: string, pendingEffects: { x: number, z: number }[], pendingExplosions: { x: number, z: number }[]) {
    const currentTime = Date.now();
    for (let i = 0; i < localBullets.length; i++) {
      const b = localBullets[i];
      if (!b.active) continue;

      const oldX = b.x;
      const oldZ = b.z;
      b.x += b.vx * 30 * delta;
      b.z += b.vz * 30 * delta;
      
      let hitObstacle = false;
      if (obstacles) {
        for (const obs of obstacles) {
          if (checkLineRectCollision(oldX, oldZ, b.x, b.z, obs.x, obs.z, obs.width, obs.depth, BULLET_RADIUS)) {
            hitObstacle = true;
            break;
          }
        }
      }
      if (hitObstacle) {
        b.active = false;
        pendingEffects.push({ x: b.x, z: b.z });
        pendingExplosions.push({ x: b.x, z: b.z });
        continue;
      }
      
      let hitPlayer = false;
      for (const pid in players) {
        if (pid !== socketId) {
          const p = players[pid];
          if (p.isDead || !p.isVisible) continue;
          if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, p.x, p.z, TANK_RADIUS + BULLET_RADIUS)) hitPlayer = true;
        }
      }
      for (const bid in bots) {
        const p = bots[bid];
        if (p.isDead || !p.isVisible) continue;
        if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, p.x, p.z, TANK_RADIUS + BULLET_RADIUS)) hitPlayer = true;
      }
      if (hitPlayer || currentTime - b.createdAt >= BULLET_LIFETIME) {
        b.active = false;
        if (hitPlayer) {
            pendingEffects.push({ x: b.x, z: b.z });
            pendingExplosions.push({ x: b.x, z: b.z });
        }
      }
    }
    return localBullets;
  }
}
