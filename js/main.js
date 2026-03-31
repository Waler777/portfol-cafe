// =============================================
// CUSTOM CURSOR — только на desktop
// =============================================
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isDesktop) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  dot.style.display = 'block';
  ring.style.display = 'block';

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  const lerp = 0.12; // коэффициент плавности

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Точка следует мгновенно
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Кольцо с lerp интерполяцией
  function animateCursor() {
    ringX += (mouseX - ringX) * lerp;
    ringY += (mouseY - ringY) * lerp;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Увеличение кольца при hover на интерактивные элементы
  const interactives = document.querySelectorAll('a, button, .menu-card, .gallery__item, .slide-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-expanded'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-expanded'));
  });
}

// =============================================
// HEADER — изменение при скролле
// =============================================
const header = document.getElementById('header');

const handleScroll = () => {
  if (window.scrollY > 80) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

// Debounce для scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(handleScroll, 10);
}, { passive: true });

// =============================================
// БУРГЕР-МЕНЮ
// =============================================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = burger.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Закрытие при клике по ссылке
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// =============================================
// HERO СЛАЙДЕР
// =============================================
const slides = document.querySelectorAll('.hero__slide');
const slideBtn = document.getElementById('slideBtn');
const ringProgress = document.getElementById('ringProgress');
const counterCurrent = document.getElementById('counterCurrent');
const SLIDE_DURATION = 6500; // 6.5 секунды
const CIRCUMFERENCE = 2 * Math.PI * 28; // ≈ 175.93

let currentSlide = 0;
let progressStart = null;
let rafId = null;

ringProgress.style.strokeDasharray = CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = CIRCUMFERENCE;

// Переход к слайду
function goToSlide(index) {
  // Удаляем active у всех слайдов
  slides.forEach(slide => slide.classList.remove('active'));

  // Вычисляем новый индекс с циклическим переключением
  currentSlide = index % slides.length;

  // Добавляем active новому слайду
  slides[currentSlide].classList.add('active');

  // Обновляем счётчик
  counterCurrent.textContent = String(currentSlide + 1).padStart(2, '0');

  // Сбрасываем и перезапускаем прогресс
  resetProgress();
}

// Сброс и запуск прогресса
function resetProgress() {
  cancelAnimationFrame(rafId);
  progressStart = null;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE;
  rafId = requestAnimationFrame(animateProgress);
}

// Анимация прогресс-кольца
function animateProgress(timestamp) {
  if (!progressStart) progressStart = timestamp;
  const elapsed = timestamp - progressStart;
  const progress = Math.min(elapsed / SLIDE_DURATION, 1);
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  if (progress < 1) {
    rafId = requestAnimationFrame(animateProgress);
  } else {
    // Убедимся, что анимация завершена и вызываем переключение
    cancelAnimationFrame(rafId);
    goToSlide(currentSlide + 1);
  }
}

// Запуск анимации прогресса
function startProgressAnimation() {
  progressStart = null;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE;
  rafId = requestAnimationFrame(animateProgress);
}

// Запускаем анимацию при загрузке
startProgressAnimation();

// Клик по кнопке — следующий слайд
slideBtn.addEventListener('click', () => {
  goToSlide(currentSlide + 1);
});

// =============================================
// REVEAL ANIMATIONS — IntersectionObserver
// =============================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target); // Срабатывает один раз
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// =============================================
// GALLERY — пауза через touch (мобильные)
// =============================================
const galleryTrack = document.getElementById('galleryTrack');

galleryTrack.addEventListener('touchstart', () => {
  galleryTrack.classList.add('paused');
}, { passive: true });

galleryTrack.addEventListener('touchend', () => {
  galleryTrack.classList.remove('paused');
}, { passive: true });

// =============================================
// МОДАЛЬНОЕ ОКНО
// =============================================
const modalOverlay = document.getElementById('modalOverlay');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');

function openModalFn() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalFn() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

openModal.addEventListener('click', openModalFn);
closeModal.addEventListener('click', closeModalFn);

// Закрытие по клику вне модала
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModalFn();
});

// Закрытие по Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
    closeModalFn();
  }
});

// =============================================
// МОДАЛЬНОЕ ОКНО БРОНИРОВАНИЯ
// =============================================
const reservationOverlay = document.getElementById('reservationOverlay');
const bookTableBtn = document.getElementById('bookTableBtn');
const closeReservation = document.getElementById('closeReservation');
const floatingPhone = document.getElementById('floatingPhone');
const submitReservation = document.getElementById('submitReservation');

function openReservationModal() {
  reservationOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReservationModal() {
  reservationOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

bookTableBtn.addEventListener('click', openReservationModal);
closeReservation.addEventListener('click', closeReservationModal);
floatingPhone.addEventListener('click', openReservationModal);

// Закрытие по клику вне модала
reservationOverlay.addEventListener('click', (e) => {
  if (e.target === reservationOverlay) closeReservationModal();
});

// Закрытие по Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reservationOverlay.classList.contains('open')) {
    closeReservationModal();
  }
});

// Обработка отправки формы бронирования
submitReservation.addEventListener('click', () => {
  const name = document.getElementById('reserveName').value.trim();
  const phone = document.getElementById('reservePhone').value.trim();
  const agreement = document.getElementById('reservationAgreement').checked;

  if (!name || !phone) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  if (!agreement) {
    alert('Необходимо согласие с политикой конфиденциальности');
    return;
  }

  // Имитация отправки
  alert('Спасибо! Мы перезвоним вам в течение 10 минут.');
  closeReservationModal();
  document.getElementById('reserveName').value = '';
  document.getElementById('reservePhone').value = '';
  document.getElementById('reservationAgreement').checked = false;
});

// =============================================
// ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target && this.getAttribute('href') !== '#') {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
