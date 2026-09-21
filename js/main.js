// Gargi — Portfolio · interações da Home (PT-BR)

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Alternância de idioma → efeito de "press" antes de navegar para a versão em inglês
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      if (reduceMotion) return; // navega direto
      e.preventDefault();
      langToggle.setAttribute('aria-pressed', 'true');
      const delay = 220;
      setTimeout(() => { window.location.href = '/en/'; }, delay);
    });
  }

  // --- Entrada do Hero: fade/slide-in ao carregar ---
  requestAnimationFrame(() => {
    document.querySelectorAll('.js-hero-in').forEach((el) => {
      el.classList.add('is-in');
    });
  });

  // --- Scroll-reveal (cards de projeto + itens do currículo) ---
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-reveal-index') || 0);
            entry.target.style.setProperty('--reveal-index', idx);
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-in'));
    }
  }

  // --- Contagem (anos do currículo) ---
  const countEls = document.querySelectorAll('.count[data-count-to]');
  if (countEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      if (reduceMotion || Number.isNaN(target)) { el.textContent = target; return; }
      const start = target - 6 > 0 ? target - 6 : 0;
      const duration = 900;
      const startTime = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !reduceMotion) {
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach((el) => countObserver.observe(el));
    }
  }

  // Copiar email ao clicar no botão do footer
  const copyEmailBtn = document.getElementById('copyEmail');
  if (copyEmailBtn) {
    const emailSpan = copyEmailBtn.querySelector('span');
    const originalText = emailSpan.textContent;

    copyEmailBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(originalText.trim());
        emailSpan.textContent = 'Email copiado!';
        setTimeout(() => { emailSpan.textContent = originalText; }, 2000);
      } catch (err) {
        // Clipboard API indisponível — não faz nada, o link continua legível
      }
    });
  }

  // Dropdown "Projetos" acessível por teclado/toque (além do hover via CSS)
  const dropdownItem = document.querySelector('.nav__item--dropdown');
  const dropdownButton = dropdownItem?.querySelector('.nav__button');
  if (dropdownItem && dropdownButton) {
    dropdownButton.addEventListener('click', () => {
      const expanded = dropdownButton.getAttribute('aria-expanded') === 'true';
      dropdownButton.setAttribute('aria-expanded', String(!expanded));
      dropdownItem.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('click', (e) => {
      if (!dropdownItem.contains(e.target)) {
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdownItem.classList.remove('is-open');
      }
    });
  }
});
