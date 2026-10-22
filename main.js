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

// ===== 색·글꼴 미리보기 (?accent=hex&font=Google+Font+이름) =====
(function () {
  const q = new URLSearchParams(location.search);
  const hex = (q.get('accent') || '').replace('#', '');
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2; let h = 0, s = 0;
    if (max !== min) { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? ((b - r) / d + 2) : ((r - g) / d + 4); h *= 60; }
    const H = Math.round(h), S = Math.round(s * 100), L = Math.round(l * 100);
    root.style.setProperty('--hue-color', H);
    root.style.setProperty('--skin-light', `hsl(${H}, ${S}%, ${Math.min(L, 42)}%)`);
    root.style.setProperty('--skin-dark', `hsl(${H}, ${Math.max(S, 60)}%, ${Math.max(L, 54)}%)`);
  }
  const font = q.get('font');
  if (font && /^[A-Za-z0-9 +]+$/.test(font)) {
    const fam = font.replace(/\+/g, ' ');
    const link = document.createElement('link'); link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@500;600;700;800&display=swap';
    document.head.appendChild(link);
    root.style.setProperty('--head-font', `'${fam}', 'IBM Plex Sans KR', sans-serif`);
    if (q.get('body') === '1') root.style.setProperty('--body-font', `'${fam}', 'IBM Plex Sans KR', sans-serif`);
  }
})();

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

// ===== 프로젝트 필터 (직접 구현: 숨김/표시 + 아래에서 올라오는 페이드) =====
const linkWork = document.querySelectorAll('.work-item');
const workCards = document.querySelectorAll('.work-card');
linkWork.forEach(l => l.addEventListener('click', function () {
  linkWork.forEach(x => x.classList.remove('active-work'));
  this.classList.add('active-work');
  const f = this.dataset.filter;
  let i = 0;
  workCards.forEach(c => {
    const show = f === 'all' || c.matches(f);
    c.style.display = show ? '' : 'none';
    c.classList.remove('card-in');
    if (show) { void c.offsetWidth; c.style.animationDelay = (i++ * 60) + 'ms'; c.classList.add('card-in'); }
  });
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
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
function navHighlighter() {
  const y = window.pageYOffset;
  const pivot = y + window.innerHeight * 0.4;           // 화면 위쪽 40% 지점을 기준으로 판단
  const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
  let current = sections[0].id;
  sections.forEach(s => { if (pivot >= s.offsetTop) current = s.id; });
  if (atBottom) current = sections[sections.length - 1].id;  // 맨 아래면 마지막(Contact)
  navLinks.forEach(a => a.classList.toggle('active-link', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', navHighlighter, { passive: true });
window.addEventListener('load', navHighlighter);

// ===== 커스텀 커서(회전 화살표) — 마우스 환경에서만 =====
(function () {
  const el = document.querySelector('.curzr-arrow-pointer');
  if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.documentElement.classList.add('has-cursor');
  el.removeAttribute('hidden');
  let px = 0, py = 0, angle = 0, displace = 0, shown = false;
  const SIZE = 20, DEG = 57.296;
  function rotate(dx, dy) {
    const raw = Math.atan(Math.abs(dy) / Math.abs(dx)) * DEG;
    let a;
    if (dx <= 0 && dy >= 0) a = 90 - raw;
    else if (dx < 0 && dy < 0) a = raw + 90;
    else if (dx >= 0 && dy <= 0) a = 270 - raw;
    else a = raw + 270;
    if (isNaN(a)) return;
    const diff = a - angle;
    if (diff <= -270) displace += 360 + diff; else if (diff >= 270) displace += diff - 360; else displace += diff;
    angle = a;
  }
  document.addEventListener('mousemove', e => {
    const dx = px - e.clientX, dy = py - e.clientY;
    px = e.clientX; py = e.clientY;
    if (Math.hypot(dx, dy) > 1) rotate(dx, dy);
    el.style.transform = `translate3d(${px - SIZE / 2}px, ${py}px, 0) rotate(${displace}deg)`;
    if (!shown) { shown = true; el.style.opacity = 1; }
  }, { passive: true });
  document.addEventListener('mouseleave', () => { el.style.opacity = 0; shown = false; });
  document.addEventListener('mouseenter', () => { el.style.opacity = 1; shown = true; });
})();

// ===== 모바일 사이드바 =====
const navMenu = document.getElementById('sidebar');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
navToggle.addEventListener('click', () => navMenu.classList.add('show-sidebar'));
navClose.addEventListener('click', () => navMenu.classList.remove('show-sidebar'));
document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('show-sidebar')));
