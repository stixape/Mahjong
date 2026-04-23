import { TileInstance, TileType, GridPosition } from './types';
import { createTileSet, tilesMatch } from './tiles';
import { TURTLE_LAYOUT } from './layout';
import { posKey, buildPositionIndex, isGameFree, PositionIndex } from './position-index';
import { LevelGenerationOptions } from './challenge-levels';

type RandomFn = () => number;

function seededRandom(seed: number): RandomFn {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffleArray<T>(arr: T[], random: RandomFn = Math.random): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function tileIdentityKey(tile: TileType): string {
  return (tile.suit === 'season' || tile.suit === 'flower') ? tile.suit : `${tile.suit}:${tile.value}`;
}

function createRestrictedPairsPool(pairCount: number, tileSetSize: number, random: RandomFn): TileType[][] {
  const tileSet = createTileSet();
  const identities = new Map<string, TileType>();
  for (const tile of tileSet) {
    const key = tileIdentityKey(tile);
    if (!identities.has(key)) identities.set(key, tile);
  }

  const selected = shuffleArray([...identities.values()], random).slice(0, Math.max(2, tileSetSize));
  const pairs: TileType[][] = [];
  for (let i = 0; i < pairCount; i++) {
    const type = selected[i % selected.length];
    pairs.push([{ ...type }, { ...type }]);
  }
  return shuffleArray(pairs, random);
}

function createPairsPool(pairCount: number, options: LevelGenerationOptions | undefined, random: RandomFn): TileType[][] {
  if (options) {
    return createRestrictedPairsPool(pairCount, options.tileSetSize, random);
  }

  const tileSet = createTileSet();
  const pairs: TileType[][] = [];
  const used = new Set<number>();

  for (let i = 0; i < tileSet.length; i++) {
    if (used.has(i)) continue;
    for (let j = i + 1; j < tileSet.length; j++) {
      if (used.has(j)) continue;
      if (tilesMatch(tileSet[i], tileSet[j])) {
        pairs.push([tileSet[i], tileSet[j]]);
        used.add(i);
        used.add(j);
        break;
      }
    }
  }

  return shuffleArray(pairs, random);
}

function choosePairPositions(freeKeys: string[], random: RandomFn, targetMoveDensity: number): [string, string] {
  const density = Math.max(0, Math.min(1, targetMoveDensity));
  const windowSize = Math.max(2, Math.round(2 + (freeKeys.length - 2) * density));
  const candidates = freeKeys.slice(0, windowSize);
  const i0 = Math.floor(random() * candidates.length);
  let i1 = Math.floor(random() * (candidates.length - 1));
  if (i1 >= i0) i1++;
  return [candidates[i0], candidates[i1]];
}

function tryGenerateReverseDeal(
  layout: GridPosition[],
  index: PositionIndex,
  options: LevelGenerationOptions | undefined,
  random: RandomFn,
): TileInstance[] | null {
  const positions = layout;
  const pairs = createPairsPool(Math.floor(positions.length / 2), options, random);
  const remaining = new Set(positions.map(p => posKey(p)));
  const typeAssignment = new Map<string, TileType>();
  let pairIndex = 0;

  while (remaining.size > 0 && pairIndex < pairs.length) {
    const freeKeys: string[] = [];
    for (const key of remaining) {
      if (isGameFree(key, remaining, index)) {
        freeKeys.push(key);
      }
    }

    if (freeKeys.length < 2) return null;

    const sortedFreeKeys = shuffleArray(freeKeys, random).sort((a, b) => {
      const aPressure = (index.coveringMap.get(a)?.length ?? 0);
      const bPressure = (index.coveringMap.get(b)?.length ?? 0);
      return options && options.targetMoveDensity < 0.45 ? bPressure - aPressure : aPressure - bPressure;
    });
    const [keyA, keyB] = choosePairPositions(
      sortedFreeKeys,
      random,
      options?.targetMoveDensity ?? 1,
    );

    const [typeA, typeB] = pairs[pairIndex++];
    typeAssignment.set(keyA, typeA);
    typeAssignment.set(keyB, typeB);

    remaining.delete(keyA);
    remaining.delete(keyB);
  }

  if (remaining.size > 0) return null;

  let nextId = 0;
  return positions.map(pos => ({
    id: nextId++,
    type: typeAssignment.get(posKey(pos))!,
    position: pos,
    matched: false,
  }));
}

export function generateSolvableBoard(
  layout?: GridPosition[],
  optionsOrMaxAttempts?: LevelGenerationOptions | number,
  maxAttempts = 50,
): TileInstance[] {
  if (typeof optionsOrMaxAttempts === 'number') {
    return generateSolvableBoardWithOptions(layout, undefined, optionsOrMaxAttempts);
  }

  return generateSolvableBoardWithOptions(layout, optionsOrMaxAttempts, maxAttempts);
}

export function generateSolvableBoardWithOptions(
  layout?: GridPosition[],
  options?: LevelGenerationOptions,
  maxAttempts = 50,
): TileInstance[] {
  const positions = layout ?? TURTLE_LAYOUT;
  const index = buildPositionIndex(positions);
  const random = options ? seededRandom(options.seed) : Math.random;

  for (let i = 0; i < maxAttempts; i++) {
    const result = tryGenerateReverseDeal(positions, index, options, random);
    if (result && result.length === positions.length) return result;
  }

  console.warn('Could not generate solvable board, using random placement');
  const pairTypes = createPairsPool(Math.floor(positions.length / 2), options, random).flat();
  const tileSet = shuffleArray(pairTypes.length >= positions.length ? pairTypes : createTileSet(), random);
  return positions.map((pos, i) => ({
    id: i,
    type: tileSet[i],
    position: pos,
    matched: false,
  }));
}
