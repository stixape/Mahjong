export class HUD {
  private container: HTMLElement;
  private hudBar: HTMLElement;
  private buttonsBar: HTMLElement;
  private tilesEl: HTMLElement;
  private levelEl: HTMLElement;
  private scoreEl: HTMLElement;
  private timeEl: HTMLElement;
  private hintBtn: HTMLButtonElement | null = null;
  private shuffleBtn: HTMLButtonElement | null = null;
  private undoBtn: HTMLButtonElement | null = null;
  private toastEl: HTMLElement;
  private toastTimeout: number | null = null;

  private xrayBtn: HTMLButtonElement | null = null;

  onHint: (() => void) | null = null;
  onShuffle: (() => void) | null = null;
  onUndo: (() => void) | null = null;
  onXray: (() => void) | null = null;
  onPause: (() => void) | null = null;
  onMenu: (() => void) | null = null;

  constructor(overlay: HTMLElement) {
    this.container = overlay;

    this.hudBar = document.createElement('div');
    this.hudBar.className = 'hud';

    const center = document.createElement('div');
    center.className = 'hud-center';
    center.innerHTML = `
      <div class="hud-stat-group challenge-only">
        <div class="hud-stat" id="hud-level">1</div>
        <div class="hud-stat-label">Level</div>
      </div>
      <div class="hud-stat-group challenge-only">
        <div class="hud-stat" id="hud-score">0</div>
        <div class="hud-stat-label">Score</div>
      </div>
      <div class="hud-stat-group challenge-only">
        <div class="hud-stat" id="hud-time">0:00</div>
        <div class="hud-stat-label">Time</div>
      </div>
      <div class="hud-stat-group">
        <div class="hud-stat" id="hud-tiles">144</div>
        <div class="hud-stat-label">Tiles</div>
      </div>
    `;
    this.levelEl = center.querySelector('#hud-level')!;
    this.scoreEl = center.querySelector('#hud-score')!;
    this.timeEl = center.querySelector('#hud-time')!;
    this.tilesEl = center.querySelector('#hud-tiles')!;

    this.hudBar.append(center);

    this.buttonsBar = document.createElement('div');
    this.buttonsBar.className = 'hud-buttons';

    const btnData = [
      { label: 'Hint', action: () => this.onHint?.() },
      { label: 'X-Ray', action: () => this.onXray?.() },
      { label: 'Shuffle', action: () => this.onShuffle?.() },
      { label: 'Undo', action: () => this.onUndo?.() },
      { label: 'Menu', action: () => this.onMenu?.() },
    ];

    for (const { label, action } of btnData) {
      const btn = document.createElement('button');
      btn.className = 'hud-btn';
      btn.textContent = label;
      btn.addEventListener('click', action);
      if (label === 'Hint') this.hintBtn = btn;
      if (label === 'Shuffle') this.shuffleBtn = btn;
      if (label === 'Undo') this.undoBtn = btn;
      if (label === 'X-Ray') this.xrayBtn = btn;
      this.buttonsBar.appendChild(btn);
    }

    this.toastEl = document.createElement('div');
    this.toastEl.className = 'toast';

    this.container.append(this.hudBar, this.buttonsBar, this.toastEl);
  }

  updateTilesRemaining(count: number): void {
    this.tilesEl.textContent = String(count);
  }

  setChallengeMode(on: boolean): void {
    this.hudBar.classList.toggle('challenge-hud', on);
    if (this.xrayBtn) {
      this.xrayBtn.style.display = on ? 'none' : '';
    }
  }

  updateChallengeStats(level: number, score: number, elapsedSeconds: number): void {
    this.levelEl.textContent = String(level);
    this.scoreEl.textContent = String(score);
    this.timeEl.textContent = this.formatTime(elapsedSeconds);
  }

  updateAssistLimits(hints: number | null, shuffles: number | null, undos: number | null): void {
    if (this.hintBtn) {
      this.hintBtn.textContent = hints === null ? 'Hint' : `Hint (${hints})`;
      this.hintBtn.classList.toggle('disabled', hints === 0);
    }
    if (this.shuffleBtn) {
      this.shuffleBtn.textContent = shuffles === null ? 'Shuffle' : `Shuffle (${shuffles})`;
      this.shuffleBtn.classList.toggle('disabled', shuffles === 0);
    }
    if (this.undoBtn) {
      this.undoBtn.textContent = undos === null ? 'Undo' : `Undo (${undos})`;
      this.undoBtn.classList.toggle('disabled', undos === 0);
    }
  }

  showToast(message: string, durationMs = 2000): void {
    this.toastEl.textContent = message;
    this.toastEl.classList.add('visible');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      this.toastEl.classList.remove('visible');
    }, durationMs);
  }

  setXrayActive(active: boolean): void {
    if (this.xrayBtn) {
      this.xrayBtn.classList.toggle('active', active);
    }
  }

  show(): void {
    this.hudBar.style.display = '';
    this.buttonsBar.style.display = '';
    this.toastEl.style.display = '';
  }

  hide(): void {
    this.hudBar.style.display = 'none';
    this.buttonsBar.style.display = 'none';
    this.toastEl.style.display = 'none';
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }
}
