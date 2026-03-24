import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { UserProfile } from '../shared/types';

interface GameState {
  mode: 'menu' | 'multiplayer' | 'bots';
  setMode: (mode: 'menu' | 'multiplayer' | 'bots') => void;
  user: User | null;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  language: 'ru' | 'en';
  setLanguage: (lang: 'ru' | 'en') => void;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      mode: 'menu',
      setMode: (mode) => set({ mode }),
      user: null,
      setUser: (user) => set({ user }),
      profile: null,
      setProfile: (profile) => set({ profile }),
      language: 'ru',
      setLanguage: (language) => set({ language }),
      selectedRoomId: 'quickPlay',
      setSelectedRoomId: (selectedRoomId) => set({ selectedRoomId }),
    }),
    {
      name: 'tanks-game-storage',
      partialize: (state) => ({ language: state.language, mode: state.mode }),
    }
  )
);
