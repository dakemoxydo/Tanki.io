import * as THREE from 'three';

export const lerpAngle = (start: number, end: number, t: number): number => {
  let diff = end - start;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return start + diff * t;
};

export const normalizeAngle = (angle: number): number => {
  while (angle < -Math.PI) angle += Math.PI * 2;
  while (angle > Math.PI) angle -= Math.PI * 2;
  return angle;
};

export const getDistance = (x1: number, z1: number, x2: number, z2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
};
