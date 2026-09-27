// C105 THOR Teste - oculta somente itens escolhidos no menu lateral; funcoes permanecem intactas.
(function(){'use strict';
if(window.__thorMenuLimpoC105)return;window.__thorMenuLimpoC105=1;
var ids=['menuMinhasSequencias','menuAnalisadorJogos','menuPadroes','menuGeradorPalpites','btnMinhasSequencias','btnAnalisadorJogos','btnPadroes','btnGeradorPalpites'];
function norm(s){try{return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase()}catch(_){return (s||'').replace(/\s+/g,' ').trim().toLowerCase()}}
function ocultar(){
 ids.forEach(function(id){var e=document.getElementById(id);if(e)e.style.setProperty('display','none','important')});
 var raiz=document.getElementById('drawer')||document.querySelector('#sideMenu,#menuLateral,.side-menu,.sidebar')||document.body;
 var alvos={'minhas sequencias':1,'analisador de jogos':1,'padroes':1,'gerador de palpites':1};
 var els=raiz.querySelectorAll('button,a,li,.drawer-item,.menu-item,.side-menu-item');
 for(var i=0;i<els.length;i++){
  var t=norm(els[i].textContent).replace(/^[^a-z0-9]+/,'').trim();
  if(alvos[t])els[i].style.setProperty('display','none','important')
 }
}
function iniciar(){ocultar();var o=new MutationObserver(ocultar);o.observe(document.body,{childList:true,subtree:true});setTimeout(ocultar,100);setTimeout(ocultar,600);setTimeout(ocultar,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();