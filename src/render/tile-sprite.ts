import { Container, Graphics } from 'pixi.js';
import { TileType } from '../game/types';
import { TileThemeConfig, getTileTheme } from './tile-themes';
import { getStyleRenderer } from './tile-draw-styles';

export class TileSprite extends Container {
  public tileId: number;
  private highlight: Graphics;
  private dimmed = false;

  constructor(tileId: number, type: TileType, theme?: TileThemeConfig) {
    super();
    this.tileId = tileId;

    const t = theme ?? getTileTheme('classic');
    const style = getStyleRenderer(t.style);

    // Shadow
    style.drawShadow(this, t);

    // 3D edges
    style.drawEdges(this, t);

    // Face
    style.drawFace(this, t);

    // Artwork
    style.drawArtwork(this, type, t);

    // Highlight
    this.highlight = style.drawHighlight(this, t);

    this.eventMode = 'static';
    this.cursor = 'pointer';
  }

  setHighlight(on: boolean): void {
    this.highlight.visible = on;
  }

  setDimmed(dim: boolean): void {
    this.dimmed = dim;
    this.alpha = dim ? 0.5 : 1;
  }

  isDimmed(): boolean {
    return this.dimmed;
  }
}
