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
themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  themeBtn.classList.add('spin'); setTimeout(() => themeBtn.classList.remove('spin'), 520);
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { applyTheme(next); return; }
  const r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(() => applyTheme(next));
  t.ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
    { duration: 600, easing: 'cubic-bezier(.22,.61,.36,1)', pseudoElement: '::view-transition-new(root)' }
  ));
});

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
  prewash: 'https://app.notion.com/p/401f5144f2448190b54bd0d5fa624d30'
};
let popupCard = null;
function visibleCards() { return [...document.querySelectorAll('.work-card')].filter(c => c.style.display !== 'none'); }
function openPopup(card) {
  popupCard = card;
  const list = visibleCards();
  document.querySelector('.pp-count').textContent = (list.indexOf(card) + 1) + ' / ' + list.length;
  document.querySelector('.pp-nav').style.display = list.length > 1 ? '' : 'none';
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
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
  if (!popup.classList.contains('open')) return;
  if (e.key === 'ArrowRight') stepPopup(1);
  if (e.key === 'ArrowLeft') stepPopup(-1);
});
function stepPopup(d) {
  const list = visibleCards(); if (!popupCard || list.length < 2) return;
  const i = (list.indexOf(popupCard) + d + list.length) % list.length;
  openPopup(list[i]);
  document.querySelector('.portfolio-popup-inner').scrollTop = 0;
  const content = document.querySelector('.portfolio-popup-content');
  content.classList.remove('swap'); void content.offsetWidth; content.classList.add('swap');
}
document.querySelector('.pp-prev').addEventListener('click', () => stepPopup(-1));
document.querySelector('.pp-next').addEventListener('click', () => stepPopup(1));

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

// ===== 이펙트: 스크롤 진행 바 · 맨 위로 =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.createElement('div'); progress.className = 'scroll-progress'; document.body.appendChild(progress);
const toTop = document.createElement('button'); toTop.className = 'to-top'; toTop.setAttribute('aria-label', '맨 위로'); toTop.innerHTML = '<i class="uil uil-arrow-up"></i>'; document.body.appendChild(toTop);
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
function onScrollFx() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
  toTop.classList.toggle('show', window.scrollY > 600);
}
window.addEventListener('scroll', onScrollFx, { passive: true }); onScrollFx();

// ===== 이펙트: 화면에 들어올 때 올라오며 나타남 · 숫자 카운트 =====
(function () {
  const targets = document.querySelectorAll('.section-title, .about-photos, .about-data, .timeline-item, .skills-header, .work-card, .contact-line, .footer-container');
  targets.forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.work-card').forEach((c, i) => c.style.transitionDelay = (i % 2) * 90 + 'ms');
  document.querySelectorAll('.timeline-item').forEach((c, i) => c.style.transitionDelay = (i % 4) * 90 + 'ms');
  function countUp(b) {
    const m = b.textContent.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/s);
    if (!m || b.dataset.done) return;
    b.dataset.done = '1';
    const end = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length, t0 = performance.now(), dur = 1100;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      b.textContent = m[1] + (end * e).toFixed(dec) + m[3];
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (reduceMotion || !('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.style.transitionDelay) setTimeout(() => { en.target.style.transitionDelay = ''; }, 900);
      if (en.target.classList.contains('work-card')) en.target.querySelectorAll('.work-nums b').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(el => io.observe(el));
})();

// ===== 이펙트: 첫 화면 사진이 마우스를 따라 살짝 기울어짐 =====
(function () {
  const wrap = document.querySelector('.home-img-wrap');
  if (!wrap || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const zone = document.querySelector('.home');
  zone.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth, dy = (e.clientY - cy) / window.innerHeight;
    wrap.style.transform = `perspective(900px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`;
  });
  zone.addEventListener('mouseleave', () => { wrap.style.transform = ''; });
})();

// ===== 이펙트: 텍스트 스크램블 (soulwire, codepen.io/soulwire/pen/mEMPrK 방식) =====
class TextScramble {
  constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#01'; this.update = this.update.bind(this); }
  setText(newText) {
    const oldText = this.el.innerText, length = Math.max(oldText.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 24), end = start + Math.floor(Math.random() * 24);
      this.queue.push({ from: oldText[i] || '', to: newText[i] || '', start, end });
    }
    cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update();
    return promise;
  }
  update() {
    let out = '', done = 0;
    for (const q of this.queue) {
      if (this.frame >= q.end) { done++; out += q.to; }
      else if (this.frame >= q.start) {
        if (!q.char || Math.random() < .28) q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        out += `<span class="dud">${q.char}</span>`;
      } else out += q.from;
    }
    this.el.innerHTML = out;
    if (done === this.queue.length) this.resolve(); else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
  }
}
if (!reduceMotion) {
  // 섹션 제목: 화면에 들어올 때 한 번
  const titleIO = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, text = el.textContent; const fx = new TextScramble(el);
    el.textContent = text.replace(/\S/g, '_'); fx.setText(text); titleIO.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('.section-title').forEach(t => titleIO.observe(t));
  // 왼쪽 메뉴: 마우스를 올릴 때
  document.querySelectorAll('.nav-link').forEach(a => {
    const text = a.textContent, fx = new TextScramble(a); let busy = false;
    a.addEventListener('mouseenter', () => { if (busy) return; busy = true; fx.setText(text).then(() => busy = false); });
  });
}

// ===== 이펙트: 커서 스포트라이트 (brittanychiang.com 방식) =====
(function () {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const spot = document.createElement('div'); spot.className = 'spotlight'; document.body.prepend(spot);
  let raf = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => { spot.style.setProperty('--mx', mx + 'px'); spot.style.setProperty('--my', my + 'px'); spot.classList.add('on'); raf = 0; });
  }, { passive: true });
  document.addEventListener('mouseleave', () => spot.classList.remove('on'));
})();

// ===== 이펙트: 마그네틱 아이콘 버튼 =====
(function () {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .35, y = (e.clientY - r.top - r.height / 2) * .35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

// ===== 기능: 메일 아이콘을 누르면 주소 복사 + 알림 =====
(function () {
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let timer = 0;
  function show(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2200); }
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.addEventListener('click', () => {
    const mail = a.getAttribute('href').replace('mailto:', '');
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(() => show('메일 주소를 복사했습니다 · ' + mail)).catch(() => {});
  }));
})();

// 사진 공개 효과가 끝나면 clip-path를 풀어 그림자가 보이게
document.querySelectorAll('.about-photo.sub').forEach(p => p.addEventListener('transitionend', e => {
  if (e.propertyName === 'clip-path') p.closest('.about-photos').classList.add('clip-done');
}));

// ===== 개발자 도구를 연 사람에게 =====
console.log('%c황인재 · 로봇 SW 개발자', 'font: 700 16px serif; color: #3A4FB5');
console.log('콘솔까지 열어 보셨네요. 이 사이트 코드는 https://github.com/hwang-injae/hwang-injae.github.io 에 있습니다.\n연락은 il1282113@gmail.com 으로 주세요.');
