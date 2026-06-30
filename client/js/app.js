/* ─── ДОСТУПНОСТЬ: prefers-reduced-motion ──────────────────
   Emil/review-animations: уважаем настройку — гасим движение,
   но контент сразу показываем (не «ноль», а мягче). */
var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ─── HERO REVEAL via rAF ───────────────────────────────────── */
var _heroItems = [
  { sel: '.hero__welcome', dy: 24, delay: 0   },
  { sel: '.hero__logo',    dy: 0,  delay: 200 },
  { sel: '.hero__tagline', dy: 24, delay: 400 },
  { sel: '.hero__actions', dy: 24, delay: 650 },
];
_heroItems.forEach(function(it) {
  var el = document.querySelector(it.sel);
  if (el) { el.style.opacity = '0'; el.style.transform = it.dy ? 'translateY('+it.dy+'px)' : ''; el._heroHidden = true; }
});
function _revealHero() {
  if (REDUCE) {
    _heroItems.forEach(function(it) {
      var el = document.querySelector(it.sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; el._heroHidden = false; }
    });
    return;
  }
  _heroItems.forEach(function(it) {
    var el = document.querySelector(it.sel);
    if (!el || !el._heroHidden) return;
    el._heroHidden = false;
    (function(el, dy, delay) {
      setTimeout(function() {
        var start = null;
        function frame(ts) {
          if (!start) start = ts;
          var t = Math.min((ts - start) / 900, 1);
          var p = 1 - Math.pow(1 - t, 3);
          el.style.opacity = String(p);
          el.style.transform = dy ? 'translateY(' + (dy * (1 - p)) + 'px)' : 'none';
          if (dy) el.style.filter = p < 1 ? 'blur(' + (5 * (1 - p)).toFixed(2) + 'px)' : 'none';
          if (t < 1) { requestAnimationFrame(frame); }
          else { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; }
        }
        requestAnimationFrame(frame);
      }, delay);
    })(el, it.dy, it.delay);
  });
}
setTimeout(function() {
  _heroItems.forEach(function(it) {
    var el = document.querySelector(it.sel);
    if (el && el._heroHidden) { el.style.opacity = '1'; el.style.transform = 'none'; el._heroHidden = false; }
  });
}, 6000);

/* ─── SPLASH INTRO ───────────────────────────────────────── */
(function () {
  var splash = document.getElementById('splash');
  if (!splash) { _revealHero(); return; }

  var panelTop = document.getElementById('splashTop');
  var panelBtm = document.getElementById('splashBtm');

  var sb = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (sb > 0) document.body.style.paddingRight = sb + 'px';

  var dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;

    if (REDUCE) {
      splash.classList.add('done');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      _revealHero();
      return;
    }

    var body = splash.querySelector('.splash__body');
    if (body) { body.style.transition = 'opacity 300ms ease'; body.style.opacity = '0'; }

    var duration = 1100;
    var start = null;
    function easeInOut(t) {
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    }
    function animatePanels(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var e = easeInOut(t);
      if (panelTop) panelTop.style.transform = 'translateY(' + (-101 * e) + '%)';
      if (panelBtm) panelBtm.style.transform = 'translateY(' + (101 * e) + '%)';
      if (t < 1) {
        requestAnimationFrame(animatePanels);
      } else {
        splash.classList.add('done');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        _revealHero();
      }
    }
    requestAnimationFrame(animatePanels);
  }

  var autoTimer = setTimeout(dismiss, 2800);
  splash.addEventListener('click', function () {
    clearTimeout(autoTimer);
    dismiss();
  }, { once: true });
})();

/* ─── CONFIG ─────────────────────────────────────────────── */
const API = 'https://brio-api-0yhi.onrender.com/api/v1';

/* ─── FETCH С ПОВТОРАМИ ──────────────────────────────────── */
/* Render.com free tier засыпает — первый запрос может ждать до 60с.
   Делаем до 4 попыток с паузами, показываем прогресс пользователю. */
async function apiFetch(url, opts = {}) {
  const TIMEOUTS = [15000, 20000, 25000, 30000]; // таймаут растёт с каждой попыткой
  const DELAYS   = [0, 5000, 8000, 12000];        // пауза перед попыткой

  for (let attempt = 0; attempt < TIMEOUTS.length; attempt++) {
    if (DELAYS[attempt]) await new Promise(r => setTimeout(r, DELAYS[attempt]));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUTS[attempt]);

    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const isLast = attempt === TIMEOUTS.length - 1;
      if (isLast) throw err;
      // Не последняя попытка — продолжаем
      console.warn(`API attempt ${attempt + 1} failed, retrying…`, err.message);
    }
  }
}

/* Красивый placeholder «сервер просыпается» */
function wakingPlaceholder(containerEl, message = 'Загружаем данные…') {
  containerEl.innerHTML = `
    <div class="api-waking">
      <div class="api-waking__dots">
        <span class="api-waking__dot"></span>
        <span class="api-waking__dot"></span>
        <span class="api-waking__dot"></span>
      </div>
      <p class="api-waking__text">${message}</p>
    </div>`;
}

/* Кнопка «повторить» при окончательной ошибке */
function errorPlaceholder(containerEl, retryFn, message = 'Не удалось загрузить данные') {
  containerEl.innerHTML = `
    <div class="api-error">
      <p class="api-error__text">${message}</p>
      <button class="btn btn--teal api-error__btn" style="min-height:40px;padding:0 20px;font-size:.8rem">
        Попробовать снова
      </button>
    </div>`;
  containerEl.querySelector('.api-error__btn')
    .addEventListener('click', () => retryFn(), { once: true });
}

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

/* ─── SCROLL PROGRESS BAR ────────────────────────────────── */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

/* ─── HEADER SCROLL ──────────────────────────────────────── */
const header = document.getElementById('header');
let _lastScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 60);
  // Прячем хедер при движении вниз, показываем при движении вверх
  const navOpen = navLinks && navLinks.classList.contains('open');
  if (!navOpen && y > 160 && y > _lastScrollY + 4) {
    header.classList.add('header--hidden');
  } else if (y < _lastScrollY - 4 || y < 160) {
    header.classList.remove('header--hidden');
  }
  _lastScrollY = y;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = maxScroll > 0 ? `${(y / maxScroll) * 100}%` : '0';
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
const navClose = document.getElementById('navClose');
if (navClose) navClose.addEventListener('click', closeNav);
navLinks.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

/* ─── JS ANIMATIONS (bypass prefers-reduced-motion) ─────────────────── */
function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }

function revealAnimate(el, dx, dy, duration, delay) {
  if (REDUCE) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; el.classList.add('visible'); return; }
  el.style.transition = 'none';
  el.style.opacity = '0';
  el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  el.style.filter = 'blur(6px)';
  setTimeout(function () {
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var p = easeOut3(t);
      el.style.opacity = String(p);
      el.style.transform = 'translate(' + dx*(1-p) + 'px,' + dy*(1-p) + 'px)';
      el.style.filter = p < 1 ? 'blur(' + (6 * (1 - p)).toFixed(2) + 'px)' : 'none';
      if (t < 1) { requestAnimationFrame(frame); }
      else { el.style.cssText = ''; el.classList.add('visible'); }
    }
    requestAnimationFrame(frame);
  }, delay || 0);
}

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    revealObs.unobserve(el);
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--i') || 0) * 100;
    const dx = el.classList.contains('reveal--left') ? -32 : el.classList.contains('reveal--right') ? 32 : 0;
    const dy = (!dx) ? 32 : 0;
    revealAnimate(el, dx, dy, 650, delay);
  });
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
if (!REDUCE) {
  window.addEventListener('scroll', () => {
    if (!heroBg) return;
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2)
      heroBg.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
}


/* ─── MENU ───────────────────────────────────────────────── */
const MENU_DATA = [
  { id:1, nameRu:'Паста', nameIt:'La Pasta', menuItems:[
    { nameRu:'Болоньезе',     nameIt:'', price:700 },
    { nameRu:'Дженовезе',     nameIt:'', price:750 },
    { nameRu:'Карбонара',     nameIt:'', price:700 },
    { nameRu:'Алла Норма',    nameIt:'', price:750 },
    { nameRu:'Качо э пэпэ',  nameIt:'', price:850 },
    { nameRu:'Полпетте',      nameIt:'', price:700 },
    { nameRu:'Гамбери',       nameIt:'', price:900 },
  ]},
  { id:2, nameRu:'Панини', nameIt:'I Panini', menuItems:[
    { nameRu:'Капрезе',    nameIt:'', price:700 },
    { nameRu:'Дженовезе',  nameIt:'', price:800 },
    { nameRu:'Полпетте',   nameIt:'', price:800 },
    { nameRu:'Салями',     nameIt:'', price:800 },
    { nameRu:'Мортаделла', nameIt:'', price:850 },
  ]},
  { id:3, nameRu:'Салаты', nameIt:'Le Insalate', menuItems:[
    { nameRu:'Капрезе',              nameIt:'', price:600 },
    { nameRu:'Греческий',            nameIt:'', price:650 },
    { nameRu:'Страчателла',          nameIt:'', price:650 },
    { nameRu:'Персики с прошутто',   nameIt:'', price:850 },
  ]},
  { id:4, nameRu:'Закуски', nameIt:'Gli Antipasti', menuItems:[
    { nameRu:'Брускетта с рикоттой и томатами',        nameIt:'', price:400 },
    { nameRu:'Брускетта с лососем',                    nameIt:'', price:650 },
    { nameRu:'Брускетта с песто и вялеными томатами',  nameIt:'', price:500 },
  ]},
  { id:5, nameRu:'Десерты', nameIt:'I Dolci', menuItems:[
    { nameRu:'Сорбет лайм-лимон', nameIt:'', descriptionRu:'за шарик', price:250 },
  ]},
  { id:6, nameRu:'Напитки', nameIt:'Le Bevande', menuItems:[
    { nameRu:'Кофе лунго',            nameIt:'', descriptionRu:'150 мл', price:300 },
    { nameRu:'Лимонад классический',  nameIt:'', descriptionRu:'300 мл', price:300 },
    { nameRu:'Апельсиновый сквиз',    nameIt:'', descriptionRu:'300 мл', price:400 },
    { nameRu:'Грейпфрутовый сквиз',   nameIt:'', descriptionRu:'300 мл', price:400 },
    { nameRu:'Сан Пеллегрино',        nameIt:'', descriptionRu:'300 мл', price:400 },
    { nameRu:'Сидр полусухой',        nameIt:'', descriptionRu:'300 мл', price:400 },
  ]},
];

function loadMenu() {
  const tabsEl = document.getElementById('menuTabs');
  const gridEl = document.getElementById('menuGrid');
  const cats = MENU_DATA;

  tabsEl.innerHTML = cats.map((c, i) => `
    <button class="menu__tab" role="tab"
      aria-selected="${i===0}" aria-controls="menuGrid"
      data-id="${c.id}">${c.nameRu}</button>
  `).join('');

  renderPriceList(cats[0], gridEl);

  tabsEl.querySelectorAll('.menu__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.getAttribute('aria-selected') === 'true') return;
      tabsEl.querySelectorAll('.menu__tab').forEach(t => t.setAttribute('aria-selected','false'));
      tab.setAttribute('aria-selected','true');
      const cat = cats.find(c => c.id === Number(tab.dataset.id));
      if (REDUCE) { renderPriceList(cat, gridEl); return; }
      // Уводим текущий список (fade + blur), затем впускаем новый со stagger
      gridEl.style.transition = 'opacity 170ms ease, transform 170ms ease, filter 170ms ease';
      gridEl.style.opacity = '0';
      gridEl.style.transform = 'translateY(8px)';
      gridEl.style.filter = 'blur(3px)';
      setTimeout(() => {
        gridEl.style.transition = 'none';
        gridEl.style.opacity = '1';
        gridEl.style.transform = 'none';
        gridEl.style.filter = 'none';
        renderPriceList(cat, gridEl);
      }, 180);
    });
  });
}

/* Rosa-style price list */
function renderPriceList(cat, gridEl) {
  if (!cat || !cat.menuItems || !cat.menuItems.length) {
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

  // Stagger entrance — пружинный ease-out + лёгкий blur (Emil-grade)
  if (REDUCE) return; // блюда уже видимы по умолчанию
  gridEl.querySelectorAll('.menu-list__item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(16px)';
    item.style.filter = 'blur(4px)';
    setTimeout(() => {
      item.style.transition = 'opacity 420ms cubic-bezier(.23,1,.32,1), transform 420ms cubic-bezier(.23,1,.32,1), filter 420ms ease, background 180ms, color 180ms';
      item.style.opacity = '1';
      item.style.transform = 'none';
      item.style.filter = 'none';
    }, i * 45);
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
    const res = await apiFetch(`${API}/gallery`);
    const { data: images } = await res.json();
    if (!images || !images.length) return;

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
function loadContacts() {
  document.getElementById('contactsList').innerHTML = `
    <div class="contact-item">
      <div class="contact-item__icon">${ICONS.phone}</div>
      <div>
        <p class="contact-item__label">Телефон</p>
        <p class="contact-item__value"><a href="tel:+74951234567">+7 (495) 123-45-67</a></p>
      </div>
    </div>
    <div class="contact-item">
      <div class="contact-item__icon">${ICONS.email}</div>
      <div>
        <p class="contact-item__label">Email</p>
        <p class="contact-item__value"><a href="mailto:brio.msk@gmail.com">brio.msk@gmail.com</a></p>
      </div>
    </div>
    <div class="contact-item">
      <div class="contact-item__icon">${ICONS.address}</div>
      <div>
        <p class="contact-item__label">Адрес</p>
        <p class="contact-item__value">ул. Маросейка, 15, Москва</p>
      </div>
    </div>
  `;

  const hoursEl   = document.getElementById('workingHours');
  const hoursGrid = document.getElementById('hoursGrid');
  const hours = {
    monday:    { closed: true },
    tuesday:   { open:'12:00', close:'22:00' },
    wednesday: { open:'12:00', close:'22:00' },
    thursday:  { open:'12:00', close:'22:00' },
    friday:    { open:'12:00', close:'00:00' },
    saturday:  { open:'12:00', close:'00:00' },
    sunday:    { open:'12:00', close:'22:00' },
  };
  hoursGrid.innerHTML = Object.entries(hours).map(([day, h]) => `
    <div class="hours__row">
      <dt class="hours__day">${DAYS[day] || day}</dt>
      <dd class="hours__time ${h.closed ? 'hours__time--closed' : ''}">${h.closed ? 'Выходной' : `${h.open} – ${h.close}`}</dd>
    </div>
  `).join('');
  hoursEl.querySelector('.hours__title').innerHTML = `${ICONS.clock} Часы работы`;
  hoursEl.removeAttribute('hidden');
}

/* ─── SR-ONLY ────────────────────────────────────────────── */
const style = document.createElement('style');
style.textContent = '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
document.head.appendChild(style);

/* ─── MARQUEE JS SCROLL ──────────────────────────────────── */
(function () {
  var track = document.querySelector('.marquee__track');
  if (!track) return;
  track.style.animation = 'none';
  if (REDUCE) return; /* статичная лента при reduced-motion */
  var pos = 0;          // current position in %
  var speed = 0.0018;   // % per ms (same as 28s CSS animation)
  var last = null;
  function tick(ts) {
    if (last === null) last = ts;
    var dt = Math.min(ts - last, 50); // cap to avoid jump after tab switch
    last = ts;
    pos -= speed * dt;
    if (pos <= -50) pos += 50;
    track.style.transform = 'translateX(' + pos + '%)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ─── INIT ───────────────────────────────────────────────── */
loadMenu();
loadGallery();
loadContacts();

/* ─── ABOUT STATS COUNTER ────────────────────────────── */
function animateCount(el) {
  var target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  if (REDUCE) { el.textContent = target; return; }
  var duration = 1400;
  var start = null;
  function tick(ts) {
    if (!start) start = ts;
    var t = Math.min((ts - start) / duration, 1);
    var p = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * p);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}
var countObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    animateCount(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.about__stat-num[data-target]').forEach(function(el) {
  el.textContent = '0';
  countObs.observe(el);
});

/* ─── MOUSE PARALLAX FOR HERO ORBS ──────────────────── */
(function() {
  if (REDUCE) return; /* без параллакса от мыши при reduced-motion */
  var orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;
  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function(e) {
    if (window.scrollY > window.innerHeight * 0.8) return;
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  var factors = [12, 18, 8, 6];
  function orbFrame() {
    cx += (mx - cx) * 0.04;
    cy += (my - cy) * 0.04;
    orbs.forEach(function(orb, i) {
      var f = factors[i] || 10;
      orb.style.setProperty('--orb-px', (cx * f).toFixed(2) + 'px');
      orb.style.setProperty('--orb-py', (cy * f).toFixed(2) + 'px');
    });
    requestAnimationFrame(orbFrame);
  }
  requestAnimationFrame(orbFrame);
})();

/* ─── NAV BRAND ──────────────────────────────────────── */
(function() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var brand = document.createElement('span');
  brand.className = 'nav__brand';
  brand.textContent = 'Brio';
  brand.setAttribute('aria-hidden', 'true');
  var burger = document.getElementById('burger');
  if (burger) nav.insertBefore(brand, burger);
})();

/* ─── HERO SCROLL INDICATOR FADE ON SCROLL ──────────── */
(function() {
  var indicator = document.querySelector('.hero__scroll-indicator');
  if (!indicator) return;
  window.addEventListener('scroll', function() {
    var p = Math.min(window.scrollY / 120, 1);
    indicator.style.opacity = String(1 - p);
  }, { passive: true });
})();

/* ─── МАГНИТНЫЕ CTA-КНОПКИ ───────────────────────────
   Главные кнопки слегка тянутся к курсору (пружинное сглаживание).
   Только мышь + уважение к reduced-motion. */
(function() {
  if (REDUCE) return;
  if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  document.querySelectorAll('.btn--icon').forEach(function(btn) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      btn.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        cx = tx; cy = ty;
        btn.style.transform = (tx || ty) ? 'translate(' + tx + 'px,' + ty + 'px)' : '';
        raf = null;
      }
    }
    btn.addEventListener('pointermove', function(e) {
      var r = btn.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.40;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    btn.addEventListener('pointerleave', function() {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
})();
