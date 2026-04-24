import { MoveRecord, TileInstance } from './types';

export type PlayMode = 'challenge' | 'freePlay';

export interface SavedGameState {
  mode?: PlayMode;
  tiles: TileInstance[];
  tileBuffer?: number[];
  undoStack: MoveRecord[];
  score?: number;
  activeLevel?: number;
  elapsedSeconds?: number;
  hintsRemaining?: number;
  shufflesRemaining?: number;
  undosRemaining?: number;
}

const GAME_STATE_KEY = 'mahjong_game_state';
const CHALLENGE_GAME_STATE_KEY = 'mahjong_game_state_challenge';
const FREE_PLAY_GAME_STATE_KEY = 'mahjong_game_state_free_play';
const SETTINGS_KEY = 'mahjong_settings';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: string;
  layout: string;
  tileTheme: string;
  performanceMode: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  theme: 'classic',
  layout: 'turtle',
  tileTheme: 'classic',
  performanceMode: false,
};

function keyForMode(mode: PlayMode): string {
  return mode === 'challenge' ? CHALLENGE_GAME_STATE_KEY : FREE_PLAY_GAME_STATE_KEY;
}

export function saveGameState(state: SavedGameState, mode: PlayMode = state.mode ?? 'freePlay'): void {
  try {
    localStorage.setItem(keyForMode(mode), JSON.stringify({ ...state, mode }));
  } catch (e) {
    console.warn('Failed to save game state', e);
  }
}

export function loadGameState(mode?: PlayMode): SavedGameState | null {
  try {
    const data = mode
      ? localStorage.getItem(keyForMode(mode))
      : localStorage.getItem(FREE_PLAY_GAME_STATE_KEY)
        ?? localStorage.getItem(CHALLENGE_GAME_STATE_KEY)
        ?? localStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearGameState(mode?: PlayMode): void {
  if (mode) {
    localStorage.removeItem(keyForMode(mode));
    if (mode === 'freePlay') localStorage.removeItem(GAME_STATE_KEY);
    return;
  }

  localStorage.removeItem(CHALLENGE_GAME_STATE_KEY);
  localStorage.removeItem(FREE_PLAY_GAME_STATE_KEY);
  localStorage.removeItem(GAME_STATE_KEY);
}

export function hasSavedGame(mode: PlayMode): boolean {
  return loadGameState(mode) !== null || (mode === 'freePlay' && loadLegacyFreePlayState() !== null);
}

export function loadLegacyFreePlayState(): SavedGameState | null {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): GameSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
