/*
  UNKSO image loader
  ------------------
  Any element with data-img="images/name.jpg" shows that image once it has loaded.
  If the file is missing, the striped placeholder stays, so images can be added one
  at a time. An element with data-video="images/name.mp4" plays that clip muted on
  a loop (skipped for visitors who prefer reduced motion).

  Carousel: data-carousel="images/home-hero-{n}.jpg" looks for home-hero-1.jpg,
  home-hero-2.jpg, home-hero-3.jpg ... and stops at the first number that is
  missing, so any number of images can be added without touching the code.
  Each image fades into the next every data-interval milliseconds (default 6000)
  and loops back to the first. Visitors who prefer reduced motion see the first
  image only. The carousel pauses while the browser tab is hidden.
*/
(function () {
  var style = document.createElement('style');
  style.textContent = '[data-img].has-img > span, [data-video].has-img > span, [data-carousel].has-img > span { display: none !important; }';
  document.head.appendChild(style);

  Array.prototype.forEach.call(document.querySelectorAll('[data-img]'), function (el) {
    var src = el.getAttribute('data-img');
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src + '")';
      // data-img-fit="contain" shows the whole image (rank insignia); default fills the frame
      el.style.backgroundSize = el.getAttribute('data-img-fit') || 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      el.classList.add('has-img');
    };
    img.src = src;
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (el) {
    var pattern = el.getAttribute('data-carousel');
    var interval = parseInt(el.getAttribute('data-interval'), 10) || 6000;
    var MAX = 50, slides = [], current = 0, timer = null;

    function show(i) {
      slides[current].classList.remove('is-on');
      current = i;
      slides[current].classList.add('is-on');
    }
    function next() { if (!document.hidden && slides.length > 1) show((current + 1) % slides.length); }
    function start() { if (!timer && !reduce && slides.length > 1) timer = setInterval(next, interval); }

    // Load images in order: 1, 2, 3 ... until one is missing.
    (function load(n) {
      if (n > MAX || (reduce && n > 1)) return;
      var src = pattern.replace('{n}', n);
      var img = new Image();
      img.onload = function () {
        var slide = document.createElement('div');
        slide.className = 'slide' + (slides.length === 0 ? ' is-on' : '');
        slide.style.backgroundImage = 'url("' + src + '")';
        el.appendChild(slide);
        slides.push(slide);
        if (slides.length === 1) el.classList.add('has-img');
        start();
        load(n + 1);
      };
      img.src = src;
    })(1);
  });

  if (reduce) return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-video]'), function (el) {
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    v.addEventListener('loadeddata', function () {
      el.appendChild(v);
      el.classList.add('has-img');
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }, { once: true });
    v.src = el.getAttribute('data-video');
    v.load();
  });
})();
