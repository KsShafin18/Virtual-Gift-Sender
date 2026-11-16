/* Gift delivery styles. A style is { label, desc, icon, thumb, play?(ctx) }.
   To add a new one: Delivery.define('id', {...}). Without play() a style simply uses the default gift opening.
   ctx = { box, recipient, sender, reveal(), open(), layer, rect, clone(), calm } */
const Delivery = (() => {
  const styles = {};
  const define = (id, d) => { styles[id] = d; };
  const list = () => Object.entries(styles).map(([id, d]) => ({ id, ...d }));
  const E = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = (el, kf, opt) => el.animate(kf, { fill: 'forwards', ...opt }).finished.catch(() => {});
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cloneBox = box => { const c = box.cloneNode(true); c.removeAttribute('role'); c.removeAttribute('tabindex'); c.removeAttribute('aria-label'); c.className = 'box dl-box'; c.style.cssText = ''; return c; };

  define('default', {
    label: 'Default Gift Opening', icon: '🎁', desc: 'The classic gift box that unties and opens with a tap.',
    thumb: '<svg viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="26" rx="3" fill="#ff5fa8"/><rect x="9" y="21" width="46" height="11" rx="3" fill="#ff9ccc"/><rect x="29" y="21" width="6" height="33" fill="#ffe3f1"/><path d="M32 21C24 6 12 14 22 21ZM32 21C40 6 52 14 42 21Z" fill="none" stroke="#ffe3f1" stroke-width="3" stroke-linejoin="round"/></svg>'
  });

  /* ---------- Bird delivery: a white pigeon flies in with the gift hanging beneath it ---------- */
  const PIGEON = `<svg class="pg" viewBox="0 0 200 150" aria-hidden="true"><defs><linearGradient id="pgb" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#d9e2f2"/></linearGradient><linearGradient id="pgw" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#cfd9ec"/><stop offset=".5" stop-color="#f4f7fd"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
    <path class="pg-wing back" d="M96 66C84 30 56 8 22 6C34 30 54 52 84 76Z" fill="#c4cfe4"/>
    <path d="M62 78L8 104 36 98 18 120 70 96Z" fill="#cdd7ea"/><path d="M62 82L22 112 48 102Z" fill="#b9c6de"/>
    <ellipse cx="102" cy="82" rx="44" ry="27" fill="url(#pgb)"/><ellipse cx="116" cy="92" rx="26" ry="15" fill="#fff" opacity=".8"/>
    <path d="M130 60C136 44 156 40 166 52C172 62 166 74 150 76C140 76 132 70 130 60Z" fill="#e9eef8"/>
    <circle cx="150" cy="56" r="17" fill="url(#pgb)"/><path d="M134 68Q140 76 150 74" stroke="#bfa8d8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M165 54Q180 56 178 63Q172 62 165 62Z" fill="#f1b84a"/><path d="M165 58H176" stroke="#c98f1e" stroke-width=".8"/>
    <circle cx="156" cy="52" r="4.2" fill="#fff"/><circle cx="157" cy="52" r="3" fill="#e86a1a"/><circle cx="157.4" cy="52" r="1.6" fill="#1b1220"/><circle cx="158" cy="51" r=".7" fill="#fff"/>
    <path class="pg-wing" d="M100 66C92 24 120 0 164 2C150 26 138 50 120 78Z" fill="url(#pgw)" stroke="#c9d3e6" stroke-width="1"/><path class="pg-wing" d="M118 40C132 22 146 12 164 2M112 54C128 38 142 28 156 16" fill="none" stroke="#c0cbe0" stroke-width="1"/>
    <path d="M96 106L92 124M110 106L108 124" stroke="#e58a8a" stroke-width="3" stroke-linecap="round"/></svg>`;
  define('bird', {
    label: 'Bird Delivery', icon: '🕊️', desc: 'A white pigeon flies in and gently lowers your gift.',
    thumb: '<svg viewBox="0 0 64 64"><path d="M30 24C24 10 14 8 6 10C12 20 20 28 28 32Z" fill="#cdd7ea"/><ellipse cx="34" cy="28" rx="14" ry="8.5" fill="#fff"/><circle cx="46" cy="22" r="6" fill="#fff"/><path d="M51 21Q58 22 56 25Q53 24 51 24Z" fill="#f1b84a"/><circle cx="48" cy="21" r="1.3" fill="#1b1220"/><path d="M28 36V44M38 36V44" stroke="#fff" stroke-opacity=".6"/><rect x="22" y="44" width="20" height="14" rx="2" fill="#ff5fa8"/><rect x="30" y="44" width="4" height="14" fill="#ffe3f1"/></svg>',
    async play(ctx) {
      const L = ctx.layer, vw = innerWidth, vh = innerHeight, R = ctx.rect(), W = Math.min(220, vw * .56), bh = W * .75, bs = .62;
      const pop = () => { const p = E('div', 'glass dl-pop', `<div class="dl-ico" aria-hidden="true">🕊️</div><h2 class="script">A Kobutor has arrived</h2><p>A gift from <b>${ctx.sender}</b>${ctx.recipient ? `<br>for <b>${ctx.recipient}</b>` : ''}</p><button type="button" class="btn">Click Here To Open</button>`); L.append(p); return p; };
      if (ctx.calm) { ctx.reveal(true); const p = pop(); p.querySelector('button').onclick = () => { ctx.end(); ctx.open(); }; return; }
      const carry = E('div', 'dl-carry'), swing = E('div', 'dl-swing'), box = cloneBox(ctx.box);
      carry.style.cssText = `width:${W}px;height:${bh + 40 + 116 * bs}px`;
      carry.innerHTML = PIGEON; swing.style.cssText = `top:${bh * .8}px`;
      swing.innerHTML = `<svg class="dl-strings" viewBox="0 0 40 30" preserveAspectRatio="none"><path d="M20 0L6 30M20 0L34 30" stroke="#fff" stroke-opacity=".85" stroke-width="1.2" fill="none"/></svg>`;
      box.style.cssText = `position:absolute;left:50%;top:30px;bottom:auto;margin:0 0 0 -75px;transform:translateX(0) scale(${bs});transform-origin:50% 0;opacity:1`;
      swing.append(box); carry.append(swing); L.append(carry);
      const hoverY = Math.max(24, R.top - bh * .8 - 30 - 116 * bs * .5 - 150), landY = R.top + R.height / 2 - (bh * .8 + 30 + 116 * bs / 2) - 30, cx = R.left + R.width / 2 - W / 2;
      await anim(carry, [
        { transform: `translate(${-W - 40}px,${vh * .1}px)`, opacity: 1 },
        { transform: `translate(${vw * .28 - W / 2}px,${vh * .2}px)`, offset: .34, easing: 'ease-in-out' },
        { transform: `translate(${cx - 30}px,${hoverY - 30}px)`, offset: .66, easing: 'cubic-bezier(.3,.6,.4,1)' },
        { transform: `translate(${cx}px,${hoverY}px)`, offset: .78, easing: 'ease-in-out' },
        { transform: `translate(${cx}px,${landY}px)` }
      ], { duration: 6200 });
      /* let go: the parcel drops into place while the pigeon flies off */
      const r = box.getBoundingClientRect(), dx = R.left - r.left, dy = R.top - r.top;
      box.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;margin:0;width:150px;height:116px;transform-origin:0 0;transform:scale(${bs})`;
      L.append(box); swing.remove();
      const bird = anim(carry, [{ transform: `translate(${cx}px,${landY}px)`, opacity: 1 }, { transform: `translate(${cx + 20}px,${landY - 90}px)`, offset: .25, opacity: 1 }, { transform: `translate(${vw + W * .3}px,${-bh}px)`, opacity: 0 }], { duration: 2600, easing: 'ease-in', delay: 120 });
      await anim(box, [
        { transform: `translate(0,0) scale(${bs})` },
        { transform: `translate(${dx}px,${dy}px) scale(1.05)`, offset: .66, easing: 'ease-out' },
        { transform: `translate(${dx}px,${dy - 14}px) scale(1.02)`, offset: .8, easing: 'ease-in' },
        { transform: `translate(${dx}px,${dy}px) scale(1)` }
      ], { duration: 1300, easing: 'cubic-bezier(.4,0,.6,1)' });
      ctx.reveal(true); box.remove();
      await bird; carry.remove();
      const p = pop(); p.querySelector('button').onclick = () => { p.classList.add('out'); setTimeout(() => { ctx.end(); ctx.open(); }, 320); };
      p.querySelector('button').focus({ preventScroll: true });
    }
  });

  /* ---------- Postbox delivery: knock knock, click the postbox, the door opens and a parcel slides out ---------- */
  define('postbox', {
    label: 'Postbox Parcel', icon: '📮', desc: 'Knock knock! A little postbox opens and delivers your parcel.',
    thumb: '<svg viewBox="0 0 64 64"><path d="M16 58V26C16 12 48 12 48 26V58Z" fill="#e0203f"/><path d="M16 58V26C16 12 32 12 32 12V58Z" fill="#fff" fill-opacity=".14"/><rect x="24" y="22" width="16" height="3.4" rx="1.7" fill="#2a0a14"/><rect x="22" y="34" width="20" height="18" rx="2" fill="#b0102c"/><rect x="28" y="30" width="8" height="5" rx="1" fill="#ffe3f1"/><circle cx="39" cy="44" r="1.4" fill="#f3d27a"/><rect x="12" y="56" width="40" height="4" rx="2" fill="#6a0a1c"/></svg>',
    async play(ctx) {
      const L = ctx.layer, R = ctx.rect();
      const msg = E('div', 'dl-knock', `<h2 class="script">Knock Knock!</h2><p>You\u2019ve Got a Parcel!</p>`);
      const pb = E('button', 'pb', `<span class="pb-cap"></span><span class="pb-slot"></span><span class="pb-plate">POST</span><span class="pb-inside"></span><span class="pb-door"><i class="pb-lock"></i><i class="pb-bar"></i></span><span class="pb-base"></span>`);
      pb.type = 'button'; pb.setAttribute('aria-label', 'Click to open the postbox');
      const hint = E('div', 'dl-hint', 'Click to Open');
      L.append(msg, pb, hint);
      if (!ctx.calm) { msg.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.08)', offset: .5 }, { opacity: 1, transform: 'scale(1)' }], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.2,1.2,.4,1)' }); }
      if (!ctx.calm) { [0, .28, .56].forEach(t => setTimeout(() => msg.animate([{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-9px) rotate(-3deg)' }, { transform: 'translateX(7px) rotate(2deg)' }, { transform: 'translateX(0) rotate(0)' }], { duration: 260 }), 900 + t * 1000)); Sfx.knock(); setTimeout(() => Sfx.knock(), 900); }
      await wait(ctx.calm ? 0 : 1900);
      pb.classList.add('in'); await wait(ctx.calm ? 0 : 900);
      hint.classList.add('show'); pb.classList.add('ready');
      await new Promise(res => { pb.onclick = res; });
      pb.disabled = true; hint.remove(); msg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
      pb.classList.add('open'); Sfx.tick();
      const parcel = cloneBox(ctx.box); parcel.classList.add('dl-parcel'); L.append(parcel);
      const d = pb.querySelector('.pb-door').getBoundingClientRect(), s = .46;
      parcel.style.cssText = `position:fixed;left:${d.left + d.width / 2 - 75}px;top:${d.top + d.height / 2 - 58}px;margin:0;width:150px;height:116px;transform-origin:50% 50%;transform:scale(${s});z-index:0;opacity:0`;
      pb.style.zIndex = 3; parcel.style.zIndex = 2;
      await wait(ctx.calm ? 0 : 1000);
      const sx = d.left + d.width / 2 - 75, sy = d.top + d.height / 2 - 58, dx = R.left - sx, dy = R.top - sy;
      await anim(parcel, [
        { transform: `translate(0,0) scale(${s})`, opacity: 0 },
        { transform: `translate(0,0) scale(${s})`, opacity: 1, offset: .12 },
        { transform: `translate(${dx * .25}px,${-30}px) scale(${.7}) rotate(-6deg)`, offset: .45, easing: 'ease-in' },
        { transform: `translate(${dx}px,${dy}px) scale(1.04) rotate(2deg)`, offset: .78, easing: 'ease-out' },
        { transform: `translate(${dx}px,${dy - 12}px) scale(1.02)`, offset: .88, easing: 'ease-in' },
        { transform: `translate(${dx}px,${dy}px) scale(1) rotate(0)` }
      ], { duration: ctx.calm ? 10 : 1700, easing: 'cubic-bezier(.4,0,.6,1)' });
      ctx.reveal(); parcel.remove();
      await anim(pb, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(60px) scale(.9)' }], { duration: ctx.calm ? 10 : 800, delay: ctx.calm ? 0 : 300 });
      msg.remove(); pb.remove(); ctx.end();
    }
  });

  /* Runs the chosen style on the gift page. Always ends by revealing the normal stage, so a failure never traps the gift. */
  function run(id, o) {
    const s = styles[id];
    if (!s || !s.play) return false;
    const layer = E('div', 'dl-layer'), skip = E('button', 'dl-skip', 'Skip');
    skip.type = 'button'; document.body.append(layer, skip);
    let done = false, skipped = false;
    const end = () => { if (done) return; done = true; layer.remove(); skip.remove(); o.reveal(); };
    const ctx = { ...o, layer, calm: calm(), reveal: hold => o.reveal(hold), end, open: () => { if (!skipped) o.open(); }, rect: () => o.box.getBoundingClientRect() };
    skip.onclick = () => { skipped = true; end(); };
    s.play(ctx).catch(end);
    return true;
  }
  return { styles, define, list, run };
})();
