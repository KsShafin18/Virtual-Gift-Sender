/* Login, dashboard, cart, preview, QR modal, gift list */
const cart = {}, pick = {}; let ready = false, qrTimer = null;
const fmt = ms => {
  if (ms <= 0) return 'Expired';
  const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0') + ' left';
};
const when = t => new Date(t).toLocaleString();
const items = () => Object.keys(cart).map(k => ({ type: k, qty: cart[k] }));
const count = a => a.reduce((s, i) => s + i.qty, 0);
const fname = a => a.map(i => Flowers.TYPES[i.type] ? Flowers.TYPES[i.type].name : i.type).join(', ');
const hasLetter = () => Boolean(cart.letter);
const noteText = () => !hasLetter() && $('#nt').checked ? $('#note').value.trim() : '';
const letterText = () => hasLetter() ? $('#letterText').value.trim() : '';
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2200); }
async function copy(t) { try { await navigator.clipboard.writeText(t); toast('Link copied'); } catch (e) { prompt('Copy this link:', t); } }
function updateGiftCountdowns() {
  document.querySelectorAll('[data-expires-at]').forEach(label => {
    const remaining = Number(label.dataset.expiresAt) - Date.now();
    label.textContent = fmt(remaining);
    label.classList.toggle('dead', remaining <= 0);
  });
}

/* ---- Auth ---- */
function route() {
  const on = Store.isIn(); $('#login').hidden = on; $('#app').hidden = !on;
  if (on) { Store.cleanup(); if (!ready) init(); renderAll(); renderGifts(); }
}
$('#lf').addEventListener('submit', e => {
  e.preventDefault();
  if (Store.login($('#u').value.trim(), $('#p').value)) { $('#err').hidden = true; route(); }
  else { $('#err').hidden = false; const c = $('#lcard'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
});
$('#eye').onclick = () => { const p = $('#p'); p.type = p.type === 'password' ? 'text' : 'password'; };
$('#out').onclick = () => { Store.logout(); route(); };

/* ---- Dashboard setup (runs once) ---- */
function init() {
  ready = true;
  Object.keys(Flowers.TYPES).forEach(k => {
    const f = Flowers.TYPES[k]; pick[k] = 1;
    const c = el('article', 'card glass'), art = el('div', 'art'), badge = el('span', 'badge'), inp = el('input');
    if (k === 'letter') {
      art.append(el('div', 'letter-art', ''));
    } else {
      art.innerHTML = Flowers.scene([{ type: k, qty: 1 }], true);
    }
    badge.id = 'b-' + k; badge.hidden = true;
    inp.type = 'number'; inp.min = 1; inp.value = 1; inp.setAttribute('aria-label', f.name + ' quantity');
    const set = v => { pick[k] = Math.max(1, Math.floor(v) || 1); inp.value = pick[k]; };
    const m = el('button', 'sq', '−'), p = el('button', 'sq', '+'), add = el('button', 'btn', k === 'letter' ? 'Choose letter' : 'Add to gift'), q = el('div', 'qty');
    m.onclick = () => set(pick[k] - 1); p.onclick = () => set(pick[k] + 1); inp.onchange = () => set(+inp.value);
    add.onclick = () => {
      if (k === 'letter') {
        cart.letter = 1;
        $('#nt').checked = false;
        $('#note').value = '';
        $('#nw').hidden = true;
      } else {
        set(+inp.value); cart[k] = (cart[k] || 0) + pick[k];
      }
      renderAll();
      toast(k === 'letter' ? 'Letter selected' : pick[k] + ' × ' + f.name + ' added');
    };
    if (k !== 'letter') q.append(m, inp, p);
    c.append(badge, art, el('h3', '', f.name), el('p', 'muted', f.desc), q, add); $('#cards').append(c);
  });
  $('#nt').onchange = () => { $('#nw').hidden = !$('#nt').checked || hasLetter(); renderPreview(); };
  $('#note').oninput = () => { $('#cnt').textContent = Array.from($('#note').value).length + ' / 300 characters'; renderPreview(); };
  $('#letterText').oninput = () => { $('#letterCount').textContent = Array.from($('#letterText').value).length + ' / 300 characters'; renderPreview(); };
  $('#mk').onclick = () => {
    const a = items();
    if (!a.length) return toast('Add at least one gift first');
    if (hasLetter() && !letterText()) return toast('Add text to your letter first');
    const recipient = $('#recipient').value.trim();
    const g = Store.create(a, noteText(), letterText(), recipient);
    $('#recipient').value = '';
    renderGifts(); showQR(g);
  };
  setInterval(() => { if (Store.isIn()) renderGifts(); }, 30000);
  setInterval(() => { if (Store.isIn()) updateGiftCountdowns(); }, 1000);
}

/* ---- Cart + preview ---- */
function renderAll() {
  const a = items(), L = $('#cart');
  Object.keys(Flowers.TYPES).forEach(k => { const b = $('#b-' + k); if (b) { b.hidden = !cart[k]; b.textContent = '×' + (cart[k] || 0); } });
  $('#nt').closest('.tg').hidden = hasLetter();
  $('#nw').hidden = hasLetter() || !$('#nt').checked;
  $('#letterWriter').hidden = !hasLetter();
  L.replaceChildren();
  if (!a.length) L.append(el('p', 'muted', 'Your gift is empty. Choose a gift to get started.'));
  a.forEach(i => {
    const r = el('div', 'row'), m = el('button', 'sq', '−'), p = el('button', 'sq', '+'), x = el('button', 'sq', '✕');
    r.append(el('span', '', Flowers.TYPES[i.type].name));
    m.onclick = () => { if (cart[i.type] > 1) cart[i.type]--; else delete cart[i.type]; renderAll(); };
    p.onclick = () => { if (i.type !== 'letter') cart[i.type]++; renderAll(); };
    x.onclick = () => { delete cart[i.type]; renderAll(); };
    if (i.type === 'letter') r.append(el('span', 'qty-label', '×1'));
    else r.append(m, el('b', '', String(i.qty)), p);
    r.append(x); L.append(r);
  });
  $('#tot').textContent = '(' + count(a) + (count(a) === 1 ? ' gift item' : ' gift items') + ')';
  renderPreview();
}
function renderPreview() {
  const a = items(), box = $('#pv');
  if (!a.length) { box.replaceChildren(el('p', 'muted', 'Your gift preview will appear here.')); return; }
  const bouquet = a.filter(i => i.type !== 'letter');
  box.replaceChildren();
  if (bouquet.length) box.innerHTML = Flowers.scene(bouquet);
  if (hasLetter() && letterText()) box.append(Flowers.envelope(envelope => Letter.open(letterText(), {
    kind: 'letter',
    onKeep: () => { envelope.classList.add('kept'); envelope.querySelector('small').textContent = 'Kept for you'; },
    onExpire: () => envelope.remove()
  }), 'A letter for you', 'Open the letter'));
  else if (hasLetter()) box.append(el('p', 'muted', 'Add text to preview your letter.'));
  if (!hasLetter() && noteText()) box.append(Flowers.envelope(envelope => Letter.open(noteText(), {
    onKeep: () => { envelope.classList.add('kept'); envelope.querySelector('small').textContent = 'Kept for you'; },
    onExpire: () => envelope.remove()
  })));
}

/* ---- QR modal ---- */
function closeModal() { clearInterval(qrTimer); $('#modal').hidden = true; }
function showQR(g) {
  const b = $('#mb'), link = Store.link(g), q = el('div', 'qr'), rem = el('b', '', '');
  b.replaceChildren();
  try { new QRCode(q, { text: link, width: 220, height: 220, colorDark: '#2b0022', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M }); }
  catch (e) { q.textContent = 'QR library failed to load (check your internet). Use the link below.'; }
  const info = el('div', 'info');
  [['Gift ID', g.id], ...(g.recipient ? [['For', g.recipient]] : []), ['Created', when(g.createdAt)], ['Expires', when(g.expiresAt)]].forEach(r => info.append(el('p', '', r[0] + ': ' + r[1])));
  const p = el('p', '', 'Remaining: '); p.append(rem); info.append(p);
  const tick = () => { rem.textContent = fmt(g.expiresAt - Date.now()); }; tick();
  clearInterval(qrTimer); qrTimer = setInterval(tick, 1000);
  const row = el('div', 'btns'), c = el('button', 'btn', 'Copy gift link'), d = el('button', 'btn', 'Download QR'), x = el('button', 'btn ghost', 'Close');
  c.onclick = () => copy(link);
  d.onclick = () => { const cv = q.querySelector('canvas'); if (!cv) return toast('QR not available'); const a = el('a'); a.href = cv.toDataURL('image/png'); a.download = 'gift-' + g.id + '.png'; a.click(); };
  x.onclick = closeModal; row.append(c, d);
  if (navigator.share) { const s = el('button', 'btn', 'Share'); s.onclick = () => navigator.share({ title: "Shafin's Virtual Gift", text: 'A gift for you', url: link }).catch(() => {}); row.append(s); }
  row.append(x);
  b.append(el('h2', 'script', 'Gift created'), el('p', '', 'Your gift is ready. Share this QR code with someone special.'), q, info, row,
    el('small', 'muted', 'Anyone with this link can view the gift until it expires. Deleting your local copy does not revoke a shared link.'));
  $('#modal').hidden = false;
}
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

/* ---- My Created Gifts ---- */
function renderGifts() {
  const box = $('#gifts'), all = Store.all(); box.replaceChildren();
  if (!all.length) box.append(el('p', 'muted', 'No gifts yet. Create your first one above.'));
  all.forEach(g => {
    const left = g.expiresAt - Date.now(), c = el('article', 'card glass gcard');
    const st = el('span', 'pill' + (left <= 0 ? ' dead' : ''), fmt(left));
    c.append(st, el('h3', '', 'Gift ' + g.id),
      ...(g.recipient ? [el('p', 'recipient-name', 'For: ' + g.recipient)] : []),
      el('p', '', fname(g.items)), el('p', 'muted', count(g.items) + ' gift items' + (g.note ? ' · with note' : '')),
      el('p', 'muted', 'Created: ' + when(g.createdAt)), el('p', 'muted', 'Expires: ' + when(g.expiresAt)));
    st.dataset.expiresAt = String(g.expiresAt);
    const r = el('div', 'btns'), pv = el('button', 'btn', 'Preview'), qr = el('button', 'btn', 'Show QR'), cp = el('button', 'btn', 'Copy link'), del = el('button', 'btn ghost', 'Delete');
    pv.onclick = () => window.open(Store.link(g), '_blank');
    qr.onclick = () => left > 0 ? showQR(g) : toast('This gift has expired');
    cp.onclick = () => copy(Store.link(g));
    del.onclick = () => { if (confirm('Delete this gift?')) { Store.remove(g.id); renderGifts(); } };
    r.append(pv, qr, cp, del); c.append(r); box.append(c);
  });
}

Fx.start(); route();
