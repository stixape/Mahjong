import { TileInstance, TileType } from './types';
import { posKey, buildPositionIndex, isGameFree, PositionIndex } from './position-index';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createPairsFromTypes(types: TileType[]): TileType[][] {
  const groups = new Map<string, TileType[]>();
  for (const t of types) {
    const key = (t.suit === 'season' || t.suit === 'flower') ? t.suit : `${t.suit}:${t.value}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const pairs: TileType[][] = [];
  for (const group of groups.values()) {
    for (let i = 0; i + 1 < group.length; i += 2) {
      pairs.push([group[i], group[i + 1]]);
    }
  }

  return shuffleArray(pairs);
}

function tryReverseDealShuffle(tiles: TileInstance[], index: PositionIndex): Map<string, TileType> | null {
  const positions = tiles.map(t => t.position);
  const types = tiles.map(t => ({ ...t.type }));
  const pairs = createPairsFromTypes(types);

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

    const len = freeKeys.length;
    const i0 = Math.floor(Math.random() * len);
    let i1 = Math.floor(Math.random() * (len - 1));
    if (i1 >= i0) i1++;

    const [typeA, typeB] = pairs[pairIndex++];
    typeAssignment.set(freeKeys[i0], typeA);
    typeAssignment.set(freeKeys[i1], typeB);

    remaining.delete(freeKeys[i0]);
    remaining.delete(freeKeys[i1]);
  }

  if (remaining.size > 0) return null;
  return typeAssignment;
}

export function solvableShuffle(tiles: TileInstance[]): void {
  const positions = tiles.map(t => t.position);
  const index = buildPositionIndex(positions);

  for (let attempt = 0; attempt < 30; attempt++) {
    const assignment = tryReverseDealShuffle(tiles, index);
    if (assignment) {
      for (const tile of tiles) {
        const key = posKey(tile.position);
        const newType = assignment.get(key);
        if (newType) tile.type = newType;
      }
      return;
    }
  }

  console.warn('Solvable shuffle failed, using random shuffle');
  const types = tiles.map(t => ({ ...t.type }));
  const shuffled = shuffleArray(types);
  tiles.forEach((tile, i) => { tile.type = shuffled[i]; });
}
