# LP Gates2B

Landing page da **Gates2B — Infraestrutura de Monetização Global**.
Astro + Tailwind CSS v4 + GSAP (ScrollTrigger, SplitText).

**Lighthouse:** 100/100/100/100 no desktop · 99/100/100/100 no mobile.

---

## Rodar o projeto

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera ./dist (site estático)
npm run preview   # serve o build
```

### Verificar antes de publicar

```bash
npm i -D playwright        # uma vez
npm run build && npm run preview     # em outro terminal
npm run check                        # roda os dois abaixo
```

**`npm run check:responsivo`** — 11 larguras, de 320 a 1920 px. Falha se
encontrar estouro horizontal, texto abaixo de 11 px ou erro de console.

**`npm run check:comportamento`** — 23 asserções de interação: menu mobile como
diálogo (foco entra, Tab circula, ESC devolve o foco, fundo travado), âncoras,
tabs por teclado, resize entre desktop e mobile na seção pinada, deep link,
timers que precisam parar fora da tela e scroll rápido de ida e volta.
Cada asserção nasceu de um bug real; os comentários no script dizem qual.

**Por que isso importa mais do que parece:** se qualquer elemento for mais
largo que a viewport, o Safari no iOS não mostra barra de rolagem horizontal —
ele reduz o zoom até a página caber. O resultado é a página inteira minúscula e
ilegível no celular, sem nada de óbvio errado no código.

Duas armadilhas escondem esse bug de quem testa:

1. O `overflow-x: clip` no `body` (que este projeto usa) faz
   `documentElement.scrollWidth` reportar a largura já cortada. O teste passa e
   o celular continua quebrado. O script remove o clip antes de medir.
2. Emular celular só estreitando a janela **não reproduz** o comportamento. É
   preciso `isMobile: true`, que liga a viewport de layout móvel. Foi
   exatamente por não usar isso que um estouro na topbar em 1024 px passou
   despercebido por várias revisões.

Requer Node 18.20+ (recomendado Node 22).

O `build` gera um site 100% estático — pode ser publicado em Vercel, Netlify,
Cloudflare Pages, S3 ou qualquer servidor de arquivos.

---

## Onde editar

### Todo o texto da página

`src/data/content.ts` — **um único arquivo** com o copy de todas as seções.
Alterar um título, um parágrafo ou um item de lista aqui reflete na página
inteira. Nenhum texto está escrito direto nos componentes.

### Cores, tipografia, espaçamento

`src/styles/global.css`, bloco `@theme`. É o design system.

| Token | Valor | Origem |
|---|---|---|
| `--color-brand` / `--color-brand-500` | `#345ba6` | cor oficial da marca (brandbook) |
| `--color-brand-50 … 950` | derivações tonais | escala de interface |
| `--color-ink-950 … 600` | `#04060c` → `#1f2634` | superfícies escuras |
| `--color-paper` / `-100` / `-200` / `-300` | branco → `#e2e7f0` | superfícies claras |
| `--font-display` | Space Grotesk | títulos (brandbook) |
| `--font-sans` | Fustat | corpo, apoio, legendas (brandbook) |
| `--radius-card` | `20px` | cards |
| `--ease-brand` | `cubic-bezier(.22,1,.36,1)` | curva padrão das transições |

Classes utilitárias de marca no mesmo arquivo: `.display-xl`, `.display-lg`,
`.display-md`, `.lead`, `.btn` (+ variantes), `.card-dark`, `.card-light`,
`.eyebrow`, `.texture`, `.grid-lines`, `.container-lp`.

### Animações

`src/scripts/motion-core.js` — todo o movimento da página em um só lugar,
dirigido por `data-*` no HTML. Nenhum componente tem JS próprio.
`src/scripts/motion.js` é só o carregador (1,6 KB): busca o motor quando o
navegador fica ocioso ou na primeira interação, tirando o GSAP do caminho
crítico de renderização.

A entrada do hero **não** usa GSAP — é CSS puro, em `global.css`. O hero é o
conteúdo do LCP; se dependesse do bundle, o título só pintaria depois de
130 KB de JavaScript. Ao mexer no hero, mantenha as animações em CSS.

O scroll é o **nativo do navegador**. Não há biblioteca de smooth scroll: elas
introduzem latência entre o gesto e a tela, atrapalham o teclado e brigam com
as seções pinadas.

| Atributo | Efeito |
|---|---|
| `data-split="lines\|words\|chars"` | revelação tipográfica com máscara (SplitText) |
| `data-anim="fade-up\|fade\|scale-in\|clip-up"` | entrada no scroll (+ `data-delay`) |
| `data-stagger-group="0.1"` | filhos `[data-anim]` entram em cascata |
| `data-counter` | contador numérico (+ `data-value`, `data-decimals`, `data-prefix`, `data-suffix`) |
| `data-parallax` | deslocamento no scroll (+ `data-parallax-amount`) |
| `data-rail` / `data-rail-track` / `data-rail-card` | scroll horizontal pinado (Como funciona) |
| `data-marquee` | faixa infinita (+ `data-speed`, `data-direction`) |
| `--dim` (variável CSS) | véu que escurece as cartas inativas do trilho |
| `data-magnetic="0.2"` | botão que é atraído pelo cursor |
| `data-tilt="5"` | card com inclinação 3D no hover |
| `data-modules` / `data-module` | painel operacional com módulos acendendo em sequência |
| `data-stream` / `data-stream-row` | fluxo de eventos em rotação contínua |
| `data-terminal` / `data-terminal-line` | digitação de terminal |
| `data-sticky-list` / `data-sticky-item` | lista com item ativo conforme o scroll |
| `data-orbit` / `data-orbit-chip` | moedas em órbita (Operação global) |
| `data-tabs` / `data-tab-btn` / `data-tab-panel` | alternância de painéis de código |
| `data-draw` | traço de SVG desenhado no scroll |
| `data-theme-section="light"` | avisa a navegação que a seção é clara (logo e links invertem) |

Tudo respeita `prefers-reduced-motion: reduce` — com a preferência ativa, o
conteúdo aparece estático e as animações de entrada são desligadas.

---

## Estrutura

```
public/
  fonts/    Space Grotesk + Fustat (variable, woff2, self-hosted)
  img/      imagens tratadas nas cores da marca (webp) + textura pixelada
  logos/    logos e ícones oficiais (svg)
src/
  data/content.ts            todo o copy
  styles/global.css          design system (tokens + utilitários)
  scripts/motion.js          carregador (adia o GSAP)
  scripts/motion-core.js     sistema de animação
  layouts/Base.astro         head, SEO, OG, JSON-LD, preloads
  components/
    Nav.astro                navegação + menu mobile + tema claro/escuro
    Footer.astro
    Icon.astro
    sections/                14 seções, na ordem da página
src/pages/index.astro        monta as seções
```

Ordem das seções: Hero → Visibilidade → Produto → Números → Como Funciona →
Infraestrutura → Operação Global → Desenvolvimento Contemporâneo → API-First →
Segurança → Para Quem É → Depoimentos → Documentação → CTA Final.

---

## Performance

Medido com Lighthouse (mobile: 4x CPU + 4G lento; desktop: sem throttling).

| | Mobile | Desktop |
|---|---|---|
| Performance | 99 | 100 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 1,1 s | 0,3 s |
| LCP | 2,0 s | 0,5 s |
| Speed Index | 1,4 s | 0,9 s |
| TBT | 0 ms | 0 ms |
| CLS | 0 | 0 |

O que sustenta esses números — mexer nestes pontos é o que derruba a nota:

1. **A entrada do hero é CSS, não GSAP.** Move para JS e o LCP triplica.
2. **O CSS é injetado inline no HTML** (`inlineStylesheets: 'always'`). Uma
   requisição bloqueante a menos no caminho crítico.
3. **O GSAP carrega fora do caminho crítico**, por `requestIdleCallback` ou na
   primeira interação, e a inicialização é fatiada com `yieldToMain()` para não
   criar uma tarefa longa. É o que mantém o TBT em zero.
4. **O SplitText roda por seção**, quando o título chega perto da viewport —
   não nos 12 títulos de uma vez no boot.
5. **A imagem do hero tem `preload` com `fetchpriority="high"`.** O
   `imagesrcset`/`imagesizes` do preload precisa ser idêntico ao do `<img>` em
   `Hero.astro` — se divergirem, o navegador baixa duas variantes.
6. **Fontes com subset latino** (51 KB no total, contra 113 KB do arquivo
   completo), self-hosted, com `preload`.
7. **Toda imagem tem `width`/`height`**, inclusive os SVGs. É o que mantém o
   CLS em zero.
8. **Imagens responsivas com `srcset` + `sizes`.** O hero tem cinco larguras
   (640 a 2400 px). Um celular de 412 px com DPR 1,75 pede ~720 px e recebe a
   variante de 900: 25 KB em vez de 65 KB, no elemento mais crítico da página.

### Medido e descartado — não vale reintroduzir

Duas otimizações plausíveis foram testadas com 5 amostras cada (mobile) e
revertidas por não sustentarem ganho:

- **Embutir a fonte do título em base64 no CSS,** para tirar o `@font-face` do
  caminho crítico do LCP. Custava 14 KB no HTML e não mudou o resultado: o
  arquivo externo já chegava em 148 ms, antes do primeiro paint. O FCP
  observado piorou (377 ms contra 312 ms) por causa do HTML maior.
- **Encurtar a intro do hero** (atrasos de 0,15 s para 0,06 s). LCP observado
  de 325 ms contra 312 ms — dentro do ruído. Não compensa mexer na coreografia
  por isso.

A folga real que sobra é o CSS: ~50 KB crus de utilitários de fato usados.
Reduzir exige consolidar classes repetidas em componentes, com risco de
regressão visual nas 14 seções. Em produção, Vercel e Netlify servem Brotli, o
que já leva o HTML de ~26 KB (gzip) para ~21 KB sem tocar no código.

Vale separar o número simulado do real: **sem throttling, FCP e LCP observados
são ambos ~300 ms, no mesmo frame.** Os 2,0 s da tabela são a projeção do
Lighthouse para 4G lento com CPU quatro vezes mais devagar.

### Cache

Os headers estão prontos para as três plataformas comuns:

- `public/_headers` — Netlify e Cloudflare Pages
- `vercel.json` — Vercel
- `netlify.toml` — build e limiar de Lighthouse no CI

A política: `/_astro/*` (versionado por hash), `/fonts/*`, `/img/*` e
`/logos/*` com `max-age=31536000, immutable`; o HTML com
`max-age=0, must-revalidate`, para que um deploy novo apareça na hora.

**Consequência prática:** fontes, imagens e logos são imutáveis por um ano.
Ao trocar uma arte ou uma fonte, **renomeie o arquivo** — sobrescrever com o
mesmo nome deixa o cache do visitante servindo a versão antiga.

---

## Assets

**Fontes** — Space Grotesk e Fustat convertidas dos TTF variáveis para `woff2`
e reduzidas ao alfabeto latino com `pyftsubset` (25 KB e 26 KB; os arquivos
completos tinham 47 KB e 66 KB). O eixo `wght` variável foi preservado, então
todos os pesos continuam disponíveis. Self-hosted, com `preload` no `<head>`.
Sem chamadas a CDN de fontes.

Para regerar o subset após trocar uma fonte:

```bash
pyftsubset fonte.woff2 --output-file=fonte.subset.woff2 --flavor=woff2 \
  --layout-features='*' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122'
```

**Imagens** — as fotos de Fórmula 1 receberam tratamento duotone nas cores da
marca (sombra `#060b1a`, luz `#a8c4ee`), conforme o estilo fotográfico do
brandbook: F1 sem pessoas, apenas os automóveis. As fotos de pessoas em
ambiente profissional levaram um grade azul leve (30%), preservando tom de
pele natural. Tudo exportado em WebP em duas larguras.

**Textura** — o pattern pixelado do brandbook é aplicado pela classe
`.texture` sempre em opacidade baixa (4,5%) e `mix-blend-mode: overlay`, nunca
como elemento de destaque.

Para regerar imagens a partir de novos originais, o tratamento é: converter
para luminância, aplicar contraste ~1.15, mapear em duotone e misturar 78–85%
com o original.

---

## Notas de implementação

- **`z-index` em fundos de seção:** use `z-0` nos wrappers de imagem de fundo,
  nunca `-z-10`. Índice negativo joga o elemento para trás do próprio
  `background-color` da seção e a imagem desaparece.
- **Máscaras do SplitText:** `.split-line` tem `padding-bottom: .14em` com
  margem negativa equivalente, senão a máscara corta descendentes (g, q, ç)
  em títulos com `line-height` apertado.
- **Grid + conteúdo largo:** colunas que contêm código ou marquee usam
  `minmax(0,1fr)` e `min-w-0`, senão o `max-content` do filho estoura o
  layout e cria scroll horizontal.
- **Animações no hero:** entram na carga da página, não no scroll — o que está
  logo abaixo da linha de gatilho nunca dispararia.
- Verificado sem overflow horizontal em 390, 768, 1024, 1280, 1440 e 1920 px,
  e sem erros de console.

---

## Pendências para produção

1. Substituir os `href="#contato"` por formulário real ou link de agendamento.
2. Apontar os CTAs de documentação para a URL real da doc.
3. Trocar as métricas da seção Números pelos números auditados.
4. Depoimentos: confirmar autorização de uso das citações e das fotos
   (as imagens atuais são de banco e representam o estilo, não os depoentes).
5. Configurar o domínio final em `astro.config.mjs` (`site`) — ele alimenta o
   canonical, o Open Graph e o sitemap. Trocar também a URL em
   `public/robots.txt`.
7. Configurar analytics. Se usar script de terceiros, carregue com `defer` ou
   após interação: um único script síncrono derruba a nota de performance.
8. Revisar contraste do texto secundário sobre fundo escuro. Os cinzas entre
   25% e 45% de branco ficam abaixo de 4,5:1 e uma auditoria manual os
   apontaria. O Lighthouse não os pega porque, no momento da medição, esses
   elementos ainda estão em `opacity: 0` esperando a animação de entrada.
