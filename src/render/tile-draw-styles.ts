import { Container, Graphics } from 'pixi.js';
import { TileType } from '../game/types';
import { TileThemeConfig, TileDrawStyle } from './tile-themes';

export interface TileStyleRenderer {
  /** Draw shadow behind tile */
  drawShadow(parent: Container, t: TileThemeConfig): void;
  /** Draw 3D edge (bottom + right faces) */
  drawEdges(parent: Container, t: TileThemeConfig): void;
  /** Draw main face and return the Graphics for reference */
  drawFace(parent: Container, t: TileThemeConfig): Graphics;
  /** Draw the tile artwork (suit-specific) */
  drawArtwork(parent: Container, type: TileType, t: TileThemeConfig): void;
  /** Draw highlight border and return the Graphics */
  drawHighlight(parent: Container, t: TileThemeConfig): Graphics;
}

import { ClassicStyle } from './styles/classic-style';
import { OrnateStyle } from './styles/ornate-style';
import { MinimalStyle } from './styles/minimal-style';
import { NeonStyle } from './styles/neon-style';
import { WatercolorStyle } from './styles/watercolor-style';
import { CalligraphyStyle } from './styles/calligraphy-style';

const STYLES: Record<TileDrawStyle, TileStyleRenderer> = {
  classic: new ClassicStyle(),
  ornate: new OrnateStyle(),
  minimal: new MinimalStyle(),
  neon: new NeonStyle(),
  watercolor: new WatercolorStyle(),
  calligraphy: new CalligraphyStyle(),
};

export function getStyleRenderer(style: TileDrawStyle): TileStyleRenderer {
  return STYLES[style] ?? STYLES.classic;
}
