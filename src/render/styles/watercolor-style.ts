import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS,
} from './base-style';

/** Soft watercolor / painterly style for the Coral theme. */
export class WatercolorStyle extends BaseStyle {

  override drawFace(parent: Container, t: TileThemeConfig): Graphics {
    // Draw 3 soft-edge copies at slight offsets for watercolor blur
    const offsets: [number, number, number][] = [
      [0.7, -0.9, 0.5],
      [-0.8, 0.6, 0.3],
      [0.5, 0.8, 0.2],
    ];
    for (const [dx, dy, alpha] of offsets) {
      const blur = new Graphics();
      blur.roundRect(dx, dy, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
      blur.fill({ color: t.faceColor, alpha });
      parent.addChild(blur);
    }

    // Normal face on top
    const face = new Graphics();
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.fill(t.faceColor);
    face.roundRect(1, 1, TILE_WIDTH - 2, TILE_HEIGHT * 0.4, CORNER_RADIUS);
    face.fill({ color: t.faceColorTop, alpha: 0.5 });
    // Softer border (0.5px instead of 1px)
    face.roundRect(0, 0, TILE_WIDTH, TILE_HEIGHT, CORNER_RADIUS);
    face.stroke({ color: t.borderColor, width: 0.5 });
    face.roundRect(3, 3, TILE_WIDTH - 6, TILE_HEIGHT - 6, 3);
    face.stroke({ color: t.innerBorderColor, width: 0.5 });
    parent.addChild(face);
    return face;
  }

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.watercolorStalk(g, cx, cy - 6, 32, t.bambooColor, 1);
      g.circle(cx, cy - 20, 6); g.fill(t.characterColor);
      g.circle(cx, cy - 20, 3.5); g.fill(0xFF4444);
    } else {
      let idx = 0;
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.watercolorStalk(g, px, py, 14, t.bambooColor, idx);
        idx++;
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor);
  }

  /** Draw a watercolor-blurred stalk: 3 overlapping rects at slight offsets + main on top. */
  private watercolorStalk(g: Graphics, x: number, y: number, height: number, color: number, seed: number): void {
    const w = 6; // wider than classic (5px)
    const layers: [number, number][] = [
      [((seed * 3 + 1) % 7 - 3) * 0.33, 0.4],
      [((seed * 5 + 2) % 7 - 3) * 0.33, 0.3],
      [((seed * 7 + 3) % 7 - 3) * 0.33, 0.2],
    ];
    for (const [dx, alpha] of layers) {
      g.roundRect(x - w / 2 + dx, y - height / 2, w, height, 2);
      g.fill({ color, alpha });
    }
    // Main stalk on top
    g.roundRect(x - w / 2, y - height / 2, w, height, 2);
    g.fill(color);
  }

  drawDot(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;
    const positions = getDotPositions(value, cx, cy);
    const radius = value <= 3 ? 7 : value <= 6 ? 6 : 5;

    positions.forEach(([px, py], idx) => {
      // 3 blur layers at deterministic offsets
      const blurLayers: [number, number, number][] = [
        [(idx * 3 + 1) % 5 * 0.4 - 1, (idx * 7 + 2) % 5 * 0.4 - 1, 0.3],
        [(idx * 5 + 3) % 5 * 0.4 - 1, (idx * 2 + 1) % 5 * 0.4 - 1, 0.2],
        [(idx * 4 + 2) % 5 * 0.4 - 1, (idx * 6 + 3) % 5 * 0.4 - 1, 0.15],
      ];
      for (const [dx, dy, alpha] of blurLayers) {
        g.circle(px + dx, py + dy, radius);
        g.fill({ color: t.dotColor, alpha });
      }
      // Main dot on top — no inner rings for watercolor look
      g.circle(px, py, radius);
      g.fill(t.dotColor);
    });
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor);
  }

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;

    // Slight rotation for hand-painted feel
    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 20, fontFamily: 'serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5); numText.x = cx; numText.y = 26;
    numText.rotation = 2 * Math.PI / 180; // 2 degrees
    parent.addChild(numText);

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

    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', fill: color }),
    });
    text.anchor.set(0.5); text.x = cx; text.y = cy;
    // Slight rotation (deterministic per value)
    text.rotation = (1 + value * 0.3) * Math.PI / 180;
    parent.addChild(text);
    this.addCornerLabel(parent, '風', t.cornerLabelWind);
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
      const text = new Text({ text: '中', style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: 0xFFFFFF }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      text.rotation = 1.5 * Math.PI / 180;
      parent.addChild(text);
    } else if (value === 2) {
      const text = new Text({ text: '發', style: new TextStyle({ fontSize: 30, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      text.rotation = -1.2 * Math.PI / 180;
      parent.addChild(text);
    } else {
      const g = new Graphics();
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

    const mainText = new Text({ text: SEASON_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    // Decorative elements from base
    const g = new Graphics();
    this.drawSeasonDeco(g, value, cx, cy);

    // Paint splatter: 2-3 tiny dots near decoration
    const splatOffsets: [number, number][] = [
      [cx - 8 + value * 2.3, cy - 12 + value * 1.7],
      [cx + 6 - value * 1.1, cy - 20 + value * 2.1],
      [cx + 12 - value * 0.9, cy - 8 - value * 0.5],
    ];
    const splatCount = value <= 2 ? 3 : 2;
    for (let i = 0; i < splatCount; i++) {
      g.circle(splatOffsets[i][0], splatOffsets[i][1], 1.5);
      g.fill({ color, alpha: 0.2 });
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '季', t.cornerLabelSeason);
  }

  drawFlower(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2;
    const color = t.flowerColors[value - 1];

    const numText = new Text({ text: String(value), style: new TextStyle({ fontSize: 12, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    numText.anchor.set(1, 0); numText.x = TILE_WIDTH - 5; numText.y = 4;
    parent.addChild(numText);

    const mainText = new Text({ text: FLOWER_CHARS[value], style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
    mainText.anchor.set(0.5); mainText.x = cx; mainText.y = cy + 4;
    parent.addChild(mainText);

    // Decorative elements from base
    const g = new Graphics();
    this.drawFlowerDeco(g, value, cx - 14, cy - 18);

    // Paint splatter: 2-3 tiny dots near decoration
    const splatOffsets: [number, number][] = [
      [cx - 18 + value * 1.7, cy - 22 + value * 1.3],
      [cx - 10 - value * 0.8, cy - 14 + value * 2.5],
      [cx - 20 + value * 3.1, cy - 16 - value * 0.7],
    ];
    const splatCount = value <= 2 ? 3 : 2;
    for (let i = 0; i < splatCount; i++) {
      g.circle(splatOffsets[i][0], splatOffsets[i][1], 1.5);
      g.fill({ color, alpha: 0.2 });
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '花', t.cornerLabelFlower);
  }
}
