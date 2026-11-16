/* Shared UI helpers: confirmation dialog (matches the existing glass modals) and tiny synthesised sound effects. */
const Dialog = (() => {
  let open = null;
  /* Resolves true only when the user explicitly confirms; Cancel, Escape and a click outside all resolve false. */
  function confirm({ title, message, yes = 'Yes', no = 'Cancel', icon = '⚠️' }) {
    if (open) return Promise.resolve(false);
    return new Promise(resolve => {
      const prev = document.activeElement, ov = document.createElement('div');
      ov.className = 'overlay confirm-ov';
      ov.innerHTML = `<div class="glass mbox confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" aria-describedby="cf-m"><div class="cf-icon" aria-hidden="true">${icon}</div><h2 id="cf-t" class="script">${title}</h2><p id="cf-m">${message}</p><div class="cf-btns"><button type="button" class="btn ghost" data-r="0">${no}</button><button type="button" class="btn danger" data-r="1">${yes}</button></div></div>`;
      const done = v => {
        document.removeEventListener('keydown', key, true);
        ov.classList.add('out'); open = null;
        setTimeout(() => { ov.remove(); prev?.focus?.({ preventScroll: true }); }, 220);
        resolve(v);
      };
      const key = e => {
        if (e.key === 'Escape') { e.preventDefault(); done(false); }
        if (e.key === 'Tab') {                                    // keep focus inside the dialog
          const b = [...ov.querySelectorAll('button')], i = b.indexOf(document.activeElement);
          e.preventDefault(); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus();
        }
      };
      ov.addEventListener('click', e => { if (e.target === ov) done(false); else if (e.target.dataset.r) done(e.target.dataset.r === '1'); });
      document.addEventListener('keydown', key, true);
      document.body.append(ov); open = ov;
      ov.querySelector('[data-r="0"]').focus();                  // safe default: Cancel
    });
  }
  return { confirm };
})();

const Sfx = (() => {
  let ctx = null;
  const KEY = 'vgks-sound';
  const on = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } };
  const set = v => { try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* storage blocked */ } };
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const tone = (type, f0, f1, dur, vol, when = 0) => {
    if (!on() || matchMedia('(prefers-reduced-motion: reduce)').matches && vol > .1) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .2); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
  };
  /* original synthesised bird chirp: a quick rising/falling trill */
  const chirp = (pitch = 1) => { [0, .11, .2].forEach((w, i) => tone('sine', (2300 + i * 260) * pitch, (3500 - i * 200) * pitch, .09, .05, w)); };
  const knock = () => { [0, .28, .56].forEach(w => tone('triangle', 150, 60, .14, .22, w)); };
  const tick = () => tone('sine', 900, 1400, .08, .04);
  return { on, set, chirp, knock, tick, unlock: ac };
})();
