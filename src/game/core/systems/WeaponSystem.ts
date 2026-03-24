import { checkLineCircleCollision, checkLineRectCollision } from '../../../../shared/physics';
import { TANK_RADIUS } from '../../../../shared/constants';
import { LocalBullet } from '../ClientEngine';

export class WeaponSystem {
  static updateBullets(localBullets: LocalBullet[], delta: number, obstacles: any[], players: any, bots: any, socketId: string) {
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
          if (checkLineRectCollision(oldX, oldZ, b.x, b.z, obs.x, obs.z, obs.width, obs.depth, 0.2)) {
            hitObstacle = true;
            break;
          }
        }
      }
      if (hitObstacle) {
        b.active = false;
        continue;
      }
      
      let hitPlayer = false;
      for (const pid in players) {
        if (pid !== socketId) {
          const p = players[pid];
          if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, p.x, p.z, TANK_RADIUS + 0.2)) hitPlayer = true;
        }
      }
      for (const bid in bots) {
        const p = bots[bid];
        if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, p.x, p.z, TANK_RADIUS + 0.2)) hitPlayer = true;
      }
      if (hitPlayer || currentTime - b.createdAt >= 3000) {
        b.active = false;
      }
    }
    return localBullets;
  }
}
