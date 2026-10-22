const themeButton = document.querySelector('.theme-toggle');
function syncThemeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton?.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
  themeButton?.setAttribute('title', dark ? '切换浅色模式' : '切换深色模式');
  if (themeButton) themeButton.textContent = dark ? '日间' : '夜间';
}
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('learn-ai-theme', theme); } catch {}
  syncThemeLabel();
});
syncThemeLabel();

const search = document.querySelector('input[type="search"]');
const rows = [...document.querySelectorAll('.library .post-row')];
const filters = [...document.querySelectorAll('.filter')];
let category = 'all';
function filterPosts() {
  const query = (search?.value || '').toLocaleLowerCase().trim();
  let count = 0;
  rows.forEach(row => {
    const matches = (category === 'all' || row.dataset.category === category) && row.dataset.search.includes(query);
    row.hidden = !matches;
    if (matches) count++;
  });
  document.querySelectorAll('.library .year-group').forEach(group => {
    group.hidden = ![...group.querySelectorAll('.post-row')].some(row => !row.hidden);
  });
  const result = document.querySelector('.result-count');
  if (result) result.textContent = `${count} 篇笔记`;
  const empty = document.querySelector('.empty-state');
  if (empty) empty.hidden = count > 0;
  filters.forEach(button => {
    const active = button.dataset.filter === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filterPosts(); }));
search?.addEventListener('input', filterPosts);
document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => {
  category = link.dataset.topic;
  if (search) search.value = '';
  filterPosts();
}));
document.querySelector('.reset-search')?.addEventListener('click', () => {
  category = 'all';
  if (search) search.value = '';
  filterPosts();
  search?.focus();
});
if (search) {
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  filterPosts();
  if (params.has('search')) search.focus();
}
document.addEventListener('keydown', event => {
  const target = event.target;
  if (event.key === '/' && search && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT','TEXTAREA','SELECT'].includes(target.tagName) && !target.isContentEditable) {
    event.preventDefault();
    search.focus();
    search.scrollIntoView({ block:'center', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
});
let toastTimer;
function notify(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}
document.querySelectorAll('.prose pre').forEach(pre => {
  const button = document.createElement('button');
  button.className = 'copy-code';
  button.type = 'button';
  button.textContent = '复制';
  button.setAttribute('aria-label', '复制代码');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.querySelector('code').textContent);
      notify('已复制到剪贴板');
    } catch {
      notify('暂时无法自动复制，请选中代码手动复制');
    }
  });
  pre.append(button);
});
