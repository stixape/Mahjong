import { GameSettings, loadSettings, saveSettings, PlayMode } from '../game/storage';
import { LAYOUTS } from '../game/layouts';
import { TILE_THEMES } from '../render/tile-themes';
import { BACKGROUND_THEMES } from '../render/background';

export class SettingsModal {
  private overlay: HTMLElement;
  private settings: GameSettings;
  private playMode: PlayMode = 'freePlay';
  private unlockedThemes = new Set<string>(['classic']);
  private unlockedBackgrounds = new Set<string>(['classic']);
  private unlockedLayouts = new Set<string>(['turtle']);
  onChange: ((settings: GameSettings) => void) | null = null;
  onClose: (() => void) | null = null;

  constructor(parent: HTMLElement) {
    this.settings = loadSettings();

    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';
    this.overlay.style.display = 'none';

    parent.appendChild(this.overlay);
    this.render();
  }

  setContext(playMode: PlayMode, unlockedThemes: string[], unlockedBackgrounds: string[], unlockedLayouts: string[]): void {
    this.playMode = playMode;
    this.unlockedThemes = new Set(unlockedThemes);
    this.unlockedBackgrounds = new Set(unlockedBackgrounds);
    this.unlockedLayouts = new Set(unlockedLayouts);
  }

  private render(): void {
    this.overlay.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.style.maxHeight = '80vh';
    card.style.overflowY = 'auto';

    const challengeMode = this.playMode === 'challenge';

    const bgButtons = Object.entries(BACKGROUND_THEMES)
      .filter(([key]) => !challengeMode && this.unlockedBackgrounds.has(key))
      .map(([key, bg]) =>
        `<button class="theme-option ${this.settings.theme === key ? 'active' : ''}" data-theme="${key}">
          <span class="theme-swatch" style="background: ${bg.swatch}"></span>
          <span class="theme-name">${bg.name}</span>
        </button>`
      ).join('');

    const layoutButtons = Object.entries(LAYOUTS)
      .filter(([key]) => !challengeMode && this.unlockedLayouts.has(key))
      .map(([key, layout]) =>
      `<button class="theme-option ${this.settings.layout === key ? 'active' : ''}" data-layout="${key}">
        <span class="theme-name">${layout.name}</span>
      </button>`
    ).join('');

    const tileThemeSwatches: Record<string, string> = {
      classic: 'linear-gradient(135deg, #FFF8E7, #E0D8C0)',
      jade: 'linear-gradient(135deg, #E8F5E9, #81C784)',
      ivory: 'linear-gradient(135deg, #FFFDE7, #D4C98E)',
      midnight: 'linear-gradient(135deg, #1A1A2E, #33335A)',
      coral: 'linear-gradient(135deg, #FFF3E0, #E6A67A)',
      ink: 'linear-gradient(135deg, #FAFAFA, #CCCCCC)',
    };

    const tileThemeButtons = Object.entries(TILE_THEMES)
      .filter(([key]) => !challengeMode && this.unlockedThemes.has(key))
      .map(([key, theme]) =>
        `<button class="theme-option ${this.settings.tileTheme === key ? 'active' : ''}" data-tiletheme="${key}">
          <span class="theme-swatch" style="background: ${tileThemeSwatches[key] || '#888'}"></span>
          <span class="theme-name">${theme.name}</span>
        </button>`
      ).join('');

    card.innerHTML = `
      <div class="menu-title" style="font-size:22px; margin-bottom:16px">Settings</div>
      <div class="settings-row">
        <span class="settings-label">Sound</span>
        <button class="settings-toggle ${this.settings.soundEnabled ? 'on' : ''}" id="setting-sound"></button>
      </div>
      <div class="settings-row">
        <span class="settings-label">Music</span>
        <button class="settings-toggle ${this.settings.musicEnabled ? 'on' : ''}" id="setting-music"></button>
      </div>
      <div class="settings-row">
        <span class="settings-label">Performance Mode <span style="font-size:11px; opacity:0.6">(restart for full effect)</span></span>
        <button class="settings-toggle ${this.settings.performanceMode ? 'on' : ''}" id="setting-performance"></button>
      </div>
      ${challengeMode ? '<div class="menu-subtitle" style="margin:16px 0 0">Challenge cosmetics unlock as you progress.</div>' : `
      <div class="settings-row" style="border-bottom: none; padding-bottom: 4px">
        <span class="settings-label">Background</span>
      </div>
      <div class="theme-picker" id="theme-picker" style="flex-wrap: wrap">
        ${bgButtons}
      </div>
      <div class="settings-row" style="border-bottom: none; padding-bottom: 4px">
        <span class="settings-label">Tile Style</span>
      </div>
      <div class="theme-picker" id="tiletheme-picker" style="flex-wrap: wrap">
        ${tileThemeButtons}
      </div>
      <div class="settings-row" style="border-bottom: none; padding-bottom: 4px">
        <span class="settings-label">Layout <span style="font-size:11px; opacity:0.6">(next game)</span></span>
      </div>
      <div class="theme-picker" id="layout-picker" style="flex-wrap: wrap">
        ${layoutButtons}
      </div>`}
      <div style="margin-top:20px">
        <button class="menu-btn primary" id="settings-close">Done</button>
      </div>
    `;

    this.overlay.appendChild(card);

    const soundBtn = card.querySelector('#setting-sound')!;
    soundBtn.addEventListener('click', () => {
      this.settings.soundEnabled = !this.settings.soundEnabled;
      soundBtn.classList.toggle('on', this.settings.soundEnabled);
      saveSettings(this.settings);
      this.onChange?.(this.settings);
    });

    const musicBtn = card.querySelector('#setting-music')!;
    musicBtn.addEventListener('click', () => {
      this.settings.musicEnabled = !this.settings.musicEnabled;
      musicBtn.classList.toggle('on', this.settings.musicEnabled);
      saveSettings(this.settings);
      this.onChange?.(this.settings);
    });

    const performanceBtn = card.querySelector('#setting-performance')!;
    performanceBtn.addEventListener('click', () => {
      this.settings.performanceMode = !this.settings.performanceMode;
      performanceBtn.classList.toggle('on', this.settings.performanceMode);
      saveSettings(this.settings);
      this.onChange?.(this.settings);
    });

    if (!challengeMode) {
      const bgPicker = card.querySelector('#theme-picker');
      bgPicker?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.theme-option') as HTMLElement | null;
        if (!btn) return;
        const theme = btn.dataset.theme;
        if (!theme) return;
        this.settings.theme = theme;
        bgPicker.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        saveSettings(this.settings);
        this.onChange?.(this.settings);
      });

      const tileThemePicker = card.querySelector('#tiletheme-picker');
      tileThemePicker?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.theme-option') as HTMLElement | null;
        if (!btn) return;
        const tileTheme = btn.dataset.tiletheme;
        if (!tileTheme) return;
        this.settings.tileTheme = tileTheme;
        tileThemePicker.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        saveSettings(this.settings);
        this.onChange?.(this.settings);
      });

      const layoutPicker = card.querySelector('#layout-picker');
      layoutPicker?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.theme-option') as HTMLElement | null;
        if (!btn) return;
        const layout = btn.dataset.layout;
        if (!layout) return;
        this.settings.layout = layout;
        layoutPicker.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        saveSettings(this.settings);
        this.onChange?.(this.settings);
      });
    }

    card.querySelector('#settings-close')!.addEventListener('click', () => {
      this.hide();
      this.onClose?.();
    });
  }

  show(): void {
    this.settings = loadSettings();
    this.render();
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
}
