// Gargi — Portfolio · interações da Home (PT-BR)

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Faixa vermelha do Currículo: trava a largura no tamanho real renderizado
  // da palavra "Currículo", pra faixa sempre terminar exatamente no fim dela,
  // em qualquer largura de tela.
  const resumeHeading = document.querySelector('.resume-heading');
  const resumeHeader = document.querySelector('.resume-header');
  if (resumeHeading && resumeHeader) {
    const syncResumeStripeWidth = () => {
      const w = resumeHeading.getBoundingClientRect().width;
      if (w > 0) resumeHeader.style.setProperty('--resume-stripe-w', w + 'px');
    };
    syncResumeStripeWidth();
    window.addEventListener('resize', syncResumeStripeWidth);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncResumeStripeWidth);
    }
  }

  // Alternância de idioma → efeito de "press" antes de navegar para a outra versão
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    const isEN = window.location.pathname.startsWith('/en/') || window.location.pathname.includes('/en/');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const targetPage = (currentPage === 'index.html' || currentPage === '') ? '' : currentPage;
    const targetHref = isEN ? '/' + targetPage : '/en/' + targetPage;

    langToggle.setAttribute('aria-pressed', String(isEN));
    langToggle.querySelector('.lang-toggle__label').textContent = isEN ? 'PT-BR' : 'EN-US';
    langToggle.setAttribute('aria-label', isEN ? 'Mudar idioma para português' : 'Mudar idioma para inglês');

    langToggle.addEventListener('click', (e) => {
      if (reduceMotion) { window.location.href = targetHref; return; }
      e.preventDefault();
      langToggle.setAttribute('aria-pressed', String(!isEN));
      const delay = 220;
      setTimeout(() => { window.location.href = targetHref; }, delay);
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
    const isENPage = window.location.pathname.includes('/en/');
    const copiedMsg = isENPage ? 'Email copied!' : 'Email copiado!';

    copyEmailBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(originalText.trim());
        emailSpan.textContent = copiedMsg;
        setTimeout(() => { emailSpan.textContent = originalText; }, 2000);
      } catch (err) {
        // Clipboard API indisponível — não faz nada, o link continua legível
      }
    });
  }

  // --- Menu mobile (hambúrguer) ---
  // O botão é criado aqui (sem JS o menu continua como lista normal no header).
  const siteHeader = document.querySelector('.site-header');
  const siteNav = siteHeader?.querySelector('.nav');
  if (siteHeader && siteNav) {
    const isENMenu = window.location.pathname.includes('/en/');
    const labels = isENMenu ? ['Open menu', 'Close menu'] : ['Abrir menu', 'Fechar menu'];
    siteNav.id = siteNav.id || 'site-nav';

    const navToggle = document.createElement('button');
    navToggle.type = 'button';
    navToggle.className = 'nav-toggle';
    navToggle.setAttribute('aria-controls', siteNav.id);
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', labels[0]);
    navToggle.innerHTML = '<span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>';
    siteNav.before(navToggle);
    siteHeader.classList.add('js-nav');

    const desktopMenu = window.matchMedia('(min-width: 821px)');
    const setMenuOpen = (open) => {
      siteHeader.classList.toggle('is-menu-open', open);
      document.documentElement.classList.toggle('is-menu-locked', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', labels[open ? 1 : 0]);
    };

    navToggle.addEventListener('click', () => {
      const open = !siteHeader.classList.contains('is-menu-open');
      setMenuOpen(open);
      if (open) siteNav.querySelector('a, button')?.focus({ preventScroll: true });
    });
    // Fecha ao escolher um link, com Esc, ao clicar fora ou ao voltar para o desktop
    siteNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteHeader.classList.contains('is-menu-open')) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (siteHeader.classList.contains('is-menu-open') && !siteHeader.contains(e.target)) setMenuOpen(false);
    });
    desktopMenu.addEventListener('change', (e) => { if (e.matches) setMenuOpen(false); });
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
