/* Recipient page: checks existence + expiry on every load, then runs the reveal. */
(function () {
  Flowers.loadModels().then(start).catch(error => {
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
  const flowerItems = g.items.filter(item => item.type !== 'letter');
  let arrangement = Store.receiver(g);
  if (!arrangement) return msg('This gift has expired', 'This special gift is no longer available.');
  const flowerArt = $('#flowers'), flowerManager = $('#flowerManager'), optionsToggle = $('#optionsToggle');
  const flowerChoices = $('#flowerChoices'), flowerStatus = $('#flowerStatus');
  const enableFlowerPlay = () => {
    const svg = flowerArt.querySelector('svg');
    if (!svg) return;
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Interactive flower arrangement');
    svg.querySelectorAll('.flower-touch').forEach(flower => {
      flower.setAttribute('role', 'button');
      flower.setAttribute('tabindex', '0');
      flower.setAttribute('aria-label', 'Make ' + Flowers.TYPES[flower.dataset.flower].name + ' dance');
    });
  };
  const playFlower = flower => {
    const bloom = flower.querySelector('.bloom');
    if (!bloom || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    bloom.animate([
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.42) rotate(-8deg) translateY(-10px)', offset: .38 },
      { transform: 'scale(.94) rotate(5deg) translateY(3px)', offset: .72 },
      { transform: 'scale(1) rotate(0deg)' }
    ], { duration: 720, easing: 'cubic-bezier(.2,1.3,.4,1)' });
  };
  const syncOptions = () => flowerChoices.querySelectorAll('[data-container]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.container === arrangement.container));
  });
  const renderArrangement = () => {
    const total = arrangement.items.reduce((sum, item) => sum + item.qty, 0);
    flowerArt.innerHTML = total && arrangement.container !== 'discard'
      ? Flowers.scene(arrangement.items, false, arrangement.container || '') : '';
    if (flowerArt.classList.contains('interactive')) enableFlowerPlay();
    const place = { bottle: 'bottle', pot: 'Plant Flower', vase: 'vase' }[arrangement.container];
    flowerStatus.textContent = total
      ? place ? `${total} ${total === 1 ? 'flower' : 'flowers'} arranged in your ${place}.` : ''
      : 'Your flowers have been thrown away.';
  };
  syncOptions();
  renderArrangement();
  flowerArt.addEventListener('click', event => {
    const flower = event.target.closest('[data-flower]');
    if (!flower || !flowerArt.contains(flower)) return;
    playFlower(flower);
  });
  flowerArt.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-flower]')) {
      event.preventDefault();
      playFlower(event.target);
    }
  });
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
      arrangement.items = [];
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
      if (flowerItems.length) {
        flowerManager.hidden = false;
        flowerArt.classList.add('interactive');
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
