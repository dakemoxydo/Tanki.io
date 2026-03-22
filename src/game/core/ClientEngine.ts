import { NetworkClient } from '../network/NetworkClient';
import { InputManager } from './InputManager';
import { checkCollision } from '../../../shared/physics';
import { TANK_SPEED, TANK_RADIUS } from '../../../shared/constants';

export class ClientEngine {
  network: NetworkClient;
  input: InputManager;
  localState: any = { x: 0, z: 0, rotation: 0, turretRotation: 0, cameraYaw: 0, cameraPitch: 0.2, targetHullRotation: 0, initialized: false, vx: 0, vz: 0 };
  lastEmit = 0;
  localBullets: any[] = [];

  constructor(network: NetworkClient, input: InputManager) {
    this.network = network;
    this.input = input;
  }

  update(delta: number, serverState: any, socketId: string, camera: any) {
    const p = this.localState;
    const serverP = serverState.players[socketId];

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

      this.localBullets.push({
        id: 'local_' + Math.random().toString(36).substring(7),
        x: spawnX,
        z: spawnZ,
        vx,
        vz,
        createdAt: Date.now()
      });

      this.network.emit('shoot', {
        x: spawnX,
        z: spawnZ,
        vx,
        vz
      });
    }

    const currentTime = Date.now();
    this.localBullets = this.localBullets.filter(b => {
      b.x += b.vx * 30 * delta;
      b.z += b.vz * 30 * delta;
      
      if (serverState.obstacles && checkCollision(b.x, b.z, 0.2, serverState.obstacles)) {
        return false;
      }
      
      let hitPlayer = false;
      for (const pid in serverState.players) {
        if (pid !== socketId) {
          const p = serverState.players[pid];
          if (Math.hypot(p.x - b.x, p.z - b.z) < TANK_RADIUS + 0.2) hitPlayer = true;
        }
      }
      for (const bid in serverState.bots) {
        const p = serverState.bots[bid];
        if (Math.hypot(p.x - b.x, p.z - b.z) < TANK_RADIUS + 0.2) hitPlayer = true;
      }
      if (hitPlayer) return false;

      return currentTime - b.createdAt < 3000;
    });

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

    let targetVx = 0;
    let targetVz = 0;

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      targetVx = (moveX / len) * TANK_SPEED;
      targetVz = (moveZ / len) * TANK_SPEED;
      p.targetHullRotation = Math.atan2(moveX, moveZ);
    }

    const accel = 8;
    const friction = 12;

    if (moveX !== 0 || moveZ !== 0) {
      p.vx += (targetVx - p.vx) * accel * delta;
      p.vz += (targetVz - p.vz) * accel * delta;
    } else {
      p.vx -= p.vx * friction * delta;
      p.vz -= p.vz * friction * delta;
      if (Math.abs(p.vx) < 0.01) p.vx = 0;
      if (Math.abs(p.vz) < 0.01) p.vz = 0;
    }

    if (p.vx !== 0 || p.vz !== 0) {
      const nextX = p.x + p.vx * delta;
      const nextZ = p.z + p.vz * delta;
      
      const canMoveX = !checkCollision(nextX, p.z, TANK_RADIUS, serverState.obstacles || []);
      const canMoveZ = !checkCollision(p.x, nextZ, TANK_RADIUS, serverState.obstacles || []);

      if (canMoveX) p.x = nextX;
      else p.vx = 0;

      if (canMoveZ) p.z = nextZ;
      else p.vz = 0;
    }

    let diff = p.targetHullRotation - p.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    p.rotation += diff * 8 * delta;

    let turretDiff = p.cameraYaw - p.turretRotation;
    while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
    while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
    
    const turretSpeed = 2.5;
    const step = turretSpeed * delta;
    if (Math.abs(turretDiff) <= step) {
      p.turretRotation += turretDiff;
    } else {
      p.turretRotation += Math.sign(turretDiff) * step;
    }

    const camDist = 12;
    const pitch = p.cameraPitch || 0.2;
    const actualDist = camDist * Math.cos(pitch);
    const camHeight = 2 + camDist * Math.sin(pitch);

    const camX = p.x - Math.sin(p.cameraYaw) * actualDist;
    const camZ = p.z - Math.cos(p.cameraYaw) * actualDist;

    camera.position.lerp({ x: camX, y: camHeight, z: camZ }, 15 * delta);
    camera.lookAt(p.x, 1.5, p.z);

    const now = Date.now();
    if (now - this.lastEmit > 50) {
      this.network.emit('move', { x: p.x, z: p.z, rotation: p.rotation, turretRotation: p.turretRotation });
      this.lastEmit = now;
    }
  }
}
