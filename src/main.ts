import './style.css';
import { Application } from 'pixi.js';
import { Game } from './game/game';
import { loadSettings } from './game/storage';
import { initPWA } from './pwa';

async function init() {
  const app = new Application();
  const container = document.getElementById('game-container')!;
  const settings = loadSettings();

  document.body.classList.toggle('low-performance', settings.performanceMode);

  await app.init({
    resizeTo: container,
    background: 0x1a472a,
    antialias: !settings.performanceMode,
    resolution: settings.performanceMode ? 1 : (window.devicePixelRatio || 1),
    autoDensity: true,
  });

  container.appendChild(app.canvas);

  const game = new Game(app);
  game.start();

  function requestFullscreen() {
    if (document.fullscreenElement) return;
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        el.webkitRequestFullscreen?.();
      });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }

  document.addEventListener('click', requestFullscreen, { once: true });
  document.addEventListener('touchstart', requestFullscreen, { once: true });

  initPWA();
}

init().catch(console.error);
