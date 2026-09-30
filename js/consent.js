// Gargi — Portfolio · consentimento (LGPD) + Google Tag Manager
//
// Carregado no <head>, de forma síncrona, ANTES de qualquer tag de medição.
// 1. Define o Consent Mode v2 com tudo negado por padrão.
// 2. Reaplica a escolha salva do visitante (se houver).
// 3. Carrega o GTM. GA4 e Hotjar ficam configurados DENTRO do GTM e só
//    disparam quando analytics_storage = granted.
// 4. Mostra o banner enquanto não houver escolha e expõe
//    window.gdConsent.open() para reabrir as preferências.
// 5. Envia eventos de interação (CV, contato, cases, idioma) para o dataLayer.

(function () {
  'use strict';

  // >>> Troque pelo ID do seu container (Google Tag Manager > Admin) <<<
  var GTM_ID = 'GTM-MXF85KZS';

  var STORAGE_KEY = 'gd_consent';
  var CONSENT_VERSION = 1; // aumente se mudar as categorias, para pedir consentimento de novo

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // ---------------------------------------------------------------
  // 1. Padrão: tudo negado, exceto o estritamente necessário
  // ---------------------------------------------------------------
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', false);

  // ---------------------------------------------------------------
  // 2. Escolha salva
  // ---------------------------------------------------------------
  function readChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      return c && c.v === CONSENT_VERSION ? c : null;
    } catch (e) { return null; }
  }

  function saveChoice(analytics) {
    var c = { v: CONSENT_VERSION, analytics: !!analytics, ts: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) { /* modo privado */ }
    return c;
  }

  function applyChoice(c, isUpdate) {
    gtag('consent', 'update', { analytics_storage: c.analytics ? 'granted' : 'denied' });
    window.dataLayer.push({
      event: isUpdate ? 'consent_update' : 'consent_restored',
      consent_analytics: c.analytics ? 'granted' : 'denied'
    });
  }

  function clearAnalyticsCookies() {
    // Remove cookies do GA (_ga, _ga_*) e do Hotjar (_hj*) quando o visitante revoga
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_hj)/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var saved = readChoice();
  if (saved) applyChoice(saved, false);

  // ---------------------------------------------------------------
  // 3. Google Tag Manager
  // ---------------------------------------------------------------
  if (GTM_ID && GTM_ID !== 'GTM-XXXXXXX') {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------
  // 4. Banner de cookies
  // ---------------------------------------------------------------
  var isEN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = isEN ? {
    label: 'Cookie preferences',
    title: 'Cookies and analytics',
    text: 'I use Google Analytics and Hotjar to understand how visitors use this portfolio, such as which cases get read and how far people scroll. Nothing is shared for advertising. You can change your choice at any time via "Cookie settings" in the footer.',
    accept: 'Accept',
    reject: 'Reject',
    settings: 'Cookie settings'
  } : {
    label: 'Preferências de cookies',
    title: 'Cookies e métricas',
    text: 'Uso Google Analytics e Hotjar para entender como as pessoas navegam neste portfólio, como quais cases são lidos e até onde a página é rolada. Nada é usado para publicidade. Você pode mudar sua escolha quando quiser em "Preferências de cookies", no rodapé.',
    accept: 'Aceitar',
    reject: 'Recusar',
    settings: 'Preferências de cookies'
  };

  var banner = null;
  var lastFocus = null;

  function buildBanner() {
    banner = document.createElement('section');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', T.label);
    banner.hidden = true;
    banner.innerHTML =
      '<div class="consent-banner__inner">' +
        '<div class="consent-banner__copy">' +
          '<h2 class="consent-banner__title">' + T.title + '</h2>' +
          '<p class="consent-banner__text">' + T.text + '</p>' +
        '</div>' +
        '<div class="consent-banner__actions">' +
          '<button type="button" class="consent-btn consent-btn--ghost" data-consent="reject">' + T.reject + '</button>' +
          '<button type="button" class="consent-btn consent-btn--solid" data-consent="accept">' + T.accept + '</button>' +
        '</div>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var accepted = btn.getAttribute('data-consent') === 'accept';
      var c = saveChoice(accepted);
      applyChoice(c, true);
      if (!accepted) clearAnalyticsCookies();
      close();
    });
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && readChoice()) close();
    });
    document.body.appendChild(banner);
  }

  // moveFocus: só quando o visitante abre pelo rodapé; na primeira visita o
  // banner aparece sem roubar o foco (o skip-link continua sendo o 1º Tab)
  function open(moveFocus) {
    if (!banner) buildBanner();
    lastFocus = document.activeElement;
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add('is-open'); });
    if (moveFocus === true) {
      var first = banner.querySelector('[data-consent="reject"]');
      if (first) first.focus({ preventScroll: true });
    }
  }

  function close() {
    if (!banner) return;
    banner.classList.remove('is-open');
    banner.hidden = true;
    if (lastFocus && lastFocus.focus && lastFocus !== document.body) lastFocus.focus({ preventScroll: true });
  }

  function addFooterLink() {
    var contact = document.querySelector('.footer-contact');
    if (!contact || contact.querySelector('.footer-contact__item--cookies')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'footer-contact__item footer-contact__item--cookies';
    b.innerHTML = '<span>' + T.settings + '</span>';
    b.addEventListener('click', function () { open(true); });
    contact.appendChild(b);
  }

  // ---------------------------------------------------------------
  // 5. Eventos de interação → dataLayer
  //    (no GTM: acionador "Evento personalizado" com o nome do evento)
  // ---------------------------------------------------------------
  function track(name, params) {
    var data = { event: name, page_language: isEN ? 'en' : 'pt-BR' };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) data[k] = params[k];
    window.dataLayer.push(data);
  }

  function linkLocation(el) {
    if (el.closest('.site-header')) return 'header';
    if (el.closest('.site-footer')) return 'footer';
    if (el.closest('.case-card')) return 'case_card';
    if (el.closest('.section-resume')) return 'resume';
    return 'content';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var loc = linkLocation(el);

    if (el.hasAttribute('download') || /\.pdf($|\?)/i.test(href)) {
      track('cv_download', { link_location: loc, file_name: href.split('/').pop() });
    } else if (href.indexOf('wa.me') !== -1) {
      track('contact_click', { contact_method: 'whatsapp', link_location: loc });
    } else if (href.indexOf('linkedin.com') !== -1) {
      track('contact_click', { contact_method: 'linkedin', link_location: loc });
    } else if (el.id === 'copyEmail') {
      track('contact_click', { contact_method: 'email_copy', link_location: loc });
    } else if (el.id === 'langToggle') {
      track('language_switch', { to_language: isEN ? 'pt-BR' : 'en' });
    } else {
      var m = href.match(/case-([a-z0-9-]+)\.html/i);
      if (m) track('case_open', { case_name: m[1], link_location: loc });
    }
  }, true);

  // Leitura de case: 90% da página rolada (GA4 já mede scroll geral; aqui fica por case)
  var caseMatch = location.pathname.match(/case-([a-z0-9-]+)\.html/i);
  if (caseMatch) {
    var fired = false;
    window.addEventListener('scroll', function onScroll() {
      if (fired) return;
      var doc = document.documentElement;
      var ratio = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      if (ratio >= 0.9) {
        fired = true;
        track('case_read_complete', { case_name: caseMatch[1] });
        window.removeEventListener('scroll', onScroll);
      }
    }, { passive: true });
  }

  function init() {
    addFooterLink();
    if (!readChoice()) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.gdConsent = { open: function () { open(true); }, get: readChoice };
})();
