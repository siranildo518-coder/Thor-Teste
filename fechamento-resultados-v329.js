(function(){
  function aplicar(){var tela=document.getElementById('overlayGeradorFiltro'),titulo=document.getElementById('geradorFiltroTitulo');if(!tela||!titulo)return;tela.classList.toggle('thor-mega-topo',(titulo.textContent||'').trim()==='Mega-Sena')}
  function iniciar(){var titulo=document.getElementById('geradorFiltroTitulo');if(!titulo)return;new MutationObserver(aplicar).observe(titulo,{childList:true,subtree:true,characterData:true});aplicar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
