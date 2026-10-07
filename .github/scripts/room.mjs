/*
 * The lofi hacker room on the dashboard: a rainy night window, a monitor with scrolling code, a lamp, a mug
 * with steam and a cat asleep on the desk. Drawn in a 220 x 250 box; all motion is CSS (see ROOM_CSS).
 */
const P = { accent: "#00C2FF", ok: "#3FB950", purple: "#A991FF", orange: "#F0883E", dim: "#8B949E", text: "#C9D1D9", gold: "#FFD58A" };

export const ROOM_LABEL = "A cosy pixel room at night: rain on the window, a monitor with scrolling code, a mug and a sleeping cat";

export const ROOM_CSS = `
.room-rain{stroke:#7FA8E0;stroke-width:1;stroke-dasharray:3 9;animation:room-rain .55s linear infinite}@keyframes room-rain{to{stroke-dashoffset:-12}}
.room-code{animation:room-code 6s linear infinite}@keyframes room-code{to{transform:translateY(-48px)}}
.room-steam{opacity:0;animation:room-steam 2.8s ease-in infinite}@keyframes room-steam{0%{opacity:0;transform:translateY(0)}30%{opacity:.7}100%{opacity:0;transform:translateY(-16px)}}
.room-tail{transform-box:fill-box;transform-origin:0 50%;animation:room-tail 2.2s ease-in-out infinite alternate}@keyframes room-tail{from{transform:rotate(-10deg)}to{transform:rotate(16deg)}}
.room-z{opacity:0;animation:room-z 3.2s ease-out infinite}@keyframes room-z{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-20px)}}
.room-glow{animation:room-glow 4s ease-in-out infinite alternate}@keyframes room-glow{from{opacity:.07}to{opacity:.17}}
.room-tw{animation:room-tw 3s steps(3) infinite}@keyframes room-tw{50%{opacity:.25}}
.room-breath{transform-box:fill-box;transform-origin:50% 100%;animation:room-br 3s ease-in-out infinite alternate}@keyframes room-br{to{transform:scaleY(1.07)}}`;

export const roomBody = () => `<rect x="1" y="1" width="218" height="198" rx="9" fill="#0F1A2E"/>
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
<ellipse cx="110" cy="188" rx="46" ry="6" fill="${P.accent}" opacity=".06"/>
<rect x="150" y="180" width="16" height="16" rx="3" fill="${P.orange}"/><path d="M166 184h4a4 4 0 0 1 0 9h-4" stroke="${P.orange}" stroke-width="2.4" fill="none"/>
<g stroke="#C9D1D9" stroke-width="1.6" fill="none" stroke-linecap="round"><path class="room-steam" d="M154 176q-3-4 0-8t0-6"/><path class="room-steam" style="animation-delay:.9s" d="M159 176q-3-4 0-8t0-6"/><path class="room-steam" style="animation-delay:1.8s" d="M164 176q-3-4 0-8t0-6"/></g>
<g class="room-breath"><ellipse cx="38" cy="187" rx="22" ry="10" fill="${P.orange}"/><circle cx="19" cy="184" r="8" fill="${P.orange}"/><path d="M13 179l1-8 6 5zM25 177l3-7 3 8z" fill="${P.orange}"/>
<path d="M15 185q2 2 4 0M22 185q2 2 4 0" stroke="#7A3B10" stroke-width="1.4" fill="none"/><path d="M30 178q4 6 0 10M40 177q4 6 0 11" stroke="#C96A28" stroke-width="2" fill="none"/></g>
<path class="room-tail" d="M58 188q10 2 12-6" stroke="${P.orange}" stroke-width="5" fill="none" stroke-linecap="round"/>
<g fill="${P.text}" font-size="9" font-weight="700"><text class="room-z" x="22" y="170">z</text><text class="room-z" style="animation-delay:1.1s" x="26" y="166" font-size="7">z</text></g>`;
