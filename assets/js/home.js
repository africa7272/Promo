// Лёгкий клиентский фильтр по тегу и поиск по заголовку/описанию (работает на статической выдаче)
(function(){
  const state = { q: '', tag: null };
  const grid = document.getElementById('grid');
  const search = document.getElementById('search');
  const query = document.getElementById('query');
  const filters = document.getElementById('active-filters');
  const activeTag = document.getElementById('active-tag');
  const clearTag = document.getElementById('clear-tag');

  function filter() {
    const cards = Array.from(grid.querySelectorAll('.card'));
    let shown = 0;
    cards.forEach(c => {
      const text = c.textContent.toLowerCase();
      const tags = Array.from(c.querySelectorAll('.tags .tag')).map(x => x.textContent.replace('#','').toLowerCase());
      const matchQ = state.q ? text.includes(state.q) : true;
      const matchT = state.tag ? tags.includes(state.tag) : true;
      const ok = matchQ && matchT;
      c.style.display = ok ? '' : 'none';
      shown += ok ? 1 : 0;
    });
    filters.style.display = state.tag ? 'flex' : 'none';
    activeTag.textContent = state.tag ? ('#' + state.tag) : '';
  }

  // клик по тегам
  grid.addEventListener('click', (e) => {
    const a = e.target.closest('.tag');
    if (!a) return;
    const t = a.textContent.replace('#','').trim().toLowerCase();
    state.tag = t;
    query.value = '';
    state.q = '';
    filter();
  });

  // поиск
  search.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = (query.value || '').trim().toLowerCase();
    state.tag = null;
    filter();
  });

  clearTag.addEventListener('click', (e) => {
    e.preventDefault();
    state.tag = null;
    filter();
  });

  // начальный прогон
  filter();
})();
