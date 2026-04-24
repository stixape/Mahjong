export type DifficultyBand = 'beginner' | 'intermediate' | 'expert';

export interface LevelGenerationOptions {
  seed: number;
  tileSetSize: number;
  targetMoveDensity: number;
}

export interface ChallengeLevelConfig {
  levelID: number;
  layoutType: string;
  tileSetSize: number;
  timeLimit: number;
  shuffleLimit: number;
  hintLimit: number;
  undoLimit: number;
  targetMoveDensity: number;
  difficultyBand: DifficultyBand;
  generation: LevelGenerationOptions;
}

const BEGINNER_LAYOUTS = ['turtle', 'pyramid', 'cross'];
const INTERMEDIATE_LAYOUTS = ['pyramid', 'cross', 'fortress', 'bridge', 'diamond'];
const EXPERT_LAYOUTS = ['fortress', 'bridge', 'diamond', 'arena', 'ziggurat'];

function bandForLevel(levelID: number): DifficultyBand {
  if (levelID <= 20) return 'beginner';
  if (levelID <= 60) return 'intermediate';
  return 'expert';
}

function layoutForLevel(levelID: number, band: DifficultyBand): string {
  const layouts = band === 'beginner'
    ? BEGINNER_LAYOUTS
    : band === 'intermediate'
      ? INTERMEDIATE_LAYOUTS
      : EXPERT_LAYOUTS;
  return layouts[(levelID - 1) % layouts.length];
}

export function createChallengeLevel(levelID: number): ChallengeLevelConfig {
  const normalizedLevel = Math.min(100, Math.max(1, Math.floor(levelID)));
  const band = bandForLevel(normalizedLevel);
  const progress = (normalizedLevel - 1) / 99;
  const tileSetSize = Math.min(38, Math.round(10 + progress * 28));
  const timeLimit = Math.max(210, Math.round(780 - progress * 420));
  const shuffleLimit = band === 'beginner'
    ? Math.max(3, 8 - Math.floor((normalizedLevel - 1) / 4))
    : band === 'intermediate'
      ? Math.max(1, 5 - Math.floor((normalizedLevel - 21) / 10))
      : normalizedLevel < 80 ? 1 : 0;
  const undoLimit = band === 'beginner'
    ? Math.max(4, 9 - Math.floor((normalizedLevel - 1) / 4))
    : band === 'intermediate'
      ? Math.max(1, 4 - Math.floor((normalizedLevel - 21) / 12))
      : normalizedLevel < 85 ? 1 : 0;
  const hintLimit = band === 'beginner'
    ? Math.max(5, 12 - Math.floor((normalizedLevel - 1) / 3))
    : band === 'intermediate'
      ? Math.max(2, 7 - Math.floor((normalizedLevel - 21) / 8))
      : normalizedLevel < 85 ? 1 : 0;
  const targetMoveDensity = Math.max(0.15, Number((0.9 - progress * 0.72).toFixed(2)));

  return {
    levelID: normalizedLevel,
    layoutType: layoutForLevel(normalizedLevel, band),
    tileSetSize,
    timeLimit,
    shuffleLimit,
    hintLimit,
    undoLimit,
    targetMoveDensity,
    difficultyBand: band,
    generation: {
      seed: 100_000 + normalizedLevel * 9_973,
      tileSetSize,
      targetMoveDensity,
    },
  };
}

export const CHALLENGE_LEVELS: ChallengeLevelConfig[] = Array.from(
  { length: 100 },
  (_, index) => createChallengeLevel(index + 1),
);

export function getChallengeLevel(levelID: number): ChallengeLevelConfig {
  return CHALLENGE_LEVELS[Math.min(99, Math.max(0, Math.floor(levelID) - 1))];
}
