(function(){
  var topos={'Mega-Sena':'./mega-topo-v329.jpg','Lotofácil':'./lotofacil-topo-v330.jpg','Quina':'./quina-topo-v330.jpg','Dia de Sorte':'./dia-sorte-topo-v330.jpg','Lotomania':'./lotomania-topo-v330.jpg','Timemania':'./timemania-topo-v330.jpg','Dupla Sena':'./dupla-sena-topo-v330.jpg','Super Sete':'./super-sete-topo-v330.jpg'};
  function aplicar(){var tela=document.getElementById('overlayGeradorFiltro'),titulo=document.getElementById('geradorFiltroTitulo');if(!tela||!titulo)return;var img=topos[(titulo.textContent||'').trim()];tela.classList.toggle('thor-loteria-topo',!!img);if(img)tela.style.setProperty('--thor-topo-img',"url('"+img+"')")}
  function iniciar(){var titulo=document.getElementById('geradorFiltroTitulo');if(!titulo)return;new MutationObserver(aplicar).observe(titulo,{childList:true,subtree:true,characterData:true});aplicar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
