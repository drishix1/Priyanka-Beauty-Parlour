/* motion progressive enhancement; no framework or global state. */
(() => {
  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initPageMotion() {
    const backToTop = document.getElementById('backToTop');
    let framePending = false;
    const updateScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
      document.documentElement.style.setProperty('--scroll-progress', String(progress));
      if (backToTop) backToTop.hidden = window.scrollY < 600;
      framePending = false;
    };
    window.addEventListener('scroll', () => {
      if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
    }, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;
    const targets = [];
    const add = (selector, direction = 'up') => {
      document.querySelectorAll(selector).forEach((element, i) => {
        const horizontal = window.matchMedia('(max-width: 600px)').matches ? 0 : direction === 'alternate' ? (i % 2 ? 42 : -42) : direction === 'left' ? -42 : direction === 'right' ? 42 : 0;
        element.classList.add('reveal');
        element.style.setProperty('--reveal-x', `${horizontal}px`);
        element.style.setProperty('--reveal-y', horizontal ? '0px' : '24px');
        element.style.setProperty('--reveal-delay', `${direction === 'alternate' ? (i % 3) * 75 : 0}ms`);
        targets.push(element);
      });
    };
    add('.location-card', 'left');
    add('.map-wrapper', 'right');
    add('.section-header, .service-category-header, .services-cta-banner, .contact-card-box');
    add('.service-card', 'alternate');

    let observer;
    const revealAll = () => {
      document.documentElement.classList.remove('motion-ready');
      targets.forEach(element => element.classList.add('is-visible'));
      observer?.disconnect();
    };
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      targets.forEach(element => observer.observe(element));
      document.documentElement.classList.add('motion-ready');
      document.addEventListener('focusin', event => {
        event.target.closest?.('.reveal')?.classList.add('is-visible');
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
