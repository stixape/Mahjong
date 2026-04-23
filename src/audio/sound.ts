export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }

  playSelect(): void {
    this.playTone(600, 0.08, 'sine', 0.1);
  }

  playMatch(): void {
    this.playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.12), 80);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.12), 160);
  }

  playInvalid(): void {
    this.playTone(200, 0.15, 'square', 0.06);
  }

  playWin(): void {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.1), i * 120);
    });
  }

  playNewGame(): void {
    // Bright ascending chime: C-E-G-C (major chord arpeggio)
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.1), i * 100);
    });
    // Add a gentle shimmer on top
    setTimeout(() => this.playTone(1319, 0.4, 'sine', 0.06), 350);
    setTimeout(() => this.playTone(1568, 0.3, 'sine', 0.04), 450);
  }

  playShuffle(): void {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(300 + Math.random() * 200, 0.05, 'triangle', 0.05), i * 40);
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
