/**
 * Shared navigation, photo viewer, motion and WhatsApp booking.
 */
function selectService(serviceName) {
  const select = document.getElementById('serviceSelect');
  if (!select) {
    window.location.assign('index.html?service=' + encodeURIComponent(serviceName) + '#booking');
    return;
  }
  if (Array.from(select.options).some(option => option.value === serviceName)) select.value = serviceName;
}

function applyBookingService() {
  const service = new URLSearchParams(window.location.search).get('service');
  if (service && document.getElementById('serviceSelect')) selectService(service);
}

document.addEventListener('DOMContentLoaded', () => {
  const PARLOUR_PHONE = "9523262455"; // Priyanka Gupta - Phone & WhatsApp

  // 1. Mobile Navigation Toggle
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const navCloseBtn = document.getElementById('navCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    const mobileView = window.matchMedia('(max-width: 992px)');
    let menuOpen = false;
    const menuControls = () => Array.from(navMenu.querySelectorAll('a[href], button:not([disabled])'))
      .filter(control => control.getClientRects().length && getComputedStyle(control).visibility !== 'hidden');

    const setMenuOpen = (requestedOpen, restoreFocus = true) => {
      const wasOpen = menuOpen;
      menuOpen = mobileView.matches && requestedOpen;
      hamburgerBtn.classList.toggle('active', menuOpen);
      navMenu.classList.toggle('active', menuOpen);
      navBackdrop?.classList.toggle('active', menuOpen);
      document.body.classList.toggle('nav-open', menuOpen);
      document.documentElement.classList.toggle('nav-open', menuOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(menuOpen));
      hamburgerBtn.setAttribute('aria-label', menuOpen ? 'Close Navigation' : 'Open Navigation');

      // Move focus out before hiding the drawer from assistive technology.
      if (!menuOpen && wasOpen && restoreFocus && mobileView.matches) {
        hamburgerBtn.focus({ preventScroll: true });
      }
      navMenu.inert = mobileView.matches && !menuOpen;
      if (mobileView.matches) navMenu.setAttribute('aria-hidden', String(!menuOpen));
      else navMenu.removeAttribute('aria-hidden');
      if (menuOpen) menuControls()[0]?.focus({ preventScroll: true });
    };

    hamburgerBtn.addEventListener('click', () => setMenuOpen(!menuOpen));
    navCloseBtn?.addEventListener('click', () => setMenuOpen(false));
    navBackdrop?.addEventListener('click', () => setMenuOpen(false));
    document.addEventListener('click', event => {
      if (menuOpen && !navMenu.contains(event.target) && !hamburgerBtn.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (!menuOpen) return;
        setMenuOpen(false);
        // Keep normal anchor navigation, but move keyboard focus to its destination.
        const href = link.getAttribute('href');
        const target = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null;
        if (target) {
          const hadTabindex = target.hasAttribute('tabindex');
          if (!hadTabindex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      });
    });

    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      } else if (event.key === 'Tab') {
        const controls = menuControls();
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !navMenu.contains(document.activeElement))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !navMenu.contains(document.activeElement))) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    // Also contain focus moved by scripts or pointer interaction outside the drawer.
    document.addEventListener('focusin', event => {
      if (menuOpen && !navMenu.contains(event.target)) menuControls()[0]?.focus({ preventScroll: true });
    });

    mobileView.addEventListener('change', () => {
      const focused = document.activeElement;
      const focusWasInMenu = navMenu.contains(focused);
      setMenuOpen(false, false);
      if (mobileView.matches && focusWasInMenu) hamburgerBtn.focus({ preventScroll: true });
      else if (!mobileView.matches && (focused === hamburgerBtn || focused === navCloseBtn || focused.closest?.('.nav-mobile-cta'))) {
        navMenu.querySelector('.nav-link')?.focus({ preventScroll: true });
      }
    });
    // A restored history entry must never retain an open drawer or scroll lock.
    window.addEventListener('pagehide', () => setMenuOpen(false, false));
    window.addEventListener('pageshow', () => setMenuOpen(false, false));
    setMenuOpen(false, false);
  }
  // Page identity comes from each document's aria-current, not scroll position.
  applyBookingService();
  window.addEventListener('pageshow', applyBookingService);

  // 3. Shared service/gallery viewer and progressive scroll motion
  initOwnerCard();
  initPhotoViewer();
  initPageMotion();

  // 4. WhatsApp Quick Appointment / Query Form
  const appointmentForm = document.getElementById('appointmentForm');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const service = document.getElementById('serviceSelect').value;
      const date = document.getElementById('clientDate').value;

      if (!name || !phone || !service) {
        alert('Please fill your name, phone number, and desired service.');
        return;
      }

      // Format WhatsApp Message
      let message = `Hello Priyanka Ji,\n\n`;
      message += `I would like to book an appointment / enquire at Priyanka Beauty Parlour:\n`;
      message += `• Name: ${name}\n`;
      message += `• Phone: ${phone}\n`;
      message += `• Service: ${service}\n`;
      if (date) {
        message += `• Preferred Date: ${date}\n`;
      }
      message += `\nPlease let me know your availability. Thank you!`;

      // Build WhatsApp URL
      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/91${PARLOUR_PHONE}?text=${encodedMessage}`;

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');
    });
  }
});


function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// One viewer for service examples, the hero and actual bridal photographs.
function initPhotoViewer() {
  const modal = document.getElementById('lightboxModal');
  const image = document.getElementById('lightboxImg');
  const stage = document.getElementById('lightboxStage');
  const caption = document.getElementById('lightboxCaption');
  const counter = document.getElementById('lightboxCounter');
  const closeButton = document.getElementById('lightboxClose');
  const zoomButton = document.getElementById('lightboxZoom');
  const previousButton = document.getElementById('lightboxPrev');
  const nextButton = document.getElementById('lightboxNext');
  const triggers = Array.from(document.querySelectorAll('[data-photo]'));
  if (!modal || !image || !stage || !caption || !counter || !closeButton || !zoomButton || !previousButton || !nextButton) return;

  let items = [];
  let index = 0;
  let opener = null;
  let oldOverflow = '';
  let zoomed = false;
  let pointer = null;
  let suppressClick = false;
  let active = false;

  function resetZoom() {
    zoomed = false;
    stage.classList.remove('is-zoomed', 'is-dragging');
    image.style.width = '';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.setAttribute('aria-label', 'Zoom in');
    zoomButton.textContent = 'Zoom +';
  }

  function showPhoto(nextIndex) {
    if (!items.length) return;
    index = (nextIndex + items.length) % items.length;
    resetZoom();
    const item = items[index];
    const thumbnail = item.querySelector('img');
    const title = item.dataset.title || item.querySelector('h4')?.textContent || thumbnail?.alt || 'Photo preview';
    image.alt = thumbnail?.alt || title;
    caption.textContent = title;
    counter.textContent = `${index + 1} / ${items.length}`;
    previousButton.disabled = nextButton.disabled = items.length < 2;
    zoomButton.disabled = true;
    image.classList.remove('is-changing');
    image.src = item.dataset.full || thumbnail?.src || '';
    if (image.complete && image.naturalWidth > 0) zoomButton.disabled = false;
    if (!prefersReducedMotion()) {
      void image.offsetWidth;
      image.classList.add('is-changing');
    }
  }

  function finishClose() {
    if (!active) return;
    active = false;
    resetZoom();
    document.body.style.overflow = oldOverflow;
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (!active) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
    finishClose();
  }

  function openViewer(trigger) {
    if (active) return;
    opener = trigger;
    const group = trigger.dataset.gallery;
    items = triggers.filter(item => item.dataset.gallery === group);
    oldOverflow = document.body.style.overflow;
    active = true;
    showPhoto(items.indexOf(trigger));
    if (typeof modal.showModal === 'function') modal.showModal();
    else {
      modal.setAttribute('open', '');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
    }
    document.body.style.overflow = 'hidden';
    closeButton.focus({ preventScroll: true });
  }

  function toggleZoom() {
    if (zoomButton.disabled) return;
    if (zoomed) { resetZoom(); return; }
    const width = image.getBoundingClientRect().width;
    if (!width) return;
    zoomed = true;
    stage.classList.add('is-zoomed');
    image.style.width = `${width * 2}px`;
    zoomButton.setAttribute('aria-pressed', 'true');
    zoomButton.setAttribute('aria-label', 'Zoom out');
    zoomButton.textContent = 'Zoom −';
    stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
    stage.scrollTop = Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2);
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => openViewer(trigger));
    if (trigger.tagName !== 'BUTTON') {
      trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openViewer(trigger);
        }
      });
    }
  });
  image.addEventListener('load', () => { zoomButton.disabled = false; });
  image.addEventListener('error', () => {
    zoomButton.disabled = true;
    caption.textContent = 'This photo could not load. Please try the next photo.';
  });
  image.addEventListener('dragstart', event => event.preventDefault());
  image.addEventListener('click', () => {
    if (!suppressClick) toggleZoom();
    suppressClick = false;
  });
  zoomButton.addEventListener('click', toggleZoom);
  closeButton.addEventListener('click', closeViewer);
  previousButton.addEventListener('click', () => showPhoto(index - 1));
  nextButton.addEventListener('click', () => showPhoto(index + 1));
  modal.addEventListener('close', finishClose);
  modal.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  modal.addEventListener('click', event => {
    if (event.target === modal || (event.target === stage && !zoomed)) closeViewer();
  });
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
    if (event.key === 'ArrowLeft' && !zoomed) { event.preventDefault(); showPhoto(index - 1); }
    if (event.key === 'ArrowRight' && !zoomed) { event.preventDefault(); showPhoto(index + 1); }
    if (event.key === 'Tab') {
      const controls = [zoomButton, closeButton, previousButton, nextButton].filter(button => !button.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Native touch scrolling pans an enlarged photo; a horizontal swipe browses fitted photos.
  stage.addEventListener('pointerdown', event => {
    suppressClick = false;
    pointer = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop, type: event.pointerType };
    if (zoomed && event.pointerType === 'mouse') {
      event.preventDefault();
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
  });
  stage.addEventListener('pointermove', event => {
    if (!pointer || !zoomed || pointer.type !== 'mouse') return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    stage.scrollLeft = pointer.left - dx;
    stage.scrollTop = pointer.top - dy;
    if (Math.abs(dx) + Math.abs(dy) > 5) suppressClick = true;
  });
  stage.addEventListener('pointerup', event => {
    if (pointer && !zoomed && pointer.type === 'touch') {
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppressClick = true;
        showPhoto(index + (dx < 0 ? 1 : -1));
      }
    }
    pointer = null;
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('pointercancel', () => { pointer = null; stage.classList.remove('is-dragging'); });
  window.addEventListener('resize', () => { if (active) resetZoom(); });
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
  add('.hero-text-content, .about-image-wrapper, .location-card', 'left');
  add('.hero-image-wrapper, .about-text-content, .map-wrapper', 'right');
  add('.section-header, .service-category-header, .booking-card, .services-cta-banner, .contact-card-box');
  add('.service-card, .gallery-item', 'alternate');
  add('.occasion-look');

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


// Disclosure state is shared by mouse, touch and keyboard; CSS never opens it alone.
function initOwnerCard() {
  const card = document.getElementById('ownerCard');
  const trigger = document.getElementById('ownerCardTrigger');
  const panel = document.getElementById('ownerCardPanel');
  const close = document.getElementById('ownerCardClose');
  if (!card || !trigger || !panel || !close) return;
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  let open = false;
  let pinned = false;
  let hovered = false;
  let dismissed = false;

  function setOpen(value, focusPanel = false) {
    open = value;
    card.classList.toggle('is-open', value);
    trigger.setAttribute('aria-expanded', String(value));
    // Return focus before making the panel inert.
    if (!value && panel.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    panel.inert = !value;
    panel.setAttribute('aria-hidden', String(!value));
    if (value && focusPanel) close.focus({ preventScroll: true });
  }
  function dismiss() {
    pinned = false;
    dismissed = true; // Do not reopen beneath a stationary pointer after Close/Escape.
    setOpen(false);
  }
  trigger.addEventListener('click', () => {
    if (open) dismiss();
    else {
      dismissed = false;
      pinned = true;
      setOpen(true, true);
    }
  });
  close.addEventListener('click', dismiss);
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !hoverMedia.matches) return;
    hovered = true;
    if (!dismissed) setOpen(true);
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    dismissed = false;
    if (!pinned && !panel.contains(document.activeElement)) setOpen(false);
  });
  // Clicking/scrolling the revealed story keeps it open until explicitly dismissed.
  panel.addEventListener('click', event => {
    if (!close.contains(event.target) && open) pinned = true;
  });
  card.addEventListener('focusout', () => {
    queueMicrotask(() => {
      if (!card.contains(document.activeElement)) {
        pinned = false;
        if (!hovered || dismissed) setOpen(false);
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      dismiss();
    }
  });
  document.addEventListener('click', event => {
    if (open && !card.contains(event.target)) dismiss();
  });
  hoverMedia.addEventListener('change', () => {
    hovered = false;
    if (!pinned && !panel.contains(document.activeElement)) setOpen(false);
  });
  window.addEventListener('pagehide', dismiss);
  setOpen(false);
}


// Independent progressive enhancement: static HTML always contains final totals.
function initAchievements() {
  const section = document.querySelector('[data-achievements]');
  if (!section) return;
  const cards = Array.from(section.querySelectorAll('.achievement-card'));
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
      card.style.setProperty('--highlight-x', (50 + currentX * 45).toFixed(2) + '%');
      card.style.setProperty('--highlight-y', (50 + currentY * 45).toFixed(2) + '%');
      card.style.setProperty('--shadow-x', (currentX * 5).toFixed(2) + 'px');
      card.style.setProperty('--shadow-y', (12 + currentY * 3).toFixed(2) + 'px');
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .005) frame = requestAnimationFrame(paint);
      else frame = null;
    };
    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      currentX = currentY = targetX = targetY = 0;
      ['--highlight-x', '--highlight-y', '--shadow-x', '--shadow-y'].forEach(name => card.style.removeProperty(name));
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

// Brief welcome hints, then show only during direct interaction.
function initContactHints() {
  const buttons = Array.from(document.querySelectorAll('.floating-btn'));
  const timers = new Map();
  const hide = button => {
    clearTimeout(timers.get(button));
    timers.delete(button);
    button.classList.remove('hint-visible');
  };
  const showBriefly = button => {
    hide(button);
    button.classList.add('hint-visible');
    timers.set(button, setTimeout(() => hide(button), 2000));
  };
  buttons.forEach(button => {
    button.addEventListener('click', () => showBriefly(button));
    button.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse') showBriefly(button);
    });
    button.addEventListener('blur', () => hide(button));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') buttons.forEach(hide);
  });
  window.addEventListener('pageshow', () => buttons.forEach(showBriefly));
  window.addEventListener('pagehide', () => buttons.forEach(hide));
  buttons.forEach(showBriefly);
}
document.addEventListener('DOMContentLoaded', initContactHints);
