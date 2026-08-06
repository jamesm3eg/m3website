/* M3 Engineering — site behaviour.
   Progressive enhancement only: every page works with JS disabled. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile menu ----------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var burger = document.querySelector('[data-burger]');

  if (header && burger) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* --- Header background on scroll ------------------------------------- */
  if (header && !header.classList.contains('is-solid')) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Reveal on scroll ------------------------------------------------ */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (!revealables.length) {
    // nothing to do
  } else if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* --- Project index filter -------------------------------------------- */
  var filterBar = document.querySelector('[data-filters]');

  if (filterBar) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-discipline]'));
    var counter = document.querySelector('[data-count]');
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('button'));

    var apply = function (key) {
      var shown = 0;

      rows.forEach(function (row) {
        var match = key === 'all' || row.getAttribute('data-discipline') === key;
        row.classList.toggle('is-hidden', !match);
        if (match) { shown++; }
      });

      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === key));
      });

      if (counter) {
        counter.textContent = shown + (shown === 1 ? ' project' : ' projects');
      }
    };

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (btn) { apply(btn.getAttribute('data-filter')); }
    });

    apply('all');
  }
})();
