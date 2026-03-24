import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, LogOut, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onResetDatabase: () => void;
  onStopAllRooms: () => void;
  onForceReloadAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onResetDatabase, onStopAllRooms, onForceReloadAll }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-red-900/30 space-y-3">
      <div className="text-sm text-red-500 mb-1 uppercase tracking-wider font-bold">{t('Admin Actions')}</div>
      <button 
        onClick={onResetDatabase}
        className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl font-bold hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
      >
        <Zap size={20} /> {t('Reset All Profiles')}
      </button>
      <button 
        onClick={onStopAllRooms}
        className="w-full py-3 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-xl font-bold hover:bg-orange-600/30 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> {t('Stop All Servers')}
      </button>
      <button 
        onClick={onForceReloadAll}
        className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl font-bold hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw size={20} /> {t('Force Reload All')}
      </button>
    </div>
  );
};
