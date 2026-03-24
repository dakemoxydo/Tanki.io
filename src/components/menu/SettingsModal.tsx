import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import { User } from 'firebase/auth';
import { WindowContainer } from '../ui/WindowContainer';

interface SettingsModalProps {
  user: User | null;
  language: 'ru' | 'en';
  setLanguage: (lang: 'ru' | 'en') => void;
  onResetDatabase: () => void;
  onStopAllRooms: () => void;
  onForceReloadAll: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  user, 
  language, 
  setLanguage, 
  onResetDatabase, 
  onStopAllRooms, 
  onForceReloadAll,
  onClose 
}) => {
  const { t, i18n } = useTranslation();

  return (
    <WindowContainer 
      isOpen={true} 
      onClose={onClose} 
      title={t('Settings')}
    >
      <div className="space-y-6">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-500 mb-3 uppercase tracking-wider font-bold">{t('Language')}</div>
          <div className="flex gap-2">
            <button 
              onClick={() => { i18n.changeLanguage('ru'); setLanguage('ru'); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${language === 'ru' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {t('Russian')}
            </button>
            <button 
              onClick={() => { i18n.changeLanguage('en'); setLanguage('en'); }}
              className={`flex-1 py-2 rounded-lg font-bold transition ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {t('English')}
            </button>
          </div>
        </div>

        {user?.email === 'dakemoxydo666@gmail.com' && (
          <AdminPanel 
            onResetDatabase={onResetDatabase} 
            onStopAllRooms={onStopAllRooms} 
            onForceReloadAll={onForceReloadAll}
          />
        )}
      </div>
    </WindowContainer>
  );
};
