/* THOR LOTERIAS — Fechamento Personalizado sem tela intermediária de escolher loteria */
(function(){
  function abrirDireto(e){
    const btn=e.target&&e.target.closest?e.target.closest('#btnAbrirFechamentoAtalho'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    try{
      const code=(window.homeGameAtual&&window.GERADOR_APOSTA_SIZE&&window.GERADOR_APOSTA_SIZE[window.homeGameAtual.code])?window.homeGameAtual.code:'LF';
      const escolha=document.getElementById('overlayGeradorLoteria');
      if(escolha)escolha.classList.remove('show');
      if(typeof window.abrirGeradorFiltro==='function')window.abrirGeradorFiltro(code);
      else if(typeof abrirGeradorFiltro==='function')abrirGeradorFiltro(code);
    }catch(err){
      console.error('Falha ao abrir Fechamento Personalizado:',err);
      if(typeof window.abrirGeradorFiltro==='function')window.abrirGeradorFiltro('LF');
    }
  }
  document.addEventListener('click',abrirDireto,true);
})();
