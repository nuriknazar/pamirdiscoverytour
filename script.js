/* ============================================================
   PAMIR DISCOVERY — script.js
   ============================================================ */

// ── LANGUAGE ──────────────────────────────────────────────
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : (el.dataset.ru || el.dataset.en);
  });
  document.querySelectorAll('[data-en-html]').forEach(el => {
    el.innerHTML = lang === 'en' ? el.dataset.enHtml : (el.dataset.ruHtml || el.dataset.enHtml);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  localStorage.setItem('pamir_lang', lang);
}

// ── HEADER SCROLL ─────────────────────────────────────────
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── HAMBURGER ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const siteNav   = document.getElementById('site-nav');
const navClose  = document.getElementById('nav-close');

function closeMobileNav() {
  siteNav.classList.remove('open');
}

function toggleMobileNav() {
  siteNav.classList.toggle('open');
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileNav();
});

navClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeMobileNav();
});

siteNav.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('click', () => closeMobileNav());
});

document.addEventListener('click', (e) => {
  if (!siteNav.classList.contains('open')) return;
  if (!siteNav.contains(e.target) && !hamburger.contains(e.target)) {
    closeMobileNav();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileNav();
});

// ── HERO BG SCALE IN ──────────────────────────────────────
window.addEventListener('load', () => {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);
});

// ── SMOOTH SCROLL NAV ─────────────────────────────────────
document.querySelectorAll('a[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── MODAL ─────────────────────────────────────────────────
const modal    = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const prevBtn  = document.querySelector('.modal-prev');
const nextBtn  = document.querySelector('.modal-next');
let galleryImages = [];
let currentGalleryIndex = -1;
let mobileGalleryIndex = 0;
let mobileGallerySlides = [];
let swipeStartX = null;
let isDraggingCarousel = false;
let hotelCarouselIndex = 0;
let hotelCarouselSlides = [];
let hotelSwipeStartX = null;
let isDraggingHotelCarousel = false;

function collectGalleryImages() {
  galleryImages = Array.from(document.querySelectorAll('.gallery-item img, .hotel-item img'))
    .map(img => img.getAttribute('src'));
}

function updateModalButtons() {
  if (!prevBtn || !nextBtn) return;
  const hasMultiple = galleryImages.length > 1;
  prevBtn.disabled = !hasMultiple;
  nextBtn.disabled = !hasMultiple;
}

function showMobileGallerySlide(index) {
  if (!mobileGallerySlides.length) return;
  mobileGalleryIndex = (index + mobileGallerySlides.length) % mobileGallerySlides.length;
  const track = document.getElementById('galleryMobileTrack');
  if (!track) return;
  track.style.transform = `translateX(-${mobileGalleryIndex * 100}%)`;

  document.querySelectorAll('.gallery-mobile-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === mobileGalleryIndex);
  });
}

function buildMobileGalleryCarousel() {
  const track = document.getElementById('galleryMobileTrack');
  const dots = document.getElementById('galleryMobileDots');
  if (!track || !dots) return;

  const galleryItems = Array.from(document.querySelectorAll('#gallery .gallery-grid .gallery-item'));
  if (!galleryItems.length) return;

  track.innerHTML = '';
  dots.innerHTML = '';
  mobileGallerySlides = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (!img) return;

    const slide = document.createElement('div');
    slide.className = 'gallery-mobile-slide';
    slide.dataset.index = index;

    const slideImg = document.createElement('img');
    slideImg.src = img.getAttribute('src');
    slideImg.alt = img.getAttribute('alt') || `Gallery photo ${index + 1}`;
    slideImg.loading = 'lazy';

    slide.appendChild(slideImg);
    slide.addEventListener('click', () => openModal(img.getAttribute('src')));
    track.appendChild(slide);
    mobileGallerySlides.push(slide);

    const dot = document.createElement('button');
    dot.className = 'gallery-mobile-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${index + 1}`);
    dot.addEventListener('click', () => showMobileGallerySlide(index));
    dots.appendChild(dot);
  });

  if (mobileGallerySlides.length) {
    showMobileGallerySlide(0);
  }
}

function showHotelCarouselSlide(index) {
  if (!hotelCarouselSlides.length) return;
  hotelCarouselIndex = (index + hotelCarouselSlides.length) % hotelCarouselSlides.length;
  const track = document.getElementById('hotelMobileTrack');
  if (!track) return;
  track.style.transform = `translateX(-${hotelCarouselIndex * 100}%)`;

  document.querySelectorAll('.hotel-mobile-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === hotelCarouselIndex);
  });
}

function buildHotelCarousel() {
  const track = document.getElementById('hotelMobileTrack');
  const dots = document.getElementById('hotelMobileDots');
  if (!track || !dots) return;

  const hotelItems = Array.from(document.querySelectorAll('#hotels .hotels-grid .hotel-item'));
  if (!hotelItems.length) return;

  track.innerHTML = '';
  dots.innerHTML = '';
  hotelCarouselSlides = [];

  hotelItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (!img) return;

    const slide = document.createElement('div');
    slide.className = 'hotel-mobile-slide';
    slide.dataset.index = index;

    const slideImg = document.createElement('img');
    slideImg.src = img.getAttribute('src');
    slideImg.alt = img.getAttribute('alt') || `Guesthouse photo ${index + 1}`;
    slideImg.loading = 'lazy';

    slide.appendChild(slideImg);
    slide.addEventListener('click', () => openModal(img.getAttribute('src')));
    track.appendChild(slide);
    hotelCarouselSlides.push(slide);

    const dot = document.createElement('button');
    dot.className = 'hotel-mobile-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show guesthouse photo ${index + 1}`);
    dot.addEventListener('click', () => showHotelCarouselSlide(index));
    dots.appendChild(dot);
  });

  if (hotelCarouselSlides.length) {
    showHotelCarouselSlide(0);
  }
}

function handleMobileGallerySwipeStart(e) {
  if (!mobileGallerySlides.length) return;
  swipeStartX = e.touches[0].clientX;
  isDraggingCarousel = true;
}

function handleMobileGallerySwipeMove(e) {
  if (!isDraggingCarousel || swipeStartX === null || !mobileGallerySlides.length) return;
  const deltaX = e.touches[0].clientX - swipeStartX;
  if (Math.abs(deltaX) < 8) return;

  const track = document.getElementById('galleryMobileTrack');
  if (!track) return;
  track.style.transition = 'none';
  track.style.transform = `translateX(calc(-${mobileGalleryIndex * 100}% + ${deltaX}px))`;
}

function handleMobileGallerySwipeEnd(e) {
  if (!isDraggingCarousel || swipeStartX === null || !mobileGallerySlides.length) return;
  const deltaX = e.changedTouches[0].clientX - swipeStartX;
  const track = document.getElementById('galleryMobileTrack');
  if (!track) return;

  track.style.transition = '';
  if (deltaX < -50) {
    showMobileGallerySlide(mobileGalleryIndex + 1);
  } else if (deltaX > 50) {
    showMobileGallerySlide(mobileGalleryIndex - 1);
  } else {
    showMobileGallerySlide(mobileGalleryIndex);
  }

  swipeStartX = null;
  isDraggingCarousel = false;
}

function handleHotelCarouselSwipeStart(e) {
  if (!hotelCarouselSlides.length) return;
  hotelSwipeStartX = e.touches[0].clientX;
  isDraggingHotelCarousel = true;
}

function handleHotelCarouselSwipeMove(e) {
  if (!isDraggingHotelCarousel || hotelSwipeStartX === null || !hotelCarouselSlides.length) return;
  const deltaX = e.touches[0].clientX - hotelSwipeStartX;
  if (Math.abs(deltaX) < 8) return;

  const track = document.getElementById('hotelMobileTrack');
  if (!track) return;
  track.style.transition = 'none';
  track.style.transform = `translateX(calc(-${hotelCarouselIndex * 100}% + ${deltaX}px))`;
}

function handleHotelCarouselSwipeEnd(e) {
  if (!isDraggingHotelCarousel || hotelSwipeStartX === null || !hotelCarouselSlides.length) return;
  const deltaX = e.changedTouches[0].clientX - hotelSwipeStartX;
  const track = document.getElementById('hotelMobileTrack');
  if (!track) return;

  track.style.transition = '';
  if (deltaX < -50) {
    showHotelCarouselSlide(hotelCarouselIndex + 1);
  } else if (deltaX > 50) {
    showHotelCarouselSlide(hotelCarouselIndex - 1);
  } else {
    showHotelCarouselSlide(hotelCarouselIndex);
  }

  hotelSwipeStartX = null;
  isDraggingHotelCarousel = false;
}

function openModal(src) {
  collectGalleryImages();
  const index = galleryImages.indexOf(src);
  if (index !== -1) {
    currentGalleryIndex = index;
  } else {
    currentGalleryIndex = 0;
  }

  modalImg.src = src;
  modalImg.classList.remove('zoomed');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateModalButtons();
}

function showGalleryImage(direction) {
  if (!galleryImages.length) return;

  if (currentGalleryIndex === -1) {
    currentGalleryIndex = 0;
  }

  currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
  const nextSrc = galleryImages[currentGalleryIndex];
  modalImg.src = nextSrc;
  modalImg.classList.remove('zoomed');
  updateModalButtons();
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modalImg.classList.remove('zoomed');
  setTimeout(() => { modalImg.src = ''; }, 300);
}

modalImg.addEventListener('click', () => {
  modalImg.classList.toggle('zoomed');
});

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') showGalleryImage(1);
  if (e.key === 'ArrowLeft') showGalleryImage(-1);
});

// Expose to HTML
window.openModal  = openModal;
window.closeModal = closeModal;
window.showGalleryImage = showGalleryImage;

// ── MOBILE GALLERY CAROUSEL ───────────────────────────────
const mobileGalleryTrack = document.getElementById('galleryMobileTrack');
if (mobileGalleryTrack) {
  mobileGalleryTrack.addEventListener('touchstart', handleMobileGallerySwipeStart, { passive: true });
  mobileGalleryTrack.addEventListener('touchmove', handleMobileGallerySwipeMove, { passive: true });
  mobileGalleryTrack.addEventListener('touchend', handleMobileGallerySwipeEnd, { passive: true });
}

document.querySelectorAll('.gallery-mobile-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = Number(btn.dataset.dir || 1);
    showMobileGallerySlide(mobileGalleryIndex + dir);
  });
});

const hotelMobileTrack = document.getElementById('hotelMobileTrack');
if (hotelMobileTrack) {
  hotelMobileTrack.addEventListener('touchstart', handleHotelCarouselSwipeStart, { passive: true });
  hotelMobileTrack.addEventListener('touchmove', handleHotelCarouselSwipeMove, { passive: true });
  hotelMobileTrack.addEventListener('touchend', handleHotelCarouselSwipeEnd, { passive: true });
}

document.querySelectorAll('.hotel-mobile-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = Number(btn.dataset.dir || 1);
    showHotelCarouselSlide(hotelCarouselIndex + dir);
  });
});

// ── INIT ──────────────────────────────────────────────────
(function init() {
  const saved = localStorage.getItem('pamir_lang') || 'en';
  setLang(saved);
  buildMobileGalleryCarousel();
  buildHotelCarousel();
  // expose setLang globally for inline buttons
  window.setLang = setLang;
})();
