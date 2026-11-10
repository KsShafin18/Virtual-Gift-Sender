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
  let sceneId = 0;
  const models = new Map();
  const modelFolder = 'models/flowers_Model/';
  /* Head size multiplier and petal colours (used by the tap effect). Unknown flowers get the defaults. */
  const STYLE = {
    rose: { s: 1, c: ['#c4143f', '#e84a6f', '#ffb0c0'] }, sunflower: { s: 1.16, c: ['#ffc61a', '#ff9f0a', '#ffe27a'] },
    lily: { s: 1.06, c: ['#f08fbb', '#ffd9ea', '#ffffff'] }, kath: { s: 1.02, c: ['#fff6e0', '#ffd84a', '#f9c9d2'] },
    'cherry-blossom': { s: .92, c: ['#ffb3cf', '#ffd6e4', '#fff4f8'] }, cosmos: { s: .94, c: ['#d92f84', '#f56aa8', '#ffb0d0'] },
    daisy: { s: .86, c: ['#ffffff', '#f4f0f8', '#ffd84a'] }, hibiscus: { s: 1.06, c: ['#c4123a', '#ec2f55', '#ff7d8e'] },
    lotus: { s: 1.06, c: ['#f27aa8', '#ffd2e3', '#ffffff'] }, peony: { s: 1.1, c: ['#e07a9f', '#f4b2c8', '#fde6ee'] }
  };
  const DEF_STYLE = { s: 1, c: ['#ff5fa8', '#ffb3d5', '#ffffff'] };
  const styleOf = t => STYLE[t] || { ...DEF_STYLE, c: models.get(t)?.accent ? [models.get(t).accent, ...DEF_STYLE.c] : DEF_STYLE.c };
  const kindOf = t => models.get(t)?.kind || 'flower';

  function cleanModelSVG(svg, file) {
    const clean = svg.cloneNode(true);
    clean.querySelectorAll('script,foreignObject,iframe,object,embed,image,style,animate,animateMotion,animateTransform,set')
      .forEach(node => node.remove());
    [clean, ...clean.querySelectorAll('*')].forEach(node => [...node.attributes].forEach(attribute => {
      const key = attribute.name.toLowerCase(), value = attribute.value.trim();
      const unsafeURL = /url\s*\(\s*(['"]?)(?!#)/i.test(value);
      if (key.startsWith('on') ||
        (key === 'href' || key === 'xlink:href') && !value.startsWith('#') ||
        key === 'style' && (/@import|expression\s*\(|javascript:/i.test(value) || unsafeURL) ||
        ['fill', 'stroke', 'filter', 'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end'].includes(key) && unsafeURL) {
        node.removeAttribute(attribute.name);
      }
    }));
    const viewBox = clean.getAttribute('viewBox') || '';
    const values = viewBox.trim().split(/\s+/).map(Number);
    if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0)
      throw new Error(`Flower model "${file}" must have a valid four-number SVG viewBox.`);
    return clean;
  }

  /* ---------- colour variants ----------
     A variant is the same artwork recoloured at load time and registered as its own (hidden) type, e.g. "rose-yellow".
     Because it is a normal type, mixed colours, gift links and the receiver's arrangement need no special handling,
     and the original "rose" (red) keeps working for every existing link. */
  const VARIANTS = {
    rose: {
      base: { label: 'Red', swatch: '#d41a47' },
      list: [
        { id: 'yellow', label: 'Yellow', swatch: '#f7c70f', name: 'Yellow Roses', c: ['#f2b705', '#ffd84a', '#fff0a0'], fn: (h, s, l) => [38 + l * 14, Math.min(1, Math.max(s, .55)) * .95, Math.min(.96, l * .9 + .1)] },
        { id: 'pink', label: 'Pink', swatch: '#f58bb3', name: 'Pink Roses', c: ['#f06fa0', '#f8a6c6', '#ffd6e6'], fn: (h, s, l) => [332, s * .7, .24 + l * .72] },
        { id: 'white', label: 'White', swatch: '#f6f1f3', name: 'White Roses', c: ['#ffffff', '#f1e9ee', '#d9ccd3'], fn: (h, s, l) => [345, Math.min(s, .5) * .1, .5 + l * .5] },
        { id: 'black', label: 'Black', swatch: '#24151b', name: 'Black Roses', c: ['#2a1119', '#4a2331', '#7d4a5c'], fn: (h, s, l) => [348, Math.min(.4, s * .5), l * .38 + .03] }
      ]
    }
  };
  /* Wooden roses: the rose artwork recoloured to carved wood (or lacquered in a colour) with a grain texture on top. */
  const WOOD_FILTER = '<defs><filter id="woodGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="2" seed="7" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 .22  0 0 0 0 .11  0 0 0 0 .04  1.25 0 0 0 -.42" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gr"/>' +
    '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gr"/></feMerge></filter></defs>';
  const lacquer = (h, s, l) => [h, s, l];
  VARIANTS['wood-rose'] = {
    from: 'rose', overlay: m => `${WOOD_FILTER}<g filter="url(#woodGrain)">${m}</g>`,
    name: 'Wooden Roses', emoji: '🌹', desc: 'Hand-carved roses that never wilt.',
    base: { label: 'Natural', swatch: '#b8834c', fn: (h, s, l) => [25 + l * 12, .46 + .16 * l, .1 + l * .66], c: ['#9a6a3a', '#c99a62', '#e6c597'] },
    list: [{ id: 'red', label: 'Red', swatch: '#d41a47', name: 'Red Wooden Roses', c: ['#c4143f', '#e84a6f', '#ffb0c0'], fn: lacquer }, ...VARIANTS.rose.list.map(v => ({ ...v, name: v.label + ' Wooden Roses' }))]
  };
  const hexToHsl = hex => {
    let h = hex.slice(1); if (h.length === 3) h = [...h].map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let hue = 0, sat = 0;
    if (d) {
      sat = d / (1 - Math.abs(2 * l - 1));
      hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hue = (hue * 60 + 360) % 360;
    }
    return [hue, sat, l];
  };
  const hslToHex = (h, s, l) => {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
  };
  const recolor = (markup, fn) => markup.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g, m => hslToHex(...fn(...hexToHsl(m))));
  function registerVariants() {
    const add = (key, t, m, fn, c, enumerable, extra = {}) => {
      if (models.has(key) || Object.prototype.hasOwnProperty.call(TYPES, key)) return;
      Object.defineProperty(TYPES, key, { value: { name: t.name, emoji: t.emoji, desc: t.desc, ...extra }, enumerable, configurable: true });
      models.set(key, { ...m, markup: recolor(m.markup, fn), accent: c[0] });
      return key;
    };
    Object.entries(VARIANTS).forEach(([type, cfg]) => {
      const src = cfg.from || type, m = models.get(src), t = TYPES[src];
      if (!m || !t) return;
      const wrap = (key, fn, c) => { const k = add(key, key === type ? { ...t, ...cfg } : { ...t, name: cfg.list.find(v => `${type}-${v.id}` === key).name }, m, fn, c, key === type, key === type ? {} : { variantOf: type });
        if (k && cfg.overlay) models.get(k).markup = cfg.overlay(models.get(k).markup);
        if (k) STYLE[k] = { s: (STYLE[src] || DEF_STYLE).s, c }; };
      if (cfg.from) wrap(type, cfg.base.fn, cfg.base.c);
      cfg.list.forEach(v => wrap(`${type}-${v.id}`, v.fn, v.c));
    });
  }
  const variantsOf = type => VARIANTS[type]
    ? [{ key: type, ...VARIANTS[type].base }, ...VARIANTS[type].list.map(v => ({ key: `${type}-${v.id}`, label: v.label, swatch: v.swatch }))]
    : [{ key: type }];

  async function loadModels() {
    let files = [];
    try {
      const response = await fetch(modelFolder, { cache: 'no-store' });
      if (response.ok) {
        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
        files = [...page.querySelectorAll('a[href]')].map(link => {
          const url = new URL(link.getAttribute('href'), new URL(modelFolder, location.href));
          return url.origin === location.origin && url.pathname.startsWith(new URL(modelFolder, location.href).pathname)
            ? decodeURIComponent(url.pathname.slice(new URL(modelFolder, location.href).pathname.length)) : '';
        }).filter(file => /^[A-Za-z0-9][A-Za-z0-9_-]*\.html$/i.test(file));
      }
    } catch (error) {
      console.warn('Flower model directory listing is unavailable; trying the generated catalog.', error);
    }

    if (!files.length) {
      const response = await fetch(modelFolder + 'manifest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Flower model catalog could not be loaded (${response.status}).`);
      const catalog = await response.json();
      if (!Array.isArray(catalog)) throw new Error('Flower model catalog has an invalid format.');
      files = catalog.map(entry => {
        if (!entry || typeof entry.file !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*\.html$/i.test(entry.file))
          throw new Error('Flower model catalog contains an invalid file entry.');
        return `${entry.file}?v=${encodeURIComponent(String(entry.version || ''))}`;
      });
    }

    for (const file of files) {
      const response = await fetch(modelFolder + file, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Flower model "${file.split('?')[0]}" could not be loaded (${response.status}).`);
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const meta = name => page.querySelector(`meta[name="${name}"]`)?.content.trim() || '';
      const id = meta('flower-id'), name = meta('flower-name'), desc = meta('flower-description');
      const svg = page.querySelector('template#flower-art')?.content.querySelector('svg');
      if (!/^[a-z][a-z0-9-]*$/.test(id) || ['letter', 'constructor', 'prototype'].includes(id) || !name || !desc || !svg)
        throw new Error(`Flower model "${file.split('?')[0]}" is missing valid metadata or its flower-art SVG template.`);
      const previous = models.get(id);
      if (previous) throw new Error(`Duplicate flower model id "${id}" in ${previous.file} and ${file}.`);
      const clean = cleanModelSVG(svg, file.split('?')[0]);
      Object.defineProperty(TYPES, id, { value: { name, emoji: meta('flower-emoji'), desc }, enumerable: true, configurable: true });
      const kind = meta('flower-kind') || (id.startsWith('cactus') ? 'cactus' : 'flower');
      models.set(id, { file: file.split('?')[0], viewBox: clean.getAttribute('viewBox'), markup: clean.innerHTML, kind, accent: meta('flower-accent') });
    }
      registerVariants();
    buildSprite();
  }

  /* All flower artwork is stored once as an SVG <symbol>; every flower on screen is a tiny <use> of it.
     The DOM stays small and each flower rasterises once, so animations only move cached layers. */
  function buildSprite() {
    document.getElementById('flower-sprite')?.remove();
    const symbols = [...models].map(([type, m]) => {
      const p = `fm-${type}-`;
      const markup = m.markup
        .replace(/\bid=(["'])(.*?)\1/g, (_, q, v) => `id=${q}${p}${v}${q}`)
        .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
        .replace(/(href|xlink:href)=(["'])#([^"']+)\2/g, (_, a, q, v) => `${a}=${q}#${p}${v}${q}`);
      return `<symbol id="fm-${type}" viewBox="${m.viewBox}" overflow="visible">${markup}</symbol>`;
    }).join('');
    document.body.insertAdjacentHTML('beforeend',
      `<svg id="flower-sprite" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">${symbols}</svg>`);
  }
  const headSVG = (type, rot) => models.has(type)
    ? `<svg class="hd" viewBox="${models.get(type).viewBox}" aria-hidden="true" focusable="false" style="transform:rotate(${rot}deg)"><use href="#fm-${type}"/></svg>`
    : `<svg class="hd" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="30" fill="#ff7fb8"/><circle r="8" fill="#ffd23f"/></svg>`;

  /* ---------- geometry helpers (all coordinates live in a 400 x 450 design space) ---------- */
  const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const n2 = v => Math.round(v * 100) / 100;
  const cubic = (p0, p1, p2, p3, u) => {
    const m = 1 - u, a = m * m * m, b = 3 * m * m * u, c = 3 * m * u * u, d = u * u * u;
    return { x: a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], y: a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
      tx: 3 * m * m * (p1[0] - p0[0]) + 6 * m * u * (p2[0] - p1[0]) + 3 * u * u * (p3[0] - p2[0]),
      ty: 3 * m * m * (p1[1] - p0[1]) + 6 * m * u * (p2[1] - p1[1]) + 3 * u * u * (p3[1] - p2[1]) };
  };
  const take = (list, cap) => {
    const left = list.map(i => ({ t: i.type, n: i.qty })), out = [];
    for (let more = true; out.length < cap && more;) {
      more = false;
      left.forEach(x => { if (x.n > 0 && out.length < cap) { out.push(x.t); x.n--; more = true; } });
    }
    return out;
  };
  /* Sunflower-spiral packing inside a flattened dome: even coverage, no hidden flowers. */
  const dome = (n, cx, cy, rx, ry) => Array.from({ length: n }, (_, i) => {
    const r = n === 1 ? 0 : Math.sqrt((i + .5) / n), a = i * 2.39996 + .6, s = Math.sin(a);
    return { x: cx + rx * r * Math.cos(a), y: cy + ry * r * s * (s > 0 ? .62 : 1) };
  });
  const leafPath = (len, w) => `M0 0C${n2(w)} ${n2(-len * .25)} ${n2(w * .9)} ${n2(-len * .75)} 0 ${n2(-len)}C${n2(-w * .9)} ${n2(-len * .75)} ${n2(-w)} ${n2(-len * .25)} 0 0Z`;
  const leaf = (x, y, ang, len, w, fill, glow = .5) =>
    `<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ang)})"><path d="${leafPath(len, w)}" fill="${fill}" stroke="#0f3d26" stroke-opacity=".35" stroke-width=".7"/>` +
    `<path d="M0 -2L0 ${n2(-len + 4)}M0 ${n2(-len * .3)}L${n2(w * .5)} ${n2(-len * .46)}M0 ${n2(-len * .3)}L${n2(-w * .5)} ${n2(-len * .46)}M0 ${n2(-len * .55)}L${n2(w * .42)} ${n2(-len * .7)}M0 ${n2(-len * .55)}L${n2(-w * .42)} ${n2(-len * .7)}" fill="none" stroke="#d6f0a6" stroke-opacity="${glow}" stroke-width=".8"/></g>`;
  /* Eucalyptus-style frond and baby's-breath sprig for the bouquet's greenery */
  const frond = (x0, y0, ang, len, r, fills) => {
    const a = ang * Math.PI / 180, ex = x0 + Math.sin(a) * len, ey = y0 - Math.cos(a) * len, bend = (r() - .5) * 40;
    const c = [(x0 + ex) / 2 + Math.cos(a) * bend, (y0 + ey) / 2 + Math.sin(a) * bend];
    let s = `<path d="M${n2(x0)} ${n2(y0)}Q${n2(c[0])} ${n2(c[1])} ${n2(ex)} ${n2(ey)}" fill="none" stroke="#1f5a3a" stroke-width="2.6" stroke-linecap="round"/>`;
    for (let k = 1; k <= 6; k++) {
      const u = k / 6.6, m = 1 - u, px = m * m * x0 + 2 * m * u * c[0] + u * u * ex, py = m * m * y0 + 2 * m * u * c[1] + u * u * ey;
      const tx = 2 * m * (c[0] - x0) + 2 * u * (ex - c[0]), ty = 2 * m * (c[1] - y0) + 2 * u * (ey - c[1]), ta = Math.atan2(tx, -ty) * 180 / Math.PI;
      const L = 24 - k * 2.2, W = 9.5 - k * .7;
      s += leaf(px, py, ta - 52, L, W, fills[k % 2]) + leaf(px, py, ta + 52, L, W, fills[(k + 1) % 2]);
    }
    return s + leaf(ex, ey, Math.atan2(ex - c[0], -(ey - c[1])) * 180 / Math.PI, 18, 7, fills[0]);
  };
  const sprig = (x0, y0, ang, len) => {
    const a = ang * Math.PI / 180, ex = x0 + Math.sin(a) * len, ey = y0 - Math.cos(a) * len;
    let s = `<path d="M${n2(x0)} ${n2(y0)}L${n2(ex)} ${n2(ey)}" stroke="#4f8a5a" stroke-width="1.1" stroke-linecap="round"/>`;
    [[0, 0], [-7, 7], [7, 6], [-3, 14], [4, 15]].forEach(([dx, dy]) => {
      const bx = ex + dx, by = ey + dy;
      s += `<path d="M${n2(ex - dx * .1)} ${n2(ey + dy * .3)}L${n2(bx)} ${n2(by)}" stroke="#6fa273" stroke-width=".7"/><circle cx="${n2(bx)}" cy="${n2(by)}" r="2.4" fill="#fffdf8" stroke="#e8e0d0" stroke-width=".3"/><circle cx="${n2(bx + .5)}" cy="${n2(by - .6)}" r="1" fill="#f6ecd8"/>`;
    });
    return s;
  };

  const vesselShapes = {
    bottle: 'M183 276H217V321C217 335 248 348 260 371C270 390 260 425 245 434H155C140 425 130 390 140 371C152 348 183 335 183 321Z',
    vase: 'M168 287Q200 276 232 287L224 300H216V322C216 341 242 352 255 375C269 400 255 426 238 435Q200 446 162 435C145 426 131 400 145 375C158 352 184 341 184 322V300H176Z'
  };
  const vesselDefs = (container, id) => container === 'bottle'
    ? `<linearGradient id="bottle-gloss-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e8ffff" stop-opacity=".18"/><stop offset=".22" stop-color="#fff" stop-opacity=".5"/><stop offset=".52" stop-color="#80dbe2" stop-opacity=".12"/><stop offset=".82" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#68b9c9" stop-opacity=".22"/></linearGradient>`
    : container === 'vase'
      ? `<linearGradient id="vase-gloss-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b9f4e3" stop-opacity=".78"/><stop offset=".2" stop-color="#38a99c" stop-opacity=".68"/><stop offset=".44" stop-color="#d8fff0" stop-opacity=".78"/><stop offset=".7" stop-color="#20877f" stop-opacity=".72"/><stop offset=".88" stop-color="#b9f4e3" stop-opacity=".84"/><stop offset="1" stop-color="#58b8a9" stop-opacity=".7"/></linearGradient>`
      : container === 'pot'
        ? `<linearGradient id="pot-glaze-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2a55d"/><stop offset=".45" stop-color="#bc5839"/><stop offset="1" stop-color="#753329"/></linearGradient>` : '';
  const vesselBack = (c, id) => c === 'bottle' ? `<path d="${vesselShapes.bottle}" fill="#b9eced" fill-opacity=".2" stroke="#e4ffff" stroke-opacity=".72" stroke-width="3"/>`
    : c === 'pot' ? '<ellipse cx="200" cy="337" rx="64" ry="13" fill="#492617" stroke="#efbd7e" stroke-width="3"/><ellipse cx="200" cy="340" rx="52" ry="8" fill="#2f180d"/>'
      : c === 'vase' ? `<path d="${vesselShapes.vase}" fill="#6ec8b8" fill-opacity=".18" stroke="#f1d59a" stroke-opacity=".8" stroke-width="2"/>` : '';
  const vesselFront = (c, id) => c === 'bottle'
    ? `<path d="${vesselShapes.bottle}" fill="url(#bottle-gloss-${id})" fill-opacity=".26" stroke="#efffff" stroke-opacity=".68" stroke-width="2"/><path d="M159 377C154 394 159 414 168 421" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="5" stroke-linecap="round"/>`
    : c === 'pot'
      ? `<path d="M140 340H260L246 423Q200 445 154 423Z" fill="url(#pot-glaze-${id})" stroke="#ffd6a2" stroke-width="3"/><path d="M140 340H260L255 355H145Z" fill="#df9b59" stroke="#ffe0b7" stroke-width="2"/><path d="M158 365L168 418M242 365L232 418" stroke="#fff0cc" stroke-opacity=".35" stroke-width="3"/>`
      : c === 'vase'
        ? `<path d="${vesselShapes.vase}" fill="url(#vase-gloss-${id})" fill-opacity=".64" stroke="#f1d59a" stroke-opacity=".92" stroke-width="2.5"/><path d="M168 287Q200 300 232 287M176 300Q200 309 224 300M184 323Q200 329 216 323" fill="none" stroke="#f5d894" stroke-opacity=".9" stroke-width="2"/><path d="M159 407Q200 428 241 407" fill="none" stroke="#f5d894" stroke-opacity=".65" stroke-width="1.5"/>` : '';

  /* Wrapping paper: layered tissue behind the flowers, a creased cone in front, satin ribbon and bow. */
  const wrapBack = id => `<path d="M82 270Q200 226 318 270L292 300Q200 318 108 300Z" fill="url(#tissue2-${id})"/><path d="M96 280Q200 246 304 280L284 304Q200 320 116 304Z" fill="url(#tissue1-${id})"/><path d="M104 284Q200 258 296 284" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`;
  const wrapFront = id => `<g><path d="M112 290C128 334 168 398 190 436L210 436C232 398 272 334 288 290Q200 316 112 290Z" fill="url(#wrap-${id})"/>` +
    `<path d="M112 290Q154 336 200 312L190 436C168 398 128 334 112 290Z" fill="#fff" fill-opacity=".14"/><path d="M288 290Q246 336 200 312L210 436C232 398 272 334 288 290Z" fill="#5a0830" fill-opacity=".16"/>` +
    `<path d="M135 306L188 428M265 306L212 428M200 314V436" stroke="#8a1348" stroke-opacity=".28" stroke-width="1.4" fill="none"/><path d="M114 291Q200 318 286 291" fill="none" stroke="#ffe9f3" stroke-opacity=".9" stroke-width="2.6"/>` +
    `<path d="M143 342Q200 358 257 342L252 358Q200 374 148 358Z" fill="url(#ribbon-${id})" stroke="#c9a15a" stroke-width=".8"/>` +
    `<g transform="translate(200 352)"><path d="M0 0C-16 -22 -40 -16 -37 2C-34 16 -12 12 0 0Z" fill="#ff4f9c" stroke="#ffd7ec" stroke-width="1.2"/><path d="M0 0C16 -22 40 -16 37 2C34 16 12 12 0 0Z" fill="#ff4f9c" stroke="#ffd7ec" stroke-width="1.2"/><path d="M-3 4C-14 20 -20 34 -26 44L-14 40L-8 50C-4 34 0 20 0 6Z" fill="#e8267f" stroke="#ffd7ec" stroke-width="1"/><path d="M3 4C14 20 20 34 26 44L14 40L8 50C4 34 0 20 0 6Z" fill="#e8267f" stroke="#ffd7ec" stroke-width="1"/><path d="M-24 -4C-18 -10 -10 -8 -4 0M24 -4C18 -10 10 -8 4 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/><ellipse rx="8" ry="7" fill="#ff7fb8" stroke="#ffd7ec" stroke-width="1.2"/><ellipse cx="-2" cy="-2" rx="3" ry="2" fill="#fff" fill-opacity=".5"/></g></g>`;

  /* ---------- the arrangement ----------
     Layers (bottom to top): back SVG (greenery, stems, vessel back) -> flower heads (real HTML elements, so they are
     individually touchable and GPU-animated) -> front SVG (wrapping paper / vessel front).
     Nothing is capped or clipped: every flower gets its own spot, and the view is an overflow-visible HTML box. */
  function scene(items, focus = false, container = '') {
    const L = items.filter(i => TYPES[i.type] && !TYPES[i.type].special && i.type !== 'letter' && i.qty > 0);
    if (!L.length) return '';
    const id = ++sceneId, rand = rng(7 + id * 13 % 97);
    const flowers = L.filter(i => kindOf(i.type) !== 'cactus'), cacti = L.filter(i => kindOf(i.type) === 'cactus');
    const totalF = flowers.reduce((s, i) => s + i.qty, 0), totalC = cacti.reduce((s, i) => s + i.qty, 0);
    const H = take(flowers, 64), C = take(cacti, totalF ? 6 : 12);
    const hidden = totalF - H.length + totalC - C.length, nF = H.length, hasC = C.length > 0;
    const vessel = nF && (container === 'bottle' || container === 'vase'), pot = nF && container === 'pot';
    const wrap = nF > 0 && !container && (flowers.length > 1 || totalF >= 4);
    const T = hasC && nF ? { dx: 40, sc: .8 } : { dx: 0, sc: 1 };       // bouquet shrinks/moves aside to make room for cacti
    const mx = x => 200 + (x - 200) * T.sc + T.dx, my = y => 430 + (y - 430) * T.sc;
    const V = focus ? (nF ? [85, 95, 230, 320] : [60, 140, 280, 290]) : [0, 0, 400, 450];
    const pc = (v, o, len) => n2((v - o) / len * 100) + '%';
    const back = [], front = [], heads = [];
    const defs = `<defs><linearGradient id="leaf-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a7d765"/><stop offset=".45" stop-color="#3f9650"/><stop offset="1" stop-color="#145133"/></linearGradient>` +
      `<linearGradient id="leaf2-${id}" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#cfe6b2"/><stop offset=".5" stop-color="#6fae78"/><stop offset="1" stop-color="#2b7050"/></linearGradient>` +
      `<linearGradient id="stem-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#1b5a38"/><stop offset=".5" stop-color="#4d9a58"/><stop offset="1" stop-color="#1b5a38"/></linearGradient>` +
      `<linearGradient id="wrap-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c91762"/><stop offset=".5" stop-color="#ff78b6"/><stop offset="1" stop-color="#d91e70"/></linearGradient>` +
      `<linearGradient id="tissue1-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffafc"/><stop offset="1" stop-color="#ffdcec"/></linearGradient>` +
      `<linearGradient id="tissue2-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffc2dc"/><stop offset="1" stop-color="#f58fba"/></linearGradient>` +
      `<linearGradient id="ribbon-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e9c47a"/><stop offset=".5" stop-color="#fff3d2"/><stop offset="1" stop-color="#d9a954"/></linearGradient>` +
      `<radialGradient id="ground-${id}"><stop stop-color="#000" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>${vesselDefs(container, id)}</defs>`;
    const fills = [`url(#leaf-${id})`, `url(#leaf2-${id})`];
    const addHead = (t, x, y, s, z, extra = '') => {
      const kind = kindOf(t), name = TYPES[t].name, rot = kind === 'cactus' ? 0 : Math.round(rand() * 360);
      heads.push({ y, html: `<div class="fl flower-touch${kind === 'cactus' ? ' cac' : ''}" role="button" tabindex="0" data-flower="${t}" data-kind="${kind}" aria-label="Touch the ${name.replace(/"/g, '')}" ` +
        `style="left:${pc(x, V[0], V[2])};top:${pc(y, V[1], V[3])};width:${n2(100 * s / V[2] * 100)}%;--d:${n2(-rand() * 5)}s;--a:${n2(1.2 + rand() * 1.6)}deg${extra}"><span class="fl-sway"><span class="fl-lift"><span class="bloom">${headSVG(t, rot)}</span></span></span></div>` });
    };

    if (nF) {
      /* 1. where every flower head sits */
      let pts, base;
      if (wrap) { pts = dome(nF, 200, 188, nF > 20 ? 128 : 116, nF > 20 ? 104 : 94); base = () => [200, 410]; }
      else if (vessel) { pts = dome(nF, 200, 186, 90, 68); base = i => [200 + ((i % 5) - 2) * 5, 410]; }
      else if (pot) { pts = dome(nF, 200, 196, 100, 66); base = (i, p) => [200 + (p.x - 200) * .55, 336]; }
      else {                                                       // a few loose stems
        pts = H.map((_, i) => { const o = i - (nF - 1) / 2; return { x: 200 + o * 80, y: 178 + Math.abs(o) * 28 }; });
        base = i => [200 + (i - (nF - 1) / 2) * 16, 410];
      }
      const area = Math.PI * (wrap ? 116 : vessel ? 90 : pot ? 100 : 130) * (wrap ? 94 : vessel ? 68 : pot ? 66 : 90) * .82;
      const D = Math.max(40, Math.min(nF <= 3 && !wrap ? 130 : 124, 1.5 * Math.sqrt(area / nF)));
      /* 2. greenery behind everything */
      if (wrap || vessel) {
        const r2 = rand, spread = wrap ? 70 : 52, ry = wrap ? 124 : 100, throat = vessel ? [200, 296] : [200, 322];
        for (let k = 0; k < 11; k++) { const a = (k / 10 - .5) * 2 * spread; back.push(frond(mx(throat[0]), my(throat[1]), a, (ry + 38 + r2() * 26) * T.sc, r2, fills)); }
        if (wrap) for (let k = 0; k < 9; k++) { const a = (k / 8 - .5) * 2 * 54 + (r2() - .5) * 8; back.push(sprig(mx(200 + Math.sin(a * .0175) * 20), my(318), a, (ry + 6 + r2() * 26) * T.sc)); }
      }
      const tf = `translate(${n2(200 * (1 - T.sc) + T.dx)} ${n2(430 * (1 - T.sc))}) scale(${T.sc})`;
      if (wrap) back.push(`<g transform="${tf}">${wrapBack(id)}</g>`);
      back.push(vesselBack(container, id));
      /* 3. stems with leaves, then the heads */
      const order = pts.map((p, i) => ({ p, i, t: H[i] })).sort((a, b) => a.p.y - b.p.y);
      order.forEach(({ p, i, t }) => {
        const [bx, by] = base(i, p), x = mx(p.x), y = my(p.y), X0 = mx(bx), Y0 = my(by);
        const c1 = vessel ? [X0, my(350)] : [X0, y + (Y0 - y) * .5], c2 = vessel ? [mx(200), my(290)] : [x, y + (Y0 - y) * .38];
        const d = `M${n2(X0)} ${n2(Y0)}C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(x)} ${n2(y)}`;
        let s = `<path d="${d}" stroke="#12402a" stroke-width="${n2(5.4 * T.sc)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="url(#stem-${id})" stroke-width="${n2(3.6 * T.sc)}" fill="none" stroke-linecap="round"/>`;
        if (i % 2 === 0 || !wrap) {
          const u = .5 + (i % 3) * .06, q = cubic([X0, Y0], c1, c2, [x, y], u), ta = Math.atan2(q.tx, -q.ty) * 180 / Math.PI, sd = i % 4 < 2 ? 1 : -1;
          s += leaf(q.x, q.y, ta + sd * 48, 34 * T.sc, 12 * T.sc, fills[i % 2]);
        }
        back.push(s);
      });
      order.forEach(({ p, i, t }, z) => {
        const sty = styleOf(t), sc = D * sty.s * (.96 + rand() * .08) * T.sc / 92;
        addHead(t, mx(p.x), my(p.y), sc, z);
      });
      if (!wrap && !vessel && !pot && !focus && nF > 1) back.push(`<g><ellipse cx="${mx(200)}" cy="${my(352)}" rx="${n2(26 * T.sc)}" ry="${n2(7 * T.sc)}" fill="#d9b88a" stroke="#8a6a3a" stroke-width="1"/><path d="M${mx(176)} ${my(350)}Q${mx(200)} ${my(358)} ${mx(224)} ${my(350)}" stroke="#f3dcb0" stroke-width="1.4" fill="none"/></g>`);
      if (wrap) front.push(`<g transform="${tf}">${wrapFront(id)}</g>`);
      front.push(vesselFront(container, id));
    }

    /* 4. cacti stand in their own pots, never on a stem */
    if (hasC) {
      const rows = [], per = nF ? 2 : C.length > 6 ? 4 : 3;
      for (let i = 0; i < C.length; i += per) rows.push(C.slice(i, i + per));
      const R = rows.length;
      rows.forEach((row, ri) => {                                   // ri 0 = back row
        const c = row.length, fromFront = R - 1 - ri;
        let S = nF ? 104 : Math.min(250, 360 / (c * .7 + .3));
        if (R > 1) S *= nF ? .9 : .86;
        S *= Math.pow(.86, fromFront);
        const baseY = nF ? 414 - fromFront * 30 : 414 - fromFront * 56, gap = S * .74;
        const cx0 = nF ? 74 : 200, stag = fromFront ? (fromFront % 2 ? gap * .45 : -gap * .45) : 0;
        row.forEach((t, j) => {
          const x = cx0 + (j - (c - 1) / 2) * gap + stag, z = 100 + ri * 10 + j;
          back.push(`<ellipse cx="${n2(x)}" cy="${n2(baseY - S * .01)}" rx="${n2(S * .32)}" ry="${n2(S * .06)}" fill="url(#ground-${id})"/>`);
          addHead(t, x, baseY - S * .5 + S * .01, S / 100, z);
        });
      });
    }
    heads.sort((a, b) => a.y - b.y);
    const more = hidden > 0 ? `<small class="bq-more">+${hidden} more</small>` : '';
    const total = totalF + totalC;
    const svg = (cls, body) => `<svg class="bq-layer ${cls}" viewBox="${V.join(' ')}" aria-hidden="true" focusable="false">${body}</svg>`;
    return `<div class="bq${focus ? ' focus' : ''}${hasC && !nF ? ' cacti-only' : ''}" style="--ar:${V[2]}/${V[3]};aspect-ratio:${V[2]}/${V[3]}" role="group" aria-label="${container ? container + ' flower arrangement' : 'Flower arrangement'}, ${total} item${total === 1 ? '' : 's'}">` +
      `<div class="bq-in">${svg('back', defs + back.join(''))}<div class="bq-heads">${heads.map((h, z) => h.html.replace('style="', `style="z-index:${z + 1};`)).join('')}</div>${svg('front', front.join(''))}${more}</div></div>`;
  }

  /* ---------- envelope ----------
     Closed: flap points DOWN from the top edge, seal sits on the flap tip. Open: the flap hinges UP on its top edge
     (3D flip, seal hides on the back face) and the letter slides out. The same markup is used for the dashboard card. */
  const envelopeHTML = open => `<span class="env-back"></span><span class="env-paper"><i></i><i></i><i></i></span>` +
    `<span class="env-front"><svg viewBox="0 0 96 66" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L48 34L0 66Z" fill="url(#envL)"/><path d="M96 0L48 34L96 66Z" fill="url(#envR)"/><path d="M0 66L48 31L96 66Z" fill="url(#envB)"/><path d="M0 66L48 31L96 66M0 0L48 34M96 0L48 34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/></svg></span>` +
    `<span class="env-flap"><span class="flap-out"></span><em class="seal">❤</em></span>`;
  const ENV_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="envL" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff9fcf"/><stop offset="1" stop-color="#ff5fa8"/></linearGradient><linearGradient id="envR" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#ff8cc4"/><stop offset="1" stop-color="#f0408f"/></linearGradient><linearGradient id="envB" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ff6fb2"/><stop offset="1" stop-color="#ffa6d2"/></linearGradient></defs></svg>`;
  const envDefs = () => { if (!document.getElementById('env-defs')) { const d = document.createElement('div'); d.id = 'env-defs'; d.innerHTML = ENV_DEFS; document.body.append(d); } };
  function envelope(fn, label = 'A little note for you', ariaLabel = 'Open the note') {
    envDefs();
    const w = el('div', 'envwrap'), b = el('button', 'env');
    b.type = 'button'; b.setAttribute('aria-label', ariaLabel); b.innerHTML = envelopeHTML();
    b.onclick = () => {
      if (document.querySelector('.note-overlay')) return;
      b.disabled = true; b.classList.add('open');
      setTimeout(() => { b.classList.remove('open'); b.disabled = false; fn(w); }, 700);
    };
    w.append(b, el('small', '', label));
    return w;
  }
  /* decorative, already-open envelope for the "Letter" card */
  function envelopeArt() {
    envDefs();
    const a = el('div', 'env env-art open'); a.setAttribute('role', 'img'); a.setAttribute('aria-label', 'Open envelope with a letter'); a.innerHTML = envelopeHTML();
    return a;
  }

  /* ---------- touch: spring + petals on the flower itself, a soft breeze through its neighbours ---------- */
  function enableTouch(root, { enabled = () => true } = {}) {
    const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spring = (fl, power, delay = 0) => {
      const b = fl.querySelector('.bloom');
      if (!b || calm()) return;
      fl._a?.cancel();
      const cactus = fl.dataset.kind === 'cactus', p = power;
      fl._a = b.animate(cactus ? [
        { transform: 'scale(1,1) rotate(0)' },
        { transform: `scale(${1 + .05 * p},${1 - .06 * p}) rotate(${-1.5 * p}deg)`, offset: .25 },
        { transform: `scale(${1 - .025 * p},${1 + .03 * p}) rotate(${1.2 * p}deg)`, offset: .55 },
        { transform: 'scale(1,1) rotate(0)' }
      ] : [
        { transform: 'scale(1) rotate(0)' },
        { transform: `scale(${1 + .18 * p}) rotate(${-9 * p}deg)`, offset: .26 },
        { transform: `scale(${1 - .04 * p}) rotate(${5 * p}deg)`, offset: .52 },
        { transform: `scale(${1 + .02 * p}) rotate(${-2 * p}deg)`, offset: .76 },
        { transform: 'scale(1) rotate(0)' }
      ], { duration: cactus ? 620 : 900, delay, easing: 'cubic-bezier(.3,.7,.3,1)' });
    };
    const burst = fl => {
      if (calm() || fl.dataset.kind === 'cactus') return;
      const layer = fl.parentElement, cols = styleOf(fl.dataset.flower).c, L = fl.style.left, T = fl.style.top, W = fl.getBoundingClientRect().width;
      const ring = el('span', 'tap-ring'); ring.style.cssText = `left:${L};top:${T};width:${W * .9}px;height:${W * .9}px;--c:${cols[0]}`;
      layer.append(ring);
      ring.animate([{ transform: 'translate(-50%,-50%) scale(.55)', opacity: .7 }, { transform: 'translate(-50%,-50%) scale(1.45)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => ring.remove();
      for (let k = 0; k < 6; k++) {
        const pt = el('span', 'tap-petal'), a = (k / 6) * Math.PI * 2 + Math.random() * .8, d = W * (.55 + Math.random() * .4);
        pt.style.cssText = `left:${L};top:${T};--c:${cols[k % cols.length]}`;
        layer.append(pt);
        pt.animate([
          { transform: 'translate(-50%,-50%) scale(.4) rotate(0)', opacity: 0 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d * .6}px),calc(-50% + ${Math.sin(a) * d * .6 - 6}px)) scale(1) rotate(${k * 50}deg)`, opacity: 1, offset: .3 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d + W * .5}px)) scale(.7) rotate(${k * 90 + 120}deg)`, opacity: 0 }
        ], { duration: 950 + Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => pt.remove();
      }
    };
    const play = fl => {
      spring(fl, 1); burst(fl);
      const r = fl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      fl.closest('.bq').querySelectorAll('.flower-touch').forEach(o => {
        if (o === fl) return;
        const q = o.getBoundingClientRect(), d = Math.hypot(q.left + q.width / 2 - cx, q.top + q.height / 2 - cy);
        if (d < r.width * 3.2) spring(o, Math.max(.22, 1 - d / (r.width * 3.2)) * .5, 50 + d / r.width * 70);
      });
    };
    const target = e => { const fl = e.target.closest?.('.flower-touch'); return fl && root.contains(fl) && enabled() ? fl : null; };
    root.addEventListener('pointerdown', e => {
      const fl = target(e); if (!fl) return;
      fl.classList.add('pressed');
      const up = () => { fl.classList.remove('pressed'); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
      addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    root.addEventListener('click', e => { const fl = target(e); if (fl) play(fl); });
    root.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.flower-touch') && enabled()) { e.preventDefault(); play(e.target); }
    });
  }
  return { TYPES, scene, envelope, envelopeArt, enableTouch, loadModels, variantsOf };
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
