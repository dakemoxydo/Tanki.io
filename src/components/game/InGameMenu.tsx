import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface InGameMenuProps {
  language: 'ru' | 'en';
  toggleLanguage: () => void;
  onRequestPointerLock: () => void;
  onAddBot: () => void;
  onClearBots: () => void;
  onBackToMenu: () => void;
}

export const InGameMenu: React.FC<InGameMenuProps> = ({ 
  language, 
  toggleLanguage, 
  onRequestPointerLock, 
  onAddBot, 
  onClearBots, 
  onBackToMenu 
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-black/70 z-40 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); onRequestPointerLock(); }}>
      <Panel variant="solid" padding="lg" className="w-80 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">{t('Game Paused')}</h2>
        <div className="space-y-3">
          <Button onClick={onRequestPointerLock} variant="primary" size="lg" fullWidth>
            {t('Continue')}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onAddBot} variant="secondary" size="md">
              {t('Add Bot')}
            </Button>
            <Button onClick={onClearBots} variant="danger" size="md">
              {t('Clear Bots')}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-700 p-3 rounded-lg">
            <span className="text-slate-300">{t('Language')}</span>
            <Button onClick={toggleLanguage} variant="ghost" size="sm">
              {language === 'ru' ? 'Русский' : 'English'}
            </Button>
          </div>
          
          <Button onClick={onBackToMenu} variant="danger" size="lg" fullWidth>
            {t('Back to Menu')}
          </Button>
        </div>
      </Panel>
    </div>
  );
};
