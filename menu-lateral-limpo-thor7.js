// THOR 7 V107 - remove diretamente do menu lateral: Minhas Sequencias, Padroes e Gerador de Palpites. Login/trava intactos.
(function(){'use strict';if(window.__thorMenuLimpoV107)return;window.__thorMenuLimpoV107=1;
var re=/^(?:📊\s*)?minhas sequencias$|^(?:▦\s*)?padroes$|^(?:🎯\s*)?gerador de palpites$/i;
function norm(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function alvoPorId(){['menuMinhasSequencias','menuPadroes','menuGeradorPalpites','btnMinhasSequencias','btnPadroes','btnGeradorPalpites'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()})}
function remover(){alvoPorId();var raiz=document.querySelector('#sideMenu,#drawer,#menuLateral,.side-menu,.drawer,.sidebar,[class*="drawer"],[class*="side-menu"]')||document.body;Array.from(raiz.querySelectorAll('button,a,div,li')).forEach(function(el){var t=norm(el.innerText||el.textContent);if(re.test(t)){var item=el.closest('button,a,li,.menu-item,.drawer-item,.side-menu-item')||el;item.remove()}})}
function iniciar(){remover();var obs=new MutationObserver(remover);obs.observe(document.body,{childList:true,subtree:true,characterData:false});setTimeout(remover,100);setTimeout(remover,500);setTimeout(remover,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();