import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const PerformanceMonitor: React.FC<{ ping: number }> = ({ ping }) => {
  const [fps, setFps] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(updateFps);
    };

    animationFrameId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-20 text-white text-xs font-mono bg-slate-900/50 p-2 rounded">
      <div>{t('FPS')}: {fps}</div>
      <div>{t('Ping')}: {ping} ms</div>
    </div>
  );
};
