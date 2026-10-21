'use strict';

// Jokismartt: static interactions. No external database or API requests.
const CONTACT = '6282285150571';
const nav = document.getElementById('navigation');
const menuToggle = document.getElementById('menuToggle');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('.work-card')];
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxDirect = document.getElementById('lightboxDirect');
let previousFocus = null;

function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu');
}
menuToggle.addEventListener('click', () => {
  const willOpen = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Tutup menu' : 'Buka menu');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// Filter only changes the visible cards, without changing the original image assets.
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filterButtons.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    workCards.forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) count += 1;
    });
    document.getElementById('filterStatus').textContent = `${count} pekerjaan ditampilkan.`;
  });
});

// Accessible image viewer. Assets are local and already privacy-redacted.
function openLightbox(trigger) {
  previousFocus = document.activeElement;
  lightboxImage.src = trigger.dataset.img;
  lightboxTitle.textContent = trigger.dataset.title || 'Dokumentasi Jokismartt';
  lightboxCategory.textContent = trigger.dataset.categoryLabel || 'DOKUMENTASI';
  lightboxDirect.href = trigger.dataset.img;
  lightboxImage.alt = trigger.querySelector('img')?.alt || 'Dokumentasi Jokismartt';
  if (typeof lightbox.showModal === 'function') lightbox.showModal();
}
document.querySelectorAll('[data-img]').forEach(el => el.addEventListener('click', () => openLightbox(el)));
lightboxClose.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => previousFocus?.focus?.());

// Composer: content goes only to the visitor's WhatsApp client.
// Nothing is persisted or submitted to a website backend.
const orderForm = document.getElementById('orderForm');
const deadlineInput = document.getElementById('orderDeadline');
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
deadlineInput.min = localDate;
orderForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;
  const name = document.getElementById('orderName').value.trim();
  const service = document.getElementById('orderService').value;
  const details = document.getElementById('orderDetails').value.trim();
  const deadline = deadlineInput.value;
  if (!name || !service || details.length < 15) return;
  const lines = [
    'Halo Jokismartt, saya ingin konsultasi.',
    '',
    `Nama: ${name}`,
    `Layanan: ${service}`,
    `Tenggat: ${deadline ? deadline.split('-').reverse().join('/') : 'Belum ditentukan'}`,
    '',
    'Ringkasan kebutuhan:',
    details,
    '',
    'Mohon info ketersediaan dan estimasi biayanya. Terima kasih.'
  ];
  const url = `https://wa.me/${CONTACT}?text=${encodeURIComponent(lines.join('\n'))}`;
  // Same-tab navigation avoids browsers blocking the consultation link.
  window.location.assign(url);
});

document.getElementById('currentYear').textContent = String(new Date().getFullYear());
