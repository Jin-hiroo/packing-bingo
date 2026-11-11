// All rules are scoped under .pkb and every class/keyframe is prefixed, so the component
// can sit inside any site without leaking styles. Layout reacts to the component's own
// width (container queries), not the viewport, so it also fits narrow columns on desktop.
// Theme from outside with --pkb-sun, --pkb-ink, --pkb-paper, --pkb-red, --pkb-mint.
// The card sets --pk-n (squares per side), --pk-s (type scale) and --pk-d (spacing scale) on
// .pkb; both scales are 1 on a 4×4 card, so the sizes below are the 4×4 ones.

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@500;800&display=swap";

export const CSS = `
.pkb{--pk-sun:var(--pkb-sun,#FFD54F);--pk-ink:var(--pkb-ink,#2A1F14);--pk-paper:var(--pkb-paper,#FFFDF6);--pk-red:var(--pkb-red,#E8473B);--pk-mint:var(--pkb-mint,#BDEBD2);--pk-display:"Dela Gothic One",var(--pkb-font-fallback,sans-serif);--pk-body:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN",var(--pkb-font-fallback,sans-serif);--pk-n:4;--pk-s:1;--pk-d:1;container-type:inline-size;isolation:isolate;width:100%}
.pkb,.pkb *{box-sizing:border-box;margin:0;padding:0}
.pkb-board{position:relative;overflow:hidden;max-width:720px;margin:0 auto;padding:22px 26px 20px;border-radius:24px;background-color:var(--pk-sun);background-image:radial-gradient(rgba(42,31,20,.12) 1.3px,transparent 1.6px);background-size:16px 16px;border:2.5px solid var(--pk-ink);color:var(--pk-ink);font-family:var(--pk-body);line-height:1.4;text-align:left}
.pkb-board.pkb-shake{animation:pkb-shake .45s cubic-bezier(.36,.07,.19,.97)}
@keyframes pkb-shake{10%,90%{transform:translate(-1px,1px)}20%,80%{transform:translate(3px,-2px)}30%,50%,70%{transform:translate(-6px,2px)}40%,60%{transform:translate(6px,-1px)}}
.pkb-board.pkb-punch{animation:pkb-punch .4s cubic-bezier(.3,1.6,.5,1)}
@keyframes pkb-punch{30%{transform:scale(1.018)}}
.pkb-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 16px;margin-bottom:18px}
.pkb-tags{display:flex;gap:8px;align-items:center}
.pkb-kicker{display:inline-block;background:var(--pk-ink);color:var(--pk-sun);font-weight:800;font-size:11px;letter-spacing:.14em;padding:4px 10px;border-radius:999px}
.pkb-kicker.pkb-gold{color:#fff;background:linear-gradient(90deg,#E8473B,#FF9F1C,#1FA971,#2F6FED,#E8473B);background-size:200% 100%;animation:pkb-rb 2s linear infinite}
@keyframes pkb-rb{to{background-position:-200% 0}}
.pkb button{font-family:var(--pk-body)}
.pkb-snd{appearance:none;border:2px solid var(--pk-ink);background:var(--pk-paper);border-radius:999px;padding:2px 9px;font-weight:800;font-size:11px;line-height:1.4;color:var(--pk-ink);cursor:pointer}
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
.pkb-combo.pkb-on .pkb-bar i{animation:pkb-drain 2.5s linear forwards}
@keyframes pkb-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.pkb-gw{position:relative}
.pkb-grid{display:grid;grid-template-columns:repeat(var(--pk-n),minmax(0,1fr));gap:calc(12px*var(--pk-d))}
.pkb-tile{position:relative;min-width:0;place-self:stretch;aspect-ratio:1/.82;background:var(--pk-paper);border:2.5px solid var(--pk-ink);border-radius:calc(16px*var(--pk-d));box-shadow:4px 4px 0 var(--pk-ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(6px*var(--pk-d));cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .1s,box-shadow .1s,background-color .25s}
.pkb-tile:active:not(.pkb-free){transform:translate(3px,3px);box-shadow:1px 1px 0 var(--pk-ink)}
.pkb-tile input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
.pkb-tile:has(input:focus-visible){outline:3px solid var(--pk-ink);outline-offset:3px}
.pkb-emo{font-size:max(14px,calc(32px*var(--pk-s)));line-height:1;transition:opacity .2s}
.pkb-lbl{font-weight:800;font-size:max(9px,calc(13px*var(--pk-s)));line-height:1.25;text-align:center;padding:0 calc(6px*var(--pk-d));transition:opacity .2s;word-break:keep-all;overflow-wrap:anywhere}
.pkb-stamp{position:absolute;left:50%;top:50%;width:64%;aspect-ratio:1;border-radius:50%;border:3px solid var(--pk-red);box-shadow:inset 0 0 0 2px var(--pk-paper),inset 0 0 0 4px var(--pk-red);color:var(--pk-red);display:grid;place-items:center;font-family:var(--pk-display);font-size:max(9px,calc(20px*var(--pk-s)));letter-spacing:.04em;opacity:0;transform:translate(-50%,-50%) rotate(-16deg) scale(1.7);transition:transform .25s cubic-bezier(.3,1.5,.5,1),opacity .15s;pointer-events:none}
.pkb-tile.pkb-on .pkb-stamp{opacity:.9;transform:translate(-50%,-50%) rotate(-16deg) scale(1)}
.pkb-tile.pkb-on .pkb-emo,.pkb-tile.pkb-on .pkb-lbl{opacity:.35}
.pkb-tile.pkb-free{cursor:default;container-type:inline-size}
.pkb-tile.pkb-free .pkb-stamp{width:72%;opacity:1;transition:none;font-size:17cqi;letter-spacing:.02em;line-height:1;text-align:center;background:var(--pk-red);color:var(--pk-paper);border-color:var(--pk-red);box-shadow:inset 0 0 0 2px var(--pk-red),inset 0 0 0 4px var(--pk-paper)}
.pkb-tile.pkb-line{background-color:var(--pk-mint)}
.pkb-tile.pkb-line::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.9) 45%,transparent 60%) no-repeat;background-size:250% 100%;background-position:200% 0;animation:pkb-glint 3.2s ease-in-out var(--pkb-gd,0s) infinite}
@keyframes pkb-glint{0%{background-position:200% 0}30%,100%{background-position:-100% 0}}
.pkb-tile.pkb-reach{border-style:dashed;animation:pkb-aura 1.1s ease-in-out infinite}
@keyframes pkb-aura{50%{box-shadow:4px 4px 0 var(--pk-ink),0 0 0 7px rgba(232,71,59,.35)}}
.pkb-tile.pkb-reach::after{content:attr(data-reach);position:absolute;top:-11px;right:-8px;z-index:3;background:var(--pk-red);color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.06em;padding:3px 8px;border-radius:999px;border:2px solid var(--pk-ink);transform:rotate(6deg);animation:pkb-bob 1.1s ease-in-out infinite}
@keyframes pkb-bob{50%{transform:rotate(6deg) translateY(-4px)}}
.pkb-tile.pkb-squash{animation:pkb-squash .34s cubic-bezier(.3,1.6,.5,1)}
@keyframes pkb-squash{0%{transform:scale(.88)}55%{transform:scale(1.05)}}
.pkb-tile.pkb-hop{animation:pkb-hop .55s cubic-bezier(.3,1.6,.5,1) var(--pkb-d,0ms) both}
@keyframes pkb-hop{35%{transform:translateY(-14px) scale(1.07)}}
.pkb-ring{position:absolute;left:50%;top:50%;width:70%;aspect-ratio:1;border:4px solid var(--pk-red);border-radius:50%;pointer-events:none;z-index:4;animation:pkb-ring .5s ease-out forwards}
@keyframes pkb-ring{from{transform:translate(-50%,-50%) scale(.3);opacity:.9}to{transform:translate(-50%,-50%) scale(1.9);opacity:0}}
.pkb-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:2;transition:opacity .4s}
.pkb-board.pkb-all .pkb-lines{opacity:0}
.pkb-lines line{fill:none;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.pkb-lines .pkb-u{stroke:var(--pk-paper);stroke-width:calc(13px*var(--pk-d))}
.pkb-lines .pkb-o{stroke:var(--pk-ink);stroke-width:calc(6px*var(--pk-d))}
.pkb-lines .pkb-draw line{animation:pkb-draw .45s ease-out .3s both}
@keyframes pkb-draw{from{stroke-dashoffset:1}}
.pkb-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:18px;font-weight:800;font-size:13px;word-break:auto-phrase}
.pkb-reset{appearance:none;flex:none;border:2px solid var(--pk-ink);background:transparent;border-radius:999px;padding:5px 12px;font-weight:800;font-size:12px;line-height:1.4;color:var(--pk-ink);cursor:pointer}
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
.pkb-perfect{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:20px;background:rgba(42,31,20,.5);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}
.pkb-perfect.pkb-show{opacity:1;visibility:visible}
.pkb-card{width:min(400px,100%);background:var(--pk-paper);border:2.5px solid var(--pk-ink);border-radius:22px;box-shadow:6px 6px 0 var(--pk-ink);padding:26px 22px 20px;text-align:center;transform:scale(.6) translateY(30px);transition:transform .45s cubic-bezier(.3,1.5,.5,1)}
.pkb-perfect.pkb-show .pkb-card{transform:none}
.pkb-medal{width:124px;height:124px;margin:0 auto 12px;border-radius:50%;border:5px solid var(--pk-red);box-shadow:inset 0 0 0 4px var(--pk-paper),inset 0 0 0 7px var(--pk-red);color:var(--pk-red);display:grid;place-content:center;font-family:var(--pk-display);font-size:26px;line-height:1.15;white-space:pre-line;opacity:0;transform:rotate(-14deg) scale(2.6)}
.pkb-perfect.pkb-show .pkb-medal{animation:pkb-slam .38s cubic-bezier(.5,0,.75,0) .35s forwards}
@keyframes pkb-slam{to{opacity:1;transform:rotate(-14deg) scale(1)}}
.pkb-ptitle{font-family:var(--pk-display);font-weight:400;font-size:30px;line-height:1.3;color:inherit}
.pkb-pbody{font-weight:800;font-size:13.5px;line-height:1.6;margin:6px 0 14px;white-space:pre-line;word-break:auto-phrase}
.pkb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.pkb-stats>div{border:2px solid var(--pk-ink);border-radius:12px;padding:6px 4px 5px;background:#fff}
.pkb-stats small{display:block;font-size:9.5px;font-weight:800;letter-spacing:.1em}
.pkb-stats b{display:block;font-family:var(--pk-display);font-weight:400;font-size:21px;line-height:1.2;font-variant-numeric:tabular-nums}
.pkb-close{appearance:none;border:2.5px solid var(--pk-ink);background:var(--pk-sun);border-radius:999px;padding:9px 28px;font-weight:800;font-size:14px;line-height:1.4;color:var(--pk-ink);box-shadow:3px 3px 0 var(--pk-ink);cursor:pointer}
.pkb-close:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--pk-ink)}
.pkb-fx{position:absolute;inset:0;width:100%;height:100%;z-index:10;pointer-events:none}
.pkb-demo{max-width:720px;margin:12px auto 4px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-family:var(--pk-body);font-size:12px;color:#666}
.pkb-demo button{appearance:none;border:1px solid #ccc;background:#f3f3f3;color:#222;border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer}
@container (max-width:560px){.pkb-board{padding:18px 14px 16px}.pkb-head{flex-direction:column;align-items:stretch;gap:12px}.pkb-score{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pkb-pill,.pkb-pill.pkb-sc{min-width:0;padding:5px 4px 4px}.pkb-pill b{font-size:19px}.pkb-title{font-size:26px}.pkb-grid{gap:max(3px,calc(8px*var(--pk-d)))}.pkb-tile{border-radius:calc(12px*var(--pk-d));box-shadow:3px 3px 0 var(--pk-ink);gap:calc(3px*var(--pk-d));aspect-ratio:1/1}.pkb-emo{font-size:max(13px,calc(24px*var(--pk-s)))}.pkb-lbl{font-size:max(8.5px,calc(10.5px*var(--pk-s)));padding:0 calc(2px*var(--pk-d))}.pkb-stamp{font-size:max(9px,calc(14px*var(--pk-s)))}.pkb-tile.pkb-reach::after{font-size:9px;padding:2px 5px;top:-9px;right:-5px}.pkb-lines .pkb-u{stroke-width:calc(10px*var(--pk-d))}.pkb-lines .pkb-o{stroke-width:calc(5px*var(--pk-d))}.pkb-banner::before{width:380px;height:380px;margin:-190px 0 0 -190px}.pkb-banner span{font-size:12px}.pkb-medal{width:96px;height:96px;font-size:20px}.pkb-card{padding:20px 14px 16px}.pkb-ptitle{font-size:24px}.pkb-stats b{font-size:17px}.pkb-float.pkb-pt{font-size:17px}.pkb-float.pkb-cmb{font-size:13px}}
@container (max-width:400px){.pkb-board{padding:16px 10px 14px}.pkb-grid{gap:max(3px,calc(6px*var(--pk-d)))}.pkb-lbl{font-size:max(8.5px,calc(10px*var(--pk-s)));padding:0 calc(1px*var(--pk-d))}.pkb-emo{font-size:max(12px,calc(22px*var(--pk-s)))}.pkb-stamp{font-size:max(9px,calc(13px*var(--pk-s)))}.pkb-foot{margin-top:14px;font-size:12px}.pkb-perfect{padding:12px}.pkb-stats{gap:6px}.pkb-stats>div{padding:6px 2px 5px}.pkb-stats small{letter-spacing:.02em}}
@container (max-width:320px){.pkb-board{padding-inline:8px}.pkb-grid{gap:max(3px,calc(5px*var(--pk-d)))}.pkb-lbl{font-size:max(8.5px,calc(9.5px*var(--pk-s)));padding:0}}
@media (prefers-reduced-motion:reduce){.pkb-board.pkb-shake,.pkb-board.pkb-punch,.pkb-flash.pkb-go,.pkb-tile.pkb-hop,.pkb-tile.pkb-squash,.pkb-tile.pkb-reach,.pkb-tile.pkb-line::before,.pkb-pill.pkb-hot,.pkb-bump,.pkb-tile.pkb-reach::after,.pkb-banner::before,.pkb-lines .pkb-draw line,.pkb-kicker.pkb-gold{animation:none}.pkb-banner.pkb-show{animation:pkb-fade 1.8s forwards}.pkb-float{animation:pkb-fade 1s both}.pkb-perfect.pkb-show .pkb-medal{animation:none;opacity:1;transform:rotate(-14deg)}.pkb-card{transition:none}}
@keyframes pkb-fade{0%,100%{opacity:0}15%,80%{opacity:1}}
`;
