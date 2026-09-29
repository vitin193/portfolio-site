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
