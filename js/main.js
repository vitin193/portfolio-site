// Gargi — Portfolio · interações da Home (PT-BR)

document.addEventListener('DOMContentLoaded', () => {
  // Alternância de idioma → navega para a versão em inglês
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      window.location.href = '/en/';
    });
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
