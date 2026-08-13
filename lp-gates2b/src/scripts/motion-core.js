/**
 * GATES2B — Motion System
 * GSAP + ScrollTrigger, sobre o scroll nativo do navegador
 *
 * Convenções (data-attributes usados nos componentes .astro):
 *   data-split="lines|words|chars"  → revelação tipográfica com máscara
 *   data-anim="fade-up|fade|scale-in|clip-up"  → entrada simples (+ data-delay)
 *   data-stagger-group                → agrupa filhos [data-anim] em cascata
 *   data-counter                      → contador numérico animado
 *   data-parallax                     → deslocamento no scroll (+ data-parallax-amount)
 *   data-rail                         → seção de scroll horizontal pinada
 *   data-marquee                      → faixa infinita (+ data-speed, data-direction)
 *   data-magnetic                     → botão com atração magnética ao cursor
 *   data-tilt                         → card com inclinação 3D no hover
 *   data-stream                       → fluxo de eventos entrando em loop
 *   data-terminal                     → digitação de terminal
 *   data-sticky-list                  → lista com item ativo conforme o scroll
 *   data-draw                         → traço de SVG desenhado no scroll
 *   data-tabs                         → alternância de painéis
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'power3.out';
const EASE_IO = 'power2.inOut';

/* ══════════════════════════════════════════════════════════════════════════
   1. SCROLL
   O scroll é o nativo do navegador, de propósito. Bibliotecas de smooth
   scroll interceptam a roda e o trackpad e reintroduzem latência: o gesto
   deixa de bater com o que a mão fez, atrapalha o scroll por teclado e briga
   com as seções pinadas. O ScrollTrigger funciona sobre o scroll nativo, e as
   animações com `scrub` já têm sua própria suavização.
   ══════════════════════════════════════════════════════════════════════════ */
const NAV_OFFSET = 72;

function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      const y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   2. REVELAÇÃO TIPOGRÁFICA
   ══════════════════════════════════════════════════════════════════════════ */
/**
 * O SplitText é a operação mais cara da página: reescreve o DOM do título e
 * força layout. Fazer isso nos 12 títulos durante o boot custa centenas de ms
 * de bloqueio da main thread. Aqui cada título só é dividido quando está
 * chegando na viewport — o custo se espalha pelo scroll e sai do caminho
 * crítico. O título do hero não usa SplitText: é CSS puro (ver global.css).
 */
function initSplitReveals() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const mode = el.dataset.split || 'lines';

    if (REDUCED) {
      el.style.opacity = '1';
      return;
    }

    const run = () => {
      // O estado inicial é opacity:0 (ver global.css). Precisa voltar a 1 aqui,
      // senão o título fica invisível: quem faz a revelação são as linhas.
      el.style.opacity = '1';

      const split = new SplitText(el, {
        type: mode === 'words' ? 'words' : mode === 'chars' ? 'chars,words' : 'lines',
        linesClass: 'split-line',
        mask: mode === 'lines' ? 'lines' : undefined,
        autoSplit: true,
      });

      const targets = mode === 'words' ? split.words : mode === 'chars' ? split.chars : split.lines;

      gsap.from(targets, {
        yPercent: mode === 'lines' ? 110 : 0,
        y: mode === 'lines' ? 0 : 22,
        opacity: mode === 'lines' ? 1 : 0,
        rotate: mode === 'lines' ? 2 : 0,
        duration: 1.05,
        ease: 'expo.out',
        stagger: mode === 'chars' ? 0.014 : 0.085,
      });
    };

    ScrollTrigger.create({ trigger: el, start: 'top 105%', once: true, onEnter: run });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   3. ENTRADAS SIMPLES
   ══════════════════════════════════════════════════════════════════════════ */
function initFades() {
  const map = {
    'fade-up': { opacity: 1, y: 0 },
    fade: { opacity: 1 },
    'scale-in': { opacity: 1, scale: 1 },
    'clip-up': { clipPath: 'inset(0% 0 0 0)' },
  };

  // grupos em cascata
  document.querySelectorAll('[data-stagger-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-anim]');
    if (!items.length) return;
    items.forEach((i) => i.setAttribute('data-in-group', ''));
    if (REDUCED) {
      gsap.set(items, { opacity: 1, y: 0, scale: 1, clipPath: 'none' });
      return;
    }
    gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: 'inset(0% 0 0 0)',
      duration: 1,
      ease: EASE,
      stagger: parseFloat(group.dataset.staggerGroup) || 0.09,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // individuais
  document.querySelectorAll('[data-anim]:not([data-in-group])').forEach((el) => {
    const to = map[el.dataset.anim] || map['fade-up'];
    if (REDUCED) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1, clipPath: 'none' });
      return;
    }

    // Elementos do hero entram na carga da página (não dependem de scroll),
    // senão o que está logo abaixo da linha de gatilho nunca aparece.
    const inHero = !!el.closest('[data-hero-section]');

    gsap.to(el, {
      ...to,
      duration: 1,
      ease: EASE,
      delay: parseFloat(el.dataset.delay) || 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   4. HERO
   ══════════════════════════════════════════════════════════════════════════ */
function initHero() {
  const hero = document.querySelector('[data-hero-section]');
  if (!hero) return;

  const media = hero.querySelector('[data-hero-media]');
  const content = hero.querySelector('[data-hero-content]');

  // A entrada do hero (título, textos, imagem, brilho) é feita em CSS, para
  // pintar no primeiro frame sem esperar este bundle. Aqui fica só o scroll.
  if (!REDUCED) {
    // Parallax + fade no scroll
    if (media) {
      gsap.to(media, {
        yPercent: 16,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (content) {
      gsap.to(content, {
        yPercent: -14,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true },
      });
    }
  }

  // Indicador de scroll
  const cue = hero.querySelector('[data-scroll-cue]');
  if (cue && !REDUCED) {
    gsap.to(cue.querySelector('[data-scroll-cue-bar]'), {
      scaleY: 0.2,
      transformOrigin: 'top center',
      repeat: -1,
      duration: 1.6,
      ease: EASE_IO,
      yoyo: true,
    });
    gsap.to(cue, {
      opacity: 0,
      scrollTrigger: { trigger: hero, start: 'top top', end: '20% top', scrub: true },
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   5. NAVEGAÇÃO + PROGRESSO
   ══════════════════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  let lastY = 0;

  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 80);
      if (!REDUCED) {
        const down = y > lastY && y > 320;
        gsap.to(nav, { yPercent: down ? -110 : 0, duration: 0.55, ease: EASE, overwrite: true });
      }
      lastY = y;
    },
  });

  // Link ativo por seção
  const links = [...document.querySelectorAll('[data-nav-link]')];
  links.forEach((link) => {
    const id = link.getAttribute('href');
    const section = id && id.length > 1 ? document.querySelector(id) : null;
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });
}

/* ---- Menu mobile ---- */
let menuOpen = false;
function closeMobileMenu() {
  if (!menuOpen) return;
  toggleMobileMenu(false);
}
function toggleMobileMenu(force) {
  const panel = document.querySelector('[data-menu-panel]');
  const btn = document.querySelector('[data-menu-toggle]');
  if (!panel || !btn) return;
  menuOpen = typeof force === 'boolean' ? force : !menuOpen;
  btn.setAttribute('aria-expanded', String(menuOpen));
  panel.classList.toggle('is-open', menuOpen);
  document.documentElement.classList.toggle('menu-open', menuOpen);
  if (!REDUCED) {
    const items = panel.querySelectorAll('[data-menu-item]');
    if (menuOpen) {
      gsap.fromTo(
        items,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: EASE, stagger: 0.055, delay: 0.12 }
      );
    }
  }
}
function initMobileMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  if (!btn) return;
  btn.addEventListener('click', () => toggleMobileMenu());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   6. CONTADORES
   ══════════════════════════════════════════════════════════════════════════ */
function initCounters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const value = parseFloat(el.dataset.value || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    const format = (n) =>
      prefix +
      n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix;

    if (REDUCED) {
      el.textContent = format(value);
      return;
    }

    el.textContent = format(0);
    const obj = { n: 0 };
    gsap.to(obj, {
      n: value,
      duration: 2.4,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = format(obj.n)),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   7. PARALLAX GENÉRICO
   ══════════════════════════════════════════════════════════════════════════ */
function initParallax() {
  if (REDUCED) return;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallaxAmount || '12');
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   8. SCROLL HORIZONTAL PINADO (Como funciona)
   ══════════════════════════════════════════════════════════════════════════ */
function initRail() {
  const rail = document.querySelector('[data-rail]');
  if (!rail) return;
  const track = rail.querySelector('[data-rail-track]');
  const cards = rail.querySelectorAll('[data-rail-card]');
  const line = rail.querySelector('[data-rail-progress]');
  if (!track) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    // Sem folga extra: qualquer valor somado aqui vira um vão vazio à direita
    // quando a última carta chega ao fim do trilho.
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rail,
        start: 'top top',
        end: () => '+=' + distance() * 1.15,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(track, { x: () => -distance(), ease: 'none' }, 0);
    if (line) tl.fromTo(line, { scaleX: 0.02 }, { scaleX: 1, ease: 'none' }, 0);

    // Anima a variável --dim (véu sobreposto), não a opacidade do card:
    // preserva a cor computada do texto para leitores de tela e auditorias.
    cards.forEach((card, i) => {
      tl.fromTo(
        card,
        { '--dim': i === 0 ? 0 : 0.42 },
        { '--dim': 0, duration: 0.2, ease: 'none' },
        i * 0.22
      );
    });

    return () => gsap.set(track, { x: 0 });
  });

  // Mobile: cascata vertical
  mm.add('(max-width: 1023px)', () => {
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: EASE,
      stagger: 0.12,
      scrollTrigger: { trigger: rail, start: 'top 75%', once: true },
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   9. MARQUEES
   ══════════════════════════════════════════════════════════════════════════ */
function initMarquees() {
  document.querySelectorAll('[data-marquee]').forEach((wrap) => {
    const track = wrap.querySelector('.marquee-track');
    if (!track) return;

    const speed = parseFloat(wrap.dataset.speed || '38');
    const dir = wrap.dataset.direction === 'right' ? 1 : -1;
    const original = track.innerHTML;
    let tween = null;

    const build = () => {
      if (tween) tween.kill();
      gsap.set(track, { x: 0 });

      // Mede DUAS cópias e divide por dois. Medir uma cópia isolada deixaria de
      // fora o `gap` que o flex insere entre uma cópia e a seguinte, e o loop
      // saltaria a cada volta pela diferença de um gap.
      track.innerHTML = original + original;
      const unit = track.scrollWidth / 2;
      if (!unit) return;

      // Repete até cobrir a viewport com uma cópia inteira de folga. Duas
      // cópias fixas não bastam: em telas largas a faixa acaba antes da borda
      // e abre um vazio no fim de cada ciclo.
      const copies = Math.ceil(window.innerWidth / unit) + 2;
      let html = original;
      for (let i = 1; i < copies; i++) {
        // display:contents preserva o layout do flex (os filhos continuam sendo
        // itens do track); aria-hidden evita que o leitor de tela leia o mesmo
        // conteúdo uma vez por cópia.
        html += `<span aria-hidden="true" style="display:contents">${original}</span>`;
      }
      track.innerHTML = html;

      if (REDUCED) return;

      // Desloca exatamente uma cópia e repete. A cópia seguinte cai no lugar
      // exato da anterior, então a emenda é invisível — sem precisar de
      // modifiers nem de matemática de resto.
      const from = dir < 0 ? 0 : -unit;
      gsap.set(track, { x: from });
      tween = gsap.to(track, {
        x: from + dir * unit,
        duration: unit / speed,
        ease: 'none',
        repeat: -1,
      });
    };

    build();

    // A quantidade de cópias depende da largura da janela.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });

    if (!REDUCED) {
      wrap.addEventListener('mouseenter', () => {
        if (tween) gsap.to(tween, { timeScale: 0.25, duration: 0.4 });
      });
      wrap.addEventListener('mouseleave', () => {
        if (tween) gsap.to(tween, { timeScale: 1, duration: 0.4 });
      });
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   10. BOTÕES MAGNÉTICOS + TILT
   ══════════════════════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (REDUCED || window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.28;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE });

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

function initTilt() {
  if (REDUCED || window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 6;
    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: EASE });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: EASE });
    const yy = gsap.quickTo(el, 'y', { duration: 0.6, ease: EASE });

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max * 2);
      rx(-py * max * 2);
      yy(-6);
      const glow = el.querySelector('[data-tilt-glow]');
      if (glow) {
        gsap.to(glow, {
          opacity: 1,
          x: (e.clientX - r.left - r.width / 2) * 0.5,
          y: (e.clientY - r.top - r.height / 2) * 0.5,
          duration: 0.5,
          ease: EASE,
        });
      }
    });
    el.addEventListener('mouseleave', () => {
      rx(0);
      ry(0);
      yy(0);
      const glow = el.querySelector('[data-tilt-glow]');
      if (glow) gsap.to(glow, { opacity: 0, duration: 0.6 });
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   11. PAINEL DE VISIBILIDADE — módulos acendendo em sequência
   ══════════════════════════════════════════════════════════════════════════ */
function initModules() {
  const panel = document.querySelector('[data-modules]');
  if (!panel) return;
  const items = panel.querySelectorAll('[data-module]');
  if (!items.length) return;

  if (REDUCED) {
    items.forEach((i) => i.classList.add('is-live'));
    return;
  }

  gsap.fromTo(
    items,
    { opacity: 0, y: 26, filter: 'blur(6px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: EASE,
      stagger: { each: 0.07, from: 'start' },
      scrollTrigger: { trigger: panel, start: 'top 78%', once: true },
    }
  );

  // pulso sequencial contínuo, como um sistema vivo
  ScrollTrigger.create({
    trigger: panel,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      let i = 0;
      const pulse = () => {
        items.forEach((el) => el.classList.remove('is-live'));
        items[i % items.length].classList.add('is-live');
        i++;
      };
      pulse();
      setInterval(pulse, 1400);
    },
  });

  // Parallax leve no painel
  gsap.to(panel, {
    yPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   12. FLUXO DE EVENTOS
   ══════════════════════════════════════════════════════════════════════════ */
function initStream() {
  document.querySelectorAll('[data-stream]').forEach((stream) => {
    const rows = [...stream.querySelectorAll('[data-stream-row]')];
    if (!rows.length || REDUCED) return;

    ScrollTrigger.create({
      trigger: stream,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          rows,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.6, ease: EASE, stagger: 0.12 }
        );

        // rotação contínua: primeira linha vai para o fim
        let running = true;
        const cycle = () => {
          if (!running) return;
          const first = stream.querySelector('[data-stream-row]');
          if (!first) return;
          gsap.to(first, {
            opacity: 0,
            height: 0,
            marginTop: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.45,
            ease: EASE_IO,
            onComplete: () => {
              gsap.set(first, { clearProps: 'all' });
              stream.appendChild(first);
              gsap.fromTo(first, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.5 });
            },
          });
        };
        setInterval(cycle, 2600);
        window.addEventListener('pagehide', () => (running = false));
      },
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   13. TERMINAL (digitação)
   ══════════════════════════════════════════════════════════════════════════ */
function initTerminal() {
  const term = document.querySelector('[data-terminal]');
  if (!term) return;
  const lines = [...term.querySelectorAll('[data-terminal-line]')];
  if (!lines.length) return;

  if (REDUCED) {
    lines.forEach((l) => (l.style.opacity = '1'));
    return;
  }

  gsap.set(lines, { opacity: 0 });

  ScrollTrigger.create({
    trigger: term,
    start: 'top 78%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      lines.forEach((line, i) => {
        const text = line.dataset.text || line.textContent || '';
        const target = line.querySelector('[data-terminal-text]') || line;
        const isPrompt = line.hasAttribute('data-prompt');
        target.textContent = '';
        tl.set(line, { opacity: 1 }, i === 0 ? 0 : '+=0.06');
        tl.to(
          target,
          {
            duration: isPrompt ? Math.min(1.2, text.length * 0.026) : Math.min(0.5, text.length * 0.008),
            text: { value: text, delimiter: '' },
            ease: 'none',
          },
          '<'
        );
      });
      // cursor piscando
      const cursor = term.querySelector('[data-terminal-cursor]');
      if (cursor) gsap.to(cursor, { opacity: 0, repeat: -1, yoyo: true, duration: 0.55, ease: 'steps(1)' });
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   14. LISTA STICKY COM ITEM ATIVO (Infraestrutura)
   ══════════════════════════════════════════════════════════════════════════ */
function initStickyList() {
  document.querySelectorAll('[data-sticky-list]').forEach((list) => {
    const items = [...list.querySelectorAll('[data-sticky-item]')];
    if (!items.length) return;

    items.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 62%',
        end: 'bottom 42%',
        onToggle: (self) => {
          item.classList.toggle('is-active', self.isActive);
          const idx = list.querySelector('[data-sticky-index]');
          if (self.isActive && idx) idx.textContent = String(i + 1).padStart(2, '0');
        },
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   15. TRAÇOS SVG DESENHADOS
   ══════════════════════════════════════════════════════════════════════════ */
function initDraw() {
  if (REDUCED) return;
  document.querySelectorAll('[data-draw]').forEach((svg) => {
    const paths = svg.querySelectorAll('path, line, circle, rect, polyline');
    paths.forEach((p) => {
      const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 200;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: svg, start: 'top 88%', once: true },
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   16. TABS DE CÓDIGO
   ══════════════════════════════════════════════════════════════════════════ */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const btns = [...group.querySelectorAll('[data-tab-btn]')];
    const panels = [...group.querySelectorAll('[data-tab-panel]')];

    const activate = (id) => {
      btns.forEach((b) => b.classList.toggle('is-active', b.dataset.tabBtn === id));
      panels.forEach((p) => {
        const on = p.dataset.tabPanel === id;
        p.hidden = !on;
        if (on && !REDUCED) {
          gsap.fromTo(
            p.querySelectorAll('[data-code-line]'),
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.42, ease: EASE, stagger: 0.022 }
          );
        }
      });
    };

    btns.forEach((b) => b.addEventListener('click', () => activate(b.dataset.tabBtn)));
    if (btns[0]) activate(btns[0].dataset.tabBtn);

    // primeira animação ao entrar na viewport
    ScrollTrigger.create({
      trigger: group,
      start: 'top 78%',
      once: true,
      onEnter: () => btns[0] && activate(btns[0].dataset.tabBtn),
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   17. MOEDAS EM ÓRBITA (Operação global)
   ══════════════════════════════════════════════════════════════════════════ */
function initOrbit() {
  const orbit = document.querySelector('[data-orbit]');
  if (!orbit) return;
  const chips = [...orbit.querySelectorAll('[data-orbit-chip]')];
  if (!chips.length) return;

  const place = () => {
    // as moedas ficam sobre o anel do círculo (o wrapper tem 40px de folga)
    const r = orbit.clientWidth / 2 - 40;
    chips.forEach((chip, i) => {
      const angle = (i / chips.length) * Math.PI * 2 - Math.PI / 2;
      gsap.set(chip, { x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    });
  };
  place();
  window.addEventListener('resize', place);

  if (REDUCED) return;

  gsap.fromTo(
    chips,
    { opacity: 0, scale: 0.6 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(2)',
      stagger: 0.06,
      scrollTrigger: { trigger: orbit, start: 'top 80%', once: true },
    }
  );

  gsap.to(orbit, {
    rotate: 360,
    duration: 90,
    repeat: -1,
    ease: 'none',
  });
  chips.forEach((c) => gsap.to(c, { rotate: -360, duration: 90, repeat: -1, ease: 'none' }));
}

/* ══════════════════════════════════════════════════════════════════════════
   18. SEÇÕES COM TRANSIÇÃO DE FUNDO (claro ⇄ escuro)
   ══════════════════════════════════════════════════════════════════════════ */
function initSectionTheme() {
  document.querySelectorAll('[data-theme-section]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 12%',
      end: 'bottom 12%',
      onToggle: (self) =>
        document.documentElement.setAttribute(
          'data-nav-theme',
          self.isActive ? section.dataset.themeSection : 'dark'
        ),
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════════════════ */
/**
 * Devolve o controle ao navegador entre as inicializações.
 * Inicializar tudo de uma vez cria uma única tarefa longa que travaria a
 * thread principal por centenas de ms. Cedendo entre cada passo, o mesmo
 * trabalho vira várias tarefas curtas e a página continua respondendo.
 */
function yieldToMain() {
  if (window.scheduler?.yield) return scheduler.yield();
  return new Promise((r) => setTimeout(r, 0));
}

async function runChunked(steps) {
  for (const step of steps) {
    try {
      step();
    } catch (err) {
      console.error('[motion]', err);
    }
    await yieldToMain();
  }
}

async function boot() {
  document.documentElement.classList.add('js');
  document.documentElement.setAttribute('data-motion-ready', '');

  // ---- Fase 1: interação. Precisa estar de pé imediatamente. ----
  await runChunked([initAnchors, initMobileMenu, initNav]);

  // ---- Fase 2: efeitos de scroll, um por tarefa. ----
  await runChunked([
    initHero,
    initFades,
    initCounters,
    initParallax,
    initRail,
    initMarquees,
    initSectionTheme,
    initStickyList,
    initTabs,
    initOrbit,
    initMagnetic,
    initTilt,
  ]);
  ScrollTrigger.refresh();

  // ---- Fase 3: o SplitText precisa das fontes para medir as linhas. ----
  if (document.fonts) await document.fonts.ready.catch(() => {});
  await runChunked([initSplitReveals, initModules, initStream, initDraw]);

  // ---- Fase 4: o terminal exige um plugin extra. ----
  const { TextPlugin } = await import('gsap/TextPlugin');
  gsap.registerPlugin(TextPlugin);
  initTerminal();

  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
