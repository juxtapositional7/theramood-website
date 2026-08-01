/* ═══════════════════════════════════════════════
   TheraMood — interactions
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover     = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Footer year ─────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: glass on scroll ────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Nav: mobile menu ────────────────────── */
  const burger   = $('#navBurger');
  const navLinks = $('#navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', e => {
      if (e.target.closest('a')) {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Nav: highlight current section ──────── */
  const sectionIds = ['why', 'how', 'tour', 'reset', 'inside'];
  const linkFor = id => $(`.nav__links a[href="#${id}"]:not(.btn)`);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = linkFor(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        $$('.nav__links a').forEach(a => a.classList.remove('is-current'));
        link.classList.add('is-current');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* ── Scroll reveal ───────────────────────── */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── Animated counters ───────────────────── */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const runCounter = el => {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1600;
    let start = null;
    const tick = now => {
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      el.textContent = (target * easeOut(p)).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$('.counter');
  if (reduceMotion) {
    counters.forEach(el => {
      el.textContent = parseFloat(el.dataset.target).toFixed(parseInt(el.dataset.decimals || '0', 10));
    });
  } else {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ── App tour: tabs + auto-advance ───────── */
  const tourList  = $('#tourList');
  const tourItems = tourList ? $$('.tour__item', tourList) : [];
  const tourShots = $$('.tour-shot');
  const AUTO_MS   = 5000; // keep in sync with the CSS tourProgress animation

  if (tourItems.length && tourShots.length) {
    let current   = 0;
    let autoTimer = null;

    const activate = index => {
      current = index;
      tourItems.forEach((item, i) => {
        const active = i === index;
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', String(active));
      });
      // re-add on the next frame so the progress-bar animation restarts
      void tourItems[index].offsetWidth;
      tourItems[index].classList.add('is-active');

      tourShots.forEach((shot, i) => shot.classList.toggle('is-active', i === index));
      armTimer();
    };

    const armTimer = () => {
      clearTimeout(autoTimer);
      if (!reduceMotion) {
        autoTimer = setTimeout(() => activate((current + 1) % tourItems.length), AUTO_MS);
      }
    };

    const pause = () => {
      clearTimeout(autoTimer);
      tourList.parentElement.classList.add('tour--paused');
    };
    const resume = () => {
      tourList.parentElement.classList.remove('tour--paused');
      activate(current); // restarts progress bar + timer together
    };

    tourItems.forEach(item => {
      item.addEventListener('click', () => activate(parseInt(item.dataset.index, 10)));
    });

    if (canHover) {
      tourList.addEventListener('mouseenter', pause);
      tourList.addEventListener('mouseleave', resume);
    }

    // only advance while the tour is on screen
    const tourVisibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) resume();
      else pause();
    }, { threshold: 0.2 });
    tourVisibility.observe(tourList.parentElement);
  }

  /* ── Phone tilt (tour) ───────────────────── */
  if (canHover && !reduceMotion) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ── Hero parallax ───────────────────────── */
  const heroVisual = $('#heroVisual');
  if (heroVisual && canHover && !reduceMotion) {
    const layers = $$('[data-depth]', heroVisual);
    const hero   = $('.hero');
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth || '10');
        layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    });
    hero.addEventListener('mouseleave', () => {
      layers.forEach(layer => { layer.style.transform = ''; });
    });
  }

  /* ── 4-7-8 breathing widget ──────────────── */
  const breathStage = $('.breath__stage');
  const breathCircle = $('#breathCircle');
  const breathCount  = $('#breathCount');
  const breathLabel  = $('#breathLabel');
  const breathRound  = $('#breathRound');
  const breathStart  = $('#breathStart');

  if (breathStage && breathCircle && breathStart) {
    const PHASES = [
      { label: 'Breathe in',  secs: 4, scale: 1 },
      { label: 'Hold',        secs: 7, scale: 1 },
      { label: 'Breathe out', secs: 8, scale: 0.72 },
    ];
    const TOTAL_ROUNDS = 4;
    const IDLE_ROUND_TEXT = `${TOTAL_ROUNDS} rounds · about a minute`;

    let running = false;
    let round = 1;
    let phaseTimer = null;
    let tickTimer = null;

    const setCircle = (scale, secs) => {
      breathCircle.style.transition = `transform ${secs}s cubic-bezier(.45, 0, .55, 1)`;
      breathCircle.style.transform  = `scale(${scale})`;
    };

    const clearTimers = () => {
      clearTimeout(phaseTimer);
      clearInterval(tickTimer);
    };

    const runPhase = index => {
      const phase = PHASES[index];
      let remaining = phase.secs;

      breathLabel.textContent = phase.label;
      breathCount.textContent = remaining;
      breathRound.textContent = `Round ${round} of ${TOTAL_ROUNDS}`;
      setCircle(phase.scale, reduceMotion ? 0 : phase.secs);

      tickTimer = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) breathCount.textContent = remaining;
      }, 1000);

      phaseTimer = setTimeout(() => {
        clearInterval(tickTimer);
        const next = index + 1;
        if (next < PHASES.length) {
          runPhase(next);
        } else if (round < TOTAL_ROUNDS) {
          round += 1;
          runPhase(0);
        } else {
          finish();
        }
      }, phase.secs * 1000);
    };

    const reset = () => {
      clearTimers();
      running = false;
      breathStage.classList.remove('breath--running');
      setCircle(0.72, 0.6);
      breathCount.textContent = '4';
      breathLabel.textContent = 'Ready?';
      breathRound.textContent = IDLE_ROUND_TEXT;
      breathStart.textContent = 'Start breathing';
    };

    const finish = () => {
      clearTimers();
      running = false;
      breathStage.classList.remove('breath--running');
      setCircle(0.72, 1);
      breathCount.textContent = '🌿';
      breathLabel.textContent = 'Beautifully done';
      breathRound.textContent = `You completed all ${TOTAL_ROUNDS} rounds`;
      breathStart.textContent = 'Start again';
    };

    breathStart.addEventListener('click', () => {
      if (running) {
        reset();
        return;
      }
      running = true;
      round = 1;
      breathStage.classList.add('breath--running');
      breathStart.textContent = 'Stop';
      runPhase(0);
    });
  }
})();
