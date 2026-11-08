/* achievements progressive enhancement; no framework or global state. */
(() => {
  function initAchievements() {
    const section = document.querySelector('[data-achievements]');
    if (!section) return;
    const cards = Array.from(section.querySelectorAll('.achievement-card, .trust-count-card'));
    const counters = cards.map(card => card.querySelector('[data-count]'));
    if (cards.length !== 2 || counters.some(counter => !counter)) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let started = false;
    let observer = null;
    let counterFrame = null;
    let fallbackTimer = null;
    const hoverResets = [];

    function finish() {
      started = true;
      observer?.disconnect();
      if (counterFrame !== null) cancelAnimationFrame(counterFrame);
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      counterFrame = fallbackTimer = null;
      counters.forEach(counter => { counter.textContent = counter.dataset.count; });
      section.classList.remove('is-entering');
    }
    function enter() {
      if (started) return;
      started = true;
      observer?.disconnect();
      if (reduceMotion.matches) { finish(); return; }
      // The timeout also restores final values if an animation callback fails.
      fallbackTimer = setTimeout(finish, 2400);
      try {
        cards.forEach((card, index) => card.style.setProperty('--achievement-delay', index * 120 + 'ms'));
        counters.forEach(counter => { counter.textContent = '0'; });
        section.classList.add('is-entering');
        let origin = null;
        const tick = now => {
          try {
            if (reduceMotion.matches) { finish(); return; }
            if (origin === null) origin = now;
            let complete = true;
            counters.forEach((counter, index) => {
              const elapsed = Math.max(0, now - origin - index * 120);
              const progress = Math.min(1, elapsed / 1800);
              const eased = 1 - Math.pow(1 - progress, 3);
              counter.textContent = String(Math.floor(Number(counter.dataset.count) * eased));
              if (progress < 1) complete = false;
            });
            if (complete) finish();
            else counterFrame = requestAnimationFrame(tick);
          } catch { finish(); }
        };
        counterFrame = requestAnimationFrame(tick);
      } catch { finish(); }
    }

    cards.forEach(card => {
      let frame = null;
      let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
      const paint = () => {
        currentX += (targetX - currentX) * .18;
        currentY += (targetY - currentY) * .18;
        // Pointer motion only changes a composited transform, never repaints shadows.
        card.style.setProperty('--card-tilt-x', (-currentY * 2).toFixed(2) + 'deg');
        card.style.setProperty('--card-tilt-y', (currentX * 2).toFixed(2) + 'deg');
        if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .005) frame = requestAnimationFrame(paint);
        else frame = null;
      };
      const reset = () => {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        currentX = currentY = targetX = targetY = 0;
        ['--card-tilt-x', '--card-tilt-y'].forEach(name => card.style.removeProperty(name));
      };
      hoverResets.push(reset);
      card.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || reduceMotion.matches || !hoverPointer.matches) return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        if (frame === null) frame = requestAnimationFrame(paint);
      });
      card.addEventListener('pointerleave', () => {
        targetX = targetY = 0;
        if (!reduceMotion.matches && frame === null) frame = requestAnimationFrame(paint);
        else if (reduceMotion.matches) reset();
      });
      card.addEventListener('pointercancel', reset);
    });

    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) { finish(); hoverResets.forEach(reset => reset()); }
    });
    hoverPointer.addEventListener('change', () => hoverResets.forEach(reset => reset()));
    window.addEventListener('pagehide', () => { finish(); hoverResets.forEach(reset => reset()); });
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { finish(); return; }
    try {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) enter();
      }, { threshold: .15 });
      observer.observe(section);
    } catch { finish(); }
  }

  document.addEventListener('DOMContentLoaded', initAchievements);
})();
