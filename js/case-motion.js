// Gargi — Portfolio · micro-interações das páginas de case (Volkswagen, Claro, Peterson)
// Genérico: reconhece as peças pela estrutura (.case-kicker, .case-split, .case-blocks,
// .case-numbered-list, .case-stats-row, .case-pillars, carrosséis...), então vale
// para qualquer case que inclua este script.
// Precisa ser carregado ANTES de main.js: marca os elementos com .reveal
// (e variações) para que o observer de scroll-reveal de main.js os encontre.
// Sem JS nenhuma classe é aplicada, então todo o conteúdo continua visível.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  // Aplica .reveal (+ variação) e o índice da cascata a cada elemento
  // (aceita um seletor ou uma lista de elementos já selecionada)
  const mark = (target, variant, { stagger = true, start = 0 } = {}) => {
    const els = typeof target === 'string' ? [...$$(target)] : [...target];
    els.forEach((el, i) => {
      if (el.classList.contains('reveal')) return; // já marcado por outra regra
      const index = start + (stagger ? i : 0);
      el.classList.add('reveal');
      if (variant) el.classList.add('reveal--' + variant);
      el.setAttribute('data-reveal-index', String(index));
      // Máscara/cortina: envolve o texto num span que desliza dentro do título
      if (variant === 'mask' || variant === 'curtain') {
        const inner = document.createElement('span');
        inner.className = 'case-mask-inner';
        inner.style.setProperty('--reveal-index', index);
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.appendChild(inner);
      }
    });
  };

  // --- Hero: palavras do título sobem por máscara; logo desce; subtítulo por último ---
  const hero = document.querySelector('.case-hero');
  if (hero) {
    const title = hero.querySelector('.case-hero__title');
    if (title && !reduceMotion) {
      const text = title.textContent.trim();
      const words = text.split(/\s+/);
      title.setAttribute('aria-label', text);
      title.textContent = '';
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'case-word';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--w', i);
        outer.appendChild(inner);
        title.appendChild(outer);
        if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
      });
    }
    hero.classList.add('is-motion');
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
  }

  // --- Títulos de seção (kickers) — o movimento depende de onde o título está ---
  //   à direita (Intro, colunas invertidas) → cortina da direita
  //   último elemento de uma coluna (Impacto) → zoom-out
  //   demais (à esquerda / largura cheia)     → sobe por máscara
  $$('.case-kicker').forEach((kicker) => {
    const parent = kicker.parentElement;
    let variant = 'mask';
    if (parent.classList.contains('case-intro') || parent.classList.contains('case-split--reverse')) variant = 'curtain';
    else if (parent.classList.contains('case-split') && kicker === parent.lastElementChild) variant = 'zoom';
    mark([kicker], variant, { start: variant === 'curtain' ? 1 : 0 });
  });
  // Títulos grandes que não são kicker (ex.: "Resultados Mensuráveis")
  mark('.case-section__inner > h2:not(.case-kicker)', 'mask');
  // Parágrafo de abertura logo depois de um kicker de largura cheia
  mark('.case-section__inner > .case-kicker + p', null, { start: 1 });

  // --- Blocos de texto (Contexto / O desafio / ...) entram da esquerda ---
  $$('.case-blocks').forEach((blocks) => mark($$('.case-block', blocks), 'left'));

  // --- Parágrafos de colunas de texto em cascata ---
  $$('.case-split__text').forEach((text) => mark($$('p', text), null, { start: 1 }));

  // --- Números (stats) com pop; papéis e cards em cascata ---
  $$('.case-stats-row').forEach((row) => mark($$('.case-stat', row), 'pop'));
  $$('.case-role-list').forEach((list) => mark($$('.case-role-item', list), null));
  $$('.case-result-cards').forEach((list) => mark($$('.case-result-card', list), 'left'));
  $$('.case-thumb-row').forEach((row) => mark($$('.case-thumb', row), 'pop'));

  // --- Pilares da Solução ---
  $$('.case-pillar, .cs-project').forEach((block) => {
    mark($$('.case-pillar__heading', block), null);
    mark($$('.case-pillar__text p', block), null, { start: 1 });
    mark($$('.case-pillar__media', block), 'scale', { stagger: false, start: 1 });
    mark($$('.case-project-card', block), 'scale', { stagger: false, start: 1 });
  });

  // --- Carrosséis e fileiras de telas: itens deslizam da direita, em cascata ---
  const carousels = $$('.case-carousel, .case-phone-row');
  carousels.forEach((carousel) => mark(carousel.children, 'right'));
  // Colagens que entram em grupo (itens cortados pela seção nunca ficariam 15% visíveis sozinhos)
  const groups = [...carousels, ...$$('.cl-thumbs')];
  $$('.cl-thumbs').forEach((group) => mark(group.children, 'pop'));

  // --- Disclaimer ---
  mark('.case-disclosure p:not(.case-thanks)', null);
  mark('.case-disclosure .case-thanks', 'right', { stagger: false, start: 2 });

  // Carrosséis: todos os itens entram juntos (em cascata) quando o carrossel aparece —
  // inclusive os que ainda estão fora da área visível ou só com uma fatia à mostra
  if ('IntersectionObserver' in window && !reduceMotion) {
    const carouselObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        [...entry.target.children].forEach((item) => {
          item.style.setProperty('--reveal-index', item.getAttribute('data-reveal-index'));
          item.classList.add('is-in');
        });
        carouselObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    groups.forEach((g) => carouselObserver.observe(g));
  }

  // Depois que a entrada termina, zera o atraso da cascata para o hover responder na hora
  carousels.forEach((carousel) => {
    [...carousel.children].forEach((item) => {
      item.addEventListener('transitionend', () => { item.style.transitionDelay = '0s'; }, { once: true });
    });
  });

  // --- Números que contam: "+10", "47", "23 min", "-62%" (usa .count de main.js) ---
  // Valores com vírgula/decimal ou fração ("2,1/5", "4.2/5") ficam como estão.
  $$('.case-stat__number, .case-result-card__number').forEach((el) => {
    const match = el.textContent.trim().match(/^(\D*?)(\d+)(%|\s.*)?$/);
    if (!match) return;
    const [, prefix, number, suffix = ''] = match;
    el.textContent = prefix;
    const count = document.createElement('span');
    count.className = 'count';
    count.setAttribute('data-count-to', number);
    count.textContent = number;
    el.appendChild(count);
    if (suffix) el.appendChild(document.createTextNode(suffix));
  });

  // --- Listas numeradas: item no centro da viewport em foco, os demais esmaecidos ---
  if (!reduceMotion && 'IntersectionObserver' in window) {
    $$('.case-numbered-list').forEach((list) => {
      const items = [...list.children];
      if (!items.length) return;
      list.classList.add('case-focus');
      items[0].classList.add('is-active');
      const focusObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          items.forEach((li) => li.classList.toggle('is-active', li === entry.target));
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach((li) => focusObserver.observe(li));
    });
  }

  // --- Carrosséis: arrastar com o mouse (touch/trackpad já rolam nativamente) ---
  carousels.forEach((carousel) => {
    carousel.classList.add('is-draggable');
    if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');
    if (!carousel.hasAttribute('role')) carousel.setAttribute('role', 'region');
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    carousel.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = carousel.scrollLeft;
    });
    carousel.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        carousel.classList.add('is-dragging');
        carousel.setPointerCapture(e.pointerId);
      }
      if (moved) carousel.scrollLeft = startScroll - dx;
    });
    const stop = () => {
      dragging = false;
      carousel.classList.remove('is-dragging');
    };
    carousel.addEventListener('pointerup', stop);
    carousel.addEventListener('pointercancel', stop);
    carousel.addEventListener('dragstart', (e) => e.preventDefault());

    // Setas do teclado quando o carrossel está em foco
    carousel.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const step = carousel.clientWidth * 0.6;
      carousel.scrollBy({ left: e.key === 'ArrowRight' ? step : -step, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();
