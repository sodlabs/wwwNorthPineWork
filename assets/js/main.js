(function () {
  'use strict';

  // --- Theme toggle (persisted only in-memory + localStorage on device) ---
  var root = document.documentElement;
  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem('npw-theme');
  } catch (e) {
    /* storage unavailable, fall back to system preference silently */
  }
  if (storedTheme) root.setAttribute('data-theme', storedTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = current ? current === 'dark' : prefersDark;
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('npw-theme', next);
      } catch (e) {
        /* ignore */
      }
    });
  });

  // --- Navbar scroll state ---
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Mobile menu ---
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal (runs once per element) ---
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : '0px';
    });
  });

  // --- Hero status panel: cosmetic "updated Xs ago" ticker, local only ---
  var clockEl = document.querySelector('[data-live-clock]');
  if (clockEl) {
    var startedAt = Date.now();
    setInterval(function () {
      var seconds = Math.floor((Date.now() - startedAt) / 1000);
      if (seconds < 60) {
        clockEl.textContent = seconds < 5 ? 'updated just now' : 'updated ' + seconds + 's ago';
      } else {
        clockEl.textContent = 'updated ' + Math.floor(seconds / 60) + 'm ago';
      }
    }, 1000);
  }

  // --- Contact email de-obfuscation ---
  // The address is stored reversed in a data attribute rather than as a
  // plain mailto: href, so simple scrapers that regex the raw HTML for
  // "mailto:" links don't pick it up. Real visitors get it instantly.
  document.querySelectorAll('[data-email-reversed]').forEach(function (el) {
    var real = el.getAttribute('data-email-reversed').split('').reverse().join('');
    el.textContent = real;
    if (el.tagName === 'A') el.href = 'mailto:' + real;
  });

  // --- Animated stat counters (run once) ---
  var stats = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && stats.length) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count-to'));
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 900;
          var start = null;

          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          statIo.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    stats.forEach(function (el) {
      statIo.observe(el);
    });
  }
})();
