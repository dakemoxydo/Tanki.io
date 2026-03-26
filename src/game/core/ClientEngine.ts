import { NetworkClient } from '../network/NetworkClient';
import { InputManager } from './InputManager';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CameraSystem } from './systems/CameraSystem';
import { WeaponSystem } from './systems/WeaponSystem';
import { EntityFactory } from './EntityFactory';
import { LocalPlayer } from './entities/LocalPlayer';
import { BULLET_SPEED } from '../../../shared/constants';

export interface LocalBullet {
  active: boolean;
  id: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  createdAt: number;
}

export class ClientEngine {
  network: NetworkClient;
  input: InputManager;
  pendingEffects: { x: number, z: number }[] = [];
  pendingExplosions: { x: number, z: number }[] = [];
  localPlayer: LocalPlayer = EntityFactory.createLocalPlayer('local', 0, 0);
  lastEmit = 0;
  
  // Object pool for local bullets to avoid GC stutters
  localBullets: LocalBullet[] = Array.from({ length: 100 }, () => ({
    active: false,
    id: '',
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    createdAt: 0
  }));
  
  cameraTarget = { x: 0, y: 10, z: 15 };
  cameraLookAt = { x: 0, y: 1.5, z: 0 };

  serverStateBuffer: { time: number, state: any }[] = [];
  renderState: any = { players: {}, bots: {}, bullets: {}, obstacles: [] };
  private lastSentSequence: number = 0;
  private lastProcessedSequence: number = 0;
  private pendingInputs: { sequence: number, moveX: number, moveZ: number, delta: number }[] = [];

  constructor(network: NetworkClient, input: InputManager) {
    this.network = network;
    this.input = input;

    this.network.on('stateUpdate', (stateDelta: any) => {
      // In a real scenario, we'd merge this with the previous state.
      // Since useGameStateSync already does this, we can just grab the latest from the store,
      // but to keep ClientEngine independent, we could just rely on the update() method being called with the latest state.
      // Actually, let's just use the serverState passed into update() to build the buffer.
    });
  }

  update(delta: number, serverState: any, socketId: string) {
    const now = Date.now();
    
    // Add to buffer if it's a new state and has a timestamp
    if (serverState && serverState.time && (this.serverStateBuffer.length === 0 || this.serverStateBuffer[this.serverStateBuffer.length - 1].state.time !== serverState.time)) {
      this.serverStateBuffer.push({ time: serverState.time, state: serverState });
      if (this.serverStateBuffer.length > 20) {
        this.serverStateBuffer.shift();
      }
    }

    // Interpolate render state
    // We need to find the two snapshots that surround the current "render time"
    // Render time is current server time minus interpolation delay
    // Since we don't have synchronized clocks, we can estimate current server time
    // from the latest snapshot time.
    if (this.serverStateBuffer.length >= 2) {
      const latestServerTime = this.serverStateBuffer[this.serverStateBuffer.length - 1].time;
      const renderTime = latestServerTime - 100; // 100ms interpolation delay

      let s0 = this.serverStateBuffer[0];
      let s1 = this.serverStateBuffer[1];

      for (let i = 1; i < this.serverStateBuffer.length; i++) {
        if (this.serverStateBuffer[i].time > renderTime) {
          s0 = this.serverStateBuffer[i - 1];
          s1 = this.serverStateBuffer[i];
          break;
        }
      }

      if (s0 && s1 && s0.time <= renderTime && s1.time >= renderTime) {
        const t = (renderTime - s0.time) / (s1.time - s0.time);
        this.interpolateState(s0.state, s1.state, t);
      } else if (s1) {
        this.renderState = s1.state;
      }
    } else if (this.serverStateBuffer.length === 1) {
      this.renderState = this.serverStateBuffer[0].state;
    }

    const p = this.localPlayer;
    const players = serverState.players || {};
    const bots = serverState.bots || {};
    const obstacles = serverState.obstacles || [];
    const serverP = players[socketId];

    if (!p.initialized) {
      if (serverP) {
        p.x = serverP.x;
        p.z = serverP.z;
        p.rotation = serverP.rotation;
        p.targetHullRotation = serverP.rotation;
        p.turretRotation = serverP.turretRotation;
        p.cameraYaw = serverP.turretRotation;
        p.cameraPitch = 0.2;
        p.initialized = true;
      }
      return;
    }

    if (serverP && serverP.lastSequence > this.lastProcessedSequence) {
      this.lastProcessedSequence = serverP.lastSequence;
      
      // Server Reconciliation
      // 1. Remove inputs that the server has already processed
      this.pendingInputs = this.pendingInputs.filter(input => input.sequence > serverP.lastSequence);
      
      // 2. Check if the server position is significantly different from client's predicted position
      const dx = p.x - serverP.x;
      const dz = p.z - serverP.z;
      const distSq = dx * dx + dz * dz;
      
      // Only snap if the error is significant (e.g., > 0.1 units)
      if (distSq > 0.01) {
        // 3. Start from the server's authoritative position
        p.x = serverP.x;
        p.z = serverP.z;
        p.rotation = serverP.rotation;
        p.vx = serverP.vx || 0;
        p.vz = serverP.vz || 0;
        
        // 4. Re-apply all pending inputs
        for (const input of this.pendingInputs) {
          PhysicsSystem.updateMovement(p, input.moveX, input.moveZ, input.delta, obstacles);
        }
      }
      
      if (serverP.isDead) return;
    }

    const { mx, my } = this.input.consumeMovement();
    p.cameraYaw = (p.cameraYaw !== undefined ? p.cameraYaw : p.turretRotation) - mx * 0.003;
    p.cameraPitch = (p.cameraPitch || 0.2) + my * 0.003;
    p.cameraPitch = Math.max(-0.2, Math.min(Math.PI / 3, p.cameraPitch));

    if (this.input.consumeClick()) {
      // Spawn bullet slightly further away from the tank center
      const spawnX = p.x + Math.sin(p.rotation) * 0.2 + Math.sin(p.turretRotation) * 2.5;
      const spawnZ = p.z + Math.cos(p.rotation) * 0.2 + Math.cos(p.turretRotation) * 2.5;
      
      const vx = Math.sin(p.turretRotation) * BULLET_SPEED;
      const vz = Math.cos(p.turretRotation) * BULLET_SPEED;

      const bullet = this.localBullets.find(b => !b.active);
      if (bullet) {
        bullet.active = true;
        bullet.id = 'local_' + Math.random().toString(36).substring(7);
        bullet.x = spawnX;
        bullet.z = spawnZ;
        bullet.vx = vx;
        bullet.vz = vz;
        bullet.createdAt = Date.now();
      }

      this.network.emit('shoot', {
        x: spawnX,
        z: spawnZ,
        vx,
        vz
      });
    }

    // WeaponSystem.updateBullets now triggers local effects
    WeaponSystem.updateBullets(this.localBullets, delta, obstacles, players, bots, socketId, this.pendingEffects, this.pendingExplosions);

    let moveX = 0;
    let moveZ = 0;

    const forwardX = Math.sin(p.cameraYaw);
    const forwardZ = Math.cos(p.cameraYaw);
    const rightX = -Math.cos(p.cameraYaw);
    const rightZ = Math.sin(p.cameraYaw);

    if (this.input.isKeyDown('KeyW')) { moveX += forwardX; moveZ += forwardZ; }
    if (this.input.isKeyDown('KeyS')) { moveX -= forwardX; moveZ -= forwardZ; }
    if (this.input.isKeyDown('KeyA')) { moveX -= rightX; moveZ -= rightZ; }
    if (this.input.isKeyDown('KeyD')) { moveX += rightX; moveZ += rightZ; }

    // Store input for reconciliation
    this.lastSentSequence++;
    this.pendingInputs.push({
      sequence: this.lastSentSequence,
      moveX,
      moveZ,
      delta
    });

    PhysicsSystem.updateMovement(p, moveX, moveZ, delta, obstacles);

    const camData = CameraSystem.updateCamera(p, delta, obstacles);
    this.cameraTarget = camData.target;
    this.cameraLookAt = camData.lookAt;

    if (now - this.lastEmit > 30) { // Sync more frequently for smoother prediction
      this.network.emit('move', { 
        x: p.x, 
        z: p.z, 
        vx: p.vx,
        vz: p.vz,
        rotation: p.rotation, 
        turretRotation: p.turretRotation,
        sequence: this.lastSentSequence
      });
      this.lastEmit = now;
    }
  }

  private interpolateState(s0: any, s1: any, t: number) {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpAngle = (a: number, b: number, t: number) => {
      let diff = b - a;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      return a + diff * t;
    };

    this.renderState = {
      players: {},
      bots: {},
      bullets: {},
      obstacles: s1.obstacles
    };

    for (const id in s1.players) {
      const p1 = s1.players[id];
      const p0 = s0.players[id];
      if (p0) {
        this.renderState.players[id] = {
          ...p1,
          x: lerp(p0.x, p1.x, t),
          z: lerp(p0.z, p1.z, t),
          rotation: lerpAngle(p0.rotation, p1.rotation, t),
          turretRotation: lerpAngle(p0.turretRotation, p1.turretRotation, t)
        };
      } else {
        this.renderState.players[id] = p1;
      }
    }

    for (const id in s1.bots) {
      const b1 = s1.bots[id];
      const b0 = s0.bots[id];
      if (b0) {
        this.renderState.bots[id] = {
          ...b1,
          x: lerp(b0.x, b1.x, t),
          z: lerp(b0.z, b1.z, t),
          rotation: lerpAngle(b0.rotation, b1.rotation, t),
          turretRotation: lerpAngle(b0.turretRotation, b1.turretRotation, t)
        };
      } else {
        this.renderState.bots[id] = b1;
      }
    }

    for (const id in s1.bullets) {
      const b1 = s1.bullets[id];
      const b0 = s0.bullets[id];
      if (b0) {
        this.renderState.bullets[id] = {
          ...b1,
          x: lerp(b0.x, b1.x, t),
          z: lerp(b0.z, b1.z, t)
        };
      } else {
        this.renderState.bullets[id] = b1;
      }
    }
  }
}
