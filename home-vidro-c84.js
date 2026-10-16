/* C84: reaproveita elementos e listeners reais; resultados continuam dinâmicos. */
(function(){
'use strict';
function start(){
 const home=document.getElementById('overlayListaResultados');
 if(!home||home.dataset.c84Ready)return;
 home.dataset.c84Ready='1'; home.classList.add('thor-c84');
 const header=home.querySelector('.home-header');
 let image=document.getElementById('thorHomeTopoImg');
 if(!image){image=document.createElement('img');image.id='thorHomeTopoImg';header.replaceChildren(image)}
 image.src='./home-vidro-referencia-c84.png';image.alt='THOR LOTERIAS — Estratégia em cada jogo';image.width=709;image.height=1536;
 const grid=document.getElementById('homeFeatureGrid');
 grid.querySelectorAll('.home-feature-card').forEach(b=>{if(b.querySelector('strong')?.textContent.trim()==='Palpites')b.remove()});
 const title=document.createElement('h2');title.className='c84-tools';title.textContent='Ferramentas';grid.before(title);
 function click(id){const target=document.getElementById(id);if(target)target.click()}
 function card(id,name,description,icon,color,action){
  let b=document.getElementById(id);if(b)return b;
  b=document.createElement('button');b.type='button';b.id=id;b.className='home-feature-card';b.style.setProperty('--fc',color);
  const symbol=document.createElement('span');symbol.className='hfc-icon';symbol.textContent=icon;
  const text=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=name;small.textContent=description;text.append(strong,small);b.append(symbol,text);b.addEventListener('click',action);grid.append(b);return b;
 }
 // Os atalhos novos acessam módulos já disponíveis nesta base de teste.
 card('c84Falhas','Falhas','Análise de falhas','ϟ','#9850ff',()=>{click('btnTendenciaAtalho');click('subtabFalhas')});
 card('c84Tendencia','Rastreador de Tendência','Dezenas em alta e queda','↗','#18bfca',()=>{if(typeof abrirAltaQueda==='function')abrirAltaQueda()});
 card('c84Desdobrar','Desdobrador','Gere suas combinações','♧','#167dff',()=>click('btnFechamentoAtalho'));
 // A primeira abertura também deve exibir a escolha automática, sem depender do SW.
 card('btnEscolhaPraMim','Escolha pra mim','Sugestão automática','★','#00b984',()=>{location.href='./gerador.html'});
 const orders={'Análise':1,'Combinações':2,'Calculadora':3,'Escolha pra mim':4,'Minhas Sequências':5,'Falhas e concursos':6,'Falhas':7,'Jogos Salvos':8,'Rastreador de Tendência':9,'Desdobrador':10,'Melhores dezenas':20};
 function order(){grid.querySelectorAll('.home-feature-card').forEach(b=>{const label=b.querySelector('strong');if(!label)return;const n=orders[label.textContent.trim()];if(n&&b.style.order!==String(n))b.style.order=n})}
 order();new MutationObserver(order).observe(grid,{childList:true});
 const version=document.createElement('div');version.className='c84-version';version.textContent='THOR TESTE • C84 • Vidro azul';grid.after(version);
 const paths=['M12 2 2 10v12h7v-7h6v7h7V10z','M3 20h3V10H3zm7 0h3V5h-3zm7 0h3V1h-3z','M2 2h8v8H2zm12 0h8v8h-8zM2 14h8v8H2zm12 0h8v8h-8z','M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z'];
 const nav=document.createElement('nav');nav.className='c84-nav';nav.setAttribute('aria-label','Navegação da tela inicial');
 ['Início','Tendências','Padrões','Menu'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';if(i===0)b.className='active';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[i]+'"/></svg><span>'+name+'</span>';b.onclick=()=>{if(i===0)home.scrollTo({top:0,behavior:'smooth'});if(i===1&&typeof abrirAltaQueda==='function')abrirAltaQueda();if(i===2)click('menuPadroes');if(i===3)click('btnMenu')};nav.append(b)});home.append(nav);
 // A imagem é apenas o topo. Concurso e dezenas vêm do renderizador original.
 const hero=document.getElementById('homeHero');
 function decorate(){
  const panel=hero.querySelector('.home-hero');if(!panel)return;
  const name=typeof homeGameAtual!=='undefined'?homeGameAtual.nome:'';
  const data=typeof homeCache!=='undefined'&&typeof homeGameAtual!=='undefined'?homeCache[homeGameAtual.slug]:null;
  const month=data&&(data.mesSorte||data.nomeMesSorte);
  if(month&&!panel.querySelector('.c84-month')){const badge=document.createElement('div');badge.className='c84-month';badge.textContent='Mês da sorte • '+month;panel.querySelector('.hh-last-draw')?.append(badge)}
  if(name&&panel.getAttribute('data-loteria')!==name)panel.setAttribute('data-loteria',name);
  panel.querySelectorAll('.hh-balls').forEach(row=>{const count=row.querySelectorAll('.hh-ball').length;const cols=count>8?(count===15?8:Math.ceil(count/2)):count;if(cols)row.style.setProperty('--c84-cols',cols)});
 }
 decorate();new MutationObserver(decorate).observe(hero,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
