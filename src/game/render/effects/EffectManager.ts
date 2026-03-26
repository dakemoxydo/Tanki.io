import { useState } from 'react';

export const useEffectManager = () => {
  const [effects, setEffects] = useState<{ id: string, x: number, z: number }[]>([]);
  const [explosions, setExplosions] = useState<{ id: string, x: number, z: number }[]>([]);

  const addEffect = (x: number, z: number) => {
    const id = Math.random().toString();
    setEffects(prev => [...prev, { id, x, z }]);
  };

  const addExplosion = (x: number, z: number) => {
    const id = Math.random().toString();
    setExplosions(prev => [...prev, { id, x, z }]);
    // Auto-remove after some time to keep the list small if needed, 
    // but Particles already handles internal cleanup.
    // However, we should remove it from this list too after it's processed.
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 1000);
  };

  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  return { effects, explosions, addEffect, addExplosion, removeEffect };
};
