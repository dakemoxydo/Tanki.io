import { Player } from './entities/Player.js';
import { Bot } from './entities/Bot.js';
import { Bullet } from '../../shared/entities/Bullet.js';
import { Obstacle } from '../../shared/entities/Obstacle.js';
import { BulletPool } from './BulletPool.js';
import { checkCollision } from '../../shared/physics.js';
import { TANK_RADIUS } from '../../shared/constants.js';
import { StatsService } from './StatsService.js';
import { BulletManager } from './BulletManager.js';
import { BotController } from './BotController.js';
import { SpatialGrid } from '../../shared/SpatialGrid.js';
import { Tank } from '../../shared/entities/Tank.js';

export class Room {
  id: string;
  maxPlayers: number;
  players: Record<string, Player> = {};
  bots: Record<string, Bot> = {};
  bulletPool: BulletPool = new BulletPool();
  obstacles: Obstacle[] = [];
  emptySince: number | null = null;
  onStateUpdate: (state: any) => void = () => {};
  onEvent: (event: string, data: any) => void = () => {};

  private bulletManager: BulletManager;
  private botController: BotController;
  private tankGrid: SpatialGrid<Tank> = new SpatialGrid(10);

  constructor(id: string, maxPlayers: number = 10) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.initObstacles();
    this.bulletManager = new BulletManager(this.bulletPool, (e, d) => this.onEvent(e, d), (t, b, d, s) => this.handleHit(t, b, d, s));
    this.botController = new BotController(this.bots, this.obstacles, (o, x, z, vx, vz) => this.addBullet(o, x, z, vx, vz));
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

  addPlayer(id: string, name: string, color: string, userId?: string) {
    let x = 0, z = 0;
    do {
      x = Math.random() * 40 - 20;
      z = Math.random() * 40 - 20;
    } while (checkCollision(x, z, TANK_RADIUS, this.obstacles));
    this.players[id] = new Player(id, name, x, z, color, userId);
  }

  removePlayer(id: string) {
    delete this.players[id];
  }

  movePlayer(id: string, x: number, z: number, rotation: number, turretRotation: number, sequence?: number, vx?: number, vz?: number) {
    const p = this.players[id];
    if (p && !p.isDead) {
      p.x = x;
      p.z = z;
      p.rotation = rotation;
      p.turretRotation = turretRotation;
      if (sequence !== undefined) {
        p.lastSequence = sequence;
      }
      if (vx !== undefined) p.vx = vx;
      if (vz !== undefined) p.vz = vz;
      p.lastActionTime = Date.now();
    }
  }

  addBullet(ownerId: string, x: number, z: number, vx: number, vz: number) {
    this.bulletManager.addBullet(ownerId, x, z, vx, vz);
    const p = this.players[ownerId];
    if (p) {
      p.lastActionTime = Date.now();
    }
  }

  handleHit(targetId: string, bulletId: string, damage: number, shooterId: string) {
    if (this.bulletPool.getActive().has(bulletId)) {
      this.bulletPool.release(bulletId);
      this.onEvent('bulletDestroyed', bulletId);
    }

    const target = this.players[targetId] || this.bots[targetId];
    if (target && !target.isDead) {
      target.health -= damage;
      if (target.health <= 0) {
        target.isDead = true;
        target.isVisible = false;
        target.deathTime = Date.now();
        
        const killer = this.players[shooterId] || this.bots[shooterId];
        if (killer) {
          killer.score += 1;
          killer.kills += 1;
        }
        target.deaths += 1;
        
        this.onEvent(target.isBot ? 'botKilled' : 'playerKilled', { 
          victimId: targetId, 
          victimName: target.name,
          killerId: shooterId,
          killerName: killer ? killer.name : 'Unknown'
        });

        // Update stats via StatsService
        if (!target.isBot && (target as Player).userId) {
          StatsService.incrementDeaths((target as Player).userId!);
        }
        if (killer && !killer.isBot && (killer as Player).userId) {
          StatsService.incrementKills((killer as Player).userId!);
        }
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

  update(delta: number) {
    const now = Date.now();
    
    const playerCount = Object.keys(this.players).length;
    if (playerCount === 0) {
      if (this.emptySince === null) {
        this.emptySince = now;
      } else if (now - this.emptySince > 3 * 60 * 1000) {
        this.onEvent('roomEmptyTimeout', { id: this.id });
        return; // Stop updating if the room is timing out
      }
    } else {
      this.emptySince = null;
    }

    // Respawn logic and AFK check
    for (const id in this.players) {
      const p = this.players[id];
      
      // AFK Kick (3 minutes)
      if (now - p.lastActionTime > 3 * 60 * 1000) {
        this.onEvent('playerKicked', { id, reason: 'AFK' });
        this.onEvent('playerLeft', id);
        this.removePlayer(id);
        continue;
      }

      if (p.isDead && now - p.deathTime > 5000) {
        p.isDead = false;
        p.isVisible = true;
        p.health = 100;
        do {
          p.x = Math.random() * 40 - 20;
          p.z = Math.random() * 40 - 20;
        } while (checkCollision(p.x, p.z, TANK_RADIUS, this.obstacles));
      }
    }
    
    // Update tank grid for fast collision detection
    this.tankGrid.clear();
    for (const id in this.players) {
      this.tankGrid.insert(this.players[id]);
    }
    for (const id in this.bots) {
      this.tankGrid.insert(this.bots[id]);
    }

    // Update bullets via BulletManager
    this.bulletManager.update(delta, this.obstacles, this.tankGrid);

    // Update bots via BotController
    this.botController.update(delta, this.tankGrid);

    this.onStateUpdate(this.getDeltaState());
  }


  private previousState: any = null;

  serializeState() {
    const state: any = { players: {}, bots: {}, bullets: {}, time: Date.now() };
    for (const id in this.players) state.players[id] = this.players[id].serialize();
    for (const id in this.bots) state.bots[id] = this.bots[id].serialize();
    this.bulletPool.getActive().forEach((b, id) => {
      state.bullets[id] = b.serialize();
    });
    return state;
  }

  getDeltaState() {
    const currentState = this.serializeState();
    if (!this.previousState) {
      this.previousState = currentState;
      return currentState;
    }

    const delta: any = { players: {}, bots: {}, bullets: {} };

    // Players delta
    for (const id in currentState.players) {
      const curr = currentState.players[id];
      const prev = this.previousState.players[id];
      if (!prev) {
        delta.players[id] = curr;
      } else {
        const diff: any = {};
        let hasChanges = false;
        for (const key in curr) {
          if (curr[key] !== prev[key]) {
            diff[key] = curr[key];
            hasChanges = true;
          }
        }
        if (hasChanges) {
          delta.players[id] = diff;
        }
      }
    }
    for (const id in this.previousState.players) {
      if (!currentState.players[id]) {
        delta.players[id] = null;
      }
    }

    // Bots delta
    for (const id in currentState.bots) {
      const curr = currentState.bots[id];
      const prev = this.previousState.bots[id];
      if (!prev) {
        delta.bots[id] = curr;
      } else {
        const diff: any = {};
        let hasChanges = false;
        for (const key in curr) {
          if (curr[key] !== prev[key]) {
            diff[key] = curr[key];
            hasChanges = true;
          }
        }
        if (hasChanges) {
          delta.bots[id] = diff;
        }
      }
    }
    for (const id in this.previousState.bots) {
      if (!currentState.bots[id]) {
        delta.bots[id] = null;
      }
    }

    // Bullets delta
    for (const id in currentState.bullets) {
      const curr = currentState.bullets[id];
      const prev = this.previousState.bullets[id];
      if (!prev) {
        delta.bullets[id] = curr;
      } else if (curr.x !== prev.x || curr.z !== prev.z) {
        delta.bullets[id] = { x: curr.x, z: curr.z };
      }
    }
    for (const id in this.previousState.bullets) {
      if (!currentState.bullets[id]) {
        delta.bullets[id] = null;
      }
    }

    delta.time = currentState.time;
    this.previousState = currentState;
    return delta;
  }
}
