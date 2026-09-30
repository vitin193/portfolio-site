# Gargi — Portfolio

Site estático (HTML, CSS e JavaScript puros, sem build) do portfólio de Victor Gargi, em português e inglês.

## Estrutura

```
index.html                 Home (PT-BR)
case-volkswagen.html       Case Volkswagen Caminhões e Ônibus
case-peterson.html         Case Control Union / Peterson Solutions
case-claro.html            Case Claro Pay Empresas
en/                        As mesmas páginas em inglês
css/style.css              Estilos globais (header, menu mobile, home, footer)
css/case.css               Estilos das páginas de case (template cs-*, VW, cu-*, cl-*)
js/main.js                 Interações globais (idioma, menu, dropdown, scroll-reveal, contadores)
js/case-motion.js          Micro-interações das páginas de case (carregado antes de main.js)
assets/                    Fontes, imagens e currículo (PDF)
```

Fonte de verdade do layout: Figma "gargiPortfolio2026" (frames 01 - Volkswagen, 02 - CaseControlUnion, 03 - CaseClaro).

## Publicação

O site precisa ser servido **na raiz do domínio** (ex.: `https://seudominio.com/`), porque os links de navegação e a troca de idioma usam caminhos absolutos (`/`, `/en/`).

Qualquer hospedagem de site estático funciona. A pasta publicada é a raiz deste repositório (onde está o `index.html`).

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `master` / `(root)`. Para o domínio próprio, preencha "Custom domain" (o GitHub cria o arquivo `CNAME`) e configure o DNS do domínio conforme a documentação do GitHub Pages.
- **Netlify / Vercel / Cloudflare Pages:** importe o repositório, sem comando de build e com diretório de publicação `/`. Depois adicione o domínio nas configurações do projeto.

## Testar localmente

Como os links são absolutos, abra por um servidor local (e não direto pelo arquivo):

```
python -m http.server 8000
```

e acesse `http://localhost:8000`.

## Monitoramento (GTM, GA4, Hotjar) e LGPD

Arquivos: `js/consent.js` (carregado no `<head>` de todas as páginas) e `css/consent.css`.

Como funciona:

1. O Consent Mode v2 começa com tudo **negado**. Nada de GA4 ou Hotjar grava cookie antes do aceite.
2. Um banner (PT ou EN, conforme o `lang` da página) pede o consentimento. Recusar e aceitar têm o mesmo peso visual.
3. A escolha fica no `localStorage` (`gd_consent`) e pode ser mudada pelo link "Preferências de cookies" / "Cookie settings" que o script adiciona no rodapé. Ao recusar, os cookies `_ga*` e `_hj*` são apagados.
4. O GTM carrega sempre; GA4 e Hotjar ficam **dentro do GTM** e só disparam com `analytics_storage = granted`.

### IDs

- GA4 (ID da métrica): `G-Q5C6J3K75F`. Fica no GTM, como a variável do tipo Permanente (Constant) `GA4 ID`, e não no código.
- GTM: `GTM_ID` no topo de `js/consent.js` (ainda `GTM-XXXXXXX`).
- Hotjar: Site ID configurado na tag "Hotjar Tracking Code" do GTM.

### Configuração no GTM (resumo)

- **GA4 - Google tag**: ID `{{GA4 ID}}`; acionadores *Initialization - All Pages* + *CE - consent_update*; disparo *Uma vez por página*; consentimento adicional `analytics_storage`.
- **GA4 - eventos do site**: evento GA4 com nome `{{Event}}` e os parâmetros abaixo vindos de variáveis da camada de dados; acionador *CE - eventos do site* (regex `^(case_open|case_read_complete|cv_download|contact_click|language_switch)$`); consentimento adicional `analytics_storage`.
- **Hotjar**: template *Hotjar Tracking Code*; acionadores *All Pages* + *CE - consent_update*; *Uma vez por página*; consentimento adicional `analytics_storage`.
- Em Administrador > Configurações do contêiner, *Ativar visão geral do consentimento*.

Eventos enviados ao `dataLayer`:

| Evento | Parâmetros |
|---|---|
| `case_open` | `case_name`, `link_location` |
| `case_read_complete` | `case_name` (90% da página do case rolada) |
| `cv_download` | `file_name`, `link_location` |
| `contact_click` | `contact_method` (whatsapp, linkedin, email_copy), `link_location` |
| `language_switch` | `to_language` |

Todos levam também `page_language`. No GA4, `cv_download` e `contact_click` são eventos-chave, e os parâmetros são registrados como dimensões personalizadas (escopo Evento).

Validar com o modo Visualizar do GTM (funciona com `http://localhost:8000`) e o DebugView do GA4.
