import { TileInstance, MoveRecord } from './types';
import { tilesMatch } from './tiles';
import { isCoveredBy, blocksLeft, blocksRight } from './layout';
import { solvableShuffle } from './solvable-shuffle';

export class Board {
  tiles: Map<number, TileInstance>;

  constructor(tiles: TileInstance[]) {
    this.tiles = new Map(tiles.map(t => [t.id, t]));
  }

  private getUnmatchedTiles(): TileInstance[] {
    const result: TileInstance[] = [];
    for (const t of this.tiles.values()) {
      if (!t.matched && !t.inBuffer) result.push(t);
    }
    return result;
  }

  getFreeTiles(): TileInstance[] {
    const unmatched = this.getUnmatchedTiles();
    const result: TileInstance[] = [];
    for (const tile of unmatched) {
      if (this.isFreeAmong(tile, unmatched)) result.push(tile);
    }
    return result;
  }

  isFree(tileId: number): boolean {
    const tile = this.tiles.get(tileId);
    if (!tile || tile.matched || tile.inBuffer) return false;
    return this.isFreeAmong(tile, this.getUnmatchedTiles());
  }

  private isFreeAmong(tile: TileInstance, unmatched: TileInstance[]): boolean {
    let blockedLeft = false;
    let blockedRight = false;
    for (const other of unmatched) {
      if (other.id === tile.id) continue;
      if (isCoveredBy(tile.position, other.position)) return false;
      if (!blockedLeft && blocksLeft(tile.position, other.position)) blockedLeft = true;
      if (!blockedRight && blocksRight(tile.position, other.position)) blockedRight = true;
    }
    return !(blockedLeft && blockedRight);
  }

  hasValidMoves(): boolean {
    const free = this.getFreeTiles();
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (tilesMatch(free[i].type, free[j].type)) return true;
      }
    }
    return false;
  }

  getHint(): [TileInstance, TileInstance] | null {
    const free = this.getFreeTiles();
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (tilesMatch(free[i].type, free[j].type)) return [free[i], free[j]];
      }
    }
    return null;
  }

  removePair(id1: number, id2: number): void {
    const tile1 = this.tiles.get(id1)!;
    const tile2 = this.tiles.get(id2)!;
    tile1.matched = true;
    tile1.inBuffer = false;
    tile2.matched = true;
    tile2.inBuffer = false;
  }

  moveToBuffer(id: number): void {
    const tile = this.tiles.get(id);
    if (!tile || tile.matched) return;
    tile.inBuffer = true;
  }

  restoreTile(snapshot: TileInstance): void {
    const tile = this.tiles.get(snapshot.id);
    if (!tile) return;
    tile.matched = snapshot.matched;
    tile.inBuffer = snapshot.inBuffer;
  }

  undoMove(record: MoveRecord): void {
    if (record.kind === 'match') {
      this.restoreTile(record.tile1);
      this.restoreTile(record.tile2);
      return;
    }

    this.restoreTile(record.tile);
  }

  isCleared(): boolean {
    for (const t of this.tiles.values()) {
      if (!t.matched) return false;
    }
    return true;
  }

  getRemainingCount(): number {
    let count = 0;
    for (const t of this.tiles.values()) {
      if (!t.matched) count++;
    }
    return count;
  }

  shuffle(): void {
    const unmatched = this.getUnmatchedTiles();
    solvableShuffle(unmatched);
  }
}
