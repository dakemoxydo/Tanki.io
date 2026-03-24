import { NetworkClient } from '../network/NetworkClient';
import { InputManager } from './InputManager';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CameraSystem } from './systems/CameraSystem';
import { WeaponSystem } from './systems/WeaponSystem';

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
  localState: any = { x: 0, z: 0, rotation: 0, turretRotation: 0, cameraYaw: 0, cameraPitch: 0.2, targetHullRotation: 0, initialized: false, vx: 0, vz: 0 };
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

  constructor(network: NetworkClient, input: InputManager) {
    this.network = network;
    this.input = input;
  }

  update(delta: number, serverState: any, socketId: string) {
    const p = this.localState;
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

    if (serverP) {
      const dist = Math.hypot(serverP.x - p.x, serverP.z - p.z);
      if (dist > 5) {
        p.x = serverP.x;
        p.z = serverP.z;
      }
      if (serverP.isDead) return;
    }

    const { mx, my } = this.input.consumeMovement();
    p.cameraYaw = (p.cameraYaw !== undefined ? p.cameraYaw : p.turretRotation) - mx * 0.003;
    p.cameraPitch = (p.cameraPitch || 0.2) + my * 0.003;
    p.cameraPitch = Math.max(-0.2, Math.min(Math.PI / 3, p.cameraPitch));

    if (this.input.consumeClick()) {
      const spawnX = p.x + Math.sin(p.rotation) * 0.2 + Math.sin(p.turretRotation) * 2.1;
      const spawnZ = p.z + Math.cos(p.rotation) * 0.2 + Math.cos(p.turretRotation) * 2.1;
      
      const vx = Math.sin(p.turretRotation) * 1.5;
      const vz = Math.cos(p.turretRotation) * 1.5;

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

    WeaponSystem.updateBullets(this.localBullets, delta, obstacles, players, bots, socketId);

    let moveX = 0;
    let moveZ = 0;

    const forwardX = Math.sin(p.cameraYaw);
    const forwardZ = Math.cos(p.cameraYaw);
    const rightX = -Math.cos(p.cameraYaw);
    const rightZ = Math.sin(p.cameraYaw);

    if (this.input.keys['KeyW']) { moveX += forwardX; moveZ += forwardZ; }
    if (this.input.keys['KeyS']) { moveX -= forwardX; moveZ -= forwardZ; }
    if (this.input.keys['KeyA']) { moveX -= rightX; moveZ -= rightZ; }
    if (this.input.keys['KeyD']) { moveX += rightX; moveZ += rightZ; }

    PhysicsSystem.updateMovement(p, moveX, moveZ, delta, obstacles);

    const camData = CameraSystem.updateCamera(p, delta);
    this.cameraTarget = camData.target;
    this.cameraLookAt = camData.lookAt;

    const now = Date.now();
    if (now - this.lastEmit > 50) {
      this.network.emit('move', { x: p.x, z: p.z, rotation: p.rotation, turretRotation: p.turretRotation });
      this.lastEmit = now;
    }
  }
}
