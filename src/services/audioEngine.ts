// BUGOUT: THE LAST PROTOCOL - Procedural Web Audio Engine
// Generates ambient drones and rich tactical sci-fi sound effects directly in browser

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientNoiseSource: AudioNode | null = null;
  private currentAmbient: string | null = null;

  public masterVolume: number = 0.8;
  public sfxVolume: number = 0.85;
  public musicVolume: number = 0.55;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();

      this.updateVolumes();

      this.sfxGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes() {
    if (!this.masterGain || !this.sfxGain || !this.ambientGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const effectiveMaster = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.gain.setValueAtTime(effectiveMaster, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    this.ambientGain.gain.setValueAtTime(this.musicVolume, now);
  }

  public setVolumes(master: number, sfx: number, music: number, muted: boolean) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.isMuted = muted;
    this.updateVolumes();
  }

  // --- AMBIENT SOUND GENERATOR ---
  public playAmbient(type: 'lab' | 'cryo' | 'server' | 'mirror' | 'core' | 'comms' | 'signal' | 'array' | 'vault' | 'gallery' | 'loop' | 'menu') {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;
    if (this.currentAmbient === type) return;

    this.stopAmbient();
    this.currentAmbient = type;

    const now = this.ctx.currentTime;

    if (type === 'menu') {
      // Atmospheric mystery drone (C2 + G2 + modulated bandpass)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65.41, now); // C2
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(98.0, now); // G2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientOscs.push(osc1, osc2);
    } else if (type === 'lab') {
      // Sterile 60Hz hum + gentle ventilation hiss
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.ambientOscs.push(osc);
    } else if (type === 'cryo') {
      // Cold resonant high pitch + low rumble
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440 * 1.5, now); // high eerie whistle

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 1.5);

      osc1.connect(gain);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientOscs.push(osc1, osc2);
    } else if (type === 'server') {
      // Fan whine + harmonic high-frequency data purr
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(120, now);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(240, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 1);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientOscs.push(osc1, osc2);
    } else if (type === 'mirror') {
      // Eerie shimmering dissonant chord
      const freqs = [110, 164.81, 233.08]; // Dissonant triad
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 2);
      gain.connect(this.ambientGain);

      freqs.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start();
        this.ambientOscs.push(osc);
      });
    } else if (type === 'core') {
      // Massive sub-bass reactor thrum
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.5, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(30, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientOscs.push(lfo);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.ambientOscs.push(osc);
    } else if (type === 'comms') {
      // Dead radio static + low carrier hum (Ghost Signal - Dark Relay)
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, now);
      noiseFilter.Q.setValueAtTime(0.6, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.012, now);

      const hum = this.ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.setValueAtTime(52, now);
      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.14, now);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);
      hum.connect(humGain);
      humGain.connect(this.ambientGain);

      noise.start();
      hum.start();
      this.ambientNoiseSource = noise;
      this.ambientOscs.push(hum);
    } else if (type === 'signal') {
      // Warbling scanner tone + distant beacon pings (Listening Post)
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.4, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(90, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      this.ambientOscs.push(lfo);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 2);

      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
      this.ambientOscs.push(osc);
    } else if (type === 'array') {
      // Open-air wind sweep + electric crackle bed (Antenna Array)
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      noise.start();
      this.ambientNoiseSource = noise;

      const shimmer = this.ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(1244.51, now);
      const shimmerGain = this.ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.015, now);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.ambientGain);
      shimmer.start();
      this.ambientOscs.push(shimmer);
    } else if (type === 'vault') {
      // Deep archive sub-pulse (Echoes - Recall Vault)
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(38, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 2.5);
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.25, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, now);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      this.ambientOscs.push(lfo);
      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
      this.ambientOscs.push(osc);
    } else if (type === 'gallery') {
      // Detuned ghostly choir of slow sines (Paradox Gallery)
      const freqs = [196, 246.94, 293.66, 392];
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 3);
      gain.connect(this.ambientGain);
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f + (i % 2 === 0 ? 0.7 : -0.7), now); // slow detune beat
        osc.connect(gain);
        osc.start();
        this.ambientOscs.push(osc);
      });
    } else if (type === 'loop') {
      // Heartbeat pulse + mirrored echo tone (Loop Terminus)
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(72, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 2);
      const pulse = this.ctx.createOscillator();
      pulse.type = 'sine';
      pulse.frequency.setValueAtTime(1.1, now);
      const pulseGain = this.ctx.createGain();
      pulseGain.gain.setValueAtTime(0.15, now);
      pulse.connect(pulseGain);
      pulseGain.connect(gain.gain);
      pulse.start();
      this.ambientOscs.push(pulse);
      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
      this.ambientOscs.push(osc);
    }
  }

  public stopAmbient() {
    this.ambientOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.ambientOscs = [];
    if (this.ambientNoiseSource) {
      try {
        this.ambientNoiseSource.disconnect();
      } catch (e) {}
      this.ambientNoiseSource = null;
    }
    this.currentAmbient = null;
  }

  // --- TACTILE PROCEDURAL SOUND EFFECTS ---
  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playKeypad(digit: string | number) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Dual-tone synthesizer for realistic tactile keypad
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const d = typeof digit === 'number' ? digit : parseInt(digit.toString().charCodeAt(0).toString(), 10) % 9;
    const rowFreqs = [697, 770, 852, 941];
    const colFreqs = [1209, 1336, 1477];

    const f1 = rowFreqs[d % rowFreqs.length] || 770;
    const f2 = colFreqs[d % colFreqs.length] || 1209;

    osc1.frequency.setValueAtTime(f1, now);
    osc2.frequency.setValueAtTime(f2, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  }

  public playSuccess() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      const startTime = now + idx * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  public playError() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSwitch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playValve() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Metal squeak + hiss
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playPneumaticDoor() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Heavy mechanical clunk
    const clunk = this.ctx.createOscillator();
    const clunkGain = this.ctx.createGain();
    clunk.type = 'triangle';
    clunk.frequency.setValueAtTime(80, now);
    clunk.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    clunkGain.gain.setValueAtTime(0.4, now);
    clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    clunk.connect(clunkGain);
    clunkGain.connect(this.sfxGain);
    clunk.start(now);
    clunk.stop(now + 0.4);

    // 2. High pressure air hiss
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.8);
    filter.Q.setValueAtTime(3, now);

    const hissGain = this.ctx.createGain();
    hissGain.gain.setValueAtTime(0.01, now + 0.1);
    hissGain.gain.linearRampToValueAtTime(0.25, now + 0.25);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    noise.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(this.sfxGain);

    noise.start(now + 0.1);
  }

  public playEvidencePickup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Futuristic chime
    const notes = [880, 1174.66, 1760]; // A5, D6, A6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playWardenVoice() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // AI synth blip transmission
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.setValueAtTime(540, now + 0.04);
    osc.frequency.setValueAtTime(290, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playAlarm() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.3);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playPowerRestore() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.8);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.95);
  }

  /* ---------- GHOST SIGNAL / ECHOES SFX ---------- */

  public playTone(freq: number, duration: number = 0.18, type: OscillatorType = 'sine') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.setValueAtTime(0.22, now + Math.max(0.05, duration - 0.04));
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playStatic(duration: number = 0.25) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(0.5, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playTuningSweep(fromFreq: number, toFreq: number, duration: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fromFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, toFreq), now + duration);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  public playAchievement() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  }
}

export const audioEngine = new AudioEngine();
