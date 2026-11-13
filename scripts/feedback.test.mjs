import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function load(name, globals) {
  const exports = {};
  const source = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  runInNewContext(outputText, { exports, ...globals });
  return exports;
}

function hapticFixture() {
  const calls = [];
  const navigator = {
    userActivation: { hasBeenActive: true },
    vibrate(pattern) { calls.push(JSON.parse(JSON.stringify(pattern))); return true; },
  };
  const document = { hidden: false };
  return { calls, navigator, document, ...load("haptics", { navigator, document }) };
}

test("winning feedback starts immediately and scales without a second vibration call", () => {
  const f = hapticFixture(), h = f.createHaptics(true);
  h.play("tap", 1);
  h.play("tap", 3);
  h.play("tap", 6);
  h.play("tap", 9);
  assert.deepEqual(f.calls, [90, [120, 15, 100], [140, 15, 120], [160, 15, 140]]);
  const bingoPatterns = [];
  for (const lines of [1, 2, 3]) {
    h.play("bingo", 4, lines, 340);
    const p = f.calls.at(-1);
    bingoPatterns.push(p);
    assert.ok(p[0] > 0);
    assert.equal(p[0] + p[1], 340);
    assert.equal(p.slice(2).filter((_, i) => i % 2 === 0).length, lines);
  }
  assert.notDeepEqual(bingoPatterns[0], bingoPatterns[1]);
  assert.notDeepEqual(bingoPatterns[1], bingoPatterns[2]);
  h.play("perfect");
  const perfect = f.calls.at(-1);
  // Model the spec's normalization, which the old call-recording tests missed:
  // at most 10 entries, each capped at 10000ms, with a trailing pause ignored.
  const normalized = perfect.slice(0, 10).map((ms) => Math.min(ms, 10000));
  if (normalized.length % 2 === 0) normalized.pop();
  assert.deepEqual(normalized, perfect, "the opening rhythm survives pattern normalization");
  assert.ok(perfect.length > 1, "perfect starts with a rhythm, not a continuous hold");
  assert.ok(bingoPatterns.every((p) => p.length <= 9 && p.length % 2 === 1));
  assert.equal(f.calls.length, 8);
});

test("disabled, hidden, unactivated and unsupported devices stay quiet", () => {
  const f = hapticFixture(), h = f.createHaptics(true);
  f.createHaptics(false).play("perfect");
  f.document.hidden = true;
  h.play("perfect");
  f.document.hidden = false;
  f.navigator.userActivation.hasBeenActive = false;
  h.play("perfect");
  assert.deepEqual(f.calls, []);
  f.navigator.userActivation.hasBeenActive = true;
  h.play("perfect");
  assert.deepEqual(f.calls, [[160, 45, 100]]);
  delete f.navigator.vibrate;
  assert.doesNotThrow(() => h.play("tap"));
  f.navigator.vibrate = () => { throw new Error("blocked"); };
  assert.doesNotThrow(() => h.play("tap"));
});

test("reset/destroy only stops the vibration owned by that card", () => {
  const f = hapticFixture(), a = f.createHaptics(true), b = f.createHaptics(true);
  a.play("perfect");
  b.play("tap");
  a.stop();
  assert.equal(f.calls.length, 2);
  b.stop();
  assert.equal(f.calls.at(-1), 0);
  b.stop();
  assert.equal(f.calls.length, 3);
});

test("perfect beats follow a five-second timeline without overlapping bursts", () => {
  const { PERFECT_FIREWORKS: fireworks, PERFECT_REVEAL_MS: reveal,
    PERFECT_STAMP_DELAY_MS: stampDelay, PERFECT_STAMP_BEAT: stamp } = load("celebration", {});
  const f = hapticFixture(), h = f.createHaptics(true), cue = h.play("perfect");
  const events = [{ at: 0, beat: f.calls[0] }, { at: reveal + stampDelay, beat: stamp }, ...fireworks];
  for (const [i, event] of events.entries()) {
    assert.ok(event.beat.length <= 9 && event.beat.length % 2 === 1);
    const end = event.at + event.beat.reduce((a, b) => a + b, 0);
    if (i < events.length - 1) assert.ok(end < events[i + 1].at, "bursts leave a real pause");
    else assert.equal(end, 5000, "last firework finishes the five-second finale");
    if (i) cue(event.beat);
  }
  assert.equal(f.calls.length, events.length);
  assert.ok(new Set(fireworks.map((e) => JSON.stringify(e.beat))).size > 3, "fireworks have varied rhythms");
});

test("a newer action, cancellation or another card invalidates old firework beats", () => {
  const f = hapticFixture(), a = f.createHaptics(true), b = f.createHaptics(true);
  const cue = a.play("perfect");
  a.play("tap");
  cue([460]);
  assert.equal(f.calls.length, 2);
  const stopped = a.play("perfect");
  a.stop();
  stopped([460]);
  assert.equal(f.calls.at(-1), 0);
  const superseded = a.play("perfect");
  b.play("tap");
  const count = f.calls.length;
  superseded([460]);
  b.stop();
  superseded([460]);
  assert.equal(f.calls.length, count + 1, "stopping the newer card must not revive an old cue");
});

test("muting/cancelling stops active and scheduled audio voices", () => {
  const sources = [];
  const params = [];
  const param = () => {
    const p = { value: 0, held: [], ramps: [], cancelled: [], setValueAtTime() {}, exponentialRampToValueAtTime() {},
      cancelAndHoldAtTime(t) { this.held.push(t); }, cancelScheduledValues(t) { this.cancelled.push(t); },
      linearRampToValueAtTime(v, t) { this.ramps.push([v, t]); } };
    params.push(p);
    return p;
  };
  const node = () => ({ connect(n) { return n; }, disconnect() {} });
  const source = () => {
    const s = { ...node(), frequency: param(), starts: [], stops: [],
      start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); } };
    sources.push(s);
    return s;
  };
  class AudioContext {
    state = "running"; currentTime = 0; sampleRate = 8000; destination = node();
    createDynamicsCompressor = node;
    createGain = () => ({ ...node(), gain: param() });
    createOscillator = source;
    createBufferSource = source;
    createBiquadFilter = () => ({ ...node(), frequency: param(), Q: param() });
    createBuffer = (_, n) => ({ getChannelData: () => new Float32Array(n) });
    close = () => Promise.resolve();
  }
  let muted = false;
  const document = { hidden: false };
  const { createSound } = load("sound", { window: { AudioContext }, navigator: {}, document });
  const sound = createSound(() => muted);
  sound.bingo(2);
  assert.ok(sources.some((s) => s.starts[0] > 0));
  sound.stop();
  assert.ok(sources.every((s) => s.stops.length > 0 && s.stops.at(-1) === (s.starts[0] > 0 ? 0 : 0.01)));
  assert.ok(params.some((p) => p.held.length && p.ramps.some(([v, t]) => v === 0 && t === 0.01)));
  assert.ok(params.some((p) => p.cancelled.length));
  const count = sources.length;
  muted = true;
  sound.pop(8);
  muted = false;
  document.hidden = true;
  sound.perfect();
  assert.equal(sources.length, count);
  sound.close();
});
