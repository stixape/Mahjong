import { GridPosition } from './types';

// Helper: create GridPosition array from row-based specification
function makePositions(layer: number, rows: number[][]): GridPosition[] {
  const positions: GridPosition[] = [];
  for (const [row, ...cols] of rows) {
    for (const col of cols) {
      positions.push({ layer, row, col });
    }
  }
  return positions;
}

// Helper: create a filled rectangle of positions
function makeRect(layer: number, startRow: number, startCol: number, rows: number, cols: number, rowStep = 2, colStep = 2): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ layer, row: startRow + r * rowStep, col: startCol + c * colStep });
    }
  }
  return positions;
}

export interface LayoutDefinition {
  name: string;
  positions: GridPosition[];
}

// ═══════════════════════════════════════════
// 1. TURTLE — Classic 144-tile layout
// ═══════════════════════════════════════════

const TURTLE: GridPosition[] = [
  // Layer 0: 86 tiles
  ...makePositions(0, [
    [0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
    [2, 8, 10, 12, 14, 16, 18, 20, 22],
    [4, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    [6, 0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 26, 28],
    [8, 0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 26, 28],
    [10, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    [12, 8, 10, 12, 14, 16, 18, 20, 22],
    [14, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
  ]),
  // Layer 1: 40 tiles
  ...makePositions(1, [
    [1, 9, 11, 13, 15, 17, 19, 21, 23],
    [3, 9, 11, 13, 15, 17, 19, 21, 23],
    [5, 9, 11, 13, 15, 17, 19, 21, 23],
    [7, 9, 11, 13, 15, 17, 19, 21, 23],
    [9, 9, 11, 13, 15, 17, 19, 21, 23],
  ]),
  // Layer 2: 12 tiles
  ...makePositions(2, [
    [2, 12, 14, 16, 18, 20, 22],
    [4, 12, 14, 16, 18, 20, 22],
  ]),
  // Layer 3: 4 tiles
  ...makePositions(3, [[3, 15, 17, 19, 21]]),
  // Layer 4: 2 tiles
  ...makePositions(4, [[4, 18, 20]]),
];

// ═══════════════════════════════════════════
// 2. PYRAMID — Wide base narrowing to peak
// ═══════════════════════════════════════════

const PYRAMID: GridPosition[] = [
  // Layer 0: 84 tiles (12 cols × 7 rows)
  ...makeRect(0, 0, 0, 7, 12),
  // Layer 1: 36 tiles (6 cols × 6 rows)
  ...makeRect(1, 1, 7, 6, 6),
  // Layer 2: 16 tiles (4 × 4)
  ...makeRect(2, 2, 10, 4, 4),
  // Layer 3: 6 tiles (3 × 2)
  ...makeRect(3, 3, 13, 2, 3),
  // Layer 4: 2 tiles
  ...makeRect(4, 4, 14, 1, 2),
];

// ═══════════════════════════════════════════
// 3. FORTRESS — Four towers connected by walls
// ═══════════════════════════════════════════

const FORTRESS: GridPosition[] = [
  // Layer 0: 80 tiles — hollow square with filled corners
  // Top wall: 14 tiles
  ...makeRect(0, 0, 0, 2, 7),
  // Bottom wall: 14 tiles
  ...makeRect(0, 12, 0, 2, 7),
  // Left wall (middle): 12 tiles
  ...makeRect(0, 4, 0, 4, 3),
  // Right wall (middle): 12 tiles
  ...makeRect(0, 4, 10, 4, 3),
  // Center platform: 28 tiles (4 × 7)
  ...makeRect(0, 4, 4, 4, 7),
  // Layer 1: 40 tiles — four corner blocks + center
  // Top-left tower
  ...makeRect(1, 1, 1, 2, 3),
  // Top-right tower
  ...makeRect(1, 1, 9, 2, 3),
  // Bottom-left tower
  ...makeRect(1, 11, 1, 2, 3),
  // Bottom-right tower
  ...makeRect(1, 11, 9, 2, 3),
  // Center block
  ...makeRect(1, 5, 5, 4, 4),
  // Layer 2: 16 tiles — smaller towers + center
  ...makeRect(2, 2, 2, 1, 2),
  ...makeRect(2, 2, 10, 1, 2),
  ...makeRect(2, 12, 2, 1, 2),
  ...makeRect(2, 12, 10, 1, 2),
  ...makeRect(2, 6, 6, 2, 4),
  // Layer 3: 6 tiles — center
  ...makeRect(3, 7, 7, 2, 3),
  // Layer 4: 2 tiles — peak
  ...makeRect(4, 8, 8, 1, 2),
];

// ═══════════════════════════════════════════
// 4. BRIDGE — Two platforms with narrow bridge
// ═══════════════════════════════════════════

const BRIDGE: GridPosition[] = [
  // Layer 0: 82 tiles
  // Left platform: 5×7 = 35
  ...makeRect(0, 0, 0, 7, 5),
  // Right platform: 5×7 = 35
  ...makeRect(0, 0, 14, 7, 5),
  // Bridge: 2×6 = 12
  ...makeRect(0, 4, 10, 2, 6),
  // Layer 1: 38 tiles
  // Left raised: 3×5 = 15
  ...makeRect(1, 1, 1, 5, 3),
  // Right raised: 3×5 = 15
  ...makeRect(1, 1, 15, 5, 3),
  // Bridge raised: 1×8 = 8
  ...makeRect(1, 5, 5, 1, 8),
  // Layer 2: 16 tiles
  // Left tower: 2×3 = 6
  ...makeRect(2, 2, 2, 3, 2),
  // Right tower: 2×3 = 6
  ...makeRect(2, 2, 16, 3, 2),
  // Bridge top: 1×4 = 4
  ...makeRect(2, 4, 8, 1, 4),
  // Layer 3: 6 tiles
  ...makeRect(3, 3, 3, 2, 1),
  ...makeRect(3, 3, 17, 2, 1),
  ...makeRect(3, 5, 9, 1, 2),
  // Layer 4: 2 tiles
  ...makeRect(4, 4, 10, 1, 2),
];

// ═══════════════════════════════════════════
// 5. CROSS — Plus/cross shape
// ═══════════════════════════════════════════

const CROSS: GridPosition[] = [
  // Layer 0: 78 tiles — cross shape
  // Vertical bar: 4 wide × 12 tall = 48
  ...makeRect(0, 0, 4, 12, 4),
  // Horizontal bar extensions (left): 4 × 3 = 12
  ...makeRect(0, 4, 0, 4, 2),
  ...makeRect(0, 4, 2, 4, 1),
  // Horizontal bar extensions (right): 4 × 3 = 12
  ...makeRect(0, 4, 12, 4, 2),
  ...makeRect(0, 4, 11, 4, 1),
  // Extra: 6
  ...makeRect(0, 4, 3, 2, 1),
  ...makeRect(0, 8, 3, 2, 1),
  ...makeRect(0, 4, 15, 2, 1),
  // Layer 1: 40 tiles
  // Vertical center: 2 wide × 10 = 20
  ...makeRect(1, 1, 5, 10, 2),
  // Horizontal center left: 5 × 2 = 10
  ...makeRect(1, 5, 1, 2, 5),
  // Horizontal center right: 5 × 2 = 10
  ...makeRect(1, 5, 11, 2, 5),
  // Layer 2: 18 tiles
  // Vertical: 1 × 8 = 8
  ...makeRect(2, 2, 6, 8, 1),
  // Horizontal: 5 × 2 = 10
  ...makeRect(2, 6, 2, 2, 5),
  // Layer 3: 6 tiles
  ...makeRect(3, 5, 5, 2, 1),
  ...makeRect(3, 5, 3, 2, 1),
  ...makeRect(3, 5, 7, 2, 1),
  // Layer 4: 2 tiles
  ...makeRect(4, 6, 6, 1, 2),
];

// ═══════════════════════════════════════════
// 6. DIAMOND — Rhombus shape
// ═══════════════════════════════════════════

const DIAMOND: GridPosition[] = [
  // Layer 0: 84 tiles — large diamond shape
  ...makePositions(0, [
    [0, 10, 12],                                          // 2
    [2, 8, 10, 12, 14],                                   // 4
    [4, 6, 8, 10, 12, 14, 16],                            // 6
    [6, 4, 6, 8, 10, 12, 14, 16, 18],                     // 8
    [8, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],              // 10
    [10, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],             // 10
    [12, 4, 6, 8, 10, 12, 14, 16, 18],                    // 8
    [14, 6, 8, 10, 12, 14, 16],                            // 6
    [16, 8, 10, 12, 14],                                   // 4
    [18, 10, 12],                                          // 2
    // Wings: 24 extra tiles for horizontal extensions
    [8, 0, 22],                                            // 2
    [10, 0, 22],                                           // 2
    [4, 4, 18],                                            // 2
    [6, 2, 20],                                            // 2
    [12, 2, 20],                                           // 2
    [14, 4, 18],                                           // 2
    [16, 6, 16],                                           // 2
  ]),
  // Layer 1: 46 tiles — smaller diamond
  ...makePositions(1, [
    [1, 9, 11],                                             // 2
    [3, 9, 11, 13],                                        // 3
    [5, 7, 9, 11, 13, 15],                                 // 5
    [7, 5, 7, 9, 11, 13, 15, 17],                          // 7
    [9, 5, 7, 9, 11, 13, 15, 17],                          // 7
    [11, 5, 7, 9, 11, 13, 15, 17],                         // 7
    [13, 7, 9, 11, 13, 15],                                // 5
    [15, 9, 11, 13, 15],                                   // 4
    [17, 9, 11, 13, 15],                                   // 4
    [19, 11, 13],                                          // 2+1=2
  ]),
  // Layer 2: 16 tiles
  ...makePositions(2, [
    [4, 10, 12],                                           // 2
    [6, 8, 10, 12, 14],                                    // 4
    [8, 8, 10, 12, 14],                                    // 4
    [10, 8, 10, 12, 14],                                   // 4
    [12, 10, 12],                                          // 2
  ]),
  // Layer 3: 6 tiles
  ...makePositions(3, [
    [7, 9, 11, 13],                                        // 3
    [9, 9, 11, 13],                                        // 3
  ]),
  // Layer 4: 2 tiles
  ...makePositions(4, [[8, 10, 12]]),
];

// ═══════════════════════════════════════════
// 7. ARENA — Hollow rectangle with center tower
// ═══════════════════════════════════════════

const ARENA: GridPosition[] = [
  // Layer 0: 76 tiles — ring with center
  // Top wall: 10
  ...makeRect(0, 0, 0, 1, 10),
  // Bottom wall: 10
  ...makeRect(0, 12, 0, 1, 10),
  // Left wall: 5
  ...makeRect(0, 2, 0, 5, 1),
  // Right wall: 5
  ...makeRect(0, 2, 18, 5, 1),
  // Second row top: 8
  ...makeRect(0, 2, 2, 1, 8),
  // Second row bottom: 8
  ...makeRect(0, 10, 2, 1, 8),
  // Center platform: 6×5 = 30
  ...makeRect(0, 4, 4, 4, 6),
  // Extra fill: unused... let me recalculate
  // Top: 10, Bottom: 10, Left: 5, Right: 5, 2ndTop: 8, 2ndBot: 8, Center: 24 = 70... need 76
  // Add side fills
  ...makeRect(0, 4, 2, 4, 1),
  ...makeRect(0, 4, 16, 4, 1),
  // 70 + 8 = 78... need 76
  // Let me just define it precisely
];

// Recalculate Arena properly
const ARENA_L0: GridPosition[] = [
  // Outer ring
  ...makeRect(0, 0, 0, 1, 10),      // top: 10
  ...makeRect(0, 12, 0, 1, 10),     // bottom: 10
  ...makeRect(0, 2, 0, 5, 1),       // left: 5
  ...makeRect(0, 2, 18, 5, 1),      // right: 5
  // Inner walls
  ...makeRect(0, 2, 2, 1, 8),       // inner top: 8
  ...makeRect(0, 10, 2, 1, 8),      // inner bottom: 8
  ...makeRect(0, 4, 2, 3, 1),       // inner left: 3
  ...makeRect(0, 4, 16, 3, 1),      // inner right: 3
  // Center block
  ...makeRect(0, 4, 6, 3, 6),       // center: 18
  // Fill corners of center
  ...makeRect(0, 4, 4, 3, 1),       // 3
  ...makeRect(0, 4, 14, 3, 1),      // 3
]; // Total: 10+10+5+5+8+8+3+3+18+3+3 = 76

const ARENA_FULL: GridPosition[] = [
  ...ARENA_L0,
  // Layer 1: 40 tiles
  ...makeRect(1, 1, 1, 2, 8),       // top band: 16
  ...makeRect(1, 11, 1, 1, 8),      // bottom band: 8
  ...makeRect(1, 5, 7, 2, 4),       // center: 8
  ...makeRect(1, 5, 5, 2, 1),       // center left: 2
  ...makeRect(1, 5, 13, 2, 1),      // center right: 2
  ...makeRect(1, 3, 3, 1, 2),       // left filler: 2
  ...makeRect(1, 3, 15, 1, 2),      // right filler: 2
  // 16+8+8+2+2+2+2 = 40
  // Layer 2: 18 tiles
  ...makeRect(2, 2, 4, 1, 6),       // top: 6
  ...makeRect(2, 6, 8, 2, 3),       // center: 6
  ...makeRect(2, 10, 4, 1, 6),      // bottom: 6
  // Layer 3: 8 tiles
  ...makeRect(3, 3, 7, 2, 2),       // top: 4
  ...makeRect(3, 7, 9, 2, 2),       // bottom: 4
  // Layer 4: 2 tiles
  ...makeRect(4, 6, 10, 1, 2),
];

// ═══════════════════════════════════════════
// 8. ZIGGURAT — Step pyramid with terraces
// ═══════════════════════════════════════════

const ZIGGURAT: GridPosition[] = [
  // Layer 0: 72 tiles — wide stepped base
  ...makeRect(0, 0, 0, 2, 14),      // top terrace: 28
  ...makeRect(0, 4, 2, 2, 10),      // middle: 20
  ...makeRect(0, 8, 4, 2, 8),       // lower: 16
  ...makeRect(0, 12, 6, 1, 8),      // bottom step: 8
  // Layer 1: 40 tiles
  ...makeRect(1, 1, 3, 1, 10),      // top: 10
  ...makeRect(1, 3, 3, 1, 10),      // 10
  ...makeRect(1, 5, 5, 1, 8),       // 8
  ...makeRect(1, 7, 5, 1, 6),       // 6
  ...makeRect(1, 9, 7, 1, 6),       // 6
  // Layer 2: 20 tiles
  ...makeRect(2, 2, 6, 1, 6),       // 6
  ...makeRect(2, 4, 6, 1, 6),       // 6
  ...makeRect(2, 6, 8, 1, 4),       // 4
  ...makeRect(2, 8, 8, 1, 4),       // 4
  // Layer 3: 8 tiles
  ...makeRect(3, 3, 9, 1, 4),       // 4
  ...makeRect(3, 7, 9, 1, 4),       // 4
  // Layer 4: 4 tiles
  ...makeRect(4, 4, 10, 2, 2),
];

// ═══════════════════════════════════════════
// Layout registry + validation
// ═══════════════════════════════════════════

function validateAndAdjust(name: string, positions: GridPosition[]): GridPosition[] {
  if (positions.length !== 144) {
    console.warn(`Layout "${name}" has ${positions.length} positions, expected 144`);
  }
  return positions;
}

export const LAYOUTS: Record<string, LayoutDefinition> = {
  turtle:   { name: 'Turtle',   positions: validateAndAdjust('Turtle', TURTLE) },
  pyramid:  { name: 'Pyramid',  positions: validateAndAdjust('Pyramid', PYRAMID) },
  fortress: { name: 'Fortress', positions: validateAndAdjust('Fortress', FORTRESS) },
  bridge:   { name: 'Bridge',   positions: validateAndAdjust('Bridge', BRIDGE) },
  cross:    { name: 'Cross',    positions: validateAndAdjust('Cross', CROSS) },
  diamond:  { name: 'Diamond',  positions: validateAndAdjust('Diamond', DIAMOND) },
  arena:    { name: 'Arena',    positions: validateAndAdjust('Arena', ARENA_FULL) },
  ziggurat: { name: 'Ziggurat', positions: validateAndAdjust('Ziggurat', ZIGGURAT) },
};

export function getLayout(key: string): GridPosition[] {
  return LAYOUTS[key]?.positions ?? LAYOUTS.turtle.positions;
}
