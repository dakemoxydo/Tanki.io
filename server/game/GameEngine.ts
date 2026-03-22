import { Player } from './entities/Player.js';
import { Bot } from './entities/Bot.js';
import { Bullet } from './entities/Bullet.js';
import { Obstacle } from './entities/Obstacle.js';
import { checkCollision } from '../../shared/physics.js';
import { BULLET_LIFETIME, TANK_RADIUS, BULLET_RADIUS } from '../../shared/constants.js';

export class GameEngine {
  players: Record<string, Player> = {};
  bots: Record<string, Bot> = {};
  bullets: Record<string, Bullet> = {};
  obstacles: Obstacle[] = [];
  onStateUpdate: (state: any) => void = () => {};
  onEvent: (event: string, data: any) => void = () => {};

  constructor() {
    this.initObstacles();
  }

  initObstacles() {
    this.obstacles = [
      new Obstacle('obs1', 10, 10, 4, 4),
      new Obstacle('obs2', -10, -10, 4, 4),
      new Obstacle('obs3', -10, 10, 4, 4),
      new Obstacle('obs4', 10, -10, 4, 4),
      new Obstacle('obs5', 0, 0, 6, 6),
      new Obstacle('wall1', 0, 20, 20, 2),
      new Obstacle('wall2', 0, -20, 20, 2),
    ];
  }

  addPlayer(id: string, name: string, color: string) {
    let x = 0, z = 0;
    do {
      x = Math.random() * 40 - 20;
      z = Math.random() * 40 - 20;
    } while (checkCollision(x, z, TANK_RADIUS, this.obstacles));
    this.players[id] = new Player(id, name, x, z, color);
  }

  removePlayer(id: string) {
    delete this.players[id];
  }

  movePlayer(id: string, x: number, z: number, rotation: number, turretRotation: number) {
    const p = this.players[id];
    if (p) {
      const canMoveX = !checkCollision(x, p.z, TANK_RADIUS, this.obstacles);
      const canMoveZ = !checkCollision(p.x, z, TANK_RADIUS, this.obstacles);

      if (canMoveX) p.x = x;
      if (canMoveZ) p.z = z;
      
      p.rotation = rotation;
      p.turretRotation = turretRotation;
    }
  }

  addBullet(ownerId: string, x: number, z: number, vx: number, vz: number) {
    const id = Math.random().toString(36).substring(7);
    const bullet = new Bullet(id, ownerId, x, z, vx, vz);
    this.bullets[id] = bullet;
    this.onEvent('bulletFired', bullet.serialize());
  }

  handleHit(targetId: string, bulletId: string, damage: number, shooterId: string) {
    if (this.bullets[bulletId]) {
      delete this.bullets[bulletId];
      this.onEvent('bulletDestroyed', bulletId);
    }

    const target = this.players[targetId] || this.bots[targetId];
    if (target) {
      target.health -= damage;
      if (target.health <= 0) {
        const killer = this.players[shooterId] || this.bots[shooterId];
        if (killer) killer.score += 1;
        
        this.onEvent(target.isBot ? 'botKilled' : 'playerKilled', { victimId: targetId, killerId: shooterId });
        
        target.health = 100;
        do {
          target.x = Math.random() * 40 - 20;
          target.z = Math.random() * 40 - 20;
        } while (checkCollision(target.x, target.z, TANK_RADIUS, this.obstacles));
      }
    }
  }

  addBot() {
    const id = 'bot_' + Math.random().toString(36).substring(7);
    let x = 0, z = 0;
    do {
      x = Math.random() * 40 - 20;
      z = Math.random() * 40 - 20;
    } while (checkCollision(x, z, TANK_RADIUS, this.obstacles));
    this.bots[id] = new Bot(id, x, z);
    return id;
  }

  clearBots() {
    this.bots = {};
  }

  update() {
    const now = Date.now();
    
    // Update bullets
    for (const id in this.bullets) {
      const b = this.bullets[id];
      b.x += b.vx;
      b.z += b.vz;
      
      if (checkCollision(b.x, b.z, BULLET_RADIUS, this.obstacles)) {
        delete this.bullets[id];
        this.onEvent('bulletDestroyed', id);
        continue;
      }

      let hit = false;
      for (const pid in this.players) {
        if (pid !== b.ownerId) {
          const p = this.players[pid];
          const dist = Math.hypot(p.x - b.x, p.z - b.z);
          if (dist < TANK_RADIUS + BULLET_RADIUS) {
            this.handleHit(pid, id, 25, b.ownerId);
            hit = true;
            break;
          }
        }
      }

      if (hit) continue;

      for (const bid in this.bots) {
        if (bid !== b.ownerId) {
          const bot = this.bots[bid];
          const dist = Math.hypot(bot.x - b.x, bot.z - b.z);
          if (dist < TANK_RADIUS + BULLET_RADIUS) {
            this.handleHit(bid, id, 25, b.ownerId);
            hit = true;
            break;
          }
        }
      }

      if (hit) continue;

      if (now - b.createdAt > BULLET_LIFETIME) {
        delete this.bullets[id];
        this.onEvent('bulletDestroyed', id);
      }
    }

    // Update bots
    for (const id in this.bots) {
      const bot = this.bots[id];
      let nearestDist = Infinity;
      let nearestPlayer = null;
      for (const pid in this.players) {
        const p = this.players[pid];
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
        
        const nextX = bot.x + Math.sin(angle) * 0.05;
        const nextZ = bot.z + Math.cos(angle) * 0.05;
        
        const canMoveX = !checkCollision(nextX, bot.z, TANK_RADIUS, this.obstacles);
        const canMoveZ = !checkCollision(bot.x, nextZ, TANK_RADIUS, this.obstacles);

        if (canMoveX) bot.x = nextX;
        if (canMoveZ) bot.z = nextZ;

        if (Math.random() < 0.02) {
          const spawnX = bot.x + Math.sin(angle) * 2.3;
          const spawnZ = bot.z + Math.cos(angle) * 2.3;
          this.addBullet(id, spawnX, spawnZ, Math.sin(angle) * 1.0, Math.cos(angle) * 1.0);
        }
      }
    }

    this.onStateUpdate(this.serializeState());
  }

  serializeState() {
    const state: any = { players: {}, bots: {}, bullets: {} };
    for (const id in this.players) state.players[id] = this.players[id].serialize();
    for (const id in this.bots) state.bots[id] = this.bots[id].serialize();
    for (const id in this.bullets) state.bullets[id] = this.bullets[id].serialize();
    return state;
  }
}
