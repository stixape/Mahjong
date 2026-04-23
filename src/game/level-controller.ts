import { LAYOUTS } from './layouts';

export interface Level {
  levelID: number;
  layoutType: string;
  tileSetSize: number;
  timeLimit: number | null;
  stars: 0 | 1 | 2 | 3;
}

export interface UserProfile {
  currentLevel: number;
  totalXP: number;
  unlockedLayouts: string[];
  levelStars: Record<number, 0 | 1 | 2 | 3>;
}

export interface LevelCompletion {
  level: Level;
  earnedStars: 0 | 1 | 2 | 3;
  earnedXP: number;
  profile: UserProfile;
  unlockedNextLevel: boolean;
  unlockedLayout: string | null;
}

const USER_PROFILE_KEY = 'mahjong_user_profile';
const MIN_LEVEL = 1;
const MIN_TILE_SET_SIZE = 12;
const MAX_TILE_SET_SIZE = 38;

const LAYOUT_SEQUENCE = [
  'turtle',
  'pyramid',
  'cross',
  'fortress',
  'bridge',
  'diamond',
  'arena',
  'ziggurat',
].filter(layout => layout in LAYOUTS);

const DEFAULT_PROFILE: UserProfile = {
  currentLevel: 1,
  totalXP: 0,
  unlockedLayouts: [LAYOUT_SEQUENCE[0] ?? 'turtle'],
  levelStars: {},
};

function clampLevel(levelNumber: number): number {
  if (!Number.isFinite(levelNumber)) return MIN_LEVEL;
  return Math.max(MIN_LEVEL, Math.floor(levelNumber));
}

function clampStars(stars: number): 0 | 1 | 2 | 3 {
  if (stars >= 3) return 3;
  if (stars >= 2) return 2;
  if (stars >= 1) return 1;
  return 0;
}

function uniqueLayouts(layouts: string[]): string[] {
  const knownLayouts = new Set(LAYOUT_SEQUENCE);
  const result: string[] = [];

  for (const layout of layouts) {
    if (knownLayouts.has(layout) && !result.includes(layout)) {
      result.push(layout);
    }
  }

  return result.length > 0 ? result : [...DEFAULT_PROFILE.unlockedLayouts];
}

export function generateLevelConfig(levelNumber: number): Level {
  const levelID = clampLevel(levelNumber);
  const zeroBasedLevel = levelID - 1;
  const layoutIndex = Math.min(
    Math.floor(zeroBasedLevel / 4),
    LAYOUT_SEQUENCE.length - 1,
  );
  const tileSetSize = Math.min(
    MAX_TILE_SET_SIZE,
    MIN_TILE_SET_SIZE + Math.floor(zeroBasedLevel * 1.5),
  );

  return {
    levelID,
    layoutType: LAYOUT_SEQUENCE[layoutIndex] ?? 'turtle',
    tileSetSize,
    timeLimit: levelID <= 3 ? null : Math.max(240, 780 - zeroBasedLevel * 18),
    stars: 0,
  };
}

export class LevelController {
  private profile: UserProfile;
  private readonly storageKey: string;

  constructor(storageKey = USER_PROFILE_KEY) {
    this.storageKey = storageKey;
    this.profile = this.loadProfile();
  }

  getProfile(): UserProfile {
    return this.cloneProfile(this.profile);
  }

  getCurrentLevel(): Level {
    return this.getLevel(this.profile.currentLevel);
  }

  getLevel(levelNumber: number): Level {
    const level = generateLevelConfig(levelNumber);
    level.stars = this.profile.levelStars[level.levelID] ?? 0;
    return level;
  }

  canPlayLevel(levelNumber: number): boolean {
    return clampLevel(levelNumber) <= this.profile.currentLevel;
  }

  startLevel(levelNumber: number): Level {
    const levelID = clampLevel(levelNumber);
    if (!this.canPlayLevel(levelID)) {
      throw new Error(`Level ${levelID} is locked`);
    }
    return this.getLevel(levelID);
  }

  completeLevel(levelNumber: number, score: number, elapsedSeconds: number): LevelCompletion {
    const level = this.getLevel(levelNumber);
    const previousStars = level.stars;
    const earnedStars = this.calculateStars(level, score, elapsedSeconds);
    const bestStars = clampStars(Math.max(previousStars, earnedStars));
    const earnedXP = this.calculateXP(level, earnedStars, score);

    this.profile.levelStars[level.levelID] = bestStars;
    this.profile.totalXP += earnedXP;

    let unlockedNextLevel = false;
    if (earnedStars > 0 && level.levelID >= this.profile.currentLevel) {
      this.profile.currentLevel = level.levelID + 1;
      unlockedNextLevel = true;
    }

    const nextLevel = generateLevelConfig(this.profile.currentLevel);
    let unlockedLayout: string | null = null;
    if (!this.profile.unlockedLayouts.includes(nextLevel.layoutType)) {
      this.profile.unlockedLayouts.push(nextLevel.layoutType);
      unlockedLayout = nextLevel.layoutType;
    }

    this.saveProfile();

    return {
      level: this.getLevel(level.levelID),
      earnedStars,
      earnedXP,
      profile: this.getProfile(),
      unlockedNextLevel,
      unlockedLayout,
    };
  }

  resetProgress(): UserProfile {
    this.profile = this.cloneProfile(DEFAULT_PROFILE);
    this.saveProfile();
    return this.getProfile();
  }

  saveProfile(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
  }

  private loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return this.cloneProfile(DEFAULT_PROFILE);

      const parsed = JSON.parse(data) as Partial<UserProfile>;
      return {
        currentLevel: clampLevel(parsed.currentLevel ?? DEFAULT_PROFILE.currentLevel),
        totalXP: Math.max(0, Math.floor(parsed.totalXP ?? DEFAULT_PROFILE.totalXP)),
        unlockedLayouts: uniqueLayouts(parsed.unlockedLayouts ?? DEFAULT_PROFILE.unlockedLayouts),
        levelStars: this.normalizeLevelStars(parsed.levelStars ?? {}),
      };
    } catch {
      return this.cloneProfile(DEFAULT_PROFILE);
    }
  }

  private calculateStars(level: Level, score: number, elapsedSeconds: number): 0 | 1 | 2 | 3 {
    if (score <= 0) return 0;
    if (level.timeLimit === null) {
      if (score >= level.tileSetSize * 120) return 3;
      if (score >= level.tileSetSize * 80) return 2;
      return 1;
    }

    if (elapsedSeconds <= level.timeLimit * 0.7 && score >= level.tileSetSize * 110) return 3;
    if (elapsedSeconds <= level.timeLimit && score >= level.tileSetSize * 75) return 2;
    return elapsedSeconds <= level.timeLimit * 1.25 ? 1 : 0;
  }

  private calculateXP(level: Level, earnedStars: 0 | 1 | 2 | 3, score: number): number {
    if (earnedStars === 0) return 0;
    const levelBonus = level.levelID * 10;
    const starBonus = earnedStars * 100;
    const scoreBonus = Math.floor(Math.max(0, score) / 20);
    return levelBonus + starBonus + scoreBonus;
  }

  private normalizeLevelStars(stars: Record<number, 0 | 1 | 2 | 3>): Record<number, 0 | 1 | 2 | 3> {
    const result: Record<number, 0 | 1 | 2 | 3> = {};
    for (const [level, starCount] of Object.entries(stars)) {
      const levelID = clampLevel(Number(level));
      result[levelID] = clampStars(starCount);
    }
    return result;
  }

  private cloneProfile(profile: UserProfile): UserProfile {
    return {
      currentLevel: profile.currentLevel,
      totalXP: profile.totalXP,
      unlockedLayouts: [...profile.unlockedLayouts],
      levelStars: { ...profile.levelStars },
    };
  }
}
