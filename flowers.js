/* Shared helpers, SVG flower illustrations, bouquet logic, envelope, letter, particles. */
const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

const Flowers = (() => {
  const TYPES = {
    rose: { name: 'Roses', emoji: '🌹', desc: 'Deep love, whispered in velvet petals.' },
    sunflower: { name: 'Sunflowers', emoji: '🌻', desc: 'Pure joy that always turns toward you.' },
    lily: { name: 'Lilies', emoji: '🌸', desc: 'Graceful, tender and softly glowing.' },
    kath: { name: 'Kath Golap (কাঠগোলাপ)', emoji: '🌷', desc: 'The sweet scent of home and memories.' },
    letter: { name: 'Letter', emoji: '', desc: 'Send a personal letter in a sealed envelope.' }
  };
  const ring = (n, f, offset = 0) => Array.from({ length: n }, (_, i) => f(i * 360 / n + offset)).join('');
  let sceneId = 0;
  const definitions = id => `<defs>
    <radialGradient id="rose-${id}" cx="32%" cy="24%" r="78%"><stop stop-color="#ffb0bd"/><stop offset=".34" stop-color="#ef4169"/><stop offset=".72" stop-color="#ae103f"/><stop offset="1" stop-color="#610b2c"/></radialGradient>
    <radialGradient id="rose-inner-${id}" cx="34%" cy="24%" r="80%"><stop stop-color="#ffc0c7"/><stop offset=".4" stop-color="#ff5278"/><stop offset="1" stop-color="#a10c39"/></radialGradient>
    <linearGradient id="sun-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e88008"/><stop offset=".32" stop-color="#ffd94b"/><stop offset=".7" stop-color="#fff28a"/><stop offset="1" stop-color="#f6a316"/></linearGradient>
    <radialGradient id="sun-core-${id}" cx="38%" cy="30%" r="72%"><stop stop-color="#a96622"/><stop offset=".42" stop-color="#573018"/><stop offset=".8" stop-color="#321b12"/><stop offset="1" stop-color="#1b100d"/></radialGradient>
    <linearGradient id="lily-${id}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fffafd"/><stop offset=".38" stop-color="#ffd7eb"/><stop offset=".76" stop-color="#f18fbd"/><stop offset="1" stop-color="#b83d76"/></linearGradient>
    <linearGradient id="plumeria-${id}" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#fffef8"/><stop offset=".52" stop-color="#fff8e9"/><stop offset=".84" stop-color="#ffd8dc"/><stop offset="1" stop-color="#f2a0ae"/></linearGradient>
    <linearGradient id="leaf-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a7d765"/><stop offset=".48" stop-color="#368b49"/><stop offset="1" stop-color="#145133"/></linearGradient>
    <linearGradient id="wrap-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c91762"/><stop offset=".48" stop-color="#ff78b6"/><stop offset="1" stop-color="#d91e70"/></linearGradient>
  </defs>`;
  const petal = (a, c) => `<path class="petal lily-petal" d="M0 0C-15-12-12-34 0-46C12-34 15-12 0 0Z" fill="${c}" stroke="#c54579" stroke-width="1" transform="rotate(${a})"/><path d="M0-5V-33" stroke="#fff9fc" opacity=".48" stroke-width="1.2" transform="rotate(${a})"/>`;
  /* Flower heads drawn around (0,0), radius about 44 */
  const head = (t, id) => ({
    rose: ring(7, a => `<g transform="rotate(${a})"><path class="petal rose-petal" d="M0 5C-12-5-30-10-29-27C-28-42-17-52-7-43C-2-56 13-54 19-42C30-36 31-21 23-10C16-2 7 4 0 5Z" fill="url(#rose-${id})" stroke="#8c1238" stroke-opacity=".68" stroke-width="1.2"/><path d="M-1 1C-10-9-18-19-15-31" fill="none" stroke="#ffd0d0" stroke-opacity=".42" stroke-width="1.3"/></g>`) +
      ring(6, a => `<g transform="rotate(${a + 30})"><path class="petal rose-petal" d="M0 3C-10-6-22-12-20-25C-18-37-7-41-1-31C8-42 22-33 20-21C18-11 8-3 0 3Z" fill="url(#rose-inner-${id})" stroke="#a31642" stroke-opacity=".7" stroke-width="1.1"/><path d="M0 0C-6-10-9-19-5-29" fill="none" stroke="#ffe0df" stroke-opacity=".48" stroke-width="1"/></g>`) +
      ring(5, a => `<path class="petal rose-petal" d="M0 2C-9-5-13-14-9-22C-5-29 3-27 4-20C12-26 17-17 12-9C9-4 4 0 0 2Z" fill="url(#rose-inner-${id})" stroke="#ff9cae" stroke-opacity=".58" stroke-width=".9" transform="rotate(${a + 20})"/>`) +
      '<circle r="6" fill="#8f0a2c"/><path d="M-5 1Q0-7 5 1M-2-3C-6-7-4-12 0-12C4-12 4-8 1-7" stroke="#ff9ecf" fill="none" stroke-linecap="round"/>',
    sunflower: ring(20, a => `<g transform="rotate(${a})"><ellipse class="petal sun-petal" cy="-31" rx="6" ry="16" fill="url(#sun-${id})" stroke="#d98512" stroke-opacity=".72"/><path d="M0-20V-45" stroke="#fff5a8" stroke-opacity=".58" stroke-width="1"/></g>`) +
      ring(18, a => `<g transform="rotate(${a + 10})"><ellipse class="petal sun-petal" cy="-27" rx="5" ry="14" fill="url(#sun-${id})" stroke="#fff5a8" stroke-opacity=".55"/><path d="M0-18V-39" stroke="#fff8be" stroke-opacity=".52" stroke-width=".8"/></g>`) +
      `<circle r="18" fill="url(#sun-core-${id})" stroke="#c28a43" stroke-width="1.2"/><circle r="12" fill="#321b12"/>` +
      ring(10, a => `<circle cy="-6" r="1.6" fill="#c98a3b" transform="rotate(${a})"/>`),
    lily: `<g class="lily-head">` + ring(3, a => petal(a + 60, `url(#lily-${id})`)) + ring(3, a => petal(a, `url(#lily-${id})`)) +
      ring(6, a => `<path d="M0 0V-20" stroke="#fbbf24" transform="rotate(${a})"/><circle cy="-21" r="2.5" fill="#d97706" transform="rotate(${a})"/>`) + '</g>',
    kath: `<g class="plumeria-head">` + ring(5, a => `<path class="petal plumeria-petal" d="M0 0C-24-6-22-38 0-44C22-38 24-6 0 0Z" fill="url(#plumeria-${id})" stroke="#e9b5b4" stroke-opacity=".72" stroke-width="1" transform="rotate(${a})"/>`) +
      ring(5, a => `<path d="M0 0C-9-4-9-24 0-30C9-24 9-4 0 0Z" fill="#ffd23f" opacity=".85" transform="rotate(${a})"/>`) +
      '<circle r="4" fill="#f59e0b"/></g>'
  })[t];

  /* Build the arrangement as an SVG string (only our own markup, never user text).
     Rule: single type with qty < 4 -> loose stems. qty >= 4, or several types -> wrapped bouquet. */
  function scene(items, focus = false, container = '') {
    const L = items.filter(i => TYPES[i.type] && i.qty > 0);
    if (!L.length) return '';
    const id = ++sceneId;
    const wrap = !container && (L.length > 1 || L[0].qty >= 4), CAP = 28;
    const left = L.map(i => ({ t: i.type, n: i.qty })), total = left.reduce((s, x) => s + x.n, 0), H = [];
    while (H.length < Math.min(total, CAP)) left.forEach(x => { if (x.n > 0 && H.length < CAP) { H.push(x.t); x.n--; } });
    const n = H.length, vessel = container === 'bottle' || container === 'vase';
    const k = wrap ? (n <= 3 ? 1.1 : Math.max(.5, 1.1 - n * .03)) : vessel ? (n <= 3 ? .82 : n <= 8 ? .72 : .6) : .95;
    const P = H.map((t, i) => {
      let a, bx, len, by = wrap ? 395 : container === 'pot' ? 340 : 400; const tier = i % 3;
      if (wrap) { a = n === 1 ? 0 : (i / (n - 1) - .5) * Math.min(80, 24 + n * 6); bx = 200; len = 150 + tier * 40; }
      else if (vessel) {
        bx = 200 + (i % 3 - 1) * 4;
        const targetX = 200 + (n === 1 ? 0 : (i / (n - 1) - .5) * Math.min(176, 100 + n * 3));
        const targetY = 176 + tier * 22, dx = targetX - bx, dy = by - targetY;
        a = Math.atan2(dx, dy) * 180 / Math.PI; len = Math.hypot(dx, dy);
      }
      else if (container === 'pot') {
        bx = 200 + (i % 3 - 1) * 12;
        const targetX = 200 + (n === 1 ? 0 : (i / (n - 1) - .5) * Math.min(150, 90 + n * 2));
        const targetY = 176 + tier * 24, dx = targetX - bx, dy = by - targetY;
        a = Math.atan2(dx, dy) * 180 / Math.PI; len = Math.hypot(dx, dy);
      }
      else { const o = i - (n - 1) / 2; bx = 200 + o * 40; a = o * 11; len = 210; }
      const r = a * Math.PI / 180, tx = bx + Math.sin(r) * len, ty = by - Math.cos(r) * len;
      return { t, i, bx, by, tx, ty, a, tier, vessel, cx: vessel ? 200 : bx + Math.sin(r) * len * .25, cy: vessel ? 310 : by - Math.cos(r) * len * .6 };
    });
    const bottleShape = 'M183 276H217V321C217 335 248 348 260 371C270 390 260 425 245 434H155C140 425 130 390 140 371C152 348 183 335 183 321Z';
    const vaseShape = 'M168 287Q200 276 232 287L224 300H216V322C216 341 242 352 255 375C269 400 255 426 238 435Q200 446 162 435C145 426 131 400 145 375C158 352 184 341 184 322V300H176Z';
    const vesselBack = container === 'bottle' ? `<path d="${bottleShape}" fill="#b9eced" fill-opacity=".2" stroke="#e4ffff" stroke-opacity=".72" stroke-width="3"/><path d="M188 281H212V322H188Z" fill="#b9eced" fill-opacity=".2"/>` : container === 'pot' ? '<ellipse cx="200" cy="337" rx="64" ry="13" fill="#492617" stroke="#efbd7e" stroke-width="3"/>' : container === 'vase' ? `<path d="${vaseShape}" fill="#6ec8b8" fill-opacity=".18" stroke="#f1d59a" stroke-opacity=".8" stroke-width="2"/>` : '';
    const stems = P.map(p => {
      const u = .45, m = (1 - u) * (1 - u), w = 2 * (1 - u) * u, v = u * u;
      const lx = m * p.bx + w * p.cx + v * p.tx, ly = m * p.by + w * p.cy + v * p.ty;
      const angle = p.i % 2 ? -35 : 35;
      const d = p.vessel ? `M${p.bx} ${p.by}Q${p.bx} 350 200 310Q200 278 ${p.tx} ${p.ty}` : `M${p.bx} ${p.by}Q${p.cx} ${p.cy} ${p.tx} ${p.ty}`;
      const leafX = p.vessel ? 200 + (p.i % 2 ? 8 : -8) : lx, leafY = p.vessel ? 352 : ly;
      return `<g class="sprig" style="--sway-delay:${p.i * -.24}s"><path d="${d}" stroke="#174c32" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="${d}" transform="translate(-1 0)" stroke="#68ae62" stroke-width="1.5" fill="none" stroke-linecap="round"/><g transform="translate(${leafX} ${leafY}) rotate(${angle})"><path class="leaf" d="M0 0C8-11 24-13 34-2C26 9 10 11 0 0Z" fill="url(#leaf-${id})" stroke="#b3d77a" stroke-opacity=".48" stroke-width=".8"/><path d="M1 0C12-2 23-3 32-2M11-2L14-7M19-2L23-8M12 0L15 5M21-1L25 3" fill="none" stroke="#c4e495" stroke-opacity=".72" stroke-width=".8"/></g><path d="M${p.bx + 2} ${p.by - 28}l-6-7m7 7 6-7" stroke="#498354" stroke-width="1.5" stroke-linecap="round"/></g>`;
    }).join('');
    const vesselFront = container === 'bottle' ? `<path d="${bottleShape}" fill="url(#bottle-gloss-${id})" fill-opacity=".26" stroke="#efffff" stroke-opacity=".68" stroke-width="2"/><path d="M159 377C154 394 159 414 168 421" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="5" stroke-linecap="round"/><path d="M183 276H217V321H183Z" fill="none" stroke="#e4ffff" stroke-opacity=".55" stroke-width="2"/>` : container === 'pot' ? `<path d="M140 340H260L246 423Q200 445 154 423Z" fill="url(#pot-glaze-${id})" stroke="#ffd6a2" stroke-width="3"/><path d="M140 340H260L255 355H145Z" fill="#df9b59" stroke="#ffe0b7" stroke-width="2"/><path d="M158 365L168 418M242 365L232 418" stroke="#fff0cc" stroke-opacity=".35" stroke-width="3"/>` : container === 'vase' ? `<path d="${vaseShape}" fill="url(#vase-gloss-${id})" fill-opacity=".64" stroke="#f1d59a" stroke-opacity=".92" stroke-width="2.5"/><path d="M168 287Q200 300 232 287M176 300Q200 309 224 300M184 323Q200 329 216 323" fill="none" stroke="#f5d894" stroke-opacity=".9" stroke-width="2"/><path d="M200 350C178 363 221 374 200 388C180 401 200 410 200 425M195 362C183 352 177 359 184 367C190 372 196 367 195 362ZM205 378C217 368 224 376 216 384C210 389 204 384 205 378ZM195 397C183 388 177 395 184 403C190 408 196 403 195 397ZM205 414C217 405 224 412 216 420C210 425 204 420 205 414Z" fill="none" stroke="#f6d996" stroke-opacity=".82" stroke-width="2" stroke-linecap="round"/><circle cx="200" cy="388" r="3.5" fill="#f7dda1"/><path d="M159 407Q200 428 241 407" fill="none" stroke="#f5d894" stroke-opacity=".65" stroke-width="1.5"/>` : '';
    const heads = [...P].sort((p, q) => q.tier - p.tier).map(p =>
      `<g class="flower-touch" data-flower="${p.t}" transform="translate(${p.tx} ${p.ty}) rotate(${p.a}) scale(${k})"><g class="bloom" style="--sway-delay:${p.i * -.31}s">${head(p.t, id)}</g></g>`).join('');
    const cone = wrap ? `<path d="M118 290L282 290L224 428L176 428Z" fill="url(#wrap-${id})" opacity=".96"/><path d="M118 290L200 360L282 290" fill="#fff1f7" opacity=".24"/><path d="M133 296L185 420M267 296L215 420M200 300V428" stroke="#9e174f" stroke-opacity=".4" stroke-width="2"/><path d="M122 291L200 359L278 291" fill="none" stroke="#ffe3ef" stroke-opacity=".8" stroke-width="3"/><g transform="translate(200 322)"><path d="M0 0C-23-23-38-13-34 4C-30 17-11 11 0 0C23-23 38-13 34 4C30 17 11 11 0 0Z" fill="#ed2f83" stroke="#ffd7ec" stroke-width="1.5"/><circle r="7" fill="#ffb4d5"/></g>` : '';
    const more = total > CAP ? `<text x="200" y="${container ? 418 : 446}" fill="#ffd7ec" font-size="14" text-anchor="middle">+${total - CAP} more ${container ? 'inside' : 'in this bouquet'}</text>` : '';
    const viewBox = focus && !wrap ? '85 95 230 320' : '0 0 400 450';
    const vesselDefs = container === 'bottle' ? `<linearGradient id="bottle-gloss-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e8ffff" stop-opacity=".18"/><stop offset=".22" stop-color="#fff" stop-opacity=".5"/><stop offset=".52" stop-color="#80dbe2" stop-opacity=".12"/><stop offset=".82" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#68b9c9" stop-opacity=".22"/></linearGradient>` : container === 'vase' ? `<linearGradient id="vase-gloss-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b9f4e3" stop-opacity=".78"/><stop offset=".2" stop-color="#38a99c" stop-opacity=".68"/><stop offset=".44" stop-color="#d8fff0" stop-opacity=".78"/><stop offset=".7" stop-color="#20877f" stop-opacity=".72"/><stop offset=".88" stop-color="#b9f4e3" stop-opacity=".84"/><stop offset="1" stop-color="#58b8a9" stop-opacity=".7"/></linearGradient>` : container === 'pot' ? `<linearGradient id="pot-glaze-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2a55d"/><stop offset=".45" stop-color="#bc5839"/><stop offset="1" stop-color="#753329"/></linearGradient>` : '';
    const gradients = vesselDefs;
    const aria = container ? `${container} flower arrangement` : 'Flower arrangement';
    return `<svg class="arrangement" viewBox="${viewBox}" role="img" aria-label="${aria}">${definitions(id)}${gradients}${vesselBack}${stems}${cone}${vesselFront}${heads}${more}</svg>`;
  }

  /* Pink envelope; clicking plays an open animation, then calls fn */
  function envelope(fn, label = 'A little note for you', ariaLabel = 'Open the note') {
    const w = el('div', 'envwrap'), b = el('button', 'env');
    b.type = 'button'; b.setAttribute('aria-label', ariaLabel);
    b.append(el('i', 'flap'), el('i', 'seal', '❤'));
    b.onclick = () => {
      if (document.querySelector('.note-overlay')) return;
      b.disabled = true; b.classList.add('open');
      setTimeout(() => { b.classList.remove('open'); b.disabled = false; fn(w); }, 650);
    };
    w.append(b, el('small', '', label));
    return w;
  }
  return { TYPES, scene, envelope };
})();

/* Letter overlay with typewriter animation. Uses textContent only (no HTML injection). */
const Letter = {
  open(text, { kind = 'note', onKeep = () => {}, onExpire = () => {}, onDismiss = () => {}, autoDismissMs = 8000 } = {}) {
    const o = el('div', 'overlay note-overlay'), paper = el('div', 'letter'), p = el('p', 'script');
    const prompt = el('small', 'note-prompt', 'Keep it, or let it fade away.');
    const keep = el('button', 'btn keep-note', kind === 'letter' ? 'Keep the letter' : 'Keep the note');
    keep.type = 'button'; keep.hidden = true;
    paper.append(p, prompt, keep); o.append(paper); document.body.append(o);
    const chars = (window.Intl && Intl.Segmenter)
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), s => s.segment) : Array.from(text);
    let i = 0, finished = false, dismissed = false, t, expiry;
    const close = callback => {
      if (dismissed) return;
      dismissed = true; clearInterval(t); clearTimeout(expiry);
      document.removeEventListener('keydown', onKeyDown); o.remove(); callback();
    };
    const onKeyDown = e => { if (e.key === 'Escape') close(finished ? onExpire : onDismiss); };
    t = setInterval(() => {
      p.textContent = chars.slice(0, ++i).join('');
      if (i >= chars.length) {
        clearInterval(t); finished = true; keep.hidden = false;
        expiry = setTimeout(() => close(onExpire), autoDismissMs);
      }
    }, 55);
    keep.onclick = () => close(onKeep);
    o.onclick = e => { if (e.target === o) close(finished ? onExpire : onDismiss); };
    document.addEventListener('keydown', onKeyDown);
  }
};

/* Floating hearts and petals */
const Fx = {
  start() {
    const f = $('#fx'), S = ['❤', '💗', '🌸', '✦', '❀'];
    setInterval(() => {
      if (document.hidden || f.children.length > 24) return;
      const s = el('span', '', S[Math.random() * S.length | 0]);
      s.style.cssText = `left:${Math.random() * 100}%;font-size:${10 + Math.random() * 18}px;color:${Math.random() < .5 ? '#ff2f92' : '#ff9ecf'};--dx:${Math.random() * 160 - 80}px;animation-duration:${9 + Math.random() * 8}s`;
      s.onanimationend = () => s.remove(); f.append(s);
    }, 700);
  }
};
