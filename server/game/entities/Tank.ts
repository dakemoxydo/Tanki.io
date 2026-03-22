import { Entity } from './Entity.js';

export class Tank extends Entity {
  name: string;
  rotation: number;
  turretRotation: number;
  health: number;
  score: number;
  isBot: boolean;
  color: string;

  constructor(id: string, name: string, x: number, z: number, isBot: boolean, color: string) {
    super(id, x, z);
    this.name = name;
    this.rotation = 0;
    this.turretRotation = 0;
    this.health = 100;
    this.score = 0;
    this.isBot = isBot;
    this.color = color;
  }

  serialize() {
    return {
      id: this.id, name: this.name, x: this.x, z: this.z,
      rotation: this.rotation, turretRotation: this.turretRotation,
      health: this.health, score: this.score, isBot: this.isBot, color: this.color
    };
  }
}
