export interface GameState {
  fen: string;
  lastMove: string | null;
  gameOver: boolean;
  turn: 'w' | 'b';
  inCheck: boolean;
  winner: string | null;
}

export interface ChessboardProps {
  position: string;
  onPieceDrop: (source: string, target: string) => boolean;
}

export type LLMProvider = 'gemini' | 'gpt' | null;

export interface ApiKeys {
  gemini: string;
  openai: string;
}

export interface Settings {
  selectedProvider: LLMProvider;
  apiKeys: ApiKeys;
  playerColor: 'w' | 'b';
}

export interface SettingsStore extends Settings {
  setProvider: (provider: LLMProvider) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  setPlayerColor: (color: 'w' | 'b') => void;
}