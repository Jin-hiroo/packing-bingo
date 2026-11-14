// All rules are scoped under .pkb and every class/keyframe is prefixed, so the component
// can sit inside any site without leaking styles. Layout reacts to the component's own
// width (container queries), not the viewport, so it also fits narrow columns on desktop.
// Theme from outside with --pkb-sun, --pkb-ink, --pkb-paper, --pkb-red, --pkb-mint.
// The card sets --pk-n (squares per side), --pk-s (type scale) and --pk-d (spacing scale) on
// .pkb; both scales are 1 on a 4×4 card, so the sizes below are the 4×4 ones.
// The fonts (Dela Gothic One, M PLUS Rounded 1c) are used if the page loads them; the package
// itself never fetches anything, so it carries no external URLs.

export const CSS = `
.pkb{--pk-sun:var(--pkb-sun,#FFD54F);--pk-ink:var(--pkb-ink,#2A1F14);--pk-paper:var(--pkb-paper,#FFFDF6);--pk-red:var(--pkb-red,#E8473B);--pk-mint:var(--pkb-mint,#BDEBD2);--pk-display:"Dela Gothic One",var(--pkb-font-fallback,sans-serif);--pk-body:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN",var(--pkb-font-fallback,sans-serif);--pk-n:4;--pk-s:1;--pk-d:1;container-type:inline-size;isolation:isolate;width:100%}
.pkb,.pkb *{box-sizing:border-box;margin:0;padding:0}
.pkb-board{position:relative;overflow:hidden;max-width:720px;margin:0 auto;padding:22px 26px 20px;border-radius:24px;background-color:var(--pk-sun);background-image:radial-gradient(rgba(42,31,20,.12) 1.3px,transparent 1.6px);background-size:16px 16px;border:2.5px solid var(--pk-ink);color:var(--pk-ink);font-family:var(--pk-body);line-height:1.4;text-align:left}
.pkb-board.pkb-shake{animation:pkb-shake .45s cubic-bezier(.36,.07,.19,.97)}
@keyframes pkb-shake{10%,90%{transform:translate(-1px,1px)}20%,80%{transform:translate(3px,-2px)}30%,50%,70%{transform:translate(-6px,2px)}40%,60%{transform:translate(6px,-1px)}}
.pkb-board.pkb-punch{animation:pkb-punch .4s cubic-bezier(.3,1.6,.5,1)}
@keyframes pkb-punch{30%{transform:scale(1.018)}}
.pkb-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 16px;margin-bottom:18px}
.pkb-tags{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pkb-kicker{display:inline-block;background:var(--pk-ink);color:var(--pk-sun);font-weight:800;font-size:11px;letter-spacing:.14em;padding:4px 10px;border-radius:999px}
.pkb-kicker:empty{display:none}
.pkb-kicker.pkb-gold{color:#fff;background:linear-gradient(90deg,#E8473B,#FF9F1C,#1FA971,#2F6FED,#E8473B);background-size:200% 100%;animation:pkb-rb 2s linear infinite}
@keyframes pkb-rb{to{background-position:-200% 0}}
.pkb button{font-family:var(--pk-body)}
.pkb-snd{appearance:none;border:2px solid var(--pk-ink);background:var(--pk-paper);border-radius:999px;padding:2px 9px;font-weight:800;font-size:11px;line-height:1.4;color:var(--pk-ink);cursor:pointer}
.pkb-watch{display:inline-block;min-width:5.4em;padding:3px 10px 2px;border-radius:999px;background:var(--pk-ink);color:var(--pk-paper);font-family:var(--pk-display);font-size:13px;line-height:1.3;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:.03em}
.pkb-watch::before{content:"⏱ ";font-family:var(--pk-body)}
.pkb-watch.pkb-run{color:var(--pk-sun)}
.pkb-watch.pkb-done{background:var(--pk-red);color:#fff}
.pkb-title{font-family:var(--pk-display);font-weight:400;font-size:34px;line-height:1.15;margin-top:8px;letter-spacing:.02em;color:inherit}
.pkb-sub{font-weight:800;font-size:13px;margin-top:4px;word-break:auto-phrase}
.pkb-side{display:flex;flex-direction:column;gap:8px;flex:none}
.pkb-score{display:flex;gap:10px}
.pkb-pill{min-width:78px;background:var(--pk-paper);border:2.5px solid var(--pk-ink);border-radius:14px;padding:6px 10px 5px;text-align:center;box-shadow:3px 3px 0 var(--pk-ink)}
.pkb-pill.pkb-sc{min-width:100px}
.pkb-pill small{display:block;font-size:10px;font-weight:800;letter-spacing:.12em}
.pkb-pill b{display:block;font-family:var(--pk-display);font-weight:400;font-size:24px;line-height:1.15;font-variant-numeric:tabular-nums}
.pkb-pill.pkb-hot{background:var(--pk-red);color:#fff;animation:pkb-wob .5s ease}
@keyframes pkb-wob{40%{transform:scale(1.15) rotate(-4deg)}}
.pkb-bump{animation:pkb-bump .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes pkb-bump{40%{transform:scale(1.18)}}
.pkb-combo{display:flex;align-items:center;gap:8px;height:18px;opacity:0;transform:translateY(-4px);transition:opacity .2s,transform .2s}
.pkb-combo.pkb-on{opacity:1;transform:none}
.pkb-combo b{font-family:var(--pk-display);font-weight:400;font-size:13px;color:var(--pk-red);white-space:nowrap}
.pkb-bar{flex:1;height:9px;border:2px solid var(--pk-ink);border-radius:999px;background:var(--pk-paper);overflow:hidden}
.pkb-bar i{display:block;height:100%;background:var(--pk-red);transform-origin:left}
.pkb-combo.pkb-on .pkb-bar i.pkb-draining{animation:pkb-drain 2.5s linear forwards}
@keyframes pkb-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.pkb-gw{position:relative}
.pkb-grid{display:grid;grid-template-columns:repeat(var(--pk-n),minmax(0,1fr));gap:calc(12px*var(--pk-d))}
.pkb-tile{position:relative;min-width:0;place-self:stretch;aspect-ratio:1/.82;background:var(--pk-paper);border:2.5px solid var(--pk-ink);border-radius:calc(16px*var(--pk-d));box-shadow:4px 4px 0 var(--pk-ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(6px*var(--pk-d));cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .1s,box-shadow .1s,background-color .25s}
.pkb-tile:active:not(.pkb-free):not(.pkb-lock){transform:translate(3px,3px);box-shadow:1px 1px 0 var(--pk-ink)}
.pkb-tile input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
.pkb-tile:has(input:focus-visible){outline:3px solid var(--pk-ink);outline-offset:3px}
.pkb-emo{font-size:max(14px,calc(32px*var(--pk-s)));line-height:1;transition:opacity .2s}
.pkb-lbl{font-weight:800;font-size:max(9px,calc(13px*var(--pk-s)));line-height:1.25;text-align:center;padding:0 calc(6px*var(--pk-d));transition:opacity .2s;word-break:keep-all;overflow-wrap:anywhere}
.pkb-stamp{position:absolute;left:50%;top:50%;width:64%;aspect-ratio:1;border-radius:50%;border:3px solid var(--pk-red);box-shadow:inset 0 0 0 2px var(--pk-paper),inset 0 0 0 4px var(--pk-red);color:var(--pk-red);display:grid;place-items:center;font-family:var(--pk-display);font-size:max(9px,calc(20px*var(--pk-s)));letter-spacing:.04em;opacity:0;transform:translate(-50%,-50%) rotate(-16deg) scale(1.7);transition:transform .25s cubic-bezier(.3,1.5,.5,1),opacity .15s;pointer-events:none}
.pkb-tile.pkb-on .pkb-stamp{opacity:.9;transform:translate(-50%,-50%) rotate(-16deg) scale(1)}
.pkb-tile.pkb-on .pkb-emo,.pkb-tile.pkb-on .pkb-lbl{opacity:.35}
.pkb-tile.pkb-lock{cursor:default}
.pkb-tile.pkb-free{cursor:default;container-type:inline-size}
.pkb-tile.pkb-free .pkb-stamp{width:72%;opacity:1;transition:none;font-size:17cqi;letter-spacing:.02em;line-height:1;text-align:center;background:var(--pk-red);color:var(--pk-paper);border-color:var(--pk-red);box-shadow:inset 0 0 0 2px var(--pk-red),inset 0 0 0 4px var(--pk-paper)}
.pkb-tile.pkb-line{background-color:var(--pk-mint)}
.pkb-tile.pkb-line::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.9) 45%,transparent 60%) no-repeat;background-size:250% 100%;background-position:200% 0;animation:pkb-glint 3.2s ease-in-out var(--pkb-gd,0s) infinite}
@keyframes pkb-glint{0%{background-position:200% 0}30%,100%{background-position:-100% 0}}
.pkb-tile.pkb-reach{border-style:dashed;animation:pkb-aura 1.1s ease-in-out infinite}
@keyframes pkb-aura{50%{box-shadow:4px 4px 0 var(--pk-ink),0 0 0 7px rgba(232,71,59,.35)}}
.pkb-tile.pkb-reach::after{content:attr(data-reach);position:absolute;top:-11px;right:-8px;z-index:3;background:var(--pk-red);color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.06em;padding:3px 8px;border-radius:999px;border:2px solid var(--pk-ink);transform:rotate(6deg);animation:pkb-bob 1.1s ease-in-out infinite}
@keyframes pkb-bob{50%{transform:rotate(6deg) translateY(-4px)}}
.pkb-tile.pkb-squash{z-index:1;animation:pkb-squash .38s cubic-bezier(.16,1,.3,1)}
@keyframes pkb-squash{0%{transform:translate(3px,4px) scale(calc(.9 - var(--pkb-impact,0)*.018));box-shadow:0 0 0 var(--pk-ink)}38%{transform:translateY(calc(-2px - var(--pkb-impact,0)*1px)) scale(calc(1.045 + var(--pkb-impact,0)*.012))}70%{transform:translateY(1px) scale(.985)}100%{transform:none}}
.pkb-tile.pkb-on .pkb-stamp.pkb-hit{animation:pkb-stamp-hit .32s cubic-bezier(.16,1,.3,1) both}
@keyframes pkb-stamp-hit{0%{opacity:0;transform:translate(-50%,-50%) rotate(-26deg) scale(2.1)}28%{opacity:1;transform:translate(-50%,-50%) rotate(-12deg) scale(.88)}52%{transform:translate(-50%,-50%) rotate(-18deg) scale(1.08)}100%{opacity:.9;transform:translate(-50%,-50%) rotate(-16deg) scale(1)}}
.pkb-tile.pkb-hop{animation:pkb-hop .55s cubic-bezier(.3,1.6,.5,1) var(--pkb-d,0ms) both}
@keyframes pkb-hop{35%{transform:translateY(-14px) scale(1.07)}}
.pkb-ring{position:absolute;left:50%;top:50%;width:70%;aspect-ratio:1;border:4px solid var(--pk-red);border-radius:50%;pointer-events:none;z-index:4;animation:pkb-ring .5s ease-out forwards}
@keyframes pkb-ring{from{transform:translate(-50%,-50%) scale(.3);opacity:.9}to{transform:translate(-50%,-50%) scale(calc(1.9 + var(--pkb-impact,0)*.18));opacity:0}}
.pkb-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:2;transition:opacity .4s}
.pkb-board.pkb-all .pkb-lines{opacity:0}
.pkb-lines line{fill:none;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.pkb-lines .pkb-u{stroke:var(--pk-paper);stroke-width:calc(13px*var(--pk-d))}
.pkb-lines .pkb-o{stroke:var(--pk-ink);stroke-width:calc(6px*var(--pk-d))}
.pkb-lines .pkb-draw line{animation:pkb-draw .45s ease-out .3s both}
@keyframes pkb-draw{from{stroke-dashoffset:1}}
.pkb-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 10px;margin-top:18px;font-weight:800;font-size:13px;word-break:auto-phrase}
.pkb-foot>span{flex:1 1 14em}
.pkb-foot>span:empty{flex-basis:0}
.pkb-acts{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;flex:0 1 auto;max-width:100%;margin-left:auto}
.pkb-reset,.pkb-shuf{appearance:none;flex:none;border:2px solid var(--pk-ink);background:transparent;border-radius:999px;padding:5px 12px;font-weight:800;font-size:12px;line-height:1.4;color:var(--pk-ink);cursor:pointer}
.pkb-shuf{background:var(--pk-paper);box-shadow:2px 2px 0 var(--pk-ink)}
.pkb-shuf:active:not(:disabled){transform:translate(2px,2px);box-shadow:none}
.pkb-shuf:disabled{cursor:default;opacity:.4}
.pkb-flash{position:absolute;inset:0;z-index:7;background:#fff;opacity:0;pointer-events:none}
.pkb-flash.pkb-go{animation:pkb-flash .4s ease-out}
@keyframes pkb-flash{0%{opacity:.8}100%{opacity:0}}
.pkb-banner{position:absolute;left:50%;top:50%;z-index:9;pointer-events:none;text-align:center;opacity:0;transform:translate(-50%,-50%)}
.pkb-banner::before{content:"";position:absolute;left:50%;top:50%;width:560px;height:560px;margin:-280px 0 0 -280px;z-index:-1;border-radius:50%;background:repeating-conic-gradient(rgba(255,253,246,.8) 0 9deg,transparent 9deg 18deg);-webkit-mask:radial-gradient(circle,#000 15%,transparent 62%);mask:radial-gradient(circle,#000 15%,transparent 62%);animation:pkb-spin 6s linear infinite}
@keyframes pkb-spin{to{transform:rotate(1turn)}}
.pkb-banner b{display:block;white-space:nowrap;font-family:var(--pk-display);font-weight:400;font-size:clamp(36px,11cqi,82px);line-height:1;color:var(--pk-red);-webkit-text-stroke:3px var(--pk-ink);paint-order:stroke fill;text-shadow:5px 5px 0 var(--pk-ink)}
.pkb-banner span{display:inline-block;margin-top:12px;background:var(--pk-ink);color:var(--pk-sun);font-weight:800;font-size:15px;padding:6px 16px;border-radius:999px}
.pkb-banner.pkb-show{animation:pkb-ban 1.8s cubic-bezier(.2,1.3,.4,1) forwards}
@keyframes pkb-ban{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-10deg)}16%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(-5deg)}26%{transform:translate(-50%,-50%) scale(1) rotate(-5deg)}80%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-5deg)}100%{opacity:0;transform:translate(-50%,-62%) scale(.96) rotate(-5deg)}}
.pkb-float{position:absolute;z-index:11;pointer-events:none;white-space:nowrap;font-family:var(--pk-display);font-weight:400;line-height:1;-webkit-text-stroke:4px var(--pk-ink);paint-order:stroke fill;transform:translate(-50%,-50%);animation:pkb-rise .95s cubic-bezier(.2,.9,.3,1) both}
.pkb-float.pkb-pt{font-size:22px;color:var(--pk-paper)}
.pkb-float.pkb-cmb{font-size:17px}
.pkb-float.pkb-big{font-size:clamp(14px,5.6cqi,34px);color:#FFE066}
.pkb-float.pkb-rch{font-size:20px;color:var(--pk-red);-webkit-text-stroke:4px var(--pk-paper)}
@keyframes pkb-rise{0%{opacity:0;transform:translate(-50%,-20%) scale(.4)}18%{opacity:1;transform:translate(-50%,-60%) scale(1.2)}30%{transform:translate(-50%,-70%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-190%) scale(1)}}
.pkb-ready{appearance:none;position:absolute;inset:0;z-index:12;display:grid;place-items:center;padding:20px;border:0;border-radius:inherit;background:rgba(42,31,20,.5);color:var(--pk-ink);font:inherit;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .35s}
.pkb-ready[hidden]{display:none}
.pkb-ready:focus-visible{outline:3px solid var(--pk-ink);outline-offset:-6px}
.pkb-ready.pkb-gone{pointer-events:none;background-color:transparent}
.pkb-board.pkb-waiting .pkb-snd{position:relative;z-index:13}
.pkb-ready-in,.pkb-count{grid-area:1/1}
.pkb-ready-in{display:flex;flex-direction:column;align-items:center;width:min(400px,100%);padding:24px 22px 22px;border:2.5px solid var(--pk-ink);border-radius:22px;background:var(--pk-paper)}
.pkb-ready.pkb-counting .pkb-ready-in{visibility:hidden}
.pkb-ready-t{font-family:var(--pk-display);font-weight:400;font-size:clamp(26px,7.5cqi,36px);line-height:1.15;color:var(--pk-red)}
.pkb-ready-q{margin-top:6px;font-weight:800;font-size:18px;line-height:1.4}
.pkb-ready-l{display:flex;flex-direction:column;gap:4px;width:100%;margin-top:14px;padding:12px 14px;border-radius:14px;background:rgba(42,31,20,.07);font-weight:800;font-size:16px;line-height:1.6;text-align:left;overflow-wrap:anywhere;word-break:auto-phrase}
.pkb-ready-l>span::before{content:"・"}
.pkb-ready-go{margin-top:18px;padding:10px 30px;border:2.5px solid var(--pk-ink);border-radius:999px;background:var(--pk-sun);font-weight:800;font-size:16px;line-height:1.4;box-shadow:3px 3px 0 var(--pk-ink);animation:pkb-beat 1.2s ease-in-out infinite}
@keyframes pkb-beat{50%{transform:scale(1.06)}}
.pkb-count{font-family:var(--pk-display);font-weight:400;line-height:1.1;paint-order:stroke fill;font-size:clamp(90px,34cqi,200px);color:var(--pk-sun);-webkit-text-stroke:5px var(--pk-ink);text-shadow:7px 7px 0 var(--pk-ink);opacity:0;pointer-events:none}
.pkb-count.pkb-go{font-size:clamp(48px,17cqi,120px);color:var(--pk-red);white-space:nowrap}
.pkb-count.pkb-tick{animation:pkb-cnt 1s cubic-bezier(.2,1.4,.4,1) forwards}
.pkb-count.pkb-go.pkb-tick{animation:pkb-cnt-go .75s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes pkb-cnt{0%{opacity:0;transform:scale(2.2)}18%{opacity:1;transform:scale(.92)}30%{transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(.8)}}
@keyframes pkb-cnt-go{0%{opacity:0;transform:scale(.4) rotate(-8deg)}25%{opacity:1;transform:scale(1.12) rotate(-5deg)}40%{transform:scale(1) rotate(-5deg)}70%{opacity:1}100%{opacity:0;transform:scale(1.5) rotate(-5deg)}}
.pkb-ptime{display:inline-flex;align-items:baseline;gap:8px;margin:-4px 0 14px;padding:5px 16px 4px;border-radius:999px;background:var(--pk-ink);color:var(--pk-sun)}
.pkb-ptime[hidden]{display:none}
.pkb-ptime small{font-size:11px;font-weight:800;letter-spacing:.08em;color:#fff}
.pkb-ptime b{font-family:var(--pk-display);font-weight:400;font-size:22px;line-height:1.2;font-variant-numeric:tabular-nums}
.pkb-perfect{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:20px;background:rgba(42,31,20,.5);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}
/* Visible at once when opening (focus can't land on a hidden dialog); hidden only after the fade when closing. */
.pkb-perfect.pkb-show{opacity:1;visibility:visible;transition:opacity .3s,visibility 0s}
.pkb-card{width:min(400px,100%);background:var(--pk-paper);border:2.5px solid var(--pk-ink);border-radius:22px;box-shadow:6px 6px 0 var(--pk-ink);padding:26px 22px 20px;text-align:center;transform:scale(.6) translateY(30px);transition:transform .45s cubic-bezier(.3,1.5,.5,1)}
.pkb-perfect.pkb-show .pkb-card{transform:none}
.pkb-medal{width:124px;height:124px;margin:0 auto 12px;border-radius:50%;border:5px solid var(--pk-red);box-shadow:inset 0 0 0 4px var(--pk-paper),inset 0 0 0 7px var(--pk-red);color:var(--pk-red);display:grid;place-content:center;font-family:var(--pk-display);font-size:26px;line-height:1.15;white-space:pre-line;opacity:0;transform:rotate(-14deg) scale(2.6)}
.pkb-perfect.pkb-show .pkb-medal{animation:pkb-slam .38s cubic-bezier(.5,0,.75,0) .35s forwards}
.pkb-perfect.pkb-settled,.pkb-perfect.pkb-settled .pkb-card{transition:none}
.pkb-perfect.pkb-settled .pkb-medal{animation:none;opacity:1;transform:rotate(-14deg) scale(1)}
@keyframes pkb-slam{to{opacity:1;transform:rotate(-14deg) scale(1)}}
.pkb-ptitle{font-family:var(--pk-display);font-weight:400;font-size:30px;line-height:1.3;color:inherit}
.pkb-pbody{font-weight:800;font-size:13.5px;line-height:1.6;margin:6px 0 14px;white-space:pre-line;word-break:auto-phrase}
.pkb-pbody:empty{margin:0 0 14px}
.pkb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.pkb-stats>div{border:2px solid var(--pk-ink);border-radius:12px;padding:6px 4px 5px;background:#fff}
.pkb-stats small{display:block;font-size:9.5px;font-weight:800;letter-spacing:.1em}
.pkb-stats b{display:block;font-family:var(--pk-display);font-weight:400;font-size:21px;line-height:1.2;font-variant-numeric:tabular-nums}
.pkb-close{appearance:none;border:2.5px solid var(--pk-ink);background:var(--pk-sun);border-radius:999px;padding:9px 28px;font-weight:800;font-size:14px;line-height:1.4;color:var(--pk-ink);box-shadow:3px 3px 0 var(--pk-ink);cursor:pointer}
.pkb-close:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--pk-ink)}
.pkb-fx{position:absolute;inset:0;width:100%;height:100%;z-index:10;pointer-events:none}
.pkb-demo{max-width:720px;margin:12px auto 4px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-family:var(--pk-body);font-size:12px;color:#666}
.pkb-demo button{appearance:none;border:1px solid #ccc;background:#f3f3f3;color:#222;border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer}
.pkb-mode{position:relative;isolation:isolate;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:2px;border-radius:999px;background:var(--pk-ink);transition:box-shadow .4s}
.pkb-mode::after{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.75) 45%,transparent 60%) no-repeat;background-size:250% 100%;background-position:200% 0;opacity:0}
.pkb-mode button{appearance:none;position:relative;z-index:1;border:0;background:none;border-radius:999px;padding:3px 11px 2px;font-weight:800;font-size:11px;line-height:1.4;letter-spacing:.04em;white-space:nowrap;color:var(--pk-paper);opacity:.72;cursor:pointer;transition:color .3s,opacity .3s;-webkit-tap-highlight-color:transparent}
.pkb-mode button[aria-checked="true"]{opacity:1;color:var(--pk-ink);cursor:default}
.pkb-mode button:focus-visible{outline:2px solid var(--pk-paper);outline-offset:-4px}
.pkb-mode-th{position:absolute;top:2px;bottom:2px;left:2px;width:calc(50% - 2px);border-radius:999px;background:var(--pk-sun);transition:transform .55s cubic-bezier(.3,1.45,.45,1)}
.pkb.pkb-inf .pkb-mode{box-shadow:0 0 14px 1px rgba(155,93,229,.6)}
.pkb.pkb-inf .pkb-mode::after{opacity:1;animation:pkb-glint 3.2s ease-in-out infinite}
.pkb.pkb-inf .pkb-mode-th{transform:translateX(100%);background:linear-gradient(90deg,#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C) 0 0/200% 100%;animation:pkb-rb 2.4s linear infinite}
.pkb.pkb-inf .pkb-mode button[data-m="infinite"]{color:#fff;text-shadow:0 1px 1px rgba(42,31,20,.55)}
.pkb-board.pkb-waiting .pkb-mode,.pkb-board.pkb-switching .pkb-mode{z-index:15}
.pkb-board.pkb-switching .pkb-fx{z-index:16}
.pkb.pkb-inf .pkb-board{border-color:transparent;background:radial-gradient(rgba(42,31,20,.12) 1.3px,transparent 1.6px) 0 0/16px 16px padding-box,linear-gradient(var(--pk-sun),var(--pk-sun)) padding-box,linear-gradient(120deg,#FF9F1C,#E8473B 22%,#9B5DE5 45%,#2F6FED 68%,#1FA971 88%,#FF9F1C) border-box;box-shadow:0 0 0 2px var(--pk-ink),0 10px 34px -10px rgba(155,93,229,.7)}
.pkb.pkb-inf .pkb-demo [data-r="dP"],.pkb.pkb-inf .pkb-demo [data-r="dR"]{display:none}
.pkb-ready-b,.pkb-ready-r{display:none}
.pkb.pkb-inf .pkb-ready-in{border-color:transparent;background:linear-gradient(var(--pk-paper),var(--pk-paper)) padding-box,linear-gradient(120deg,#FF9F1C,#E8473B 22%,#9B5DE5 45%,#2F6FED 68%,#1FA971 88%,#FF9F1C) border-box;box-shadow:0 0 0 2px var(--pk-ink),0 0 32px rgba(155,93,229,.5)}
.pkb.pkb-inf .pkb-ready-b{display:inline-block;margin-bottom:10px;padding:4px 14px 3px;border-radius:999px;background:linear-gradient(90deg,#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C) 0 0/200% 100%;color:#fff;font-weight:800;font-size:13px;line-height:1.4;letter-spacing:.08em;text-shadow:0 1px 1px rgba(42,31,20,.5);box-shadow:0 0 14px rgba(155,93,229,.55);animation:pkb-rb 2.4s linear infinite}
.pkb.pkb-inf .pkb-ready-r{display:block;margin-top:8px;font-weight:800;font-size:15px;line-height:1.5;word-break:auto-phrase}
.pkb-tile.pkb-clr{animation:pkb-clr .62s var(--pkb-cd,0ms) both}
@keyframes pkb-clr{0%{transform:perspective(600px) rotateY(0);animation-timing-function:cubic-bezier(.55,0,.9,.45)}42%{transform:perspective(600px) rotateY(90deg) scale(.9)}42.01%{transform:perspective(600px) rotateY(-90deg) scale(.9);animation-timing-function:cubic-bezier(.2,1.45,.4,1)}100%{transform:perspective(600px) rotateY(0)}}
.pkb-mfx{position:absolute;inset:0;z-index:14;display:grid;place-items:center;overflow:hidden;border-radius:inherit;pointer-events:none;visibility:hidden;opacity:0;text-align:center}
.pkb-mfx.pkb-show{visibility:visible;animation:pkb-mfx 1.7s ease-out forwards}
@keyframes pkb-mfx{0%{opacity:0}9%{opacity:1}72%{opacity:1}100%{opacity:0}}
.pkb-mfx-inf{background:radial-gradient(120% 95% at 50% 42%,#33205c 0%,#170f2e 52%,#08060f 100%)}
.pkb-mfx-n{background:var(--pk-sun) radial-gradient(rgba(42,31,20,.16) 1.3px,transparent 1.6px) 0 0/16px 16px}
.pkb-mfx::after{content:"";position:absolute;top:-30%;bottom:-30%;left:-50%;width:50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);opacity:0}
.pkb-mfx.pkb-show::after{animation:pkb-beam 1s cubic-bezier(.4,0,.2,1) .22s both}
@keyframes pkb-beam{0%{opacity:1;transform:skewX(-18deg) translateX(0)}100%{opacity:1;transform:skewX(-18deg) translateX(400%)}}
.pkb-mfx-glow{position:absolute;left:50%;top:46%;width:min(150cqi,1000px);aspect-ratio:1;translate:-50% -50%;border-radius:50%;background:conic-gradient(#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C);-webkit-mask:radial-gradient(circle,transparent 14%,#000 30%,rgba(0,0,0,.4) 48%,transparent 68%);mask:radial-gradient(circle,transparent 14%,#000 30%,rgba(0,0,0,.4) 48%,transparent 68%);filter:blur(28px);opacity:0}
.pkb-mfx.pkb-show .pkb-mfx-glow{animation:pkb-spin 3s linear infinite,pkb-glow 1.7s ease-out both}
@keyframes pkb-glow{0%{opacity:0;scale:.35}30%{opacity:.8;scale:1}100%{opacity:.5;scale:1.12}}
.pkb-mfx i{position:absolute;left:var(--x);top:var(--y);width:calc(20px*var(--s));aspect-ratio:1;background:var(--c);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);opacity:0}
.pkb-mfx.pkb-show i{animation:pkb-twk .85s ease-in-out var(--t) both}
@keyframes pkb-twk{0%{opacity:0;scale:0;rotate:0deg}45%{opacity:1;scale:1;rotate:70deg}100%{opacity:0;scale:.2;rotate:160deg}}
.pkb-mfx-in{position:relative;display:flex;flex-direction:column;align-items:center;padding:0 16px}
.pkb-mfx-sym{display:block;font-family:var(--pk-display);font-weight:400;line-height:1}
.pkb-mfx-inf .pkb-mfx-sym{font-size:clamp(110px,36cqi,230px);line-height:.9;padding:0 .06em;background:linear-gradient(90deg,#FFE066,#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FFE066) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 22px rgba(155,93,229,.9)) drop-shadow(0 0 3px rgba(255,255,255,.8))}
.pkb-mfx.pkb-show.pkb-mfx-inf .pkb-mfx-sym{animation:pkb-sym 1.7s cubic-bezier(.2,1.25,.35,1) both,pkb-rb 1.7s linear both}
@keyframes pkb-sym{0%{opacity:0;transform:scale(.25) rotate(-30deg)}26%{opacity:1;transform:scale(1.1) rotate(4deg)}38%{transform:scale(1) rotate(0)}100%{opacity:1;transform:scale(1.06)}}
.pkb-mfx-n .pkb-mfx-sym{display:grid;place-items:center;width:clamp(110px,30cqi,170px);aspect-ratio:1;border-radius:50%;border:5px solid var(--pk-red);box-shadow:inset 0 0 0 4px var(--pk-sun),inset 0 0 0 7px var(--pk-red);color:var(--pk-red);font-size:clamp(34px,10cqi,56px);letter-spacing:.04em;transform:rotate(-14deg)}
.pkb-mfx.pkb-show.pkb-mfx-n .pkb-mfx-sym{animation:pkb-mslam .42s cubic-bezier(.5,0,.75,0) .08s both}
@keyframes pkb-mslam{from{opacity:0;transform:rotate(-14deg) scale(2.6)}to{opacity:1;transform:rotate(-14deg) scale(1)}}
.pkb-mfx-t{display:block;margin-top:6px;font-family:var(--pk-display);font-weight:400;font-size:clamp(24px,8.5cqi,52px);line-height:1.1;letter-spacing:.2em;margin-right:-.2em;white-space:nowrap}
.pkb-mfx-inf .pkb-mfx-t{color:#fff;text-shadow:0 0 18px rgba(155,93,229,.95),0 0 4px rgba(255,255,255,.9)}
.pkb-mfx-n .pkb-mfx-t{margin-top:16px;color:var(--pk-ink)}
.pkb-mfx.pkb-show .pkb-mfx-t{animation:pkb-track 1.7s cubic-bezier(.16,1,.3,1) .12s both}
@keyframes pkb-track{0%{opacity:0;letter-spacing:.9em;margin-right:-.9em;filter:blur(8px)}40%{opacity:1;letter-spacing:.2em;margin-right:-.2em;filter:blur(0)}100%{opacity:1;letter-spacing:.24em;margin-right:-.24em}}
.pkb-mfx-s{display:inline-block;margin-top:12px;padding:5px 16px 4px;border-radius:999px;font-weight:800;font-size:14px;line-height:1.4;letter-spacing:.06em}
.pkb-mfx-inf .pkb-mfx-s{color:#fff;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.4)}
.pkb-mfx-n .pkb-mfx-s{background:var(--pk-ink);color:var(--pk-sun)}
.pkb-mfx.pkb-show .pkb-mfx-s{animation:pkb-up .6s cubic-bezier(.2,1.3,.4,1) .4s both}
@keyframes pkb-up{from{opacity:0;transform:translateY(12px)}}
.pkb-finbtn{display:none;appearance:none;flex:none;border:2px solid var(--pk-ink);border-radius:999px;padding:5px 14px;font-weight:800;font-size:12px;line-height:1.4;letter-spacing:.04em;color:#fff;text-shadow:0 1px 1px rgba(42,31,20,.55);background:linear-gradient(90deg,#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C) 0 0/200% 100%;box-shadow:2px 2px 0 var(--pk-ink),0 0 12px rgba(155,93,229,.45);cursor:pointer;animation:pkb-rb 2.4s linear infinite}
.pkb.pkb-inf .pkb-finbtn{display:inline-block}
.pkb-finbtn:active:not(:disabled){transform:translate(2px,2px);box-shadow:none}
.pkb-finbtn:disabled{cursor:default;opacity:.4;animation:none;box-shadow:2px 2px 0 var(--pk-ink)}
.pkb-board.pkb-over .pkb-grid{opacity:.55;filter:saturate(.5);transition:opacity .4s,filter .4s}
.pkb-pbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.pkb-perfect.pkb-fin .pkb-card{border-color:transparent;background:linear-gradient(var(--pk-paper),var(--pk-paper)) padding-box,linear-gradient(120deg,#FF9F1C,#E8473B 22%,#9B5DE5 45%,#2F6FED 68%,#1FA971 88%,#FF9F1C) border-box;box-shadow:0 0 0 2px var(--pk-ink),6px 6px 0 2px var(--pk-ink),0 0 40px rgba(155,93,229,.5)}
.pkb-perfect.pkb-fin .pkb-medal{border-color:transparent;background:linear-gradient(var(--pk-paper),var(--pk-paper)) padding-box,conic-gradient(#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C) border-box;box-shadow:0 0 18px rgba(155,93,229,.55);color:#7B3FD0;font-size:clamp(44px,14cqi,64px);line-height:1;text-shadow:0 0 12px rgba(155,93,229,.45)}
.pkb-perfect.pkb-fin .pkb-again{background:linear-gradient(90deg,#FF9F1C,#E8473B,#9B5DE5,#2F6FED,#1FA971,#FF9F1C) 0 0/200% 100%;color:#fff;text-shadow:0 1px 1px rgba(42,31,20,.55);animation:pkb-rb 2.4s linear infinite}
.pkb-perfect.pkb-fin .pkb-close:not(.pkb-again){background:var(--pk-paper)}
@container (max-width:560px){.pkb-board{padding:18px 14px 16px}.pkb-head{flex-direction:column;align-items:stretch;gap:12px}.pkb-score{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pkb-pill,.pkb-pill.pkb-sc{min-width:0;padding:5px 4px 4px}.pkb-pill b{font-size:19px}.pkb-title{font-size:26px}.pkb-grid{gap:max(3px,calc(8px*var(--pk-d)))}.pkb-tile{border-radius:calc(12px*var(--pk-d));box-shadow:3px 3px 0 var(--pk-ink);gap:calc(3px*var(--pk-d));aspect-ratio:1/1}.pkb-emo{font-size:max(13px,calc(24px*var(--pk-s)))}.pkb-lbl{font-size:max(8.5px,calc(10.5px*var(--pk-s)));padding:0 calc(2px*var(--pk-d))}.pkb-stamp{font-size:max(9px,calc(14px*var(--pk-s)))}.pkb-tile.pkb-reach::after{font-size:9px;padding:2px 5px;top:-9px;right:-5px}.pkb-lines .pkb-u{stroke-width:calc(10px*var(--pk-d))}.pkb-lines .pkb-o{stroke-width:calc(5px*var(--pk-d))}.pkb-banner::before{width:380px;height:380px;margin:-190px 0 0 -190px}.pkb-banner span{font-size:12px}.pkb-medal{width:96px;height:96px;font-size:20px}.pkb-card{padding:20px 14px 16px}.pkb-ptitle{font-size:24px}.pkb-stats b{font-size:17px}.pkb-float.pkb-pt{font-size:17px}.pkb-float.pkb-cmb{font-size:13px}.pkb-ready-in{padding:20px 16px 18px}.pkb-ready-l{font-size:15px;padding:10px 12px}.pkb-ready-go{font-size:15px}.pkb-ptime b{font-size:19px}}
@container (max-width:400px){.pkb-board{padding:16px 10px 14px}.pkb-mode button{padding:3px 8px 2px}.pkb-grid{gap:max(3px,calc(6px*var(--pk-d)))}.pkb-lbl{font-size:max(8.5px,calc(10px*var(--pk-s)));padding:0 calc(1px*var(--pk-d))}.pkb-emo{font-size:max(12px,calc(22px*var(--pk-s)))}.pkb-stamp{font-size:max(9px,calc(13px*var(--pk-s)))}.pkb-foot{margin-top:14px;font-size:12px}.pkb-perfect,.pkb-ready{padding:12px}.pkb-stats{gap:6px}.pkb-stats>div{padding:6px 2px 5px}.pkb-stats small{letter-spacing:.02em}}
@container (max-width:320px){.pkb-board{padding-inline:8px}.pkb-grid{gap:max(3px,calc(5px*var(--pk-d)))}.pkb-lbl{font-size:max(8.5px,calc(9.5px*var(--pk-s)));padding:0}}
@media (prefers-reduced-motion:reduce){.pkb-board.pkb-shake,.pkb-board.pkb-punch,.pkb-flash.pkb-go,.pkb-tile.pkb-hop,.pkb-tile.pkb-squash,.pkb-tile.pkb-on .pkb-stamp.pkb-hit,.pkb-tile.pkb-reach,.pkb-tile.pkb-line::before,.pkb-pill.pkb-hot,.pkb-bump,.pkb-tile.pkb-reach::after,.pkb-banner::before,.pkb-lines .pkb-draw line,.pkb-kicker.pkb-gold,.pkb-ready-go,.pkb.pkb-inf .pkb-mode-th,.pkb.pkb-inf .pkb-mode::after,.pkb.pkb-inf .pkb-ready-b,.pkb-tile.pkb-clr,.pkb-finbtn,.pkb-perfect.pkb-fin .pkb-again,.pkb-mfx.pkb-show.pkb-mfx-inf .pkb-mfx-sym,.pkb-mfx.pkb-show.pkb-mfx-n .pkb-mfx-sym,.pkb-mfx.pkb-show .pkb-mfx-t,.pkb-mfx.pkb-show .pkb-mfx-s,.pkb-mfx.pkb-show .pkb-mfx-glow,.pkb-mfx.pkb-show::after{animation:none}.pkb-count.pkb-tick,.pkb-count.pkb-go.pkb-tick{animation:pkb-fade 1s forwards}.pkb-mfx.pkb-show{animation:pkb-fade 1.4s forwards}.pkb-mode-th{transition:none}.pkb-ready{transition:none}.pkb-banner.pkb-show{animation:pkb-fade 1.8s forwards}.pkb-float{animation:pkb-fade 1s both}.pkb-perfect.pkb-show .pkb-medal{animation:none;opacity:1;transform:rotate(-14deg)}.pkb-card,.pkb-tile,.pkb-stamp{transition:none}}
@keyframes pkb-fade{0%,100%{opacity:0}15%,80%{opacity:1}}
`;
