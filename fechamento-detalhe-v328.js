(function(){
  var cores={'Mega-Sena':'#12df54','Lotofácil':'#c62cff','Quina':'#1888ff','Dia de Sorte':'#f1b900','Lotomania':'#ef2733','Timemania':'#13c7bf','Dupla Sena':'#ff7b0b','Super Sete':'#7445ee'};
  function aplicar(){var tela=document.getElementById('overlayGeradorFiltro'),titulo=document.getElementById('geradorFiltroTitulo');if(!tela||!titulo)return;var nome=(titulo.textContent||'').trim();tela.style.setProperty('--lot',cores[nome]||'#12df54')}
  function iniciar(){var titulo=document.getElementById('geradorFiltroTitulo');if(!titulo)return;new MutationObserver(aplicar).observe(titulo,{childList:true,subtree:true,characterData:true});aplicar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
