import { MovableObject } from './MovableObject.js';

export class Tank extends MovableObject {
  name: string;
  turretRotation: number = 0;
  targetHullRotation: number = 0;
  health: number = 100;
  isDead: boolean = false;
  isVisible: boolean = true;
  deathTime: number = 0;
  score: number = 0;
  kills: number = 0;
  deaths: number = 0;
  color: string;
  isBot: boolean;
  initialized: boolean = false;
  lastSequence: number = 0;

  constructor(id: string, name: string, x: number, z: number, isBot: boolean, color: string) {
    super(id, x, z, 0, isBot ? 'bot_tank' : 'tank');
    this.name = name;
    this.isBot = isBot;
    this.color = color;
  }

  update(delta: number): void {
    // Basic update logic if needed, usually handled by systems
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
      deathTime: this.deathTime,
      score: this.score, 
      kills: this.kills,
      deaths: this.deaths,
      isBot: this.isBot, 
      color: this.color,
      vx: Math.round(this.vx * 100) / 100,
      vz: Math.round(this.vz * 100) / 100,
      lastSequence: this.lastSequence
    };
  }
}
