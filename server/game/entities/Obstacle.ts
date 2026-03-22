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
    return { id: this.id, x: this.x, z: this.z, width: this.width, depth: this.depth };
  }
}
