/*
  UNKSO image loader
  ------------------
  Any element with data-img="images/name.jpg" shows that image once it has loaded.
  If the file is missing, the striped placeholder stays, so images can be added one
  at a time. An element with data-video="images/name.mp4" plays that clip muted on
  a loop (skipped for visitors who prefer reduced motion).
*/
(function () {
  var style = document.createElement('style');
  style.textContent = '[data-img].has-img > span, [data-video].has-img > span { display: none !important; }';
  document.head.appendChild(style);

  Array.prototype.forEach.call(document.querySelectorAll('[data-img]'), function (el) {
    var src = el.getAttribute('data-img');
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src + '")';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.classList.add('has-img');
    };
    img.src = src;
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
