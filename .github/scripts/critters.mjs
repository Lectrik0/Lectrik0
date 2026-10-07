/*
 * Spider-Man and the cat, on one shared timeline (so they can react to each other).
 *
 * One loop of TOTAL seconds:
 *   1. Spider-Man hangs at home in the top right corner of the window, and the cat leaves the desk and trots
 *      in along the bottom edge.
 *   2. He swings to a spot above the cat, who hops onto the busiest bar of the monthly chart.
 *   3. He drops down on a long web next to the cat's head. The cat swats at the web.
 *   4. He flicks away and is pulled back up; the cat sits there for a moment with hearts, then hops down and
 *      trots off.
 *   5. He swings web to web to the far left and back home. The cat is back asleep on the desk.
 *
 * Everything is CSS animation with a duration of TOTAL (each keyframe is a time in seconds, turned into a
 * percentage), so the two never drift apart. The room's sleeping cat (room.mjs) is hidden while this one is out.
 */
const S_COLORS = { r: "#E23636", b: "#2B50AA", k: "#111111", w: "#FFFFFF" };
const SPIDEY = ["........rr.", "...rrrr..rr", "..rrrrrr.rr", "..rwrrwr.rr", "...rrrr..rr", "rrrrrrrrrrr", "rrrrkkrr...", "rrrrrrrr...", "rrbbbbbb...", "rrbbbbbb...", "rrbbbbbb...",
  "..bb..bb...", "..bb..bb...", "..bb..bb...", "..bb..bb...", "..rr..rr...", "..rr..rr...", "..rr..rr..."];

const C_COLORS = { o: "#F0883E", d: "#C96A28", e: "#0D1117", p: "#FFB3B3", h: "#FF6B8B" };
const WALK = [
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "..oo.oo..oo.oo..", "..oo.oo..oo.oo.."],
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "...oo.oo.oo.oo..", "...oo.oo.oo.oo.."]
];
const SIT = ["....o...o..", "....ooooo..", "....oeoeo..", "....oopoo..", "...ooooooo.", "...ooooooo.", "..oodoodooo", "..ooooooooo", "..ooooooooo", "..oo.oo.oo."];
const PAW = ["...........", ".........oo", ".........oo", ".........o."];     // the raised paw, drawn over the sitting cat
const HEART = [".hh.hh.", "hhhhhhh", "hhhhhhh", ".hhhhh.", "..hhh..", "...h..."];

const px = (rows, colors, size) => rows.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${c * size}" y="${r * size}" width="${(e - c) * size}" height="${size}" fill="${colors[row[c]]}"/>`); c = e; }
  return out; }).join("");

const TOP = 36, LENGTH = 80, ANGLE = 35, SIN = Math.sin(ANGLE * Math.PI / 180);   // webs are fixed at the title bar (y = TOP)
const SWING = 0.85, IDLE = 2.8, HOME = 832, STEP = 2 * LENGTH * SIN;                // seconds per swing, seconds hanging at home, home's x, distance of one swing
const CP = 3, WALK_W = WALK[0][0].length * CP, SIT_W = SIT[0].length * CP, SIT_H = SIT.length * CP;
const WEB = "#C9D1D9", clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// `ground` is the y of the cat's feet on the floor; `barX` and `barTop` are the middle and the top of the busiest bar;
// `delay` holds everything back (in its first, hidden state) until the dashboard has finished building itself
export function critters({ ground, barX, barTop, delay = 0 }) {
  /* ---- the plan: who is where, when ---- */
  const side = barX + 40 <= 780 ? 1 : -1;                                        // which side of the cat he hangs on
  const wanted = side === 1 ? barX + 40 : barX - 24;                             // the x of his raised hand
  const L1 = clamp((HOME - wanted) / (2 * SIN), 40, 200), handX = HOME - 2 * L1 * SIN;
  const swings = []; let t = 0;
  const add = s => { s.start = t; s.end = t += s.sec; swings.push(s); return s; };
  add({ anchor: HOME, L: LENGTH, from: -6, to: 6, sec: IDLE, idle: true });
  add({ anchor: (HOME + handX) / 2, L: L1, from: -ANGLE, to: ANGLE, sec: SWING });
  const visit = { start: t }; const desc = [t, t + 0.7], hover = [t + 0.7, t + 2.9], flick = [t + 2.9, t + 3.5], asc = [t + 3.5, t + 4.2];
  t = visit.end = asc[1];
  let x = handX;
  for (; x - STEP >= 100; x -= STEP) add({ anchor: x - LENGTH * SIN, L: LENGTH, from: -ANGLE, to: ANGLE, sec: SWING });
  for (; x + STEP < HOME - 30; x += STEP) add({ anchor: x + LENGTH * SIN, L: LENGTH, from: ANGLE, to: -ANGLE, sec: SWING });
  const Llast = clamp((HOME - x) / (2 * SIN), 30, 140);
  add({ anchor: x + Llast * SIN, L: Llast, from: ANGLE, to: -ANGLE, sec: SWING });
  const TOTAL = t;

  const sitTop = barTop - SIT_H, sitX = barX - SIT_W / 2, hangY = sitTop - 4, LV = hangY - TOP;   // his head level with the cat's
  const tSit = desc[0], tJump = tSit - 0.7, tIn = tJump - 2.4, tDown = flick[1] + 1.8, tOff = tDown + 0.7, tGone = tOff + 2.6;
  const x1 = Math.max(24, barX - 90), onBar = barX - WALK_W / 2, offBar = barX + 50, lift = barTop - ground;

  /* ---- keyframes: times in seconds -> percentages of the loop ---- */
  const pct = sec => (sec * 100 / TOTAL).toFixed(3);
  const frames = (name, stops) => {
    const list = [...stops];
    if (list[0][0] > 0) list.unshift([0, list[0][1]]);
    if (list[list.length - 1][0] < TOTAL) list.push([TOTAL, list[list.length - 1][1]]);
    return `@keyframes ${name}{${list.map(([sec, decl]) => `${pct(sec)}%{${decl}}`).join("")}}`;
  };
  const gate = (name, on, off, ...windows) => frames(name, [[0, off], ...windows.flatMap(([a, b]) => [[a, on], [b, off]])].sort((p, q) => p[0] - q[0]));
  const css = [];
  css.push(`.sp{animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:ease-in-out}`);

  // Spider-Man's swings: each is on screen only for its own slice of the loop
  const spiderSwings = swings.map((s, i) => {
    const hidden = `opacity:0;transform:rotate(${s.to}deg)`, shown = a => `opacity:1;transform:rotate(${a}deg)`;
    css.push(frames(`sp${i}`, [[0, i ? `opacity:0;transform:rotate(${s.from}deg)` : shown(s.from)], [Math.max(0, s.start - 0.01), `opacity:0;transform:rotate(${s.from}deg)`], [s.start, shown(s.from)],
      [s.end, shown(s.to)], ...(i === swings.length - 1 ? [] : [[s.end + 0.01, hidden]])].sort((p, q) => p[0] - q[0])));
    if (!s.idle) css.push(frames(`th${i}`, [[0, "opacity:0"], [s.start, "opacity:0;transform:scale(.5)"], [s.start + 0.2, "opacity:1;transform:scale(1)"], [s.start + 0.6, "opacity:1"], [s.start + 0.8, "opacity:0"]]));
    const y = TOP + s.L;
    return `<g class="sp${s.idle ? "" : " sp-go"}" style="animation-name:sp${i};transform-origin:${s.anchor.toFixed(1)}px ${TOP}px"><path d="M${s.anchor.toFixed(1)} ${TOP}V${y.toFixed(1)}" stroke="${WEB}" stroke-opacity=".75" stroke-width="1"/>` +
      `<use href="#spidey" x="${s.anchor.toFixed(1)}" y="${y.toFixed(1)}"/>` +
      (s.idle ? "" : `<text class="sp-t" style="animation-name:th${i}" x="${s.anchor.toFixed(1)}" y="${TOP + 22}" font-size="10" font-weight="700" font-style="italic" text-anchor="middle" fill="#A991FF">thwip!</text>`) + `</g>`;
  }).join("");

  // the visit: he drops on a long web beside the cat, sways while it swats, flicks away, and is pulled up
  const away = -side * 12, sway = 0.7, s0 = L1 / LV, dy = -(LV - L1);
  css.push(frames("sv", [[0, "opacity:0;transform:rotate(0deg)"], [visit.start - 0.01, "opacity:0;transform:rotate(0deg)"], [visit.start, "opacity:1;transform:rotate(0deg)"], [hover[0], "opacity:1;transform:rotate(0deg)"],
    [hover[0] + 0.55, `opacity:1;transform:rotate(${sway}deg)`], [hover[0] + 1.1, `opacity:1;transform:rotate(${-sway}deg)`], [hover[0] + 1.65, `opacity:1;transform:rotate(${sway}deg)`], [flick[0], "opacity:1;transform:rotate(0deg)"],
    [flick[1], `opacity:1;transform:rotate(${away}deg)`], [asc[1], "opacity:1;transform:rotate(0deg)"], [asc[1] + 0.01, "opacity:0;transform:rotate(0deg)"]]));
  css.push(frames("svw", [[0, `transform:scaleY(${s0.toFixed(4)})`], [desc[0], `transform:scaleY(${s0.toFixed(4)})`], [desc[1], "transform:scaleY(1)"], [asc[0], "transform:scaleY(1)"], [asc[1], `transform:scaleY(${s0.toFixed(4)})`]]));
  css.push(frames("svb", [[0, `transform:translateY(${dy.toFixed(1)}px)`], [desc[0], `transform:translateY(${dy.toFixed(1)}px)`], [desc[1], "transform:translateY(0)"], [asc[0], "transform:translateY(0)"], [asc[1], `transform:translateY(${dy.toFixed(1)}px)`]]));
  const visitSvg = `<g class="sp sp-go" style="animation-name:sv;transform-origin:${handX.toFixed(1)}px ${TOP}px"><path class="sp" style="animation-name:svw;transform-origin:${handX.toFixed(1)}px ${TOP}px" d="M${handX.toFixed(1)} ${TOP}V${hangY}" stroke="${WEB}" stroke-opacity=".75" stroke-width="1"/>` +
    `<g class="sp" style="animation-name:svb"><use href="#spidey" x="${handX.toFixed(1)}" y="${hangY}"/></g></g>`;

  // the cat: trots in, hops onto the bar, swats, sits with hearts, hops down, trots off
  const at = (sec, xx, yy, timing) => [sec, `transform:translate(${xx.toFixed(1)}px,${yy.toFixed(1)}px)${timing ? `;animation-timing-function:${timing}` : ""}`];
  css.push(`.wc-walk,.wc-gate{animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite}.wc-walk{animation-name:wc-walk;animation-timing-function:linear}`);
  css.push(frames("wc-walk", [at(0, -60, 0), at(tIn, -60, 0, "linear"), at(tJump, x1, 0, "ease-out"), at((tJump + tSit) / 2, (x1 + onBar) / 2, lift - 36, "ease-in"), at(tSit, onBar, lift),
    at(tDown, onBar, lift, "ease-out"), at((tDown + tOff) / 2, (onBar + offBar) / 2, lift - 30, "ease-in"), at(tOff, offBar, 0, "linear"), at(tGone, 960, 0)]));
  css.push(`.wc-gate{animation-timing-function:steps(1)}`);
  css.push(gate("wc-showwalk", "opacity:1", "opacity:0", [tIn, tSit], [tDown, tGone]));
  css.push(gate("wc-showsit", "opacity:1", "opacity:0", [tSit, tDown]));
  css.push(gate("wc-paw", "opacity:1", "opacity:0", [desc[1], flick[1]]));
  css.push(gate("wc-hearts", "opacity:1", "opacity:0", [flick[0], tDown]));
  css.push(gate("room-cat", "opacity:0", "opacity:1", [tIn - 0.1, tGone + 0.2]));
  css.push(`.room-cat{animation:room-cat ${TOTAL.toFixed(2)}s steps(1) infinite}`);
  css.push(`.wc-f1{animation:wc-f1 .4s steps(1) infinite}@keyframes wc-f1{50%{opacity:0}}.wc-f2{animation:wc-f2 .4s steps(1) infinite}@keyframes wc-f2{0%{opacity:0}50%{opacity:1}}`);
  css.push(`.wc-swat{animation:wc-swat .35s steps(1) infinite}@keyframes wc-swat{50%{opacity:0}}`);
  css.push(`.wc-heart{opacity:0;animation:wc-heart 4s ease-out infinite}@keyframes wc-heart{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}`);
  css.push(`.sp-t{opacity:0;transform-box:fill-box;transform-origin:center;animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:ease-out}`);
  css.push(`@media (prefers-reduced-motion:reduce){.sp-go,.wc{display:none}}`);

  // last, so that no shorthand above can reset it
  css.push(`.sp,.wc-walk,.wc-gate,.sp-t,.room-cat{animation-delay:${delay}s;animation-fill-mode:backwards}`);
  const mirror = side === -1 ? `translate(${sitX + SIT_W} ${sitTop}) scale(-1 1)` : `translate(${sitX} ${sitTop})`;
  const cat = `<g class="wc"><g class="wc-walk"><g transform="translate(0 ${ground - WALK[0].length * CP})"><g class="wc-gate" style="animation-name:wc-showwalk"><g class="wc-f1">${px(WALK[0], C_COLORS, CP)}</g><g class="wc-f2">${px(WALK[1], C_COLORS, CP)}</g></g></g></g>` +
    `<g transform="${mirror}"><g class="wc-gate" style="animation-name:wc-showsit">${px(SIT, C_COLORS, CP)}<g class="wc-gate" style="animation-name:wc-paw"><g class="wc-swat">${px(PAW, C_COLORS, CP)}</g></g></g></g>` +
    `<g class="wc-gate" style="animation-name:wc-hearts"><g transform="translate(${sitX + SIT_W - 4} ${sitTop - 18})"><g class="wc-heart">${px(HEART, C_COLORS, 2)}</g></g>` +
    `<g transform="translate(${sitX - 8} ${sitTop - 8})"><g class="wc-heart" style="animation-delay:-2s">${px(HEART, C_COLORS, 2)}</g></g></g></g>`;

  const svg = `<defs><g id="spidey">${px(SPIDEY.map(r => r), S_COLORS, 2).replace(/x="(\d+)"/g, (_, v) => `x="${+v - 20}"`)}</g></defs>${spiderSwings}${visitSvg}${cat}`;
  return { css: css.join("\n"), svg, total: TOTAL };
}
