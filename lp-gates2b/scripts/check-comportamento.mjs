/**
 * Verificação de comportamento — interação, teclado, resize, deep link e timers.
 *
 * Complementa o check-responsivo.mjs: aquele cuida de layout, este cuida do que
 * a página FAZ. Cada item aqui nasceu de um bug real encontrado nesta LP; os
 * comentários dizem qual, para que a intenção não se perca.
 *
 * COMO RODAR
 *
 *   npm i -D playwright        # uma vez
 *   npm run build && npm run preview   # em outro terminal
 *   npm run check:comportamento
 *
 * Sai com código 1 se algo falhar, para poder usar em CI.
 */

import { chromium, devices } from 'playwright';

const URL = process.env.URL || 'http://localhost:4321/';
const CHROME = process.env.CHROME_PATH;

const resultados = [];
/** afirma(descrição do comportamento CORRETO, passou, detalhe se falhar) */
const afirma = (descricao, passou, detalhe = '') => resultados.push({ descricao, passou, detalhe });

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  ...(CHROME ? { executablePath: CHROME } : {}),
});

const bloco = async (nome, fn) => {
  try {
    await fn();
  } catch (e) {
    afirma(`[bloco "${nome}"] roda sem exceção`, false, e.message.split('\n')[0].slice(0, 120));
  }
};

/* ═════════════════════ 1. MENU MOBILE (comporta-se como diálogo) ═════════════════════ */
await bloco('menu mobile', async () => {
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);

  // BUG ORIGINAL: os 8 links do painel fechado recebiam Tab — o teclado passeava
  // por um menu invisível antes de chegar ao conteúdo. Resolvido com `inert`.
  await p.evaluate(() => document.body.focus());
  let paradasNoPainel = 0;
  for (let i = 0; i < 28; i++) {
    await p.keyboard.press('Tab');
    if (await p.evaluate(() => document.querySelector('[data-menu-panel]').contains(document.activeElement)))
      paradasNoPainel++;
  }
  afirma('menu fechado não recebe foco do teclado', paradasNoPainel === 0, `${paradasNoPainel} parada(s) do Tab`);

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(900);
  await p.click('[data-menu-toggle]');
  await p.waitForTimeout(1100);

  const aberto = await p.evaluate(() => ({
    aria: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
    lock: document.documentElement.classList.contains('menu-open'),
    focoDentro: document.querySelector('[data-menu-panel]').contains(document.activeElement),
  }));
  afirma('aria-expanded vira "true" ao abrir', aberto.aria === 'true', `valor: ${aberto.aria}`);
  afirma('menu aberto trava o scroll do fundo', aberto.lock);
  // BUG ORIGINAL: o foco continuava no botão; leitor de tela não entrava no menu.
  afirma('foco entra no painel ao abrir', aberto.focoDentro);

  const yAntes = await p.evaluate(() => window.scrollY);
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(500);
  const yDepois = await p.evaluate(() => window.scrollY);
  afirma('fundo não rola com o menu aberto', Math.abs(yDepois - yAntes) <= 5, `${yAntes} → ${yDepois}`);

  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);
  afirma(
    'ESC fecha o menu e devolve o foco ao botão',
    await p.evaluate(
      () =>
        !document.querySelector('[data-menu-panel]').classList.contains('is-open') &&
        document.activeElement === document.querySelector('[data-menu-toggle]')
    )
  );

  await p.click('[data-menu-toggle]');
  await p.waitForTimeout(1000);
  await p.click('[data-menu-panel] a[href="#produto"]');
  await p.waitForTimeout(1900);

  const apos = await p.evaluate(() => ({
    fechou: !document.querySelector('[data-menu-panel]').classList.contains('is-open'),
    destravou: !document.documentElement.classList.contains('menu-open'),
    alvoTop: Math.round(document.querySelector('#produto').getBoundingClientRect().top),
    botao: Math.round(document.querySelector('[data-menu-toggle]').getBoundingClientRect().bottom),
  }));
  afirma('menu fecha ao clicar num link', apos.fechou);
  afirma('scroll destrava após navegar pelo menu', apos.destravou);
  afirma('âncora para logo abaixo da topbar', Math.abs(apos.alvoTop - 72) <= 90, `topo em ${apos.alvoTop}px`);
  // BUG ORIGINAL: o scroll programático da âncora era lido como "usuário rolando
  // para baixo", a topbar se escondia e o botão do menu ficava inalcançável
  // justamente depois de usá-lo.
  afirma('topbar continua visível após navegar pelo menu', apos.botao > 0, `botão em ${apos.botao}px`);

  await ctx.close();
});

/* ═════════════════════ 2. GSAP × CSS no mesmo transform ═════════════════════ */
await bloco('conflito de transform', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  // BUG ORIGINAL: .btn e .card-* transicionavam `transform` no CSS enquanto o
  // GSAP animava x/y/rotation nos mesmos elementos — movimento elástico e
  // atrasado em relação ao cursor.
  const conflitos = await p.evaluate(() =>
    [...document.querySelectorAll('[data-magnetic],[data-tilt]')]
      .filter((el) => /transform|all/.test(getComputedStyle(el).transitionProperty))
      .map((el) => String(el.className).split(' ')[0])
  );
  afirma(
    'nenhum elemento animado por GSAP transiciona transform no CSS',
    conflitos.length === 0,
    [...new Set(conflitos)].join(', ')
  );
  await ctx.close();
});

/* ═════════════════════ 3. TABS DO PAINEL DE CÓDIGO ═════════════════════ */
await bloco('tabs', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);

  const aria = await p.evaluate(() => {
    const g = document.querySelector('[data-tabs]');
    const b = g.querySelector('[data-tab-btn]');
    return {
      tablist: !!g.querySelector('[role=tablist]'),
      tab: b.getAttribute('role'),
      selected: b.getAttribute('aria-selected'),
      controls: !!b.getAttribute('aria-controls'),
    };
  });
  afirma(
    'painel de código expõe semântica de tabs',
    aria.tablist && aria.tab === 'tab' && aria.selected === 'true' && aria.controls
  );

  // setas trocam de aba (padrão WAI-ARIA)
  await p.evaluate(() => {
    const el = document.querySelector('#api-first');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  });
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('[data-tab-btn="request"]').focus());
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(500);
  afirma(
    'seta direita troca de aba',
    await p.evaluate(() => document.querySelector('[data-tab-btn="response"]').getAttribute('aria-selected') === 'true')
  );

  // BUG ORIGINAL: o ScrollTrigger reativava a primeira aba ao entrar na
  // viewport, desfazendo a escolha do usuário.
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  await p.evaluate(() => {
    const el = document.querySelector('#api-first');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  });
  await p.waitForTimeout(1400);
  afirma(
    'aba escolhida pelo usuário não é desfeita pelo scroll',
    await p.evaluate(() => document.querySelector('[data-tab-btn="response"]').getAttribute('aria-selected') === 'true')
  );
  await ctx.close();
});

/* ═════════════════════ 4. TIMERS ═════════════════════ */
await bloco('timers', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__reg = new Map();
    const si = window.setInterval;
    const ci = window.clearInterval;
    window.setInterval = function (fn, ms, ...r) {
      const id = si.call(this, fn, ms, ...r);
      // o ScrollTrigger mantém um intervalo interno de 250ms por design
      const interno = /ScrollTrigger|\.enable|\.register/.test(new Error().stack || '');
      window.__reg.set(id, { ms, interno: ms === 250 && interno });
      return id;
    };
    window.clearInterval = function (id) {
      window.__reg.delete(id);
      return ci.call(this, id);
    };
  });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(2200);
  // BUG ORIGINAL: o pulso dos módulos e a rotação do fluxo de eventos rodavam
  // em setInterval eterno, gastando bateria com as seções fora da tela.
  const vivos = await p.evaluate(() => [...window.__reg.values()].filter((v) => !v.interno).length);
  afirma('nenhum timer nosso sobrevive com a seção fora da tela', vivos === 0, `${vivos} vivo(s)`);
  await ctx.close();
});

/* ═════════════════════ 5. RESIZE desktop ⇄ mobile na seção pinada ═════════════════════ */
await bloco('resize', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.evaluate(() => {
    const el = document.querySelector('#como-funciona');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 400);
  });
  await p.waitForTimeout(1200);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const t = document.querySelector('[data-rail-track]');
    const cards = [...document.querySelectorAll('[data-rail-card]')];
    const m = getComputedStyle(t).transform;
    return {
      semDeslocamento: m === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(m),
      invisiveis: cards.filter((c) => parseFloat(getComputedStyle(c).opacity) < 0.9).length,
    };
  });
  afirma('trilho horizontal zera o deslocamento ao virar mobile', r.semDeslocamento);
  afirma('cartas do trilho ficam visíveis após o resize', r.invisiveis === 0, `${r.invisiveis} invisível(is)`);
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(1800);
  afirma('resize não gera erro de JS', erros.length === 0, erros[0]);
  await ctx.close();
});

/* ═════════════════════ 6. DEEP LINK ═════════════════════ */
await bloco('deep link', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + '#seguranca', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4500);
  // BUG ORIGINAL: o navegador saltava para a posição crua antes do GSAP existir;
  // depois a seção pinada criava seu spacer, as posições mudavam e o alvo ficava
  // ~500px fora de lugar.
  const r = await p.evaluate(() => {
    const s = document.querySelector('#seguranca');
    return {
      top: Math.round(s.getBoundingClientRect().top),
      tituloVisivel: parseFloat(getComputedStyle(s.querySelector('h2')).opacity) >= 0.9,
      corpoInvisivel: [...s.querySelectorAll('[data-anim]')].filter(
        (e) => parseFloat(getComputedStyle(e).opacity) < 0.9
      ).length,
    };
  });
  afirma('deep link posiciona na seção', Math.abs(r.top) <= 400, `topo em ${r.top}px`);
  afirma('título aparece ao entrar por deep link', r.tituloVisivel);
  afirma('conteúdo aparece ao entrar por deep link', r.corpoInvisivel === 0, `${r.corpoInvisivel} oculto(s)`);
  await ctx.close();
});

/* ═════════════════════ 7. SCROLL RÁPIDO DE IDA E VOLTA ═════════════════════ */
await bloco('scroll rápido', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  for (let i = 0; i < 3; i++) {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(700);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(700);
  }
  await p.waitForTimeout(1200);
  const invisiveis = await p.evaluate(() =>
    [...document.querySelectorAll('[data-anim],[data-split]')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(el).opacity) < 0.9;
      })
      .map((el) => el.tagName.toLowerCase())
  );
  afirma('conteúdo visível não fica transparente após scroll de ida e volta', invisiveis.length === 0, invisiveis.join(', '));
  afirma('scroll rápido não gera erro de JS', erros.length === 0, erros[0]);
  await ctx.close();
});

/* ═════════════════════ 8. LAYOUT ESTÁVEL NO FIM DA PÁGINA ═════════════════════ */
await bloco('altura estável no fim', async () => {
  // BUG ORIGINAL: as linhas do terminal nasciam com altura zero e cresciam ao
  // serem digitadas — ~200 px de crescimento. Quem já estava no fim da página
  // via o documento crescer por baixo e a página dar pequenos saltos para cima.
  // Vale para qualquer animação: nada pode mudar de altura depois da carga.
  for (const [w, h] of [
    [1920, 1080],
    [1440, 900],
    [390, 844],
  ]) {
    const mobile = w < 1024;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 2 : 1,
    });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3500);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(600);

    const r = await p.evaluate(async () => {
      const alvos = [...document.querySelectorAll('main section, footer, [data-terminal], [data-stream]')];
      const nomes = alvos.map(
        (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.dataset.terminal !== undefined ? '[terminal]' : '') + (el.dataset.stream !== undefined ? '[stream]' : '')
      );
      let base = alvos.map((el) => Math.round(el.getBoundingClientRect().height));
      let docMin = document.documentElement.scrollHeight;
      let docMax = docMin;
      const mudou = new Set();
      for (let i = 0; i < 50; i++) {
        await new Promise((r) => setTimeout(r, 140));
        const d = document.documentElement.scrollHeight;
        docMin = Math.min(docMin, d);
        docMax = Math.max(docMax, d);
        alvos.forEach((el, idx) => {
          const hh = Math.round(el.getBoundingClientRect().height);
          if (Math.abs(hh - base[idx]) > 1) {
            mudou.add(nomes[idx]);
            base[idx] = hh;
          }
        });
      }
      return { crescimento: docMax - docMin, mudou: [...mudou] };
    });

    afirma(
      `documento não muda de altura com a página no fim (${w}px)`,
      r.crescimento === 0,
      `${r.crescimento}px de variação`
    );
    afirma(
      `nenhuma seção muda de altura com a página no fim (${w}px)`,
      r.mudou.length === 0,
      r.mudou.join(', ')
    );
    await ctx.close();
  }
});

await browser.close();

const falhas = resultados.filter((r) => !r.passou);
resultados.forEach((r) => console.log(`${r.passou ? '✓' : '✗'} ${r.descricao}${!r.passou && r.detalhe ? ` — ${r.detalhe}` : ''}`));
console.log(`\n${resultados.length - falhas.length}/${resultados.length} comportamentos corretos.`);
if (falhas.length) process.exit(1);
