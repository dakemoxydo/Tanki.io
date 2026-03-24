import { Entity } from './Entity.js';

export class Obstacle extends Entity {
  width: number;
  depth: number;

  constructor(id: string, x: number, z: number, width: number, depth: number) {
    super(id, x, z);
    this.width = width;
    this.depth = depth;
  }

  serialize() {
    return { 
      id: this.id, 
      x: Math.round(this.x * 100) / 100, 
      z: Math.round(this.z * 100) / 100, 
      width: Math.round(this.width * 100) / 100, 
      depth: Math.round(this.depth * 100) / 100 
    };
  }
}
