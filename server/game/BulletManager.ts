import { BulletPool } from './BulletPool.js';
import { Obstacle } from './entities/Obstacle.js';
import { Player } from './entities/Player.js';
import { Bot } from './entities/Bot.js';
import { checkLineCircleCollision, checkLineRectCollision } from '../../shared/physics.js';
import { BULLET_LIFETIME, TANK_RADIUS, BULLET_RADIUS } from '../../shared/constants.js';

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

  update(delta: number, obstacles: Obstacle[], players: Record<string, Player>, bots: Record<string, Bot>) {
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

      // Check player collisions
      let hit = false;
      for (const pid in players) {
        if (pid !== b.ownerId) {
          const p = players[pid];
          if (p.isDead) continue;
          
          if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, p.x, p.z, BULLET_RADIUS)) {
            this.onHit(pid, id, 25, b.ownerId);
            hit = true;
            break;
          }
        }
      }

      if (hit) return;

      // Check bot collisions
      for (const bid in bots) {
        if (bid !== b.ownerId) {
          const bot = bots[bid];
          if (bot.isDead) continue;
          
          if (checkLineCircleCollision(oldX, oldZ, b.x, b.z, bot.x, bot.z, BULLET_RADIUS)) {
            this.onHit(bid, id, 25, b.ownerId);
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
