import { BulletPool } from './BulletPool.js';
import { Obstacle } from '../../shared/entities/Obstacle.js';
import { Tank } from '../../shared/entities/Tank.js';
import { checkLineCircleCollision, checkLineRectCollision } from '../../shared/physics.js';
import { BULLET_LIFETIME, TANK_RADIUS, BULLET_RADIUS } from '../../shared/constants.js';
import { SpatialGrid } from '../../shared/SpatialGrid.js';

export class BulletManager {
  private pool: BulletPool;
  private onEvent: (event: string, data: any) => void;
  private onHit: (targetId: string, bulletId: string, damage: number, shooterId: string) => void;

  constructor(pool: BulletPool, onEvent: (event: string, data: any) => void, onHit: (targetId: string, bulletId: string, damage: number, shooterId: string) => void) {
    this.pool = pool;
    this.onEvent = onEvent;
    this.onHit = onHit;
  }

  addBullet(ownerId: string, x: number, z: number, vx: number, vz: number) {
    const id = Math.random().toString(36).substring(7);
    const bullet = this.pool.get(id, ownerId, x, z, vx, vz);
    this.onEvent('bulletFired', bullet.serialize());
  }

  update(delta: number, obstacles: Obstacle[], tankGrid: SpatialGrid<Tank>) {
    const now = Date.now();
    this.pool.getActive().forEach((b, id) => {
      const oldX = b.x;
      const oldZ = b.z;
      b.x += b.vx * 30 * delta;
      b.z += b.vz * 30 * delta;
      
      // Check obstacle collisions
      let hitObstacle = false;
      for (const obs of obstacles) {
        if (checkLineRectCollision(oldX, oldZ, b.x, b.z, obs.x, obs.z, obs.width, obs.depth, BULLET_RADIUS)) {
          hitObstacle = true;
          break;
        }
      }

      if (hitObstacle) {
        this.pool.release(id);
        this.onEvent('bulletDestroyed', id);
        return;
      }

      // Check tank collisions using SpatialGrid
      const nearbyTanks = tankGrid.getNearby(b.x, b.z, TANK_RADIUS + BULLET_RADIUS);
      let hit = false;
      for (const tank of nearbyTanks) {
        if (tank.id !== b.ownerId && !tank.isDead) {
          if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, tank.x, tank.z, TANK_RADIUS + BULLET_RADIUS)) {
            this.onHit(tank.id, id, 25, b.ownerId);
            hit = true;
            break;
          }
        }
      }

      if (hit) return;

      // Lifetime check
      if (now - b.createdAt > BULLET_LIFETIME) {
        this.pool.release(id);
        this.onEvent('bulletDestroyed', id);
      }
    });
  }
}
