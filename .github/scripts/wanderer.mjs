/*
 * The cat from the lofi room wakes up, jumps down and wanders along the bottom edge of the dashboard: it
 * walks in from the left, stops to sit and meow, then walks off to the right. While it is out, the desk is
 * empty (room.mjs hides the sleeping cat for the same stretch of the same 30 second loop).
 */
const COLORS = { o: "#F0883E", d: "#C96A28", e: "#0D1117", p: "#FFB3B3" };
const WALK = [
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "..oo.oo..oo.oo..", "..oo.oo..oo.oo.."],
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "...oo.oo.oo.oo..", "...oo.oo.oo.oo.."]
];
const SIT = ["....o...o..", "....ooooo..", "....oeoeo..", "....oopoo..", "...ooooooo.", "...ooooooo.", "..oodoodooo", "..ooooooooo", "..ooooooooo", "..oo.oo.oo."];
const PX = 3, LOOP = 30, SIT_X = 420;

export const CAT_LOOP = LOOP;
export const WANDER_CSS = `
.wc-walk{animation:wc-walk ${LOOP}s linear infinite}
@keyframes wc-walk{0%,4%{transform:translateX(-60px)}38%{transform:translateX(${SIT_X}px)}56%{transform:translateX(${SIT_X}px)}70%,100%{transform:translateX(950px)}}
.wc-showwalk{animation:wc-showwalk ${LOOP}s steps(1) infinite}
@keyframes wc-showwalk{0%{opacity:0}4%{opacity:1}38%{opacity:0}56%{opacity:1}70%{opacity:0}}
.wc-showsit{opacity:0;animation:wc-showsit ${LOOP}s steps(1) infinite}
@keyframes wc-showsit{0%{opacity:0}38%{opacity:1}56%{opacity:0}}
.wc-f1{animation:wc-f1 .5s steps(1) infinite}@keyframes wc-f1{50%{opacity:0}}
.wc-f2{animation:wc-f2 .5s steps(1) infinite}@keyframes wc-f2{0%{opacity:0}50%{opacity:1}}
.wc-meow{opacity:0;animation:wc-meow ${LOOP}s steps(1) infinite}
@keyframes wc-meow{0%{opacity:0}40%{opacity:1}54%{opacity:0}}
@media (prefers-reduced-motion:reduce){.wc{display:none}}`;

const sprite = (rows, y = 0) => rows.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${c * PX}" y="${y + r * PX}" width="${(e - c) * PX}" height="${PX}" fill="${COLORS[row[c]]}"/>`); c = e; }
  return out; }).join("");

// `ground` is the y of the cat's feet
export function wanderingCat(ground) {
  const top = ground - WALK[0].length * PX;
  return `<g class="wc"><g class="wc-walk"><g transform="translate(0 ${top})"><g class="wc-showwalk"><g class="wc-f1">${sprite(WALK[0])}</g><g class="wc-f2">${sprite(WALK[1])}</g></g></g></g>` +
    `<g transform="translate(${SIT_X} ${ground - SIT.length * PX})"><g class="wc-showsit">${sprite(SIT)}</g></g>` +
    `<g class="wc-meow"><rect x="${SIT_X + 30}" y="${ground - 52}" width="44" height="20" rx="6" fill="#C9D1D9"/><path d="M${SIT_X + 36} ${ground - 32}l-6 8 14-8z" fill="#C9D1D9"/>` +
    `<text x="${SIT_X + 52}" y="${ground - 38}" text-anchor="middle" font-size="10" font-weight="700" fill="#0D1117">meow</text></g></g>`;
}
