/**
 * Web Audio API Cinematic Drone and Soundtrack Synthesizer
 * Generates an atmospheric analog warm pad + sub drone for preview & video export
 */
export class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private userAudioElement: HTMLAudioElement | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public startAtmosphere() {
    if (this.isPlaying) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopAtmosphere();

    // Drone chords (Minor 9th / Cinematic ambient space)
    // Frequencies: C2 (65.41), G2 (98.00), D3 (146.83), Eb3 (155.56), Bb3 (233.08)
    const baseFreqs = [65.41, 98.0, 146.83, 155.56, 233.08];

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const oscGain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : i % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for lush chorus
      osc.detune.setValueAtTime((i - 2) * 6, this.ctx.currentTime);

      // Warm low-pass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + i * 150, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Individual gain
      const gainVal = i === 0 ? 0.35 : 0.12;
      oscGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 2.0);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start();
      this.oscillators.push(osc);
    });

    this.isPlaying = true;
  }

  public stopAtmosphere() {
    if (this.oscillators.length > 0) {
      this.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_) {}
      });
      this.oscillators = [];
    }
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped * 0.3, this.ctx.currentTime, 0.1);
    }
  }

  public getAudioDestinationStream(): MediaStreamAudioDestinationNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(dest);
    return dest;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public destroy() {
    this.stopAtmosphere();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const globalAudio = new CinematicAudioEngine();
