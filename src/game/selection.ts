import { SelectionResult } from './types';
import { Board } from './board';
import { tilesMatch } from './tiles';

export class SelectionManager {
  selectedTileId: number | null = null;

  handleTileClick(tileId: number, board: Board): SelectionResult {
    if (!board.isFree(tileId)) {
      return { action: 'blocked' };
    }

    if (this.selectedTileId === null) {
      this.selectedTileId = tileId;
      return { action: 'select', tileId };
    }

    if (this.selectedTileId === tileId) {
      this.selectedTileId = null;
      return { action: 'deselect' };
    }

    const selectedTile = board.tiles.get(this.selectedTileId)!;
    const clickedTile = board.tiles.get(tileId)!;

    if (tilesMatch(selectedTile.type, clickedTile.type)) {
      const tile1Id = this.selectedTileId;
      this.selectedTileId = null;
      return { action: 'match', tile1Id, tile2Id: tileId };
    }

    this.selectedTileId = tileId;
    return { action: 'reselect', tileId };
  }

  clear(): void {
    this.selectedTileId = null;
  }
}
