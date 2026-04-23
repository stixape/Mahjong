import { Ticker } from 'pixi.js';
import { TileSprite } from './tile-sprite';

function animate(
  ticker: Ticker,
  durationMs: number,
  onUpdate: (progress: number) => void,
): Promise<void> {
  return new Promise(resolve => {
    let elapsed = 0;
    const update = (dt: Ticker) => {
      elapsed += dt.deltaTime / 60 * 1000;
      const progress = Math.min(elapsed / durationMs, 1);
      onUpdate(progress);
      if (progress >= 1) {
        ticker.remove(update);
        resolve();
      }
    };
    ticker.add(update);
  });
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

export async function animateTileSelect(sprite: TileSprite, ticker: Ticker): Promise<void> {
  const baseScale = sprite.scale.x;
  await animate(ticker, 150, (p) => {
    const bump = p < 0.5
      ? 0.06 * (p * 2)
      : 0.06 * (1 - (p - 0.5) * 2);
    sprite.scale.set(baseScale * (1 + bump));
  });
  sprite.scale.set(baseScale);
}

export async function animateTileMatch(
  sprite1: TileSprite,
  sprite2: TileSprite,
  ticker: Ticker,
): Promise<void> {
  const baseScale1 = sprite1.scale.x;
  const baseScale2 = sprite2.scale.x;
  await animate(ticker, 350, (p) => {
    const ease = easeInCubic(p);
    const scaleFactor = 1 + 0.2 * (1 - ease);
    const alpha = 1 - ease;
    sprite1.scale.set(baseScale1 * scaleFactor);
    sprite2.scale.set(baseScale2 * scaleFactor);
    sprite1.alpha = alpha;
    sprite2.alpha = alpha;
  });
}

export async function animateInvalidSelection(sprite: TileSprite, ticker: Ticker): Promise<void> {
  const startX = sprite.x;
  await animate(ticker, 200, (p) => {
    const shake = Math.sin(p * Math.PI * 4) * 4 * (1 - p);
    sprite.x = startX + shake;
  });
  sprite.x = startX;
}
