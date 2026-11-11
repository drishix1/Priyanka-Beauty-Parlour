/**
 * Responsive navigation and keyboard focus management.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Navigation Toggle
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const navCloseBtn = document.getElementById('navCloseBtn');

  if (hamburgerBtn && navMenu) {
    const mobileView = window.matchMedia('(min-width: 768px) and (max-width: 992px)');
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

});
