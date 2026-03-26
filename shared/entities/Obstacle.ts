import { GameObject } from './GameObject.js';

export class Obstacle extends GameObject {
  width: number;
  depth: number;

  constructor(id: string, x: number, z: number, width: number, depth: number) {
    super(id, x, z, 0, 'obstacle');
    this.width = width;
    this.depth = depth;
  }

  update(delta: number): void {
    // Obstacles don't move
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
