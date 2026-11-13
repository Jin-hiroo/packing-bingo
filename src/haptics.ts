// One pattern per action: a delayed celebration must never replace a newer tap's buzz.
// iOS uses the real switch input's system haptic instead (see core's template).
let owner: object | null = null;

export type HapticMoment = "tap" | "off" | "reach" | "bingo" | "perfect" | "shuffle";

export function createHaptics(enabled: boolean) {
  const token = {};
  let generation = 0;
  const stop = () => {
    generation++;
    if (owner !== token) return;
    owner = null;
    try { navigator.vibrate?.(0); } catch { /* unsupported or blocked */ }
  };
  const send = (pattern: number | number[]) => {
    if (!enabled || document.hidden || typeof navigator.vibrate !== "function") return false;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;
    try {
      if (navigator.vibrate(pattern)) {
        owner = token;
        return true;
      }
    } catch { /* unsupported or blocked: visuals and sound still work */ }
    return false;
  };
  return {
    play(moment: HapticMoment, combo = 1, lines = 1, impactAt = 360) {
      const current = ++generation;
      const tier = Math.min(3, Math.floor(combo / 3));
      // Keep patterns below the spec's 10-entry limit. Reduced motion controls visual
      // animation, not vibration; `vibrate: false` explicitly disables haptics.
      const lead = Math.max(80, impactAt - 40);
      const pattern = moment === "off" ? 35 :
        moment === "perfect" ? [160, 45, 100] :
        moment === "bingo" ? (lines >= 3
          ? [lead, 40, 500, 50, 650, 50, 850]
          : lines === 2 ? [lead, 40, 500, 50, 650]
          : [lead, 40, 500]) :
        moment === "reach" ? [140, 40, 240] :
        moment === "shuffle" ? [90, 35, 90, 35, 220] :
        tier ? [100 + tier * 20, 15, 80 + tier * 20] : 90;
      if (!send(pattern)) return;
      // Only this play may add synchronized beats. A newer action, stop, or another
      // card taking ownership invalidates it, so old fireworks cannot steal a tap.
      return (beat: readonly number[]) => {
        if (generation === current && owner === token) send([...beat]);
      };
    },
    stop,
  };
}
