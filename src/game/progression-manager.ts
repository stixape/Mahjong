import { LAYOUTS } from './layouts';
import { TILE_THEMES } from '../render/tile-themes';
import { BACKGROUND_THEMES } from '../render/background';
import { ChallengeLevelConfig, getChallengeLevel } from './challenge-levels';

export type AssetType = 'layout' | 'skin' | 'background';

export interface UnlockableAsset {
  assetID: string;
  name: string;
  type: AssetType;
  requiredLevel: number;
}

export interface ProgressionProfile {
  currentLevel: number;
  highestLevel: number;
  totalXP: number;
  unlockedLayouts: string[];
  unlockedSkins: string[];
  unlockedBackgrounds: string[];
}

export interface LevelCompletionResult {
  score: number;
  timeTaken: number;
  profile: ProgressionProfile;
  unlockedAssets: UnlockableAsset[];
}

export const progressionLayouts: UnlockableAsset[] = [
  { assetID: 'turtle', name: LAYOUTS.turtle?.name ?? 'Turtle', type: 'layout', requiredLevel: 1 },
  { assetID: 'pyramid', name: LAYOUTS.pyramid?.name ?? 'Pyramid', type: 'layout', requiredLevel: 3 },
  { assetID: 'cross', name: LAYOUTS.cross?.name ?? 'Cross', type: 'layout', requiredLevel: 5 },
  { assetID: 'fortress', name: LAYOUTS.fortress?.name ?? 'Fortress', type: 'layout', requiredLevel: 8 },
  { assetID: 'bridge', name: LAYOUTS.bridge?.name ?? 'Bridge', type: 'layout', requiredLevel: 11 },
  { assetID: 'diamond', name: LAYOUTS.diamond?.name ?? 'Diamond', type: 'layout', requiredLevel: 14 },
  { assetID: 'arena', name: LAYOUTS.arena?.name ?? 'Arena', type: 'layout', requiredLevel: 18 },
  { assetID: 'ziggurat', name: LAYOUTS.ziggurat?.name ?? 'Ziggurat', type: 'layout', requiredLevel: 22 },
];

export const progressionSkins: UnlockableAsset[] = [
  { assetID: 'classic', name: TILE_THEMES.classic?.name ?? 'Classic', type: 'skin', requiredLevel: 1 },
  { assetID: 'jade', name: TILE_THEMES.jade?.name ?? 'Jade', type: 'skin', requiredLevel: 4 },
  { assetID: 'ivory', name: TILE_THEMES.ivory?.name ?? 'Ivory', type: 'skin', requiredLevel: 7 },
  { assetID: 'midnight', name: TILE_THEMES.midnight?.name ?? 'Midnight', type: 'skin', requiredLevel: 10 },
  { assetID: 'coral', name: TILE_THEMES.coral?.name ?? 'Coral', type: 'skin', requiredLevel: 13 },
  { assetID: 'ink', name: TILE_THEMES.ink?.name ?? 'Ink', type: 'skin', requiredLevel: 16 },
];

export const progressionBackgrounds: UnlockableAsset[] = ([
  { assetID: 'classic', name: BACKGROUND_THEMES.classic?.name ?? 'Classic', type: 'background', requiredLevel: 1 },
  { assetID: 'sunset', name: BACKGROUND_THEMES.sunset?.name ?? 'Sunset', type: 'background', requiredLevel: 6 },
  { assetID: 'bamboo', name: BACKGROUND_THEMES.bamboo?.name ?? 'Bamboo', type: 'background', requiredLevel: 12 },
  { assetID: 'mountain', name: BACKGROUND_THEMES.mountain?.name ?? 'Mountain', type: 'background', requiredLevel: 20 },
] as UnlockableAsset[]).filter(asset => asset.assetID in BACKGROUND_THEMES);

const PROFILE_KEY = 'mahjong_progression_profile';
const COMBO_WINDOW_MS = 3000;
const BASE_MATCH_POINTS = 100;

const DEFAULT_PROFILE: ProgressionProfile = {
  currentLevel: 1,
  highestLevel: 1,
  totalXP: 0,
  unlockedLayouts: ['turtle'],
  unlockedSkins: ['classic'],
  unlockedBackgrounds: [progressionBackgrounds[0]?.assetID ?? 'classic'],
};

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 1;
  return Math.max(1, Math.floor(level));
}

export class ProgressionManager {
  private profile: ProgressionProfile;
  private activeLevel: number;
  private activeLevelConfig: ChallengeLevelConfig;
  private comboTimeout: number | null = null;

  comboCount = 0;
  comboTimer = 0;

  constructor(private readonly storageKey = PROFILE_KEY) {
    this.profile = this.loadProfile();
    this.activeLevel = this.profile.currentLevel;
    this.activeLevelConfig = getChallengeLevel(this.activeLevel);
  }

  getProfile(): ProgressionProfile {
    return this.cloneProfile(this.profile);
  }

  getLevelConfig(levelNumber = this.activeLevel): ChallengeLevelConfig {
    return getChallengeLevel(levelNumber);
  }

  startLevel(levelNumber: number): void {
    this.activeLevel = clampLevel(levelNumber);
    this.activeLevelConfig = getChallengeLevel(this.activeLevel);
    this.profile.currentLevel = this.activeLevel;
    this.resetCombo();
    this.saveProfile();
  }

  handleLevelComplete(score: number, timeTaken: number): LevelCompletionResult {
    const level = this.activeLevel;
    const previousHighest = this.profile.highestLevel;
    const previousUnlocked = this.getUnlockedAssetIDs();

    this.profile.totalXP += this.calculateXP(score, timeTaken);

    if (level >= this.profile.highestLevel) {
      this.profile.highestLevel = Math.min(100, level + 1);
      this.profile.currentLevel = Math.min(100, level + 1);
    }

    this.syncUnlockedAssets();
    this.saveProfile();
    this.resetCombo();

    const unlockedAssets = this.getAllAssets().filter(asset => (
      !previousUnlocked.has(asset.assetID)
      && asset.requiredLevel <= this.profile.highestLevel
      && this.profile.highestLevel > previousHighest
    ));

    return {
      score,
      timeTaken,
      profile: this.getProfile(),
      unlockedAssets,
    };
  }

  isAssetAccessible(assetID: string): boolean {
    const asset = this.getAllAssets().find(item => item.assetID === assetID);
    if (!asset) return false;
    return asset.requiredLevel <= this.profile.highestLevel;
  }

  getAccessibleLayouts(): string[] {
    return [...this.profile.unlockedLayouts];
  }

  getAccessibleTileThemes(): string[] {
    return [...this.profile.unlockedSkins];
  }

  getAccessibleBackgrounds(): string[] {
    return [...this.profile.unlockedBackgrounds];
  }

  recordSuccessfulMatch(basePoints = BASE_MATCH_POINTS): number {
    if (this.comboTimer > 0) {
      this.comboCount += 1;
    } else {
      this.comboCount = 1;
    }

    this.resetComboTimer();
    return basePoints * this.comboCount;
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.comboTimer = 0;
    if (this.comboTimeout !== null) {
      window.clearTimeout(this.comboTimeout);
      this.comboTimeout = null;
    }
  }

  private resetComboTimer(): void {
    this.comboTimer = COMBO_WINDOW_MS;
    if (this.comboTimeout !== null) {
      window.clearTimeout(this.comboTimeout);
    }

    const startedAt = Date.now();
    this.comboTimeout = window.setTimeout(() => {
      const elapsed = Date.now() - startedAt;
      this.comboTimer = Math.max(0, COMBO_WINDOW_MS - elapsed);
      if (this.comboTimer === 0) {
        this.comboCount = 0;
        this.comboTimeout = null;
      }
    }, COMBO_WINDOW_MS);
  }

  private calculateXP(score: number, timeTaken: number): number {
    const levelBonus = this.activeLevel * 25;
    const scoreBonus = Math.floor(Math.max(0, score) / 25);
    const timeBonus = Math.max(0, Math.floor((this.activeLevelConfig.timeLimit - timeTaken) / 15));
    return levelBonus + scoreBonus + timeBonus;
  }

  private syncUnlockedAssets(): void {
    this.profile.unlockedLayouts = progressionLayouts
      .filter(asset => asset.requiredLevel <= this.profile.highestLevel)
      .map(asset => asset.assetID);
    this.profile.unlockedSkins = progressionSkins
      .filter(asset => asset.requiredLevel <= this.profile.highestLevel)
      .map(asset => asset.assetID);
    this.profile.unlockedBackgrounds = progressionBackgrounds
      .filter(asset => asset.requiredLevel <= this.profile.highestLevel)
      .map(asset => asset.assetID);
  }

  private getUnlockedAssetIDs(): Set<string> {
    return new Set([...this.profile.unlockedLayouts, ...this.profile.unlockedSkins, ...this.profile.unlockedBackgrounds]);
  }

  private getAllAssets(): UnlockableAsset[] {
    return [...progressionLayouts, ...progressionSkins, ...progressionBackgrounds];
  }

  private loadProfile(): ProgressionProfile {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return this.cloneProfile(DEFAULT_PROFILE);

      const parsed = JSON.parse(data) as Partial<ProgressionProfile>;
      const highestLevel = clampLevel(parsed.highestLevel ?? parsed.currentLevel ?? 1);
      const profile: ProgressionProfile = {
        currentLevel: clampLevel(parsed.currentLevel ?? highestLevel),
        highestLevel,
        totalXP: Math.max(0, Math.floor(parsed.totalXP ?? 0)),
        unlockedLayouts: Array.isArray(parsed.unlockedLayouts) ? parsed.unlockedLayouts : [],
        unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : [],
        unlockedBackgrounds: Array.isArray(parsed.unlockedBackgrounds) ? parsed.unlockedBackgrounds : [],
      };

      this.profile = profile;
      this.syncUnlockedAssets();
      return this.cloneProfile(this.profile);
    } catch {
      return this.cloneProfile(DEFAULT_PROFILE);
    }
  }

  private saveProfile(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Failed to save progression profile', e);
    }
  }

  private cloneProfile(profile: ProgressionProfile): ProgressionProfile {
    return {
      currentLevel: profile.currentLevel,
      highestLevel: profile.highestLevel,
      totalXP: profile.totalXP,
      unlockedLayouts: [...profile.unlockedLayouts],
      unlockedSkins: [...profile.unlockedSkins],
      unlockedBackgrounds: [...profile.unlockedBackgrounds],
    };
  }
}
