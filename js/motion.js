/* motion progressive enhancement; no framework or global state. */
(() => {
  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initPageMotion() {
    const backToTop = document.getElementById('backToTop');
    const header = document.querySelector('.main-header');
    if (backToTop) backToTop.hidden = false;
    let framePending = false;
    const updateScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
      document.documentElement.style.setProperty('--scroll-progress', String(progress));
      header?.classList.toggle('is-scrolled', window.scrollY > 40);
      if (backToTop) {
        const shown = window.scrollY >= 600;
        backToTop.classList.toggle('is-shown', shown);
        backToTop.inert = !shown;
        backToTop.setAttribute('aria-hidden', String(!shown));
      }
      framePending = false;
    };
    window.addEventListener('scroll', () => {
      if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
    }, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));

    const counters = Array.from(document.querySelectorAll('[data-count-up]'));
    const counterFrames = new Map();
    const finishCounts = () => {
      counterFrames.forEach(frame => cancelAnimationFrame(frame));
      counterFrames.clear();
      counters.forEach(el => { el.textContent = el.dataset.countUp; el.dataset.counted = 'true'; });
    };
    const count = el => {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const start = performance.now(), target = Number(el.dataset.countUp);
      const tick = now => {
        const progress = Math.min(1, (now - start) / 1250);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1 && !prefersReducedMotion()) counterFrames.set(el, requestAnimationFrame(tick));
        else { el.textContent = String(target); counterFrames.delete(el); }
      };
      counterFrames.set(el, requestAnimationFrame(tick));
    };
    window.addEventListener('pagehide', finishCounts);
    document.addEventListener('visibilitychange', () => { if (document.hidden) finishCounts(); });
    const portrait = document.querySelector('.owner-photo');
    const hover = matchMedia('(hover: hover) and (pointer: fine)');
    let tiltFrame = null;
    const resetTilt = () => { cancelAnimationFrame(tiltFrame); portrait?.style.removeProperty('transform'); };
    portrait?.addEventListener('pointermove', event => {
      if (prefersReducedMotion() || !hover.matches || event.pointerType !== 'mouse') return;
      const r = portrait.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5, y = (event.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(tiltFrame);
      tiltFrame = requestAnimationFrame(() => { portrait.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`; });
    });
    portrait?.addEventListener('pointerleave', resetTilt);
    hover.addEventListener('change', resetTilt);
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
      finishCounts(); return;
    }
    const targets = [];
    const add = (selector, direction = 'up') => {
      document.querySelectorAll(selector).forEach((element, i) => {
        if (targets.includes(element)) return;
        element.dataset.reveal ||= direction === 'left' ? 'slide-left' : direction === 'right' ? 'slide-right' : 'fade-up';
        element.classList.add('reveal');
        element.style.setProperty('--reveal-delay', `${direction === 'alternate' ? (i % 3) * 75 : 0}ms`);
        targets.push(element);
      });
    };
    add('.location-card', 'left');
    add('.map-wrapper', 'right');
    add('.section-header, .service-category-header, .services-cta-banner, .contact-card-box');
    add('.service-card', 'alternate');
    add('.home-course-grid article, .course-steps li, .home-faq details, .campaign-proof li', 'alternate');
    document.querySelectorAll('.home-gallery-grid .portfolio-item').forEach(el => { el.dataset.reveal = 'zoom-in'; });
    add('.home-gallery-grid .portfolio-item', 'alternate');
    add('.visit-info, .home-faq > h3');
    add('.visit-map', 'right');
    add('[data-reveal]');

    let observer;
    const revealAll = () => {
      document.documentElement.classList.remove('motion-ready');
      targets.forEach(element => element.classList.add('is-visible'));
      observer?.disconnect();
      finishCounts(); resetTilt();
    };
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.querySelectorAll('[data-count-up]').forEach(count);
            entry.target.addEventListener('transitionend', event => {
              if (event.target === entry.target && event.propertyName === 'opacity') entry.target.classList.add('reveal-complete');
            }, { once: true });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      targets.forEach(element => observer.observe(element));
      document.documentElement.classList.add('motion-ready');
      document.addEventListener('focusin', event => {
        for (let el = event.target; el; el = el.parentElement) {
          if (el.classList?.contains('reveal')) el.classList.add('is-visible');
        }
      });
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      preference.addEventListener?.('change', event => { if (event.matches) revealAll(); });
      window.addEventListener('beforeprint', revealAll);
    } catch {
      revealAll();
    }
  }

  document.addEventListener('DOMContentLoaded', initPageMotion);
})();
