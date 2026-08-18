import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0);});
await p.waitForTimeout(2200);
const d = await p.evaluate(()=>{
  const mods=document.querySelector('[data-modules]');
  const st=document.querySelector('[data-stream]');
  const vis = el => { const r=el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const live = el => [...el.querySelectorAll('[data-module].is-live')].length;
  return { modulosNaTela: vis(mods), moduloAceso: live(mods),
           fluxoNaTela: vis(st), topoModulos: Math.round(mods.getBoundingClientRect().top), viewport: innerHeight };
});
console.log(JSON.stringify(d,null,1));
await b.close();
