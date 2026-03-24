import { Entity } from './Entity.js';

export class Bullet extends Entity {
  ownerId: string;
  vx: number;
  vz: number;
  createdAt: number;

  constructor(id: string, ownerId: string, x: number, z: number, vx: number, vz: number) {
    super(id, x, z);
    this.ownerId = ownerId;
    this.vx = vx;
    this.vz = vz;
    this.createdAt = Date.now();
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
