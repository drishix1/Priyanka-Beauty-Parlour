/**
 * Priyanka Beauty Parlour - JavaScript
 * Features: Mobile Nav, ScrollSpy, Gallery Lightbox, and WhatsApp Appointment Form
 */

// Helper to pre-select a service from the service cards
function selectService(serviceName) {
  const selectElem = document.getElementById('serviceSelect');
  if (selectElem) {
    for (let i = 0; i < selectElem.options.length; i++) {
      if (selectElem.options[i].value === serviceName) {
        selectElem.selectedIndex = i;
        break;
      }
    }
  }
  const bookingCard = document.getElementById('booking');
  if (bookingCard) {
    bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('clientName');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 500);
    }
  }
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
    const isMobileView = () => window.innerWidth <= 992;

    const setAriaState = (isOpen) => {
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburgerBtn.setAttribute('aria-label', isOpen ? 'Close Navigation' : 'Open Navigation');
      if (isMobileView()) {
        navMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      } else {
        navMenu.removeAttribute('aria-hidden');
      }
    };

    // Initialize aria attributes
    setAriaState(false);

    const toggleNav = (isOpen) => {
      const currentlyOpen = navMenu.classList.contains('active');
      const shouldOpen = isOpen !== undefined ? isOpen : !currentlyOpen;

      hamburgerBtn.classList.toggle('active', shouldOpen);
      navMenu.classList.toggle('active', shouldOpen);
      if (navBackdrop) {
        navBackdrop.classList.toggle('active', shouldOpen);
      }
      document.body.classList.toggle('nav-open', shouldOpen);
      setAriaState(shouldOpen);

      if (shouldOpen) {
        // Focus first actionable element inside drawer
        if (navCloseBtn) {
          navCloseBtn.focus();
        } else {
          const firstLink = navMenu.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      } else if (currentlyOpen) {
        // Restore focus to hamburger button if closing from menu
        if (navMenu.contains(document.activeElement)) {
          hamburgerBtn.focus();
        }
      }
    };

    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    if (navCloseBtn) {
      navCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNav(false);
      });
    }

    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => toggleNav(false));
    }

    // Close menu when tapping outside the panel
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
          toggleNav(false);
        }
      }
    });

    // Close menu when clicking any navigation link or CTA button inside drawer
    const allMenuLinks = navMenu.querySelectorAll('a');
    allMenuLinks.forEach(link => {
      link.addEventListener('click', () => toggleNav(false));
    });

    // Close menu on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleNav(false);
        hamburgerBtn.focus();
      }
    });

    // Handle orientation changes and window resizes cleanly
    window.addEventListener('resize', () => {
      if (!isMobileView()) {
        if (navMenu.classList.contains('active')) {
          toggleNav(false);
        }
        navMenu.removeAttribute('aria-hidden');
      } else if (!navMenu.classList.contains('active')) {
        navMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // 2. Active Link Highlight on Scroll (ScrollSpy)
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 95;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });

  // 3. Gallery Lightbox Modal
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxModal && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const fullSrc = item.getAttribute('data-full');
        const title = item.querySelector('h4') ? item.querySelector('h4').innerText : '';
        const desc = item.querySelector('p') ? item.querySelector('p').innerText : '';

        lightboxImg.src = fullSrc;
        lightboxCaption.innerHTML = `<strong>${title}</strong><br><small>${desc}</small>`;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

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
