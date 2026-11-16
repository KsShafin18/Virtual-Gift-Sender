/* Two Love Birds in a Cage: one small SVG, CSS-driven poses and a WAAPI flight for the release. */
(() => {
  const BR = [['romantic', 'Romantic Moment'], ['feed', 'Feed Them'], ['sing', 'Sing'], ['release', 'Release']];
  const PAL = {
    a: { id: 'a', body: ['#86d95e', '#3d9c3e'], belly: '#c4ee98', wing: '#2f8f3a', tip: '#2e6fd8', tail: '#2e6fd8', nape: '#5ab84a', face: ['#ffd0a0', '#ff8a4a'], beak: '#e84a3c' },
    b: { id: 'b', body: ['#86ccff', '#3a86e0'], belly: '#dcf0ff', wing: '#2a6ac0', tip: '#1f4fa8', tail: '#1f4fa8', nape: '#5aa8ea', face: ['#ffffff', '#e8eefc'], beak: '#f08a4a' }
  };
  const st = (o, c) => `<stop offset="${o}" stop-color="${c}"/>`;
  const DEFS = () => `<svg id="lb-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>` +
    Object.values(PAL).map(p => `<linearGradient id="lb-body-${p.id}" x1="0" y1="0" x2="1" y2="1">${st(0, p.body[0])}${st(1, p.body[1])}</linearGradient><radialGradient id="lb-face-${p.id}" cx=".4" cy=".35" r=".8">${st(0, p.face[0])}${st(1, p.face[1])}</radialGradient>`).join('') +
    `<linearGradient id="lb-gold" x1="0" y1="0" x2="1" y2="0">${st(0, '#8a5a1c')}${st(.3, '#f6d78a')}${st(.55, '#c99436')}${st(1, '#6e4512')}</linearGradient><linearGradient id="lb-goldv" x1="0" y1="0" x2="0" y2="1">${st(0, '#fff0b8')}${st(1, '#b8861e')}</linearGradient>` +
    `<radialGradient id="lb-glow" cx=".5" cy=".5" r=".5">${st(0, '#ffe6f2')}${st(1, '#ffe6f2')}</radialGradient></defs></svg>`;
  const bird = (cls, x, p, flip) => `<g class="lbw ${cls}" transform="translate(${x} 176)${flip ? ' scale(-1 1)' : ''}"><g class="lb">` +
    `<g class="lb-tail"><path d="M-10 -12L-27 20 -17 15 -12 27 -5 8Z" fill="${p.tail}"/><path d="M-9 -10L-18 12 -8 6Z" fill="${p.wing}" opacity=".7"/></g>` +
    `<g class="lb-bodyg"><ellipse cx="0" cy="-24" rx="15" ry="21" fill="url(#lb-body-${p.id})"/><ellipse cx="6" cy="-19" rx="9" ry="15" fill="${p.belly}" opacity=".9"/>` +
    `<g class="lb-wing"><path d="M-6 -39C-24 -31-24 -6-12 7C-3 -2 3 -16 5 -33Z" fill="${p.wing}"/><path d="M-13 -9C-12 -1-9 4-12 7C-6 3-3 -4-4 -10Z" fill="${p.tip}"/><path d="M-14 -26L-4 -20M-15 -18L-5 -12" stroke="#fff" stroke-opacity=".3" stroke-width=".8"/></g></g>` +
    `<path d="M-3 -2V1M5 -2V1" stroke="#e8a060" stroke-width="2.4" stroke-linecap="round"/>` +
    `<g class="lb-head"><circle cx="3" cy="-46" r="11" fill="${p.nape}"/><ellipse cx="11" cy="-48" rx="10.5" ry="11.5" fill="url(#lb-face-${p.id})"/><circle cx="9" cy="-43" r="3.2" fill="#ff8a7a" opacity=".45"/>` +
    `<path class="lb-bk-up" d="M18 -54Q31 -52 29 -43Q24 -46 18 -45Z" fill="${p.beak}"/><path class="lb-bk-dn" d="M18 -45Q26 -44 26 -40Q21 -41 18 -41Z" fill="${p.beak}" opacity=".85"/>` +
    `<g class="lb-eye"><circle cx="13" cy="-51" r="3.5" fill="#fff"/><circle cx="13.7" cy="-51" r="2.1" fill="#1b1220"/><circle cx="14.4" cy="-51.8" r=".8" fill="#fff"/></g></g></g></g>`;
  const heart = (x, y, s, d) => `<path class="lb-h" style="animation-delay:${d}s" transform="translate(${x} ${y}) scale(${s})" d="M0 5C-9-2-7-9-2-9 0-9 0-7 0-6 0-7 2-9 4-9 9-9 11-2 0 5Z" fill="#ff4f86"/>`;
  function bars() {
    let f = '', b = '';
    for (let i = -6; i <= 6; i++) {
      const a = i * Math.PI / 14, sa = Math.sin(a), xb = 120 + 70 * sa, xt = 120 + 56 * sa;
      const d = `M${xb.toFixed(1)} 236L${xt.toFixed(1)} 74Q${(120 + 34 * sa).toFixed(1)} 40 120 30`;
      if (i !== 0) f += `<path d="${d}"/>`;
      if (i < 6) { const a2 = (i + .5) * Math.PI / 14, s2 = Math.sin(a2); b += `<path d="M${(120 + 70 * s2).toFixed(1)} 236L${(120 + 56 * s2).toFixed(1)} 74Q${(120 + 34 * s2).toFixed(1)} 40 120 30"/>`; }
    }
    return { f, b };
  }
  const B = bars();
  const art = opt => {
    if (!document.getElementById('lb-defs')) document.body.insertAdjacentHTML('beforeend', DEFS());
    const rel = opt === 'released';
    return `<svg class="sp-svg lb-svg${rel ? ' released' : ''}" viewBox="0 0 240 300"><ellipse cx="120" cy="294" rx="60" ry="6" fill="#000" opacity=".3"/>` +
      `<ellipse cx="120" cy="288" rx="46" ry="8" fill="url(#lb-gold)"/><rect x="115" y="246" width="10" height="40" fill="url(#lb-gold)"/><circle cx="120" cy="266" r="6" fill="url(#lb-goldv)"/>` +
      `<ellipse cx="120" cy="238" rx="76" ry="13" fill="#6e4512"/><ellipse cx="120" cy="235" rx="76" ry="13" fill="url(#lb-goldv)"/><ellipse cx="120" cy="235" rx="62" ry="9" fill="#fff6dc" opacity=".35"/>` +
      `<g fill="none" stroke="url(#lb-gold)" stroke-width="1.4" opacity=".55">${B.b}</g>` +
      `<path d="M96 210q-3-8 2-10h20q5 2 2 10z" fill="#d9a066"/><path d="M104 200l3-4 3 3 3-4 3 4" stroke="#caa04a" fill="#caa04a"/><g class="lb-seeds"></g><path d="M130 212q-2-9 3-11h18q5 2 3 11z" fill="#8ec8ff" opacity=".85"/>` +
      `<path d="M66 176H174" stroke="#6e4222" stroke-width="6" stroke-linecap="round"/><path d="M66 174.5H174" stroke="#c98f58" stroke-width="2" stroke-linecap="round"/>` +
      `<g class="lb-swing"><path d="M120 78V100" stroke="#caa04a"/><path transform="translate(120 108) scale(1.5)" d="M0 5C-9-2-7-9-2-9 0-9 0-7 0-6 0-7 2-9 4-9 9-9 11-2 0 5Z" fill="#ff6a9c" stroke="#fff" stroke-opacity=".6"/></g>` +
      (rel ? '' : bird('a', 88, PAL.a, false) + bird('b', 152, PAL.b, true)) +
      `<g class="lb-hearts" transform="translate(120 128)">${heart(-10, 0, 1.2, 0)}${heart(8, -6, .9, .35)}${heart(0, -14, 1.5, .7)}${heart(-14, -10, .8, 1)}${heart(14, 4, 1, 1.3)}</g>` +
      `<g class="lb-notes"></g>` +
      `<g fill="none" stroke="url(#lb-gold)" stroke-width="2.4" stroke-linecap="round">${B.f}</g>` +
      `<g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8">${B.f}</g>` +
      `<g fill="none" stroke="url(#lb-gold)" stroke-width="3"><ellipse cx="120" cy="76" rx="56" ry="9"/><ellipse cx="120" cy="150" rx="63" ry="10" opacity=".8"/></g>` +
      `<g class="lb-door${rel ? ' open' : ''}"><rect x="104" y="142" width="32" height="92" rx="4" fill="#1a0a22" fill-opacity=".25" stroke="url(#lb-gold)" stroke-width="3"/><path d="M112 144V232M120 144V232M128 144V232" stroke="url(#lb-gold)" stroke-width="1.6"/><circle cx="131" cy="190" r="2.6" fill="#fff0b8"/></g>` +
      `<path d="M64 80Q120 12 176 80" fill="none" stroke="url(#lb-gold)" stroke-width="3.4"/><path d="M84 66Q120 30 156 66" fill="none" stroke="url(#lb-gold)" stroke-width="1.6" opacity=".7"/>` +
      `<path d="M120 32V22" stroke="url(#lb-gold)" stroke-width="3"/><circle cx="120" cy="16" r="7" fill="none" stroke="url(#lb-goldv)" stroke-width="3"/><circle cx="120" cy="30" r="4" fill="url(#lb-goldv)"/>` +
      `<g fill="none" stroke="url(#lb-gold)" stroke-width="2" stroke-linecap="round"><path d="M50 238q-12 0-12 10t12 6M190 238q12 0 12 10t-12 6"/></g>` +
      `<path class="tw" d="M44 100l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff6dc"/><path class="tw t2" d="M200 120l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#fff6dc"/></svg>`;
  };
  /* ---------- actions ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = (el, state, ms, fn) => {
    if (el._busy) return false;
    el._busy = true; el.classList.add('st-' + state);
    setTimeout(() => { el.classList.remove('st-' + state); el._busy = false; fn && fn(); }, ms);
    return true;
  };
  const chirps = (times, pitch) => times.forEach(t => setTimeout(() => Sfx.chirp(pitch), t * 1000));
  const note = (el, side, t) => setTimeout(() => {
    const g = el.querySelector('.lb-notes'); if (!g) return;
    const n = document.createElementNS(NS, 'text');
    n.setAttribute('class', 'lb-note'); n.setAttribute('x', side < 0 ? 100 : 140); n.setAttribute('y', 112); n.setAttribute('fill', side < 0 ? '#ffd7ec' : '#bfe3ff');
    n.textContent = Math.random() < .5 ? '♪' : '♫'; g.append(n); setTimeout(() => n.remove(), 1700);
  }, t * 1000);
  function feed(el) {
    const g = el.querySelector('.lb-seeds'); if (!g) return;
    for (let k = 0; k < 8; k++) {
      const e = document.createElementNS(NS, 'ellipse'), x = 84 + Math.random() * 74;
      e.setAttribute('cx', x); e.setAttribute('cy', 214); e.setAttribute('rx', 2.6); e.setAttribute('ry', 1.6);
      e.setAttribute('fill', k % 2 ? '#d9a642' : '#b9852f'); e.setAttribute('class', 'lb-seed');
      e.style.setProperty('--d', (k * .09).toFixed(2) + 's'); e.style.setProperty('--e', (1.7 + k * .28).toFixed(2) + 's');
      g.append(e); setTimeout(() => e.remove(), 4300);
    }
    [.0, .5, 1.1].forEach(t => setTimeout(() => Sfx.tick(), 150 + t * 1000));
    return true;
  }
  function release(el, done) {
    if (el._busy || el.classList.contains('released')) return false;
    el._busy = true; el.classList.add('st-release');
    const finish = () => { el.classList.remove('st-release'); el.classList.add('released'); el._busy = false; done && done(); };
    if (calm()) { el.querySelectorAll('.lbw').forEach(b => b.remove()); return setTimeout(finish, 400), true; }
    setTimeout(() => {                                            // birds are at the open door: hand over to flying clones
      const birds = [...el.querySelectorAll('.lbw')], rects = birds.map(b => b.getBoundingClientRect()), vw = innerWidth, vh = innerHeight;
      birds.forEach(b => { b.style.visibility = 'hidden'; });
      rects.forEach((r, i) => {
        const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, dir = i ? -1 : 1, size = Math.max(54, r.width * 2.1);
        const f = document.createElement('div'); f.className = 'lb-fly'; f.style.cssText = `left:0;top:0;width:${size}px;height:${size * .75}px`;
        const p = PAL[i ? 'b' : 'a'];
        f.innerHTML = `<svg viewBox="0 0 100 75" aria-hidden="true"><g class="fw-tail"><path d="M30 38L8 52 22 49 14 62 36 46Z" fill="${p.tail}"/></g><path class="fw-wing back" d="M52 34C44 14 30 6 18 8C26 20 36 30 50 38Z" fill="${p.wing}" opacity=".75"/><ellipse cx="52" cy="40" rx="22" ry="12" fill="url(#lb-body-${p.id})"/><ellipse cx="56" cy="44" rx="13" ry="7" fill="${p.belly}" opacity=".85"/><circle cx="74" cy="34" r="10.5" fill="${p.nape}"/><ellipse cx="78" cy="35" rx="8.6" ry="9.4" fill="url(#lb-face-${p.id})"/><path d="M84 31Q96 32 94 39Q89 37 84 38Z" fill="${p.beak}"/><circle cx="80" cy="31" r="3" fill="#fff"/><circle cx="80.8" cy="31" r="1.8" fill="#1b1220"/><path class="fw-wing" d="M54 36C50 12 66 0 82 2C74 14 70 26 62 40Z" fill="${p.wing}"/><path class="fw-wing tipw" d="M70 8C76 4 80 4 82 2C78 12 74 20 70 26Z" fill="${p.tip}"/></svg>`;
        document.body.append(f);
        const tx = i => [x0, vw * (.5 + dir * .22), vw * (.5 + dir * .4), vw * (.5 + dir * .62)][i];
        const pts = [[x0, y0], [x0 + dir * 40, y0 - 70], [vw * (.5 + dir * .2), vh * .34], [vw * (.5 + dir * .42), vh * .16], [vw * (.5 + dir * .75), -size]];
        const kf = pts.map(([x, y], k) => ({ transform: `translate(${x - size / 2}px,${y - size * .375}px) scaleX(${dir}) rotate(${k ? -14 - k * 4 : 0}deg) scale(${[.8, 1, 1.15, 1, .6][k]})`, opacity: k === 4 ? 0 : 1, offset: [0, .14, .4, .7, 1][k], easing: 'ease-in-out' }));
        f.animate(kf, { duration: 4200 + i * 300, delay: i * 260, fill: 'both' }).onfinish = () => f.remove();
        for (let k = 0; k < 5; k++) setTimeout(() => {              // a few feathers and hearts drift down behind them
          const fe = document.createElement('span'); fe.className = 'lb-feather'; fe.textContent = k % 2 ? '🪶' : '♥';
          fe.style.cssText = `left:${x0 + dir * k * 38}px;top:${y0 - k * 26}px;color:#ff7aa8`; document.body.append(fe);
          fe.animate([{ transform: 'translateY(0) rotate(0)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translateY(${90 + k * 20}px) rotate(${dir * 120}deg)`, opacity: 0 }], { duration: 1800, easing: 'ease-out' }).onfinish = () => fe.remove();
        }, 500 + i * 260 + k * 320);
        [0, .45, .9, 1.4].forEach(t => setTimeout(() => Sfx.chirp(1 + i * .12), 500 + i * 260 + t * 1000));
      });
      setTimeout(finish, 3600);
    }, 1500);
    return true;
  }
  Specials.define('lovebirds', {
    name: 'Love Birds in a Cage', emoji: '🦜', desc: 'Two little lovebirds, always together. Tap them to hear a chirp.',
    opts: BR, art,
    act(opt, el, done) {
      if (opt === 'romantic') return run(el, 'romantic', 4300, done) && chirps([1.2, 2.4], 1.15);
      if (opt === 'feed') { if (run(el, 'feed', 6000, done)) feed(el); return true; }
      if (opt === 'sing') {
        if (!run(el, 'sing', 6000, done)) return true;
        [.3, .65, 1, 1.35, 1.7].forEach(t => note(el, -1, t)); [2.1, 2.45, 2.8, 3.15, 3.5].forEach(t => note(el, 1, t)); [4, 4.4, 4.8, 5.2].forEach(t => { note(el, -1, t); note(el, 1, t + .1); });
        chirps([.3, .65, 1, 1.35, 1.7], .92); chirps([2.1, 2.45, 2.8, 3.15, 3.5], 1.12); chirps([4, 4.4, 4.8, 5.2], 1.02);
        return true;
      }
      if (opt === 'release') return release(el, done);
    },
    tap(el) { if (el._busy || el.classList.contains('released')) return; Sfx.chirp(el.dataset.hop ? 1.1 : .95); el.dataset.hop = el.dataset.hop ? '' : '1'; run(el, 'hop', 700); }
  });
})();
