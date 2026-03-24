import { Entity } from './Entity.js';

export class Tank extends Entity {
  name: string;
  rotation: number;
  turretRotation: number;
  health: number;
  isDead: boolean = false;
  isVisible: boolean = true;
  deathTime: number = 0;
  score: number;
  kills: number = 0;
  deaths: number = 0;
  isBot: boolean;
  color: string;

  constructor(id: string, name: string, x: number, z: number, isBot: boolean, color: string) {
    super(id, x, z);
    this.name = name;
    this.rotation = 0;
    this.turretRotation = 0;
    this.health = 100;
    this.isDead = false;
    this.isVisible = true;
    this.deathTime = 0;
    this.score = 0;
    this.kills = 0;
    this.deaths = 0;
    this.isBot = isBot;
    this.color = color;
  }

  serialize() {
    return {
      id: this.id, 
      name: this.name, 
      x: Math.round(this.x * 100) / 100, 
      z: Math.round(this.z * 100) / 100,
      rotation: Math.round(this.rotation * 100) / 100, 
      turretRotation: Math.round(this.turretRotation * 100) / 100,
      health: this.health, 
      isDead: this.isDead, 
      isVisible: this.isVisible, 
      score: this.score, 
      kills: this.kills,
      deaths: this.deaths,
      isBot: this.isBot, 
      color: this.color
    };
  }
}
