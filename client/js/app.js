/* ─── CONFIG ─────────────────────────────────────────────── */
const API = 'https://brio-api-0yhi.onrender.com/api/v1';

const DAYS = {
  monday:'Понедельник', tuesday:'Вторник', wednesday:'Среда',
  thursday:'Четверг',   friday:'Пятница',  saturday:'Суббота',
  sunday:'Воскресенье',
};

/* ─── SVG ICONS ──────────────────────────────────────────── */
const ICONS = {
  phone:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z"/></svg>`,
  email:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  address: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  clock:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  instagram:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1112.6 8"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
  telegram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 5L2 12.5l7 1M21 5l-5 15-7-6.5M21 5L9 13.5m0 0V19l3.2-3.2"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6A8.4 8.4 0 0112.5 3h.5a8.5 8.5 0 018 8v.5z"/></svg>`,
  zoom:     `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
};

/* ─── RIPPLE ─────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* ─── HEADER SCROLL ──────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── MOBILE NAV ─────────────────────────────────────────── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
function closeNav() { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
function toggleNav() {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
}
burger.addEventListener('click', toggleNav);
navLinks.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── ACTIVE NAV ─────────────────────────────────────────── */
const navAnchors = document.querySelectorAll('.nav__link');
const activeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav__link[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => activeObs.observe(s));

/* ─── PARALLAX HERO ──────────────────────────────────────── */
const heroBg = document.querySelector('.hero__bg');
window.addEventListener('scroll', () => {
  if (!heroBg) return;
  const y = window.scrollY;
  if (y < window.innerHeight * 1.2)
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
}, { passive: true });

/* ─── COUNT-UP ───────────────────────────────────────────── */
function animateCount(el, target, duration = 1400) {
  const start = performance.now();
  const decimal = target % 1 !== 0;
  (function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const v = ease * target;
    el.textContent = decimal ? v.toFixed(1) : Math.floor(v).toLocaleString('ru-RU');
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = decimal ? target.toFixed(1) : target.toLocaleString('ru-RU');
  })(start);
}
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animateCount(e.target, parseFloat(e.target.dataset.count));
    statsObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat__number[data-count]').forEach(el => statsObs.observe(el));

/* ─── MENU ───────────────────────────────────────────────── */
async function loadMenu() {
  const tabsEl = document.getElementById('menuTabs');
  const gridEl = document.getElementById('menuGrid');
  try {
    const res = await fetch(`${API}/menu/categories`);
    if (!res.ok) throw new Error(res.statusText);
    let { data: cats } = await res.json();

    // Убираем пиццу из меню
    cats = cats.filter(c => c.slug !== 'pizza');

    if (!cats?.length) {
      tabsEl.innerHTML = '';
      gridEl.innerHTML = '<p class="menu__empty">Меню скоро появится</p>';
      return;
    }

    tabsEl.innerHTML = cats.map((c, i) => `
      <button class="menu__tab" role="tab"
        aria-selected="${i===0}" aria-controls="menuGrid"
        data-id="${c.id}" id="tab-${c.id}">${c.nameRu}</button>
    `).join('');

    renderPriceList(cats[0], gridEl);

    tabsEl.querySelectorAll('.menu__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.menu__tab').forEach(t => t.setAttribute('aria-selected','false'));
        tab.setAttribute('aria-selected','true');
        const cat = cats.find(c => c.id === Number(tab.dataset.id));

        gridEl.style.opacity = '0';
        gridEl.style.transform = 'translateY(10px)';
        setTimeout(() => {
          renderPriceList(cat, gridEl);
          gridEl.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
          gridEl.style.opacity = '1';
          gridEl.style.transform = 'none';
        }, 160);
      });
    });
  } catch (err) {
    console.error('Menu load error:', err);
    document.getElementById('menuTabs').innerHTML = '';
    document.getElementById('menuGrid').innerHTML = '<p class="menu__empty">Не удалось загрузить меню. Попробуйте обновить страницу.</p>';
  }
}

/* Rosa-style price list */
function renderPriceList(cat, gridEl) {
  if (!cat?.menuItems?.length) {
    gridEl.innerHTML = '<p class="menu__empty">В этой категории пока нет блюд</p>';
    return;
  }

  const items = cat.menuItems.map((d, i) => `
    <li class="menu-list__item" role="listitem" style="--i:${i}">
      <div class="menu-list__info">
        <p class="menu-list__name">${d.nameRu}</p>
        <p class="menu-list__name-it">${d.nameIt}</p>
        ${d.descriptionRu ? `<p class="menu-list__desc">${d.descriptionRu}</p>` : ''}
        ${renderTags(d)}
      </div>
      <div class="menu-list__right">
        <span class="menu-list__price">${Number(d.price).toLocaleString('ru-RU')} ₽</span>
        ${d.weight ? `<span class="menu-list__weight">${d.weight} г</span>` : ''}
      </div>
    </li>
  `).join('');

  gridEl.innerHTML = `<ul class="menu-list" role="list">${items}</ul>`;

  // Stagger entrance
  gridEl.querySelectorAll('.menu-list__item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12px)';
    setTimeout(() => {
      item.style.transition = 'opacity 260ms ease-out, transform 260ms ease-out, background 150ms, padding-left 150ms';
      item.style.opacity = '1';
      item.style.transform = 'none';
    }, i * 35);
  });
}

function renderTags(d) {
  const tags = [];
  if (d.isSpecial) tags.push('<span class="tag tag--special">Спецпредложение</span>');
  (d.tags || []).forEach(t => {
    const map = {
      vegetarian:   ['tag--vegetarian','Вег'],
      vegan:        ['tag--vegan','Вег'],
      spicy:        ['tag--spicy','Острое'],
      'gluten-free':['tag--gluten-free','Без глютена'],
    };
    if (map[t]) tags.push(`<span class="tag ${map[t][0]}">${map[t][1]}</span>`);
  });
  return tags.length ? `<div class="menu-list__tags">${tags.join('')}</div>` : '';
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
      <button class="gallery__item"
        aria-label="${img.titleRu || `Фото ${i+1}`}"
        data-full="${API.replace('/api/v1','')}${img.image}">
        <img src="${API.replace('/api/v1','')}${img.thumbnail || img.image}"
          alt="${img.titleRu || `Фото кафе Brio ${i+1}`}"
          loading="lazy" width="280" height="210"/>
        <div class="gallery__item__overlay" aria-hidden="true">${ICONS.zoom}</div>
      </button>
    `).join('');

    const gallObs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('visible'), idx * 70);
        gallObs.unobserve(e.target);
      });
    }, { threshold: 0.1 });

    gridEl.querySelectorAll('.gallery__item').forEach(btn => {
      gallObs.observe(btn);
      btn.addEventListener('click', () => openLightbox(btn.dataset.full, btn.getAttribute('aria-label')));
    });
  } catch (err) { console.error('Gallery load error:', err); }
}

/* ─── LIGHTBOX ───────────────────────────────────────────── */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBack  = document.getElementById('lightboxBackdrop');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.removeAttribute('hidden');
  lightboxClose.focus();
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.setAttribute('hidden','');
  lightboxImg.src = '';
  document.body.style.overflow = '';
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

    document.getElementById('contactsList').innerHTML = `
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

    document.getElementById('mapAddress').textContent = data.addressRu || data.address;
    if (data.mapUrl) {
      document.getElementById('contactsMap').innerHTML =
        `<iframe src="${data.mapUrl}" title="Карта кафе Brio" allowfullscreen loading="lazy"></iframe>`;
    }

    // Телефон в CTA-полосе
    if (data.phone) {
      const ctaActions = document.getElementById('ctaActions');
      const phoneEl = document.createElement('a');
      phoneEl.href = `tel:${data.phone}`;
      phoneEl.className = 'cta-band__phone';
      phoneEl.textContent = data.phone;
      ctaActions.parentElement.insertBefore(phoneEl, ctaActions);
    }

    if (data.workingHours) {
      const hoursEl   = document.getElementById('workingHours');
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

    const links = [
      { url: data.instagramUrl, icon: ICONS.instagram, label: 'Instagram' },
      { url: data.telegramUrl,  icon: ICONS.telegram,  label: 'Telegram'  },
      { url: data.facebookUrl,  icon: ICONS.facebook,  label: 'Facebook'  },
      { url: data.whatsappUrl,  icon: ICONS.whatsapp,  label: 'WhatsApp'  },
    ].filter(l => l.url);
    if (links.length) {
      document.getElementById('socials').innerHTML = links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="social-link">
          ${l.icon} ${l.label}</a>`
      ).join('');
    }
  } catch (err) { console.error('Contacts load error:', err); }
}

/* ─── SR-ONLY ────────────────────────────────────────────── */
const style = document.createElement('style');
style.textContent = '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
document.head.appendChild(style);

/* ─── INIT ───────────────────────────────────────────────── */
loadMenu();
loadGallery();
loadContacts();
