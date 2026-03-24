import { checkCollision } from '../../../../shared/physics';
import { TANK_SPEED, TANK_RADIUS } from '../../../../shared/constants';

export class PhysicsSystem {
  static updateMovement(p: any, moveX: number, moveZ: number, delta: number, obstacles: any[]) {
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
      
      const canMoveX = !checkCollision(nextX, p.z, TANK_RADIUS, obstacles);
      const canMoveZ = !checkCollision(p.x, nextZ, TANK_RADIUS, obstacles);

      if (canMoveX) p.x = nextX;
      else p.vx = 0;

      if (canMoveZ) p.z = nextZ;
      else p.vz = 0;
    }

    let diff = p.targetHullRotation - p.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    p.rotation += diff * 8 * delta;
  }
}
