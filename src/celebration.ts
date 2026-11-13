// Offsets from the winning tap. Each visual burst, boom and haptic share one callback.
export const PERFECT_REVEAL_MS = 520;
export const PERFECT_STAMP_DELAY_MS = 720;
export const PERFECT_STAMP_BEAT = [260, 45, 160] as const;
export const PERFECT_FIREWORKS = [
  { at: 1820, beat: [200] },
  { at: 2170, beat: [100, 35, 160] },
  { at: 2520, beat: [260] },
  { at: 3000, beat: [110, 40, 110] },
  { at: 3430, beat: [320] },
  { at: 3950, beat: [140, 40, 200] },
  { at: 4540, beat: [460] },
] as const;
