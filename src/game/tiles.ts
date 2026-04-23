import { TileSuit, TileType } from './types';

export function createTileSet(): TileType[] {
  const tiles: TileType[] = [];

  // Number suits: 9 values x 4 copies each = 108 tiles
  for (const suit of [TileSuit.Bamboo, TileSuit.Character, TileSuit.Dot]) {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({ suit, value });
      }
    }
  }

  // Winds: 4 values x 4 copies = 16 tiles
  for (let value = 1; value <= 4; value++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({ suit: TileSuit.Wind, value });
    }
  }

  // Dragons: 3 values x 4 copies = 12 tiles
  for (let value = 1; value <= 3; value++) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({ suit: TileSuit.Dragon, value });
    }
  }

  // Seasons: 4 unique tiles (all match each other)
  for (let value = 1; value <= 4; value++) {
    tiles.push({ suit: TileSuit.Season, value });
  }

  // Flowers: 4 unique tiles (all match each other)
  for (let value = 1; value <= 4; value++) {
    tiles.push({ suit: TileSuit.Flower, value });
  }

  return tiles; // 144 total
}

export function tilesMatch(a: TileType, b: TileType): boolean {
  if (a.suit !== b.suit) return false;
  // Seasons match any other season, Flowers match any other flower
  if (a.suit === TileSuit.Season || a.suit === TileSuit.Flower) return true;
  return a.value === b.value;
}

// Display labels for tile symbols
const WIND_NAMES = ['', 'E', 'S', 'W', 'N'];
const DRAGON_NAMES = ['', '中', '發', '白'];
const SEASON_NAMES = ['', '春', '夏', '秋', '冬'];
const FLOWER_NAMES = ['', '梅', '蘭', '竹', '菊'];

export function getTileLabel(type: TileType): string {
  switch (type.suit) {
    case TileSuit.Bamboo: return `${type.value}`;
    case TileSuit.Character: return `${type.value}`;
    case TileSuit.Dot: return `${type.value}`;
    case TileSuit.Wind: return WIND_NAMES[type.value];
    case TileSuit.Dragon: return DRAGON_NAMES[type.value];
    case TileSuit.Season: return SEASON_NAMES[type.value];
    case TileSuit.Flower: return FLOWER_NAMES[type.value];
  }
}

export function getSuitLabel(suit: TileSuit): string {
  switch (suit) {
    case TileSuit.Bamboo: return '竹';
    case TileSuit.Character: return '萬';
    case TileSuit.Dot: return '筒';
    case TileSuit.Wind: return '風';
    case TileSuit.Dragon: return '龍';
    case TileSuit.Season: return '季';
    case TileSuit.Flower: return '花';
  }
}
