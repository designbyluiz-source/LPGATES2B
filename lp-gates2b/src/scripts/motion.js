/**
 * GATES2B — Carregador do sistema de movimento.
 *
 * Nada acima da dobra depende de JavaScript: a entrada do hero (título,
 * textos, imagem, brilho) é feita em CSS, em global.css. Isso permite tirar
 * o GSAP do caminho crítico de renderização — ele é buscado quando o
 * navegador fica ocioso ou na primeira interação do usuário, o que vier
 * primeiro. O resultado visual é idêntico; muda só o momento do download.
 */

const EVENTS = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];

let started = false;

function start() {
  if (started) return;
  started = true;
  EVENTS.forEach((e) => window.removeEventListener(e, start));
  import('./motion-core.js');
}

// Qualquer sinal de que o usuário começou a interagir carrega na hora.
EVENTS.forEach((e) => window.addEventListener(e, start, { passive: true }));

// Sem interação, carrega no primeiro momento ocioso.
if ('requestIdleCallback' in window) {
  requestIdleCallback(start, { timeout: 2000 });
} else {
  setTimeout(start, 800);
}
