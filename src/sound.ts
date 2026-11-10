// Sound effects synthesized with the Web Audio API (no audio files).

export interface Sound {
  pop(step: number): void;
  off(): void;
  reach(): void;
  bingo(lines: number): void;
  perfect(): void;
  boom(): void;
  tick(): void;
  note(step: number, at?: number): void;
  close(): void;
}

// Major pentatonic steps, so rising combos always sound in tune.
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
const hz = (semitones: number) => 523.25 * Math.pow(2, semitones / 12); // C5 = 0

type WithUserActivation = Navigator & { userActivation?: { hasBeenActive: boolean } };

export function createSound(isMuted: () => boolean): Sound {
  let ac: AudioContext | null = null;
  let out: GainNode | null = null;

  function audio(): AudioContext | null {
    if (isMuted() || typeof window === "undefined") return null;
    // Browsers refuse to start audio before the first user gesture; don't even try.
    const ua = (navigator as WithUserActivation).userActivation;
    if (!ac && ua && !ua.hasBeenActive) return null;
    if (!ac) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ac = new Ctor();
      const comp = ac.createDynamicsCompressor();
      out = ac.createGain();
      out.gain.value = 0.6;
      out.connect(comp).connect(ac.destination);
    }
    if (ac.state === "suspended") void ac.resume();
    return ac;
  }

  function tone(f: number, at = 0, dur = 0.15, type: OscillatorType = "triangle", vol = 0.2, to = 0) {
    const a = audio();
    if (!a || !out) return;
    const t = a.currentTime + at;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(at = 0, dur = 0.3, vol = 0.25, freq = 1200) {
    const a = audio();
    if (!a || !out) return;
    const t = a.currentTime + at;
    const n = Math.ceil(a.sampleRate * dur);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    const s = a.createBufferSource();
    const f = a.createBiquadFilter();
    const g = a.createGain();
    s.buffer = buf;
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 0.7;
    g.gain.value = vol;
    s.connect(f).connect(g).connect(out);
    s.start(t);
  }

  const step = (k: number) => hz(SCALE[Math.min(Math.max(k, 0), SCALE.length - 1)]);

  return {
    pop(k) {
      const f = step(k);
      tone(f, 0, 0.16, "triangle", 0.22);
      tone(f * 2, 0, 0.08, "sine", 0.06);
      tone(150, 0, 0.09, "sine", 0.25, 60);
    },
    off: () => tone(392, 0, 0.1, "sine", 0.1, 262),
    reach() {
      tone(988, 0, 0.08, "square", 0.05);
      tone(1319, 0.09, 0.14, "square", 0.05);
    },
    bingo(lines) {
      [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(hz(s), i * 0.06, 0.22, "square", 0.06));
      [12, 16, 19].forEach((s) => tone(hz(s), 0.38, 0.6, "triangle", 0.12));
      if (lines > 1) [24, 28, 31].forEach((s) => tone(hz(s), 0.55, 0.6, "triangle", 0.08));
      noise(0, 0.25, 0.12, 3000);
    },
    perfect() {
      [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(hz(s - 12), i * 0.07, 0.25, "square", 0.06));
      [0, 4, 7, 12].forEach((s) => tone(hz(s), 0.55, 1.2, "triangle", 0.12));
      [12, 16, 19].forEach((s) => tone(hz(s), 0.55, 1.2, "sawtooth", 0.03));
      tone(hz(-12), 0.55, 1.2, "sine", 0.2);
    },
    boom() {
      noise(0, 0.5, 0.3, 500);
      tone(90, 0, 0.3, "sine", 0.25, 40);
    },
    tick: () => tone(1760, 0, 0.03, "square", 0.03),
    note: (k, at = 0) => tone(step(k), at, 0.12, "square", 0.05),
    close() {
      if (ac) void ac.close().catch(() => {});
      ac = null;
      out = null;
    },
  };
}
