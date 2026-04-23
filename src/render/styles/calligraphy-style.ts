import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS,
} from './base-style';

/** Ink / calligraphy tile style — bold brush-stroke aesthetic, monochrome feel. */
export class CalligraphyStyle extends BaseStyle {

  // ── Flat white face with heavy outer border, no inner border, no top gradient ──

  override drawFace(parent: Container, t: TileThemeConfig): Graphics {
    const face = new Graphics();
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.fill(t.faceColor);
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.stroke({ color: t.borderColor, width: 2.5 });
    parent.addChild(face);
    return face;
  }

  // ── Bamboo — tapered brush-stroke stalks ──

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.brushStalk(g, cx, cy - 6, 32, t.bambooColor);
      // Ink dot at top
      g.circle(cx, cy - 22, 2);
      g.fill(t.bambooColor);
    } else {
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.brushStalk(g, px, py, 14, t.bambooColor);
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor, 'serif', 11);
  }

  /** Draw a single tapered brush-stroke stalk as a polygon wider in the middle. */
  private brushStalk(g: Graphics, x: number, y: number, height: number, color: number): void {
    const halfH = height / 2;
    const topW = 1;    // narrow at top (2px total)
    const midW = 3.5;  // wide in middle (7px total)
    const botW = 1;    // narrow at bottom (2px total)

    // Tapered polygon: top-left, mid-left, bottom-left, bottom-right, mid-right, top-right
    g.moveTo(x - topW, y - halfH);
    g.lineTo(x - midW, y);
    g.lineTo(x - botW, y + halfH);
    g.lineTo(x + botW, y + halfH);
    g.lineTo(x + midW, y);
    g.lineTo(x + topW, y - halfH);
    g.closePath();
    g.fill(color);

    // Segment marks — bold horizontal dashes
    const segments = Math.floor(height / 8);
    for (let i = 1; i < segments; i++) {
      const sy = y - halfH + i * (height / segments);
      // Width at this y position (interpolate taper)
      const t = i / segments;
      const w = t < 0.5
        ? topW + (midW - topW) * (t * 2)
        : midW + (botW - midW) * ((t - 0.5) * 2);
      g.moveTo(x - w, sy);
      g.lineTo(x + w, sy);
      g.stroke({ color, width: 2 });
    }

    // Ink dot at top of each stalk
    g.circle(x, y - halfH - 1, 2);
    g.fill(color);
  }

  // ── Dots — ink splatter style ──

  drawDot(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const positions = getDotPositions(value, cx, cy);
    const radius = value <= 3 ? 7 : value <= 6 ? 6 : 5;

    for (const [px, py] of positions) {
      // Main filled circle (no white ring)
      g.circle(px, py, radius);
      g.fill(t.dotColor);
      // Satellite ink-splatter dots at fixed offsets
      g.circle(px + radius + 1.5, py - 1, 1.5);
      g.fill(t.dotColor);
      g.circle(px - 1, py - radius - 1, 1);
      g.fill(t.dotColor);
      g.circle(px + 2, py + radius + 0.5, 1.2);
      g.fill(t.dotColor);
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor, 'serif', 11);
  }

  // ── Characters — extra bold, larger ──

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;

    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 24, fontFamily: 'serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5);
    numText.x = cx;
    numText.y = 26;
    parent.addChild(numText);

    const wanText = new Text({
      text: '萬',
      style: new TextStyle({ fontSize: 20, fontFamily: 'serif', fontWeight: 'bold', fill: t.textDark }),
    });
    wanText.anchor.set(0.5);
    wanText.x = cx;
    wanText.y = 52;
    parent.addChild(wanText);

    this.addCornerLabel(parent, '萬', t.characterColor, 'serif', 11);
  }

  // ── Wind — extra bold, 36px ──

  drawWind(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 36, fontFamily: 'serif', fontWeight: 'bold', fill: t.windColors[value - 1] }),
    });
    text.anchor.set(0.5);
    text.x = cx;
    text.y = cy;
    parent.addChild(text);

    this.addCornerLabel(parent, '風', t.cornerLabelWind, 'serif', 11);
  }

  // ── Dragon — thick brush-look borders ──

  drawDragon(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const color = t.dragonColors[value - 1];

    if (value === 1) {
      // 中 — background rect with thick 3px brush border
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3);
      g.fill(color);
      g.roundRect(cx - 14, cy - 18, 28, 36, 3);
      g.stroke({ color, width: 3 });
      parent.addChild(g);
      const text = new Text({
        text: '中',
        style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: 0xFFFFFF }),
      });
      text.anchor.set(0.5);
      text.x = cx;
      text.y = cy;
      parent.addChild(text);
    } else if (value === 2) {
      // 發 — extra bold 34px
      const text = new Text({
        text: '發',
        style: new TextStyle({ fontSize: 34, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
      });
      text.anchor.set(0.5);
      text.x = cx;
      text.y = cy;
      parent.addChild(text);
    } else {
      // 白 — 3px thick border rect
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3);
      g.stroke({ color, width: 3 });
      parent.addChild(g);
    }

    this.addCornerLabel(parent, '龍', color, 'serif', 11);
  }

  // ── Season — larger character, circled number, no decorations ──

  drawSeason(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.seasonColors[value - 1];

    // Circled number in top-right
    const numG = new Graphics();
    const numX = TILE_WIDTH - 12;
    const numY = 12;
    numG.circle(numX, numY, 6);
    numG.stroke({ color, width: 1.5 });
    parent.addChild(numG);

    const numText = new Text({
      text: String(value),
      style: new TextStyle({ fontSize: 10, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    numText.anchor.set(0.5);
    numText.x = numX;
    numText.y = numY;
    parent.addChild(numText);

    // Main character — larger 32px, bold calligraphy IS the decoration
    const mainText = new Text({
      text: SEASON_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    mainText.anchor.set(0.5);
    mainText.x = cx;
    mainText.y = cy + 4;
    parent.addChild(mainText);

    this.addCornerLabel(parent, '季', t.cornerLabelSeason, 'serif', 11);
  }

  // ── Flower — larger character, circled number, no decorations ──

  drawFlower(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.flowerColors[value - 1];

    // Circled number in top-right
    const numG = new Graphics();
    const numX = TILE_WIDTH - 12;
    const numY = 12;
    numG.circle(numX, numY, 6);
    numG.stroke({ color, width: 1.5 });
    parent.addChild(numG);

    const numText = new Text({
      text: String(value),
      style: new TextStyle({ fontSize: 10, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    numText.anchor.set(0.5);
    numText.x = numX;
    numText.y = numY;
    parent.addChild(numText);

    // Main character — larger 32px, bold calligraphy IS the decoration
    const mainText = new Text({
      text: FLOWER_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    mainText.anchor.set(0.5);
    mainText.x = cx;
    mainText.y = cy + 4;
    parent.addChild(mainText);

    this.addCornerLabel(parent, '花', t.cornerLabelFlower, 'serif', 11);
  }
}
