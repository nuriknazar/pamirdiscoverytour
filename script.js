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
hamburger.addEventListener('click', () => {
  siteNav.classList.toggle('open');
});
siteNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => siteNav.classList.remove('open'));
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

function openModal(src) {
  modalImg.src = src;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { modalImg.src = ''; }, 300);
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Expose to HTML
window.openModal  = openModal;
window.closeModal = closeModal;

// ── INIT ──────────────────────────────────────────────────
(function init() {
  const saved = localStorage.getItem('pamir_lang') || 'en';
  setLang(saved);
  // expose setLang globally for inline buttons
  window.setLang = setLang;
})();
