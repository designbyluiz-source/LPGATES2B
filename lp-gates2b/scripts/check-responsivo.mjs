/**
 * Verificação de responsividade — guarda contra a página virar "desktop
 * encolhido" no celular.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * Se qualquer elemento for mais largo que a viewport, o Safari no iOS (e o
 * Chrome no Android) faz *shrink-to-fit*: em vez de mostrar barra de rolagem
 * horizontal, ele diminui o zoom até a página caber. O resultado é a página
 * inteira minúscula e ilegível — e nada no código parece errado.
 *
 * Duas armadilhas tornam isso difícil de pegar:
 *
 *   1. `overflow-x: clip` no body (que este projeto usa) esconde o estouro de
 *      `documentElement.scrollWidth`. O teste passa e o celular continua
 *      quebrado. Aqui a checagem remove o clip antes de medir.
 *
 *   2. Emular mobile só encolhendo a viewport NÃO reproduz o comportamento.
 *      É preciso `isMobile: true`, que liga a viewport de layout móvel. Sem
 *      isso o shrink-to-fit nunca acontece no teste.
 *
 * COMO RODAR
 *
 *   npm i -D playwright        # uma vez
 *   npm run build && npm run preview   # em outro terminal
 *   npm run check:responsivo
 *
 * Sai com código 1 se encontrar estouro, para poder usar em CI.
 */

import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:4321/';
const LARGURAS = [320, 360, 390, 414, 480, 640, 768, 1024, 1280, 1440, 1920];
const FONTE_MINIMA = 11; // px — abaixo disso não se lê num celular

let falhas = 0;

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});

for (const largura of LARGURAS) {
  const mobile = largura < 1024;
  const ctx = await browser.newContext({
    viewport: { width: largura, height: 800 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await ctx.newPage();

  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // percorre a página toda: seções abaixo da dobra só montam ao entrar na tela
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  const r = await page.evaluate((fonteMinima) => {
    const de = document.documentElement;

    // remove o clip para desmascarar o estouro real
    const antes = [document.body.style.overflowX, de.style.overflowX];
    document.body.style.overflowX = 'visible';
    de.style.overflowX = 'visible';
    const scrollWidthSemClip = de.scrollWidth;

    const estouros = [];
    document.querySelectorAll('body *').forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (rc.right <= innerWidth + 1) return;
      // ignora quem tem ancestral que corta — esses não empurram a viewport
      let a = el.parentElement;
      while (a && a !== de) {
        const s = getComputedStyle(a);
        if (s.overflowX === 'hidden' || s.overflowX === 'clip' || s.overflow === 'hidden') return;
        a = a.parentElement;
      }
      estouros.push(
        `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} (direita: ${Math.round(rc.right)}px)`
      );
    });

    document.body.style.overflowX = antes[0];
    de.style.overflowX = antes[1];

    // textos abaixo do piso de legibilidade
    const miudos = [];
    document.querySelectorAll('p,li,span,a,h1,h2,h3,h4,blockquote,button').forEach((el) => {
      if (!el.textContent.trim()) return;
      if (el.querySelector('*')) return; // só folhas, para não contar duas vezes
      const rc = el.getBoundingClientRect();
      if (rc.width === 0) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < fonteMinima) miudos.push(`${fs}px "${el.textContent.trim().slice(0, 20)}"`);
    });

    return {
      scrollWidthSemClip,
      clientWidth: de.clientWidth,
      estouros: [...new Set(estouros)].slice(0, 8),
      miudos: [...new Set(miudos)].slice(0, 5),
    };
  }, FONTE_MINIMA);

  const estourou = r.scrollWidthSemClip > r.clientWidth + 1 || r.estouros.length > 0;
  const marca = estourou ? '✗' : '✓';
  console.log(
    `${marca} ${String(largura).padStart(4)}px  largura real ${String(r.scrollWidthSemClip).padStart(5)}px` +
      (mobile ? '  [mobile]' : '')
  );

  if (estourou) {
    falhas++;
    r.estouros.forEach((e) => console.log(`      estoura: ${e}`));
  }
  if (r.miudos.length) {
    falhas++;
    r.miudos.forEach((m) => console.log(`      fonte < ${FONTE_MINIMA}px: ${m}`));
  }
  if (erros.length) {
    falhas++;
    [...new Set(erros)].slice(0, 3).forEach((e) => console.log(`      erro de console: ${e.slice(0, 90)}`));
  }

  await ctx.close();
}

await browser.close();

if (falhas) {
  console.log(`\n${falhas} problema(s). Estouro horizontal faz o celular reduzir o zoom da página inteira.`);
  process.exit(1);
}
console.log('\nSem estouro horizontal, sem fonte ilegível, sem erro de console.');
