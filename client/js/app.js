const API = 'https://brio-api-0yhi.onrender.com/api/v1';

const DAYS = {
  monday:    'Понедельник',
  tuesday:   'Вторник',
  wednesday: 'Среда',
  thursday:  'Четверг',
  friday:    'Пятница',
  saturday:  'Суббота',
  sunday:    'Воскресенье',
};

const EMOJI = {
  antipasti: '🥗', primi: '🍜', secondi: '🍖',
  pasta: '🍝', pizza: '🍕', dolci: '🍮',
  bevande: '🥂', caffe: '☕',
};

// ─── Навигация ────────────────────────────────────────────────────
const header = document.getElementById('header');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── Анимация появления ───────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.about, .feature, .contacts__info, .contacts__map').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ─── МЕНЮ ────────────────────────────────────────────────────────
async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu/categories`);
    const { data: categories } = await res.json();

    const tabsEl = document.getElementById('menuTabs');
    const gridEl = document.getElementById('menuGrid');

    if (!categories?.length) {
      tabsEl.innerHTML = '<p style="color:var(--text-light);font-style:italic">Меню скоро появится</p>';
      return;
    }

    // Вкладки
    tabsEl.innerHTML = categories.map((cat, i) =>
      `<button class="menu__tab${i === 0 ? ' active' : ''}" data-id="${cat.id}">
        ${EMOJI[cat.slug] || '🍽'} ${cat.nameRu}
      </button>`
    ).join('');

    // Показать блюда выбранной категории
    function showCategory(catId) {
      const cat = categories.find(c => c.id === catId);
      if (!cat?.menuItems?.length) {
        gridEl.innerHTML = '<p class="menu__empty">Блюда этой категории появятся скоро</p>';
        return;
      }
      gridEl.innerHTML = cat.menuItems.map(dish => `
        <article class="dish-card">
          <div class="dish-card__img">
            ${dish.image
              ? `<img src="https://brio-api-0yhi.onrender.com${dish.image}" alt="${dish.nameRu}" loading="lazy" />`
              : EMOJI[cat.slug] || '🍽'}
          </div>
          <div class="dish-card__body">
            <h3 class="dish-card__name">${dish.nameRu}</h3>
            <p class="dish-card__name-it">${dish.nameIt}</p>
            ${dish.descriptionRu ? `<p class="dish-card__desc">${dish.descriptionRu}</p>` : ''}
            <div class="dish-card__footer">
              <span class="dish-card__price">${Number(dish.price).toLocaleString('ru')} ₽</span>
              ${dish.weight ? `<span class="dish-card__weight">${dish.weight} г</span>` : ''}
            </div>
            ${renderTags(dish)}
          </div>
        </article>
      `).join('');

      // Анимация карточек
      gridEl.querySelectorAll('.dish-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'opacity .4s ease, transform .4s ease';
          card.style.opacity = '1';
          card.style.transform = 'none';
        }, i * 60);
      });
    }

    // Первая категория
    showCategory(categories[0].id);

    // Клик по вкладкам
    tabsEl.querySelectorAll('.menu__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.menu__tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showCategory(Number(tab.dataset.id));
      });
    });

  } catch (err) {
    console.error('Ошибка загрузки меню:', err);
    document.getElementById('menuTabs').innerHTML =
      '<p style="color:var(--text-light);font-style:italic">Не удалось загрузить меню</p>';
  }
}

function renderTags(dish) {
  const tags = [];
  if (dish.isSpecial) tags.push('<span class="tag tag--special">⭐ Спецпредложение</span>');
  (dish.tags || []).forEach(t => {
    if (t === 'vegetarian') tags.push('<span class="tag tag--vegetarian">🌿 Вегетарианское</span>');
    if (t === 'vegan') tags.push('<span class="tag tag--vegan">🌱 Веганское</span>');
    if (t === 'spicy') tags.push('<span class="tag tag--spicy">🌶 Острое</span>');
    if (t === 'gluten-free') tags.push('<span class="tag tag--gluten-free">🌾 Без глютена</span>');
  });
  return tags.length ? `<div class="dish-card__tags">${tags.join('')}</div>` : '';
}

// ─── ГАЛЕРЕЯ ─────────────────────────────────────────────────────
async function loadGallery() {
  try {
    const res = await fetch(`${API}/gallery`);
    const { data: images } = await res.json();
    const gridEl = document.getElementById('galleryGrid');

    if (!images?.length) return; // оставить заглушку

    gridEl.innerHTML = images.map(img => `
      <div class="gallery__item" data-src="https://brio-api-0yhi.onrender.com${img.image}">
        <img src="https://brio-api-0yhi.onrender.com${img.thumbnail || img.image}"
             alt="${img.titleRu || 'Фото кафе Brio'}" loading="lazy" />
        <div class="gallery__item__overlay">🔍</div>
      </div>
    `).join('');

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    gridEl.querySelectorAll('.gallery__item').forEach(item => {
      item.addEventListener('click', () => {
        lightboxImg.src = item.dataset.src;
        lightbox.classList.add('open');
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки галереи:', err);
  }
}

// Lightbox закрытие
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxImg').src = '';
}

// ─── КОНТАКТЫ ─────────────────────────────────────────────────────
async function loadContacts() {
  try {
    const res = await fetch(`${API}/contacts`);
    const { data } = await res.json();
    if (!data) return;

    // Телефон
    const phoneEl = document.querySelector('#contactPhone .contact-item__value');
    phoneEl.innerHTML = `<a href="tel:${data.phone}">${data.phone}</a>`;
    if (data.phoneExtra) phoneEl.innerHTML += `<br/><a href="tel:${data.phoneExtra}">${data.phoneExtra}</a>`;

    // Email
    document.querySelector('#contactEmail .contact-item__value').innerHTML =
      `<a href="mailto:${data.email}">${data.email}</a>`;

    // Адрес
    document.querySelector('#contactAddress .contact-item__value').textContent =
      data.addressRu || data.address;

    // Карта
    document.getElementById('mapAddress').textContent = data.addressRu || data.address;
    if (data.mapUrl) {
      document.getElementById('contactsMap').innerHTML =
        `<iframe src="${data.mapUrl}" allowfullscreen loading="lazy"></iframe>`;
    }

    // Часы работы
    if (data.workingHours) {
      const hoursGrid = document.getElementById('hoursGrid');
      hoursGrid.innerHTML = Object.entries(data.workingHours).map(([day, hours]) => `
        <div class="hours__row">
          <span class="hours__day">${DAYS[day] || day}</span>
          <span class="hours__time ${hours.closed ? 'closed' : ''}">
            ${hours.closed ? 'Выходной' : `${hours.open} – ${hours.close}`}
          </span>
        </div>
      `).join('');
    }

    // Соцсети
    const socialsEl = document.getElementById('socials');
    const links = [
      { url: data.instagramUrl, icon: '📷', label: 'Instagram' },
      { url: data.telegramUrl,  icon: '✈️', label: 'Telegram' },
      { url: data.facebookUrl,  icon: '👥', label: 'Facebook' },
      { url: data.whatsappUrl,  icon: '💬', label: 'WhatsApp' },
    ].filter(l => l.url);

    if (links.length) {
      socialsEl.innerHTML = links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener" class="social-link">
          ${l.icon} ${l.label}
        </a>`
      ).join('');
    }

  } catch (err) {
    console.error('Ошибка загрузки контактов:', err);
  }
}

// ─── Запуск ───────────────────────────────────────────────────────
loadMenu();
loadGallery();
loadContacts();
