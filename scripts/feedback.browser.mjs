// Browser regressions for core rendering and feedback; run with npm run test:browser.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('https://**', r => r.abort());
  await page.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:12px}</style><div id="app"></div><div id="other"></div>');
  await page.addScriptTag({ path: fileURLToPath(new URL("../dist/packing-bingo.global.js", import.meta.url)) });
  await page.evaluate(() => {
    window.buzzes = [];
    window.booms = [];
    const frequencies = new WeakMap();
    const setValue = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (value, at) {
      frequencies.set(this, value);
      return setValue.call(this, value, at);
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      if (frequencies.get(this.frequency) === 90) booms.push(performance.now());
      return start.apply(this, args);
    };
    navigator.vibrate = p => { buzzes.push({ p, t: performance.now() }); return true; };
    window.card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false });
  });
  const check = async (i) => page.evaluate(i => document.querySelectorAll('#app input')[i].click(), i);
  const patterns = () => page.evaluate(() => buzzes.map(x => x.p));
  await page.locator('#app .pkb-tile').nth(0).click();
  await check(1);
  await check(4);
  assert.deepEqual(await patterns(), [90, 90, [120, 15, 100]]);
  assert.equal(await page.evaluate(() => card.getState().maxCombo), 3);
  await page.waitForTimeout(250);
  assert.equal(await page.locator('[data-r="combo"]').evaluate(e => getComputedStyle(e).opacity), '1');
  await page.evaluate(() => { card.setChecked(Array.from({ length: 16 }, (_, i) => i === 0 || i === 1)); buzzes = []; });
  await check(2);
  assert.deepEqual((await patterns()).at(-1), [140, 40, 240]);
  await check(3);
  assert.deepEqual((await patterns()).at(-1), [300, 40, 500]);
  assert.equal(await page.evaluate(() => card.getState().lines.length), 1);
  const count = await page.evaluate(() => buzzes.length);
  await page.waitForTimeout(520);
  assert.equal(await page.evaluate(() => buzzes.length), count, 'delayed bingo must not overwrite a newer buzz');
  await page.evaluate(() => { card.setChecked(Array.from({ length: 16 }, (_, i) => [0, 1, 2, 7, 11, 15].includes(i))); buzzes = []; });
  await check(3);
  assert.equal((await patterns()).at(-1).at(-1), 650, 'multi-line impact');
  assert.equal(await page.evaluate(() => card.getState().lines.length), 2);
  const doublePattern = (await patterns()).at(-1);
  // Three lines meet at square 0: top row, left column and main diagonal.
  await page.evaluate(() => { card.setChecked(Array.from({ length: 16 }, (_, i) => [1, 2, 3, 4, 8, 12, 5, 10, 15].includes(i))); buzzes = []; });
  await check(0);
  const triplePattern = (await patterns()).at(-1);
  assert.equal(await page.evaluate(() => card.getState().lines.length), 3);
  assert.notDeepEqual(triplePattern, doublePattern, 'triple bingo has its own rhythm');
  assert.equal(triplePattern.at(-1), 850);
  await page.evaluate(() => { card.setChecked(Array.from({ length: 16 }, (_, i) => i !== 15)); buzzes = []; booms = []; });
  await check(15);
  const perfectPattern = (await patterns()).at(-1);
  assert.ok(perfectPattern[0] > 0, 'perfect starts on winning input');
  assert.deepEqual(perfectPattern, [160, 45, 100], 'perfect opens with two short hits');
  await page.waitForTimeout(5150);
  const finale = await page.evaluate(() => ({ buzzes, booms }));
  const beats = finale.buzzes.slice(1);
  assert.deepEqual(beats.map((b) => b.p), [[260, 45, 160], [200], [100, 35, 160], [260], [110, 40, 110], [320], [140, 40, 200], [460]]);
  assert.equal(finale.booms.length, beats.length, 'each stamp/firework boom gets exactly one haptic beat');
  beats.forEach((b, i) => assert.ok(Math.abs(b.t - finale.booms[i]) < 50, 'boom and haptic fire in the same callback'));
  const last = beats.at(-1);
  assert.ok(Math.abs(last.t - finale.buzzes[0].t + last.p[0] - 5000) < 150, 'final hit ends about five seconds after winning');
  await page.evaluate(() => card.reset());
  assert.equal((await patterns()).at(-1), 0);
  assert.equal(await page.locator('.pkb-squash,.pkb-hop,.pkb-ring,.pkb-float').count(), 0);
  await page.waitForTimeout(700);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 0);
  // A second card owns the latest pattern; resetting the first must not cancel it.
  await page.evaluate(() => {
    window.second = PackingBingo.createPackingBingo(document.getElementById('other'), { storageKey: null, ready: false });
    card.shuffle();
    second.shuffle();
    buzzes = [];
    card.reset();
  });
  assert.deepEqual(await patterns(), []);
  await page.evaluate(() => { second.destroy(); card.destroy(); buzzes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, vibrate: false, sound: false }); });
  await check(0);
  assert.deepEqual(await patterns(), []);
  assert.equal(await page.locator('#app input[switch]').count(), 0);
  await page.evaluate(() => { card.destroy(); delete navigator.vibrate; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false }); });
  await check(0);
  assert.equal(await page.locator('#app input[switch]').count(), 16);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { card.destroy(); navigator.vibrate = p => { buzzes.push({ p }); return true; }; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, defaultChecked: Array.from({ length: 16 }, (_, i) => i !== 15) }); buzzes = []; });
  await check(15);
  assert.deepEqual(await patterns(), [[160, 45, 100]], 'reduced visual motion keeps the haptic rhythm');
  assert.equal(await page.locator('.pkb-stamp').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false }); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
  }
  // Existing controlled state and keyboard activation still animate only accepted changes.
  await page.evaluate(() => { card.destroy(); buzzes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, controlled: true, onChange: next => card.setChecked(next, { animate: true }) }); });
  await page.locator('#app input').first().focus();
  await page.keyboard.press('Space');
  assert.equal(await page.evaluate(() => card.getState().checked[0]), true);
  assert.equal((await patterns()).at(-1), 90);
  // Winning stamps must survive line hops and the perfect wave.
  const hasStampHit = (index) => page.locator('#app .pkb-stamp').nth(index).evaluate((el) => el.getAnimations().some((animation) => animation.animationName === 'pkb-stamp-hit'));
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, (_, i) => [1, 2, 3].includes(i))));
  await check(0);
  await page.waitForTimeout(80);
  assert.ok(await hasStampHit(0), 'bingo hop must not cancel the stamp');
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, (_, i) => i !== 0)));
  await check(0);
  await page.waitForTimeout(80);
  assert.ok(await hasStampHit(0), 'perfect wave must not cancel the stamp');
  const visibility = (hidden) => page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  const assertFinalStats = async () => {
    assert.deepEqual(await page.evaluate(() => [
      document.querySelector('[data-r="sScore"]').textContent,
      document.querySelector('[data-r="sCombo"]').textContent,
      document.querySelector('[data-r="sBingo"]').textContent,
    ]), await page.evaluate(() => {
      const s = card.getState();
      return [s.score.toLocaleString(), '×' + s.maxCombo, String(s.lines.length)];
    }));
  };
  // Hide before the result opens: finish the results without playing a queued finale.
  await visibility(true);
  assert.equal((await patterns()).at(-1), 0);
  await page.waitForTimeout(700);
  await visibility(false);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 1);
  await assertFinalStats();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.r), 'close');
  await page.locator('[data-r="close"]').click();
  await visibility(true);
  await visibility(false);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 0, 'dismissed results stay dismissed');
  // Hide while the results are counting: keep the result and settle the counters.
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, (_, i) => i !== 15)));
  await check(15);
  await page.waitForTimeout(1400);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 1);
  await visibility(true);
  await visibility(false);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 1);
  await assertFinalStats();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.r), 'close');
  // Restored completed progress does not invent a new result dialog on visibility changes.
  await page.evaluate(() => { card.setChecked(Array(16).fill(false)); card.setChecked(Array(16).fill(true)); });
  await visibility(true);
  await visibility(false);
  assert.equal(await page.locator('.pkb-perfect.pkb-show').count(), 0);
  // Start screen: gray "Are you ready?" over the squares, 3-2-1 countdown, then the stopwatch.
  await page.evaluate(() => {
    card.destroy(); buzzes = []; window.perfects = [];
    card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, onPerfect: e => perfects.push(e) });
  });
  const watchText = () => page.locator('#app [data-r="watch"]').textContent();
  assert.equal(await page.locator('#app .pkb-ready:not([hidden])').count(), 1, 'start screen is up');
  assert.equal(await page.locator('#app .pkb-grid[inert]').count(), 1, 'squares wait for the countdown');
  assert.equal(await watchText(), '0:00.0');
  await page.locator('#app [data-r="snd"]').click();
  await page.locator('#app [data-r="snd"]').click();
  assert.equal(await page.locator('#app .pkb-ready:not(.pkb-counting)').count(), 1, 'the sound button stays usable');
  await page.locator('#app .pkb-ready').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#app [data-r="count"]').textContent(), '3');
  assert.deepEqual(await patterns(), [60], 'the first beat plays on the tap itself');
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#app [data-r="count"]').textContent(), '2');
  assert.equal(await page.evaluate(() => card.getState().time), 0, 'no timing during the countdown');
  await page.waitForTimeout(2000);
  assert.deepEqual(await patterns(), [60, 60, 60, 260]);
  assert.equal(await page.locator('#app .pkb-grid[inert]').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.type), 'checkbox', 'keyboard focus moves to the squares');
  await page.waitForTimeout(800);
  assert.equal(await page.locator('#app .pkb-ready[hidden]').count(), 1);
  assert.ok(await page.evaluate(() => card.getState().time) >= 700, 'stopwatch runs');
  assert.notEqual(await watchText(), '0:00.0');
  await page.locator('#app .pkb-tile').nth(0).click();
  assert.equal(await page.evaluate(() => card.getState().checked[0]), true);
  for (let i = 1; i < 16; i++) await check(i);
  const stopped = await page.evaluate(() => card.getState().time);
  assert.equal(await page.evaluate(() => perfects[0].time), stopped, 'onPerfect gets the finishing time');
  const speed = await page.evaluate(() => perfects[0].speedBonus);
  assert.ok(Math.abs(speed - 16e6 / stopped) <= 16e6 / stopped * 0.001 + 1, `speed bonus is 1000 per item per second (${speed} for ${stopped} ms)`);
  assert.equal(await page.evaluate(() => PackingBingo.speedBonus(16, 4000)), 4000);
  assert.equal(await page.evaluate(() => PackingBingo.speedBonus(16, 2000)), 8000, 'no ceiling: half the time, twice the bonus');
  assert.ok(await page.evaluate(() => perfects[0].score) >= 1000 + speed, 'the score includes it');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => card.getState().time), stopped, 'stopwatch stops on a complete card');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#app [data-r="ptime"]:not([hidden])').count(), 1, 'perfect card shows the time');
  await page.evaluate(() => card.reset());
  assert.equal(await page.locator('#app .pkb-ready:not([hidden]):not(.pkb-counting)').count(), 1, 'reset brings back the start screen');
  assert.equal(await watchText(), '0:00.0');
  // Resetting mid-countdown cancels it.
  await page.locator('#app .pkb-ready').click();
  await page.locator('#app [data-r="reset"]').click();
  await page.waitForTimeout(3200);
  assert.equal(await page.evaluate(() => card.getState().time), 0);
  assert.equal(await page.locator('#app .pkb-grid[inert]').count(), 1);
  // A controlled reset waits for the parent: a rejected one keeps the game and clock running.
  await page.evaluate(() => {
    card.destroy(); window.accept = false;
    card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, controlled: true,
      onChange: next => (accept || next.some(Boolean)) && card.setChecked(next, { animate: true }) });
  });
  await page.locator('#app .pkb-ready').click();
  await page.waitForTimeout(3100);
  await check(0);
  await page.evaluate(() => card.reset());
  assert.equal(await page.locator('#app .pkb-grid[inert]').count(), 0, 'rejected controlled reset keeps playing');
  assert.ok(await page.evaluate(() => card.getState().time) > 0);
  await page.evaluate(() => { accept = true; card.reset(); });
  assert.equal(await page.locator('#app .pkb-ready:not([hidden])').count(), 1, 'accepted controlled reset restarts');
  assert.equal(await page.evaluate(() => card.getState().time), 0);
  // Without the start screen, the first tap starts the stopwatch; demo buttons skip the countdown.
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false }); });
  assert.equal(await page.locator('#app .pkb-ready').count(), 0);
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => card.getState().time), 0);
  await check(0);
  await page.waitForTimeout(150);
  assert.ok(await page.evaluate(() => card.getState().time) > 0);
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, demo: true }); });
  await page.locator('#app [data-r="dB"]').click();
  assert.equal(await page.locator('#app .pkb-ready[hidden]').count(), 1);
  await page.waitForTimeout(150);
  assert.ok(await page.evaluate(() => card.getState().time) > 0);
  // By default a stamped square stays stamped on a tap, a click or Space; reset still clears it.
  await page.evaluate(() => { card.destroy(); window.changes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, onChange: c => changes.push(c) }); });
  await page.locator('#app .pkb-tile').nth(0).click();
  assert.equal(await page.evaluate(() => card.getState().checked[0]), true);
  assert.equal(await page.locator('#app .pkb-tile').nth(0).evaluate(t => t.classList.contains('pkb-lock')), true);
  assert.equal(await page.locator('#app input').nth(0).getAttribute('aria-readonly'), 'true');
  await page.locator('#app .pkb-tile').nth(0).click();
  await check(0);
  await page.locator('#app input').nth(0).focus();
  await page.keyboard.press('Space');
  assert.equal(await page.evaluate(() => card.getState().checked[0]), true, 'a stamped square cannot be tapped off');
  assert.equal(await page.locator('#app input').nth(0).evaluate(x => x.checked), true);
  assert.equal(await page.evaluate(() => changes.length), 1, 'no change is requested');
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, () => false)));
  assert.equal(await page.locator('#app .pkb-lock').count(), 0);
  assert.equal(await page.locator('#app input[aria-readonly]').count(), 0);
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, controlled: true, onChange: next => { changes.push(next); card.setChecked(next, { animate: true }); } }); changes = []; });
  await check(1);
  await check(1);
  assert.equal(await page.evaluate(() => card.getState().checked[1]), true);
  assert.equal(await page.evaluate(() => changes.length), 1, 'controlled card only asks to stamp');
  // uncheck: true takes the stamp off on a second tap.
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, uncheck: true }); });
  await check(0);
  await check(0);
  assert.equal(await page.evaluate(() => card.getState().checked[0]), false);
  assert.equal(await page.locator('#app .pkb-lock').count(), 0);
  // Infinite mode: completed lines clear after their celebration; the packing card is untouched.
  await page.evaluate(() => {
    card.destroy(); buzzes = []; window.changes = []; window.modes = []; window.bingos = []; window.perfects = []; window.writes = [];
    const data = { k: JSON.stringify(Array.from({ length: 16 }, (_, i) => i === 5)) };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: (key) => (key in data ? data[key] : null),
      setItem: (key, value) => { writes.push(key); data[key] = String(value); },
      removeItem: (key) => { delete data[key]; },
    } });
    window.stored = data;
    card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: 'k', ready: false,
      onChange: c => changes.push(c), onModeChange: m => modes.push(m), onBingo: e => bingos.push(e), onPerfect: e => perfects.push(e) });
  });
  const state = () => page.evaluate(() => card.getState());
  const radio = (m) => page.locator(`#app [data-m="${m}"]`);
  assert.equal(await radio('normal').getAttribute('aria-checked'), 'true');
  assert.equal((await state()).checked[5], true, 'packing progress loads in the normal mode');
  const packedOrder = (await state()).order;
  await radio('infinite').click();
  await page.evaluate(() => { writes = []; });
  assert.deepEqual(await page.evaluate(() => modes), ['infinite']);
  assert.equal(await radio('infinite').getAttribute('aria-checked'), 'true');
  assert.equal(await page.locator('#app .pkb.pkb-inf').count(), 1);
  assert.equal(await page.locator('#app .pkb-mfx.pkb-show').count(), 1, 'the takeover plays');
  assert.deepEqual((await patterns()).at(-1), [25, 30, 35, 30, 45, 30, 220], 'the switch has its own haptic');
  let s = await state();
  assert.equal(s.mode, 'infinite');
  assert.equal(s.checked.some(Boolean), false, 'the infinite game starts empty');
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('#app .pkb-mfx.pkb-show').count(), 0, 'the takeover ends by itself');
  for (const i of [0, 1, 2, 3]) await check(i);
  s = await state();
  assert.deepEqual(s.lines, [0]);
  assert.equal(s.cleared, 1);
  assert.equal(s.score, 10 + 20 + 30 + 40 + 100);
  assert.equal(await page.evaluate(() => bingos.at(-1).mode), 'infinite');
  assert.equal(await page.locator('#app .pkb-lock').count(), 4, 'squares about to clear stay stamped');
  await page.waitForTimeout(1250);
  s = await state();
  assert.deepEqual([s.lines, s.checked.some(Boolean), s.cleared, s.complete], [[], false, 1, false], 'the line cleared');
  assert.equal(await page.locator('#app [data-r="bng"]').textContent(), '1', 'BINGO keeps counting cleared lines');
  const before = s.score;
  for (const i of [0, 1, 2, 3]) await check(i);
  s = await state();
  assert.ok(s.score >= before + 4 * 10 + 100, 'the same squares and line score again');
  assert.equal(await page.evaluate(() => bingos.at(-1).totalLines), 2);
  // Hiding the tab clears a due line at once, so the game is never left with a complete line.
  await visibility(true);
  s = await state();
  assert.deepEqual([s.lines, s.checked.some(Boolean)], [[], false]);
  await visibility(false);
  // Neither taps nor shuffles are reported or saved; setChecked goes to the packing card.
  await page.evaluate(() => card.shuffle());
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, (_, i) => i === 9)));
  assert.equal((await state()).checked[9], false, 'setChecked does not change the infinite game');
  assert.deepEqual((await state()).packing.checked, Array.from({ length: 16 }, (_, i) => i === 9), 'getState().packing shows the packing card');
  assert.deepEqual(await page.evaluate(() => [changes.length, writes]), [0, ['k']], 'only setChecked saved');
  assert.deepEqual(await page.evaluate(() => perfects), []);
  // Arrow keys move between the two choices; the packing card comes back as it was.
  await radio('infinite').focus();
  await page.keyboard.press('ArrowLeft');
  s = await state();
  assert.equal(s.mode, 'normal');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.m), 'normal');
  assert.deepEqual(s.checked, Array.from({ length: 16 }, (_, i) => i === 9));
  assert.deepEqual(s.order, packedOrder, 'the packing arrangement is back');
  assert.equal(s.cleared, 0);
  assert.equal(s.packing, null);
  assert.deepEqual(await page.evaluate(() => modes), ['infinite', 'normal']);
  assert.deepEqual((await patterns()).at(-1), [50, 70, 160]);
  // A full board in the infinite mode is never a perfect card (on 2×2, any two squares make a line).
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, size: 2, mode: 'infinite', uncheck: true, onPerfect: e => perfects.push(e) }); });
  for (const i of [0, 1, 2, 3]) await check(i);
  await check(0); // with uncheck: true, a square about to clear still cannot be taken off
  assert.equal((await state()).checked[0], true);
  await page.waitForTimeout(1300);
  s = await state();
  assert.equal(s.checked.some(Boolean), false);
  assert.deepEqual(await page.evaluate(() => perfects), []);
  // Taps elsewhere and refresh() must not push a due clear back. 3×3 with FREE: the middle row is items 3 and 4.
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, mode: 'infinite', size: 3, free: true }); });
  await check(3);
  await check(4);
  assert.deepEqual((await state()).lines, [1], 'a line through the FREE center');
  for (const i of [0, 2, null, null]) {
    await page.waitForTimeout(300);
    if (i !== null) await check(i); // neither completes a line
    await page.evaluate(() => card.refresh());
  }
  s = await state();
  assert.deepEqual([s.checked[3], s.checked[4], s.checked[0], s.checked[2], s.lines, s.cleared], [false, false, true, true, [], 1], 'the line cleared on time');
  // A controlled card plays the infinite game by itself, without asking the parent.
  await page.evaluate(() => { card.destroy(); changes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, controlled: true, mode: 'infinite', onChange: c => changes.push(c) }); });
  await check(0);
  assert.deepEqual([(await state()).checked[0], await page.evaluate(() => changes.length)], [true, 0]);
  // The switch stays usable above the start screen; reset starts a new infinite game.
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, mode: 'infinite' }); });
  assert.equal(await page.locator('#app .pkb-ready-b').isVisible(), true, 'the start screen shows the infinite badge');
  assert.equal(await page.locator('#app .pkb-ready-r').isVisible(), true, 'and the rule');
  await radio('normal').click();
  await radio('infinite').click();
  assert.equal((await state()).mode, 'infinite');
  await page.locator('#app .pkb-ready').click();
  await page.waitForTimeout(3100);
  await check(0);
  await page.locator('#app [data-r="reset"]').click();
  s = await state();
  assert.deepEqual([s.mode, s.checked.some(Boolean), s.score, s.time], ['infinite', false, 0, 0]);
  assert.equal(await page.locator('#app .pkb-ready:not([hidden])').count(), 1);
  // 🏁 FINISH ends a running infinite game: results, a locked board, and "play again".
  const fin = page.locator('#app [data-r="fin"]');
  await page.evaluate(() => { card.destroy(); window.fins = []; buzzes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false, onFinish: e => fins.push(e) }); });
  assert.equal(await fin.isVisible(), false, 'no FINISH in the normal mode');
  await page.evaluate(() => card.finish());
  assert.equal((await state()).finished, false);
  await page.evaluate(() => card.setMode('infinite'));
  assert.deepEqual([await fin.isVisible(), await fin.isDisabled()], [true, true], 'FINISH waits for the game to start');
  for (const i of [0, 1, 2, 3, 5]) await check(i);
  assert.equal(await fin.isDisabled(), false);
  await page.waitForTimeout(300); // the row is still about to clear
  await fin.click();
  s = await state();
  const fe = await page.evaluate(() => fins[0]);
  assert.deepEqual([s.finished, s.lines, s.checked.filter(Boolean).length], [true, [], 1], 'a due clear settles first');
  assert.deepEqual(fe, { score: s.score, maxCombo: 5, lines: 1, time: s.time });
  assert.equal(s.score, 10 + 20 + 30 + 40 + 100 + 50);
  assert.deepEqual((await patterns()).at(-1), [120, 40, 120, 40, 320]);
  assert.equal(await page.locator('#app .pkb-perfect.pkb-show.pkb-fin').count(), 1, 'the results open at once');
  assert.equal(await page.locator('#app [data-r="ptitle"]').textContent(), 'フィニッシュ！');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.r), 'again');
  assert.deepEqual([await page.locator('#app .pkb-grid[inert]').count(), await fin.isDisabled(), await page.locator('#app [data-r="shuf"]').isDisabled()], [1, true, true], 'the finished board is locked');
  const order0 = s.order;
  await page.evaluate(() => card.shuffle());
  await page.waitForTimeout(300);
  s = await state();
  assert.deepEqual([s.order, s.time], [order0, fe.time], 'nothing moves after the finish');
  await visibility(true);
  await visibility(false);
  assert.deepEqual(await page.evaluate(() => ['sScore', 'sCombo', 'sBingo'].map(r => document.querySelector(`#app [data-r="${r}"]`).textContent)), [fe.score.toLocaleString(), '×5', '1'], 'results settle when the tab is hidden');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.r), 'again');
  await page.locator('#app [data-r="again"]').click();
  s = await state();
  assert.deepEqual([s.mode, s.finished, s.score, s.cleared, s.checked.some(Boolean), s.time], ['infinite', false, 0, 0, false, 0], 'play again starts a new infinite game');
  assert.deepEqual([await page.locator('#app .pkb-perfect.pkb-show').count(), await page.locator('#app .pkb-grid[inert]').count()], [0, 0]);
  // FINISH, then back to the packing card: it must be playable again, partial or complete.
  for (const packed of [[3, 7], Array.from({ length: 16 }, (_, i) => i)]) {
    const complete = packed.length === 16;
    await page.evaluate((packed) => { card.destroy(); fins = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, defaultChecked: Array.from({ length: 16 }, (_, i) => packed.includes(i)), onFinish: e => fins.push(e) }); }, packed);
    await page.evaluate(() => card.finish()); // normal mode: nothing
    await page.evaluate(() => card.setMode('infinite'));
    await page.evaluate(() => card.finish()); // start screen still up: nothing
    await page.locator('#app .pkb-ready').click();
    await page.evaluate(() => card.finish()); // counting down: nothing
    await page.waitForTimeout(3100);
    await check(0);
    await page.evaluate(() => { card.finish(); card.finish(); });
    assert.equal(await page.evaluate(() => fins.length), 1, 'FINISH only ends a running game, and only once');
    await page.evaluate(() => card.setMode('normal'));
    s = await state();
    assert.deepEqual([s.mode, s.finished, s.time, s.checked.filter(Boolean).length], ['normal', false, 0, packed.length]);
    assert.deepEqual([await page.locator('#app .pkb-over').count(), await page.locator('#app [data-r="shuf"]').isDisabled(), await page.locator('#app [data-r="watch"].pkb-done').count()], [0, false, 0], 'nothing of the finished game is left');
    assert.equal(await page.locator('#app .pkb-ready:not([hidden])').count(), complete ? 0 : 1, 'a partial card waits on the start screen, a complete one does not');
    assert.equal(await page.locator('#app .pkb-grid[inert]').count(), complete ? 0 : 1);
    if (!complete) {
      await page.locator('#app .pkb-ready').click();
      await page.waitForTimeout(3100);
      await check(0);
      assert.equal((await state()).checked[0], true, 'the packing card can be played again');
    }
  }
  await page.evaluate(() => { card.destroy(); card.finish(); });
  assert.equal(await page.evaluate(() => fins.length), 1);
  await page.evaluate(() => { card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, ready: false }); });
  // The shared results card goes back to the perfect card in the normal mode.
  await page.evaluate(() => card.setMode('normal'));
  await page.evaluate(() => card.setChecked(Array.from({ length: 16 }, (_, i) => i !== 15)));
  await check(15);
  await page.waitForTimeout(700);
  assert.equal(await page.locator('#app [data-r="ptitle"]').textContent(), 'パーフェクト！');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.r), 'close', 'the perfect card takes focus when it opens');
  assert.deepEqual([await page.locator('#app .pkb-perfect.pkb-fin').count(), await page.locator('#app [data-r="again"]').isVisible()], [0, false]);
  await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, modeSwitch: false }); });
  assert.equal(await page.locator('#app .pkb-mode').count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: start screen, countdown and stopwatch; stamps stay stamped (uncheck: true opts out); infinite mode and the mode switch; feedback patterns, combo, ownership, reset/shuffle/destroy, controlled keyboard, reduced motion, layouts, winning stamp, and persistent perfect results; no browser errors.');
}
finally {
  await browser.close();
}
