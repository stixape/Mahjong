import { GridPosition } from './types';

export const TILE_WIDTH = 60;
export const TILE_HEIGHT = 76;
export const TILE_DEPTH = 6;
export const LAYER_OFFSET_X = -4;
export const LAYER_OFFSET_Y = -4;

export function gridToScreen(pos: GridPosition, scale: number = 1): { x: number; y: number } {
  return {
    x: (pos.col * (TILE_WIDTH / 2) + pos.layer * LAYER_OFFSET_X) * scale,
    y: (pos.row * (TILE_HEIGHT / 2) + pos.layer * LAYER_OFFSET_Y) * scale,
  };
}

export function calculateBoardBounds(positions: GridPosition[]): {
  width: number; height: number; minX: number; minY: number;
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const pos of positions) {
    const { x, y } = gridToScreen(pos);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + TILE_WIDTH > maxX) maxX = x + TILE_WIDTH;
    if (y + TILE_HEIGHT > maxY) maxY = y + TILE_HEIGHT;
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
  };
}

export function fitBoardToScreen(
  boardWidth: number,
  boardHeight: number,
  screenWidth: number,
  screenHeight: number,
  paddingX: number = 40,
  paddingTop: number = 40,
  paddingBottom: number = 40,
): { scale: number; offsetX: number; offsetY: number } {
  const availableWidth = screenWidth - paddingX * 2;
  const availableHeight = screenHeight - paddingTop - paddingBottom;

  const scale = Math.min(availableWidth / boardWidth, availableHeight / boardHeight, 1.6);

  const offsetX = (screenWidth - boardWidth * scale) / 2;
  const offsetY = paddingTop + (availableHeight - boardHeight * scale) / 2;

  return { scale, offsetX, offsetY };
}
