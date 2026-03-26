import { MovableObject } from './MovableObject.js';

export class Bullet extends MovableObject {
  ownerId: string;
  createdAt: number;

  constructor(id: string, ownerId: string, x: number, z: number, vx: number, vz: number) {
    super(id, x, z, 0, 'bullet');
    this.ownerId = ownerId;
    this.vx = vx;
    this.vz = vz;
    this.createdAt = Date.now();
  }

  update(delta: number): void {
    this.x += this.vx * delta;
    this.z += this.vz * delta;
  }

  serialize() {
    return {
      id: this.id, 
      ownerId: this.ownerId, 
      x: Math.round(this.x * 100) / 100, 
      z: Math.round(this.z * 100) / 100,
      vx: Math.round(this.vx * 100) / 100, 
      vz: Math.round(this.vz * 100) / 100, 
      createdAt: this.createdAt
    };
  }
}
