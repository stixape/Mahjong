import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileType, TileSuit } from '../../game/types';
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH } from '../../game/coordinates';
import { TileThemeConfig } from '../tile-themes';
import { TileStyleRenderer } from '../tile-draw-styles';

const SHADOW_COLOR = 0x000000;
const CORNER_RADIUS = 5;

// Shared position data for bamboo/dot layouts
export function getBambooPositions(value: number, cx: number, cy: number): [number, number][] {
  const dx = 9, dy = 11;
  switch (value) {
    case 2: return [[cx - dx / 2, cy - dy / 2], [cx + dx / 2, cy + dy / 2]];
    case 3: return [[cx, cy - dy], [cx - dx, cy + dy / 2], [cx + dx, cy + dy / 2]];
    case 4: return [[cx - dx, cy - dy / 2], [cx + dx, cy - dy / 2], [cx - dx, cy + dy / 2], [cx + dx, cy + dy / 2]];
    case 5: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 6: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 7: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 8: return [[cx - dx, cy - dy], [cx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy + 1], [cx + dx, cy + 1], [cx - dx, cy + dy + 2], [cx, cy + dy + 2], [cx + dx, cy + dy + 2]];
    case 9: return [[cx - dx, cy - dy], [cx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx, cy + dy], [cx + dx, cy + dy]];
    default: return [[cx, cy]];
  }
}

export function getDotPositions(value: number, cx: number, cy: number): [number, number][] {
  const dx = 11, dy = 11;
  switch (value) {
    case 1: return [[cx, cy]];
    case 2: return [[cx, cy - dy], [cx, cy + dy]];
    case 3: return [[cx, cy - dy], [cx, cy], [cx, cy + dy]];
    case 4: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 5: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 6: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 7: return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx + dx, cy + dy]];
    case 8: return [[cx - dx, cy - dy], [cx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy + 1], [cx + dx, cy + 1], [cx - dx, cy + dy + 2], [cx, cy + dy + 2], [cx + dx, cy + dy + 2]];
    case 9: return [[cx - dx, cy - dy], [cx, cy - dy], [cx + dx, cy - dy], [cx - dx, cy], [cx, cy], [cx + dx, cy], [cx - dx, cy + dy], [cx, cy + dy], [cx + dx, cy + dy]];
    default: return [[cx, cy]];
  }
}

export const NUMERALS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const WIND_CHARS = ['', '東', '南', '西', '北'];
export const SEASON_CHARS = ['', '春', '夏', '秋', '冬'];
export const FLOWER_CHARS = ['', '梅', '蘭', '竹', '菊'];

export { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH, CORNER_RADIUS, SHADOW_COLOR };

/** Base class with default implementations. Styles override methods to change appearance. */
export abstract class BaseStyle implements TileStyleRenderer {
  drawShadow(parent: Container, _t: TileThemeConfig): void {
    const shadow = new Graphics();
    shadow.roundRect(TILE_DEPTH + 3, TILE_DEPTH + 3, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    shadow.fill({ color: SHADOW_COLOR, alpha: 0.3 });
    parent.addChild(shadow);
  }

  drawEdges(parent: Container, t: TileThemeConfig): void {
    const edgeSide = new Graphics();
    // Bottom face
    edgeSide.moveTo(CORNER_RADIUS, TILE_HEIGHT);
    edgeSide.lineTo(CORNER_RADIUS + TILE_DEPTH, TILE_HEIGHT + TILE_DEPTH);
    edgeSide.lineTo(TILE_WIDTH - CORNER_RADIUS + TILE_DEPTH, TILE_HEIGHT + TILE_DEPTH);
    edgeSide.lineTo(TILE_WIDTH - CORNER_RADIUS, TILE_HEIGHT);
    edgeSide.closePath();
    edgeSide.fill(t.edgeSideColor);
    // Right face
    edgeSide.moveTo(TILE_WIDTH, CORNER_RADIUS);
    edgeSide.lineTo(TILE_WIDTH + TILE_DEPTH, CORNER_RADIUS + TILE_DEPTH);
    edgeSide.lineTo(TILE_WIDTH + TILE_DEPTH, TILE_HEIGHT - CORNER_RADIUS + TILE_DEPTH);
    edgeSide.lineTo(TILE_WIDTH, TILE_HEIGHT - CORNER_RADIUS);
    edgeSide.closePath();
    edgeSide.fill(t.edgeSideColor);
    // Corner
    edgeSide.moveTo(TILE_WIDTH - CORNER_RADIUS, TILE_HEIGHT);
    edgeSide.lineTo(TILE_WIDTH + TILE_DEPTH - CORNER_RADIUS, TILE_HEIGHT + TILE_DEPTH);
    edgeSide.lineTo(TILE_WIDTH + TILE_DEPTH, TILE_HEIGHT + TILE_DEPTH - CORNER_RADIUS);
    edgeSide.lineTo(TILE_WIDTH, TILE_HEIGHT - CORNER_RADIUS);
    edgeSide.closePath();
    edgeSide.fill(t.edgeSideColor);
    parent.addChild(edgeSide);

    // Top edge
    const edge = new Graphics();
    edge.roundRect(TILE_DEPTH, TILE_DEPTH, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    edge.fill(t.edgeColor);
    parent.addChild(edge);
  }

  drawFace(parent: Container, t: TileThemeConfig): Graphics {
    const face = new Graphics();
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.fill(t.faceColor);
    face.roundRect(1, 1, TILE_WIDTH - 2, TILE_HEIGHT * 0.4, CORNER_RADIUS);
    face.fill({ color: t.faceColorTop, alpha: 0.5 });
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.stroke({ color: t.borderColor, width: 1 });
    face.roundRect(3, 3, TILE_WIDTH - 6, TILE_HEIGHT - 6, 3);
    face.stroke({ color: t.innerBorderColor, width: 0.5 });
    parent.addChild(face);
    return face;
  }

  drawHighlight(parent: Container, t: TileThemeConfig): Graphics {
    const highlight = new Graphics();
    highlight.roundRect(-3, -3, TILE_WIDTH + 6, TILE_HEIGHT + 6, CORNER_RADIUS + 3);
    highlight.stroke({ color: t.highlightColor, width: 3 });
    highlight.roundRect(-5, -5, TILE_WIDTH + 10, TILE_HEIGHT + 10, CORNER_RADIUS + 5);
    highlight.stroke({ color: t.highlightColor, width: 1, alpha: 0.4 });
    highlight.visible = false;
    parent.addChild(highlight);
    return highlight;
  }

  drawArtwork(parent: Container, type: TileType, t: TileThemeConfig): void {
    switch (type.suit) {
      case TileSuit.Bamboo: this.drawBamboo(parent, type.value, t); break;
      case TileSuit.Dot: this.drawDot(parent, type.value, t); break;
      case TileSuit.Character: this.drawCharacter(parent, type.value, t); break;
      case TileSuit.Wind: this.drawWind(parent, type.value, t); break;
      case TileSuit.Dragon: this.drawDragon(parent, type.value, t); break;
      case TileSuit.Season: this.drawSeason(parent, type.value, t); break;
      case TileSuit.Flower: this.drawFlower(parent, type.value, t); break;
    }
  }

  // Suit drawing methods — override in subclasses for different styles
  abstract drawBamboo(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawDot(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawCharacter(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawWind(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawDragon(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawSeason(parent: Container, value: number, t: TileThemeConfig): void;
  abstract drawFlower(parent: Container, value: number, t: TileThemeConfig): void;

  // Shared helper for corner label
  protected addCornerLabel(parent: Container, text: string, color: number, fontFamily = 'serif', fontSize = 10): void {
    const style = new TextStyle({ fontSize, fontFamily, fill: color, fontWeight: 'bold' });
    const label = new Text({ text, style });
    label.x = 4;
    label.y = 3;
    parent.addChild(label);
  }

  // Helper for season/flower decorations
  protected drawSeasonDeco(g: Graphics, value: number, cx: number, cy: number): void {
    if (value === 1) {
      g.circle(cx - 12, cy - 16, 3); g.fill(0xFF88AA);
      g.circle(cx + 10, cy - 18, 2.5); g.fill(0xFF88AA);
    } else if (value === 2) {
      g.circle(cx + 14, cy - 16, 4); g.fill(0xFFAA00);
    } else if (value === 3) {
      g.moveTo(cx + 12, cy - 18);
      g.quadraticCurveTo(cx + 20, cy - 12, cx + 12, cy - 8);
      g.quadraticCurveTo(cx + 4, cy - 12, cx + 12, cy - 18);
      g.fill(0xCC6600);
    } else {
      g.circle(cx - 12, cy - 16, 3); g.fill(0x88BBFF);
      g.circle(cx - 12, cy - 16, 1.5); g.fill(0xFFFFFF);
    }
  }

  protected drawFlowerDeco(g: Graphics, value: number, fx: number, fy: number): void {
    if (value === 1) {
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        g.circle(fx + Math.cos(angle) * 4, fy + Math.sin(angle) * 4, 2.5);
        g.fill(0xFF6699);
      }
      g.circle(fx, fy, 2); g.fill(0xFFCC00);
    } else if (value === 2) {
      g.ellipse(fx, fy, 3, 6); g.fill({ color: 0x9966CC, alpha: 0.8 });
      g.ellipse(fx + 4, fy - 2, 2, 5); g.fill({ color: 0x9966CC, alpha: 0.6 });
    } else if (value === 3) {
      g.roundRect(fx - 1.5, fy - 6, 3, 12, 1); g.fill(0x2E8B2E);
      g.ellipse(fx + 4, fy - 3, 4, 2); g.fill(0x3CAA3C);
    } else {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        g.moveTo(fx, fy); g.lineTo(fx + Math.cos(angle) * 5, fy + Math.sin(angle) * 5);
        g.stroke({ color: 0xDD8800, width: 1.5 });
      }
      g.circle(fx, fy, 2); g.fill(0xFFAA00);
    }
  }
}
