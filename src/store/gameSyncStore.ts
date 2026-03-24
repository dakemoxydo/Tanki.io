import { create } from 'zustand';
import { GameState } from '../../shared/types';

interface GameSyncState {
  gameState: GameState | null;
  prevGameState: GameState | null;
  setGameState: (state: GameState) => void;
  removePlayer: (playerId: string) => void;
  clearGameState: () => void;
}

export const useGameSyncStore = create<GameSyncState>((set) => ({
  gameState: null,
  prevGameState: null,
  setGameState: (newState) => set((state) => ({
    prevGameState: state.gameState,
    gameState: newState
  })),
  removePlayer: (playerId) => set((state) => {
    if (!state.gameState) return state;
    const newPlayers = { ...state.gameState.players };
    delete newPlayers[playerId];
    return {
      gameState: {
        ...state.gameState,
        players: newPlayers
      }
    };
  }),
  clearGameState: () => set({ gameState: null, prevGameState: null })
}));
