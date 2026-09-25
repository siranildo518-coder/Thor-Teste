// THOR 7 V103 - remove a faixa completa de botoes das loterias somente na tela Posicionamento.
(function(){'use strict';
function ehFaixa(el){if(!el||el.id==='thorPosTabela')return false;var txt=(el.textContent||'').replace(/\s+/g,' ').trim();var temMega=/Mega-Sena/i.test(txt),temLoto=/Lotof[aá]cil/i.test(txt),temQuina=/Quina/i.test(txt);return temMega&&temLoto&&temQuina}
function limpar(){var tela=document.getElementById('thorComecoFinalBranco');if(!tela)return false;var todos=Array.from(tela.querySelectorAll('div,nav,section'));todos.forEach(function(el){if(ehFaixa(el)){var filhos=Array.from(el.children);var filhoComFaixa=filhos.some(ehFaixa);if(!filhoComFaixa)el.remove()}});return true}
function iniciar(){limpar();var tela=document.getElementById('thorComecoFinalBranco');if(tela)new MutationObserver(limpar).observe(tela,{childList:true,subtree:true});else{var n=0,t=setInterval(function(){if(limpar()||++n>80)clearInterval(t)},200)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();