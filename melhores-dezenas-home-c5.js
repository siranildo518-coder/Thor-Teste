(function(){
  'use strict';
  var tela=null;

  function criarTela(){
    if(tela&&document.body.contains(tela))return tela;
    var estilo=document.getElementById('thorMelhoresDezenasCss');
    if(!estilo){
      estilo=document.createElement('style');
      estilo.id='thorMelhoresDezenasCss';
      estilo.textContent='#thorMelhoresDezenasTela{position:fixed;inset:0;z-index:100000;display:none;overflow-y:auto;background:linear-gradient(180deg,#03142b 0%,#061d38 44%,#020914 100%);font-family:Arial,sans-serif}#thorMelhoresDezenasTela.ativo{display:block}#thorMelhoresDezenasTopo{display:block!important;width:100vw!important;max-width:none!important;height:auto!important;margin:0!important;border:0!important;padding:0!important;object-fit:cover!important;background:#03142b}#thorMelhoresDezenasVoltar{position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;z-index:2;width:46px;height:46px;border:2px solid #f5a000;border-radius:12px;background:rgba(0,8,20,.86);color:#fff;font-size:30px;font-weight:900;line-height:38px;box-shadow:0 2px 8px rgba(0,0,0,.6)}#thorMelhoresDezenasConteudo{min-height:calc(100vh - 180px);padding:16px;box-sizing:border-box}';
      document.head.appendChild(estilo);
    }
    tela=document.createElement('section');
    tela.id='thorMelhoresDezenasTela';
    tela.setAttribute('aria-label','Melhores dezenas');
    tela.innerHTML='<button id="thorMelhoresDezenasVoltar" type="button" aria-label="Voltar">‹</button><img id="thorMelhoresDezenasTopo" src="https://siranildo518-coder.github.io/Thor-Teste/melhores-dezenas-topo-c9.jpg?v=thor7-c10" alt="Melhores dezenas"><main id="thorMelhoresDezenasConteudo"></main>';
    document.body.appendChild(tela);
    tela.querySelector('#thorMelhoresDezenasVoltar').onclick=function(e){e.preventDefault();e.stopPropagation();fecharTela()};
    return tela;
  }

  function abrirTela(){
    criarTela().classList.add('ativo');
    try{history.pushState({thorMelhoresDezenas:true},'',location.href)}catch(_){}
  }
  function fecharTela(){if(tela)tela.classList.remove('ativo')}

  function adicionarBotao(){
    var grade=document.getElementById('homeFeatureGrid');
    if(!grade)return false;
    var botao=document.getElementById('thorMelhoresDezenasHome');
    if(!botao){
      botao=document.createElement('button');
      botao.type='button';
      botao.className='home-feature-card';
      botao.id='thorMelhoresDezenasHome';
      botao.style.setProperty('--fc','#f0a000');
      botao.innerHTML='<span class="hfc-icon">◆</span><span><strong>Melhores dezenas</strong><small>Veja as dezenas em destaque</small></span>';
      botao.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();abrirTela()},true);
    }
    var jogos=document.getElementById('thorJogosSalvosHome');
    if(jogos&&jogos.parentNode===grade){
      if(jogos.nextElementSibling!==botao)grade.insertBefore(botao,jogos.nextSibling);
    }else if(botao.parentNode!==grade){
      grade.appendChild(botao);
    }
    return true;
  }

  function iniciar(){
    criarTela();
    adicionarBotao();
    window.addEventListener('popstate',fecharTela);
    var observador=new MutationObserver(adicionarBotao);
    observador.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();