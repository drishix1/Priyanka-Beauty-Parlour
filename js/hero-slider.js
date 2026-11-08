/* Home carousel: native controls, no dependencies, stable slide geometry. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-hero-slider]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-hero-slide]')];
  const dots = [...root.querySelectorAll('[data-hero-dot]')];
  const previous = root.querySelector('[data-hero-prev]');
  const next = root.querySelector('[data-hero-next]');
  const status = root.querySelector('[data-hero-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 5500;
  let index = 0, timer = null, fadeTimer = null, deadline = 0, remaining = duration;
  let inView = true, pageActive = true;
  let pointer = null;
  function stop() {
    if (timer !== null) remaining = Math.max(0, deadline - performance.now());
    clearTimeout(timer); timer = null;
    root.classList.remove('is-playing');
  }
  function sync() {
    stop();
    if (reduced.matches || root.contains(document.activeElement) || document.hidden || !inView || !pageActive) return;
    root.classList.add('is-playing');
    deadline = performance.now() + remaining;
    timer = setTimeout(() => { timer = null; show(index + 1, false); }, remaining);
  }
  function show(requested, manual) {
    stop(); clearTimeout(fadeTimer);
    const old = slides[index];
    const target = (requested + slides.length) % slides.length;
    if (manual && old.contains(document.activeElement)) (requested < index ? previous : next).focus({preventScroll:true});
    index = target;
    slides[index].querySelectorAll("img").forEach(image => { image.loading = "eager"; });
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.classList.remove('is-leaving');
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
      if (i === index) dots[i].setAttribute('aria-current', 'true');
      else dots[i].removeAttribute('aria-current');
    });
    if (old !== slides[index] && !reduced.matches) {
      old.classList.add('is-leaving');
      fadeTimer = setTimeout(() => old.classList.remove('is-leaving'), 700);
    }
    remaining = duration;
    root.classList.remove('is-timing'); void root.offsetWidth; root.classList.add('is-timing');
    if (manual) status.textContent = `Slide ${index + 1} of ${slides.length}: ${slides[index].querySelector('h1,h2').textContent}`;
    sync();
  }
  previous.addEventListener('click', () => show(index - 1, true));
  next.addEventListener('click', () => show(index + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  root.addEventListener('focusin', sync);
  root.addEventListener('focusout', () => queueMicrotask(sync));
  root.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1), true);
  });
  const stage = root.querySelector('.campaign-stage');
  stage.append(previous, next);
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' && !e.target.closest('a,button')) pointer = {x:e.clientX,y:e.clientY};
  });
  stage.addEventListener('pointerup', e => {
    if (!pointer) return;
    const dx = e.clientX-pointer.x, dy = e.clientY-pointer.y; pointer = null;
    if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.4) show(index+(dx<0?1:-1),true);
  });
  stage.addEventListener('pointercancel', () => {pointer=null;});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => {
    slides.forEach(slide=>slide.classList.remove('is-leaving'));
    clearTimeout(fadeTimer); remaining=duration; sync();
  });
  window.addEventListener('pagehide', () => {pageActive=false;stop();clearTimeout(fadeTimer);});
  window.addEventListener('pageshow', () => {pageActive=true;sync();});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {inView=entries[0].isIntersecting;sync();}, {threshold:0});
    observer.observe(root);
  }
  root.querySelector('.hero-controls').hidden=false;
  root.classList.add('is-slider-ready'); show(0, false);
});
