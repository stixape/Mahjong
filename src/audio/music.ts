import { assetUrl } from '../app-base';

const TRACKS = [
  assetUrl('music/water-lillies.mp3'),
  assetUrl('music/year-of-the-dragon.mp3'),
  assetUrl('music/yellow-river-dance.mp3'),
  assetUrl('music/beauty-of-china.mp3'),
  assetUrl('music/mountain-legend.mp3'),
  assetUrl('music/sakura-sunrise.mp3'),
  assetUrl('music/jade-river-journey.mp3'),
  assetUrl('music/jade-temple-garden.mp3'),
  assetUrl('music/jade-empire.mp3'),
  assetUrl('music/folk-chinese.mp3'),
];

export class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private enabled = true;
  private playing = false;
  private shuffledOrder: number[] = [];
  private orderIndex = 0;
  private volume = 0.15;

  constructor() {
    this.reshuffleOrder();
  }

  private reshuffleOrder(): void {
    const lastPlayed = this.shuffledOrder.length > 0
      ? this.shuffledOrder[this.shuffledOrder.length - 1]
      : -1;

    this.shuffledOrder = TRACKS.map((_, i) => i);
    for (let i = this.shuffledOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledOrder[i], this.shuffledOrder[j]] =
        [this.shuffledOrder[j], this.shuffledOrder[i]];
    }

    if (lastPlayed >= 0 && this.shuffledOrder[0] === lastPlayed && this.shuffledOrder.length > 1) {
      const swapIdx = 1 + Math.floor(Math.random() * (this.shuffledOrder.length - 1));
      [this.shuffledOrder[0], this.shuffledOrder[swapIdx]] =
        [this.shuffledOrder[swapIdx], this.shuffledOrder[0]];
    }

    this.orderIndex = 0;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) {
      this.pause();
    } else if (this.playing) {
      this.resumePlayback();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  start(): void {
    this.playing = true;
    if (!this.enabled) return;
    if (this.audio && !this.audio.paused) return;
    this.playNext();
  }

  stop(): void {
    this.playing = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resumePlayback(): void {
    if (!this.enabled || !this.playing) return;
    if (this.audio && this.audio.src) {
      this.audio.play().catch(() => {});
    } else {
      this.playNext();
    }
  }

  private playNext(): void {
    if (!this.enabled || !this.playing) return;

    if (this.orderIndex >= this.shuffledOrder.length) {
      this.reshuffleOrder();
    }

    const trackIndex = this.shuffledOrder[this.orderIndex++];
    const url = TRACKS[trackIndex];

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.volume = this.volume;
      this.audio.addEventListener('ended', () => this.playNext());
    }

    this.audio.src = url;
    this.audio.play().catch(() => {});
  }
}
