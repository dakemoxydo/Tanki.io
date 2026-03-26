import { Bot } from './entities/Bot.js';
import { Obstacle } from '../../shared/entities/Obstacle.js';
import { Tank } from '../../shared/entities/Tank.js';
import { checkCollision } from '../../shared/physics.js';
import { TANK_RADIUS, BULLET_SPEED } from '../../shared/constants.js';
import { SpatialGrid } from '../../shared/SpatialGrid.js';

export class BotController {
  private bots: Record<string, Bot>;
  private obstacles: Obstacle[];
  private onFire: (ownerId: string, x: number, z: number, vx: number, vz: number) => void;

  constructor(bots: Record<string, Bot>, obstacles: Obstacle[], onFire: (ownerId: string, x: number, z: number, vx: number, vz: number) => void) {
    this.bots = bots;
    this.obstacles = obstacles;
    this.onFire = onFire;
  }

  update(delta: number, tankGrid: SpatialGrid<Tank>) {
    const now = Date.now();
    for (const id in this.bots) {
      const bot = this.bots[id];
      if (bot.isDead) {
        if (now - bot.deathTime > 5000) {
          bot.isDead = false;
          bot.isVisible = true;
          bot.health = 100;
          do {
            bot.x = Math.random() * 40 - 20;
            bot.z = Math.random() * 40 - 20;
          } while (checkCollision(bot.x, bot.z, TANK_RADIUS, this.obstacles));
        }
        continue;
      }
      
      let nearestDist = Infinity;
      let nearestPlayer = null;
      
      // Use SpatialGrid to find nearby tanks (players)
      const nearbyTanks = tankGrid.getNearby(bot.x, bot.z, 20);
      for (const tank of nearbyTanks) {
        if (tank.id !== bot.id && !tank.isDead && !tank.isBot) {
          const dist = Math.hypot(tank.x - bot.x, tank.z - bot.z);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestPlayer = tank;
          }
        }
      }

      if (nearestPlayer && nearestDist < 20) {
        const angle = Math.atan2(nearestPlayer.x - bot.x, nearestPlayer.z - bot.z);
        bot.rotation = angle;
        bot.turretRotation = angle;
        
        const nextX = bot.x + Math.sin(angle) * 1.5 * delta;
        const nextZ = bot.z + Math.cos(angle) * 1.5 * delta;
        
        const canMoveX = !checkCollision(nextX, bot.z, TANK_RADIUS, this.obstacles);
        const canMoveZ = !checkCollision(bot.x, nextZ, TANK_RADIUS, this.obstacles);

        if (canMoveX) bot.x = nextX;
        if (canMoveZ) bot.z = nextZ;

        if (Math.random() < 0.6 * delta) {
          const spawnX = bot.x + Math.sin(angle) * 2.3;
          const spawnZ = bot.z + Math.cos(angle) * 2.3;
          this.onFire(id, spawnX, spawnZ, Math.sin(angle) * BULLET_SPEED, Math.cos(angle) * BULLET_SPEED);
        }
      }
    }
  }
}
