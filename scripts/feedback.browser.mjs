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
    window.card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null });
  });
  const check = async (i) => page.evaluate(i => document.querySelectorAll('#app input')[i].click(), i);
  const patterns = () => page.evaluate(() => buzzes.map(x => x.p));
  await page.locator('#app .pkb-tile').nth(0).click();
  if (await page.locator('#app dialog[open]').count()) {
    await page.locator('#app .pkb-play-start').click();
    await page.waitForTimeout(30);
    await page.locator('#app .pkb-tile').nth(0).click();
  }
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
    window.second = PackingBingo.createPackingBingo(document.getElementById('other'), { storageKey: null });
    card.shuffle();
    second.shuffle();
    buzzes = [];
    card.reset();
  });
  assert.deepEqual(await patterns(), []);
  await page.evaluate(() => { second.destroy(); card.destroy(); buzzes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, vibrate: false, sound: false }); });
  await check(0);
  assert.deepEqual(await patterns(), []);
  assert.equal(await page.locator('#app input[switch]').count(), 0);
  await page.evaluate(() => { card.destroy(); delete navigator.vibrate; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null }); });
  await check(0);
  assert.equal(await page.locator('#app input[switch]').count(), 16);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { card.destroy(); navigator.vibrate = p => { buzzes.push({ p }); return true; }; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, defaultChecked: Array.from({ length: 16 }, (_, i) => i !== 15) }); buzzes = []; });
  await check(15);
  assert.deepEqual(await patterns(), [[160, 45, 100]], 'reduced visual motion keeps the haptic rhythm');
  assert.equal(await page.locator('.pkb-stamp').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.evaluate(() => { card.destroy(); card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null }); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
  }
  // Existing controlled state and keyboard activation still animate only accepted changes.
  await page.evaluate(() => { card.destroy(); buzzes = []; card = PackingBingo.createPackingBingo(document.getElementById('app'), { storageKey: null, controlled: true, onChange: next => card.setChecked(next, { animate: true }) }); });
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
  assert.deepEqual(errors, []);
  console.log('PASS: feedback patterns, combo, ownership, reset/shuffle/destroy, controlled keyboard, reduced motion, layouts, winning stamp, and persistent perfect results; no browser errors.');
}
finally {
  await browser.close();
}
