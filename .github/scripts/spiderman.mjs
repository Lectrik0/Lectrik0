/*
 * A pixel Spider-Man (2 px per pixel) hanging upright from a web, one hand up on the line. He sways gently
 * from the point where the web is fixed. Used in the top right corner of the dashboard.
 */
const P = { text: "#C9D1D9" };

export const SPIDER_CSS = `
.spider-swing{transform-box:fill-box;transform-origin:91% 0%;animation:spider-swing 2.8s ease-in-out infinite alternate}
@keyframes spider-swing{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}`;

const SPIDEY = ["........rr.", "...rrrr..rr", "..rrrrrr.rr", "..rwrrwr.rr", "...rrrr..rr", "rrrrrrrrrrr", "rrrrkkrr...", "rrrrrrrr...", "rrbbbbbb...", "rrbbbbbb...", "rrbbbbbb...",
  "..bb..bb...", "..bb..bb...", "..bb..bb...", "..bb..bb...", "..rr..rr...", "..rr..rr...", "..rr..rr..."];
const COLORS = { r: "#E23636", b: "#2B50AA", k: "#111111", w: "#FFFFFF" };

// (x, y) is the sprite's top left; the web is fixed at webTop, straight above his raised hand.
export function spiderman(x, y, webTop) {
  const rects = SPIDEY.flatMap((row, r) => { const out = []; let c = 0;
    while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
      out.push(`<rect x="${x + c * 2}" y="${y + r * 2}" width="${(e - c) * 2}" height="2" fill="${COLORS[row[c]]}"/>`); c = e; }
    return out; }).join("");
  return `<g class="spider-swing"><path d="M${x + 20} ${webTop}V${y}" stroke="${P.text}" stroke-opacity=".75" stroke-width="1"/>${rects}</g>`;
}
