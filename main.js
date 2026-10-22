// ===== 다크 / 라이트 모드 =====
const themeBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  themeBtn.innerHTML = t === 'light' ? '<i class="uil uil-moon"></i>' : '<i class="uil uil-sun"></i>';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(new URLSearchParams(location.search).get('theme') || saved || 'dark');
themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));

// ===== 스킬 탭 =====
const tabs = document.querySelectorAll('[data-target]');
const tabContent = document.querySelectorAll('[data-content]');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = document.querySelector(tab.dataset.target);
    tabContent.forEach(c => c.classList.remove('skills-active'));
    target.classList.add('skills-active');
    tabs.forEach(t => t.classList.remove('skills-active'));
    tab.classList.add('skills-active');
  });
});

// ===== 프로젝트 필터 (mixitup) =====
if (window.mixitup) {
  mixitup('.work-container', { selectors: { target: '.work-card' }, animation: { duration: 300 } });
}
const linkWork = document.querySelectorAll('.work-item');
linkWork.forEach(l => l.addEventListener('click', function () {
  linkWork.forEach(x => x.classList.remove('active-work'));
  this.classList.add('active-work');
}));

// ===== 프로젝트 팝업 =====
const popup = document.querySelector('.portfolio-popup');
document.addEventListener('click', e => {
  const card = e.target.closest('.work-card');
  if (card && !e.target.closest('a')) openPopup(card);
});
// Notion 정리 페이지 주소 (비어 있으면 버튼을 숨김)
const NOTION_PAGES = {
  buildmind: 'https://app.notion.com/p/401f5144f244818c97cbdf9a395181ca',
  sorttwin: 'https://app.notion.com/p/401f5144f24481e4a4a8dcf259c55da4',
  prewash: 'https://app.notion.com/p/401f5144f2448190b54bd0d5fa624d30',
  idc: 'https://app.notion.com/p/401f5144f24481d0bfd7d69a1d37d514'
};
function openPopup(card) {
  document.querySelector('.pp-thumbnail img').src = card.querySelector('.work-img').src;
  document.querySelector('.portfolio-popup-subtitle span').innerHTML = card.dataset.category || '';
  const body = document.querySelector('.portfolio-popup-body');
  body.innerHTML = card.querySelector('.portfolio-item-details').innerHTML;
  body.querySelectorAll('.notion-link').forEach(a => {
    const url = NOTION_PAGES[a.dataset.notion];
    if (url) a.href = url; else a.style.display = 'none';
  });
  popup.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePopup() { popup.classList.remove('open'); document.body.style.overflow = ''; }
document.querySelector('.portfolio-popup-close').addEventListener('click', closePopup);
popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

// ===== 스크롤 위치에 따라 메뉴 강조 =====
const sections = document.querySelectorAll('section[id]');
function navHighlighter() {
  const y = window.pageYOffset;
  sections.forEach(s => {
    const top = s.offsetTop - 80, h = s.offsetHeight, id = s.getAttribute('id');
    const link = document.querySelector('.nav-menu a[href*=' + id + ']');
    if (!link) return;
    if (y > top && y <= top + h) link.classList.add('active-link'); else link.classList.remove('active-link');
  });
}
window.addEventListener('scroll', navHighlighter);

// ===== 모바일 사이드바 =====
const navMenu = document.getElementById('sidebar');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
navToggle.addEventListener('click', () => navMenu.classList.add('show-sidebar'));
navClose.addEventListener('click', () => navMenu.classList.remove('show-sidebar'));
document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('show-sidebar')));
