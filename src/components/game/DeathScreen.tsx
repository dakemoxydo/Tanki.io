import React from 'react';
import { useTranslation } from 'react-i18next';

interface DeathScreenProps {
  respawnTime: number;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ respawnTime }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-red-900/80 z-30 flex flex-col items-center justify-center text-white">
      <h2 className="text-6xl font-black mb-4 uppercase">{t('You Died')}</h2>
      <p className="text-2xl">{t('Respawning in')} {respawnTime} {t('seconds')}...</p>
    </div>
  );
};
