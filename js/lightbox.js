/* lightbox progressive enhancement; no framework or global state. */
(() => {
  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

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
    const touches = new Map();
    let pinch = null;

    function resetZoom() {
      touches.clear(); pinch = null;
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
      const title = item.dataset.title || item.querySelector('h2, h3, h4')?.textContent || thumbnail?.alt || 'Photo preview';
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
      items = triggers.filter(item => item.dataset.gallery === group &&
        (!item.closest('[data-filter-gallery]') || !item.closest('[hidden]')));
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
      zoomButton.textContent = 'Zoom -';
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
    image.addEventListener('load', () => {
      image.width = image.naturalWidth;
      image.height = image.naturalHeight;
      zoomButton.disabled = false;
    });
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
      if (suppressClick) { suppressClick = false; return; }
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
      if (event.pointerType === 'touch' && matchMedia('(max-width: 767px)').matches) {
        touches.set(event.pointerId, {x:event.clientX,y:event.clientY});
        if (touches.size === 2) {
          const [a,b] = [...touches.values()];
          pinch = {distance:Math.hypot(a.x-b.x,a.y-b.y),width:image.getBoundingClientRect().width};
          pointer = null; suppressClick = true;
          return;
        }
      }
      pointer = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop, type: event.pointerType };
      if (zoomed && event.pointerType === 'mouse') {
        event.preventDefault();
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      }
    });
    stage.addEventListener('pointermove', event => {
      if (touches.has(event.pointerId)) touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if (pinch && touches.size === 2) {
        const [a,b] = [...touches.values()];
        const ratio = Math.hypot(a.x-b.x,a.y-b.y) / Math.max(1,pinch.distance);
        const width = Math.max(stage.clientWidth * .5, Math.min(stage.clientWidth * 4,pinch.width * ratio));
        zoomed = true; suppressClick = true;
        stage.classList.add('is-zoomed');
        image.style.width = `${width}px`;
        zoomButton.setAttribute('aria-pressed','true');
        zoomButton.setAttribute('aria-label','Zoom out');
        zoomButton.textContent = 'Zoom -';
        return;
      }
      if (!pointer || !zoomed || (pointer.type !== 'mouse' && !matchMedia('(max-width: 767px)').matches)) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      stage.scrollLeft = pointer.left - dx;
      stage.scrollTop = pointer.top - dy;
      if (Math.abs(dx) + Math.abs(dy) > 5) suppressClick = true;
    });
    stage.addEventListener('pointerup', event => {
      touches.delete(event.pointerId);
      if (pinch) { if (!touches.size) pinch = null; pointer = null; suppressClick = true; return; }
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
    stage.addEventListener('pointercancel', event => { touches.delete(event.pointerId); pinch = null; pointer = null; stage.classList.remove('is-dragging'); });
    window.addEventListener('resize', () => { if (active) resetZoom(); });
  }

  document.addEventListener('DOMContentLoaded', initPhotoViewer);
})();
