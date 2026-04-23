export class MenuOverlay {
  private overlay: HTMLElement;
  private card: HTMLElement;

  onChallenge: (() => void) | null = null;
  onFreePlay: (() => void) | null = null;
  onContinueChallenge: (() => void) | null = null;
  onContinueFreePlay: (() => void) | null = null;
  onResume: (() => void) | null = null;
  onShuffleContinue: (() => void) | null = null;
  onSettings: (() => void) | null = null;
  onNextLevel: (() => void) | null = null;
  onReplay: (() => void) | null = null;
  onMainMenu: (() => void) | null = null;

  constructor(parent: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';

    this.card = document.createElement('div');
    this.card.className = 'menu-card';

    this.overlay.appendChild(this.card);
    parent.appendChild(this.overlay);
  }

  showMainMenu(hasChallengeSave: boolean, hasFreePlaySave: boolean): void {
    this.card.innerHTML = `
      <div class="menu-title">Mahjong</div>
      <div class="menu-subtitle">Classic tile-matching game</div>
      <button class="menu-btn primary" id="menu-challenge">Challenge</button>
      <button class="menu-btn" id="menu-free-play">Free Play</button>
      ${hasChallengeSave ? '<button class="menu-btn" id="menu-continue-challenge">Continue Challenge</button>' : ''}
      ${hasFreePlaySave ? '<button class="menu-btn" id="menu-continue-free-play">Continue Free Play</button>' : ''}
      <button class="menu-btn" id="menu-settings">Settings</button>
    `;

    this.card.querySelector('#menu-challenge')?.addEventListener('click', () => this.onChallenge?.());
    this.card.querySelector('#menu-free-play')?.addEventListener('click', () => this.onFreePlay?.());
    this.card.querySelector('#menu-continue-challenge')?.addEventListener('click', () => this.onContinueChallenge?.());
    this.card.querySelector('#menu-continue-free-play')?.addEventListener('click', () => this.onContinueFreePlay?.());
    this.card.querySelector('#menu-settings')?.addEventListener('click', () => this.onSettings?.());

    this.show();
  }

  showWin(): void {
    this.card.innerHTML = `
      <div class="menu-title">You Win!</div>
      <div class="menu-subtitle">All tiles cleared!</div>
      <button class="menu-btn primary" id="menu-free-play">Play Again</button>
      <button class="menu-btn" id="menu-main">Main Menu</button>
    `;

    this.card.querySelector('#menu-free-play')?.addEventListener('click', () => this.onFreePlay?.());
    this.card.querySelector('#menu-main')?.addEventListener('click', () => this.onMainMenu?.());

    this.show();
  }

  showChallengeWin(starsEarned: number, maxStars: number, canReplay: boolean, hasNextLevel: boolean, completionMessage?: string): void {
    const stars = Array.from({ length: maxStars }, (_, index) => index < starsEarned ? '?' : '?').join(' ');
    this.card.innerHTML = `
      <div class="menu-title">Level Complete</div>
      <div class="menu-subtitle">${completionMessage ?? 'Challenge cleared!'}</div>
      <div class="menu-title" style="font-size:24px; margin-bottom:16px">${stars}</div>
      ${hasNextLevel ? '<button class="menu-btn primary" id="menu-next">Next Level</button>' : ''}
      ${canReplay ? '<button class="menu-btn" id="menu-replay">Replay</button>' : ''}
      <button class="menu-btn" id="menu-main">Main Menu</button>
    `;

    this.card.querySelector('#menu-next')?.addEventListener('click', () => this.onNextLevel?.());
    this.card.querySelector('#menu-replay')?.addEventListener('click', () => this.onReplay?.());
    this.card.querySelector('#menu-main')?.addEventListener('click', () => this.onMainMenu?.());

    this.show();
  }

  showLose(tilesRemaining: number, canShuffleContinue: boolean): void {
    this.card.innerHTML = `
      <div class="menu-title">No More Moves</div>
      <div class="menu-subtitle">${tilesRemaining} tiles remaining</div>
      ${canShuffleContinue ? '<button class="menu-btn" id="menu-shuffle">Shuffle & Continue</button>' : ''}
      <button class="menu-btn primary" id="menu-challenge">Challenge</button>
      <button class="menu-btn" id="menu-free-play">Free Play</button>
    `;

    this.card.querySelector('#menu-shuffle')?.addEventListener('click', () => {
      this.hide();
      this.onShuffleContinue?.();
    });
    this.card.querySelector('#menu-challenge')?.addEventListener('click', () => this.onChallenge?.());
    this.card.querySelector('#menu-free-play')?.addEventListener('click', () => this.onFreePlay?.());

    this.show();
  }

  showPause(): void {
    this.card.innerHTML = `
      <div class="menu-title">Paused</div>
      <button class="menu-btn primary" id="menu-resume">Resume</button>
      <button class="menu-btn" id="menu-challenge">Challenge</button>
      <button class="menu-btn" id="menu-free-play">Free Play</button>
      <button class="menu-btn" id="menu-settings">Settings</button>
    `;

    this.card.querySelector('#menu-resume')?.addEventListener('click', () => {
      this.hide();
      this.onResume?.();
    });
    this.card.querySelector('#menu-challenge')?.addEventListener('click', () => this.onChallenge?.());
    this.card.querySelector('#menu-free-play')?.addEventListener('click', () => this.onFreePlay?.());
    this.card.querySelector('#menu-settings')?.addEventListener('click', () => this.onSettings?.());

    this.show();
  }

  show(): void {
    this.overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
    });
  }

  hide(): void {
    this.overlay.classList.remove('visible');
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 300);
  }

  isVisible(): boolean {
    return this.overlay.style.display !== 'none';
  }
}
