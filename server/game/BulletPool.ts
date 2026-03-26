import { Bullet } from '../../shared/entities/Bullet.js';

export class BulletPool {
  private pool: Bullet[] = [];
  private activeBullets: Map<string, Bullet> = new Map();

  get(id: string, ownerId: string, x: number, z: number, vx: number, vz: number): Bullet {
    let bullet: Bullet;
    if (this.pool.length > 0) {
      bullet = this.pool.pop()!;
      bullet.id = id;
      bullet.ownerId = ownerId;
      bullet.x = x;
      bullet.z = z;
      bullet.vx = vx;
      bullet.vz = vz;
      bullet.createdAt = Date.now();
    } else {
      bullet = new Bullet(id, ownerId, x, z, vx, vz);
    }
    this.activeBullets.set(id, bullet);
    return bullet;
  }

  release(id: string) {
    const bullet = this.activeBullets.get(id);
    if (bullet) {
      this.activeBullets.delete(id);
      this.pool.push(bullet);
    }
  }

  getActive(): Map<string, Bullet> {
    return this.activeBullets;
  }

  clear() {
    this.activeBullets.clear();
    this.pool = [];
  }
}
