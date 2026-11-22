const budget = document.querySelector('#banquet-budget');
if (budget) {
  const money = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
  const controls = [...document.querySelectorAll('.dish-step')];
  const summary = document.querySelector('#table-summary');
  const manual = budget.elements.foodPerGuest;
  const initialPrice = () => Number(manual.dataset.manualPrice ?? manual.defaultValue);
  const key = 'brio.table.v1';
  const bar = document.querySelector('#table-total');
  const share = document.querySelector('#share-table');
  const fields = ['day', 'hours', 'guests', 'decor', 'foodPerGuest'];
  const dishName = c => c.closest('li').querySelector('.menu-list__name').textContent;
  function snapshot() {
    const fieldsData = Object.fromEntries(fields.map(name => [name, budget.elements[name].value]));
    if (manual.readOnly) fieldsData.foodPerGuest = String(initialPrice());
    const dishes = Object.fromEntries(controls.map(c => [dishName(c), Number(c.querySelector('span').textContent)]).filter(entry => entry[1] > 0));
    return {fields: fieldsData, dishes};
  }
  const url = new URL(location.href);
  try {
    const shared = url.searchParams.get('table');
    const state = JSON.parse(shared || localStorage.getItem(key));
    if (state?.fields && state?.dishes) {
      for (const name of fields) {
        const input = budget.elements[name];
        const value = state.fields[name];
        if (typeof value !== 'string' || !value || !Number.isFinite(Number(value))) continue;
        const previous = input.value;
        input.value = value;
        if (!input.value || !input.checkValidity()) input.value = previous;
      }
      for (const c of controls) {
        const qty = state.dishes[dishName(c)];
        if (!Number.isSafeInteger(qty) || qty < Number(c.dataset.min) || qty > 100000) continue;
        c.querySelector('span').textContent = qty;
        c.querySelector('button').disabled = false;
      }
      if (shared) {
        url.searchParams.delete('table');
        history.replaceState(null, '', url);
      }
    }
  } catch { /* Storage can be unavailable in private browsing. */ }
  share.addEventListener('click', async () => {
    const link = new URL(location.href);
    link.searchParams.set('table', JSON.stringify(snapshot()));
    link.hash = 'table-summary';
    try {
      await navigator.clipboard.writeText(link.href);
      summary.querySelector('small').textContent = 'Ссылка на этот стол скопирована';
    } catch {
      const field = summary.querySelector('textarea');
      field.value = link.href;
      field.hidden = false;
      field.select();
    }
  });
  document.querySelector('#reset-table').addEventListener('click', () => {
    if (!confirm('Очистить выбранные блюда и вернуть исходные условия?')) return;
    budget.reset();
    manual.readOnly = false;
    delete manual.dataset.manualPrice;
    for (const c of controls) {
      c.querySelector('span').textContent = 0;
      c.querySelector('button').disabled = true;
    }
    updateBudget();
  });
  function updateBudget() {
    const selected = controls.filter(c => Number(c.querySelector('span').textContent) > 0);
    const lines = [];
    let food = 0;
    const list = summary.querySelector('ul');
    list.replaceChildren();
    for (const c of selected) {
      const qty = Number(c.querySelector('span').textContent);
      const subtotal = qty * Number(c.dataset.price);
      food += subtotal;
      const name = c.closest('li').querySelector('.menu-list__name').textContent;
      const line = name + ' · ' + qty + ' ' + c.dataset.unit + ' — ' + money.format(subtotal) + ' ₽';
      lines.push(line);
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = name + ' · ' + money.format(subtotal) + ' ₽';
      const actions = document.createElement('div');
      actions.className = 'table-item-actions';
      const step = c.cloneNode(true);
      const [less, more] = step.querySelectorAll('button');
      const min = Number(c.dataset.min);
      less.disabled = qty <= min;
      step.querySelector('span').textContent = qty + ' ' + c.dataset.unit;
      less.onclick = () => changeQuantity(c, qty - 1);
      more.onclick = () => changeQuantity(c, qty + 1);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-dish';
      remove.textContent = 'Убрать';
      remove.setAttribute('aria-label', 'Убрать ' + name);
      remove.onclick = () => changeQuantity(c, 0);
      actions.append(step, remove);
      item.append(title, actions);
      list.append(item);
    }
    const guests = budget.elements.guests.valueAsNumber;
    if (selected.length) {
      if (!manual.readOnly) manual.dataset.manualPrice = manual.value;
      manual.readOnly = true;
      manual.value = guests > 0 ? (food / guests).toFixed(2) : '';
    } else if (manual.readOnly) {
      manual.readOnly = false;
      manual.value = initialPrice();
    }
    const out = budget.querySelector('output');
    const note = summary.querySelector('p');
    const copy = summary.querySelector('#copy-table');
    copy.disabled = !budget.checkValidity();
    summary.querySelector('small').textContent = '';
    summary.querySelector('textarea').hidden = true;
    bar.hidden = !selected.length;
    bar.querySelector('strong').textContent = 'Меню · ' + money.format(food) + ' ₽';
    share.disabled = !selected.length || copy.disabled;
    if (!copy.disabled) {
      try { localStorage.setItem(key, JSON.stringify(snapshot())); } catch { /* Optional storage. */ }
    }
    if (copy.disabled) {
      out.textContent = note.textContent = 'Проверьте поля калькулятора. В зале от 1 до 12 гостей.';
      return;
    }
    const rent = budget.elements.day.value * budget.elements.hours.value;
    if (!selected.length) food = manual.value * guests;
    const decor = Number(budget.elements.decor.value);
    const total = rent + decor + food;
    const parts = ['Зал — ' + money.format(rent) + ' ₽', 'Декор — ' + money.format(decor) + ' ₽', 'Меню — ' + money.format(food) + ' ₽', 'Итого — ' + money.format(total) + ' ₽'];
    out.textContent = parts.join(' · ') + ' · На гостя ≈ ' + money.format(total / guests) + ' ₽';
    note.textContent = selected.length ? 'Меню на ' + guests + ' чел. — ' + money.format(food) + ' ₽ · На гостя ≈ ' + money.format(food / guests) + ' ₽' : 'Добавьте первое блюдо кнопкой «+».';
    copy.disabled = !selected.length;
    summary.querySelector('textarea').value = ['Банкет в Brio · ' + guests + ' чел.', budget.elements.day.selectedOptions[0].text + ' · ' + budget.elements.hours.value + ' ч', ...lines, ...parts, 'Банкет на гостя ≈ ' + money.format(total / guests) + ' ₽'].join('\n');
  }
  function changeQuantity(control, quantity) {
    control.querySelector('span').textContent = quantity;
    control.querySelector('button').disabled = quantity === 0;
    updateBudget();
  }
  for (const c of controls) {
    c.hidden = false;
    const [minus, plus] = c.querySelectorAll('button');
    const count = c.querySelector('span');
    c.addEventListener('click', event => {
      if (event.target !== plus && event.target !== minus) return;
      const n = Number(count.textContent);
      const min = Number(c.dataset.min);
      const next = event.target === plus ? Math.max(min, n + 1) : n === min ? 0 : n - 1;
      changeQuantity(c, next);
    });
  }
  summary.hidden = false;
  summary.querySelector('#copy-table').addEventListener('click', async () => {
    const field = summary.querySelector('textarea');
    try {
      updateBudget();
      await navigator.clipboard.writeText(field.value);
      summary.querySelector('small').textContent = 'Расчёт скопирован';
    } catch {
      field.hidden = false;
      field.select();
      summary.querySelector('small').textContent = 'Скопируйте выделенный текст.';
    }
  });
  budget.hidden = false;
  budget.addEventListener('submit', e => e.preventDefault());
  budget.addEventListener('input', updateBudget);
  updateBudget();
}
const today = document.querySelector('#brio-today');
if (today) {
  const clock = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Moscow', weekday:'short', hour:'2-digit', hourCycle:'h23'});
  function updateToday() {
    const parts = Object.fromEntries(clock.formatToParts(new Date()).map(p => [p.type,p.value]));
    const late = ['Fri','Sat'].includes(parts.weekday);
    const hour = Number(parts.hour);
    const opened = hour >= 12 && hour < (late ? 23 : 22);
    const close = late ? '23:00' : '22:00';
    today.querySelector('span').textContent = parts.weekday === 'Mon' ? 'Сегодня в Brio выходной' : opened ? 'Сегодня открыто до ' + close : 'Сегодня в Brio · 12:00–' + close;
    today.querySelector('a').hidden = !(['Tue','Wed','Thu','Fri'].includes(parts.weekday) && hour >= 12 && hour < 15);
    today.hidden = false;
  }
  updateToday();
  setInterval(updateToday, 60000);
}
