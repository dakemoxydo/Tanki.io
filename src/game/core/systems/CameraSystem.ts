import { checkCollision } from '../../../../shared/physics';
import { TANK_RADIUS } from '../../../../shared/constants';
import { LocalPlayer } from '../entities/LocalPlayer';
import { Obstacle } from '../../../../shared/entities/Obstacle';

export class CameraSystem {
  static updateCamera(p: LocalPlayer, delta: number, obstacles: Obstacle[]): { target: any, lookAt: any } {
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

    let camX = p.x - Math.sin(p.cameraYaw) * actualDist;
    let camZ = p.z - Math.cos(p.cameraYaw) * actualDist;

    // Camera collision check
    for (const obs of obstacles) {
      if (checkCollision(camX, camZ, 0.5, [obs])) {
        // Simple push-back if camera is inside an obstacle
        camX = p.x - Math.sin(p.cameraYaw) * (actualDist * 0.5);
        camZ = p.z - Math.cos(p.cameraYaw) * (actualDist * 0.5);
        break;
      }
    }

    return {
      target: { x: camX, y: camHeight, z: camZ },
      lookAt: { x: p.x, y: 1.5, z: p.z }
    };
  }
}
