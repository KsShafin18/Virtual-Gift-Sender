/* Storage layer. Swap these methods for Firebase/Supabase calls later;
   the rest of the app only talks to `Store`. */
const BASE_URL = ''; // e.g. 'https://your-domain.com/gift.html' when hosted. Empty = current site.
const Store = (() => {
  const G = 'svg_gifts', A = 'svg_auth', DAY = 24 * 36e5;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(G)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const write = a => { try { localStorage.setItem(G, JSON.stringify(a)); } catch (e) { alert('Could not save: browser storage is full or blocked.'); } };
  const uid = () => { const a = new Uint8Array(8); crypto.getRandomValues(a); return Array.from(a, b => (b % 36).toString(36)).join(''); };
  return {
    all: read,
    get: id => read().find(g => g.id === id) || null,
    create(items, note) { const now = Date.now(), g = { id: uid(), items, note: note || '', createdAt: now, expiresAt: now + DAY }; write([g, ...read()]); return g; },
    remove: id => write(read().filter(g => g.id !== id)),
    cleanup: () => write(read().filter(g => g.expiresAt > Date.now())), // run by dashboard only
    link: id => (BASE_URL || new URL('gift.html', location.href).href.split('?')[0]) + '?id=' + encodeURIComponent(id),
    login(u, p) { if (u === 'ksshafin18' && p === '1111') { localStorage.setItem(A, '1'); return true; } return false; },
    isIn: () => localStorage.getItem(A) === '1',
    logout: () => localStorage.removeItem(A)
  };
})();
