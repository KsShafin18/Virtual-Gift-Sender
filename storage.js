/* Local gift history plus portable links that work across devices on static hosts. */
const Store = (() => {
  const G = 'svg_gifts', A = 'svg_auth', DAY = 24 * 36e5;
  const valid = g => {
    const types = typeof Flowers === 'undefined' ? null : Flowers.TYPES;
    const hasLetter = !!g && Array.isArray(g.items) && g.items.some(i => i && i.type === 'letter');
    return !!g && typeof g.id === 'string' && /^[a-z0-9]{8}$/.test(g.id) &&
      Array.isArray(g.items) && g.items.length > 0 &&
      g.items.every(i => i && typeof i.type === 'string' && Number.isSafeInteger(i.qty) && i.qty > 0 &&
        (!types || Object.prototype.hasOwnProperty.call(types, i.type)) && (i.type !== 'letter' || i.qty === 1)) &&
      typeof g.note === 'string' && g.note.length <= 300 &&
      (g.letterText === undefined || (typeof g.letterText === 'string' && g.letterText.length <= 300)) &&
      (hasLetter ? typeof g.letterText === 'string' && g.letterText.trim().length > 0 && g.note === '' : true) &&
      Number.isFinite(g.createdAt) && Number.isFinite(g.expiresAt) &&
      g.expiresAt > g.createdAt && g.expiresAt - g.createdAt <= DAY;
  };
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(G));
      return Array.isArray(v) ? v.filter(valid) : [];
    } catch (e) { return []; }
  };
  const write = a => { try { localStorage.setItem(G, JSON.stringify(a)); } catch (e) { alert('Could not save: browser storage is full or blocked.'); } };
  const uid = () => { const a = new Uint8Array(8); crypto.getRandomValues(a); return Array.from(a, b => (b % 36).toString(36)).join(''); };
  const encode = g => {
    const bytes = new TextEncoder().encode(JSON.stringify({ version: 1, gift: g }));
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const decode = token => {
    if (typeof token !== 'string' || token.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
    try {
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const data = JSON.parse(new TextDecoder().decode(bytes));
      return data && data.version === 1 && valid(data.gift) ? data.gift : null;
    } catch (e) { return null; }
  };
  return {
    all: read,
    get: id => read().find(g => g.id === id) || null,
    create(items, note, letterText = '') {
      const now = Date.now(), hasLetter = items.some(i => i.type === 'letter');
      const g = { id: uid(), items, note: hasLetter ? '' : note || '', letterText: hasLetter ? letterText.trim() : '', createdAt: now, expiresAt: now + DAY };
      if (!valid(g)) throw new Error('Gift contents are invalid.');
      write([g, ...read()]);
      return g;
    },
    remove: id => write(read().filter(g => g.id !== id)),
    cleanup: () => write(read().filter(g => g.expiresAt > Date.now())), // run by dashboard only
    fromLink: decode,
    link: g => {
      const url = new URL('gift.html', location.href);
      url.searchParams.set('gift', encode(g));
      return url.href;
    },
    login(u, p) { if (u === 'ksshafin18' && p === '1111') { localStorage.setItem(A, '1'); return true; } return false; },
    isIn: () => localStorage.getItem(A) === '1',
    logout: () => localStorage.removeItem(A)
  };
})();
