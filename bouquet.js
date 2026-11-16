/* Bouquet designs: option metadata, flower layouts and wrapping / ribbon artwork (design space 400 x 450).
   Everything is configuration-driven: add an entry to STYLES + LAYOUTS (or PAPERS / RIBBONS) to add a new option. */
const Bouquet = (() => {
  const STYLES = [
    { id: 'classic', label: 'Classic Round', desc: 'A tidy, perfectly round dome.' },
    { id: 'romantic', label: 'Romantic Rose', desc: 'Dense, lush and full of baby\u2019s breath.' },
    { id: 'handtied', label: 'Elegant Hand-Tied', desc: 'Crossed stems, relaxed and graceful.' },
    { id: 'luxury', label: 'Luxury Wrapped', desc: 'Generous volume with rich foliage.' },
    { id: 'garden', label: 'Natural Garden', desc: 'Loose, wild and freshly picked.' },
    { id: 'cascading', label: 'Cascading', desc: 'Blooms flowing down in a graceful trail.' },
    { id: 'modern', label: 'Minimalist Modern', desc: 'Clean, staggered and simple.' }
  ];
  const PAPERS = [
    { id: 'blush', label: 'Blush Pink', sw: '#ff78b6', main: ['#c91762', '#ff78b6', '#d91e70'], t1: ['#fffafc', '#ffdcec'], t2: ['#ffc2dc', '#f58fba'], fold: '#8a1348' },
    { id: 'kraft', label: 'Kraft', sw: '#d8aa72', main: ['#9a6a3a', '#d8aa72', '#8a5a2c'], t1: ['#fbf3e4', '#ead7b8'], t2: ['#e6c79a', '#c89a62'], fold: '#5a3a18' },
    { id: 'white', label: 'Pearl White', sw: '#f4f5fa', main: ['#cfd3dc', '#ffffff', '#d8dce6'], t1: ['#ffffff', '#eef0f5'], t2: ['#f4f5f9', '#d9dde8'], fold: '#8a90a0' },
    { id: 'midnight', label: 'Midnight', sw: '#4a3a78', main: ['#1c1530', '#4a3a78', '#241a40'], t1: ['#7a6aa8', '#4a3a78'], t2: ['#3a2c60', '#241a40'], fold: '#0c0818' },
    { id: 'lavender', label: 'Lavender', sw: '#c8a8f2', main: ['#8a63c8', '#c8a8f2', '#9a74d4'], t1: ['#f6eefe', '#e2d2f6'], t2: ['#cdb2ee', '#a98ad8'], fold: '#4e2a8a' }
  ];
  const RIBBONS = [
    { id: 'pink', label: 'Rose Pink', sw: '#ff4f9c', bow: ['#ff4f9c', '#e8267f'], band: ['#e9c47a', '#fff3d2', '#d9a954'] },
    { id: 'red', label: 'Ruby Red', sw: '#e0203f', bow: ['#e0203f', '#b0102c'], band: ['#b0102c', '#ff6a80', '#a00e28'] },
    { id: 'white', label: 'Ivory', sw: '#f4f4f8', bow: ['#ffffff', '#dfe2ea'], band: ['#d8dce6', '#ffffff', '#cfd3de'] },
    { id: 'gold', label: 'Gold', sw: '#e3b341', bow: ['#f3d27a', '#c9972e'], band: ['#c9972e', '#fff0b8', '#b8861e'] },
    { id: 'black', label: 'Black', sw: '#2a2a33', bow: ['#3a3a46', '#0e0e14'], band: ['#15151c', '#4a4a58', '#0e0e14'] },
    { id: 'lavender', label: 'Lavender', sw: '#b08ae6', bow: ['#b08ae6', '#8a63c8'], band: ['#8a63c8', '#e2d2f6', '#7a52b8'] }
  ];
  const RSTYLES = [{ id: 'bow', label: 'Satin Bow' }, { id: 'twine', label: 'Raffia Twine' }, { id: 'sash', label: 'Long Sash' }];
  const WRAPS = [{ id: 'cone', label: 'Cone Wrap' }, { id: 'tissue', label: 'Tissue Fan' }];
  const DEFAULT = { style: 'luxury', wrap: 'paper', wrapStyle: 'cone', paper: 'blush', ribbon: 'pink', ribbonStyle: 'bow' };
  const ids = a => a.map(x => x.id);
  const by = (a, id) => a.find(x => x.id === id) || a[0];
  const FIELD = { style: ids(STYLES), wrap: ['paper', 'ribbon'], wrapStyle: ids(WRAPS), paper: ids(PAPERS), ribbon: ids(RIBBONS), ribbonStyle: ids(RSTYLES) };
  const valid = o => !!o && typeof o === 'object' && Object.entries(o).every(([k, v]) => FIELD[k] && FIELD[k].includes(v));
  const norm = o => ({ ...DEFAULT, ...(valid(o) ? o : {}) });

  /* ---------- layouts: where every head goes ---------- */
  const jit = (p, r, a) => ({ x: p.x + (r() - .5) * a, y: p.y + (r() - .5) * a });
  const LAYOUTS = {
    classic: (n, r, dome) => ({ pts: dome(n, 200, 192, 108, 104, .92), area: Math.PI * 108 * 104 * .88, k: 1, fronds: [8, 46, 96], sprigs: 0 }),
    romantic: (n, r, dome) => ({ pts: dome(n, 200, 188, 104, 98, .82), area: Math.PI * 104 * 98 * .84, k: 1.14, fronds: [5, 40, 90], sprigs: 12 }),
    handtied: (n, r, dome) => ({ pts: dome(n, 206, 194, 122, 86, .55).map(p => jit(p, r, 12)).map(p => ({ x: 200 + (p.x - 200) * .98 + (p.y - 330) * .06, y: p.y })), area: Math.PI * 122 * 86 * .8, k: .96, fronds: [9, 66, 150], sprigs: 6 }),
    luxury: (n, r, dome) => ({ pts: dome(n, 200, 188, 118, 94, .62), area: Math.PI * 118 * 94 * .82, k: 1, fronds: [11, 70, 150], sprigs: 9 }),
    garden: (n, r, dome) => ({ pts: dome(n, 206, 196, 138, 112, .7).map(p => jit(p, r, 22)), area: Math.PI * 138 * 112 * .8, k: .84, fronds: [12, 80, 168], sprigs: 12 }),
    cascading: (n, r, dome) => {
      const top = Math.max(1, Math.ceil(n * .62)), pts = dome(top, 200, 178, 92, 78, .7), m = n - top;
      for (let i = 0; i < m; i++) { const u = (i + .6) / (m + .3); pts.push({ x: 200 + 36 * Math.sin(u * 2.6) + (i % 2 ? -10 : 10), y: 268 + u * 132, trail: true, sz: 1 - .42 * u }); }
      return { pts, area: Math.PI * 92 * 78 * .84 * 1.15, k: 1, fronds: [6, 48, 110], sprigs: 5 };
    },
    modern: (n, r) => {
      const cols = n <= 3 ? n : Math.ceil(Math.sqrt(n * 1.3)), rows = Math.ceil(n / cols), cell = Math.min(98, 262 / cols), pts = [];
      for (let i = 0; i < n; i++) { const c = i % cols, rr = Math.floor(i / cols); pts.push({ x: 200 + (c - (cols - 1) / 2) * cell * 1.04 + (rr % 2 ? cell * .34 : 0) - 8, y: 200 + (rr - (rows - 1) / 2) * cell * .84 + c * 5 }); }
      return { pts, D: cell * 1.08, k: 1, fronds: [0, 0, 0], sprigs: 0, leaves: 2 };
    }
  };
  const layout = (style, n, rand, dome) => (LAYOUTS[style] || LAYOUTS.luxury)(n, rand, dome);

  /* ---------- artwork ---------- */
  const grad = (id, c, v) => `<linearGradient id="${id}" x1="0" y1="0" x2="${v ? 0 : 1}" y2="${v ? 1 : 0}">${c.map((x, i) => `<stop offset="${i / (c.length - 1)}" stop-color="${x}"/>`).join('')}</linearGradient>`;
  const defs = (id, o) => { const p = by(PAPERS, o.paper), r = by(RIBBONS, o.ribbon);
    return grad(`wrap-${id}`, p.main) + grad(`tissue1-${id}`, p.t1, 1) + grad(`tissue2-${id}`, p.t2, 1) + grad(`ribbon-${id}`, r.band) + grad(`bow-${id}`, r.bow, 1); };
  const wrapBack = (id, o) => {
    if (o.wrapStyle === 'tissue') {
      const sheets = [[-58, 150, 78, 2], [58, 150, 78, 2], [-30, 168, 84, 1], [30, 168, 84, 1], [0, 176, 90, 1]];
      return sheets.map(([a, l, w, t]) => `<g transform="translate(200 332) rotate(${a})"><path d="M0 0C${-w} ${-l * .35} ${-w * .9} ${-l * .9} 0 ${-l}C${w * .9} ${-l * .9} ${w} ${-l * .35} 0 0Z" fill="url(#tissue${t}-${id})" stroke="#fff" stroke-opacity=".5"/><path d="M0 -10Q${-w * .3} ${-l * .5} 0 ${-l + 8}" fill="none" stroke="#fff" stroke-opacity=".35"/></g>`).join('');
    }
    return `<path d="M82 270Q200 226 318 270L292 300Q200 318 108 300Z" fill="url(#tissue2-${id})"/><path d="M96 280Q200 246 304 280L284 304Q200 320 116 304Z" fill="url(#tissue1-${id})"/><path d="M104 284Q200 258 296 284" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`;
  };
  const bow = (id, s, sc, x, y) => {
    const k = `fill="url(#bow-${id})" stroke="#fff" stroke-opacity=".75" stroke-width="1.1"`;
    let g;
    if (s === 'twine') g = `<g fill="none" stroke-linecap="round"><path d="M-27 -6Q0 6 27 -6" stroke="#b58a52" stroke-width="2.6"/><path d="M-26 -1Q0 11 26 -1" stroke="#d4ad72" stroke-width="2.4"/><path d="M-25 4Q0 16 25 4" stroke="#b58a52" stroke-width="2.4"/><path d="M-3 6Q-14 18-22 36M3 6Q12 20 18 38M0 7Q-4 22-8 40M2 7Q8 22 10 36" stroke="#c9a064" stroke-width="1.3"/></g><circle cy="6" r="5" fill="url(#bow-${id})" stroke="#fff" stroke-opacity=".7"/>`;
    else if (s === 'sash') g = `<path d="M-30 -2Q0 10 30 -2L30 8Q0 20 -30 8Z" fill="url(#ribbon-${id})" stroke="#fff" stroke-opacity=".4"/><path d="M-4 8C-14 28-6 50-18 74L-6 66L0 80C4 54-2 30 0 10Z" ${k}/><path d="M4 8C14 28 8 50 20 74L8 66L2 80C-2 54 4 30 0 10Z" ${k}/><path d="M0 4C-16 -16-34-8-30 6C-26 16-10 12 0 4Z" ${k}/><path d="M0 4C16 -16 34-8 30 6C26 16 10 12 0 4Z" ${k}/><ellipse cy="4" rx="7" ry="6" ${k}/>`;
    else g = `<path d="M0 0C-16 -22-40 -16-37 2C-34 16-12 12 0 0Z" ${k}/><path d="M0 0C16 -22 40 -16 37 2C34 16 12 12 0 0Z" ${k}/><path d="M-3 4C-14 20-20 34-26 44L-14 40L-8 50C-4 34 0 20 0 6Z" ${k}/><path d="M3 4C14 20 20 34 26 44L14 40L8 50C4 34 0 20 0 6Z" ${k}/><path d="M-24 -4C-18-10-10-8-4 0M24 -4C18-10 10-8 4 0" fill="none" stroke="#fff" stroke-opacity=".5"/><ellipse rx="8" ry="7" ${k}/><ellipse cx="-2" cy="-2" rx="3" ry="2" fill="#fff" fill-opacity=".5"/>`;
    return `<g transform="translate(${x} ${y}) scale(${sc})">${g}</g>`;
  };
  const wrapFront = (id, o) => {
    const dark = by(PAPERS, o.paper).fold;
    if (o.wrapStyle === 'tissue') return `<path d="M158 322Q200 340 242 322L236 346Q200 362 164 346Z" fill="url(#wrap-${id})" stroke="#fff" stroke-opacity=".6"/><path d="M168 326L172 348M184 330L186 352M200 332V354M216 330L214 352M232 326L228 348" stroke="${dark}" stroke-opacity=".3"/>` + bow(id, o.ribbonStyle, 1, 200, 338);
    return `<path d="M112 290C128 334 168 398 190 436L210 436C232 398 272 334 288 290Q200 316 112 290Z" fill="url(#wrap-${id})"/><path d="M112 290Q154 336 200 312L190 436C168 398 128 334 112 290Z" fill="#fff" fill-opacity=".14"/><path d="M288 290Q246 336 200 312L210 436C232 398 272 334 288 290Z" fill="#000" fill-opacity=".16"/>` +
      `<path d="M135 306L188 428M265 306L212 428M200 314V436" stroke="${dark}" stroke-opacity=".28" stroke-width="1.4" fill="none"/><path d="M114 291Q200 318 286 291" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.6"/>` +
      `<path d="M143 342Q200 358 257 342L252 358Q200 374 148 358Z" fill="url(#ribbon-${id})" stroke="#c9a15a" stroke-opacity=".5" stroke-width=".8"/>` + bow(id, o.ribbonStyle, 1, 200, 352);
  };
  /* ribbon-only presentation: a tie around the bunched stems */
  const tie = (id, o, x, y, sc = 1) => bow(id, o.ribbonStyle, sc, x, y);
  return { STYLES, PAPERS, RIBBONS, RSTYLES, WRAPS, DEFAULT, valid, norm, layout, defs, wrapBack, wrapFront, tie, by };
})();
