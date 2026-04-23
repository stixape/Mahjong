// Re-export from layouts.ts for backward compatibility
import { GridPosition } from './types';
import { getLayout, LAYOUTS } from './layouts';

export const TURTLE_LAYOUT = getLayout('turtle');

export { LAYOUTS, getLayout };

// Check if a tile at `above` on a higher layer covers the tile at `below`
export function isCoveredBy(below: GridPosition, above: GridPosition): boolean {
  if (above.layer <= below.layer) return false;
  const rowOverlap = Math.abs(above.row - below.row) < 2;
  const colOverlap = Math.abs(above.col - below.col) < 2;
  return rowOverlap && colOverlap;
}

// Check if `other` blocks `pos` from the left side (same layer)
export function blocksLeft(pos: GridPosition, other: GridPosition): boolean {
  return other.layer === pos.layer && other.row === pos.row && other.col === pos.col - 2;
}

// Check if `other` blocks `pos` from the right side (same layer)
export function blocksRight(pos: GridPosition, other: GridPosition): boolean {
  return other.layer === pos.layer && other.row === pos.row && other.col === pos.col + 2;
}
