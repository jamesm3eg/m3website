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

  /* --- Company dropdown ------------------------------------------------
     Hover and focus are handled in CSS. This adds tap support on touch
     devices and Escape/outside-click dismissal. */
  var navGroup = document.querySelector('[data-navgroup]');
  var navToggle = document.querySelector('[data-navtoggle]');

  if (navGroup && navToggle) {
    var setNav = function (open) {
      navGroup.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };

    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      setNav(!navGroup.classList.contains('is-open'));
    });

    document.addEventListener('click', function (e) {
      if (!navGroup.contains(e.target)) { setNav(false); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navGroup.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Leaving the group with the mouse should also reset the tapped state.
    navGroup.addEventListener('mouseleave', function () { setNav(false); });
  }

  /* --- Hero photo panel ------------------------------------------------
     Crossfade, not scroll. Pausable, and never runs under reduced-motion. */
  var hshow = document.querySelector('[data-hshow]');

  if (hshow) {
    var shots = hshow.querySelectorAll('.hshow__slide');
    var shotOut = hshow.querySelector('[data-hshow-index]');
    var shotBtn = hshow.querySelector('[data-hshow-toggle]');
    var at = 0, shotTimer = null, shotStopped = false;

    var paint = function () {
      for (var n = 0; n < shots.length; n++) {
        shots[n].classList.toggle('is-on', n === at);
      }
      if (shotOut) { shotOut.textContent = ('0' + (at + 1)).slice(-2); }
    };

    var startShots = function () {
      if (reduced || shotStopped || shotTimer || shots.length < 2) { return; }
      shotTimer = window.setInterval(function () {
        at = (at + 1) % shots.length;
        paint();
      }, 5000);
      if (shotBtn) { shotBtn.setAttribute('aria-pressed', 'false'); }
    };
    var pauseShots = function () {
      if (shotTimer) { window.clearInterval(shotTimer); shotTimer = null; }
    };
    var stopShots = function () {
      shotStopped = true;
      pauseShots();
      if (shotBtn) { shotBtn.setAttribute('aria-pressed', 'true'); }
    };

    if (shotBtn) {
      shotBtn.addEventListener('click', function () {
        if (shotTimer) { stopShots(); }
        else { shotStopped = false; startShots(); }
      });
      if (reduced) { shotBtn.setAttribute('aria-pressed', 'true'); }
    }

    hshow.addEventListener('mouseenter', pauseShots);
    hshow.addEventListener('mouseleave', function () { if (!shotStopped) { startShots(); } });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { startShots(); } else { pauseShots(); }
        });
      }, { threshold: 0.25 }).observe(hshow);
    } else {
      startShots();
    }

    paint();
  }

  /* --- Field slider ---------------------------------------------------- */
  var rail = document.querySelector('[data-rail]');

  if (rail) {
    var track = rail.querySelector('[data-rail-track]');
    var slides = track.querySelectorAll('.rail__slide');
    var prev = rail.querySelector('[data-rail-prev]');
    var next = rail.querySelector('[data-rail-next]');
    var toggle = rail.querySelector('[data-rail-toggle]');
    var bar = rail.querySelector('[data-rail-bar]');
    var idxOut = rail.querySelector('[data-rail-index]');
    var total = slides.length;

    var step = function () {
      if (slides.length < 2) { return track.clientWidth; }
      return slides[1].offsetLeft - slides[0].offsetLeft;
    };
    var maxScroll = function () {
      return Math.max(1, track.scrollWidth - track.clientWidth);
    };

    // Keep the readout, meter and button states in sync with actual scroll
    // position, whatever caused it: buttons, swipe, trackpad or keyboard.
    var sync = function () {
      var x = track.scrollLeft;
      var max = maxScroll();
      var i = Math.min(total - 1, Math.round(x / step()));

      if (idxOut) { idxOut.textContent = ('0' + (i + 1)).slice(-2); }
      if (bar) {
        var visible = Math.min(1, track.clientWidth / track.scrollWidth);
        bar.style.width = (visible * 100) + '%';
        bar.style.transform = 'translateX(' + (x / max) * ((1 / visible) - 1) * 100 + '%)';
      }
      if (prev) { prev.disabled = x <= 2; }
      if (next) { next.disabled = x >= max - 2; }
    };

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(function () { sync(); ticking = false; });
      }
    }, { passive: true });
    window.addEventListener('resize', sync);

    var go = function (dir) {
      var max = maxScroll();
      var target = track.scrollLeft + dir * step();
      // Wrap around rather than dead-ending, so autoplay can loop.
      if (dir > 0 && track.scrollLeft >= max - 2) { target = 0; }
      if (dir < 0 && track.scrollLeft <= 2) { target = max; }
      track.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
    };

    if (prev) { prev.addEventListener('click', function () { go(-1); stop(); }); }
    if (next) { next.addEventListener('click', function () { go(1); stop(); }); }

    /* Autoplay. Off entirely under reduced-motion, paused while the visitor is
       hovering, focused inside, or touching, and stoppable with a button -
       WCAG 2.2.2 requires moving content to be pausable. */
    var timer = null;
    var userStopped = false;

    var start = function () {
      if (reduced || userStopped || timer) { return; }
      timer = window.setInterval(function () { go(1); }, 5500);
      if (toggle) { toggle.setAttribute('aria-pressed', 'false'); }
    };
    var pause = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };
    function stop() {
      userStopped = true;
      pause();
      if (toggle) { toggle.setAttribute('aria-pressed', 'true'); }
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (timer) {
          stop();
        } else {
          userStopped = false;
          start();
        }
      });
    }

    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('mouseleave', function () { if (!userStopped) { start(); } });
    rail.addEventListener('focusin', pause);
    rail.addEventListener('focusout', function () { if (!userStopped) { start(); } });
    track.addEventListener('pointerdown', stop);

    // Only run autoplay while the section is actually on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { start(); } else { pause(); }
        });
      }, { threshold: 0.35 }).observe(rail);
    } else {
      start();
    }

    sync();
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

    // Allow deep links such as projects.html?discipline=stormwater
    var valid = buttons.map(function (b) { return b.getAttribute('data-filter'); });
    var want = new URLSearchParams(window.location.search).get('discipline');
    apply(valid.indexOf(want) > -1 ? want : 'all');
  }
})();
