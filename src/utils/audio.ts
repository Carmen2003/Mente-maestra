// Synthesized Web Audio API sound effects & gentle futuristic ambient soundtrack

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private musicEnabled = false;
  private sfxEnabled = true;
  private musicInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.28;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public isMusicOn(): boolean {
    return this.musicEnabled;
  }

  public isSfxOn(): boolean {
    return this.sfxEnabled;
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  public toggleMusic(): boolean {
    if (this.musicEnabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicEnabled;
  }

  public startMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    if (this.musicInterval !== null) return;

    this.musicEnabled = true;
    // Calm futuristic pentatonic progression (A minor / D minor / Fmaj7 / E7sus4)
    const chords = [
      [220.0, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 392.0],
      [174.61, 220.0, 261.63, 349.23],
      [164.81, 220.0, 246.94, 329.63],
    ];

    const playPadChord = () => {
      if (!this.ctx || !this.masterGain || !this.musicEnabled) return;
      const now = this.ctx.currentTime;
      const chord = chords[this.stepIndex % chords.length];
      this.stepIndex += 1;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, now);
      filter.connect(this.masterGain);

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(now);
        osc.stop(now + 3.7);
      });
    };

    playPadChord();
    this.musicInterval = window.setInterval(playPadChord, 3500);
  }

  public stopMusic(): void {
    this.musicEnabled = false;
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    endFreq?: number
  ): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playSelect(): void {
    this.playTone(540, 0.07, 'sine', 0.09);
  }

  public playCorrect(): void {
    this.playTone(523.25, 0.14, 'triangle', 0.16, 0);
    this.playTone(659.25, 0.16, 'triangle', 0.16, 0.08);
    this.playTone(783.99, 0.26, 'sine', 0.18, 0.16);
  }

  public playWrong(): void {
    this.playTone(230, 0.18, 'sawtooth', 0.11, 0, 165);
    this.playTone(170, 0.25, 'triangle', 0.12, 0.12, 120);
  }

  public playWildcard(): void {
    this.playTone(440, 0.12, 'sine', 0.13, 0, 880);
    this.playTone(660, 0.18, 'triangle', 0.13, 0.07, 1120);
  }

  public playTick(): void {
    this.playTone(880, 0.04, 'sine', 0.06);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.28, 'triangle', 0.16, idx * 0.1);
    });
  }

  public playDefeat(): void {
    this.playTone(329.63, 0.22, 'triangle', 0.14, 0);
    this.playTone(293.66, 0.22, 'triangle', 0.14, 0.16);
    this.playTone(246.94, 0.38, 'sine', 0.15, 0.32);
  }
}

export const gameAudio = new GameAudioEngine();
