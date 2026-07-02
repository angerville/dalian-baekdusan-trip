/* ============================================
   JavaScript — 백두산 여행 가이드
   ============================================ */

// ── 헬퍼 ──────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── 스크롤 시 nav 고정 ────────────────────────
const nav = $('#nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ── 모바일 메뉴 ──────────────────────────────
const navToggle = $('#nav-toggle');
const navLinks  = $('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});
// 메뉴 링크 클릭 시 닫기
$$('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.textContent = '☰';
  });
});

// ── 탭 전환 ──────────────────────────────────
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    $(`#${btn.dataset.tab}`).classList.add('active');
  });
});

// ── IntersectionObserver — fade-in ──────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // 그룹 안에서 순서대로 지연
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// 같은 부모 안의 fade-in 엘리먼트에 순차 딜레이 부여
document.querySelectorAll('.fade-in').forEach((el, i) => {
  // 형제 순서 기반 딜레이 계산 (최대 300ms)
  const siblings = [...el.parentElement.querySelectorAll('.fade-in')];
  const idx = siblings.indexOf(el);
  el.dataset.delay = Math.min(idx * 80, 300);
  observer.observe(el);
});

// ── 라이트박스 ────────────────────────────────
const lightbox      = $('#lightbox');
const lightboxImg   = $('#lightbox-img');
const lightboxCap   = $('#lightbox-caption');
const lightboxClose = $('#lightbox-close');
const lightboxPrev  = $('#lightbox-prev');
const lightboxNext  = $('#lightbox-next');

let galleryImages = [];
let currentIdx    = 0;

// 갤러리 이미지 수집 (클릭 가능한 모든 이미지)
function collectGalleryImages() {
  const items = $$('.gallery-main img, .gallery-item img');
  galleryImages = items.map(img => ({
    src: img.src,
    alt: img.alt,
    caption: img.closest('.gallery-main')
      ? img.closest('.gallery-main').querySelector('.gallery-caption')?.textContent
      : img.closest('.gallery-item')?.querySelector('.gallery-item-caption')?.textContent
  }));
  return items;
}

function openLightbox(idx) {
  currentIdx = idx;
  const { src, alt, caption } = galleryImages[idx];
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCap.textContent = caption || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function navigate(dir) {
  currentIdx = (currentIdx + dir + galleryImages.length) % galleryImages.length;
  const { src, alt, caption } = galleryImages[currentIdx];
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCap.textContent = caption || '';
    lightboxImg.style.opacity = '1';
  }, 150);
}

lightboxImg.style.transition = 'opacity 0.2s ease';

// 클릭 이벤트 등록 (DOM 로드 후)
const galleryImgEls = collectGalleryImages();
galleryImgEls.forEach((img, idx) => {
  img.closest('.gallery-main, .gallery-item').style.cursor = 'zoom-in';
  img.closest('.gallery-main, .gallery-item').addEventListener('click', () => openLightbox(idx));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigate(-1));
lightboxNext.addEventListener('click', () => navigate(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// 키보드 단축키
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigate(-1);
  if (e.key === 'ArrowRight')  navigate(1);
});

// ── 스크롤 진행 표시줄 ───────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; height: 3px;
  background: linear-gradient(90deg, #e67e22, #f39c12);
  z-index: 9999; width: 0%; transition: width 0.1s ease;
  pointer-events: none;
`;
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${scrollPercent}%`;
}, { passive: true });

// ── 부드러운 스크롤 강화 ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = nav.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── 온센 카드 호버 효과 ──────────────────────
$$('.onsen-card, .intro-card, .schedule-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
  });
});

// ── 갤러리 이미지 로드 오류 대비 ────────────
$$('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.background = '#1c3a50';
    img.style.minHeight  = '200px';
  });
});

console.log('🏔️ 백두산 여행 가이드 — 준비 완료!');
