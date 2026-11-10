/* Recipient page: checks existence + expiry on every load, then runs the reveal. */
(function () {
  Flowers.loadModels().then(() => { Specials.register(); start(); }).catch(error => {
    console.error('Flower models could not be initialized.', error);
    const stage = $('#stage'), state = $('#state');
    stage.hidden = true;
    state.hidden = false;
    state.querySelector('h1').textContent = 'Flower Models Unavailable';
    state.querySelector('p').textContent = `This gift could not be displayed because its flower artwork failed to load. ${error.message}`;
  });
  function start() {
  const params = new URLSearchParams(location.search), hasToken = params.has('gift');
  const token = params.get('gift') || '', id = params.get('id') || '';
  const sg = $('#stage'), st = $('#state'); Fx.start(); Store.cleanupReceiver();
  const msg = (h, p) => { sg.hidden = true; st.hidden = false; st.querySelector('h1').textContent = h; st.querySelector('p').textContent = p; };
  const g = hasToken ? Store.fromLink(token) : id ? Store.get(id) : null;
  if (!g) return msg(hasToken ? 'Invalid Gift Link' : 'Gift Not Found',
    hasToken ? 'This link is incomplete or invalid. Ask the sender to create a new gift link.' : 'This gift may have been removed or the link is incorrect.');
  if (Date.now() >= g.expiresAt) return msg('This gift has expired', 'This special gift is no longer available.');
  const recipient = (g.recipient || '').trim();
  $('#gardenCredit').textContent = `A little garden, made just for ${recipient || 'you'}.`;
  if (!g.items.every(item => Object.prototype.hasOwnProperty.call(Flowers.TYPES, item.type)))
    return msg('Invalid Gift Link', 'This link contains unsupported gift items. Ask the sender to create a new gift link.');
  const letterGift = g.items.some(item => item.type === 'letter');
  const specialItems = g.items.filter(item => Flowers.TYPES[item.type].special);
  const flowerItems = g.items.filter(item => item.type !== 'letter' && !Flowers.TYPES[item.type].special);
  let arrangement = Store.receiver(g);
  if (!arrangement) return msg('This gift has expired', 'This special gift is no longer available.');
  const flowerArt = $('#flowers'), flowerManager = $('#flowerManager'), optionsToggle = $('#optionsToggle');
  const flowerChoices = $('#flowerChoices'), flowerStatus = $('#flowerStatus');
  Flowers.enableTouch(flowerArt, { enabled: () => flowerArt.classList.contains('interactive') });
  /* ---- special gifts (moon, snow globe, kidney): each has its own options ---- */
  const spLayer = $('#specials'), feetLayer = $('#feet'), gwrap = $('#gwrap');
  const extra = () => arrangement.extra || (arrangement.extra = {});
  const live = () => specialItems.filter(item => extra()[item.type] !== 'discard');
  const renderSpecials = hasFlowers => {
    const on = live(), feetOn = extra().moon === 'feet' && on.some(item => item.type === 'moon');
    const row = on.filter(item => !(item.type === 'moon' && feetOn)), w = hasFlowers ? [100, 82, 70] : [62, 46, 46];
    spLayer.innerHTML = row.length ? `<div class="sp-row" style="--w:${w[Math.min(row.length, 3) - 1]}%">${row.map(item => `<div class="sp-wrap" data-for="${item.type}">${Specials.art(item.type, extra()[item.type] || '')}${item.type === 'kidney' && extra().kidney === 'message' ? `<button class="sp-msg" type="button" data-i="0">${Specials.MSG[0]}</button>` : ''}</div>`).join('')}</div>` : '';
    feetLayer.innerHTML = feetOn ? Specials.feet(!hasFlowers) : '';
    gwrap.classList.toggle('has-fl', hasFlowers && row.length > 0);
    gwrap.classList.toggle('on-feet', feetOn && hasFlowers);
  };
  Specials.enableTouch(spLayer, { enabled: () => spLayer.classList.contains('interactive') });
  Specials.enableTouch(feetLayer, { enabled: () => spLayer.classList.contains('interactive') });
  spLayer.addEventListener('click', e => {
    const b = e.target.closest('.sp-msg');
    if (b) { b.dataset.i = 1 - b.dataset.i; b.textContent = Specials.MSG[b.dataset.i]; }
  });
  specialItems.forEach(item => {
    const grp = document.createElement('div'), t = Specials.T[item.type];
    grp.className = 'opt-group'; grp.innerHTML = `<span class="opt-title">${t.emoji} ${t.name}</span>` + t.opts.map(([k, label]) => `<button class="flower-choice" type="button" data-sp="${item.type}" data-opt="${k}" aria-pressed="false">${label}</button>`).join('');
    flowerChoices.append(grp);
  });
  if (!flowerItems.length) flowerChoices.querySelectorAll('[data-container]').forEach(b => b.hidden = true);
  const syncSpecials = () => flowerChoices.querySelectorAll('[data-sp]').forEach(b => b.setAttribute('aria-pressed', String(extra()[b.dataset.sp] === b.dataset.opt)));
  flowerChoices.querySelectorAll('[data-sp]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.sp, opt = button.dataset.opt;
    extra()[type] = opt; syncSpecials(); Store.saveReceiver(g, arrangement);
    flowerChoices.hidden = true; optionsToggle.setAttribute('aria-expanded', 'false'); optionsToggle.focus();
    const done = () => { renderArrangement(); flowerStatus.textContent = opt === 'discard' ? `${Specials.T[type].name} thrown away.` : ''; };
    const target = spLayer.querySelector(`[data-for="${type}"]`);
    if (opt === 'discard' && target) { target.classList.add('discarding'); setTimeout(done, 650); } else done();
  }));
  const syncOptions = () => flowerChoices.querySelectorAll('[data-container]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.container === arrangement.container));
  });
  const renderArrangement = () => {
    const fl = arrangement.items.filter(item => !Flowers.TYPES[item.type].special), total = fl.reduce((sum, item) => sum + item.qty, 0);
    flowerArt.innerHTML = total && arrangement.container !== 'discard'
      ? Flowers.scene(fl, false, arrangement.container || '') : '';
    renderSpecials(total > 0);
    const place = { bottle: 'bottle', pot: 'Plant Flower', vase: 'vase' }[arrangement.container];
    flowerStatus.textContent = !flowerItems.length ? '' : total
      ? place ? `${total} ${total === 1 ? 'flower' : 'flowers'} arranged in your ${place}.` : ''
      : 'Your flowers have been thrown away.';
  };
  syncOptions();
  renderArrangement();
  optionsToggle.addEventListener('click', () => {
    const open = optionsToggle.getAttribute('aria-expanded') !== 'true';
    optionsToggle.setAttribute('aria-expanded', String(open));
    flowerChoices.hidden = !open;
    if (open) flowerChoices.querySelector('button').focus();
  });
  flowerChoices.querySelectorAll('[data-container]').forEach(button => button.addEventListener('click', () => {
    arrangement.container = button.dataset.container;
    syncOptions();
    flowerChoices.hidden = true;
    optionsToggle.setAttribute('aria-expanded', 'false');
    optionsToggle.focus();
    if (arrangement.container === 'discard') {
      arrangement.items = arrangement.items.filter(item => Flowers.TYPES[item.type].special);
      Store.saveReceiver(g, arrangement);
      flowerStatus.textContent = 'Sending the flowers away...';
      flowerArt.classList.add('discarding');
      flowerManager.classList.add('processing');
      setTimeout(() => {
        renderArrangement();
        flowerArt.classList.remove('discarding');
        flowerManager.classList.remove('processing');
      }, 650);
      return;
    }
    Store.saveReceiver(g, arrangement);
    flowerArt.classList.add('switching');
    setTimeout(() => {
      renderArrangement();
      flowerArt.classList.remove('switching');
    }, 180);
  }));
  flowerManager.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !flowerChoices.hidden) {
      flowerChoices.hidden = true;
      optionsToggle.setAttribute('aria-expanded', 'false');
      optionsToggle.focus();
    }
  });
  setTimeout(() => {
    Store.clearReceiver(g.id);
    location.reload();
  }, Math.max(0, g.expiresAt - Date.now()));
  const note = (g.note || '').trim(), go = $('#go'), box = $('.box');
  const openGift = () => {
    if (sg.classList.contains('revealing')) return;
    if (Date.now() >= g.expiresAt) return location.reload();
    go.classList.add('gone');
    box.classList.add('disabled');
    sg.classList.add('revealing');
    const S = (c, t) => setTimeout(() => sg.classList.add(c), t);
    S('untie', 200); S('open', 1100); S('rise', 1800); S('center', 3800);
    setTimeout(() => {
      document.body.classList.add('dim'); sg.classList.add('float');
      if (flowerItems.length || specialItems.length) {
        flowerManager.hidden = false;
        flowerArt.classList.add('interactive'); spLayer.classList.add('interactive'); feetLayer.classList.add('interactive');
        syncSpecials();
        renderArrangement();
      }
      if (letterGift) $('#noteslot').append(Flowers.envelope(envelope => Letter.open(g.letterText, {
        kind: 'letter',
        onKeep: () => { envelope.classList.add('kept'); envelope.querySelector('small').textContent = 'Kept for you'; },
        onExpire: () => envelope.remove()
      }), 'A letter for you', 'Open the letter'));
      else if (note) $('#noteslot').append(Flowers.envelope(envelope => Letter.open(note, {
        onKeep: () => { envelope.classList.add('kept'); envelope.querySelector('small').textContent = 'Kept for you'; },
        onExpire: () => envelope.remove()
      })));
    }, 4600);
  };
  go.addEventListener('click', openGift);
  box.addEventListener('click', openGift);
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGift();
    }
  });
  }
})();
