import { Container, Graphics, Ticker } from 'pixi.js';

interface Particle {
  graphic: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function spawnMatchParticles(container: Container, x: number, y: number, ticker: Ticker): void {
  const particles: Particle[] = [];
  const colors = [0xFFD700, 0xFF6B35, 0xFF3366, 0x44AAFF, 0x66FF66];

  for (let i = 0; i < 16; i++) {
    const g = new Graphics();
    const size = 3 + Math.random() * 4;
    g.rect(-size / 2, -size / 2, size, size);
    g.fill(colors[Math.floor(Math.random() * colors.length)]);
    g.x = x;
    g.y = y;
    container.addChild(g);

    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    particles.push({
      graphic: g,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.4 + Math.random() * 0.3,
    });
  }

  const update = (dt: Ticker) => {
    const delta = dt.deltaTime / 60;
    let allDead = true;

    for (const p of particles) {
      p.life -= delta / p.maxLife;
      if (p.life <= 0) {
        p.graphic.visible = false;
        continue;
      }
      allDead = false;
      p.graphic.x += p.vx;
      p.graphic.y += p.vy;
      p.vy += 3 * delta; // gravity
      p.graphic.alpha = p.life;
      p.graphic.scale.set(p.life);
    }

    if (allDead) {
      ticker.remove(update);
      for (const p of particles) {
        container.removeChild(p.graphic);
        p.graphic.destroy();
      }
    }
  };

  ticker.add(update);
}

/** Sparkle burst across the screen for New Game */
export function spawnNewGameSparkles(container: Container, screenW: number, screenH: number, ticker: Ticker): void {
  const particles: Particle[] = [];
  const colors = [0xFFD700, 0xFFFFFF, 0xFF6B35, 0x44AAFF, 0xFF3366, 0x66FF66];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const g = new Graphics();
    const size = 2 + Math.random() * 5;
    // Draw a 4-pointed star shape
    g.moveTo(0, -size);
    g.lineTo(size * 0.3, -size * 0.3);
    g.lineTo(size, 0);
    g.lineTo(size * 0.3, size * 0.3);
    g.lineTo(0, size);
    g.lineTo(-size * 0.3, size * 0.3);
    g.lineTo(-size, 0);
    g.lineTo(-size * 0.3, -size * 0.3);
    g.closePath();
    g.fill(colors[Math.floor(Math.random() * colors.length)]);

    // Scatter across the screen with some clustering toward center
    g.x = screenW * 0.1 + Math.random() * screenW * 0.8;
    g.y = screenH * 0.1 + Math.random() * screenH * 0.8;
    g.alpha = 0;
    container.addChild(g);

    const delay = Math.random() * 0.3; // stagger start
    particles.push({
      graphic: g,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
      life: 1 + delay, // extra life for delay
      maxLife: 0.6 + Math.random() * 0.4,
    });
  }

  const update = (dt: Ticker) => {
    const delta = dt.deltaTime / 60;
    let allDead = true;

    for (const p of particles) {
      p.life -= delta / p.maxLife;
      if (p.life > 1) {
        // Still in delay phase
        allDead = false;
        continue;
      }
      if (p.life <= 0) {
        p.graphic.visible = false;
        continue;
      }
      allDead = false;
      p.graphic.x += p.vx;
      p.graphic.y += p.vy;
      // Fade in then out
      const t = 1 - p.life;
      p.graphic.alpha = t < 0.2 ? t / 0.2 : p.life;
      p.graphic.rotation += 0.05;
      p.graphic.scale.set(0.5 + p.life * 0.8);
    }

    if (allDead) {
      ticker.remove(update);
      for (const p of particles) {
        container.removeChild(p.graphic);
        p.graphic.destroy();
      }
    }
  };

  ticker.add(update);
}
