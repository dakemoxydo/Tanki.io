/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useGameStore } from './store';
import { AuthScreen } from './components/AuthScreen';
import MainMenu from './components/MainMenu';
import { Game } from './components/Game';
import { ErrorBoundary } from './utils/errorHandling';
import { profileService } from './services/profileService';
import { UserProfile } from '../shared/types';
import './i18n';

export default function App() {
  const { user, setUser, profile, setProfile, mode } = useGameStore();
  const profileFetchedRef = useRef(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && !profileFetchedRef.current) {
        try {
          let userProfile = await profileService.getProfile(firebaseUser.uid);
          if (!userProfile) {
            const newProfile: Partial<UserProfile> = {
              displayName: firebaseUser.displayName || 'Player' + Math.floor(10000 + Math.random() * 90000),
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              authType: (firebaseUser.isAnonymous ? 'guest' : 'google') as 'google' | 'email' | 'guest'
            };
            await profileService.createProfile(firebaseUser.uid, newProfile);
            userProfile = await profileService.getProfile(firebaseUser.uid);
          }
          if (userProfile) {
            setProfile(userProfile);
            profileFetchedRef.current = true;
          }
        } catch (error) {
          console.error('Error fetching/creating profile on auth change:', error);
        }
      } else if (!firebaseUser) {
        setProfile(null);
        profileFetchedRef.current = false;
      }
    });
    return unsubscribe;
  }, [setUser, setProfile]);

  if (!user) {
    return (
      <ErrorBoundary>
        <AuthScreen />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {mode === 'menu' ? <MainMenu /> : <Game />}
    </ErrorBoundary>
  );
}
