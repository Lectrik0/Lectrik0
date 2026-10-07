/*
 * A couch in the space beside the intro, under a neon "OPEN TO WORK" sign. Spider-Man sits on it drinking
 * coffee (a sip every few seconds, with steam) and the cat sits next to him. Now and then he lies down for a
 * nap: the cat hops up and curls up to sleep on his chest, until they both wake up and sit again.
 *
 * Everything is drawn in 2 px pixels and animated with CSS on one loop. With reduced motion you get the
 * sitting scene, still.
 */
const PX = 2, LOOP = 44;
const S = { r: "#E23636", b: "#2B50AA", k: "#111111", w: "#FFFFFF" };
const C = { o: "#F0883E", d: "#C96A28", e: "#0D1117", p: "#FFB3B3" };

const SPIDEY_SIT = ["...rrrr........", "..rrrrrr.......", "..rwrrwr.......", "...rrrr........", "..rrrrrr.......", "..rrrrrrr......", "..rrkkrrr......", "..bbbbbb.......",
  "..bbbbbbbbbbbb.", "..bbbbbbbbbbbb.", ".............bb", ".............bb", ".............rr", ".............rr"];
const SPIDEY_STAND = ["........rr.", "...rrrr..rr", "..rrrrrr.rr", "..rwrrwr.rr", "...rrrr..rr", "rrrrrrrrrrr", "rrrrkkrr...", "rrrrrrrr...", "rrbbbbbb...", "rrbbbbbb...", "rrbbbbbb...",
  "..bb..bb...", "..bb..bb...", "..bb..bb...", "..bb..bb...", "..rr..rr...", "..rr..rr...", "..rr..rr..."];
const LIE_HEAD = ["..rrr.", ".rrrrr", ".rwrwr", ".rrrrr", "..rrr.", "......"], LIE_TORSO = [".......", "rrrrrrr", "rrkkrrr", "rrrrrrr", ".......", "......."],
  LIE_LEGS = [".........", "bbbbbbbrr", "bbbbbbbrr", "bbbbbbbrr", ".........", "........."];
const SPIDEY_LIE = LIE_HEAD.map((h, r) => h + LIE_TORSO[r] + LIE_LEGS[r]);          // 22 x 6 pixels
const CAT_SIT = ["....o...o..", "....ooooo..", "....oeoeo..", "....oopoo..", "...ooooooo.", "...ooooooo.", "..oodoodooo", "..ooooooooo", "..ooooooooo", "..oo.oo.oo."];
const CAT_LEAP = [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "..oo.oo..oo.oo..", "..oo.oo..oo.oo.."];
const CAT_LOAF = ["..o.o.......", "..ooo.......", ".oooooooooo.", "oooddoooodoo", "ooooooooooo.", ".oooooooo..."];

const sprite = (rows, colors, ox = 0, oy = 0) => rows.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${ox + c * PX}" y="${oy + r * PX}" width="${(e - c) * PX}" height="${PX}" fill="${colors[row[c]]}"/>`); c = e; }
  return out; }).join("");

// the couch: a 66 x 22 pixel picture
const COUCH = { b: "#6A4BC8", l: "#8A6EE0", d: "#4A3299", f: "#2A1F5C", g: "#0D1117" };
function couchPixels() {
  const W = 66, H = 22, g = Array.from({ length: H }, () => Array(W).fill("."));
  const fill = (c0, c1, r0, r1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) g[r][c] = ch; };
  fill(6, 59, 0, 11, "b"); fill(6, 59, 0, 1, "l");                     // the back
  fill(0, 7, 6, 18, "d"); fill(58, 65, 6, 18, "d"); fill(0, 7, 6, 7, "b"); fill(58, 65, 6, 7, "b");  // the arms
  fill(8, 57, 12, 16, "l"); fill(8, 57, 16, 16, "b");                  // the seat cushions
  fill(8, 57, 17, 18, "d"); g[12][32] = "d"; for (let r = 12; r <= 16; r++) g[r][32] = "b";   // the base, and the gap between the two cushions
  fill(2, 4, 19, 20, "f"); fill(61, 63, 19, 20, "f");                  // the feet
  return g.flatMap((row, r) => { const out = []; let c = 0;
    while (c < W) { let e = c; while (e < W && row[e] === row[c]) e++;
      if (row[c] !== ".") out.push(`<rect x="${c * PX}" y="${r * PX}" width="${(e - c) * PX}" height="${PX}" fill="${COUCH[row[c]]}"/>`); c = e; }
    return out; }).join("");
}

// (x, y, w, h) is the space the scene may use; `delay` holds it back until the dashboard has finished building itself
export function couch({ x, y, w, h, delay = 0 }) {
  const cx = Math.round(x + (w - 132) / 2), floor = y + h - 2, top = floor - 44;       // the couch's left edge and top
  const seat = top + 24;                                                                // the top of the seat cushions
  const sitX = cx + 22, catX = cx + 88;                                                 // where each sits
  const at = (a, b) => [a, b];
  const pct = s => (s * 100 / LOOP).toFixed(3);
  const frames = (name, stops) => `@keyframes ${name}{${stops.map(([s, d]) => `${pct(s)}%{${d}}`).join("")}}`;
  const gate = (name, windows) => frames(name, [[0, "opacity:0"], ...windows.flatMap(([a, b]) => [[a, "opacity:1"], [b, "opacity:0"]]), [LOOP, "opacity:0"]].sort((p, q) => p[0] - q[0]));
  // when each thing happens (seconds in the loop): sitting, lying down, hopping up, napping, hopping off, sitting again
  const T = { lie: 12.6, hopUp: [12.6, 13.4], nap: [13.4, 27.0], hopOff: [27.0, 27.8], up: 27.8 };
  const sitting = [[0, T.lie], [T.up, LOOP]];
  const lieX = cx + 28, sleepX = cx + 50, sleepY = seat - 14;                                           // the cat's spot on his chest
  const css = [
    `.cs-g{animation-duration:${LOOP}s;animation-iteration-count:infinite;animation-timing-function:steps(1);animation-delay:${delay}s;animation-fill-mode:backwards}`,
    gate("cs-sit", sitting), gate("cs-lie", [[T.lie, T.up]]), gate("cs-catsit", sitting), gate("cs-loaf", [T.nap]), gate("cs-leapup", [T.hopUp]), gate("cs-leapoff", [T.hopOff]),
    `.cs-hop{animation-duration:${LOOP}s;animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-delay:${delay}s;animation-fill-mode:backwards}`,
    frames("cs-hopup", [[0, `transform:translate(${catX}px,${seat - 18}px)`], [T.hopUp[0], `transform:translate(${catX}px,${seat - 18}px)`], [(T.hopUp[0] + T.hopUp[1]) / 2, `transform:translate(${(catX + sleepX) / 2}px,${seat - 46}px)`], [T.hopUp[1], `transform:translate(${sleepX - 8}px,${sleepY - 8}px)`]]),
    frames("cs-hopoff", [[0, `transform:translate(${sleepX - 8}px,${sleepY - 8}px)`], [T.hopOff[0], `transform:translate(${sleepX - 8}px,${sleepY - 8}px)`], [(T.hopOff[0] + T.hopOff[1]) / 2, `transform:translate(${(catX + sleepX) / 2}px,${seat - 46}px)`], [T.hopOff[1], `transform:translate(${catX}px,${seat - 18}px)`]]),
    `.cs-sip{animation:cs-sip 4s ease-in-out infinite}@keyframes cs-sip{0%,55%{transform:translate(0,0)}68%,82%{transform:translate(-11px,-9px)}95%,100%{transform:translate(0,0)}}`,
    `.cs-steam{opacity:0;animation:cs-steam 2.4s ease-in infinite}@keyframes cs-steam{0%{opacity:0;transform:translateY(0)}30%{opacity:.8}100%{opacity:0;transform:translateY(-12px)}}`,
    `.cs-tail{transform-box:fill-box;transform-origin:100% 100%;animation:cs-tail .6s ease-in-out infinite alternate}@keyframes cs-tail{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}`,
    `.cs-blink{opacity:0;animation:cs-blink 3.1s steps(1) infinite}@keyframes cs-blink{0%,90%{opacity:0}91%,96%{opacity:1}97%,100%{opacity:0}}`,
    `.cs-breathe{transform-box:fill-box;transform-origin:50% 100%;animation:cs-breathe 3s ease-in-out infinite alternate}@keyframes cs-breathe{to{transform:scaleY(1.06)}}`,
    `.cs-z{opacity:0;animation:cs-z 3.2s ease-out infinite}@keyframes cs-z{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-18px)}}`,
    `.cs-neon{animation:cs-neon 5s steps(1) infinite}@keyframes cs-neon{0%,88%,92%,96%,100%{opacity:1}90%,94%{opacity:.35}}`,
    `@media (prefers-reduced-motion:reduce){.cs-extra{display:none}}`
  ].join("\n");

  const mug = `<g class="cs-sip"><g transform="translate(${sitX + 22} ${seat - 14})"><rect width="9" height="9" fill="#EDEDED"/><rect width="9" height="3" fill="#5A3A1E"/><rect x="9" y="2" width="3" height="5" fill="none" stroke="#EDEDED" stroke-width="1.5"/>` +
    `<g stroke="#C9D1D9" stroke-width="1.2" fill="none" stroke-linecap="round"><path class="cs-steam" d="M2 -2q-2-3 0-5t0-4"/><path class="cs-steam" style="animation-delay:.8s" d="M6 -2q-2-3 0-5t0-4"/></g></g></g>`;
  const sitSpidey = `<g class="cs-g" style="animation-name:cs-sit"><g transform="translate(${sitX} ${seat - 20})">${sprite(SPIDEY_SIT, S)}</g>${mug}</g>`;
  // lying down: the standing Spider-Man turned on his side along the seat, head to the left
  const lying = `<g class="cs-g cs-extra" style="animation-name:cs-lie"><g class="cs-breathe"><g transform="translate(${lieX} ${seat - 8})">${sprite(SPIDEY_LIE, S)}</g></g>` +
    `<g fill="#C9D1D9" font-size="9" font-weight="700"><text class="cs-z" x="${lieX + 2}" y="${seat - 16}">z</text><text class="cs-z" style="animation-delay:1.1s" x="${lieX + 8}" y="${seat - 22}" font-size="7">z</text></g></g>`;
  const catSit = `<g class="cs-g" style="animation-name:cs-catsit"><g transform="translate(${catX} ${seat - 20})"><g class="cs-tail" transform="translate(-2 14)">${sprite(["o.", "o.", "oo"], C)}</g>${sprite(CAT_SIT, C)}` +
    `<g class="cs-blink"><rect x="${5 * PX}" y="${2 * PX}" width="${PX}" height="${PX}" fill="#F0883E"/><rect x="${7 * PX}" y="${2 * PX}" width="${PX}" height="${PX}" fill="#F0883E"/></g></g></g>`;
  const loaf = `<g class="cs-g cs-extra" style="animation-name:cs-loaf"><g class="cs-breathe"><g transform="translate(${sleepX - 12} ${sleepY - 4})">${sprite(CAT_LOAF, C)}</g></g></g>`;
  const leap = (name, anim) => `<g class="cs-g cs-extra" style="animation-name:${name}"><g class="cs-hop" style="animation-name:${anim}"><g transform="scale(.75)">${sprite(CAT_LEAP, C)}</g></g></g>`;
  const sign = `<g class="cs-neon"><text x="${cx + 66}" y="${top - 16}" text-anchor="middle" font-size="13" font-weight="700" fill="#FF6BD6" stroke="#FF6BD6" stroke-opacity=".35" stroke-width="3" paint-order="stroke">OPEN TO WORK</text>` +
    `<text x="${cx + 66}" y="${top - 16}" text-anchor="middle" font-size="13" font-weight="700" fill="#FFE3F7">OPEN TO WORK</text></g>`;
  const svg = `<g class="cs">${sign}<g transform="translate(${cx} ${top})">${couchPixels()}</g>${sitSpidey}${catSit}${lying}${loaf}${leap("cs-leapup", "cs-hopup")}${leap("cs-leapoff", "cs-hopoff")}</g>`;
  return { css, svg };
}
