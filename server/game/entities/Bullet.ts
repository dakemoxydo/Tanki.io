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
      id: this.id, ownerId: this.ownerId, x: this.x, z: this.z,
      vx: this.vx, vz: this.vz, createdAt: this.createdAt
    };
  }
}
