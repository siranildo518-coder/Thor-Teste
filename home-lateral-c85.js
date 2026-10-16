/* Usa os mesmos botões do menu, preservando seus eventos e destinos. */
(function(){'use strict';
function start(){
 const home=document.getElementById('overlayListaResultados');if(!home||home.dataset.c85Ready)return;
 home.dataset.c85Ready='1';home.classList.add('thor-c85');
 const image=document.getElementById('thorHomeTopoImg');if(image){image.src='./home-lateral-referencia-c85.png';image.width=852;image.height=1846}
 const paths={menu:'M12 2 2 10v12h7v-7h6v7h7V10z',tendencia:'M3 20h4V11H3zm7 0h4V5h-4zm7 0h4V1h-4z',padroes:'M2 2h5v5H2zm8 0h5v5h-5zm8 0h5v5h-5zM2 10h5v5H2zm8 0h5v5h-5zm8 0h5v5h-5zM2 18h5v5H2zm8 0h5v5h-5zm8 0h5v5h-5z',jogos:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',comeco:'M4 2h2v2h14l-3 5 3 5H6v9H4z'};
 const side=document.getElementById('homeSideNav');
 const buttons=[...side.querySelectorAll('button')];
 buttons.forEach(b=>{
  let label,key;
  if(b.id==='homeSideMenu'){label='Menu';key='menu'}
  else if(b.id==='thorMenuComecoFinal'){label='Começo e Final';key='comeco'}
  else if(b.dataset.homeTarget==='menuPadroes'){label='Padrões';key='padroes'}
  else if(b===buttons[buttons.length-1]){label='Jogos Oficiais';key='jogos'}
  else{label='Tendência';key='tendencia'}
  b.innerHTML='<span class="c85-side-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[key]+'"/></svg></span><span class="c85-side-label">'+label+'</span>';b.setAttribute('aria-label',label);
 });
 const version=home.querySelector('.c84-version');if(version)version.textContent='THOR TESTE • C85 • Vidro azul lateral';
 const icons={
 'Análise':'M4 20V11h3v9m4 0V5h3v15m4 0V2h3v18',
 'Combinações':'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2 2m8.8 8.8 2 2M5.6 18.4l2-2m8.8-8.8 2-2M17 12a5 5 0 1 0-10 0 5 5 0 0 0 10 0',
 'Calculadora':'M5 2h14v20H5zM8 5h8v4H8zM8 13h1m3 0h1m3 0h1M8 17h1m3 0h1m3 0h1',
 'Escolha pra mim':'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
 'Minhas Sequências':'m3 6 5 6 4-9 4 9 5-6-3 14H6z',
 'Falhas e concursos':'m3 18 6-6 4 3 7-10m-6 0h6v6',
 'Falhas':'m14 2-9 12h6l-1 8 9-12h-6z',
 'Jogos Salvos':'M6 3h12v19l-6-4-6 4z',
 'Rastreador de Tendência':'m3 18 6-6 4 3 7-10m-6 0h6v6',
 'Desdobrador':'M12 3v7m0 0-7 7m7-7 7 7M9 2h6v4H9zM2 17h6v5H2zm14 0h6v5h-6z'};
 const grid=document.getElementById('homeFeatureGrid');
 function decorate(){grid.querySelectorAll('.home-feature-card').forEach(b=>{const name=b.querySelector('strong')?.textContent.trim(),icon=b.querySelector('.hfc-icon');if(icon&&icons[name]&&!icon.querySelector('svg'))icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[name]+'"/></svg>'})}
 decorate();new MutationObserver(decorate).observe(grid,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
