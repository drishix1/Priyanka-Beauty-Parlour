/* contact-hints progressive enhancement; no framework or global state. */
(() => {
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
    let welcomeChecked = false;
    const showWelcomeOnce = () => {
      if (welcomeChecked) return;
      welcomeChecked = true;
      try {
        const key = 'priyanka-contact-hints-seen';
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        buttons.forEach(showBriefly);
      } catch {
        // With storage unavailable, keep hints available through direct interaction.
      }
    };
    window.addEventListener('pageshow', showWelcomeOnce);
    window.addEventListener('pagehide', () => buttons.forEach(hide));
    showWelcomeOnce();
  }

  document.addEventListener('DOMContentLoaded', initContactHints);
})();
