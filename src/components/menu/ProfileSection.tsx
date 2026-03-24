import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, LogOut, Loader2, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../../shared/types';
import { User } from 'firebase/auth';
import { profileService } from '../../services/profileService';
import { motion, AnimatePresence } from 'motion/react';
import { WindowContainer } from '../ui/WindowContainer';

interface ProfileSectionProps {
  user: User;
  profile: UserProfile;
  onSaveName: (name: string) => Promise<void>;
  onLogout: () => void;
  onClose: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, profile, onSaveName, onLogout, onClose }) => {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(profile.displayName);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkNickname = useCallback(async (name: string) => {
    if (!name || name.trim() === '' || name.trim() === profile.displayName) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    if (name.length < 3) {
      setIsAvailable(false);
      setError(t('Nickname must be at least 3 characters'));
      return;
    }

    setIsChecking(true);
    try {
      const available = await profileService.isNicknameAvailable(name, profile.uid);
      setIsAvailable(available);
      setError(available ? null : t('This nickname is already taken'));
    } catch (e) {
      console.error('Check failed:', e);
    } finally {
      setIsChecking(false);
    }
  }, [profile.displayName, profile.uid, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditingName) {
        checkNickname(newDisplayName);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newDisplayName, isEditingName, checkNickname]);

  const handleSave = async () => {
    if (isAvailable === false || isChecking) return;
    await onSaveName(newDisplayName);
    setIsEditingName(false);
  };

  const getAuthMethodLabel = (authType: string) => {
    switch (authType) {
      case 'google': return t('Google');
      case 'email': return t('Email/Password');
      case 'guest': return t('Guest');
      default: return authType;
    }
  };

  return (
    <WindowContainer 
      isOpen={true} 
      onClose={onClose} 
      title={t('Profile')}
    >
      <div className="space-y-6">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-bold">{t('Nickname')}</div>
          {isEditingName ? (
            <div className="space-y-2">
              <div className="flex gap-2 relative">
                <motion.input 
                  type="text" 
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  animate={isAvailable === false ? { x: [-2, 2, -2, 2, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`flex-grow bg-slate-800 border ${isAvailable === false ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white focus:outline-none focus:ring-2 ${isAvailable === false ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all`}
                  autoFocus
                />
                <div className="absolute right-24 top-1/2 -translate-y-1/2 flex items-center">
                  {isChecking && <Loader2 size={16} className="animate-spin text-slate-400" />}
                  {!isChecking && isAvailable === true && <Check size={16} className="text-green-500" />}
                  {!isChecking && isAvailable === false && <AlertCircle size={16} className="text-red-500" />}
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={isAvailable === false || isChecking || newDisplayName === profile.displayName}
                  className="bg-green-600 px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Save')}
                </button>
                <button onClick={() => setIsEditingName(false)} className="bg-slate-700 px-4 py-2 rounded font-bold hover:bg-slate-600 transition-colors">
                  {t('Cancel')}
                </button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">{profile.displayName}</div>
              <button onClick={() => setIsEditingName(true)} className="text-sm text-blue-400 hover:text-blue-300 underline">
                {t('Change Nickname')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-bold">{t('Auth Method')}</div>
          <div className="text-lg">{getAuthMethodLabel(profile.authType)}</div>
          {user.email && <div className="text-sm text-slate-400 mt-1">{user.email}</div>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('Kills')}</div>
            <div className="text-xl font-bold text-green-400">{profile.kills || 0}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('Deaths')}</div>
            <div className="text-xl font-bold text-red-400">{profile.deaths || 0}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('Matches')}</div>
            <div className="text-xl font-bold text-blue-400">{profile.matchesPlayed || 0}</div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl font-bold hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> {t('Logout of account')}
          </button>
        </div>
      </div>
    </WindowContainer>
  );
};
