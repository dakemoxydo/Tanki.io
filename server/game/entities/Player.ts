import { Tank } from '../../../shared/entities/Tank.js';

export class Player extends Tank {
  userId?: string;
  lastActionTime: number;

  constructor(id: string, name: string, x: number, z: number, color: string, userId?: string) {
    super(id, name, x, z, false, color);
    this.userId = userId;
    this.lastActionTime = Date.now();
  }
}
