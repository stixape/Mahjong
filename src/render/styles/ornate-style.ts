import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS,
} from './base-style';

/** Ornamental / decorative tile style for the Jade theme. */
export class OrnateStyle extends BaseStyle {

  override drawFace(parent: Container, t: TileThemeConfig): Graphics {
    const face = super.drawFace(parent, t);

    // L-bracket filigree decorations at all 4 corners inside the inner border
    const g = new Graphics();
    const inset = 5;
    const len = 8;
    const right = TILE_WIDTH - inset;
    const bottom = TILE_HEIGHT - inset;

    // Top-left
    g.moveTo(inset, inset + len); g.lineTo(inset, inset); g.lineTo(inset + len, inset);
    // Top-right
    g.moveTo(right - len, inset); g.lineTo(right, inset); g.lineTo(right, inset + len);
    // Bottom-left
    g.moveTo(inset, bottom - len); g.lineTo(inset, bottom); g.lineTo(inset + len, bottom);
    // Bottom-right
    g.moveTo(right - len, bottom); g.lineTo(right, bottom); g.lineTo(right, bottom - len);

    g.stroke({ color: t.borderColor, width: 1, alpha: 0.4 });
    parent.addChild(g);

    return face;
  }

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.ornateStalk(g, cx, cy - 6, 32, t.bambooColor, t.bambooAccent, t.bambooHighlight);
      g.circle(cx, cy - 20, 6); g.fill(t.characterColor);
      g.circle(cx, cy - 20, 3.5); g.fill(0xFF4444);
    } else {
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.ornateStalk(g, px, py, 14, t.bambooColor, t.bambooAccent, t.bambooHighlight);
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor, 'serif', 10);
  }

  private ornateStalk(
    g: Graphics, x: number, y: number, height: number,
    color: number, dark: number, highlight: number,
  ): void {
    const w = 5;
    g.roundRect(x - w / 2, y - height / 2, w, height, 2);
    g.fill(color);

    const segments = Math.floor(height / 8);
    for (let i = 1; i < segments; i++) {
      const sy = y - height / 2 + i * (height / segments);
      g.moveTo(x - w / 2, sy); g.lineTo(x + w / 2, sy);
      g.stroke({ color: dark, width: 1 });

      // Leaf shapes at each segment joint — tiny ellipses angled outward
      g.save();
      // Left leaf
      g.ellipse(x - w / 2 - 2, sy, 1.5, 2.5);
      g.fill({ color: highlight, alpha: 0.6 });
      // Right leaf
      g.ellipse(x + w / 2 + 2, sy, 1.5, 2.5);
      g.fill({ color: highlight, alpha: 0.6 });
    }

    // Highlight line
    g.moveTo(x - 1, y - height / 2 + 2);
    g.lineTo(x - 1, y + height / 2 - 2);
    g.stroke({ color: highlight, width: 1, alpha: 0.5 });
  }

  drawDot(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const positions = getDotPositions(value, cx, cy);
    const radius = value <= 3 ? 7 : value <= 6 ? 6 : 5;

    for (const [px, py] of positions) {
      // Cabochon: filled circle, then highlight offset up-left for gemstone sheen
      g.circle(px, py, radius); g.fill(t.dotColor);
      g.circle(px - 2, py - 2, radius * 0.45); g.fill({ color: 0xFFFFFF, alpha: 0.5 });
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor, 'serif', 10);
  }

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;

    // Serif italic numeral
    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 20, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5); numText.x = cx; numText.y = 26;
    parent.addChild(numText);

    // Decorative underline below the numeral
    const g = new Graphics();
    g.moveTo(cx - 10, 37);
    g.lineTo(cx + 10, 37);
    g.stroke({ color: t.characterColor, width: 1, alpha: 0.3 });
    parent.addChild(g);

    const wanText = new Text({
      text: '萬',
      style: new TextStyle({ fontSize: 18, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: t.textDark }),
    });
    wanText.anchor.set(0.5); wanText.x = cx; wanText.y = 52;
    parent.addChild(wanText);
    this.addCornerLabel(parent, '萬', t.characterColor, 'serif', 10);
  }

  drawWind(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: t.windColors[value - 1] }),
    });
    text.anchor.set(0.5); text.x = cx; text.y = cy;
    parent.addChild(text);
    this.addCornerLabel(parent, '風', t.cornerLabelWind, 'serif', 10);
  }

  drawDragon(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const color = t.dragonColors[value - 1];

    if (value === 1) {
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.fill(color);
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.stroke({ color, width: 1, alpha: 0.6 });
      parent.addChild(g);
      const text = new Text({ text: '中', style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: 0xFFFFFF }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else if (value === 2) {
      const text = new Text({ text: '發', style: new TextStyle({ fontSize: 30, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: color }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else {
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.stroke({ color, width: 2.5 });
      g.roundRect(cx - 10, cy - 14, 20, 28, 2); g.stroke({ color, width: 1, alpha: 0.4 });
      parent.addChild(g);
    }
    this.addCornerLabel(parent, '龍', color, 'serif', 10);
  }

  drawSeason(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.seasonColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 12, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    const mainText = new Text({ text: SEASON_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    const g = new Graphics();
    this.drawSeasonDeco(g, value, cx, cy);
    parent.addChild(g);
    this.addCornerLabel(parent, '季', t.cornerLabelSeason, 'serif', 10);
  }

  drawFlower(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.flowerColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 12, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    const mainText = new Text({ text: FLOWER_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    const g = new Graphics();
    this.drawFlowerDeco(g, value, cx - 14, cy - 18);
    parent.addChild(g);
    this.addCornerLabel(parent, '花', t.cornerLabelFlower, 'serif', 10);
  }
}
