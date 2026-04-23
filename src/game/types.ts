export enum TileSuit {
  Bamboo = 'bamboo',
  Character = 'character',
  Dot = 'dot',
  Wind = 'wind',
  Dragon = 'dragon',
  Season = 'season',
  Flower = 'flower',
}

export interface TileType {
  suit: TileSuit;
  value: number;
}

export interface GridPosition {
  layer: number;
  row: number;
  col: number;
}

export interface TileInstance {
  id: number;
  type: TileType;
  position: GridPosition;
  matched: boolean;
  inBuffer?: boolean;
}

export type MoveRecord =
  | {
      kind: 'match';
      tile1: TileInstance;
      tile2: TileInstance;
      previousBuffer: number[];
    }
  | {
      kind: 'buffer';
      tile: TileInstance;
      previousBuffer: number[];
    };

export enum GameState {
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  Won = 'won',
  Lost = 'lost',
}

export type SelectionResult =
  | { action: 'select'; tileId: number }
  | { action: 'deselect' }
  | { action: 'match'; tile1Id: number; tile2Id: number }
  | { action: 'reselect'; tileId: number }
  | { action: 'blocked' };
