(() => {
  const bar = document.querySelector('#banquet-menu [role="tablist"]');
  const tabs = Array.from(bar.children);
  function select(active) {
    for (const button of tabs) {
      const selected = button === active;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      panel.tabIndex = 0;
      panel.hidden = !selected;
      panel.querySelector('h3').hidden = true;
    }
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      const positions = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in positions)) return;
      event.preventDefault();
      const next = tabs[(positions[event.key] + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
  select(tabs[0]);
  bar.hidden = false;
})();
