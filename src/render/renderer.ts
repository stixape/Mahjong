import { Application, Container, Graphics } from 'pixi.js';
import { TileInstance, GridPosition } from '../game/types';
import { gridToScreen, calculateBoardBounds, fitBoardToScreen, TILE_WIDTH, TILE_HEIGHT } from '../game/coordinates';
import { TileSprite } from './tile-sprite';
import { TileThemeConfig, getTileTheme } from './tile-themes';
import { createBackground, ThemedBackground } from './background';
import { spawnMatchParticles, spawnNewGameSparkles } from './particles';
import { animateTileMatch, animateTileSelect, animateInvalidSelection } from './animations';

const PADDING_X = 20;
const PADDING_TOP = 92;
const PADDING_BOTTOM = 165;
const BUFFER_CAPACITY = 4;
const BUFFER_SCALE = 0.72;
const BUFFER_SLOT_GAP = 10;

export class GameRenderer {
  private app: Application;
  private bg: ThemedBackground;
  private boardContainer: Container;
  private bufferContainer: Container;
  private particleContainer: Container;
  private tileSprites: Map<number, TileSprite> = new Map();
  private bufferSprites: Map<number, TileSprite> = new Map();
  private boardScale = 1;
  private boardOffsetX = 0;
  private boardOffsetY = 0;
  private boardMinX = 0;
  private boardMinY = 0;
  private onTileClick: ((tileId: number) => void) | null = null;
  private onBufferTileClick: ((tileId: number) => void) | null = null;
  private xrayMode = false;
  private tileTheme: TileThemeConfig = getTileTheme('classic');
  private currentTiles: TileInstance[] = [];

  constructor(app: Application) {
    this.app = app;

    // Background
    this.bg = createBackground(app);
    app.stage.addChild(this.bg);

    // Board container
    this.boardContainer = new Container();
    app.stage.addChild(this.boardContainer);

    this.bufferContainer = new Container();
    app.stage.addChild(this.bufferContainer);

    // Particle container (on top)
    this.particleContainer = new Container();
    app.stage.addChild(this.particleContainer);

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  setTileClickHandler(handler: (tileId: number) => void): void {
    this.onTileClick = handler;
  }

  setBufferTileClickHandler(handler: (tileId: number) => void): void {
    this.onBufferTileClick = handler;
  }

  private computeLayout(positions: GridPosition[]) {
    const bounds = calculateBoardBounds(positions);
    const fit = fitBoardToScreen(
      bounds.width, bounds.height,
      this.app.screen.width, this.app.screen.height,
      PADDING_X, PADDING_TOP, PADDING_BOTTOM,
    );
    return { ...fit, minX: bounds.minX, minY: bounds.minY };
  }

  renderBoard(tiles: TileInstance[]): void {
    this.currentTiles = tiles;
    // Clear existing
    this.boardContainer.removeChildren();
    this.tileSprites.clear();

    // Calculate bounds and scaling
    const boardTiles = tiles.filter(t => !t.matched && !t.inBuffer);
    const positions = boardTiles.map(t => t.position);
    if (positions.length === 0) return;
    const layout = this.computeLayout(positions);
    this.boardScale = layout.scale;
    this.boardOffsetX = layout.offsetX;
    this.boardOffsetY = layout.offsetY;
    this.boardMinX = layout.minX;
    this.boardMinY = layout.minY;

    // Sort tiles: lower layer first, then by row (top first) for correct overlap
    const sorted = [...boardTiles].sort((a, b) => {
      if (a.position.layer !== b.position.layer) return a.position.layer - b.position.layer;
      if (a.position.row !== b.position.row) return a.position.row - b.position.row;
      return a.position.col - b.position.col;
    });

    for (const tile of sorted) {
      const sprite = new TileSprite(tile.id, tile.type, this.tileTheme);
      const screen = gridToScreen(tile.position);
      sprite.x = (screen.x - this.boardMinX) * this.boardScale;
      sprite.y = (screen.y - this.boardMinY) * this.boardScale;
      sprite.scale.set(this.boardScale);

      sprite.on('pointerdown', () => {
        this.onTileClick?.(tile.id);
      });

      this.tileSprites.set(tile.id, sprite);
      this.boardContainer.addChild(sprite);
    }

    // Position the board container
    this.boardContainer.x = this.boardOffsetX;
    this.boardContainer.y = this.boardOffsetY;
  }

  renderBuffer(tiles: TileInstance[]): void {
    this.bufferContainer.removeChildren();
    this.bufferSprites.clear();

    const slotWidth = TILE_WIDTH * BUFFER_SCALE;
    const slotHeight = TILE_HEIGHT * BUFFER_SCALE;
    const totalWidth = BUFFER_CAPACITY * slotWidth + (BUFFER_CAPACITY - 1) * BUFFER_SLOT_GAP;
    const startX = (this.app.screen.width - totalWidth) / 2;
    const y = this.app.screen.height - 142;

    for (let i = 0; i < BUFFER_CAPACITY; i++) {
      const x = i * (slotWidth + BUFFER_SLOT_GAP);
      const slot = new Graphics()
        .roundRect(x, 0, slotWidth, slotHeight, 8)
        .fill({ color: 0x143d22, alpha: 0.7 })
        .stroke({ color: 0xffd700, alpha: 0.35, width: 1 });
      this.bufferContainer.addChild(slot);
    }

    tiles.forEach((tile, index) => {
      const sprite = new TileSprite(tile.id, tile.type, this.tileTheme);
      sprite.x = index * (slotWidth + BUFFER_SLOT_GAP);
      sprite.y = 0;
      sprite.scale.set(BUFFER_SCALE);
      sprite.on('pointerdown', () => {
        this.onBufferTileClick?.(tile.id);
      });
      this.bufferSprites.set(tile.id, sprite);
      this.bufferContainer.addChild(sprite);
    });

    this.bufferContainer.x = startX;
    this.bufferContainer.y = y;
  }

  /** Reposition existing sprites without recreating them (used on resize/orientation change) */
  repositionBoard(): void {
    if (this.currentTiles.length === 0) return;

    const boardTiles = this.currentTiles.filter(t => !t.matched && !t.inBuffer);
    const positions = boardTiles.map(t => t.position);
    if (positions.length === 0) {
      this.renderBuffer(this.currentTiles.filter(t => !t.matched && t.inBuffer));
      return;
    }
    const layout = this.computeLayout(positions);
    this.boardScale = layout.scale;
    this.boardOffsetX = layout.offsetX;
    this.boardOffsetY = layout.offsetY;
    this.boardMinX = layout.minX;
    this.boardMinY = layout.minY;

    // Build position lookup from current tiles
    const posById = new Map<number, GridPosition>();
    for (const tile of boardTiles) {
      if (!tile.matched && !tile.inBuffer) posById.set(tile.id, tile.position);
    }

    for (const [id, sprite] of this.tileSprites) {
      const pos = posById.get(id);
      if (!pos) continue;
      const screen = gridToScreen(pos);
      sprite.x = (screen.x - this.boardMinX) * this.boardScale;
      sprite.y = (screen.y - this.boardMinY) * this.boardScale;
      sprite.scale.set(this.boardScale);
    }

    this.boardContainer.x = this.boardOffsetX;
    this.boardContainer.y = this.boardOffsetY;

    const bufferTiles = this.currentTiles.filter(t => !t.matched && t.inBuffer);
    this.renderBuffer(bufferTiles);
  }

  setXrayMode(on: boolean): void {
    this.xrayMode = on;
  }

  updateTileStates(freeTileIds: Set<number>, selectedId: number | null): void {
    for (const [id, sprite] of this.tileSprites) {
      sprite.setHighlight(id === selectedId);
      const isFree = freeTileIds.has(id);
      // X-Ray ON: dim non-free tiles; X-Ray OFF: all tiles full opacity
      sprite.setDimmed(this.xrayMode && !isFree);
      sprite.eventMode = isFree ? 'static' : 'none';
    }
  }

  async animateMatch(id1: number, id2: number): Promise<void> {
    const s1 = this.tileSprites.get(id1) ?? this.bufferSprites.get(id1);
    const s2 = this.tileSprites.get(id2) ?? this.bufferSprites.get(id2);
    if (!s1 || !s2) return;

    // Spawn particles at tile centers
    const c1 = this.getTileCenter(id1, s1);
    const c2 = this.getTileCenter(id2, s2);
    const cx1 = c1.x;
    const cy1 = c1.y;
    const cx2 = c2.x;
    const cy2 = c2.y;
    spawnMatchParticles(this.particleContainer, cx1, cy1, this.app.ticker);
    spawnMatchParticles(this.particleContainer, cx2, cy2, this.app.ticker);

    await animateTileMatch(s1, s2, this.app.ticker);

    // Remove sprites
    s1.parent?.removeChild(s1);
    s2.parent?.removeChild(s2);
    s1.destroy();
    s2.destroy();
    this.tileSprites.delete(id1);
    this.tileSprites.delete(id2);
    this.bufferSprites.delete(id1);
    this.bufferSprites.delete(id2);
  }

  private getTileCenter(id: number, sprite: TileSprite): { x: number; y: number } {
    const parent = this.bufferSprites.has(id) ? this.bufferContainer : this.boardContainer;
    const scale = sprite.scale.x;
    return {
      x: parent.x + sprite.x + (TILE_WIDTH * scale) / 2,
      y: parent.y + sprite.y + (TILE_HEIGHT * scale) / 2,
    };
  }

  async animateSelect(tileId: number): Promise<void> {
    const sprite = this.tileSprites.get(tileId);
    if (sprite) await animateTileSelect(sprite, this.app.ticker);
  }

  async animateInvalid(tileId: number): Promise<void> {
    const sprite = this.tileSprites.get(tileId);
    if (sprite) await animateInvalidSelection(sprite, this.app.ticker);
  }

  highlightHint(id1: number, id2: number): void {
    const s1 = this.tileSprites.get(id1) ?? this.bufferSprites.get(id1);
    const s2 = this.tileSprites.get(id2) ?? this.bufferSprites.get(id2);
    if (s1) s1.setHighlight(true);
    if (s2) s2.setHighlight(true);

    setTimeout(() => {
      if (s1) s1.setHighlight(false);
      if (s2) s2.setHighlight(false);
    }, 1500);
  }

  playNewGameEffect(): void {
    spawnNewGameSparkles(
      this.particleContainer,
      this.app.screen.width,
      this.app.screen.height,
      this.app.ticker,
    );
  }

  setTheme(theme: string): void {
    this.bg.setTheme(theme);
  }

  setTileTheme(themeKey: string): void {
    this.tileTheme = getTileTheme(themeKey);
    // Re-render if we have tiles
    if (this.currentTiles.length > 0) {
      this.renderBoard(this.currentTiles);
      this.renderBuffer(this.currentTiles.filter(t => !t.matched && t.inBuffer));
    }
  }

  /** Update tile theme without triggering a re-render (use before renderBoard) */
  setTileThemeQuiet(themeKey: string): void {
    this.tileTheme = getTileTheme(themeKey);
  }

  private onResize(): void {
    // Re-render will be triggered by the game controller
  }
}
