/* ─── CONFIG ─────────────────────────────────────────────── */
const API = 'https://brio-api-0yhi.onrender.com/api/v1';

const DAYS = {
  monday:    'Понедельник', tuesday:   'Вторник',
  wednesday: 'Среда',       thursday:  'Четверг',
  friday:    'Пятница',     saturday:  'Суббота',
  sunday:    'Воскресенье',
};

/* ─── SVG ICONS (no emoji) ───────────────────────────────── */
const ICONS = {
  phone:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z"/></svg>`,
  email:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  address:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  clock:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  instagram:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1112.6 8"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
  telegram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 5L2 12.5l7 1M21 5l-5 15-7-6.5M21 5L9 13.5m0 0V19l3.2-3.2"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6A8.4 8.4 0 0112.5 3h.5a8.5 8.5 0 018 8v.5z"/></svg>`,
  zoom:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  food:     `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity=".4" aria-hidden="true"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`,
};

/* ─── HEADER SCROLL ──────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ─── MOBILE NAV ─────────────────────────────────────────── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

function closeNav() {
  navLinks.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}
function toggleNav() {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
}

burger.addEventListener('click', toggleNav);
navLinks.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

/* ─── REVEAL ON SCROLL ───────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1 });

document.querySelectorAll('.about__text, .features, .contacts__info, .contacts__map').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ─── MENU ───────────────────────────────────────────────── */
async function loadMenu() {
  const tabsEl = document.getElementById('menuTabs');
  const gridEl = document.getElementById('menuGrid');

  try {
    const res = await fetch(`${API}/menu/categories`);
    if (!res.ok) throw new Error(res.statusText);
    const { data: categories } = await res.json();

    if (!categories?.length) {
      tabsEl.innerHTML = '';
      gridEl.innerHTML = '<p class="menu__empty">Меню скоро появится</p>';
      return;
    }

    // Render tabs
    tabsEl.innerHTML = categories.map((cat, i) => `
      <button
        class="menu__tab"
        role="tab"
        aria-selected="${i === 0}"
        aria-controls="menuGrid"
        data-id="${cat.id}"
        id="tab-${cat.id}">
        ${cat.nameRu}
      </button>
    `).join('');

    // Show first category
    renderDishes(categories[0], gridEl);

    // Tab click
    tabsEl.querySelectorAll('.menu__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.menu__tab').forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');
        const cat = categories.find(c => c.id === Number(tab.dataset.id));
        renderDishes(cat, gridEl);
      });
    });

  } catch (err) {
    console.error('Menu load error:', err);
    tabsEl.innerHTML = '';
    gridEl.innerHTML = '<p class="menu__empty">Не удалось загрузить меню. Попробуйте обновить страницу.</p>';
  }
}

function renderDishes(cat, gridEl) {
  if (!cat?.menuItems?.length) {
    gridEl.innerHTML = '<p class="menu__empty">В этой категории пока нет блюд</p>';
    return;
  }

  gridEl.innerHTML = cat.menuItems.map((d, i) => `
    <article class="dish-card" role="listitem"
      style="animation-delay:${i * 40}ms">
      <div class="dish-card__img">
        ${d.image
          ? `<img src="${API.replace('/api/v1','')}${d.image}" alt="${d.nameRu}" loading="lazy" width="280" height="200"/>`
          : `<div class="dish-card__img-icon">${ICONS.food}</div>`
        }
      </div>
      <div class="dish-card__body">
        <h3 class="dish-card__name">${d.nameRu}</h3>
        <p class="dish-card__name-it">${d.nameIt}</p>
        ${d.descriptionRu ? `<p class="dish-card__desc">${d.descriptionRu}</p>` : ''}
        <div class="dish-card__footer">
          <span class="dish-card__price">
            <span class="sr-only">Цена:</span>
            ${Number(d.price).toLocaleString('ru-RU')} ₽
          </span>
          ${d.weight ? `<span class="dish-card__weight" aria-label="${d.weight} грамм">${d.weight} г</span>` : ''}
        </div>
        ${renderTags(d)}
      </div>
    </article>
  `).join('');

  // Stagger entrance
  gridEl.querySelectorAll('.dish-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.transition = 'opacity 220ms ease-out, transform 220ms ease-out';
        card.style.opacity = '1';
        card.style.transform = 'none';
      }, i * 40);
    });
  });
}

function renderTags(d) {
  const tags = [];
  if (d.isSpecial) tags.push('<span class="tag tag--special">Спецпредложение</span>');
  (d.tags || []).forEach(t => {
    const map = { vegetarian: ['tag--vegetarian','Вегетарианское'], vegan: ['tag--vegan','Веганское'],
                  spicy: ['tag--spicy','Острое'], 'gluten-free': ['tag--gluten-free','Без глютена'] };
    if (map[t]) tags.push(`<span class="tag ${map[t][0]}">${map[t][1]}</span>`);
  });
  return tags.length ? `<div class="dish-card__tags" aria-label="Теги">${tags.join('')}</div>` : '';
}

/* ─── GALLERY ────────────────────────────────────────────── */
async function loadGallery() {
  try {
    const res = await fetch(`${API}/gallery`);
    if (!res.ok) throw new Error(res.statusText);
    const { data: images } = await res.json();
    if (!images?.length) return;

    const gridEl = document.getElementById('galleryGrid');
    gridEl.innerHTML = images.map((img, i) => `
      <button
        class="gallery__item"
        aria-label="${img.titleRu || `Фото ${i + 1}`}"
        data-full="${API.replace('/api/v1','')}${img.image}">
        <img
          src="${API.replace('/api/v1','')}${img.thumbnail || img.image}"
          alt="${img.titleRu || `Фото кафе Brio ${i + 1}`}"
          loading="lazy"
          width="280" height="210"/>
        <div class="gallery__item__overlay" aria-hidden="true">
          ${ICONS.zoom}
        </div>
      </button>
    `).join('');

    // Open lightbox
    gridEl.querySelectorAll('.gallery__item').forEach(btn => {
      btn.addEventListener('click', () => openLightbox(btn.dataset.full, btn.getAttribute('aria-label')));
    });
  } catch (err) {
    console.error('Gallery load error:', err);
  }
}

/* ─── LIGHTBOX ───────────────────────────────────────────── */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose= document.getElementById('lightboxClose');
const lightboxBack = document.getElementById('lightboxBackdrop');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.removeAttribute('hidden');
  lightboxClose.focus();
}
function closeLightbox() {
  lightbox.setAttribute('hidden', '');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBack.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

/* ─── CONTACTS ───────────────────────────────────────────── */
async function loadContacts() {
  try {
    const res = await fetch(`${API}/contacts`);
    if (!res.ok) throw new Error(res.statusText);
    const { data } = await res.json();
    if (!data) return;

    // Address list
    const listEl = document.getElementById('contactsList');
    listEl.innerHTML = `
      <div class="contact-item">
        <div class="contact-item__icon">${ICONS.phone}</div>
        <div>
          <p class="contact-item__label">Телефон</p>
          <p class="contact-item__value">
            <a href="tel:${data.phone}">${data.phone}</a>
            ${data.phoneExtra ? `<br/><a href="tel:${data.phoneExtra}">${data.phoneExtra}</a>` : ''}
          </p>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item__icon">${ICONS.email}</div>
        <div>
          <p class="contact-item__label">Email</p>
          <p class="contact-item__value"><a href="mailto:${data.email}">${data.email}</a></p>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item__icon">${ICONS.address}</div>
        <div>
          <p class="contact-item__label">Адрес</p>
          <p class="contact-item__value">${data.addressRu || data.address}</p>
        </div>
      </div>
    `;

    // Map
    document.getElementById('mapAddress').textContent = data.addressRu || data.address;
    if (data.mapUrl) {
      document.getElementById('contactsMap').innerHTML =
        `<iframe src="${data.mapUrl}" title="Карта расположения кафе Brio" allowfullscreen loading="lazy"></iframe>`;
    }

    // Working hours
    if (data.workingHours) {
      const hoursEl = document.getElementById('workingHours');
      const hoursGrid = document.getElementById('hoursGrid');
      hoursGrid.innerHTML = Object.entries(data.workingHours).map(([day, h]) => `
        <div class="hours__row">
          <dt class="hours__day">${DAYS[day] || day}</dt>
          <dd class="hours__time ${h.closed ? 'hours__time--closed' : ''}">
            ${h.closed ? 'Выходной' : `${h.open} – ${h.close}`}
          </dd>
        </div>
      `).join('');
      hoursEl.querySelector('.hours__title').innerHTML = `${ICONS.clock} Часы работы`;
      hoursEl.removeAttribute('hidden');
    }

    // Social links
    const socialsEl = document.getElementById('socials');
    const links = [
      { url: data.instagramUrl, icon: ICONS.instagram, label: 'Instagram' },
      { url: data.telegramUrl,  icon: ICONS.telegram,  label: 'Telegram'  },
      { url: data.facebookUrl,  icon: ICONS.facebook,  label: 'Facebook'  },
      { url: data.whatsappUrl,  icon: ICONS.whatsapp,  label: 'WhatsApp'  },
    ].filter(l => l.url);

    if (links.length) {
      socialsEl.innerHTML = links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="social-link">
          ${l.icon} ${l.label}
        </a>`
      ).join('');
    }

  } catch (err) {
    console.error('Contacts load error:', err);
  }
}

/* ─── INIT ───────────────────────────────────────────────── */
// Screen-reader only utility class
const style = document.createElement('style');
style.textContent = '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
document.head.appendChild(style);

loadMenu();
loadGallery();
loadContacts();
