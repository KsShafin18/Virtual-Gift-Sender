/* Local gift history plus portable links that work across devices on static hosts. */
const Store = (() => {
  const G = 'svg_gifts', A = 'svg_auth', R = 'svg_receiver', DAY = 24 * 36e5;
  const valid = g => {
    const types = typeof Flowers === 'undefined' ? null : Flowers.TYPES;
    const hasLetter = !!g && Array.isArray(g.items) && g.items.some(i => i && i.type === 'letter');
    return !!g && typeof g.id === 'string' && /^[a-z0-9]{8}$/.test(g.id) &&
      Array.isArray(g.items) && g.items.length > 0 &&
      g.items.every(i => i && typeof i.type === 'string' && Number.isSafeInteger(i.qty) && i.qty > 0 &&
        (!types || Object.prototype.hasOwnProperty.call(types, i.type)) && (i.type !== 'letter' || i.qty === 1)) &&
      typeof g.note === 'string' && g.note.length <= 300 &&
      (g.recipient === undefined || (typeof g.recipient === 'string' && g.recipient.length <= 60)) &&
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
  const receiverItems = gift => gift.items.filter(item => item.type !== 'letter').map(item => ({ type: item.type, qty: item.qty }));
  const validReceiver = (state, gift) => {
    const original = new Map(receiverItems(gift).map(item => [item.type, item.qty]));
    return !!state && state.expiresAt === gift.expiresAt &&
      [null, 'bottle', 'pot', 'vase', 'discard'].includes(state.container) && Array.isArray(state.items) &&
      state.items.every(item => item && original.has(item.type) && Number.isSafeInteger(item.qty) && item.qty > 0 && item.qty <= original.get(item.type)) &&
      new Set(state.items.map(item => item.type)).size === state.items.length;
  };
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
    create(items, note, letterText = '', recipient = '') {
      const now = Date.now(), hasLetter = items.some(i => i.type === 'letter');
      const g = { id: uid(), items, note: hasLetter ? '' : note || '', letterText: hasLetter ? letterText.trim() : '', recipient: recipient.trim().slice(0, 60), createdAt: now, expiresAt: now + DAY };
      if (!valid(g)) throw new Error('Gift contents are invalid.');
      write([g, ...read()]);
      return g;
    },
    remove: id => write(read().filter(g => g.id !== id)),
    cleanup: () => write(read().filter(g => g.expiresAt > Date.now())), // run by dashboard only
    cleanupReceiver() {
      try {
        const all = JSON.parse(localStorage.getItem(R)) || {};
        Object.keys(all).forEach(id => {
          if (!Number.isFinite(all[id]?.expiresAt) || all[id].expiresAt <= Date.now()) delete all[id];
        });
        localStorage.setItem(R, JSON.stringify(all));
      } catch (e) {}
    },
    receiver(gift) {
      let all = {};
      try { all = JSON.parse(localStorage.getItem(R)) || {}; } catch (e) { all = {}; }
      const saved = all[gift.id];
      if (Date.now() >= gift.expiresAt) {
        delete all[gift.id];
        try { localStorage.setItem(R, JSON.stringify(all)); } catch (e) {}
        return null;
      }
      if (validReceiver(saved, gift)) return saved;
      const initial = { expiresAt: gift.expiresAt, container: null, items: receiverItems(gift) };
      all[gift.id] = initial;
      try { localStorage.setItem(R, JSON.stringify(all)); } catch (e) {}
      return initial;
    },
    saveReceiver(gift, state) {
      if (Date.now() >= gift.expiresAt || !validReceiver(state, gift)) return false;
      try {
        const all = JSON.parse(localStorage.getItem(R)) || {};
        all[gift.id] = state;
        localStorage.setItem(R, JSON.stringify(all));
        return true;
      } catch (e) { return false; }
    },
    clearReceiver: id => {
      try {
        const all = JSON.parse(localStorage.getItem(R)) || {};
        delete all[id];
        localStorage.setItem(R, JSON.stringify(all));
      } catch (e) {}
    },
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
