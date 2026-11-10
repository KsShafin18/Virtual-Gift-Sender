/* Special gifts: Magic Moon, Dancing Couple Snow Globe and Kidney Gift.
   Every piece is one small inline SVG; gradients live once in a shared sprite and all motion is CSS. */
const Specials = (() => {
  const T = {
    moon: { name: 'Magic Moon', emoji: '🌙', desc: 'A soft, glowing moon that shines for you. Tap it to make it glow brighter.',
      opts: [['glass', 'Round Glass'], ['feet', 'Under the Feet'], ['holder', 'Moon Holder'], ['discard', 'Throw Away']] },
    snowglobe: { name: 'Dancing Couple Snow Globe', emoji: '💃', desc: 'A romantic couple dancing in a sparkling, snowy globe.',
      opts: [['play', 'Play'], ['discard', 'Throw Away']] },
    kidney: { name: 'Kidney Gift', emoji: '🫀', desc: 'A kidney, safely kept inside a glass box. Give it a tap.',
      opts: [['message', 'Gift Message'], ['discard', 'Throw Away']] }
  };
  const MSG = ['Someone gifted you a kidney! 💝', 'A kidney, specially gifted to you. 🫀'];
  const has = t => Object.prototype.hasOwnProperty.call(T, t);
  const st = (a, b) => `<stop offset="${a}" stop-color="${b}"/>`;
  const rg = (id, p, ...s) => `<radialGradient id="sp-${id}" ${p}>${s.join('')}</radialGradient>`;
  const lg = (id, p, ...s) => `<linearGradient id="sp-${id}" ${p}>${s.join('')}</linearGradient>`;
  const DEFS = `<svg id="sp-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
    ${rg('halo', '', '<stop stop-color="#fff6c8" stop-opacity=".95"/>', '<stop offset=".35" stop-color="#ffe9a0" stop-opacity=".42"/>', '<stop offset="1" stop-color="#ffd27a" stop-opacity="0"/>')}
    ${rg('moon', 'cx=".35" cy=".3" r=".85"', st(0, '#fffef2'), st(.55, '#f4e6b0'), st(1, '#c9ad65'))}
    ${rg('crater', 'cx=".35" cy=".3"', '<stop stop-color="#d9c58a" stop-opacity=".1"/>', '<stop offset="1" stop-color="#a88f52" stop-opacity=".55"/>')}
    ${rg('sphere', 'cx=".35" cy=".3" r=".8"', '<stop offset=".5" stop-color="#2a1a40" stop-opacity="0"/>', '<stop offset="1" stop-color="#2a1a40" stop-opacity=".62"/>')}
    ${rg('glass', 'cx=".32" cy=".26" r=".85"', '<stop offset=".55" stop-color="#fff" stop-opacity=".02"/>', '<stop offset=".9" stop-color="#cfe6ff" stop-opacity=".16"/>', '<stop offset="1" stop-color="#fff" stop-opacity=".42"/>')}
    ${lg('gold', 'x1="0" y1="0" x2="1" y2="0"', st(0, '#8a5a1c'), st(.3, '#f6d78a'), st(.55, '#c99436'), st(1, '#6e4512'))}
    ${lg('goldtop', 'x1="0" y1="0" x2="0" y2="1"', st(0, '#fff0b8'), st(1, '#c99436'))}
    ${lg('wood', 'x1="0" y1="0" x2="1" y2="0"', st(0, '#5a2a14'), st(.35, '#b0683a'), st(.7, '#8a4a26'), st(1, '#43200f'))}
    ${rg('night', 'cx=".5" cy=".3" r=".85"', st(0, '#6b2f86'), st(.55, '#2e1458'), st(1, '#150a33'))}
    ${lg('gown', 'x1="0" y1="0" x2="1" y2="1"', st(0, '#ff7aa8'), st(.5, '#e5246b'), st(1, '#9e0f4a'))}
    ${lg('suit', 'x1="0" y1="0" x2="1" y2="0"', st(0, '#2a2352'), st(1, '#120d2c'))}
    ${rg('kid', 'cx=".32" cy=".28" r=".95"', st(0, '#e0705f'), st(.35, '#b83a3a'), st(.75, '#7d1a22'), st(1, '#4d0c15'))}
    ${rg('blood', '', '<stop stop-color="#ff1a1a" stop-opacity="1"/>', '<stop offset=".55" stop-color="#c40c0c" stop-opacity=".75"/>', '<stop offset="1" stop-color="#7a0000" stop-opacity="0"/>')}
    ${lg('boxglass', 'x1="0" y1="0" x2="1" y2="1"', '<stop stop-color="#fff" stop-opacity=".34"/>', '<stop offset=".5" stop-color="#cfe6ff" stop-opacity=".07"/>', '<stop offset="1" stop-color="#fff" stop-opacity=".24"/>')}
    ${lg('slab', 'x1="0" y1="0" x2="0" y2="1"', st(0, '#3b2a44'), st(1, '#150d1b'))}
    <clipPath id="sp-globeclip"><circle cx="100" cy="98" r="79"/></clipPath><clipPath id="sp-moonclip"><circle cx="100" cy="92" r="46"/></clipPath></defs></svg>`;
  function register() {
    Object.entries(T).forEach(([k, v]) => Object.prototype.hasOwnProperty.call(Flowers.TYPES, k) ||
      Object.defineProperty(Flowers.TYPES, k, { value: { name: v.name, emoji: v.emoji, desc: v.desc, special: true }, enumerable: true, configurable: true }));
    if (!document.getElementById('sp-defs')) document.body.insertAdjacentHTML('beforeend', DEFS);
  }
  /* ---------- Moon ---------- */
  const CR = [[-.35, -.3, .2], [.28, -.45, .14], [.1, .15, .24], [-.45, .25, .13], [.5, .2, .15], [-.05, -.62, .1], [.3, .58, .11]];
  const craters = (cx, cy, r) => CR.map(([x, y, s]) => `<ellipse cx="${cx + x * r}" cy="${cy + y * r}" rx="${s * r}" ry="${s * r * .92}" fill="url(#sp-crater)"/>`).join('');
  const twinkle = '<path class="tw" d="M28 46l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff6c8"/><path class="tw t2" d="M170 62l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#fff6c8"/><path class="tw t3" d="M156 150l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" fill="#fff6c8"/>';
  const moonDisc = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sp-moon)"/>${craters(cx, cy, r)}<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sp-sphere)"/><circle class="shine" cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>`;
  const moon = opt => {
    if (opt === 'glass') return `<svg class="sp-svg" viewBox="0 0 200 200"><ellipse cx="100" cy="188" rx="52" ry="9" fill="#000" opacity=".3"/><path d="M66 176h68l8 14H58z" fill="url(#sp-gold)"/><ellipse cx="100" cy="176" rx="36" ry="6" fill="url(#sp-goldtop)"/>` +
      `<circle cx="100" cy="92" r="84" fill="#1a1040" opacity=".35"/><circle class="halo" cx="100" cy="92" r="76" fill="url(#sp-halo)"/>${moonDisc(100, 92, 36)}<circle cx="100" cy="92" r="84" fill="url(#sp-glass)" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>` +
      `<path d="M42 62A62 62 0 0 1 86 26" stroke="#fff" stroke-opacity=".75" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M150 140A62 62 0 0 1 128 160" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>${twinkle}</svg>`;
    if (opt === 'holder') return `<svg class="sp-svg" viewBox="0 0 200 200"><ellipse cx="100" cy="192" rx="62" ry="8" fill="#000" opacity=".3"/><ellipse cx="100" cy="184" rx="58" ry="12" fill="url(#sp-gold)"/><ellipse cx="100" cy="181" rx="58" ry="11" fill="url(#sp-goldtop)"/>` +
      `<rect x="95" y="146" width="10" height="36" fill="url(#sp-gold)"/><path d="M60 160A66 66 0 0 1 124 30" stroke="url(#sp-gold)" stroke-width="5" fill="none" stroke-linecap="round"/><circle class="halo" cx="100" cy="92" r="78" fill="url(#sp-halo)"/>` +
      `<g transform="rotate(-22 100 92)"><g clip-path="url(#sp-moonclip)"><g class="rot"><rect x="40" y="40" width="190" height="104" fill="#efdca0"/>${craters(100, 92, 46)}${craters(192, 92, 46)}</g></g><circle cx="100" cy="92" r="46" fill="url(#sp-sphere)"/><circle class="shine" cx="100" cy="92" r="46" fill="#fff"/></g>` +
      `<circle cx="124" cy="30" r="4" fill="url(#sp-goldtop)"/><circle cx="76" cy="154" r="4" fill="url(#sp-goldtop)"/>${twinkle}</svg>`;
    if (opt === 'feet') return '';
    return `<svg class="sp-svg" viewBox="0 0 200 200"><circle class="halo" cx="100" cy="100" r="96" fill="url(#sp-halo)"/>${moonDisc(100, 100, 54)}${twinkle}</svg>`;
  };
  /* the moon the flowers (or a tiny dreamer) stand on */
  const feet = figure => `<div class="moon-feet sp" data-sp="moon" data-opt="feet" role="button" tabindex="0" aria-label="Tap the moon"><svg class="sp-svg" viewBox="0 0 320 130"><circle class="halo" cx="160" cy="210" r="190" fill="url(#sp-halo)"/>` +
    `<circle cx="160" cy="210" r="168" fill="url(#sp-moon)"/>${craters(160, 210, 168).replace(/<ellipse/g, m => m)}<circle cx="160" cy="210" r="168" fill="url(#sp-sphere)"/><circle class="shine" cx="160" cy="210" r="168" fill="#fff"/>` +
    (figure ? '<g fill="#2a1245"><circle cx="160" cy="14" r="5"/><path d="M160 20l-12 26h24z"/><path d="M155 12q-9 2-8 12" stroke="#2a1245" stroke-width="2.4" fill="none"/><path d="M165 24l10-10" stroke="#2a1245" stroke-width="2.2"/></g><path class="tw" d="M178 6l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z" fill="#fff6c8"/>' : '') + '</svg></div>';
  /* ---------- Snow globe ---------- */
  const flakes = Array.from({ length: 22 }, (_, i) => { const r = (i * 37 % 100) / 100; return `<circle class="sf" cx="${24 + (i * 53 % 152)}" cy="${20 + r * 20}" r="${(1 + (i % 3) * .7).toFixed(1)}" fill="#fff" style="animation-delay:${(-r * 6).toFixed(2)}s;animation-duration:${(4 + (i % 5) * .8).toFixed(1)}s"/>`; }).join('');
  const globe = opt => `<svg class="sp-svg${opt === 'play' ? ' playing' : ''}" viewBox="0 0 200 240"><ellipse cx="100" cy="232" rx="68" ry="7" fill="#000" opacity=".3"/>` +
    `<path d="M44 186h112l14 40H30z" fill="url(#sp-wood)"/><ellipse cx="100" cy="186" rx="56" ry="9" fill="url(#sp-gold)"/><rect x="74" y="203" width="52" height="14" rx="3" fill="url(#sp-goldtop)" opacity=".92"/><path d="M100 213c-7-5-9-8-6-10 2-1 5 0 6 2 1-2 4-3 6-2 3 2 1 5-6 10z" fill="#c4123f"/>` +
    `<circle cx="100" cy="98" r="80" fill="url(#sp-night)"/><g clip-path="url(#sp-globeclip)"><g fill="#fff" opacity=".8"><circle cx="50" cy="52" r="1"/><circle cx="148" cy="46" r="1.2"/><circle cx="76" cy="34" r=".9"/><circle cx="126" cy="64" r=".9"/></g>` +
    `<ellipse cx="100" cy="176" rx="92" ry="22" fill="#f4eefb"/><ellipse cx="100" cy="172" rx="70" ry="9" fill="#fff"/>` +
    `<g class="couple"><path class="gown" d="M108 114C98 122 92 146 80 168C102 178 132 176 144 166C134 148 128 124 116 114Z" fill="url(#sp-gown)"/><path d="M96 150q16 8 40 0" stroke="#ffd1e0" stroke-opacity=".6" fill="none"/>` +
    `<ellipse cx="112" cy="102" rx="7" ry="8" fill="#f2cdb0"/><path d="M104 100c-1-9 7-13 13-9 4 3 3 8 1 10-3-5-9-4-14-1z" fill="#2a1423"/><circle cx="106" cy="92" r="4" fill="#2a1423"/>` +
    `<path d="M108 112q4 4 8 0l3 12q-7 4-14 0z" fill="#ff7aa8"/>` +
    `<path d="M76 118h20l4 30-5 22h-7l-3-18-3 18h-7l4-22z" fill="url(#sp-suit)"/><ellipse cx="86" cy="104" rx="7" ry="8" fill="#f2cdb0"/><path d="M79 103c0-9 14-10 15-1-5-3-10-3-15 1z" fill="#150f22"/>` +
    `<path d="M95 120l14 2-1 7-14-3z" fill="#150f22"/><path d="M96 124l12 4" stroke="#f2cdb0" stroke-width="3" stroke-linecap="round"/><path d="M92 118l12-6" stroke="#150f22" stroke-width="4" stroke-linecap="round"/><circle cx="106" cy="110" r="2.2" fill="#f2cdb0"/></g>` +
    `<g class="snow">${flakes}</g></g><circle cx="100" cy="98" r="80" fill="url(#sp-glass)" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/><path d="M38 70A64 64 0 0 1 82 30" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<g class="gsp"><path class="tw" d="M20 40l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff"/><path class="tw t2" d="M176 30l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#ffe3f1"/><path class="tw t3" d="M180 118l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" fill="#fff"/></g></svg>`;
  /* ---------- Kidney in a glass box ---------- */
  const KID = 'M-9 -48C22 -54 44 -30 42 2C40 32 20 52 -8 48C-32 44 -32 24 -17 14C-4 6 -5 -6 -17 -14C-34 -27 -30 -43 -9 -48Z';
  const kidney = () => `<svg class="sp-svg" viewBox="0 0 220 220"><ellipse cx="116" cy="206" rx="86" ry="9" fill="#000" opacity=".35"/><path d="M18 188l20-14h150l-18 14z" fill="url(#sp-slab)"/><rect x="18" y="188" width="132" height="10" rx="2" fill="#241730"/>` +
    `<path d="M40 56h150v118H40z" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".28"/><path d="M18 70l22-14M150 70l40-14M150 188l40-14M18 188l22-14" stroke="#fff" stroke-opacity=".4"/>` +
    `<g transform="translate(106 118)"><g class="blood"><circle r="96" fill="url(#sp-blood)"/>${[[-62, -20, 11], [-48, 38, 8], [58, -30, 10], [66, 24, 7], [0, -66, 9], [14, 62, 10], [-28, -52, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#b50d0d" opacity=".85"/>`).join('')}${[-52, -26, 0, 26, 52].map((x, i) => `<ellipse class="drip" cx="${x}" cy="${-46 + i % 2 * 12}" rx="3.4" ry="6.4" fill="#c21010" style="animation-delay:${i * .16}s"/>`).join('')}</g></g>` +
    `<g transform="translate(106 118) rotate(18) scale(1.18)"><g class="kid-body"><path d="M-14 -4C-32 -10-48 4-52 22" stroke="#e8c9a0" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(30 20)"/><path d="M-4 -2C-24 -22-30 -50-22 -66" stroke="#b3202a" stroke-width="7" fill="none" stroke-linecap="round" transform="translate(8 6)"/><path d="M0 4C-30 -10-44 -36-44 -60" stroke="#5a3a8a" stroke-width="8" fill="none" stroke-linecap="round" transform="translate(20 12)" opacity=".92"/>` +
    `<path d="${KID}" fill="url(#sp-kid)" stroke="#4d0c15" stroke-width="1.4"/><g fill="none" stroke="#6a1018" stroke-opacity=".5" stroke-width="1"><path d="M0 -40C20 -34 30 -20 30 0M10 -30C30 -20 36 0 30 22M-4 38C14 34 28 20 32 6"/></g>` +
    `<ellipse cx="8" cy="-26" rx="12" ry="22" fill="#fff" fill-opacity=".22" transform="rotate(14 8 -26)"/></g></g>` +
    `<path d="M18 70h150v118H18z" fill="url(#sp-boxglass)" stroke="#fff" stroke-opacity=".62" stroke-width="1.6"/><path d="M18 70l22-14h150l-22 14z" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-opacity=".5"/><path d="M168 70l22-14v118l-22 14z" fill="#cfe6ff" fill-opacity=".12" stroke="#fff" stroke-opacity=".4"/>` +
    `<path d="M32 82l36-8M30 150l60-60" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></svg>`;
  const art = (type, opt = '', demo = false) => {
    const body = type === 'moon' ? moon(opt) : type === 'snowglobe' ? globe(demo ? 'play' : opt) : kidney();
    return `<div class="sp sp-${type}" data-sp="${type}" data-opt="${opt}" role="button" tabindex="0" aria-label="${T[type].name}. Tap to interact">${body}</div>`;
  };
  const row = types => `<div class="sp-row">${types.map(t => art(t, '', true)).join('')}</div>`;
  /* ---------- tap effects ---------- */
  function enableTouch(root, { enabled = () => true } = {}) {
    const fire = el => {
      const t = el.dataset.sp, svg = el.querySelector('svg');
      if (t === 'moon') { el.classList.add('boost'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('boost'), 1800); }
      else if (t === 'kidney') {
        el.classList.remove('bleed'); void el.offsetWidth; el.classList.add('bleed');
        clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('bleed'), 2800);
      } else if (t === 'snowglobe' && svg) {
        el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
        if (!svg.classList.contains('playing')) { svg.classList.add('playing', 'temp'); clearTimeout(el._t); el._t = setTimeout(() => svg.classList.remove('playing', 'temp'), 4500); }
      }
    };
    const pick = e => { const el = e.target.closest?.('.sp'); return el && root.contains(el) && enabled() ? el : null; };
    root.addEventListener('click', e => { const el = pick(e); if (el) fire(el); });
    root.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.sp') && enabled()) { e.preventDefault(); fire(e.target); } });
  }
  return { T, MSG, has, register, art, row, feet, enableTouch };
})();
