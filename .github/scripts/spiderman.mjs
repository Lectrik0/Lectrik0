/*
 * A pixel Spider-Man (2 px per pixel) who hangs from a web in the top right corner, then swings across the
 * top of the dashboard, web to web, to the far left and back again.
 *
 * Each swing is a pendulum: a group holding a web (a line from the title bar) and the sprite, rotated about
 * the point where the web is fixed. A swing is on screen only for its slice of one long animation, and the
 * next swing starts where the last one ended, so he seems to travel.
 */
const SPIDEY = ["........rr.", "...rrrr..rr", "..rrrrrr.rr", "..rwrrwr.rr", "...rrrr..rr", "rrrrrrrrrrr", "rrrrkkrr...", "rrrrrrrr...", "rrbbbbbb...", "rrbbbbbb...", "rrbbbbbb...",
  "..bb..bb...", "..bb..bb...", "..bb..bb...", "..bb..bb...", "..rr..rr...", "..rr..rr...", "..rr..rr..."];
const COLORS = { r: "#E23636", b: "#2B50AA", k: "#111111", w: "#FFFFFF" };
const WEB = "#C9D1D9", TOP = 36, LENGTH = 80, ANGLE = 35;        // web fixed at TOP (the title bar), LENGTH long, swinging +-ANGLE degrees
const SWING = 1.1, IDLE = 3, HOME = 832;                         // seconds per swing, seconds hanging at home, home's x
const ANCHORS = [142, 234, 326, 418, 510, 602, 694, 786];        // where each web is fixed: one step is 2 * LENGTH * sin(ANGLE)

const sprite = () => SPIDEY.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${(c - 10) * 2}" y="${r * 2}" width="${(e - c) * 2}" height="2" fill="${COLORS[row[c]]}"/>`); c = e; }   // his raised hand (column 10) sits at x = 0
  return out; }).join("");

// leftwards: the hand starts right of the web (negative angle) and ends left of it; then the same back again
const SEGMENTS = [{ anchor: HOME, from: -6, to: 6, seconds: IDLE },
  ...[...ANCHORS].reverse().map(anchor => ({ anchor, from: -ANGLE, to: ANGLE, seconds: SWING })),
  ...ANCHORS.map(anchor => ({ anchor, from: ANGLE, to: -ANGLE, seconds: SWING }))];
const TOTAL = SEGMENTS.reduce((s, g) => s + g.seconds, 0);

const pct = n => (n * 100 / TOTAL).toFixed(3);
export const SPIDER_CSS = (() => {
  let t = 0;
  const frames = SEGMENTS.map((g, i) => {
    const start = t, end = t + g.seconds; t = end;
    const hide = `opacity:0;transform:rotate(${g.from}deg)`;
    return `@keyframes sp${i}{0%,${pct(Math.max(0, start - 0.01))}%{${i === 0 ? `opacity:1;transform:rotate(${g.from}deg)` : hide}}${pct(start)}%{opacity:1;transform:rotate(${g.from}deg)}` +
      `${pct(end)}%{opacity:1;transform:rotate(${g.to}deg)}${pct(end + 0.01)}%,100%{${i === SEGMENTS.length - 1 ? `opacity:1;transform:rotate(${g.to}deg)` : `opacity:0;transform:rotate(${g.to}deg)`}}}`;
  }).join("\n");
  return `\n.sp{animation-duration:${TOTAL.toFixed(1)}s;animation-iteration-count:infinite;animation-timing-function:ease-in-out}\n${frames}\n` +
    `@media (prefers-reduced-motion:reduce){.sp-go{display:none}}`;
})();

export function spiderman() {
  const y = TOP + LENGTH;
  const swings = SEGMENTS.map((g, i) => `<g class="sp${i ? " sp-go" : ""}" style="animation-name:sp${i};transform-origin:${g.anchor}px ${TOP}px">` +
    `<path d="M${g.anchor} ${TOP}V${y}" stroke="${WEB}" stroke-opacity=".75" stroke-width="1"/><use href="#spidey" x="${g.anchor}" y="${y}"/></g>`).join("");
  return `<defs><g id="spidey">${sprite()}</g></defs>${swings}`;
}
