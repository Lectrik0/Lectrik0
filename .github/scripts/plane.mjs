/*
 * A little pixel plane that flies through the empty space beside the intro, pulling a banner: it swoops in
 * from the right, hangs about long enough to read the banner, then flies off to the left, and rests a moment
 * before the next pass. Two small clouds drift behind it. All motion is CSS; the scene is clipped (and faded)
 * at its edges so the plane never leaves the space it was given.
 */
const MESSAGE = "OPEN TO WORK - HIRE ME!";
const COLORS = { o: "#F0883E", d: "#C96A28", w: "#C9D1D9", c: "#00C2FF", k: "#0D1117" };
const PLANE = [   // faces left
  "...o............", "...oo...........", "o.ooooooooooooo.", "oooooooccooooow.", "..oooooooooooow.", "......wwwww.....", ".....wwwwwww....", "......d....d....",
];
const CLOUD = ["..##..", ".####.", "######"];
const PX = 2, LOOP = 14, BANNER_W = Math.round(MESSAGE.length * 5.6 + 24), BANNER_H = 18, ROPE = 14, PLANE_W = PLANE[0].length * PX;

const px = (rows, color) => rows.flatMap((row, r) => [...row].map((ch, c) => ch === "#" ? `<rect x="${c * PX}" y="${r * PX}" width="${PX}" height="${PX}" fill="${color}"/>` : "")).join("");

// (x, y, w, h) is the space the plane may use; `delay` holds it back until the dashboard has built itself
export function plane({ x, y, w, h, delay = 0 }) {
  const cy = y + Math.round(h / 2) - PLANE.length * PX / 2 - 6;                  // the plane's top
  const span = PLANE_W + ROPE + BANNER_W;                                         // plane + rope + banner
  const startX = x + w + 10, readX = x + w - span - 8, readEnd = x + 6, endX = x - span - 10;
  const sprite = PLANE.flatMap((row, r) => { const out = []; let c = 0;
    while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
      out.push(`<rect x="${c * PX}" y="${r * PX}" width="${(e - c) * PX}" height="${PX}" fill="${COLORS[row[c]] || "#F0883E"}"/>`); c = e; }
    return out; }).join("");
  const css = `
.pl-fly{animation:pl-fly ${LOOP}s linear infinite;animation-delay:${delay}s;animation-fill-mode:backwards}
@keyframes pl-fly{0%{transform:translateX(${startX}px);animation-timing-function:ease-out}20%{transform:translateX(${readX}px);animation-timing-function:linear}
62%{transform:translateX(${readEnd}px);animation-timing-function:ease-in}82%,100%{transform:translateX(${endX}px)}}
.pl-bob{animation:pl-bob 1.7s ease-in-out infinite alternate}@keyframes pl-bob{from{transform:translateY(-3px)}to{transform:translateY(3px)}}
.pl-wave{transform-box:fill-box;transform-origin:0 50%;animation:pl-wave .7s ease-in-out infinite alternate}@keyframes pl-wave{from{transform:skewY(-3deg)}to{transform:skewY(3deg)}}
.pl-prop{transform-box:fill-box;transform-origin:center;animation:pl-prop .12s steps(2) infinite}@keyframes pl-prop{50%{transform:scaleY(.35)}}
.pl-cloud{animation:pl-cloud 22s linear infinite;animation-delay:${delay}s;animation-fill-mode:backwards}@keyframes pl-cloud{from{transform:translateX(0)}to{transform:translateX(-${w + 60}px)}}
@media (prefers-reduced-motion:reduce){.pl{display:none}}`;
  const banner = `<g class="pl-wave"><path d="M0 0H${BANNER_W}L${BANNER_W - 8} ${BANNER_H / 2}L${BANNER_W} ${BANNER_H}H0Z" fill="#C9D1D9"/>` +
    `<text x="7" y="${BANNER_H / 2 + 3}" font-size="9" font-weight="700" fill="#0D1117">${MESSAGE}</text></g>`;
  // flying left: nose at the left, the rope and banner trail to the right
  const svg = `<g class="pl"><defs><linearGradient id="pl-fade" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".07" stop-color="#fff"/><stop offset=".93" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
    `<mask id="pl-mask" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#pl-fade)"/></mask></defs>` +
    `<g mask="url(#pl-mask)">` +
    `<g class="pl-cloud"><g transform="translate(${x + w - 40} ${y + 14})" fill="#1B2A47" opacity=".9">${px(CLOUD, "#1B2A47")}</g><g transform="translate(${x + w + 110} ${y + h - 26})" opacity=".8">${px(CLOUD, "#1B2A47")}</g></g>` +
    `<g class="pl-fly"><g class="pl-bob"><g transform="translate(0 ${cy})">${sprite}<rect class="pl-prop" x="-3" y="${PX * 2}" width="2" height="${PX * 3 + 2}" fill="#8B949E"/>` +
    `<path d="M${PLANE_W} ${PX * 3 + 1}H${PLANE_W + ROPE}" stroke="#8B949E" stroke-width="1"/><g transform="translate(${PLANE_W + ROPE} ${PX * 3 + 1 - BANNER_H / 2})">${banner}</g></g></g></g></g></g>`;
  return { css, svg };
}
