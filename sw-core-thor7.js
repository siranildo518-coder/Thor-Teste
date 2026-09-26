// THOR LOTERIAS - Service Worker
// THOR 7 V3.75 - calculadora de probabilidade e cache sincronizados
const CACHE_PREFIX='thor-teste-';
const CACHE_NAME=CACHE_PREFIX+'thor7-v155-isolado';
const CORE=['./','./index.html','./index-core-thor7.html','./app-main.html','./app-direct.html','./manifest.json','./icon-192.png','./thor-home-topo-v316.jpg'];
const PALPITES_CARD='<button class="home-feature-card" style="--fc:#d41948" data-home-target="btnTendenciaAtalho"><span class="hfc-icon">◎</span><span><strong>Palpites</strong><small>Sugestões inteligentes</small></span></button>';
const CALC_CARD='<button class="home-feature-card" style="--fc:#e98a00" data-home-target="btnSimularAtalho"><span class="hfc-icon">▤</span><span><strong>Calculadora</strong><small>Probabilidades e estimativas</small></span></button>';
const ESCOLHA_CARD='<button class="home-feature-card" id="btnEscolhaPraMim" style="--fc:#18a96b" type="button"><span class="hfc-icon">★</span><span><strong>Escolha pra mim</strong><small>Sugestão automática</small></span></button>';
const MENU_CSS=`<style id="thorMenuMetalico3DForcado">#homeSideNav{align-items:center!important}#homeSideNav .hs-menu,#homeSideNav .hs-item{width:84%!important;min-height:34px!important;height:34px!important;padding:0 3px!important;margin:0 auto 7px!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;background:linear-gradient(180deg,#c8edff,#76c5ec 30%,#3f9dce 58%,#175d8d)!important;border:2px solid #ff8a00!important;border-radius:6px!important;color:#fff!important;font-size:7px!important;line-height:1.06!important;font-weight:800!important;text-transform:uppercase!important;white-space:normal!important;overflow:hidden!important;box-shadow:inset 0 3px 3px rgba(255,255,255,.92),inset 0 -4px 6px rgba(0,54,94,.52),0 3px 0 #a84b00,0 0 11px rgba(255,119,0,.95)!important}#homeSideNav .hs-menu{font-size:0!important}#homeSideNav .hs-menu::after{content:'MENU';font-size:7px;font-weight:800}#homeSideNav .hs-item:last-child{font-size:0!important}#homeSideNav .hs-item:last-child::after{content:'JOGOS OFICIAIS';white-space:normal;font-size:7px;line-height:1.02;font-weight:800;text-align:center}</style>`;
const FECHAMENTO_CSS=`<style id="thorFechamentoMetalicoAzul">#overlayListaResultados .home-free-banner{background:linear-gradient(180deg,#d9f7ff,#69d8ff 18%,#16b8ef 43%,#0873b7)!important;border:3px solid #ff9800!important;color:#fff!important;box-shadow:inset 0 3px 4px rgba(255,255,255,.95),0 0 18px rgba(255,119,0,.95)!important}.home-free-banner .home-upgrade-btn{background:linear-gradient(180deg,#43ff76,#08cf45 42%,#00741f)!important;color:#fff!important;border:3px solid #ff9a00!important}</style>`;
const FEATURE_CSS=`<style id="thorCardsSomenteBordaLaranja">#overlayListaResultados .home-feature-card{border:3px solid #ff9800!important;box-shadow:none!important}</style>`;
const TOP_CSS=`<style id="thorBotoesHomeLaranja5">#overlayListaResultados .home-tabs-wrap{background:transparent!important;border:0!important;box-shadow:none!important;padding:8px 6px!important}#overlayListaResultados .home-tabs{display:flex!important;gap:7px!important;padding:0!important;margin:0!important}#overlayListaResultados .home-tab{flex:0 0 auto!important;border-radius:18px!important;border:1px solid #ff8a00!important;background:linear-gradient(100deg,#06101d 0%,#263c52 28%,#0b1c2d 55%,#21394f 82%,#050d18 100%)!important;color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.16),inset 0 -2px 4px rgba(0,0,0,.55),0 0 4px rgba(255,138,0,.42)!important}#overlayListaResultados .home-tab.active{border:1px solid #ff8a00!important;border-radius:18px!important;background:linear-gradient(135deg,var(--tab-accent,#168cff),color-mix(in srgb,var(--tab-accent,#168cff) 62%,#06101d))!important;color:#fff!important;box-shadow:inset 0 2px 3px rgba(255,255,255,.34),inset 0 -3px 5px rgba(0,0,0,.48),0 0 6px var(--tab-accent,#168cff)!important}</style>`;
const JOGOS_CSS=`<style id="thorJogosTopoMetalicoCss">#thorJogosBranco{position:fixed;inset:0;z-index:99998;background:#fff;display:none;overflow:hidden;font-family:Arial,sans-serif}#thorJogosBranco.ativo{display:block}#thorJogosTopo{height:86px;width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(180deg,#ffd44c 0%,#ff9d00 10%,#e86800 38%,#ff8a00 58%,#a93600 100%);border-bottom:4px solid #ff9d00;box-shadow:inset 0 4px 4px rgba(255,255,255,.75),inset 0 -8px 12px rgba(92,20,0,.65),0 4px 10px rgba(0,0,0,.45)}#thorJogosTopo:before{content:'';position:absolute;inset:5px 0 auto;height:2px;background:linear-gradient(90deg,transparent,#fff3a1,#fff,#fff3a1,transparent);opacity:.8}#thorJogosTitulo{font-weight:1000;font-style:italic;font-size:28px;letter-spacing:-1px;text-transform:uppercase;color:#fff3b0;text-shadow:-2px -2px 0 #532000,2px -2px 0 #532000,-2px 2px 0 #532000,2px 2px 0 #532000,0 4px 0 #7a2700,0 6px 8px rgba(0,0,0,.65)}#thorJogosTitulo .tor{color:#f7fbff;text-shadow:-2px -2px 0 #18232e,2px -2px 0 #18232e,-2px 2px 0 #18232e,2px 2px 0 #18232e,0 4px 0 #34414d,0 6px 8px rgba(0,0,0,.65)}#thorJogosCoroa{position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:20px;filter:drop-shadow(0 2px 2px #5d2600)}#thorJogosVoltar{position:absolute;z-index:2;left:10px;top:17px;width:54px;height:52px;border:3px solid #ffb000;border-radius:14px;background:linear-gradient(180deg,#303030,#070707 70%,#000);color:#ffad00;font-size:34px;font-weight:900;line-height:42px;cursor:pointer;box-shadow:inset 0 3px 3px rgba(255,255,255,.2),inset 0 -4px 5px #000,0 3px 0 #8f3b00,0 0 10px #ff8a00}#thorJogosConteudo{position:absolute;top:86px;left:0;right:0;bottom:0;background:#fff;overflow:auto}#thorJogosLoterias{display:flex;gap:7px;padding:10px 8px 9px;overflow-x:auto;background:linear-gradient(180deg,#172a3d,#07131f);border-bottom:2px solid #ff8a00;box-shadow:inset 0 2px 4px rgba(255,255,255,.12),0 3px 7px rgba(0,0,0,.35);scrollbar-width:none}#thorJogosLoterias::-webkit-scrollbar{display:none}.thorJogoLoteria{flex:0 0 auto;min-width:82px;height:34px;padding:0 12px;border-radius:18px;border:1px solid #ff8a00;background:linear-gradient(180deg,#2d465d,#101f2e 50%,#050b12);color:#fff;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:inset 0 2px 2px rgba(255,255,255,.22),inset 0 -3px 4px rgba(0,0,0,.65),0 2px 3px rgba(0,0,0,.5)}.thorJogoLoteria:active,.thorJogoLoteria.ativa{transform:translateY(2px);background:linear-gradient(180deg,#ffbd38,#f07a00 55%,#9c3500);box-shadow:inset 0 3px 5px rgba(96,29,0,.55),0 0 7px #ff8a00}</style>`;
const JOGOS_TOPO_IMG_CSS=`<style id="thorJogosTopoImagemCss">#thorJogosTopo{height:21.64vw!important;max-height:112px!important;min-height:72px!important;padding:0!important;background:#ef7900!important;border:0!important;box-shadow:none!important;overflow:hidden!important}#thorJogosTopo:before{display:none!important}#thorJogosTopoImg{display:block;width:100%;height:100%;object-fit:cover;border:0;margin:0}#thorJogosConteudo{top:clamp(72px,21.64vw,112px)!important}</style>`;
const HOME_TOPO_IMG_CSS=`<style id="thorHomeTopoImagemCss">#overlayListaResultados .home-header{padding:0!important;margin-left:-6px!important;width:calc(100% + 6px)!important;box-sizing:border-box!important;background:#03142b!important;border:0!important;box-shadow:none!important;overflow:hidden!important}#thorHomeTopoImg{display:block;width:100%;height:auto;margin:0;border:0;object-fit:cover;object-position:center top}</style>`;
function prepararHome(html){if(!html.includes("calculadora-probabilidade-v336.css"))html=html.replace("</head>","<link rel=\"stylesheet\" href=\"./calculadora-probabilidade-v336.css?v=thor7-v3-84\"></head>");if(!html.includes("calculadora-probabilidade-v331.js"))html=html.replace("</body>","<script src=\"./calculadora-probabilidade-v331.js?v=thor7-v3-84\"><\/script><script src=\"./calculadora-probabilidade-v336.js?v=thor7-v3-84\"><\/script></body>");if(!html.includes('fechamento-visual-v327.css'))html=html.replace('</head>','<link rel="stylesheet" href="./fechamento-visual-v327.css?v=thor7-v3-84"><link rel="stylesheet" href="./fechamento-detalhe-v328.css?v=thor7-v3-84"><link rel="stylesheet" href="./fechamento-resultados-v330.css?v=thor7-v3-84"><link rel="stylesheet" href="./fechamento-ajustes-v337.css?v=thor7-v3-84"></head>');if(!html.includes('fechamento-visual-v327.js'))html=html.replace('</body>','<script src="./fechamento-visual-v327.js?v=thor7-v3-84"><\/script><script src="./fechamento-detalhe-v328.js?v=thor7-v3-84"><\/script><script src="./fechamento-resultados-v330.js?v=thor7-v3-84"><\/script></body>');html=html.replace(PALPITES_CARD,'');if(!html.includes('id="btnEscolhaPraMim"'))html=html.replace(CALC_CARD,CALC_CARD+'\n'+ESCOLHA_CARD);if(!html.includes('src="./gerador-palpites.js'))html=html.replace('</body>','<script src="./gerador-palpites.js?v=thor7-v3-84"><\/script></body>');if(!html.includes('resultados-auto-thor4.js'))html=html.replace('</body>','<script src="./resultados-auto-thor4.js?v=thor7-v3-84"><\/script></body>');html=html.replace('</head>',MENU_CSS+FECHAMENTO_CSS+FEATURE_CSS+TOP_CSS+JOGOS_CSS+JOGOS_TOPO_IMG_CSS+'</head>');const pronto=`<script>(function(){function montarTopoHome(){var h=document.querySelector('#overlayListaResultados .home-header');if(!h||document.getElementById('thorHomeTopoImg'))return;h.innerHTML='<img id="thorHomeTopoImg" src="./thor-home-topo-v316.jpg" alt="THOR LOTERIAS">'}function ligarEscolha(){var b=document.getElementById('btnEscolhaPraMim');if(!b)return;b.removeAttribute('data-home-target');b.onclick=function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();location.href='./gerador.html?v=thor7-v3-84'}}function montarJogos(){if(document.getElementById('thorJogosBranco'))return;var tela=document.createElement('div');tela.id='thorJogosBranco';tela.innerHTML='<div id="thorJogosTopo"><img id="thorJogosTopoImg" src="./thor-jogos-oficiais-topo.jpg" alt="THOR LOTERIAS"></div><div id="thorJogosConteudo"><div id="thorJogosLoterias"><button class="thorJogoLoteria ativa" type="button">Mega-Sena</button><button class="thorJogoLoteria" type="button">Lotofácil</button><button class="thorJogoLoteria" type="button">Quina</button><button class="thorJogoLoteria" type="button">Dia de Sorte</button><button class="thorJogoLoteria" type="button">Lotomania</button><button class="thorJogoLoteria" type="button">Super Sete</button><button class="thorJogoLoteria" type="button">Timemania</button><button class="thorJogoLoteria" type="button">Dupla Sena</button></div></div>';document.body.appendChild(tela);window.addEventListener('popstate',function(){tela.classList.remove('ativo')});tela.querySelectorAll('.thorJogoLoteria').forEach(function(b){b.onclick=function(){tela.querySelectorAll('.thorJogoLoteria').forEach(function(x){x.classList.remove('ativa')});b.classList.add('ativa')}});document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('button,a,[role="button"],.hs-item,.home-feature-card'):null;if(!a||tela.contains(a))return;var txt=(a.textContent||'').replace(/\\s+/g,' ').trim();var side=a.matches&&a.matches('#homeSideNav .hs-item:last-child');if(txt==='Jogos'||/^Jogos\\s/i.test(txt)||txt==='JOGOS OFICIAIS'||side){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();tela.classList.add('ativo');try{history.pushState({thorJogos:true},'',location.href)}catch(_){}}},true)}function revelar(){var h=document.getElementById('homeHero');if(!h)return false;document.documentElement.classList.add('thor-home-pronta');return true}function iniciar(){ligarEscolha();montarJogos()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();if(!revelar()){var o=new MutationObserver(function(){ligarEscolha();montarJogos();if(revelar())o.disconnect()});o.observe(document.documentElement,{childList:true,subtree:true,characterData:true});setTimeout(function(){document.documentElement.classList.add('thor-home-pronta');o.disconnect()},8000)}})();<\/script>`;return html.replace('</body>',pronto+'</body>')}
function prepararGerador(html){if(!html.includes('gerador-visual-v318.css'))html=html.replace('</head>','<link rel="stylesheet" href="./gerador-visual-v318.css?v=thor7-v3-84"><link rel="stylesheet" href="./gerador-ajustes-v321.css?v=thor7-v3-84"></head>');html=html.replace(/<script src="\.\/gerador-(?:padroes-avancados|minimo-87|quantidade)\.js[^>]*><\/script>/g,'');return html.replace('</body>','<script src="./gerador-visual-v318.js?v=thor7-v3-84"></script><script src="./gerador-padroes-avancados.js?v=thor7-v3-84"><\/script><script src="./gerador-minimo-87.js?v=thor7-v3-84"><\/script></body>')}
async function respostaAtualizada(req){const fresh=await fetch(req,{cache:'no-store'});if(!fresh||!fresh.ok)return fresh;const url=new URL(req.url);if(url.pathname.endsWith('/app-main.html')){const html=prepararHome(await fresh.text()),headers=new Headers(fresh.headers);headers.set('content-type','text/html; charset=utf-8');headers.set('cache-control','no-store, no-cache, must-revalidate');return new Response(html,{status:fresh.status,statusText:fresh.statusText,headers})}if(url.pathname.endsWith('/gerador.html')){const html=prepararGerador(await fresh.text()),headers=new Headers(fresh.headers);headers.set('content-type','text/html; charset=utf-8');headers.set('cache-control','no-store, no-cache, must-revalidate');return new Response(html,{status:fresh.status,statusText:fresh.statusText,headers})}return fresh}
async function offlineFallback(req){
  const u=new URL(req.url);
  let path=u.pathname.split('/').pop();
  if(!path||path==='') path='index.html';
  return (await caches.match('./'+path)) || (req.mode==='navigate' ? await caches.match('./index.html') : null);
}

function chaveCache(req){
  const u=new URL(req.url);
  let path=u.pathname.split('/').pop();
  if(!path||path==='') return './index.html';
  return './'+path;
}

async function atualizarEmSegundoPlano(req,chave){
  try{
    const fresh=await respostaAtualizada(new Request(req.url,{cache:'no-store',credentials:req.credentials,headers:req.headers}));
    if(fresh&&fresh.ok){
      const cache=await caches.open(CACHE_NAME);
      await cache.put(chave,fresh.clone());
    }
  }catch(_){}
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE.map(async url=>{
      try{
        const req=new Request(url+(url.includes('?')?'&':'?')+'_refresh=thor7-v145-abertura-paralela',{cache:'no-store'});
        const res=await respostaAtualizada(req);
        if(res&&res.ok) await cache.put(url,res.clone());
      }catch(_){}
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.forEach(c=>c.postMessage({type:'THOR_UPDATED',version:'THOR 7 V144',refresh:'thor7-v144-direto'}));
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  const u=new URL(req.url);

  // Não interfere em APIs/arquivos externos.
  if(u.origin!==self.location.origin) return;

  // Liberações de cadastro precisam ser sempre atuais.
  if(u.pathname.endsWith('/cadastros-liberados.json')){
    event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>offlineFallback(req)));
    return;
  }

  const chave=chaveCache(req);

  // Abertura e arquivos estáticos: cache imediato, atualização silenciosa em segundo plano.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(chave);
    if(cached){
      event.waitUntil(atualizarEmSegundoPlano(req,chave));
      return cached;
    }
    try{
      const fresh=await respostaAtualizada(req);
      if(fresh&&fresh.ok) await cache.put(chave,fresh.clone());
      return fresh;
    }catch(_){
      return await offlineFallback(req) || Response.error();
    }
  })());
});
