// ===== 다크 / 라이트 =====
const root = document.documentElement;
const themeBtn = document.getElementById('theme');
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

// ===== 상단 메뉴: 스크롤 시 테두리 · 모바일 열기 =====
const topbar = document.querySelector('.top');
const onScroll = () => topbar && topbar.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = document.getElementById('burger'), menu = document.querySelector('.menu');
burger && burger.addEventListener('click', () => menu.classList.toggle('open'));
menu && menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('open'); });

// ===== 현재 섹션 메뉴 강조 =====
const secs = [...document.querySelectorAll('section[id]')];
const links = [...document.querySelectorAll('.menu a[href^="#"]')];
if (secs.length && links.length) {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(s => io.observe(s));
}

// ===== 화면에 들어올 때 나타남 =====
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rev = [...document.querySelectorAll('.reveal')];
if (reduce) rev.forEach(el => el.classList.add('in'));
else {
  const io2 = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io2.unobserve(en.target); } }), { threshold: .12 });
  rev.forEach(el => io2.observe(el));
}

// ===== 메일 주소 복사 =====
(function () {
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let t = 0;
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.addEventListener('click', () => {
    const mail = a.getAttribute('href').replace('mailto:', '');
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(mail).then(() => {
      toast.textContent = '메일 주소를 복사했습니다 · ' + mail; toast.classList.add('show');
      clearTimeout(t); t = setTimeout(() => toast.classList.remove('show'), 2200);
    }).catch(() => {});
  }));
})();

// ===== Notion 정리 페이지 =====
const NOTION = {
  buildmind: 'https://app.notion.com/p/401f5144f244818c97cbdf9a395181ca',
  sorttwin: 'https://app.notion.com/p/401f5144f24481e4a4a8dcf259c55da4',
  prewash: 'https://app.notion.com/p/401f5144f2448190b54bd0d5fa624d30'
};
document.querySelectorAll('[data-notion]').forEach(a => { const u = NOTION[a.dataset.notion]; if (u) a.href = u; else a.hidden = true; });

document.querySelectorAll('.year').forEach(e => e.textContent = new Date().getFullYear());
