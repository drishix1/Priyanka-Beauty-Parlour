/* Compact phone enhancements; tablet and desktop markup stay intact. */
document.addEventListener('DOMContentLoaded', () => {
  const phone = matchMedia('(max-width: 767px)');
  const nav = document.querySelector('.nav-menu');
  const revealActive = () => {
    if (!phone.matches || !nav) return;
    const link = nav.querySelector('[aria-current="page"]');
    if (link) nav.scrollLeft = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
  };
  phone.addEventListener('change', revealActive);
  requestAnimationFrame(revealActive);
  document.querySelector('.phone-more-faq')?.addEventListener('click', event => {
    const button = event.currentTarget;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? 'Fewer questions' : 'More questions';
    button.closest('.home-faq').classList.toggle('phone-expanded', expanded);
  });
  const footer = document.querySelector('footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      document.body.classList.toggle('phone-footer-visible', entries[0].isIntersecting);
    }).observe(footer);
  }
});
