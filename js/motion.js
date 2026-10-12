/*
  UNKSO motion
  ------------
  Subtle, optional motion for the public pages:
    1. Image "magnet": the hero image (and the homepage quote image) eases
       toward the cursor.
    2. Tilt cards ([data-tilt]): lift, tilt toward the cursor, orange spotlight.
    3. Scroll reveal: content eases up as it scrolls into view (always visible,
       never hidden while waiting).
    4. Count-up: plain-number stats count up the first time they are seen.
  Everything is skipped for visitors who prefer reduced motion, and the cursor
  effects only run on devices with a fine pointer (mouse or trackpad).
*/
(function () {
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  if (mq('(prefers-reduced-motion: reduce)')) return;
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var EASE = 'cubic-bezier(.2,.7,.2,1)';

  var css = [
    /* Tilt cards */
    '[data-tilt]{transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(var(--lift,0px));',
    'transition:transform .5s ' + EASE + ',box-shadow .5s ease,opacity .8s ' + EASE + ',translate .8s ' + EASE + ';will-change:transform;}',
    '[data-tilt]:hover{--lift:-8px;box-shadow:0 34px 60px -24px rgba(0,0,0,.75),0 0 0 1px rgba(240,122,46,.6);',
    'transition:transform .15s linear,box-shadow .5s ease,opacity .8s ' + EASE + ',translate .8s ' + EASE + ';}',
    '[data-tilt]::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;',
    'background:radial-gradient(460px circle at var(--mx,50%) var(--my,50%),rgba(240,122,46,.24),transparent 60%);opacity:0;transition:opacity .4s ease;}',
    '[data-tilt]:hover::before{opacity:1;}',
    '[data-tilt]:hover::after{opacity:.82;}',
    /* Scroll reveal: starts visible, eases up into place */
    '.rv{opacity:.35;translate:0 26px;transition:opacity .9s ' + EASE + ',translate .9s ' + EASE + ';transition-delay:var(--rv-delay,0ms);}',
    '.rv.rv-in{opacity:1;translate:0 0;}',
    /* Keep the tilt easing on cards that also reveal */
    '.rv[data-tilt]{transition:transform .5s ' + EASE + ',box-shadow .5s ease,opacity .9s ' + EASE + ',translate .9s ' + EASE + ';transition-delay:0s,0s,var(--rv-delay,0ms),var(--rv-delay,0ms);}',
    /* Hero entrance */
    '@keyframes unkso-rise{from{opacity:.25;transform:translateY(18px)}to{opacity:1;transform:none}}',
    '.hero h1,.hero .signal,.hero .lede,.hero-aside,.hero .cta-row,.hero-title p,.hero .search{animation:unkso-rise 1.1s ' + EASE + ' both;}',
    '.hero h1{animation-delay:.08s}.hero-aside,.hero .lede,.hero-title p{animation-delay:.2s}.hero .cta-row,.hero .search{animation-delay:.3s}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- 1. Hero magnet ----------
  if (finePointer) {
    var PAIRS = [['.hero', '.hero-media'], ['.quote-band', '.quote-media']];
    PAIRS.forEach(function (pair) { Array.prototype.forEach.call(document.querySelectorAll(pair[0]), function (hero) {
      var media = hero.querySelector(pair[1]);
      if (!media) return;
      media.style.scale = '1.06'; // headroom so the edges never show
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function tick() {
        cx += (tx - cx) * 0.07;
        cy += (ty - cy) * 0.07;
        media.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px';
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
        else raf = null;
      }
      function kick() { if (!raf) raf = requestAnimationFrame(tick); }
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        tx = nx * 30; ty = ny * 20;
        kick();
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    }); });
  }

  // ---------- 2. Tilt cards ----------
  if (finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---------- 3. Scroll reveal + 4. Count-up ----------
  if (!('IntersectionObserver' in window)) return;
  var SELECTORS = '.statement, .stats > div, .division, .ops-row > div, .quote-band figure, .split > div, .final-card,' +
                  ' .category, .notice, .ftx, .node, .roles li, .res li, .switch-card, .join, .facts .fact, .two-col > div';
  var targets = Array.prototype.slice.call(document.querySelectorAll(SELECTORS));
  var vh = window.innerHeight || 800;
  var groupIndex = new Map();
  targets.forEach(function (el) {
    // Only animate what starts below the first screen, so the first view is complete at rest.
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    var parent = el.parentElement;
    var i = groupIndex.get(parent) || 0;
    groupIndex.set(parent, i + 1);
    el.style.setProperty('--rv-delay', Math.min(i * 80, 320) + 'ms');
    el.classList.add('rv');
  });

  function countUp(el) {
    var end = parseInt(el.textContent, 10);
    if (!(end > 0) || String(end) !== el.textContent.trim()) return;
    var start = null, dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('rv-in');
      Array.prototype.forEach.call(en.target.querySelectorAll('.stat-value'), countUp);
      if (en.target.classList.contains('stat-value')) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
  // Stats already on screen at load still count up once.
  Array.prototype.forEach.call(document.querySelectorAll('.stats > div'), function (el) {
    if (!el.classList.contains('rv')) io.observe(el);
  });
})();
