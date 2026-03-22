import { create } from 'zustand';

interface GameState {
  mode: 'menu' | 'multiplayer' | 'bots';
  setMode: (mode: 'menu' | 'multiplayer' | 'bots') => void;
  user: any;
  setUser: (user: any) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: 'menu',
  setMode: (mode) => set({ mode }),
  user: null,
  setUser: (user) => set({ user }),
  language: 'ru',
  setLanguage: (language) => set({ language }),
}));
