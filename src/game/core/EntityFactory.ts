import { LocalPlayer } from './entities/LocalPlayer';
import { Tank } from '../../../shared/entities/Tank';
import { Bullet } from '../../../shared/entities/Bullet';
import { Obstacle } from '../../../shared/entities/Obstacle';

export class EntityFactory {
  static createLocalPlayer(id: string, x: number, z: number): LocalPlayer {
    return new LocalPlayer(id, x, z);
  }

  static createRemotePlayer(id: string, x: number, z: number, color: string, name: string): Tank {
    return new Tank(id, name, x, z, false, color);
  }

  static createBullet(id: string, x: number, z: number, vx: number, vz: number, ownerId: string): Bullet {
    return new Bullet(id, ownerId, x, z, vx, vz);
  }

  static createObstacle(id: string, x: number, z: number, width: number, depth: number): Obstacle {
    return new Obstacle(id, x, z, width, depth);
  }
}
