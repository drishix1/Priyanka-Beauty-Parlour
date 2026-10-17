/* About-only progressive enhancement. Shared navigation and photo viewer stay in script.js. */
(() => {
  function initAboutPage() {
    const page = document.querySelector('.about-page');
    if (!page) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchTimers = new Map();
    page.addEventListener('pointerdown', event => {
      if (reduced.matches || event.pointerType === 'mouse') return;
      const target = event.target.closest('.about-copy h2, .about-copy h3, .about-heading h2, .about-timeline li');
      if (!target) return;
      clearTimeout(touchTimers.get(target));
      target.classList.add('is-touched');
      touchTimers.set(target, setTimeout(() => { target.classList.remove('is-touched'); touchTimers.delete(target); }, 850));
    });

    page.querySelectorAll('[data-about-carousel]').forEach(root => {
      const slides = Array.from(root.querySelectorAll('[data-slide]'));
      const previous = root.querySelector('[data-carousel-prev]');
      const next = root.querySelector('[data-carousel-next]');
      const toggle = root.querySelector('[data-carousel-toggle]');
      const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
      const status = root.querySelector('[data-carousel-status]');
      const stage = root.querySelector('.about-slides');
      if (slides.length < 2 || !previous || !next || !toggle || !stage) return;
      let index = 0, timer = null, fadeTimer = null;
      let userPaused = reduced.matches;
      let hovering = window.matchMedia('(hover: hover)').matches && root.matches(':hover');
      let focused = root.contains(document.activeElement);
      let visible = !('IntersectionObserver' in window);
      let pointer = null, suppressClickUntil = 0;
      const announcement = document.createElement('span');
      announcement.className = 'about-sr-only';
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      root.append(announcement);
      const sync = () => {
        clearTimeout(timer);
        timer = null;
        toggle.disabled = reduced.matches;
        toggle.textContent = reduced.matches ? 'Autoplay off' : userPaused ? 'Play slideshow' : 'Pause slideshow';
        toggle.setAttribute('aria-label', reduced.matches ? 'Autoplay off: reduced motion enabled' : userPaused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
        if (!userPaused && !reduced.matches && !hovering && !focused && visible && !document.hidden) {
          timer = setTimeout(() => { show(index + 1, false); }, 5000);
        }
      };
      const show = (requestedIndex, manual) => {
        clearTimeout(fadeTimer);
        const old = slides[index];
        index = (requestedIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.hidden = false;
          slide.inert = i !== index;
          slide.setAttribute('aria-hidden', String(i !== index));
          slide.classList.toggle('is-active', i === index);
          slide.classList.remove('is-leaving');
          const dot = dots[i];
          if (dot) {
            if (i === index) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
          }
        });
        if (old !== slides[index] && !reduced.matches) {
          old.classList.add('is-leaving');
          fadeTimer = setTimeout(() => old.classList.remove('is-leaving'), 720);
        }
        if (status) status.textContent = `${index + 1} / ${slides.length}`;
        if (manual) {
          userPaused = true;
          announcement.textContent = `Photo ${index + 1} of ${slides.length}. ${slides[index].querySelector('figcaption')?.textContent || ''}`;
        }
        sync();
      };
      previous.addEventListener('click', () => show(index - 1, true));
      next.addEventListener('click', () => show(index + 1, true));
      dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
      toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
      root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; sync(); } });
      root.addEventListener('pointerleave', () => { hovering = false; sync(); });
      root.addEventListener('focusin', () => { focused = true; sync(); });
      root.addEventListener('focusout', () => {
        queueMicrotask(() => { focused = root.contains(document.activeElement); sync(); });
      });
      root.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        // Keep focus on a visible control if the current photo will become inert.
        if (event.target.closest('[data-slide]')) (event.key === 'ArrowRight' ? next : previous).focus();
        show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
      root.addEventListener('click', event => {
        if (!event.target.closest('[data-photo]')) return;
        if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); return; }
        userPaused = true;
        sync();
      }, true);
      stage.style.touchAction = 'pan-y';
      stage.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
          pointer = { x: event.clientX, y: event.clientY };
          userPaused = true;
          sync();
        }
      });
      stage.addEventListener('pointerup', event => {
        if (!pointer) return;
        const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
        pointer = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          suppressClickUntil = Date.now() + 600;
          show(index + (dx < 0 ? 1 : -1), true);
        }
      });
      stage.addEventListener('pointercancel', () => { pointer = null; });
      document.addEventListener('visibilitychange', sync);
      window.addEventListener('pagehide', () => { clearTimeout(timer); clearTimeout(fadeTimer); });
      window.addEventListener('pageshow', sync);
      reduced.addEventListener('change', () => {
        if (reduced.matches) userPaused = true;
        slides.forEach(slide => slide.classList.remove('is-leaving'));
        sync();
      });
      root.classList.add('is-carousel-ready');
      root.querySelector('.about-carousel-controls').hidden = false;
      root.querySelector('.about-carousel-dots').hidden = false;
      show(0, false);
      if ('IntersectionObserver' in window) {
        try {
          const observer = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
            sync();
          }, { threshold: [0, .15] });
          observer.observe(root);
        } catch { visible = true; sync(); }
      }
    });
    // Content is visible by default. Entrance effects are added only while entering.
    if (!reduced.matches && 'IntersectionObserver' in window) {
      const targets = Array.from(page.querySelectorAll('.about-reveal'));
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (!reduced.matches) entry.target.classList.add('is-about-entering');
          observer.unobserve(entry.target);
        });
      }, { threshold: .08 });
      targets.forEach((target, i) => {
        target.style.setProperty('--about-delay', `${target.closest('.about-timeline') ? i % 2 * 80 : 0}ms`);
        observer.observe(target);
      });
      reduced.addEventListener('change', () => {
        if (reduced.matches) { observer.disconnect(); targets.forEach(target => target.classList.remove('is-about-entering')); }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAboutPage);
  else initAboutPage();
})();
