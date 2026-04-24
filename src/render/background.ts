import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { assetUrl } from '../app-base';

export interface BackgroundThemeDef {
  name: string;
  swatch: string;
  url: string;
}

export const BACKGROUND_THEMES: Record<string, BackgroundThemeDef> = {
  'cherry-blossom': {
    name: 'Cherry Blossom',
    swatch: 'linear-gradient(135deg, #FFB7C5, #FF69B4)',
    url: assetUrl('backgrounds/bg-px-an7aztspfse-unsplash.webp'),
  },
  'green-leaves': {
    name: 'Green Leaves',
    swatch: 'linear-gradient(135deg, #4A6741, #2C5E28)',
    url: assetUrl('backgrounds/bg-alexander-ramsey-lre0o-e8-do-u.webp'),
  },
  'red-lanterns': {
    name: 'Red Lanterns',
    swatch: 'linear-gradient(135deg, #B22222, #FF4500)',
    url: assetUrl('backgrounds/bg-brice-cooper-hfyaizvnhwi-unspl.webp'),
  },
  'temple-gate': {
    name: 'Temple Gate',
    swatch: 'linear-gradient(135deg, #8B4513, #D2691E)',
    url: assetUrl('backgrounds/bg-christian-joudrey-9bdt03k4ujw-.webp'),
  },
  'golden-dragon': {
    name: 'Golden Dragon',
    swatch: 'linear-gradient(135deg, #C41E3A, #FFD700)',
    url: assetUrl('backgrounds/bg-d5-render-hjxvhlluquk-unsplash.webp'),
  },
  'paper-fans': {
    name: 'Paper Fans',
    swatch: 'linear-gradient(135deg, #E8D4A0, #C4AA6A)',
    url: assetUrl('backgrounds/bg-mubaris-nendukanni-sw-lxyzxbbm.webp'),
  },
  'silk-lanterns': {
    name: 'Silk Lanterns',
    swatch: 'linear-gradient(135deg, #FF6347, #FFD700)',
    url: assetUrl('backgrounds/bg-mubaris-nendukanni-wfgafd1eay4.webp'),
  },
  'zen-stones': {
    name: 'Zen Stones',
    swatch: 'linear-gradient(135deg, #6B6B6B, #A0A0A0)',
    url: assetUrl('backgrounds/bg-oriento-tju1gxqly4o-unsplash.webp'),
  },
  incense: {
    name: 'Incense',
    swatch: 'linear-gradient(135deg, #2F2F2F, #5A4A3A)',
    url: assetUrl('backgrounds/bg-seelean-qh5pwqfe-kg-unsplash.webp'),
  },
  'red-arch': {
    name: 'Red Arch',
    swatch: 'linear-gradient(135deg, #CC3333, #882222)',
    url: assetUrl('backgrounds/bg-tianshu-liu-sbk40fdkbag-unspla.webp'),
  },
};

export interface ThemedBackground extends Container {
  setTheme(theme: string): void;
  setPerformanceMode(on: boolean): void;
}

const firstKey = Object.keys(BACKGROUND_THEMES)[0];

export function createBackground(app: Application, theme?: string): ThemedBackground {
  const container = new Container() as ThemedBackground;
  const fallbackBg = new Graphics();
  let imageSprite: Sprite | null = null;
  let currentTheme = theme ?? firstKey;
  let performanceMode = false;

  container.addChild(fallbackBg);

  function fitImageToScreen(sprite: Sprite) {
    const w = app.screen.width;
    const h = app.screen.height;
    const tex = sprite.texture;
    const scaleX = w / tex.width;
    const scaleY = h / tex.height;
    const scale = Math.max(scaleX, scaleY);
    sprite.scale.set(scale);
    sprite.x = (w - tex.width * scale) / 2;
    sprite.y = (h - tex.height * scale) / 2;
  }

  function drawFallback() {
    fallbackBg.clear();
    fallbackBg.rect(0, 0, app.screen.width, app.screen.height);
    fallbackBg.fill(0x1a472a);
    fallbackBg.visible = true;
    if (imageSprite) imageSprite.visible = false;
  }

  async function showImage(url: string) {
    if (performanceMode) {
      drawFallback();
      return;
    }

    fallbackBg.visible = false;
    try {
      const texture: Texture = await Assets.load(url);
      if (!imageSprite) {
        imageSprite = new Sprite(texture);
        container.addChildAt(imageSprite, 0);
      } else {
        imageSprite.texture = texture;
        imageSprite.visible = true;
      }
      fitImageToScreen(imageSprite);
    } catch (e) {
      console.warn('Failed to load background image:', url, e);
      drawFallback();
    }
  }

  function draw() {
    const def = BACKGROUND_THEMES[currentTheme] || BACKGROUND_THEMES[firstKey];
    showImage(def.url);
  }

  function onResize() {
    if (!performanceMode && imageSprite && imageSprite.visible) {
      fitImageToScreen(imageSprite);
    } else {
      drawFallback();
    }
  }

  draw();
  app.renderer.on('resize', onResize);

  container.setTheme = (newTheme: string) => {
    currentTheme = newTheme;
    draw();
  };

  container.setPerformanceMode = (on: boolean) => {
    performanceMode = on;
    draw();
  };

  return container;
}
