import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

interface DeathScreenProps {
  respawnTime: number;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ respawnTime }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-red-900/80 z-30 flex flex-col items-center justify-center text-white"
    >
      <motion.h2
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="text-6xl font-black mb-4 uppercase"
      >
        {t('You Died')}
      </motion.h2>
      <motion.p
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-2xl"
      >
        {t('Respawning in')} {respawnTime} {t('seconds')}...
      </motion.p>
    </motion.div>
  );
};
