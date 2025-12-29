// Візуальна індикація, що JS працює (тимчасово для тестування)
// document.body.style.borderTop = '3px solid green';

var swiper = new Swiper(".mySwiper", {
  pagination: {
    el: ".swiper-pagination",
  },
});

// Мобильное бургер меню
document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.querySelector('.header_menu');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const body = document.body;

  // Перевірка наявності елементів
  if (!burgerMenu) {
    console.error('Burger menu element not found');
    return;
  }
  if (!mobileMenu) {
    console.error('Mobile menu overlay not found');
    return;
  }
  if (!mobileMenuClose) {
    console.error('Mobile menu close button not found');
    return;
  }

  // Открыть меню
  burgerMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    mobileMenu.classList.add('active');
    body.style.overflow = 'hidden';
  });

  // Закрыть меню
  mobileMenuClose.addEventListener('click', function(e) {
    e.preventDefault();
    mobileMenu.classList.remove('active');
    body.style.overflow = '';
  });

  // Закрыть меню при клике на оверлей
  mobileMenu.addEventListener('click', function(e) {
    if (e.target === mobileMenu) {
      mobileMenu.classList.remove('active');
      body.style.overflow = '';
    }
  });

  // Закрыть меню при клике на пункт меню
  const menuItems = document.querySelectorAll('.mobile-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      mobileMenu.classList.remove('active');
      body.style.overflow = '';
    });
  });

  // Додаємо глобальну функцію для тестування лічильників (можна прибрати пізніше)
  window.testCounters = animateCounters;
});

// Анімація лічильників статистики
function animateCounters() {
  const counters = document.querySelectorAll('.bottom .item span[data-target]');

  if (counters.length === 0) {
    console.error('No counters found!');
    return;
  }

  counters.forEach((counter, index) => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2500; // 2.5 секунди
    const startTime = performance.now();
    const startValue = 0;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4); // Плавна easing функція

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

      if (index === 0 || index === 1) {
        // Для перших двох - додаємо пробіли для тисяч
        counter.textContent = currentValue.toLocaleString() + (progress < 1 ? '' : '+');
      } else {
        // Для третього - роки
        counter.textContent = currentValue + (progress < 1 ? '' : ' років');
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  });
}

// Функція перевірки, чи елемент у viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Елемент вважається видимим, якщо його верхня частина знаходиться вище нижньої межі viewport
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);

  return vertInView;
}

// Intersection Observer для більш надійного визначення видимості
function createIntersectionObserver() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counters-started')) {
          setTimeout(animateCounters, 500);
          entry.target.setAttribute('data-counters-started', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // 10% елемента має бути видимим
      rootMargin: '0px 0px 0px 0px'
    });

    return observer;
  }

  return null;
}

// Запуск анімації при завантаженні сторінки або при появі елементів
document.addEventListener('DOMContentLoaded', function() {
  const statsSection = document.querySelector('.bottom') || document.querySelector('.professionals .bottom');

  if (statsSection) {
    // Додаємо обробник кліку для тестування (можна прибрати пізніше)
    statsSection.addEventListener('click', function() {
      animateCounters();
    });

    // Спробуємо використати Intersection Observer для більш надійного визначення
    const observer = createIntersectionObserver();
    if (observer) {
      observer.observe(statsSection);
    } else {
      // Функція для запуску анімації
      const startCounters = () => {
        if (!statsSection.hasAttribute('data-counters-started')) {
          animateCounters();
          statsSection.setAttribute('data-counters-started', 'true');
        }
      };

      // Перевіряємо, чи секція вже видима при завантаженні
      if (isElementInViewport(statsSection)) {
        setTimeout(startCounters, 500);
      } else {
        // Додаємо обробник прокрутки
        const handleScroll = () => {
          if (isElementInViewport(statsSection)) {
            setTimeout(startCounters, 500);
            window.removeEventListener('scroll', handleScroll);
          }
        };

        window.addEventListener('scroll', handleScroll);

        // Резервний варіант - запуск через 3 секунди після завантаження
        setTimeout(() => {
          if (!statsSection.hasAttribute('data-counters-started')) {
            startCounters();
          }
        }, 3000);
      }
    }
  } else {
    // Альтернативний варіант для fallback
    const bottomSection = document.querySelector('.bottom');
    if (bottomSection) {
      setTimeout(() => {
        animateCounters();
      }, 1000);
    }
  }
});