import { Tank } from './Tank.js';

export class Player extends Tank {
  constructor(id: string, name: string, x: number, z: number, color: string) {
    super(id, name, x, z, false, color);
  }
}
