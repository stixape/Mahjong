import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TileThemeConfig } from '../tile-themes';
import {
  BaseStyle, getBambooPositions, getDotPositions,
  NUMERALS, WIND_CHARS, SEASON_CHARS, FLOWER_CHARS,
  TILE_WIDTH, TILE_HEIGHT,
} from './base-style';

/** The original tile drawing style — rounded bamboo stalks, concentric dot circles, serif kanji. */
export class ClassicStyle extends BaseStyle {

  drawBamboo(parent: Container, value: number, t: TileThemeConfig): void {
    const g = new Graphics();
    const cx = TILE_WIDTH / 2;
    const cy = TILE_HEIGHT / 2 + 2;

    if (value === 1) {
      this.bambooStalk(g, cx, cy - 6, 32, t.bambooColor, t.bambooAccent, t.bambooHighlight);
      g.circle(cx, cy - 20, 6); g.fill(t.characterColor);
      g.circle(cx, cy - 20, 3.5); g.fill(0xFF4444);
    } else {
      for (const [px, py] of getBambooPositions(value, cx, cy)) {
        this.bambooStalk(g, px, py, 14, t.bambooColor, t.bambooAccent, t.bambooHighlight);
      }
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '竹', t.bambooColor);
  }

  private bambooStalk(g: Graphics, x: number, y: number, height: number, color: number, dark: number, highlight: number): void {
    const w = 5;
    g.roundRect(x - w / 2, y - height / 2, w, height, 2);
    g.fill(color);
    const segments = Math.floor(height / 8);
    for (let i = 1; i < segments; i++) {
      const sy = y - height / 2 + i * (height / segments);
      g.moveTo(x - w / 2, sy); g.lineTo(x + w / 2, sy);
      g.stroke({ color: dark, width: 1 });
    }
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
      g.circle(px, py, radius); g.fill(t.dotColor);
      g.circle(px, py, radius * 0.6); g.fill(0xFFFFFF);
      g.circle(px, py, radius * 0.2); g.fill(t.dotColor);
    }
    parent.addChild(g);
    this.addCornerLabel(parent, '筒', t.dotColor);
  }

  drawCharacter(parent: Container, value: number, t: TileThemeConfig): void {
    const cx = TILE_WIDTH / 2;
    const numText = new Text({
      text: NUMERALS[value],
      style: new TextStyle({ fontSize: 20, fontFamily: 'serif', fontWeight: 'bold', fill: t.characterColor }),
    });
    numText.anchor.set(0.5); numText.x = cx; numText.y = 26;
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
    const text = new Text({
      text: WIND_CHARS[value],
      style: new TextStyle({ fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', fill: t.windColors[value - 1] }),
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
      const g = new Graphics();
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.fill(color);
      g.roundRect(cx - 14, cy - 18, 28, 36, 3); g.stroke({ color, width: 1, alpha: 0.6 });
      parent.addChild(g);
      const text = new Text({ text: '中', style: new TextStyle({ fontSize: 28, fontFamily: 'serif', fontWeight: 'bold', fill: 0xFFFFFF }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
      parent.addChild(text);
    } else if (value === 2) {
      const text = new Text({ text: '發', style: new TextStyle({ fontSize: 30, fontFamily: 'serif', fontWeight: 'bold', fill: color }) });
      text.anchor.set(0.5); text.x = cx; text.y = cy;
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

    const g = new Graphics();
    this.drawSeasonDeco(g, value, cx, cy);
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

    const g = new Graphics();
    this.drawFlowerDeco(g, value, cx - 14, cy - 18);
    parent.addChild(g);
    this.addCornerLabel(parent, '花', t.cornerLabelFlower);
  }
}
