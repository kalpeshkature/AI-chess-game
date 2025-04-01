import { create } from 'zustand';
import type { SettingsStore } from '../types';

export const useSettings = create<SettingsStore>((set) => ({
  selectedProvider: null,
  apiKeys: {
    gemini: '',
    openai: ''
  },
  playerColor: 'w',
  setProvider: (provider) => set({ selectedProvider: provider }),
  setApiKey: (provider, key) => set((state) => ({
    apiKeys: { ...state.apiKeys, [provider]: key }
  })),
  setPlayerColor: (color) => set({ playerColor: color })
}));