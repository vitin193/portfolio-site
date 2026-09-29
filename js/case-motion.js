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

  // --- Carrosséis: arrasto com inércia + slider minimalista ---
  // Sem scroll-snap: o "proximity" puxava o carrossel de volta ao soltar o
  // arrasto (o tranco que dava a sensação de travado). No lugar, o arrasto do
  // mouse continua deslizando e desacelera; setas/teclado vão de tela em tela.
  const isEn = document.documentElement.lang.startsWith('en');
  const label = isEn
    ? { prev: 'Previous', next: 'Next', slider: 'Carousel position' }
    : { prev: 'Anterior', next: 'Próximo', slider: 'Posição do carrossel' };
  const arrow = (d) => '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="' + d +
    '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  carousels.forEach((carousel) => {
    carousel.classList.add('is-draggable');
    if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');
    if (!carousel.hasAttribute('role')) carousel.setAttribute('role', 'region');
    const items = [...carousel.children];
    const behavior = reduceMotion ? 'auto' : 'smooth';

    // Imagens lazy num contêiner horizontal só carregavam (e decodificavam)
    // no meio do deslize; carrega tudo um pouco antes do carrossel aparecer
    const imgs = [...carousel.querySelectorAll('img')];
    imgs.forEach((img) => { img.decoding = 'async'; });
    if ('IntersectionObserver' in window) {
      const preload = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        imgs.forEach((img) => { img.loading = 'eager'; });
        preload.disconnect();
      }, { rootMargin: '600px 0px' });
      preload.observe(carousel);
    }

    // --- Slider: trilho fino com a fatia visível + setas ---
    const slider = document.createElement('div');
    slider.className = 'case-slider';
    slider.innerHTML =
      '<div class="case-slider__track" role="scrollbar" aria-label="' + label.slider + '" aria-orientation="horizontal"' +
        ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="case-slider__thumb"></span></div>' +
      '<div class="case-slider__nav">' +
        '<button type="button" class="case-slider__btn" aria-label="' + label.prev + '">' + arrow('M12 4 6 10l6 6') + '</button>' +
        '<button type="button" class="case-slider__btn" aria-label="' + label.next + '">' + arrow('M8 4l6 6-6 6') + '</button>' +
      '</div>';
    carousel.after(slider);
    const track = slider.querySelector('.case-slider__track');
    const thumb = slider.querySelector('.case-slider__thumb');
    const [prevBtn, nextBtn] = slider.querySelectorAll('.case-slider__btn');

    const maxScroll = () => carousel.scrollWidth - carousel.clientWidth;
    let thumbW = 0;
    let trackW = 0;
    let painting = false;
    const paint = () => {
      painting = false;
      const max = maxScroll();
      const p = max > 0 ? Math.min(1, Math.max(0, carousel.scrollLeft / max)) : 0;
      thumb.style.transform = 'translateX(' + p * (trackW - thumbW) + 'px)';
      track.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      prevBtn.disabled = carousel.scrollLeft <= 1;
      nextBtn.disabled = carousel.scrollLeft >= max - 1;
    };
    const layout = () => {
      slider.hidden = maxScroll() <= 1;
      trackW = track.clientWidth;
      const ratio = carousel.scrollWidth ? carousel.clientWidth / carousel.scrollWidth : 1;
      thumbW = Math.max(40, trackW * Math.min(1, ratio));
      thumb.style.width = thumbW + 'px';
      paint();
    };

    // Enquanto rola, o hover das telas fica desligado (elas passavam sob o
    // cursor parado e ficavam subindo/descendo durante o deslize)
    let scrollIdle;
    carousel.addEventListener('scroll', () => {
      if (!painting) { painting = true; requestAnimationFrame(paint); }
      carousel.classList.add('is-scrolling');
      clearTimeout(scrollIdle);
      scrollIdle = setTimeout(() => carousel.classList.remove('is-scrolling'), 160);
    }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(carousel);
    window.addEventListener('resize', layout);
    imgs.forEach((img) => img.addEventListener('load', layout));
    layout();

    // Posição de cada item dentro do carrossel (independe do offsetParent)
    const itemLeft = (item) =>
      item.getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft -
      (parseFloat(getComputedStyle(carousel).paddingLeft) || 0);
    const step = (dir) => {
      stopGlide();
      const x = carousel.scrollLeft;
      const lefts = items.map(itemLeft);
      const target = dir > 0 ? lefts.find((l) => l > x + 2) : lefts.reverse().find((l) => l < x - 2);
      carousel.scrollTo({ left: target === undefined ? (dir > 0 ? maxScroll() : 0) : target, behavior });
    };
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    carousel.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    });

    // Trilho: clicar/arrastar move o carrossel na hora
    const scrollFromTrack = (clientX, grab) => {
      const p = (clientX - track.getBoundingClientRect().left - grab) / Math.max(1, trackW - thumbW);
      carousel.scrollLeft = Math.min(1, Math.max(0, p)) * maxScroll();
    };
    track.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      stopGlide();
      const thumbRect = thumb.getBoundingClientRect();
      const onThumb = e.clientX >= thumbRect.left && e.clientX <= thumbRect.right;
      const grab = onThumb ? e.clientX - thumbRect.left : thumbW / 2;
      track.setPointerCapture(e.pointerId);
      slider.classList.add('is-active');
      scrollFromTrack(e.clientX, grab);
      const move = (ev) => scrollFromTrack(ev.clientX, grab);
      const up = () => {
        slider.classList.remove('is-active');
        track.removeEventListener('pointermove', move);
        track.removeEventListener('pointerup', up);
        track.removeEventListener('pointercancel', up);
      };
      track.addEventListener('pointermove', move);
      track.addEventListener('pointerup', up);
      track.addEventListener('pointercancel', up);
    });

    // --- Arrasto com o mouse + inércia (touch/trackpad já rolam nativamente) ---
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    let samples = [];
    let glideFrame = 0;
    function stopGlide() { cancelAnimationFrame(glideFrame); glideFrame = 0; }
    const glide = (velocity) => { // px/ms
      let v = velocity;
      let last = performance.now();
      const frame = (now) => {
        const dt = Math.max(0, Math.min(32, now - last));
        last = now;
        carousel.scrollLeft -= v * dt;
        v *= Math.pow(0.994, dt); // atrito (~0,9 por quadro de 16ms)
        const atEdge = carousel.scrollLeft <= 0 || carousel.scrollLeft >= maxScroll() - 1;
        glideFrame = Math.abs(v) > 0.02 && !atEdge ? requestAnimationFrame(frame) : 0;
      };
      glideFrame = requestAnimationFrame(frame);
    };

    carousel.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide();
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = carousel.scrollLeft;
      samples = [{ x: e.clientX, t: e.timeStamp }];
    });
    carousel.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        carousel.classList.add('is-dragging');
        carousel.setPointerCapture(e.pointerId);
      }
      if (!moved) return;
      carousel.scrollLeft = startScroll - dx;
      samples.push({ x: e.clientX, t: e.timeStamp });
      if (samples.length > 6) samples.shift();
    });
    const stop = (e) => {
      if (!dragging) return;
      dragging = false;
      carousel.classList.remove('is-dragging');
      if (!moved || reduceMotion) return;
      // velocidade dos últimos ~100ms; se o mouse parou antes de soltar, não desliza
      const recent = samples.filter((s) => e.timeStamp - s.t < 100);
      if (recent.length < 2) return;
      const first = recent[0];
      const last = recent[recent.length - 1];
      const v = (last.x - first.x) / Math.max(1, last.t - first.t);
      if (Math.abs(v) > 0.1) glide(Math.max(-4, Math.min(4, v)));
    };
    carousel.addEventListener('pointerup', stop);
    carousel.addEventListener('pointercancel', stop);
    carousel.addEventListener('wheel', stopGlide, { passive: true });
    carousel.addEventListener('touchstart', stopGlide, { passive: true });
    carousel.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();
