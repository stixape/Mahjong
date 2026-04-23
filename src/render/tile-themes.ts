export type TileDrawStyle = 'classic' | 'ornate' | 'minimal' | 'neon' | 'watercolor' | 'calligraphy';

export interface TileThemeConfig {
  name: string;
  style: TileDrawStyle;
  faceColor: number;
  faceColorTop: number;
  edgeColor: number;
  edgeSideColor: number;
  highlightColor: number;
  borderColor: number;
  innerBorderColor: number;
  bambooColor: number;
  bambooAccent: number;
  bambooHighlight: number;
  dotColor: number;
  characterColor: number;
  textDark: number;
  windColors: number[];     // [East, South, West, North]
  dragonColors: number[];   // [中 Red, 發 Green, 白 Blue]
  seasonColors: number[];   // [春, 夏, 秋, 冬]
  flowerColors: number[];   // [梅, 蘭, 竹, 菊]
  cornerLabelDragon: number;
  cornerLabelSeason: number;
  cornerLabelFlower: number;
  cornerLabelWind: number;
}

const CLASSIC: TileThemeConfig = {
  name: 'Classic',
  style: 'classic',
  faceColor: 0xEDE8D8,
  faceColorTop: 0xF0ECE2,
  edgeColor: 0xB5A884,
  edgeSideColor: 0xAA9D78,
  highlightColor: 0xFFD700,
  borderColor: 0xC0B090,
  innerBorderColor: 0xE0D8C0,
  bambooColor: 0x1B7A2B,
  bambooAccent: 0x145E20,
  bambooHighlight: 0x4ABA4A,
  dotColor: 0x1E56A0,
  characterColor: 0xCC2222,
  textDark: 0x222222,
  windColors: [0x1E56A0, 0x1B7A2B, 0x888888, 0xCC2222],
  dragonColors: [0xCC2222, 0x1B7A2B, 0x2244AA],
  seasonColors: [0x1B7A2B, 0xCC2222, 0xCC8800, 0x1E56A0],
  flowerColors: [0xCC2266, 0x7744CC, 0x1B7A2B, 0xCC8800],
  cornerLabelDragon: 0x333333,
  cornerLabelSeason: 0x6B4226,
  cornerLabelFlower: 0xB8338A,
  cornerLabelWind: 0x555555,
};

const JADE: TileThemeConfig = {
  name: 'Jade',
  style: 'ornate',
  faceColor: 0xD5E5D6,
  faceColorTop: 0xE2EBE3,
  edgeColor: 0x76B879,
  edgeSideColor: 0x66BB6A,
  highlightColor: 0xFFD700,
  borderColor: 0x7CB77F,
  innerBorderColor: 0xC8E6C9,
  bambooColor: 0x2E7D32,
  bambooAccent: 0x1B5E20,
  bambooHighlight: 0x66BB6A,
  dotColor: 0x00695C,
  characterColor: 0xB71C1C,
  textDark: 0x1B5E20,
  windColors: [0x1565C0, 0x2E7D32, 0x546E7A, 0xC62828],
  dragonColors: [0xC62828, 0x2E7D32, 0x1565C0],
  seasonColors: [0x2E7D32, 0xC62828, 0xE65100, 0x1565C0],
  flowerColors: [0xAD1457, 0x6A1B9A, 0x2E7D32, 0xE65100],
  cornerLabelDragon: 0x2E7D32,
  cornerLabelSeason: 0x33691E,
  cornerLabelFlower: 0x880E4F,
  cornerLabelWind: 0x37474F,
};

const IVORY: TileThemeConfig = {
  name: 'Ivory',
  style: 'minimal',
  faceColor: 0xEDE8D5,
  faceColorTop: 0xF0ECDE,
  edgeColor: 0xC4BA83,
  edgeSideColor: 0xC0B46E,
  highlightColor: 0xFFB300,
  borderColor: 0xCDBE7A,
  innerBorderColor: 0xF0E8C0,
  bambooColor: 0x558B2F,
  bambooAccent: 0x33691E,
  bambooHighlight: 0x8BC34A,
  dotColor: 0x1565C0,
  characterColor: 0xBF360C,
  textDark: 0x3E2723,
  windColors: [0x0D47A1, 0x1B5E20, 0x757575, 0xBF360C],
  dragonColors: [0xBF360C, 0x33691E, 0x0D47A1],
  seasonColors: [0x33691E, 0xBF360C, 0xE65100, 0x0D47A1],
  flowerColors: [0xC2185B, 0x7B1FA2, 0x33691E, 0xEF6C00],
  cornerLabelDragon: 0x4E342E,
  cornerLabelSeason: 0x5D4037,
  cornerLabelFlower: 0x880E4F,
  cornerLabelWind: 0x424242,
};

const MIDNIGHT: TileThemeConfig = {
  name: 'Midnight',
  style: 'neon',
  faceColor: 0x2A2A44,
  faceColorTop: 0x323250,
  edgeColor: 0x1E1E38,
  edgeSideColor: 0x14142A,
  highlightColor: 0x00E5FF,
  borderColor: 0x3A3A5E,
  innerBorderColor: 0x444470,
  bambooColor: 0x00E676,
  bambooAccent: 0x00C853,
  bambooHighlight: 0x69F0AE,
  dotColor: 0x448AFF,
  characterColor: 0xFF5252,
  textDark: 0xCCCCCC,
  windColors: [0x448AFF, 0x00E676, 0xB0BEC5, 0xFF5252],
  dragonColors: [0xFF5252, 0x00E676, 0x448AFF],
  seasonColors: [0x00E676, 0xFF5252, 0xFFAB40, 0x448AFF],
  flowerColors: [0xFF4081, 0xE040FB, 0x00E676, 0xFFAB40],
  cornerLabelDragon: 0x90A4AE,
  cornerLabelSeason: 0x78909C,
  cornerLabelFlower: 0xCE93D8,
  cornerLabelWind: 0x90A4AE,
};

const CORAL: TileThemeConfig = {
  name: 'Coral',
  style: 'watercolor',
  faceColor: 0xEDE2D2,
  faceColorTop: 0xF0E8DE,
  edgeColor: 0xD49A70,
  edgeSideColor: 0xD49060,
  highlightColor: 0xFF6D00,
  borderColor: 0xDCA080,
  innerBorderColor: 0xF0D8C0,
  bambooColor: 0x00897B,
  bambooAccent: 0x00695C,
  bambooHighlight: 0x4DB6AC,
  dotColor: 0x5C6BC0,
  characterColor: 0xE53935,
  textDark: 0x3E2723,
  windColors: [0x3949AB, 0x00897B, 0x78909C, 0xE53935],
  dragonColors: [0xE53935, 0x00897B, 0x3949AB],
  seasonColors: [0x00897B, 0xE53935, 0xFF8F00, 0x3949AB],
  flowerColors: [0xD81B60, 0x8E24AA, 0x00897B, 0xFF8F00],
  cornerLabelDragon: 0x4E342E,
  cornerLabelSeason: 0x6D4C41,
  cornerLabelFlower: 0xAD1457,
  cornerLabelWind: 0x546E7A,
};

const INK: TileThemeConfig = {
  name: 'Ink',
  style: 'calligraphy',
  faceColor: 0xE8E8E8,
  faceColorTop: 0xF0F0F0,
  edgeColor: 0xBCBCBC,
  edgeSideColor: 0xAAAAAA,
  highlightColor: 0xD50000,
  borderColor: 0xBBBBBB,
  innerBorderColor: 0xE0E0E0,
  bambooColor: 0x212121,
  bambooAccent: 0x000000,
  bambooHighlight: 0x757575,
  dotColor: 0x212121,
  characterColor: 0xD50000,
  textDark: 0x000000,
  windColors: [0x212121, 0x424242, 0x616161, 0xD50000],
  dragonColors: [0xD50000, 0x212121, 0x424242],
  seasonColors: [0x212121, 0xD50000, 0x424242, 0x212121],
  flowerColors: [0xD50000, 0x424242, 0x212121, 0x616161],
  cornerLabelDragon: 0x424242,
  cornerLabelSeason: 0x616161,
  cornerLabelFlower: 0xD50000,
  cornerLabelWind: 0x616161,
};

export const TILE_THEMES: Record<string, TileThemeConfig> = {
  classic:  CLASSIC,
  jade:     JADE,
  ivory:    IVORY,
  midnight: MIDNIGHT,
  coral:    CORAL,
  ink:      INK,
};

export function getTileTheme(key: string): TileThemeConfig {
  return TILE_THEMES[key] ?? CLASSIC;
}
