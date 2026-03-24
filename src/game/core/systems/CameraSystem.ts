export class CameraSystem {
  static updateCamera(p: any, delta: number): { target: any, lookAt: any } {
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

    return {
      target: { x: camX, y: camHeight, z: camZ },
      lookAt: { x: p.x, y: 1.5, z: p.z }
    };
  }
}
