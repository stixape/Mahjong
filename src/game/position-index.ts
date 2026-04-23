import { GridPosition } from './types';
import { isCoveredBy, blocksLeft, blocksRight } from './layout';

export const posKey = (p: GridPosition) => `${p.layer},${p.row},${p.col}`;

export interface PositionIndex {
  coveringMap: Map<string, string[]>;
  leftBlocker: Map<string, string>;
  rightBlocker: Map<string, string>;
}

export function buildPositionIndex(positions: GridPosition[]): PositionIndex {
  const coveringMap = new Map<string, string[]>();
  const leftBlocker = new Map<string, string>();
  const rightBlocker = new Map<string, string>();

  for (const pos of positions) {
    coveringMap.set(posKey(pos), []);
  }

  for (let i = 0; i < positions.length; i++) {
    const a = positions[i];
    const keyA = posKey(a);
    for (let j = i + 1; j < positions.length; j++) {
      const b = positions[j];
      const keyB = posKey(b);

      if (isCoveredBy(a, b)) coveringMap.get(keyA)!.push(keyB);
      if (isCoveredBy(b, a)) coveringMap.get(keyB)!.push(keyA);

      if (a.layer === b.layer && a.row === b.row) {
        if (blocksLeft(a, b)) leftBlocker.set(keyA, keyB);
        if (blocksRight(a, b)) rightBlocker.set(keyA, keyB);
        if (blocksLeft(b, a)) leftBlocker.set(keyB, keyA);
        if (blocksRight(b, a)) rightBlocker.set(keyB, keyA);
      }
    }
  }

  return { coveringMap, leftBlocker, rightBlocker };
}

export function isGameFree(key: string, remaining: Set<string>, index: PositionIndex): boolean {
  const coverers = index.coveringMap.get(key);
  if (coverers) {
    for (const ck of coverers) {
      if (remaining.has(ck)) return false;
    }
  }

  const lk = index.leftBlocker.get(key);
  const rk = index.rightBlocker.get(key);
  const blockedL = lk !== undefined && remaining.has(lk);
  const blockedR = rk !== undefined && remaining.has(rk);

  return !(blockedL && blockedR);
}
