/* gallery progressive enhancement; no framework or global state. */
(() => {
  function initGalleryFilters() {
    const grid = document.querySelector('[data-filter-gallery]');
    const filters = document.querySelector('.portfolio-filters');
    const status = document.querySelector('.portfolio-status');
    if (!grid || !filters || !status) return;
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    const buttons = Array.from(filters.querySelectorAll('[data-gallery-filter]'));
    function select(button) {
      const category = button.dataset.galleryFilter;
      let count = 0;
      cards.forEach(card => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) count += 1;
      });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      status.textContent = `${count} photographs shown`;
    }
    buttons.forEach(button => button.addEventListener('click', () => select(button)));
    filters.hidden = false;
    status.hidden = false;
    select(buttons[0]);
  }

  document.addEventListener('DOMContentLoaded', initGalleryFilters);
})();
