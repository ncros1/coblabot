/**
 * High-Fidelity Acoustic Web Audio API Engine for Catalan Cobla Instruments
 * Faithfully reproduces the authentic timbres of Cobla instruments:
 * - Flabiol: High wooden fipple flute with authentic breath chiff, bird-trill overtones, and wood resonance.
 * - Tamborí: Snappy wooden hoop strike + authentic membrane pitch drop + snare wire rattle (cordó de budell).
 * - Tenora: Iconic double-reed nasal spectrum with metal bell amplification (1150Hz and 2300Hz formants) and warm expressive vibrato.
 * - Tible: High piercing oboe-like double reed (xeremia) with sharp articulation and bright 1900Hz resonance.
 * - Trompeta de pistons: Brassy fanfare with dynamic filter opening.
 * - Trombó de pistons: Deep, round brass foundation.
 * - Fiscorn: Warm, velvety conical-bore tenor brass (the "tenora of the back row").
 * - Contrabaix: Authentic gut string (corda de budell) pizzicato with hollow wooden soundbox resonance.
 */

class CoblaAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { stop: () => void }[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public stopAll() {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeNodes = [];
  }

  // Create custom harmonic periodic wave for double reeds and brass
  private createWave(ctx: AudioContext, realCoeffs: number[], imagCoeffs?: number[]): PeriodicWave {
    const real = new Float32Array(realCoeffs);
    const imag = imagCoeffs ? new Float32Array(imagCoeffs) : new Float32Array(realCoeffs.length);
    return ctx.createPeriodicWave(real, imag);
  }

  // --- 1. TAMBORÍ (Authentic snare drum of the cobla) ---
  public playTamboriHit(time?: number, velocity = 0.85) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // 1. Membrane body (tight skin with pitch drop: 165Hz -> 85Hz)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(165, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    oscGain.gain.setValueAtTime(velocity * 0.9, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    // 2. Wooden rim click / baqueta attack transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(480, t);
    click.frequency.exponentialRampToValueAtTime(120, t + 0.02);
    clickGain.gain.setValueAtTime(velocity * 0.7, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    // 3. Snare rattle (cordó de budell / snare buzz)
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2400, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.45, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    // Connect
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
    click.start(t);
    click.stop(t + 0.03);
    noise.start(t);
    noise.stop(t + 0.09);
  }

  // --- 2. FLABIOL (High wooden fipple flute with breath chiff) ---
  public playFlabiolNote(freq = 880, duration = 0.35, time?: number, velocity = 0.6) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // Harmonic wave of traditional fipple pipe (mostly fundamental, strong 2nd harmonic, soft 3rd)
    const wave = this.createWave(ctx, [0, 1.0, 0.45, 0.18, 0.08, 0.03]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    // Expressive subtle bird-like vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(6.8, t);
    lfoGain.gain.setValueAtTime(freq * 0.016, t);
    lfo.connect(osc.frequency);

    // Breath chiff (wind friction at embouchure)
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const chiff = ctx.createBufferSource();
    chiff.buffer = noiseBuffer;
    const chiffFilter = ctx.createBiquadFilter();
    chiffFilter.type = 'bandpass';
    chiffFilter.frequency.setValueAtTime(freq * 1.5, t);
    chiffFilter.Q.setValueAtTime(4, t);
    const chiffGain = ctx.createGain();
    chiffGain.gain.setValueAtTime(velocity * 0.25, t);
    chiffGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    chiff.connect(chiffFilter);
    chiffFilter.connect(chiffGain);
    chiffGain.connect(ctx.destination);

    // Main envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.35, t + 0.025);
    gain.gain.setValueAtTime(velocity * 0.32, t + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(t);
    osc.start(t);
    chiff.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
    chiff.stop(t + 0.05);
  }

  // --- 3. TIBLE (Piercing double-reed xeremia) ---
  public playTibleNote(freq = 587.33, duration = 0.45, time?: number, velocity = 0.65) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // Double reed harmonic series with prominent odd and even nasal peaks
    const wave = this.createWave(ctx, [0, 0.4, 0.9, 0.95, 0.75, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    // High reed formant peaking around 1950Hz
    const formant = ctx.createBiquadFilter();
    formant.type = 'peaking';
    formant.frequency.setValueAtTime(1950, t);
    formant.gain.setValueAtTime(9, t);
    formant.Q.setValueAtTime(3.2, t);

    // Articulated sharp tongue attack
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.35, t + 0.02);
    gain.gain.setValueAtTime(velocity * 0.32, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- 4. TENORA (The Queen of the Cobla: majestic double reed with brass bell) ---
  public playTenoraNote(freq = 329.63, duration = 0.6, time?: number, velocity = 0.75) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // Rich double-reed spectrum (Andreu Toron / Pep Ventura acoustic model)
    const wave = this.createWave(ctx, [
      0, 0.5, 0.85, 0.9, 0.75, 0.65, 0.55, 0.45, 0.38, 0.3, 0.22, 0.15, 0.1, 0.06
    ]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    // Wide, singing, emotional Catalan Tenora vibrato (starts after initial attack)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.6, t);
    lfoGain.gain.setValueAtTime(0.001, t);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.022, t + 0.12);
    lfo.connect(osc.frequency);

    // Double formant: Ginjoler wood body (1150Hz) + Brass Bell resonance (2350Hz)
    const woodFormant = ctx.createBiquadFilter();
    woodFormant.type = 'peaking';
    woodFormant.frequency.setValueAtTime(1150, t);
    woodFormant.gain.setValueAtTime(8, t);
    woodFormant.Q.setValueAtTime(2.8, t);

    const bellFormant = ctx.createBiquadFilter();
    bellFormant.type = 'peaking';
    bellFormant.frequency.setValueAtTime(2350, t);
    bellFormant.gain.setValueAtTime(6, t);
    bellFormant.Q.setValueAtTime(3.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.45, t + 0.04);
    gain.gain.setValueAtTime(velocity * 0.42, t + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(woodFormant);
    woodFormant.connect(bellFormant);
    bellFormant.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
  }

  // --- 5. TROMPETA (Brilliant cylindrical brass) ---
  public playTrompetaNote(freq = 440, duration = 0.45, time?: number, velocity = 0.65, withSordina = false) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    const wave = this.createWave(ctx, [0, 0.7, 0.85, 0.8, 0.7, 0.55, 0.4, 0.3, 0.2]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    // Dynamic brass lowpass filter opening on attack
    const filter = ctx.createBiquadFilter();
    if (withSordina) {
      // Sordina: nasal, highpass + bandpass dampening
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.Q.setValueAtTime(4.0, t);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(3600, t + 0.04);
      filter.frequency.exponentialRampToValueAtTime(1400, t + duration);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.35, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- 6. TROMBÓ (Deep brass foundation) ---
  public playTromboNote(freq = 174.61, duration = 0.55, time?: number, velocity = 0.7) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    const wave = this.createWave(ctx, [0, 0.9, 0.8, 0.65, 0.5, 0.35, 0.25, 0.15]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(1800, t + 0.05);
    filter.frequency.exponentialRampToValueAtTime(700, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.4, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- 7. FISCORN (Conical tenor bugle in C - velvety & singing) ---
  public playFiscornNote(freq = 220, duration = 0.55, time?: number, velocity = 0.7) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // Dark, mellow conical-bore wave (soft harmonics)
    const wave = this.createWave(ctx, [0, 0.95, 0.7, 0.4, 0.22, 0.12, 0.06, 0.02]);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(freq, t);

    // Warm, rounded vocal-like resonance (the "tenora of the back row")
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, t);
    filter.Q.setValueAtTime(1.8, t);

    // Subtle gentle vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.0, t);
    lfoGain.gain.setValueAtTime(freq * 0.012, t);
    lfo.connect(osc.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.4, t + 0.06);
    gain.gain.setValueAtTime(velocity * 0.38, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
  }

  // --- 8. CONTRABAIX (Gut string pizzicato with body cavity resonance) ---
  public playContrabaixNote(freq = 98, duration = 0.75, time?: number, velocity = 0.8) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;

    // Fundamental + body thump
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Finger pluck transient
    const pluck = ctx.createOscillator();
    const pluckGain = ctx.createGain();
    pluck.type = 'sine';
    pluck.frequency.setValueAtTime(freq * 3.5, t);
    pluck.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
    pluckGain.gain.setValueAtTime(velocity * 0.5, t);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    // Low wooden body filter
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(320, t);
    bodyFilter.frequency.exponentialRampToValueAtTime(90, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.5, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(ctx.destination);

    pluck.connect(pluckGain);
    pluckGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
    pluck.start(t);
    pluck.stop(t + 0.04);
  }

  // --- SOLO DEMOS WITH FAMOUS MOTIFS ---
  public playInstrumentDemo(type: string) {
    this.stopAll();
    const ctx = this.getContext();
    const t = ctx.currentTime;

    switch (type) {
      case 'flabiol':
      case 'flabiol-tambori':
        // Authentic Sardana Introit (Preludi del flabiolaire)
        // Tit-tit-tiiit, tururut, pam-pam-pam!
        this.playTamboriHit(t, 0.95);
        this.playFlabiolNote(880, 0.22, t + 0.08); // A5
        this.playFlabiolNote(880, 0.18, t + 0.32);
        this.playTamboriHit(t + 0.52, 0.7);
        this.playFlabiolNote(1046.5, 0.3, t + 0.55); // C6
        this.playFlabiolNote(1174.66, 0.25, t + 0.9); // D6
        this.playFlabiolNote(1318.51, 0.45, t + 1.18); // E6
        this.playTamboriHit(t + 1.2, 0.85);
        this.playFlabiolNote(1046.5, 0.22, t + 1.68);
        this.playFlabiolNote(880, 0.55, t + 1.95); // Final A5
        this.playTamboriHit(t + 1.95, 0.9);
        this.playTamboriHit(t + 2.3, 0.8);
        this.playTamboriHit(t + 2.55, 1.0); // Cop sec!
        break;

      case 'tible':
      case 'tible-1':
      case 'tible-2':
        // Lively, piercing tible phrase (from "Tres, sis, nou")
        this.playTibleNote(587.33, 0.25, t); // D5
        this.playTibleNote(587.33, 0.2, t + 0.26);
        this.playTibleNote(659.25, 0.28, t + 0.48); // E5
        this.playTibleNote(783.99, 0.32, t + 0.78); // G5
        this.playTibleNote(880.0, 0.45, t + 1.12); // A5
        this.playTibleNote(783.99, 0.28, t + 1.6);
        this.playTibleNote(587.33, 0.6, t + 1.9);
        break;

      case 'tenora':
      case 'tenora-1':
      case 'tenora-2':
        // Majestic expressive Tenora solo from Toldrà's "Sol ixent" / "La Santa Espina"
        this.playTenoraNote(329.63, 0.38, t); // E4
        this.playTenoraNote(392.0, 0.35, t + 0.4); // G4
        this.playTenoraNote(440.0, 0.45, t + 0.78); // A4
        this.playTenoraNote(493.88, 0.75, t + 1.25); // B4 (Singing vibrato)
        this.playTenoraNote(440.0, 0.32, t + 2.05); // A4
        this.playTenoraNote(392.0, 0.65, t + 2.4); // G4
        this.playTenoraNote(329.63, 0.8, t + 3.1); // E4 noble resolution
        break;

      case 'trompeta':
      case 'trompeta-1':
      case 'trompeta-2':
        // Brass fanfare ("Roda, roda moliner")
        this.playTrompetaNote(440, 0.22, t);
        this.playTrompetaNote(440, 0.22, t + 0.24);
        this.playTrompetaNote(554.37, 0.32, t + 0.5);
        this.playTrompetaNote(659.25, 0.55, t + 0.85);
        // Second call with sordina!
        this.playTrompetaNote(554.37, 0.28, t + 1.5, 0.5, true);
        this.playTrompetaNote(440, 0.5, t + 1.82, 0.5, true);
        break;

      case 'trombo':
        // Deep trombone solo ("Plou i fa sol")
        this.playTromboNote(174.61, 0.35, t); // F3
        this.playTromboNote(196.0, 0.35, t + 0.38); // G3
        this.playTromboNote(220.0, 0.45, t + 0.78); // A3
        this.playTromboNote(174.61, 0.7, t + 1.26); // F3
        break;

      case 'fiscorn':
      case 'fiscorn-1':
      case 'fiscorn-2':
        // Lyrical, singing warm countermelody ("Ploreu, ploreu ninetes")
        this.playFiscornNote(220, 0.35, t); // A3
        this.playFiscornNote(246.94, 0.35, t + 0.38); // B3
        this.playFiscornNote(293.66, 0.55, t + 0.76); // D4
        this.playFiscornNote(261.63, 0.45, t + 1.34); // C4
        this.playFiscornNote(220, 0.75, t + 1.82); // A3
        break;

      case 'contrabaix':
        // Gut string pizzicato walk ("El gegant del Pi")
        this.playContrabaixNote(98.0, 0.45, t); // G2
        this.playContrabaixNote(123.47, 0.45, t + 0.45); // B2
        this.playContrabaixNote(146.83, 0.55, t + 0.92); // D3
        this.playContrabaixNote(98.0, 0.85, t + 1.5); // G2
        break;

      default:
        this.playTenoraNote(392, 0.5, t);
    }
  }

  // --- FULL COBLA ENSEMBLE SARDANA: "LA SANTA ESPINA" / "SOL IXENT" ---
  public playFullCoblaEnsemble(
    tracksEnabled: { [id: string]: boolean },
    tempoBpm: number = 112,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const t0 = ctx.currentTime + 0.05;
    const beat = 60 / tempoBpm;

    // MEASURE 1-2: Authentic Introit (Flabiol & Tamborí alone!)
    if (tracksEnabled['flabiol-tambori'] !== false) {
      this.playTamboriHit(t0, 0.9);
      this.playFlabiolNote(880, beat * 0.4, t0);
      this.playTamboriHit(t0 + beat * 0.5, 0.7);
      this.playFlabiolNote(1046.5, beat * 0.4, t0 + beat * 0.5);
      this.playTamboriHit(t0 + beat * 1.0, 0.8);
      this.playFlabiolNote(1318.5, beat * 0.8, t0 + beat * 1.0);
      this.playFlabiolNote(1046.5, beat * 0.4, t0 + beat * 1.5);
      this.playTamboriHit(t0 + beat * 1.5, 0.75);
      this.playTamboriHit(t0 + beat * 1.85, 0.9);
    }

    // MEASURE 3-18: The Cobla Enters playing the grand theme of "La Santa Espina"
    const m2 = t0 + beat * 2.2;
    const totalBeats = 16;

    // Melody: "Som i serem gent catalana..." (G Major)
    // G4, B4, D5, G5, F#5, E5, D5, B4, C5, D5, E5, D5, C5, B4, A4, G4
    const melody = [
      392.0, 493.88, 587.33, 783.99, 739.99, 659.25, 587.33, 493.88,
      523.25, 587.33, 659.25, 587.33, 523.25, 493.88, 440.0, 392.0
    ];

    // Countermelody for Fiscorns:
    const counterMelody = [
      196.0, 246.94, 293.66, 392.0, 369.99, 329.63, 293.66, 246.94,
      261.63, 293.66, 329.63, 293.66, 261.63, 246.94, 220.0, 196.0
    ];

    for (let b = 0; b < totalBeats; b++) {
      const tb = m2 + b * beat;

      // Rhythm section: Tamborí & Contrabaix (authentic sardana pulse: beat and half-beat)
      if (tracksEnabled['flabiol-tambori'] !== false) {
        this.playTamboriHit(tb, 0.75);
        this.playTamboriHit(tb + beat * 0.5, 0.5);
      }

      if (tracksEnabled['contrabaix'] !== false) {
        // Alternating Tonic (G2=98Hz) and Dominant (D3=146.8Hz)
        const bassNote = b % 2 === 0 ? 98.0 : 146.83;
        this.playContrabaixNote(bassNote, beat * 0.85, tb, 0.85);
      }

      // Harmony Brass: Trompeta 2, Trombó
      if (tracksEnabled['trompeta-2'] !== false && b % 2 === 1) {
        this.playTrompetaNote(392, beat * 0.45, tb, 0.5);
      }
      if (tracksEnabled['trombo'] !== false && b % 2 === 0) {
        this.playTromboNote(196, beat * 0.6, tb, 0.6);
      }

      // Melodic Leaders:
      const note = melody[b];

      // Tenora 1 (Lead vocal solista)
      if (tracksEnabled['tenora-1'] !== false) {
        this.playTenoraNote(note, beat * 0.9, tb, 0.85);
      }
      // Tenora 2 (Second voice harmony in 3rds below)
      if (tracksEnabled['tenora-2'] !== false) {
        this.playTenoraNote(note * 0.8, beat * 0.85, tb, 0.65);
      }

      // Tibles (Higher octave brilliance)
      if (tracksEnabled['tible-1'] !== false) {
        this.playTibleNote(note * 1.5, beat * 0.8, tb, 0.6);
      }
      if (tracksEnabled['tible-2'] !== false) {
        this.playTibleNote(note * 1.25, beat * 0.8, tb, 0.55);
      }

      // Trompeta 1 (Fanfare accents in the second half)
      if (tracksEnabled['trompeta-1'] !== false && b >= 8) {
        this.playTrompetaNote(note, beat * 0.5, tb, 0.65);
      }

      // Fiscorns (Warm lyrical countermelody)
      if (tracksEnabled['fiscorn-1'] !== false) {
        this.playFiscornNote(counterMelody[b], beat * 0.85, tb, 0.7);
      }
      if (tracksEnabled['fiscorn-2'] !== false) {
        this.playFiscornNote(counterMelody[b] * 0.75, beat * 0.8, tb, 0.6);
      }
    }

    // Cop Final! (Authentic concluding tutti chord)
    const tEnd = m2 + totalBeats * beat;
    if (tracksEnabled['flabiol-tambori'] !== false) this.playTamboriHit(tEnd, 1.0);
    if (tracksEnabled['contrabaix'] !== false) this.playContrabaixNote(98, beat * 1.5, tEnd, 1.0);
    if (tracksEnabled['tenora-1'] !== false) this.playTenoraNote(392, beat * 1.8, tEnd, 1.0);
    if (tracksEnabled['tible-1'] !== false) this.playTibleNote(587.33, beat * 1.8, tEnd, 0.9);
    if (tracksEnabled['trompeta-1'] !== false) this.playTrompetaNote(392, beat * 1.8, tEnd, 0.9);
    if (tracksEnabled['trombo'] !== false) this.playTromboNote(196, beat * 1.8, tEnd, 0.9);
    if (tracksEnabled['fiscorn-1'] !== false) this.playFiscornNote(196, beat * 1.8, tEnd, 0.9);

    const totalDuration = (totalBeats + 4) * beat;
    if (onFinish) {
      setTimeout(() => {
        onFinish();
      }, totalDuration * 1000);
    }
  }

  // --- REWARD CHIMES ---
  public playSuccessSound() {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.001, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.4);
    });
  }

  public playTryAgainSound() {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(220, t + 0.22);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }
}

export const coblaAudio = new CoblaAudioEngine();
