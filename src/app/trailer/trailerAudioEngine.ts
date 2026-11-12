// ============================================================================
// THE UNWRITTEN — CINEMATIC TRAILER AUDIO & VOICE ENGINE
// Web Audio Acoustic Processing Chain & Supernatural Voice Synthesizer
// ============================================================================

export interface TrailerAudioEngine {
  init: () => void;
  setMuted: (muted: boolean) => void;
  startAtmosphericDrone: () => void;
  stopAtmosphericDrone: (fadeDuration?: number) => void;
  playHeartbeat: (offset?: number) => void;
  playWetFootstep: (foot?: "left" | "right") => void;
  playColossalGateRumble: () => void;
  playCinematicSubBoom: () => void;
  playHarmonicShimmerRiser: () => void;
  speakWardenDialogue: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  stopAllVoice: () => void;
  cleanup: () => void;
}

/**
 * Procedural Gothic Stone / Cathedral Impulse Response generator.
 * Creates an ancient vast hall acoustic with early wall reflections
 * and frequency-dependent stone absorption.
 */
function createCathedralImpulseResponse(
  ctx: AudioContext,
  duration = 3.6,
  decay = 2.4
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  // Discrete early reflections (simulating massive gothic stone pillars & vaults)
  const earlyReflections = [
    { time: 0.019, gainL: 0.65, gainR: 0.38 },
    { time: 0.034, gainL: 0.48, gainR: 0.58 },
    { time: 0.052, gainL: 0.42, gainR: 0.28 },
    { time: 0.078, gainL: 0.36, gainR: 0.44 },
    { time: 0.112, gainL: 0.30, gainR: 0.22 },
    { time: 0.158, gainL: 0.24, gainR: 0.26 },
  ];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Exponential envelope for the diffuse reverberant tail
    const env = Math.exp(-t * decay);
    // High-frequency damping factor (highs absorb faster in stone chambers)
    const hfDamp = Math.exp(-t * 2.1);

    // Filtered stereo noise floor
    left[i] = (Math.random() * 2 - 1) * env * hfDamp;
    right[i] = (Math.random() * 2 - 1) * env * hfDamp;
  }

  // Inject discrete early reflections
  for (const refl of earlyReflections) {
    const idx = Math.floor(refl.time * sampleRate);
    if (idx < length) {
      left[idx] += refl.gainL * 0.75;
      right[idx] += refl.gainR * 0.75;
    }
  }

  return impulse;
}

/**
 * Creates and returns an instance of the cinematic trailer audio engine.
 */
export function createTrailerAudioEngine(): TrailerAudioEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let subBassFilter: BiquadFilterNode | null = null;
  let formantFilter1: BiquadFilterNode | null = null;
  let formantFilter2: BiquadFilterNode | null = null;
  let reverbNode: ConvolverNode | null = null;
  let reverbGain: GainNode | null = null;

  // Drone state
  let droneNodes: {
    oscLeft: OscillatorNode;
    oscRight: OscillatorNode;
    subOsc: OscillatorNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;

  // Active voice resonance nodes
  let activeVoiceResonance: {
    stop: () => void;
  } | null = null;

  let isMutedState = false;

  const init = () => {
    if (typeof window === "undefined") return;

    if (!ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) return;
      ctx = new AudioCtx();

      // Master Gain
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMutedState ? 0 : 0.9, ctx.currentTime);

      // Dynamics Compressor (master limiter preventing harsh clipping on explosive sub-booms)
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(10, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Sub-harmonic bass resonance filter (low-shelf at 85Hz +6dB boost)
      subBassFilter = ctx.createBiquadFilter();
      subBassFilter.type = "lowshelf";
      subBassFilter.frequency.setValueAtTime(85, ctx.currentTime);
      subBassFilter.gain.setValueAtTime(6.0, ctx.currentTime);

      // Dual-band formant warmth (peaking at 330Hz and 440Hz)
      formantFilter1 = ctx.createBiquadFilter();
      formantFilter1.type = "peaking";
      formantFilter1.frequency.setValueAtTime(330, ctx.currentTime);
      formantFilter1.Q.setValueAtTime(1.2, ctx.currentTime);
      formantFilter1.gain.setValueAtTime(4.0, ctx.currentTime);

      formantFilter2 = ctx.createBiquadFilter();
      formantFilter2.type = "peaking";
      formantFilter2.frequency.setValueAtTime(440, ctx.currentTime);
      formantFilter2.Q.setValueAtTime(1.5, ctx.currentTime);
      formantFilter2.gain.setValueAtTime(2.5, ctx.currentTime);

      // Gothic Cathedral Reverb Convolver
      try {
        reverbNode = ctx.createConvolver();
        reverbNode.buffer = createCathedralImpulseResponse(ctx);
        reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(0.38, ctx.currentTime);
        reverbNode.connect(reverbGain);
        reverbGain.connect(masterGain);
      } catch (err) {
        console.warn("Convolver initialization fallback:", err);
      }

      // Master processing chain:
      // Source -> Formant 1 -> Formant 2 -> Sub-bass -> Compressor -> Master Gain -> Destination
      formantFilter1.connect(formantFilter2);
      formantFilter2.connect(subBassFilter);
      subBassFilter.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);
    } else if (ctx.state === "suspended") {
      void ctx.resume();
    }
  };

  const getAudioContext = (): AudioContext | null => {
    init();
    return ctx;
  };

  const getMainInput = (): AudioNode | null => {
    return formantFilter1 || masterGain;
  };

  const setMuted = (muted: boolean) => {
    isMutedState = muted;
    if (masterGain && ctx) {
      const t = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(t);
      masterGain.gain.setValueAtTime(masterGain.gain.value, t);
      masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.9, t + 0.08);
    }
    if (muted) {
      stopAllVoice();
    }
  };

  // ==========================================================================
  // ATMOSPHERIC SOUNDSCAPE: Ominous D-Minor Drone with Binaural Pulsing
  // ==========================================================================
  const startAtmosphericDrone = () => {
    const audioCtx = getAudioContext();
    if (!audioCtx || !masterGain || isMutedState) return;
    if (droneNodes) return; // Already running

    const t = audioCtx.currentTime;

    // D-Minor Root (D2 = 73.42Hz) with binaural detune
    const oscLeft = audioCtx.createOscillator();
    const oscRight = audioCtx.createOscillator();
    const subOsc = audioCtx.createOscillator();

    oscLeft.type = "sawtooth";
    oscLeft.frequency.setValueAtTime(73.42, t);

    oscRight.type = "triangle";
    oscRight.frequency.setValueAtTime(73.92, t); // 0.5Hz binaural pulsation

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(36.71, t); // D1 visceral sub-bass

    // Ambient Lowpass Filter with slow breathing cutoff modulation
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(190, t);
    filter.Q.setValueAtTime(3.0, t);

    // LFO for slow breathing atmospheric pulse
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, t); // 12.5s slow swell cycle
    lfoGain.gain.setValueAtTime(55, t); // Swells cutoff between 135Hz and 245Hz
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Drone Volume Gain with smooth fade-in
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 2.5);

    // Channel Merging for Stereo Binaural Spread
    const merger = audioCtx.createChannelMerger(2);
    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel

    merger.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);

    const inputNode = getMainInput();
    if (inputNode) {
      gain.connect(inputNode);
    }

    // Also send a subtle amount to the cathedral reverb
    if (reverbNode) {
      const droneReverbSend = audioCtx.createGain();
      droneReverbSend.gain.setValueAtTime(0.12, t);
      gain.connect(droneReverbSend);
      droneReverbSend.connect(reverbNode);
    }

    oscLeft.start(t);
    oscRight.start(t);
    subOsc.start(t);
    lfo.start(t);

    droneNodes = {
      oscLeft,
      oscRight,
      subOsc,
      filter,
      gain,
      lfo,
      lfoGain,
    };
  };

  const stopAtmosphericDrone = (fadeDuration = 1.5) => {
    if (!droneNodes || !ctx) return;
    const t = ctx.currentTime;
    const nodes = droneNodes;
    droneNodes = null;

    nodes.gain.gain.cancelScheduledValues(t);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
    nodes.gain.gain.linearRampToValueAtTime(0.0001, t + fadeDuration);

    setTimeout(() => {
      try {
        nodes.oscLeft.stop();
        nodes.oscRight.stop();
        nodes.subOsc.stop();
        nodes.lfo.stop();
        nodes.oscLeft.disconnect();
        nodes.oscRight.disconnect();
        nodes.subOsc.disconnect();
        nodes.gain.disconnect();
      } catch {
        // already stopped
      }
    }, fadeDuration * 1000 + 100);
  };

  // ==========================================================================
  // REALISTIC RHYTHMIC HEARTBEAT (Scene 1)
  // Double organic pulse: "lub-dub" with deep sub-bass decay
  // ==========================================================================
  const playHeartbeat = (offset = 0) => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return;

    const t = audioCtx.currentTime + offset;
    const inputNode = getMainInput();
    if (!inputNode) return;

    // First beat: Lub (stronger, 68Hz -> 30Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(74, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.16);

    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(0.75, t + 0.025);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc1.connect(gain1);
    gain1.connect(inputNode);
    osc1.start(t);
    osc1.stop(t + 0.25);

    // Second beat: Dub (slightly softer, ~140ms later, 60Hz -> 26Hz)
    const t2 = t + 0.14;
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(62, t2);
    osc2.frequency.exponentialRampToValueAtTime(26, t2 + 0.18);

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.55, t2 + 0.025);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.24);

    osc2.connect(gain2);
    gain2.connect(inputNode);
    osc2.start(t2);
    osc2.stop(t2 + 0.26);

    // Subtle sub-reverb reflection
    if (reverbNode) {
      const send = audioCtx.createGain();
      send.gain.setValueAtTime(0.18, t);
      gain1.connect(send);
      gain2.connect(send);
      send.connect(reverbNode);
    }
  };

  // ==========================================================================
  // WET FLAGSTONE FOOTSTEPS (Scene 3 character walking strides)
  // Dual-component: Leather boot impact + wet stone splash + cavern reflection
  // ==========================================================================
  const playWetFootstep = (foot: "left" | "right" = "left") => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return;

    const t = audioCtx.currentTime;
    const inputNode = getMainInput();
    if (!inputNode) return;

    // 1. Heavy boot stone strike (low thump 130Hz -> 48Hz)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.11);

    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.38, t + 0.012);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(oscGain);

    // 2. Wet flagstone water splatter (bandpass-filtered noise burst)
    const noiseLength = Math.floor(audioCtx.sampleRate * 0.12);
    const noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLength * 0.28));
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const wetFilter = audioCtx.createBiquadFilter();
    wetFilter.type = "bandpass";
    wetFilter.frequency.setValueAtTime(2400, t);
    wetFilter.Q.setValueAtTime(2.2, t);

    const wetGain = audioCtx.createGain();
    wetGain.gain.setValueAtTime(0.28, t);
    wetGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noiseSource.connect(wetFilter);
    wetFilter.connect(wetGain);

    // 3. Subtle Stereo Panner (alternating footsteps)
    const panner = audioCtx.createStereoPanner
      ? audioCtx.createStereoPanner()
      : null;
    const panVal = foot === "left" ? -0.22 : 0.22;
    if (panner) {
      panner.pan.setValueAtTime(panVal, t);
      oscGain.connect(panner);
      wetGain.connect(panner);
      panner.connect(inputNode);
    } else {
      oscGain.connect(inputNode);
      wetGain.connect(inputNode);
    }

    // Cathedral stone reflection
    if (reverbNode) {
      const stepReverb = audioCtx.createGain();
      stepReverb.gain.setValueAtTime(0.28, t);
      oscGain.connect(stepReverb);
      wetGain.connect(stepReverb);
      stepReverb.connect(reverbNode);
    }

    osc.start(t);
    osc.stop(t + 0.15);
    noiseSource.start(t);
    noiseSource.stop(t + 0.13);
  };

  // ==========================================================================
  // COLOSSAL GATE GRINDING RUMBLE (Scene 3)
  // Monolithic stone friction + heavy iron gears + seismic sub-rumble
  // ==========================================================================
  const playColossalGateRumble = () => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return;

    const t = audioCtx.currentTime;
    const dur = 4.8;
    const inputNode = getMainInput();
    if (!inputNode) return;

    // 1. Monolithic Stone Friction Texture (Continuous modulated noise)
    const bufferSize = Math.floor(audioCtx.sampleRate * dur);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const stoneFilter = audioCtx.createBiquadFilter();
    stoneFilter.type = "lowpass";
    stoneFilter.frequency.setValueAtTime(220, t);
    stoneFilter.frequency.exponentialRampToValueAtTime(55, t + dur);
    stoneFilter.Q.setValueAtTime(4.0, t);

    const stoneGain = audioCtx.createGain();
    stoneGain.gain.setValueAtTime(0.01, t);
    stoneGain.gain.linearRampToValueAtTime(0.68, t + 0.6);
    stoneGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(stoneFilter);
    stoneFilter.connect(stoneGain);
    stoneGain.connect(inputNode);

    // 2. Heavy Iron Chains / Counterweight Gear Groan (Detuned Saw/Square)
    const gearOsc1 = audioCtx.createOscillator();
    const gearOsc2 = audioCtx.createOscillator();
    const gearGain = audioCtx.createGain();

    gearOsc1.type = "sawtooth";
    gearOsc1.frequency.setValueAtTime(65, t);
    gearOsc1.frequency.exponentialRampToValueAtTime(42, t + dur * 0.7);

    gearOsc2.type = "square";
    gearOsc2.frequency.setValueAtTime(63.5, t);
    gearOsc2.frequency.exponentialRampToValueAtTime(40.5, t + dur * 0.7);

    const gearFilter = audioCtx.createBiquadFilter();
    gearFilter.type = "bandpass";
    gearFilter.frequency.setValueAtTime(140, t);
    gearFilter.frequency.exponentialRampToValueAtTime(80, t + dur);
    gearFilter.Q.setValueAtTime(3.5, t);

    gearGain.gain.setValueAtTime(0.01, t);
    gearGain.gain.linearRampToValueAtTime(0.42, t + 0.8);
    gearGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);

    gearOsc1.connect(gearFilter);
    gearOsc2.connect(gearFilter);
    gearFilter.connect(gearGain);
    gearGain.connect(inputNode);

    // 3. Seismic Sub-Rumble (32Hz earth shake)
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(38, t);
    subOsc.frequency.linearRampToValueAtTime(26, t + dur);

    subGain.gain.setValueAtTime(0.01, t);
    subGain.gain.linearRampToValueAtTime(0.65, t + 0.5);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    subOsc.connect(subGain);
    subGain.connect(inputNode);

    // Reverb send for colossal hall echoing
    if (reverbNode) {
      const rumbleReverb = audioCtx.createGain();
      rumbleReverb.gain.setValueAtTime(0.45, t);
      stoneGain.connect(rumbleReverb);
      gearGain.connect(rumbleReverb);
      rumbleReverb.connect(reverbNode);
    }

    noise.start(t);
    noise.stop(t + dur);
    gearOsc1.start(t);
    gearOsc1.stop(t + dur);
    gearOsc2.start(t);
    gearOsc2.stop(t + dur);
    subOsc.start(t);
    subOsc.stop(t + dur);
  };

  // ==========================================================================
  // HIGH-IMPACT CINEMATIC SUB-BOOM (Scene 4: "THE UNWRITTEN is officially LIVE!")
  // 110Hz -> 24Hz sub drop + metallic reverberation clang + pre-impact suck
  // ==========================================================================
  const playCinematicSubBoom = () => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return;

    const t = audioCtx.currentTime;
    const inputNode = getMainInput();
    if (!inputNode) return;

    // 1. Massive Sub-Drop (110Hz -> 24Hz over 2.2s)
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(24, t + 1.4);

    subGain.gain.setValueAtTime(0.95, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    subOsc.connect(subGain);
    subGain.connect(inputNode);
    subOsc.start(t);
    subOsc.stop(t + 2.6);

    // 2. Punch Transient (initial sharp hammer blow at 180Hz)
    const punchOsc = audioCtx.createOscillator();
    const punchGain = audioCtx.createGain();
    punchOsc.type = "sine";
    punchOsc.frequency.setValueAtTime(180, t);
    punchOsc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    punchGain.gain.setValueAtTime(0.85, t);
    punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    punchOsc.connect(punchGain);
    punchGain.connect(inputNode);
    punchOsc.start(t);
    punchOsc.stop(t + 0.1);

    // 3. Metallic Clang Reverberation (FM Synthesis: 440Hz carrier x 713Hz modulator)
    const carrier = audioCtx.createOscillator();
    const modulator = audioCtx.createOscillator();
    const modGain = audioCtx.createGain();
    const metalGain = audioCtx.createGain();

    carrier.type = "sine";
    carrier.frequency.setValueAtTime(440, t);

    modulator.type = "sine";
    modulator.frequency.setValueAtTime(713, t); // Non-integer ratio creates inharmonic metallic chime
    modGain.gain.setValueAtTime(620, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + 1.8);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    metalGain.gain.setValueAtTime(0.35, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    carrier.connect(metalGain);
    metalGain.connect(inputNode);

    // Send metallic tail generously into gothic cathedral reverb
    if (reverbNode) {
      const metalReverbSend = audioCtx.createGain();
      metalReverbSend.gain.setValueAtTime(0.65, t);
      metalGain.connect(metalReverbSend);
      metalReverbSend.connect(reverbNode);

      const subReverbSend = audioCtx.createGain();
      subReverbSend.gain.setValueAtTime(0.3, t);
      subGain.connect(subReverbSend);
      subReverbSend.connect(reverbNode);
    }

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 2.4);
    modulator.stop(t + 2.4);
  };

  // ==========================================================================
  // ETHEREAL HARMONIC SHIMMER RISER (Scene 5)
  // Pentatonic harmonic chime cluster (D4, F4, A4, C5, E5, A5) + sweeping riser
  // ==========================================================================
  const playHarmonicShimmerRiser = () => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return;

    const t = audioCtx.currentTime;
    const dur = 3.2;
    const inputNode = getMainInput();
    if (!inputNode) return;

    // Harmonic cluster frequencies (D-minor mystical celestial overtones)
    const freqs = [293.66, 349.23, 440.0, 523.25, 659.25, 880.0];
    const shimmerMasterGain = audioCtx.createGain();
    shimmerMasterGain.gain.setValueAtTime(0.01, t);
    shimmerMasterGain.gain.linearRampToValueAtTime(0.22, t + dur * 0.75);
    shimmerMasterGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Resonant Sweeping Bandpass
    const sweepFilter = audioCtx.createBiquadFilter();
    sweepFilter.type = "bandpass";
    sweepFilter.frequency.setValueAtTime(260, t);
    sweepFilter.frequency.exponentialRampToValueAtTime(3600, t + dur);
    sweepFilter.Q.setValueAtTime(3.8, t);

    // Sawtooth Riser Foundation
    const sawOsc = audioCtx.createOscillator();
    sawOsc.type = "sawtooth";
    sawOsc.frequency.setValueAtTime(73.42, t);
    sawOsc.frequency.exponentialRampToValueAtTime(587.33, t + dur);

    const sawGain = audioCtx.createGain();
    sawGain.gain.setValueAtTime(0.01, t);
    sawGain.gain.linearRampToValueAtTime(0.18, t + dur * 0.8);
    sawGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    sawOsc.connect(sweepFilter);
    sweepFilter.connect(sawGain);
    sawGain.connect(inputNode);

    // Chime Cluster
    const oscillators: OscillatorNode[] = [sawOsc];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      // Glistening micro-pitch vibrato
      osc.frequency.exponentialRampToValueAtTime(f * 1.03, t + dur);

      const delayOffset = idx * 0.12;
      oscGain.gain.setValueAtTime(0.001, t);
      oscGain.gain.setValueAtTime(0.001, t + delayOffset);
      oscGain.gain.linearRampToValueAtTime(0.08 / freqs.length, t + delayOffset + 0.4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(oscGain);
      oscGain.connect(shimmerMasterGain);
      oscillators.push(osc);
    });

    shimmerMasterGain.connect(inputNode);

    // Deep cathedral shimmer reflections
    if (reverbNode) {
      const shimmerReverb = audioCtx.createGain();
      shimmerReverb.gain.setValueAtTime(0.55, t);
      shimmerMasterGain.connect(shimmerReverb);
      sawGain.connect(shimmerReverb);
      shimmerReverb.connect(reverbNode);
    }

    oscillators.forEach((osc) => {
      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  };

  // ==========================================================================
  // THE WARDEN SUPERNATURAL VOICE SYSTEM
  // SpeechSynthesis + Web Audio Formant Whisper & Sub-Harmonic Resonance
  // ==========================================================================

  /**
   * Finds the deepest, most cinematic and authoritative male voice available.
   */
  const getWardenVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritized list of high-quality authoritative male voices
    const priorityKeywords = [
      "Google UK English Male",
      "en-GB-Neural2-B",
      "en-GB-Wavenet-B",
      "en-GB-Standard-B",
      "Daniel", // Classic British authoritative
      "George", // Deep British
      "David", // Deep US Baritone
      "Guy", // Authoritative US
      "Oliver",
      "James",
      "Arthur",
      "Male",
      "en-GB",
    ];

    for (const kw of priorityKeywords) {
      const found = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          v.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) return found;
    }

    // Fallback: any English voice
    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  };

  /**
   * Synthesizes an eerie, low-octave harmonic vocal whisper and sub-resonance
   * layer through the Web Audio cathedral chain in perfect sync with speech.
   */
  const startSupernaturalVoiceResonance = (estimatedDurationSeconds: number) => {
    const audioCtx = getAudioContext();
    if (!audioCtx || isMutedState) return { stop: () => {} };

    const t = audioCtx.currentTime;
    const dur = Math.max(1.5, estimatedDurationSeconds);
    const inputNode = getMainInput();
    if (!inputNode) return { stop: () => {} };

    // 1. Sub-harmonic Vocal Undertone (D-minor D2 73.4Hz + D1 36.7Hz)
    const vocalSub = audioCtx.createOscillator();
    const vocalSubGain = audioCtx.createGain();
    vocalSub.type = "sine";
    vocalSub.frequency.setValueAtTime(73.42, t);
    // Subtle supernatural vibrato
    const subLfo = audioCtx.createOscillator();
    const subLfoGain = audioCtx.createGain();
    subLfo.frequency.setValueAtTime(4.5, t);
    subLfoGain.gain.setValueAtTime(1.8, t);
    subLfo.connect(subLfoGain);
    subLfoGain.connect(vocalSub.frequency);

    vocalSubGain.gain.setValueAtTime(0.001, t);
    vocalSubGain.gain.linearRampToValueAtTime(0.18, t + 0.25);
    vocalSubGain.gain.setValueAtTime(0.18, t + dur - 0.35);
    vocalSubGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    vocalSub.connect(vocalSubGain);
    vocalSubGain.connect(inputNode);

    // 2. Formant-Filtered Vocal Whisper Layer (Pink/Brown noise passed through human throat formants)
    const noiseLength = Math.floor(audioCtx.sampleRate * dur);
    const noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < noiseLength; i++) {
      const white = Math.random() * 2 - 1;
      // Pinkish noise filter
      lastOut = (lastOut + 0.02 * white) / 1.02;
      noiseData[i] = lastOut * 3.5;
    }

    const whisperSource = audioCtx.createBufferSource();
    whisperSource.buffer = noiseBuffer;

    // Formant 1: Throat resonance (~380Hz)
    const throatBand = audioCtx.createBiquadFilter();
    throatBand.type = "bandpass";
    throatBand.frequency.setValueAtTime(380, t);
    throatBand.Q.setValueAtTime(3.2, t);

    // Formant 2: Nasal/Mouth resonance (~1250Hz)
    const mouthBand = audioCtx.createBiquadFilter();
    mouthBand.type = "bandpass";
    mouthBand.frequency.setValueAtTime(1250, t);
    mouthBand.Q.setValueAtTime(2.8, t);

    const whisperGain = audioCtx.createGain();
    whisperGain.gain.setValueAtTime(0.001, t);
    whisperGain.gain.linearRampToValueAtTime(0.09, t + 0.2);
    whisperGain.gain.setValueAtTime(0.09, t + dur - 0.3);
    whisperGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    whisperSource.connect(throatBand);
    whisperSource.connect(mouthBand);
    throatBand.connect(whisperGain);
    mouthBand.connect(whisperGain);
    whisperGain.connect(inputNode);

    // Send the supernatural whisper heavily to the gothic cathedral reverb
    if (reverbNode) {
      const voiceReverbSend = audioCtx.createGain();
      voiceReverbSend.gain.setValueAtTime(0.42, t);
      whisperGain.connect(voiceReverbSend);
      vocalSubGain.connect(voiceReverbSend);
      voiceReverbSend.connect(reverbNode);
    }

    vocalSub.start(t);
    subLfo.start(t);
    whisperSource.start(t);

    const stop = () => {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      try {
        vocalSubGain.gain.cancelScheduledValues(now);
        vocalSubGain.gain.setValueAtTime(vocalSubGain.gain.value, now);
        vocalSubGain.gain.linearRampToValueAtTime(0.001, now + 0.2);

        whisperGain.gain.cancelScheduledValues(now);
        whisperGain.gain.setValueAtTime(whisperGain.gain.value, now);
        whisperGain.gain.linearRampToValueAtTime(0.001, now + 0.2);

        setTimeout(() => {
          try {
            vocalSub.stop();
            subLfo.stop();
            whisperSource.stop();
            vocalSub.disconnect();
            whisperSource.disconnect();
          } catch {
            // already disconnected
          }
        }, 250);
      } catch {
        // ignore
      }
    };

    return { stop };
  };

  const speakWardenDialogue = (
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (isMutedState) return;

    init();
    stopAllVoice();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onStart) onStart();
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    // Calibrate fine-tuned baritone pitch and cadence
    u.pitch = 0.68; // Deep, mysterious, commanding authority
    u.rate = 0.86; // Measured cinematic cadence

    const wardenVoice = getWardenVoice();
    if (wardenVoice) {
      u.voice = wardenVoice;
    }

    // Estimate speaking duration based on character count and cadence
    const estimatedDuration = Math.max(1.8, (text.split(" ").length * 0.42) / 0.86);

    u.onstart = () => {
      // Trigger synchronized low-octave supernatural vocal whisper & resonance layer
      activeVoiceResonance = startSupernaturalVoiceResonance(estimatedDuration);
      if (onStart) onStart();
    };

    u.onend = () => {
      if (activeVoiceResonance) {
        activeVoiceResonance.stop();
        activeVoiceResonance = null;
      }
      if (onEnd) onEnd();
    };

    u.onerror = () => {
      if (activeVoiceResonance) {
        activeVoiceResonance.stop();
        activeVoiceResonance = null;
      }
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(u);
  };

  const stopAllVoice = () => {
    if (activeVoiceResonance) {
      activeVoiceResonance.stop();
      activeVoiceResonance = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const cleanup = () => {
    stopAtmosphericDrone(0.1);
    stopAllVoice();
    if (ctx && ctx.state !== "closed") {
      void ctx.close();
      ctx = null;
    }
  };

  return {
    init,
    setMuted,
    startAtmosphericDrone,
    stopAtmosphericDrone,
    playHeartbeat,
    playWetFootstep,
    playColossalGateRumble,
    playCinematicSubBoom,
    playHarmonicShimmerRiser,
    speakWardenDialogue,
    stopAllVoice,
    cleanup,
  };
}
