import { Bot } from './entities/Bot.js';
import { Player } from './entities/Player.js';
import { Obstacle } from './entities/Obstacle.js';
import { checkCollision } from '../../shared/physics.js';
import { TANK_RADIUS } from '../../shared/constants.js';

export class BotController {
  private bots: Record<string, Bot>;
  private obstacles: Obstacle[];
  private onFire: (ownerId: string, x: number, z: number, vx: number, vz: number) => void;

  constructor(bots: Record<string, Bot>, obstacles: Obstacle[], onFire: (ownerId: string, x: number, z: number, vx: number, vz: number) => void) {
    this.bots = bots;
    this.obstacles = obstacles;
    this.onFire = onFire;
  }

  update(delta: number, players: Record<string, Player>) {
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
      for (const pid in players) {
        const p = players[pid];
        if (p.isDead) continue;
        const dist = Math.hypot(p.x - bot.x, p.z - bot.z);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestPlayer = p;
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
          this.onFire(id, spawnX, spawnZ, Math.sin(angle) * 1.0, Math.cos(angle) * 1.0);
        }
      }
    }
  }
}
