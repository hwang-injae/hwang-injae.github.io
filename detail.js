// 프로젝트 상세 페이지 전용 (main.js는 홈 전용 요소를 기대하므로 따로 둠)
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.innerHTML = t === 'light' ? MOON : SUN;
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(saved || 'dark');
themeBtn && themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));

// Notion 정리 페이지
const NOTION = {
  buildmind: 'https://app.notion.com/p/401f5144f244818c97cbdf9a395181ca',
  sorttwin: 'https://app.notion.com/p/401f5144f24481e4a4a8dcf259c55da4',
  prewash: 'https://app.notion.com/p/401f5144f2448190b54bd0d5fa624d30'
};
document.querySelectorAll('[data-notion]').forEach(a => { const u = NOTION[a.dataset.notion]; if (u) a.href = u; else a.hidden = true; });
document.querySelectorAll('.year').forEach(e => e.textContent = new Date().getFullYear());
