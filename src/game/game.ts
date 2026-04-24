import { Application } from 'pixi.js';
import { GameState, MoveRecord, TileInstance } from './types';
import { Board } from './board';
import { SelectionManager } from './selection';
import { GameRenderer } from '../render/renderer';
import { generateSolvableBoard, generateSolvableBoardWithOptions } from './generator';
import { getLayout } from './layout';
import { LAYOUTS } from './layouts';
import { tilesMatch } from './tiles';
import {
  saveGameState, loadGameState, clearGameState, loadSettings, hasSavedGame, PlayMode,
} from './storage';
import { HUD } from '../ui/hud';
import { MenuOverlay } from '../ui/menu';
import { SettingsModal } from '../ui/settings';
import { SoundManager } from '../audio/sound';
import { MusicManager } from '../audio/music';
import { BACKGROUND_THEMES } from '../render/background';
import { TILE_THEMES } from '../render/tile-themes';
import { ProgressionManager } from './progression-manager';
import { ChallengeLevelConfig } from './challenge-levels';
import '../ui/styles.css';

function randomKey(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

export class Game {
  private app: Application;
  private renderer: GameRenderer;
  private board!: Board;
  private selection = new SelectionManager();
  private hud: HUD;
  private menu: MenuOverlay;
  private settingsModal: SettingsModal;
  private sound = new SoundManager();
  private music = new MusicManager();
  private progression = new ProgressionManager();

  private state = GameState.Menu;
  private playMode: PlayMode = 'freePlay';
  private undoStack: MoveRecord[] = [];
  private tileBuffer: number[] = [];
  private currentScore = 0;
  private levelStartedAt = 0;
  private activeLevel: number | null = null;
  private activeChallengeConfig: ChallengeLevelConfig | null = null;
  private hintsRemaining: number | null = null;
  private shufflesRemaining: number | null = null;
  private undosRemaining: number | null = null;
  private animating = false;
  private xrayActive = false;
  private resizeTimer: number | null = null;
  private hudTimer: number | null = null;
  private lastBoardTap: { tileId: number; time: number } | null = null;

  constructor(app: Application) {
    this.app = app;
    this.renderer = new GameRenderer(app);

    const overlay = document.getElementById('ui-overlay')!;

    this.hud = new HUD(overlay);
    this.hud.onHint = () => this.hint();
    this.hud.onXray = () => this.toggleXray();
    this.hud.onShuffle = () => this.shuffle();
    this.hud.onUndo = () => this.undo();
    this.hud.onMenu = () => this.pause();
    this.hud.hide();

    this.menu = new MenuOverlay(overlay);
    this.menu.onChallenge = () => this.startChallenge();
    this.menu.onFreePlay = () => this.startFreePlay();
    this.menu.onContinueChallenge = () => this.resumeChallenge();
    this.menu.onContinueFreePlay = () => this.resumeFreePlay();
    this.menu.onResume = () => this.resume();
    this.menu.onShuffleContinue = () => this.resumeAfterLose();
    this.menu.onSettings = () => this.openSettings();
    this.menu.onNextLevel = () => this.startChallenge((this.activeLevel ?? 1) + 1);
    this.menu.onReplay = () => {
      if (this.playMode === 'challenge' && this.activeLevel !== null) this.startChallenge(this.activeLevel);
    };
    this.menu.onMainMenu = () => this.returnToMainMenu();

    this.settingsModal = new SettingsModal(overlay);
    this.settingsModal.onChange = (s) => {
      this.sound.setEnabled(s.soundEnabled);
      this.music.setEnabled(s.musicEnabled);
      this.applyPerformanceMode(s.performanceMode);
      if (this.playMode !== 'challenge') {
        this.renderer.setTheme(s.theme);
        this.renderer.setTileTheme(s.tileTheme);
      }
      if (this.state === GameState.Playing || this.state === GameState.Paused) {
        this.updateFreeTileStates();
      }
    };

    this.renderer.setTileClickHandler((tileId) => this.handleTileClick(tileId));
    this.renderer.setBufferTileClickHandler((tileId) => this.handleBufferTileClick(tileId));

    const settings = loadSettings();
    this.sound.setEnabled(settings.soundEnabled);
    this.music.setEnabled(settings.musicEnabled);
    this.applyPerformanceMode(settings.performanceMode);
    this.renderer.setTheme(settings.theme);
    this.renderer.setTileTheme(settings.tileTheme);

    window.addEventListener('resize', () => {
      if (this.state === GameState.Playing || this.state === GameState.Paused) {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(() => {
          this.renderer.repositionBoard();
        }, 150);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.music.pause();
      } else {
        this.music.resumePlayback();
      }
    });
  }

  start(): void {
    this.menu.showMainMenu(hasSavedGame('challenge'), hasSavedGame('freePlay'));
  }

  private applyPerformanceMode(enabled: boolean): void {
    document.body.classList.toggle('low-performance', enabled);
    this.renderer.setPerformanceMode(enabled);
    if (this.hudTimer !== null || this.state === GameState.Playing || this.state === GameState.Paused) {
      this.hud.showToast(enabled
        ? 'Performance Mode enabled. Restart for full resolution change.'
        : 'Performance Mode disabled. Restart for full resolution change.', 1800);
    }
  }

  private openSettings(): void {
    this.settingsModal.setContext(
      this.playMode,
      this.progression.getAccessibleTileThemes(),
      this.progression.getAccessibleBackgrounds(),
      this.progression.getAccessibleLayouts(),
    );
    this.settingsModal.show();
  }

  private startChallenge(levelNumber = this.progression.getProfile().currentLevel): void {
    this.startGame({ mode: 'challenge', levelNumber: Math.min(100, Math.max(1, levelNumber)) });
  }

  private startFreePlay(): void {
    this.startGame({ mode: 'freePlay' });
  }

  private startGame(options: { mode: PlayMode; levelNumber?: number }): void {
    this.menu.hide();
    clearGameState(options.mode);
    this.stopHudTimer();
    this.playMode = options.mode;
    this.activeLevel = options.mode === 'challenge' ? options.levelNumber ?? this.progression.getProfile().currentLevel : null;
    this.activeChallengeConfig = this.activeLevel !== null ? this.progression.getLevelConfig(this.activeLevel) : null;
    this.hintsRemaining = this.activeChallengeConfig?.hintLimit ?? null;
    this.shufflesRemaining = this.activeChallengeConfig?.shuffleLimit ?? null;
    this.undosRemaining = this.activeChallengeConfig?.undoLimit ?? null;

    const settings = loadSettings();
    const themeKey = options.mode === 'challenge'
      ? this.getChallengeBackgroundKey(this.activeLevel ?? 1)
      : settings.theme;
    const tileThemeKey = options.mode === 'challenge'
      ? this.getChallengeTileThemeKey(this.activeLevel ?? 1)
      : settings.tileTheme;
    const layoutKey = options.mode === 'challenge'
      ? this.getChallengeLayout(this.activeChallengeConfig)
      : settings.layout || randomKey(LAYOUTS);

    this.renderer.setTheme(themeKey);
    this.renderer.setTileThemeQuiet(tileThemeKey);

    const layout = getLayout(layoutKey);
    const tiles = this.activeChallengeConfig
      ? generateSolvableBoardWithOptions(layout, this.activeChallengeConfig.generation)
      : generateSolvableBoard(layout);
    this.board = new Board(tiles);
    this.selection.clear();
    this.undoStack = [];
    this.tileBuffer = [];
    this.currentScore = 0;
    this.levelStartedAt = Date.now();
    if (options.mode === 'challenge') {
      this.progression.startLevel(this.activeLevel ?? this.progression.getProfile().currentLevel);
    }
    this.progression.resetCombo();
    this.lastBoardTap = null;
    this.xrayActive = false;
    this.state = GameState.Playing;

    this.renderer.setXrayMode(false);
    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.updateFreeTileStates();

    this.hud.setXrayActive(false);
    this.hud.setChallengeMode(options.mode === 'challenge');
    this.updateChallengeHud();
    this.startHudTimer();
    this.hud.show();
    this.hud.updateTilesRemaining(this.board.getRemainingCount());
    this.hud.updateAssistLimits(this.hintsRemaining, this.shufflesRemaining, this.undosRemaining);

    this.sound.playNewGame();
    this.renderer.playNewGameEffect();
    this.music.start();
  }

  private resume(): void {
    if (this.state === GameState.Paused) {
      this.state = GameState.Playing;
      this.startHudTimer();
      this.menu.hide();
    }
  }

  private resumeChallenge(): void {
    this.resumeSavedGame('challenge');
  }

  private resumeFreePlay(): void {
    this.resumeSavedGame('freePlay');
  }

  private resumeSavedGame(mode: PlayMode): void {
    const saved = loadGameState(mode);
    if (!saved) {
      if (mode === 'challenge') this.startChallenge();
      else this.startFreePlay();
      return;
    }

    this.stopHudTimer();
    this.playMode = mode;
    this.activeLevel = mode === 'challenge' ? saved.activeLevel ?? this.progression.getProfile().currentLevel : null;
    this.activeChallengeConfig = this.activeLevel !== null ? this.progression.getLevelConfig(this.activeLevel) : null;
    this.hintsRemaining = mode === 'challenge' ? saved.hintsRemaining ?? this.activeChallengeConfig?.hintLimit ?? 0 : null;
    this.shufflesRemaining = mode === 'challenge' ? saved.shufflesRemaining ?? this.activeChallengeConfig?.shuffleLimit ?? 0 : null;
    this.undosRemaining = mode === 'challenge' ? saved.undosRemaining ?? this.activeChallengeConfig?.undoLimit ?? 0 : null;

    const settings = loadSettings();
    const themeKey = mode === 'challenge'
      ? this.getChallengeBackgroundKey(this.activeLevel ?? 1)
      : settings.theme;
    const tileThemeKey = mode === 'challenge'
      ? this.getChallengeTileThemeKey(this.activeLevel ?? 1)
      : settings.tileTheme;
    this.renderer.setTheme(themeKey);
    this.renderer.setTileThemeQuiet(tileThemeKey);

    const tiles = saved.tiles.map(t => ({ ...t, inBuffer: t.inBuffer ?? false }));
    this.board = new Board(tiles);
    this.tileBuffer = (saved.tileBuffer ?? []).filter(id => {
      const tile = this.board.tiles.get(id);
      return tile && !tile.matched;
    });
    for (const id of this.tileBuffer) {
      this.board.moveToBuffer(id);
    }
    this.undoStack = (saved.undoStack ?? []).filter((record): record is MoveRecord => (
      record.kind === 'match' || record.kind === 'buffer'
    ));
    this.currentScore = saved.score ?? 0;
    this.levelStartedAt = Date.now() - (saved.elapsedSeconds ?? 0) * 1000;
    if (mode === 'challenge') {
      this.progression.startLevel(this.activeLevel ?? this.progression.getProfile().currentLevel);
    }
    this.progression.resetCombo();
    this.lastBoardTap = null;
    this.xrayActive = false;
    this.selection.clear();
    this.state = GameState.Playing;

    this.renderer.setXrayMode(false);
    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.updateFreeTileStates();

    this.hud.setXrayActive(false);
    this.hud.setChallengeMode(mode === 'challenge');
    this.updateChallengeHud();
    this.startHudTimer();
    this.hud.show();
    this.hud.updateTilesRemaining(this.board.getRemainingCount());
    this.hud.updateAssistLimits(this.hintsRemaining, this.shufflesRemaining, this.undosRemaining);

    this.menu.hide();
    this.music.start();
  }

  private pause(): void {
    if (this.state !== GameState.Playing) return;
    this.state = GameState.Paused;
    this.stopHudTimer();
    this.saveCurrentState();
    this.menu.showPause();
  }

  private resumeAfterLose(): void {
    this.menu.hide();
    this.state = GameState.Playing;
    this.startHudTimer();
    this.shuffle();
  }

  private returnToMainMenu(): void {
    this.stopHudTimer();
    this.state = GameState.Menu;
    this.hud.hide();
    this.selection.clear();
    this.menu.showMainMenu(hasSavedGame('challenge'), hasSavedGame('freePlay'));
  }

  private async handleTileClick(tileId: number): Promise<void> {
    if (this.state !== GameState.Playing || this.animating) return;

    const now = Date.now();
    const isDoubleTap = this.lastBoardTap?.tileId === tileId && now - this.lastBoardTap.time <= 320;
    this.lastBoardTap = { tileId, time: now };

    if (isDoubleTap) {
      await this.moveTileToBuffer(tileId);
      return;
    }

    const bufferMatch = this.findMatchingBufferTile(tileId);
    if (bufferMatch !== null && this.board.isFree(tileId)) {
      await this.matchTiles(tileId, bufferMatch);
      return;
    }

    const result = this.selection.handleTileClick(tileId, this.board);

    switch (result.action) {
      case 'select':
        this.sound.playSelect();
        navigator.vibrate?.(10);
        this.renderer.animateSelect(tileId);
        this.updateFreeTileStates();
        break;
      case 'deselect':
        this.updateFreeTileStates();
        break;
      case 'reselect':
        this.sound.playSelect();
        this.updateFreeTileStates();
        break;
      case 'match':
        await this.matchTiles(result.tile1Id, result.tile2Id);
        break;
      case 'blocked':
        this.sound.playInvalid();
        this.renderer.animateInvalid(tileId);
        break;
    }
  }

  private async handleBufferTileClick(tileId: number): Promise<void> {
    if (this.state !== GameState.Playing || this.animating) return;

    const match = this.findMatchingBufferTile(tileId);
    if (match !== null) {
      await this.matchTiles(tileId, match);
      return;
    }

    this.sound.playSelect();
    this.hud.showToast('Buffered', 1000);
  }

  private async moveTileToBuffer(tileId: number): Promise<void> {
    if (!this.board.isFree(tileId)) {
      this.sound.playInvalid();
      this.renderer.animateInvalid(tileId);
      return;
    }

    const bufferMatch = this.findMatchingBufferTile(tileId);
    if (bufferMatch !== null) {
      await this.matchTiles(tileId, bufferMatch);
      return;
    }

    if (this.tileBuffer.length >= 4) {
      this.sound.playInvalid();
      this.renderer.animateInvalid(tileId);
      this.hud.showToast('Buffer Full');
      return;
    }

    const tile = this.board.tiles.get(tileId);
    if (!tile) return;

    this.undoStack.push({
      kind: 'buffer',
      tile: this.cloneTile(tile),
      previousBuffer: [...this.tileBuffer],
    });

    this.selection.clear();
    this.board.moveToBuffer(tileId);
    this.tileBuffer.push(tileId);
    this.sound.playSelect();
    navigator.vibrate?.(10);

    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.updateFreeTileStates();
    this.checkEndState();
  }

  private async matchTiles(tile1Id: number, tile2Id: number): Promise<void> {
    const tile1 = this.board.tiles.get(tile1Id);
    const tile2 = this.board.tiles.get(tile2Id);
    if (!tile1 || !tile2 || tile1.matched || tile2.matched || !tilesMatch(tile1.type, tile2.type)) return;
    if (!tile1.inBuffer && !this.board.isFree(tile1Id)) return;
    if (!tile2.inBuffer && !this.board.isFree(tile2Id)) return;

    this.animating = true;
    this.sound.playMatch();
    navigator.vibrate?.([10, 50, 20]);
    this.currentScore += this.progression.recordSuccessfulMatch();
    this.updateChallengeHud();

    this.undoStack.push({
      kind: 'match',
      tile1: this.cloneTile(tile1),
      tile2: this.cloneTile(tile2),
      previousBuffer: [...this.tileBuffer],
    });

    this.selection.clear();
    this.tileBuffer = this.tileBuffer.filter(id => id !== tile1Id && id !== tile2Id);
    this.board.removePair(tile1Id, tile2Id);

    await this.renderer.animateMatch(tile1Id, tile2Id);

    this.hud.updateTilesRemaining(this.board.getRemainingCount());
    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.checkEndState();
    this.animating = false;
  }

  private findMatchingBufferTile(tileId: number): number | null {
    const tile = this.board.tiles.get(tileId);
    if (!tile || tile.matched) return null;

    for (const id of this.tileBuffer) {
      if (id === tileId) continue;
      const buffered = this.board.tiles.get(id);
      if (buffered && !buffered.matched && tilesMatch(tile.type, buffered.type)) {
        return id;
      }
    }

    return null;
  }

  private hint(): void {
    if (this.state !== GameState.Playing) return;
    if (this.playMode === 'challenge') {
      if ((this.hintsRemaining ?? 0) <= 0) {
        this.hud.showToast('No hints remaining');
        return;
      }
      this.hintsRemaining = Math.max(0, (this.hintsRemaining ?? 0) - 1);
      this.hud.updateAssistLimits(this.hintsRemaining, this.shufflesRemaining, this.undosRemaining);
    }

    const pair = this.board.getHint();
    if (pair) {
      this.renderer.highlightHint(pair[0].id, pair[1].id);
      this.hud.showToast('Hint', 1500);
    } else {
      const bufferMove = this.getBufferBoardHint();
      if (bufferMove) {
        this.renderer.highlightHint(bufferMove[0].id, bufferMove[1].id);
        this.hud.showToast('Hint', 1500);
      } else {
        this.hud.showToast('No moves available!');
      }
    }
  }

  private toggleXray(): void {
    if (this.state !== GameState.Playing || this.playMode === 'challenge') return;
    this.xrayActive = !this.xrayActive;
    this.renderer.setXrayMode(this.xrayActive);
    this.hud.setXrayActive(this.xrayActive);
    this.updateFreeTileStates();
    this.hud.showToast(this.xrayActive ? 'X-Ray ON' : 'X-Ray OFF', 1500);
  }

  private shuffle(retries = 0): void {
    if (this.state !== GameState.Playing) return;
    if (retries === 0 && this.playMode === 'challenge') {
      if ((this.shufflesRemaining ?? 0) <= 0) {
        this.hud.showToast('No shuffles remaining');
        return;
      }
      this.shufflesRemaining = Math.max(0, (this.shufflesRemaining ?? 0) - 1);
      this.hud.updateAssistLimits(this.hintsRemaining, this.shufflesRemaining, this.undosRemaining);
    }

    if (retries === 0) this.sound.playShuffle();
    this.board.shuffle();

    this.selection.clear();
    this.tileBuffer = this.tileBuffer.filter(id => {
      const tile = this.board.tiles.get(id);
      return tile && !tile.matched;
    });
    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.updateFreeTileStates();

    if (!this.hasAvailableMove() && retries < 5) {
      this.shuffle(retries + 1);
    } else if (retries === 0) {
      this.hud.showToast('Shuffled!', 1500);
    }
  }

  private undo(): void {
    if (this.state !== GameState.Playing || this.undoStack.length === 0) return;
    if (this.playMode === 'challenge') {
      if ((this.undosRemaining ?? 0) <= 0) {
        this.hud.showToast('No undos remaining');
        return;
      }
      this.undosRemaining = Math.max(0, (this.undosRemaining ?? 0) - 1);
      this.hud.updateAssistLimits(this.hintsRemaining, this.shufflesRemaining, this.undosRemaining);
    }

    const record = this.undoStack.pop()!;
    this.board.undoMove(record);
    this.tileBuffer = [...record.previousBuffer];
    this.selection.clear();

    this.renderCurrentBoard();
    this.renderTileBuffer();
    this.updateFreeTileStates();
    this.hud.updateTilesRemaining(this.board.getRemainingCount());
    this.hud.showToast('Undo', 1000);
  }

  private onWin(): void {
    this.state = GameState.Won;
    this.stopHudTimer();
    this.sound.playWin();
    const timeTaken = this.getElapsedSeconds();
    const result = this.playMode === 'challenge'
      ? this.progression.handleLevelComplete(this.currentScore, timeTaken)
      : null;
    clearGameState(this.playMode);

    setTimeout(() => {
      if (this.playMode === 'challenge' && result && this.activeLevel !== null) {
        const isFinalLevel = this.activeLevel >= 100;
        this.menu.showChallengeWin(
          result.score,
          result.timeTaken,
          !isFinalLevel,
          isFinalLevel ? 'Congratulations, you have completed Challenge mode!' : undefined,
        );
        return;
      }
      this.menu.showWin();
    }, 500);
  }

  private onLose(): void {
    this.state = GameState.Lost;
    this.stopHudTimer();
    this.saveCurrentState();

    const canShuffleContinue = this.playMode === 'freePlay' || (this.shufflesRemaining ?? 0) > 0;
    setTimeout(() => {
      this.menu.showLose(this.board.getRemainingCount(), canShuffleContinue);
    }, 300);
  }

  private renderCurrentBoard(): void {
    const tiles = [...this.board.tiles.values()];
    this.renderer.renderBoard(tiles);
  }

  private renderTileBuffer(): void {
    const tiles = this.tileBuffer
      .map(id => this.board.tiles.get(id))
      .filter((tile): tile is TileInstance => !!tile && !tile.matched);
    this.renderer.renderBuffer(tiles);
  }

  private updateFreeTileStates(): void {
    const freeTiles = this.board.getFreeTiles();
    const freeIds = new Set(freeTiles.map(t => t.id));
    this.renderer.updateTileStates(freeIds, this.selection.selectedTileId);
  }

  private checkEndState(): void {
    if (this.board.isCleared()) {
      this.onWin();
    } else if (!this.hasAvailableMove()) {
      this.onLose();
    } else {
      this.updateFreeTileStates();
    }
  }

  private hasAvailableMove(): boolean {
    if (this.board.hasValidMoves()) return true;
    if (this.getBufferBoardHint()) return true;

    const freeTiles = this.board.getFreeTiles();
    if (this.tileBuffer.length < 4 && freeTiles.length > 0) return true;

    for (let i = 0; i < this.tileBuffer.length; i++) {
      for (let j = i + 1; j < this.tileBuffer.length; j++) {
        const a = this.board.tiles.get(this.tileBuffer[i]);
        const b = this.board.tiles.get(this.tileBuffer[j]);
        if (a && b && !a.matched && !b.matched && tilesMatch(a.type, b.type)) return true;
      }
    }

    if (this.playMode === 'challenge') {
      if ((this.shufflesRemaining ?? 0) > 0) return true;
      if ((this.undosRemaining ?? 0) > 0 && this.undoStack.length > 0) return true;
    }

    return false;
  }

  private getBufferBoardHint(): [TileInstance, TileInstance] | null {
    const freeTiles = this.board.getFreeTiles();
    for (const freeTile of freeTiles) {
      for (const id of this.tileBuffer) {
        const buffered = this.board.tiles.get(id);
        if (buffered && !buffered.matched && tilesMatch(freeTile.type, buffered.type)) {
          return [freeTile, buffered];
        }
      }
    }
    return null;
  }

  private cloneTile(tile: TileInstance): TileInstance {
    return {
      ...tile,
      type: { ...tile.type },
      position: { ...tile.position },
    };
  }

  private updateChallengeHud(): void {
    if (this.playMode !== 'challenge' || this.activeLevel === null) return;
    this.hud.updateChallengeStats(this.activeLevel, this.currentScore, this.getElapsedSeconds());
  }

  private startHudTimer(): void {
    this.stopHudTimer();
    if (this.playMode !== 'challenge') return;
    this.updateChallengeHud();
    this.hudTimer = window.setInterval(() => this.updateChallengeHud(), 1000);
  }

  private stopHudTimer(): void {
    if (this.hudTimer !== null) {
      window.clearInterval(this.hudTimer);
      this.hudTimer = null;
    }
  }

  private saveCurrentState(): void {
    const tiles = [...this.board.tiles.values()];
    saveGameState({
      mode: this.playMode,
      tiles,
      tileBuffer: this.tileBuffer,
      undoStack: this.undoStack,
      score: this.currentScore,
      activeLevel: this.activeLevel ?? undefined,
      elapsedSeconds: this.getElapsedSeconds(),
      hintsRemaining: this.hintsRemaining ?? undefined,
      shufflesRemaining: this.shufflesRemaining ?? undefined,
      undosRemaining: this.undosRemaining ?? undefined,
    }, this.playMode);
  }

  private getElapsedSeconds(): number {
    return Math.max(0, Math.floor((Date.now() - this.levelStartedAt) / 1000));
  }

  private getChallengeLayout(config: ChallengeLevelConfig | null): string {
    if (config && config.layoutType in LAYOUTS) return config.layoutType;
    return 'turtle';
  }

  private getChallengeTileThemeKey(levelNumber: number): string {
    const unlocked = this.progression.getAccessibleTileThemes();
    return unlocked[(levelNumber - 1) % unlocked.length] ?? 'classic';
  }

  private getChallengeBackgroundKey(levelNumber: number): string {
    const unlocked = this.progression.getAccessibleBackgrounds();
    return unlocked[(levelNumber - 1) % unlocked.length] ?? 'classic';
  }
}
