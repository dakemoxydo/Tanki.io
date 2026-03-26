import { GameObject } from './GameObject.js';

export abstract class MovableObject extends GameObject {
  vx: number = 0;
  vz: number = 0;

  constructor(id: string, x: number, z: number, rotation: number = 0, type: string = 'movable') {
    super(id, x, z, rotation, type);
  }
}
