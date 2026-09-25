from pathlib import Path
import re

VER='2026-09-12-0540'
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=re.sub(r"const APP_VERSAO_ATUAL = '[^']+';", f"const APP_VERSAO_ATUAL = '{VER}';", s, count=1)

css='''
<style id="home-design-neon-0540">
#overlayListaResultados{background:radial-gradient(circle at 72% 8%,rgba(67,56,202,.22),transparent 28%),linear-gradient(180deg,#07101f 0%,#050914 100%)!important;color:#fff;padding-left:76px!important;overflow-x:hidden}
#overlayListaResultados .home-header{background:linear-gradient(145deg,#101a30,#080d18)!important;border-bottom:1px solid #248cff;box-shadow:0 8px 24px rgba(0,0,0,.45);padding:10px 12px!important}
#overlayListaResultados .home-topbar{justify-content:center!important} #overlayListaResultados .home-topbar-left{width:100%;justify-content:center} #overlayListaResultados .home-icon-btn{display:none!important}
#overlayListaResultados .home-brand-pill{background:transparent!important;border:0!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;gap:0!important;padding:2px!important}
#overlayListaResultados .home-brand-pill .logo{display:none!important} #overlayListaResultados .home-brand-pill span{font-size:23px!important;letter-spacing:1.5px!important;text-transform:uppercase;font-weight:900!important;color:#fff!important;text-shadow:0 2px 0 #53657c,0 0 12px rgba(54,156,255,.7)}
#overlayListaResultados .home-brand-pill span::after{content:'ESTRATÉGIA EM CADA JOGO';display:block;font-size:7.5px;letter-spacing:2.2px;color:#f6c64f;text-align:center;margin-top:2px;text-shadow:none}
#overlayListaResultados .home-tabs-wrap{padding:7px 8px 3px!important;background:#07101f!important} #overlayListaResultados .home-tabs{gap:5px!important} #overlayListaResultados .home-tab{background:#111b30!important;color:#dce7f8!important;border:1px solid #263c60!important;box-shadow:none!important;padding:6px 9px!important;font-size:9px!important}
#overlayListaResultados .home-tab.active{background:linear-gradient(135deg,#6d19d7,#168cff)!important;color:#fff!important;border-color:#58b5ff!important;box-shadow:0 0 14px rgba(85,98,255,.45)!important} #overlayListaResultados .home-swipe-hint{display:none!important}
#overlayListaResultados .home-free-banner{margin:7px 8px!important;background:linear-gradient(135deg,#171f35,#101628)!important;border:1px solid #26466f!important;box-shadow:0 5px 18px rgba(0,0,0,.32)!important;border-radius:14px!important} #overlayListaResultados .home-upgrade-btn{background:linear-gradient(135deg,#00a76f,#00d48b)!important;color:#fff!important;border:1px solid #61ffc1!important}
#overlayListaResultados #homeHero{padding:0 8px} #overlayListaResultados .home-hero{border:1px solid #2c9cff!important;border-radius:18px!important;background:radial-gradient(circle at 72% 38%,rgba(167,37,255,.72),transparent 28%),linear-gradient(145deg,#101d38,#07111f 62%,#171035)!important;box-shadow:inset 0 0 25px rgba(28,114,255,.14),0 0 18px rgba(41,129,255,.28)!important;position:relative;overflow:hidden;padding:16px!important}
#overlayListaResultados .home-hero::before{content:'LOTOFÁCIL';display:block;font-size:27px;font-weight:900;font-style:italic;letter-spacing:-1px;color:#fff;text-shadow:0 3px 0 #34435c;margin-bottom:3px} #overlayListaResultados .home-hero h2{font-size:12px!important;color:#4ed6ff!important;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:9px!important}
#overlayListaResultados .hh-premio-val{color:#ffe16b!important} #overlayListaResultados .hh-last-draw{background:rgba(4,10,23,.62)!important;border:1px solid rgba(123,160,255,.28)!important} #overlayListaResultados .hh-ball{background:radial-gradient(circle at 30% 25%,#f4d8ff,#9d32dd 42%,#551180 78%)!important;color:#fff!important;border:1px solid #e7a9ff;box-shadow:0 3px 8px rgba(0,0,0,.35)} #overlayListaResultados .hh-stats-btn{background:linear-gradient(135deg,#006dff,#00b7ff)!important;border:1px solid #8ee5ff!important}
.home-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:8px}.home-feature-card{min-height:68px;border:1px solid var(--fc,#398cff);border-radius:15px;background:linear-gradient(145deg,color-mix(in srgb,var(--fc,#398cff) 42%,#07101f),#0b1322 72%);box-shadow:inset 0 1px rgba(255,255,255,.12),0 5px 14px rgba(0,0,0,.28);color:#fff;display:flex;align-items:center;gap:9px;padding:10px;text-align:left;font-family:'Baloo 2',sans-serif;cursor:pointer}.home-feature-card .hfc-icon{width:39px;height:39px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(5,9,20,.38);border:1px solid var(--fc,#398cff);flex:none}.home-feature-card strong{display:block;font-size:12px;line-height:1.05}.home-feature-card small{display:block;font-size:8.5px;color:#d6dfef;line-height:1.2;margin-top:4px}
#overlayListaResultados .home-premium-card{margin:0 8px 14px!important;border:1px solid #293f66!important;background:linear-gradient(135deg,#111a2e,#0a1020)!important;box-shadow:0 5px 16px rgba(0,0,0,.35)!important}
#homeSideNav{position:fixed;z-index:90;left:0;top:0;bottom:0;width:68px;background:linear-gradient(180deg,#0c1528,#07101f);border-right:1px solid #1d4779;box-shadow:5px 0 20px rgba(0,0,0,.4);padding:12px 6px;display:flex;flex-direction:column;gap:9px;align-items:center} #homeSideNav .hs-menu{width:48px;height:48px;border-radius:14px;border:1px solid #346aa7;background:#111d33;color:#fff;font-size:24px} #homeSideNav .hs-item{width:56px;min-height:52px;border:1px solid #1f3557;background:#0c1527;color:#dce8fa;border-radius:13px;font-size:7.5px;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:5px 2px} #homeSideNav .hs-item span{font-size:18px;line-height:1} #homeSideNav .hs-item.active{background:linear-gradient(145deg,#a10df0,#5b18dc);border-color:#dd72ff;box-shadow:0 0 15px rgba(188,42,255,.55);color:#fff} #bottomNav{display:none!important}
@media(max-width:360px){#overlayListaResultados{padding-left:66px!important}#homeSideNav{width:60px}.home-feature-grid{grid-template-columns:1fr}.home-feature-card{min-height:58px}}
</style>
'''
if 'home-design-neon-0540' not in s: s=s.replace('</head>',css+'\n</head>',1)

anchor='<div class="overlay-full show" id="overlayListaResultados" style="z-index:74;padding-bottom:96px;">'
side='''
<aside id="homeSideNav" aria-label="Atalhos da tela inicial">
<button class="hs-menu" id="homeSideMenu" aria-label="Abrir menu">☰</button>
<button class="hs-item active" data-home-target="btnInicioAtalho"><span>⌂</span>Início</button>
<button class="hs-item" data-home-target="btnTendenciaAtalho"><span>▥</span>Análise</button>
<button class="hs-item" data-home-target="btnFechamentoAtalho"><span>▦</span>Combinações</button>
<button class="hs-item" data-home-target="btnSimularAtalho"><span>▤</span>Calculadora</button>
<button class="hs-item" data-home-target="btnJogosSalvosAtalho2"><span>★</span>Jogos</button>
</aside>'''
if 'id="homeSideNav"' not in s: s=s.replace(anchor,anchor+'\n'+side,1)

grid='''
<div class="home-feature-grid" id="homeFeatureGrid">
<button class="home-feature-card" style="--fc:#7b20d8" data-home-target="btnTendenciaAtalho"><span class="hfc-icon">▥</span><span><strong>Análise</strong><small>Estatísticas e frequências</small></span></button>
<button class="home-feature-card" style="--fc:#087cff" data-home-target="btnFechamentoAtalho"><span class="hfc-icon">⚙</span><span><strong>Combinações</strong><small>Gere jogos com filtros avançados</small></span></button>
<button class="home-feature-card" style="--fc:#00a66a" data-home-target="btnJogosSalvosAtalho2"><span class="hfc-icon">▶</span><span><strong>Jogos</strong><small>Gerencie seus jogos e resultados</small></span></button>
<button class="home-feature-card" style="--fc:#e98a00" data-home-target="btnSimularAtalho"><span class="hfc-icon">▤</span><span><strong>Calculadora</strong><small>Probabilidades e estimativas</small></span></button>
<button class="home-feature-card" style="--fc:#d41948" data-home-target="btnTendenciaAtalho"><span class="hfc-icon">◎</span><span><strong>Palpites</strong><small>Sugestões inteligentes</small></span></button>
<button class="home-feature-card" style="--fc:#08b7cf" data-home-target="btnTendenciaAtalho"><span class="hfc-icon">♛</span><span><strong>Resultados</strong><small>Consulte os últimos concursos</small></span></button>
</div>'''
needle='  <div class="home-premium-card" id="homePremiumCardTendencia" style="cursor:pointer;">'
if 'id="homeFeatureGrid"' not in s: s=s.replace(needle,grid+'\n'+needle,1)

js='''<script id="home-design-neon-js-0540">
document.addEventListener('click',function(e){const b=e.target.closest('[data-home-target]');if(!b)return;const t=document.getElementById(b.dataset.homeTarget);if(t)t.click();});
document.getElementById('homeSideMenu')?.addEventListener('click',()=>document.getElementById('btnMenu')?.click());
</script>'''
if 'home-design-neon-js-0540' not in s: s=s.replace('</body>',js+'\n</body>',1)

p.write_text(s,encoding='utf-8')
sw=Path('sw.js');t=sw.read_text(encoding='utf-8');t=re.sub(r"const CACHE_NAME = 'thor-loterias-[^']+';",f"const CACHE_NAME = 'thor-loterias-{VER}';",t,count=1);sw.write_text(t,encoding='utf-8')
