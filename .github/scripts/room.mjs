/*
 * The lofi hacker room on the dashboard: a rainy night window, a monitor with scrolling code, a lamp, a mug
 * with steam and a cat asleep on the desk. Drawn in a 220 x 250 box; all motion is CSS (see ROOM_CSS).
 */
const P = { accent: "#00C2FF", ok: "#3FB950", purple: "#A991FF", orange: "#F0883E", dim: "#8B949E", text: "#C9D1D9", gold: "#FFD58A" };


// A 30 x 39 pixel poster (2 px per pixel): the title in a 3 x 5 pixel font above a pink bar of soap.
const GLYPH = { F: ["###", "#..", "##.", "#..", "#.."], I: ["###", ".#.", ".#.", ".#.", "###"], G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"], T: ["###", ".#.", ".#.", ".#.", ".#."], C: [".##", "#..", "#..", "#..", ".##"],
  L: ["#..", "#..", "#..", "#..", "###"], U: ["#.#", "#.#", "#.#", "#.#", "###"], B: ["##.", "#.#", "##.", "#.#", "##."] };
const POSTER = { b: "#14090D", w: "#E8E8E8", l: "#FFC2D6", p: "#FF8FB3", d: "#D45F86", o: P.orange };
function fightClubPoster(x, y) {
  const W = 30, H = 39, g = Array.from({ length: H }, () => Array(W).fill("b"));
  const put = (c, r, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) g[r][c] = ch; };
  const word = (text, row, col, ch) => [...text].forEach((letter, i) => GLYPH[letter].forEach((line, r) => [...line].forEach((px, c) => px === "#" && put(col + i * 4 + c, row + r, ch))));
  for (let c = 3; c <= 26; c++) { put(c, 2, "o"); put(c, 36, "o"); }
  word("FIGHT", 5, 5, "w"); word("CLUB", 11, 7, "w");
  for (let r = 19; r <= 30; r++) for (let c = 5; c <= 24; c++) {
    if ((r === 19 || r === 30) && (c === 5 || c === 24)) continue;   // rounded corners
    put(c, r, r <= 20 ? "l" : r >= 29 ? "d" : "p");
  }
  for (let c = 9; c <= 20; c += 2) put(c, 25, "d");                  // the imprint on the soap
  [[3, 17], [26, 16], [2, 22], [27, 24], [4, 32], [25, 33], [15, 16]].forEach(([c, r]) => put(c, r, "w"));
  const rects = g.flatMap((row, r) => { const out = []; let c = 0;
    while (c < W) { if (row[c] === "b") { c++; continue; } let e = c; while (e < W && row[e] === row[c]) e++;
      out.push(`<rect x="${c * 2}" y="${r * 2}" width="${(e - c) * 2}" height="2" fill="${POSTER[row[c]]}"/>`); c = e; }
    return out; }).join("");
  return `<g transform="translate(${x} ${y}) rotate(2 30 39)"><rect x="-2" y="-2" width="64" height="82" rx="1" fill="#3A5078"/><rect width="60" height="78" fill="${POSTER.b}"/>${rects}` +
    `<rect x="22" y="-6" width="16" height="6" fill="${P.gold}" opacity=".7"/></g>`;
}

// A 32 x 27 pixel certificate (2 px per pixel) for the AWS Certified Cloud Practitioner, stamped "in progress"
// because that is where it is.
const CG = { A: [".#.", "#.#", "###", "#.#", "#.#"], W: ["#...#", "#...#", "#.#.#", "#.#.#", ".#.#."], S: [".##", "#..", ".#.", "..#", "##."],
  C: GLYPH.C, L: GLYPH.L, O: ["###", "#.#", "#.#", "#.#", "###"], U: GLYPH.U, D: ["##.", "#.#", "#.#", "#.#", "##."] };
const CERT = { p: "#F1E6C8", f: "#8B6B3E", g: "#C9A54E", a: "#FF9900", t: "#3A2A12", m: "#9C8A64" };
function certificate(x, y) {
  const W = 32, H = 27, g = Array.from({ length: H }, () => Array(W).fill("p"));
  const put = (c, r, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) g[r][c] = ch; };
  const word = (text, row, col, ch) => { let at = col;   // letters can be different widths
    for (const letter of text) { CG[letter].forEach((line, r) => [...line].forEach((px, c) => px === "#" && put(at + c, row + r, ch))); at += CG[letter][0].length + 1; } };
  for (let c = 0; c < W; c++) { put(c, 0, "f"); put(c, H - 1, "f"); put(c, 1, "g"); put(c, H - 2, "g"); }
  for (let r = 0; r < H; r++) { put(0, r, "f"); put(W - 1, r, "f"); put(1, r, "g"); put(W - 2, r, "g"); }
  word("AWS", 4, 9, "a"); word("CLOUD", 11, 6, "t");
  for (let c = 6; c <= 25; c++) put(c, 18, "m");
  for (let c = 9; c <= 22; c++) put(c, 20, "m");
  for (const [c, r] of [[6, 22], [7, 21], [8, 22], [9, 21], [10, 22], [11, 21], [12, 22]]) put(c, r, "t");           // a signature
  for (let r = 20; r <= 23; r++) for (let c = 22; c <= 27; c++) if (!((r === 20 || r === 23) && (c === 22 || c === 27))) put(c, r, "a");   // the seal
  for (const [c, r] of [[23, 22], [24, 23], [26, 21]]) put(c, r, "p");
  put(23, 25, "a"); put(26, 25, "a");
  const rects = g.flatMap((row, r) => { const out = []; let c = 0;
    while (c < W) { let e = c; while (e < W && row[e] === row[c]) e++;
      if (row[c] !== "p") out.push(`<rect x="${c * 2}" y="${r * 2}" width="${(e - c) * 2}" height="2" fill="${CERT[row[c]]}"/>`); c = e; }
    return out; }).join("");
  return `<g transform="translate(${x} ${y})"><rect width="64" height="54" fill="${CERT.p}"/>${rects}` +
    `<text transform="translate(7 49) rotate(-9)" font-size="5.5" font-weight="700" fill="#B23A2A" fill-opacity=".9">IN PROGRESS</text></g><rect x="${x - 2}" y="${y - 2}" width="9" height="5" fill="${P.gold}" opacity=".7" transform="rotate(-20 ${x + 2} ${y})"/>`;
}

// A book seen from the side, in 2 px pixels: a coloured spine with a band at the top and the title written
// downwards in the pixel font (first word only, which is what fits). `x` is its left edge and `bottom` where it
// stands on the shelf.
const SG = { A: GLYPH_A(), T: GLYPH.T, O: ["###", "#.#", "#.#", "#.#", "###"], M: ["#.#", "###", "#.#", "#.#", "#.#"], I: GLYPH.I, C: GLYPH.C, L: GLYPH.L,
  E: ["###", "#..", "##.", "#..", "###"], N: ["##.", "#.#", "#.#", "#.#", "#.#"], U: GLYPH.U, X: ["#.#", "#.#", ".#.", "#.#", "#.#"], S: [".##", "#..", ".#.", "..#", "##."], P: ["##.", "#.#", "##.", "#..", "#.."] };
function GLYPH_A() { return [".#.", "#.#", "###", "#.#", "#.#"]; }
function spine(x, bottom, { w, h, title, base, edge, ink, top, topRows, logo }) {
  const g = Array.from({ length: h }, () => Array(w).fill(base));
  for (let r = 0; r < h; r++) { g[r][0] = edge; g[r][w - 1] = edge; }
  for (let r = 0; r < topRows; r++) for (let c = 0; c < w; c++) g[r][c] = top;
  for (let c = 0; c < w; c++) g[h - 1][c] = edge;
  for (const [c, r] of logo || []) g[r][c] = "#FFFFFF";                                                               // a small mark in the top band
  const first = Math.floor((w - 5) / 2);                                                                              // the title is 5 pixels wide once turned on its side
  [...title].forEach((letter, k) => { const top0 = topRows + 2 + k * 4;                                                // read downwards, like a real spine
    SG[letter].forEach((line, r) => [...line].forEach((px, c) => { if (px === "#") g[top0 + c][first + (4 - r)] = ink; })); });
  const rects = g.flatMap((row, r) => { const out = []; let c = 0;
    while (c < w) { let e = c; while (e < w && row[e] === row[c]) e++;
      out.push(`<rect x="${x + c * 2}" y="${bottom - (h - r) * 2}" width="${(e - c) * 2}" height="2" fill="${row[c]}"/>`); c = e; }
    return out; }).join("");
  return rects;
}

export const ROOM_H = 330;
export const ROOM_LABEL = "A cosy pixel room at night: a pixel AWS Cloud Practitioner certificate (in progress), a pixel Fight Club poster, a shelf with three real books (CCNA, CISSP, Linux for Dummies) and a plant, rain on the window, a monitor with scrolling code and a PC tower with a glowing fan, a mug, a small succulent and a sleeping cat";

export const ROOM_CSS = `
.room-rain{stroke:#7FA8E0;stroke-width:1;stroke-dasharray:3 9;animation:room-rain .55s linear infinite}@keyframes room-rain{to{stroke-dashoffset:-12}}
.room-code{animation:room-code 6s linear infinite}@keyframes room-code{to{transform:translateY(-48px)}}
.room-steam{opacity:0;animation:room-steam 2.8s ease-in infinite}@keyframes room-steam{0%{opacity:0;transform:translateY(0)}30%{opacity:.7}100%{opacity:0;transform:translateY(-16px)}}
.room-tail{transform-box:fill-box;transform-origin:0 50%;animation:room-tail 2.2s ease-in-out infinite alternate}@keyframes room-tail{from{transform:rotate(-10deg)}to{transform:rotate(16deg)}}
.room-z{opacity:0;animation:room-z 3.2s ease-out infinite}@keyframes room-z{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-20px)}}
.room-glow{animation:room-glow 4s ease-in-out infinite alternate}@keyframes room-glow{from{opacity:.07}to{opacity:.17}}
.room-tw{animation:room-tw 3s steps(3) infinite}@keyframes room-tw{50%{opacity:.25}}
.room-breath{transform-box:fill-box;transform-origin:50% 100%;animation:room-br 3s ease-in-out infinite alternate}@keyframes room-br{to{transform:scaleY(1.07)}}
.room-sway{transform-box:fill-box;transform-origin:50% 100%;animation:room-sway 3.4s ease-in-out infinite alternate}@keyframes room-sway{from{transform:rotate(-4deg)}to{transform:rotate(5deg)}}
.room-fan{transform-box:fill-box;transform-origin:center;animation:room-fan 1.1s linear infinite}@keyframes room-fan{to{transform:rotate(360deg)}}
.room-rgb{animation:room-rgb 5s linear infinite}@keyframes room-rgb{0%,100%{fill:#00C2FF}33%{fill:#A991FF}66%{fill:#3FB950}}
.room-led{animation:room-led 1.6s steps(1) infinite}@keyframes room-led{50%{opacity:.3}}`;

export const roomBody = () => `<g transform="translate(0 80)"><rect x="1" y="1" width="218" height="198" rx="9" fill="#0F1A2E"/>
<clipPath id="room-w"><rect x="18" y="22" width="100" height="84" rx="3"/></clipPath>
<g clip-path="url(#room-w)"><rect x="18" y="22" width="100" height="84" fill="#121F3C"/><circle cx="94" cy="42" r="8" fill="#E4ECF7"/>
<g fill="#E4ECF7" class="room-tw"><circle cx="34" cy="34" r="1"/><circle cx="60" cy="30" r="1"/><circle cx="76" cy="52" r="1"/></g>
<path d="M18 106V78h14V66h12v14h10V62h14v20h14V70h16v36z" fill="#22355E"/><path d="M18 106V92h18V84h14v14h16V88h18v18z" fill="#0C1630"/>
<g fill="#6EF0BC"><rect x="38" y="70" width="3" height="4" class="room-tw"/><rect x="66" y="68" width="3" height="4"/><rect x="90" y="76" width="3" height="4" class="room-tw"/><rect x="54" y="92" width="3" height="4"/><rect x="100" y="94" width="3" height="4" class="room-tw"/></g>
<g class="room-rain"><path d="M26 18l-6 30M44 18l-6 30M62 18l-6 30M80 18l-6 30M98 18l-6 30M116 18l-6 30M30 58l-6 30M48 58l-6 30M66 58l-6 30M84 58l-6 30M102 58l-6 30"/></g></g>
<rect x="18" y="22" width="100" height="84" rx="3" fill="none" stroke="#3A5078" stroke-width="3"/><path d="M68 22v84M18 64h100" stroke="#3A5078" stroke-width="2"/>
<rect y="196" width="220" height="54" fill="#1B2A47"/><rect y="196" width="220" height="3" fill="#2A3D63"/>
<polygon class="room-glow" points="170,140 192,140 214,198 148,198" fill="${P.gold}"/>
<path d="M200 196v-52l-14-8" stroke="#6B7FA3" stroke-width="3" fill="none"/><path d="M180 128l12 4-4 12-16-4z" fill="#6B7FA3"/><rect x="190" y="192" width="22" height="5" rx="2" fill="#6B7FA3"/>
<rect x="104" y="176" width="12" height="20" fill="#2A3D63"/><rect x="92" y="194" width="36" height="4" rx="2" fill="#2A3D63"/>
<rect x="62" y="112" width="96" height="68" rx="5" fill="#0A1220" stroke="#3A5078" stroke-width="3"/>
<clipPath id="room-s"><rect x="68" y="118" width="84" height="56"/></clipPath>
<g clip-path="url(#room-s)"><g class="room-code">${[0, 1].map(k => [[40, P.accent], [24, P.ok], [58, P.dim], [34, P.purple], [48, P.accent], [20, P.dim], [30, P.ok], [54, P.dim]].map(([w, c], i) => `<rect x="${72 + (i % 3) * 5}" y="${120 + k * 64 + i * 8}" width="${w}" height="3" rx="1" fill="${c}"/>`).join("")).join("")}</g></g>
<rect x="131" y="187" width="11" height="9" rx="2" fill="#C96A28"/><g class="room-sway"><ellipse cx="133" cy="184" rx="3" ry="6" fill="#3FB950" transform="rotate(-22 133 184)"/><ellipse cx="136.5" cy="182" rx="3" ry="7" fill="#2E8B3F"/><ellipse cx="140" cy="184" rx="3" ry="6" fill="#3FB950" transform="rotate(22 140 184)"/></g><ellipse cx="110" cy="188" rx="46" ry="6" fill="${P.accent}" opacity=".06"/>
<rect x="150" y="180" width="16" height="16" rx="3" fill="${P.orange}"/><path d="M166 184h4a4 4 0 0 1 0 9h-4" stroke="${P.orange}" stroke-width="2.4" fill="none"/>
<g stroke="#C9D1D9" stroke-width="1.6" fill="none" stroke-linecap="round"><path class="room-steam" d="M154 176q-3-4 0-8t0-6"/><path class="room-steam" style="animation-delay:.9s" d="M159 176q-3-4 0-8t0-6"/><path class="room-steam" style="animation-delay:1.8s" d="M164 176q-3-4 0-8t0-6"/></g>
<rect x="22" y="140" width="34" height="56" rx="3" fill="#24344F" stroke="#3A5078" stroke-width="2"/>
<rect x="26" y="145" width="26" height="4" rx="1" fill="#0A1220"/><rect x="26" y="152" width="26" height="4" rx="1" fill="#0A1220"/>
<circle cx="39" cy="174" r="10" fill="#0A1220" stroke="#3A5078" stroke-width="1.5"/>
<g class="room-fan"><path d="M39 174q-7-9 0-9zM39 174q9-7 9 0zM39 174q7 9 0 9zM39 174q-9 7-9 0z" class="room-rgb"/></g>
<circle cx="39" cy="174" r="2.2" fill="#24344F"/>
<circle class="room-led" cx="48" cy="190" r="2.2" fill="${P.ok}"/><path d="M26 189h12M26 192h12" stroke="#0A1220" stroke-width="1.5"/>
<path d="M56 190q24 10 48 4" stroke="#0F1A2E" stroke-width="2.5" fill="none"/>
<g class="room-cat"><g transform="translate(0 -57)"><g class="room-breath"><ellipse cx="38" cy="187" rx="22" ry="10" fill="${P.orange}"/><circle cx="19" cy="184" r="8" fill="${P.orange}"/><path d="M13 179l1-8 6 5zM25 177l3-7 3 8z" fill="${P.orange}"/>
<path d="M15 185q2 2 4 0M22 185q2 2 4 0" stroke="#7A3B10" stroke-width="1.4" fill="none"/><path d="M30 178q4 6 0 10M40 177q4 6 0 11" stroke="#C96A28" stroke-width="2" fill="none"/></g>
<path class="room-tail" d="M58 188q10 2 12-6" stroke="${P.orange}" stroke-width="5" fill="none" stroke-linecap="round"/>
<g fill="${P.text}" font-size="9" font-weight="700"><text class="room-z" x="22" y="170">z</text><text class="room-z" style="animation-delay:1.1s" x="26" y="166" font-size="7">z</text></g></g></g></g>${certificate(22, 14)}
<rect x="20" y="12" width="9" height="5" fill="${P.gold}" opacity=".7" transform="rotate(-20 24 14)"/>
<rect x="116" y="62" width="86" height="5" rx="1" fill="#2A3D63"/><path d="M124 67v7M194 67v7" stroke="#2A3D63" stroke-width="3"/>
${spine(116, 62, { w: 9, h: 25, title: "CCNA", base: "#1B6FB5", edge: "#0E4A80", ink: "#FFFFFF", top: "#0B2E52", topRows: 6, logo: [[1, 4], [1, 3], [3, 4], [3, 3], [3, 2], [5, 4], [5, 3], [5, 2], [5, 1], [7, 4], [7, 3], [7, 2], [4, 3], [4, 2], [6, 3], [6, 2], [2, 3], [2, 4], [8, 4]] })}${spine(135, 62, { w: 8, h: 26, title: "CISSP", base: "#B3261E", edge: "#7A1712", ink: "#F5F5F5", top: "#14090D", topRows: 2 })}<g transform="rotate(4 162 62)">${spine(152, 62, { w: 9, h: 30, title: "LINUX", base: "#FFD83D", edge: "#C9A800", ink: "#14090D", top: "#14090D", topRows: 7, logo: [[4, 2], [3, 3], [4, 3], [5, 3], [4, 4]] })}</g>
<g transform="translate(12 0)"><rect x="164" y="48" width="20" height="14" rx="2" fill="#C96A28"/><rect x="162" y="46" width="24" height="4" rx="1" fill="#E07B39"/>
<g class="room-sway"><path d="M174 46c-10-4-14-12-12-22 8 2 14 10 12 22zM174 46c2-12 8-18 18-20-1 10-6 18-18 20zM174 46c-2-8-1-16 0-24 4 8 4 16 0 24z" fill="${P.ok}"/></g></g>${fightClubPoster(136, 106)}`;
