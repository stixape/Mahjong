import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS,
} from './base-style';

/** Cyberpunk / neon glow style for the Midnight theme. */
export class NeonStyle extends BaseStyle {

  override drawFace(parent: Container, t: TileThemeConfig): Graphics {
    const face = super.drawFace(parent, t);

    // Diagonal scanlines for digital texture (wider step for performance)
    const scanlines = new Graphics();
    const step = 7;
    const maxDim = TILE_WIDTH + TILE_HEIGHT;
    for (let offset = -maxDim; offset < maxDim; offset += step) {
      scanlines.moveTo(offset, 0);
      scanlines.lineTo(offset + TILE_HEIGHT, TILE_HEIGHT);
      scanlines.stroke({ color: 0xFFFFFF, width: 0.5, alpha: 0.06 });
    }
    // Mask scanlines to tile face bounds
    const mask = new Graphics();
    mask.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    mask.fill(0xFFFFFF);
    parent.addChild(mask);
    scanlines.mask = mask;
    parent.addChild(scanlines);

    return face;
  }

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.drawChainStalk(g, cx, cy - 6, 32, t.bambooColor);
      // Neon orb at top
      g.circle(cx, cy - 20, 6); g.fill({ color: t.characterColor, alpha: 0.2 });
      g.circle(cx, cy - 20, 4); g.fill(t.characterColor);
    } else {
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.drawChainStalk(g, px, py, 14, t.bambooColor);
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor);
  }

  /** Draw a chain-link stalk: small circles connected by thin lines. */
  private drawChainStalk(g: Graphics, x: number, y: number, height: number, color: number): void {
    const circleRadius = 3;
    const numCircles = height >= 28 ? 4 : 3;
    const spacing = height / (numCircles + 1);
    const topY = y - height / 2;

    for (let i = 1; i <= numCircles; i++) {
      const cy = topY + i * spacing;
      // Connecting line to next circle
      if (i < numCircles) {
        const nextCy = topY + (i + 1) * spacing;
        g.moveTo(x, cy + circleRadius);
        g.lineTo(x, nextCy - circleRadius);
        g.stroke({ color, width: 1 });
      }
      // Circle link
      g.circle(x, cy, circleRadius);
      g.stroke({ color, width: 1.5 });
    }
  }

  drawDot(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const positions = getDotPositions(value, cx, cy);
    const radius = value <= 3 ? 7 : value <= 6 ? 6 : 5;

    for (const [px, py] of positions) {
      // 6-pointed star: 3 lines through center at 60-degree angles
      const starSize = radius * 0.9;
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * i) / 3;
        const dx = Math.cos(angle) * starSize;
        const dy = Math.sin(angle) * starSize;
        g.moveTo(px - dx, py - dy);
        g.lineTo(px + dx, py + dy);
        g.stroke({ color: t.dotColor, width: 1.5 });
      }
      // Small bright dot at center
      g.circle(px, py, 2); g.fill(t.dotColor);
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor);
  }

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;

    // Glow layer
    const glowNum = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 30, fontFamily: 'serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    glowNum.anchor.set(0.5); glowNum.x = cx; glowNum.y = 26; glowNum.alpha = 0.2;
    parent.addChild(glowNum);

    // Main numeral
    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 20, fontFamily: 'serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5); numText.x = cx; numText.y = 26;
    parent.addChild(numText);

    // Glow for wan
    const glowWan = new Text({
      text: '萬',
      style: new TextStyle({ fontSize: 27, fontFamily: 'serif', fontWeight: 'bold', fill: t.textDark }),
    });
    glowWan.anchor.set(0.5); glowWan.x = cx; glowWan.y = 52; glowWan.alpha = 0.2;
    parent.addChild(glowWan);

    const wanText = new Text({
      text: '萬',
      style: new TextStyle({ fontSize: 18, fontFamily: 'serif', fontWeight: 'bold', fill: t.textDark }),
    });
    wanText.anchor.set(0.5); wanText.x = cx; wanText.y = 52;
    parent.addChild(wanText);
    this.addCornerLabel(parent, '萬', t.characterColor);
  }

  drawWind(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const color = t.windColors[value - 1];

    // Glow layer
    const glow = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 48, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    glow.anchor.set(0.5); glow.x = cx; glow.y = cy; glow.alpha = 0.2;
    parent.addChild(glow);

    // Main text
    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    text.anchor.set(0.5); text.x = cx; text.y = cy;
    parent.addChild(text);
    this.addCornerLabel(parent, '風', t.cornerLabelWind);
  }

  drawDragon(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const color = t.dragonColors[value - 1];

    if (value === 1) {
      // Background rect with glow border
      const g = new Graphics();
      g.roundRect(cx - 17, cy - 21, 34, 42, 3);
      g.stroke({ color, width: 2, alpha: 0.3 });
      g.roundRect(cx - 14, cy - 18, 28, 36, 3);
      g.fill(color);
      parent.addChild(g);

      // Glow text
      const glow = new Text({ text: '中', style: new TextStyle({ fontSize: 42, fontFamily: 'serif', fontWeight: 'bold', fill: 0xFFFFFF }) });
      glow.anchor.set(0.5); glow.x = cx; glow.y = cy; glow.alpha = 0.2;
      parent.addChild(glow);

      const text = new Text({ text: '中', style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: 0xFFFFFF }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else if (value === 2) {
      const glow = new Text({ text: '發', style: new TextStyle({ fontSize: 45, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
      glow.anchor.set(0.5); glow.x = cx; glow.y = cy; glow.alpha = 0.2;
      parent.addChild(glow);

      const text = new Text({ text: '發', style: new TextStyle({ fontSize: 30, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else {
      // White dragon — glow on the outlined rectangles
      const g = new Graphics();
      g.roundRect(cx - 17, cy - 21, 34, 42, 3); g.stroke({ color, width: 1, alpha: 0.3 });
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.stroke({ color, width: 2.5 });
      g.roundRect(cx - 10, cy - 14, 20, 28, 2); g.stroke({ color, width: 1, alpha: 0.4 });
      parent.addChild(g);
    }
    this.addCornerLabel(parent, '龍', color);
  }

  drawSeason(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.seasonColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 12, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    // Glow layer
    const glow = new Text({ text: SEASON_CHARS[value], style: new TextStyle({ fontSize: 42, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    glow.anchor.set(0.5); glow.x = cx; glow.y = cy + 4; glow.alpha = 0.2;
    parent.addChild(glow);

    // Main text
    const mainText = new Text({ text: SEASON_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    // No decorative elements — clean neon look
    this.addCornerLabel(parent, '季', t.cornerLabelSeason);
  }

  drawFlower(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.flowerColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 12, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    // Glow layer
    const glow = new Text({ text: FLOWER_CHARS[value], style: new TextStyle({ fontSize: 42, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    glow.anchor.set(0.5); glow.x = cx; glow.y = cy + 4; glow.alpha = 0.2;
    parent.addChild(glow);

    // Main text
    const mainText = new Text({ text: FLOWER_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    // No decorative elements — clean neon look
    this.addCornerLabel(parent, '花', t.cornerLabelFlower);
  }
}
