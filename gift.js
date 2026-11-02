/* Recipient page: checks existence + expiry on every load, then runs the reveal. */
(function () {
  const params = new URLSearchParams(location.search), hasToken = params.has('gift');
  const token = params.get('gift') || '', id = params.get('id') || '';
  const sg = $('#stage'), st = $('#state'); Fx.start();
  const msg = (h, p) => { sg.hidden = true; st.hidden = false; st.querySelector('h1').textContent = h; st.querySelector('p').textContent = p; };
  const g = hasToken ? Store.fromLink(token) : id ? Store.get(id) : null;
  if (!g) return msg(hasToken ? 'Invalid Gift Link 💔' : 'Gift Not Found 💔',
    hasToken ? 'This link is incomplete or invalid. Ask the sender to create a new gift link.' : 'This gift may have been removed or the link is incorrect.');
  if (Date.now() >= g.expiresAt) return msg('Oops! This gift has returned to the stars. ✨', 'This special gift is no longer available.');
  if (!g.items.every(item => Object.prototype.hasOwnProperty.call(Flowers.TYPES, item.type)))
    return msg('Invalid Gift Link 💔', 'This link contains unsupported gift items. Ask the sender to create a new gift link.');
  $('#flowers').innerHTML = Flowers.scene(g.items);
  const note = (g.note || '').trim(), go = $('#go');
  go.onclick = () => {
    if (Date.now() >= g.expiresAt) return location.reload();
    go.classList.add('gone');
    const S = (c, t) => setTimeout(() => sg.classList.add(c), t);
    S('untie', 200); S('open', 1100); S('rise', 1800); S('center', 3800);
    setTimeout(() => {
      document.body.classList.add('dim'); sg.classList.add('float');
      if (note) $('#noteslot').append(Flowers.envelope(envelope => Letter.open(note, {
        onKeep: () => { envelope.classList.add('kept'); envelope.querySelector('small').textContent = 'Kept for you 💌'; },
        onExpire: () => envelope.remove()
      })));
    }, 4600);
  };
})();
