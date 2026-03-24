import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useGameStore } from '../store';

import { UserProfile } from '../../shared/types';

export const AuthScreen = () => {
  const { t } = useTranslation();
  const { setUser, setProfile } = useGameStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (action: () => Promise<any>, authType: 'google' | 'email' | 'guest') => {
    try {
      const userCredential = await action();
      const user = userCredential.user;
      
      let profile = await profileService.getProfile(user.uid);
      const finalNickname = nickname.trim() || user.displayName || 'Player' + Math.floor(10000 + Math.random() * 90000);
      
      if (!profile) {
        const newProfile: Partial<UserProfile> = { 
          displayName: finalNickname, 
          authType: authType,
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'user'
        };
        await profileService.createProfile(user.uid, newProfile);
        profile = await profileService.getProfile(user.uid);
      } else {
        // Migration: Ensure existing profiles have required fields
        const updates: Partial<UserProfile> = {};
        let needsUpdate = false;
        if (!profile.displayName) {
          updates.displayName = finalNickname;
          profile.displayName = finalNickname;
          needsUpdate = true;
        }
        if (!profile.authType) {
          updates.authType = authType;
          profile.authType = authType;
          needsUpdate = true;
        }
        if (!profile.createdAt) {
          updates.createdAt = new Date().toISOString();
          profile.createdAt = updates.createdAt;
          needsUpdate = true;
        }
        if (needsUpdate) {
          try {
            await profileService.updateProfile(user.uid, updates);
          } catch (e) {
            console.warn('Failed to migrate profile:', e);
          }
        }
      }
      
      // Set profile first, then user to ensure MainMenu has everything it needs
      setProfile(profile);
      setUser(user);
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/admin-restricted-operation') {
        alert(t('Guest login is disabled. Please enable Anonymous Auth in Firebase Console or use Google/Email login.'));
      } else {
        alert(t('Auth error') + ': ' + (error.message || error));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          {t('Tanks.io')}
        </h1>
        
        {!isRegistering ? (
          <div className="space-y-4">
            <input type="email" placeholder={t('Email')} className="w-full p-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder={t('Password')} className="w-full p-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => handleAuth(() => authService.signInWithEmail(email, password), 'email')} className="w-full bg-blue-600 p-2 rounded font-bold hover:bg-blue-500 transition-colors">{t('Login')}</button>
            <button onClick={() => setIsRegistering(true)} className="w-full text-sm text-slate-400 hover:text-white transition-colors">{t('Register')}</button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">OR</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
            <button onClick={() => handleAuth(() => authService.signInWithGoogle(), 'google')} className="w-full bg-white text-black p-2 rounded font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              {t('Login with Google')}
            </button>
            <button onClick={() => handleAuth(() => authService.signInAsGuest(), 'guest')} className="w-full bg-slate-600 p-2 rounded font-bold hover:bg-slate-500 transition-colors">{t('Play as Guest')}</button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" placeholder={t('Nickname')} className="w-full p-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setNickname(e.target.value)} />
            <input type="email" placeholder={t('Email')} className="w-full p-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder={t('Password')} className="w-full p-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => handleAuth(() => authService.registerWithEmail(email, password), 'email')} className="w-full bg-green-600 p-2 rounded font-bold hover:bg-green-500 transition-colors">{t('Register')}</button>
            <button onClick={() => setIsRegistering(false)} className="w-full text-sm text-slate-400 hover:text-white transition-colors">{t('Back to Login')}</button>
          </div>
        )}
      </div>
    </div>
  );
};
