/* Clean & Green — shared behavior: footer year, decorative trees, services carousel */
(function () {
  'use strict';

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Decorative pine trees along the road (home page only)
  var trees = document.getElementById('trees');
  if (trees) {
    var heights = [46, 62, 38, 70, 52, 44, 66, 40, 58, 48, 72, 42, 56, 64];
    heights.forEach(function (h) {
      trees.insertAdjacentHTML('beforeend',
        '<svg width="34" height="' + h + '" viewBox="0 0 34 70" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="M17 2 29 26H22L31 44H23L33 64H1L11 44H3L12 26H5z" fill="#1F4636"/>' +
        '<rect x="14" y="62" width="6" height="8" fill="#14271B"/></svg>');
    });
  }

  // Services carousel
  var root = document.querySelector('[data-carousel]');
  if (!root) return;

  var track = root.querySelector('.carousel-track');
  var slides = root.querySelectorAll('.slide');
  var tabs = document.querySelectorAll('[data-tab]');
  var prev = document.querySelector('[data-prev]');
  var next = document.querySelector('[data-next]');
  var toggle = document.querySelector('[data-toggle]');
  var count = slides.length;
  var index = 0;
  var hovering = false;
  var userPaused = false;

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduceMotion) userPaused = true;

  function render() {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    tabs.forEach(function (tab, n) {
      tab.setAttribute('aria-pressed', n === index ? 'true' : 'false');
    });
    slides.forEach(function (slide, n) {
      var active = n === index;
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      slide.querySelectorAll('a,button').forEach(function (el) {
        el.tabIndex = active ? 0 : -1;
      });
    });
    toggle.textContent = userPaused ? 'PLAY' : 'PAUSE';
  }

  function go(n) { index = (n + count) % count; render(); }

  tabs.forEach(function (tab, n) { tab.addEventListener('click', function () { go(n); }); });
  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index + 1); });
  toggle.addEventListener('click', function () { userPaused = !userPaused; render(); });

  ['mouseenter', 'focusin'].forEach(function (evt) {
    root.addEventListener(evt, function () { hovering = true; });
  });
  ['mouseleave', 'focusout'].forEach(function (evt) {
    root.addEventListener(evt, function () { hovering = false; });
  });

  setInterval(function () {
    if (!hovering && !userPaused) go(index + 1);
  }, 4500);

  render();
})();
