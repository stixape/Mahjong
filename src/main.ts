import './style.css';
import { Application } from 'pixi.js';
import { Game } from './game/game';
import { initPWA } from './pwa';

async function init() {
  const app = new Application();
  const container = document.getElementById('game-container')!;

  await app.init({
    resizeTo: container,
    background: 0x1a472a,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  container.appendChild(app.canvas);

  const game = new Game(app);
  game.start();

  // Request fullscreen on first user interaction
  function requestFullscreen() {
    if (document.fullscreenElement) return;
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // Webkit fallback
        el.webkitRequestFullscreen?.();
      });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }
  // Always listen — harmless on desktop, needed on mobile
  document.addEventListener('click', requestFullscreen, { once: true });
  document.addEventListener('touchstart', requestFullscreen, { once: true });

  initPWA();
}

init().catch(console.error);
