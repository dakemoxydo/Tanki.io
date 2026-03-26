import { Tank } from '../../../../shared/entities/Tank';

export class LocalPlayer extends Tank {
  cameraYaw: number = 0;
  cameraPitch: number = 0.2;

  constructor(id: string, x: number, z: number) {
    super(id, 'Local', x, z, false, 'blue');
    this.type = 'local_tank';
  }

  update(delta: number) {
    // Local player specific update logic if needed
  }
}
