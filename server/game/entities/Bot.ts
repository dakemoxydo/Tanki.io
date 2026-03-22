import { Tank } from './Tank.js';

export class Bot extends Tank {
  constructor(id: string, x: number, z: number) {
    super(id, 'AI Bot', x, z, true, '#ef4444');
  }
}
