import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS,
} from './base-style';

/** Clean, stripped-down modern tile style for the Ivory theme. */
export class MinimalStyle extends BaseStyle {

  override drawFace(parent: Container, t: TileThemeConfig): Graphics {
    const face = new Graphics();
    // Flat fill only — no top gradient/shine, no inner border
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.fill(t.faceColor);
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.stroke({ color: t.borderColor, width: 0.75 });
    parent.addChild(face);
    return face;
  }

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.minimalStalk(g, cx, cy - 6, 32, t.bambooColor, t.bambooAccent);
      g.circle(cx, cy - 20, 6); g.fill(t.characterColor);
      g.circle(cx, cy - 20, 3.5); g.fill(0xFF4444);
    } else {
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.minimalStalk(g, px, py, 14, t.bambooColor, t.bambooAccent);
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor, 'sans-serif', 10);
  }

  private minimalStalk(
    g: Graphics, x: number, y: number, height: number,
    color: number, dark: number,
  ): void {
    // Thin straight line instead of rounded rect
    g.moveTo(x, y - height / 2);
    g.lineTo(x, y + height / 2);
    g.stroke({ color, width: 2 });

    // Tiny horizontal tick marks at segment points
    const segments = Math.floor(height / 8);
    for (let i = 1; i < segments; i++) {
      const sy = y - height / 2 + i * (height / segments);
      g.moveTo(x - 1.5, sy); g.lineTo(x + 1.5, sy);
      g.stroke({ color: dark, width: 1 });
    }
  }

  drawDot(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const positions = getDotPositions(value, cx, cy);
    // Slightly smaller radius, simple filled circles only
    const radius = value <= 3 ? 5.5 : value <= 6 ? 4.5 : 4;

    for (const [px, py] of positions) {
      g.circle(px, py, radius); g.fill(t.dotColor);
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor, 'sans-serif', 10);
  }

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;

    // Small Arabic numeral at top-right
    const arabicText = new Text({
      text: String(value),
      style: new TextStyle({ fontSize: 10, fontFamily: 'sans-serif', fill: t.characterColor }),
    });
    arabicText.anchor.set(1, 0); arabicText.x = TILE_WIDTH - 5; arabicText.y = 4;
    parent.addChild(arabicText);

    // Kanji numeral — smaller, centered
    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 16, fontFamily: 'sans-serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5); numText.x = cx; numText.y = 28;
    parent.addChild(numText);

    const wanText = new Text({
      text: '萬',
      style: new TextStyle({ fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'bold', fill: t.textDark }),
    });
    wanText.anchor.set(0.5); wanText.x = cx; wanText.y = 50;
    parent.addChild(wanText);
    this.addCornerLabel(parent, '萬', t.characterColor, 'sans-serif', 10);
  }

  drawWind(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 28, fontFamily: 'sans-serif', fontWeight: 'bold', fill: t.windColors[value - 1] }),
    });
    text.anchor.set(0.5); text.x = cx; text.y = cy;
    parent.addChild(text);
    this.addCornerLabel(parent, '風', t.cornerLabelWind, 'sans-serif', 10);
  }

  drawDragon(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const color = t.dragonColors[value - 1];

    if (value === 1) {
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.fill(color);
      parent.addChild(g);
      const text = new Text({ text: '中', style: new TextStyle({ fontSize: 26, fontFamily: 'sans-serif', fontWeight: 'bold', fill: 0xFFFFFF }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else if (value === 2) {
      const text = new Text({ text: '發', style: new TextStyle({ fontSize: 28, fontFamily: 'sans-serif', fontWeight: 'bold', fill: color }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else {
      // Simple thin rectangle outline for 白
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 1); g.stroke({ color, width: 1.5 });
      parent.addChild(g);
    }
    this.addCornerLabel(parent, '龍', color, 'sans-serif', 10);
  }

  drawSeason(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.seasonColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 11, fontFamily: 'sans-serif', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    const mainText = new Text({ text: SEASON_CHARS[value], style: new TextStyle({ fontSize: 26, fontFamily: 'sans-serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    const g = new Graphics();
    this.drawSeasonDeco(g, value, cx, cy);
    parent.addChild(g);
    this.addCornerLabel(parent, '季', t.cornerLabelSeason, 'sans-serif', 10);
  }

  drawFlower(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.flowerColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 11, fontFamily: 'sans-serif', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    const mainText = new Text({ text: FLOWER_CHARS[value], style: new TextStyle({ fontSize: 26, fontFamily: 'sans-serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    const g = new Graphics();
    this.drawFlowerDeco(g, value, cx - 14, cy - 18);
    parent.addChild(g);
    this.addCornerLabel(parent, '花', t.cornerLabelFlower, 'sans-serif', 10);
  }
}
