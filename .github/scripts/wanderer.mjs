/*
 * The cat from the lofi room wakes up and wanders along the bottom edge of the dashboard: it trots in from
 * the left, hops up onto the busiest bar of the monthly chart, sits there with a little heart, hops back down
 * and trots off to the right. While it is out, the desk is empty (room.mjs hides the sleeping cat for the same
 * stretch of the same loop).
 *
 * Positions come from the chart: `ground` is the y of the cat's feet on the floor, `barX` the middle of the
 * busiest bar and `barTop` its top.
 */
const COLORS = { o: "#F0883E", d: "#C96A28", e: "#0D1117", p: "#FFB3B3", h: "#FF6B8B" };
const WALK = [
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "..oo.oo..oo.oo..", "..oo.oo..oo.oo.."],
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "...oo.oo.oo.oo..", "...oo.oo.oo.oo.."]
];
const SIT = ["....o...o..", "....ooooo..", "....oeoeo..", "....oopoo..", "...ooooooo.", "...ooooooo.", "..oodoodooo", "..ooooooooo", "..ooooooooo", "..oo.oo.oo."];
const HEART = [".hh.hh.", "hhhhhhh", "hhhhhhh", ".hhhhh.", "..hhh..", "...h..."];
const PX = 3, WALK_W = WALK[0][0].length * PX, SIT_W = SIT[0].length * PX;

export const CAT_LOOP = 24;   // seconds; room.mjs uses the same loop to empty the desk
// where in the loop (percent) each thing happens
const T = { in: 3, jump: 27, sit: 31, down: 58, off: 62, gone: 76 };

export function wanderCss(ground, barX, barTop) {
  const lift = barTop - ground, x1 = Math.max(24, barX - 90), onBar = barX - WALK_W / 2, offBar = barX + 50;
  const up = (x, y) => `translate(${x}px,${y}px)`;
  return `
.wc-walk{animation:wc-walk ${CAT_LOOP}s linear infinite}
@keyframes wc-walk{0%,${T.in}%{transform:${up(-60, 0)}}${T.jump}%{transform:${up(x1, 0)}}
${(T.jump + T.sit) / 2}%{transform:${up((x1 + onBar) / 2, lift - 36)};animation-timing-function:ease-in}${T.sit}%{transform:${up(onBar, lift)}}
${T.down}%{transform:${up(onBar, lift)};animation-timing-function:ease-out}${(T.down + T.off) / 2}%{transform:${up((onBar + offBar) / 2, lift - 30)};animation-timing-function:ease-in}${T.off}%{transform:${up(offBar, 0)}}
${T.gone}%,100%{transform:${up(960, 0)}}}
.wc-showwalk{animation:wc-showwalk ${CAT_LOOP}s steps(1) infinite}
@keyframes wc-showwalk{0%{opacity:0}${T.in}%{opacity:1}${T.sit}%{opacity:0}${T.down}%{opacity:1}${T.gone}%{opacity:0}}
.wc-showsit{opacity:0;animation:wc-showsit ${CAT_LOOP}s steps(1) infinite}
@keyframes wc-showsit{0%{opacity:0}${T.sit}%{opacity:1}${T.down}%{opacity:0}}
.wc-heart{opacity:0;animation:wc-heart 4s ease-out infinite}
@keyframes wc-heart{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}
.wc-hearts{opacity:0;animation:wc-hearts ${CAT_LOOP}s steps(1) infinite}
@keyframes wc-hearts{0%{opacity:0}${T.sit}%{opacity:1}${T.down}%{opacity:0}}
.wc-f1{animation:wc-f1 .4s steps(1) infinite}@keyframes wc-f1{50%{opacity:0}}
.wc-f2{animation:wc-f2 .4s steps(1) infinite}@keyframes wc-f2{0%{opacity:0}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.wc{display:none}}`;
}

const sprite = (rows, size = PX) => rows.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${c * size}" y="${r * size}" width="${(e - c) * size}" height="${size}" fill="${COLORS[row[c]]}"/>`); c = e; }
  return out; }).join("");

export function wanderingCat(ground, barX, barTop) {
  const walkTop = ground - WALK[0].length * PX, sitTop = barTop - SIT.length * PX, sitX = barX - SIT_W / 2;
  return `<g class="wc"><g class="wc-walk"><g transform="translate(0 ${walkTop})"><g class="wc-showwalk"><g class="wc-f1">${sprite(WALK[0])}</g><g class="wc-f2">${sprite(WALK[1])}</g></g></g></g>` +
    `<g transform="translate(${sitX} ${sitTop})"><g class="wc-showsit">${sprite(SIT)}</g></g>` +
    `<g class="wc-hearts"><g transform="translate(${sitX + SIT_W - 4} ${sitTop - 18})"><g class="wc-heart">${sprite(HEART, 2)}</g></g>` +
    `<g transform="translate(${sitX - 8} ${sitTop - 8})"><g class="wc-heart" style="animation-delay:-2s">${sprite(HEART, 2)}</g></g></g></g>`;
}
