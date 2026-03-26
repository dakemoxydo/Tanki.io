import { useFrame } from '@react-three/fiber';
import { ClientEngine } from '../../game/core/ClientEngine';

interface EffectProcessorProps {
  engine: ClientEngine;
  addEffect: (x: number, z: number) => void;
  addExplosion: (x: number, z: number) => void;
}

export const EffectProcessor: React.FC<EffectProcessorProps> = ({ engine, addEffect, addExplosion }) => {
  useFrame(() => {
    if (engine.pendingEffects.length > 0) {
      engine.pendingEffects.forEach(effect => {
        addEffect(effect.x, effect.z);
      });
      engine.pendingEffects = [];
    }
    if (engine.pendingExplosions.length > 0) {
      engine.pendingExplosions.forEach(exp => {
        addExplosion(exp.x, exp.z);
      });
      engine.pendingExplosions = [];
    }
  });
  return null;
};
