(function(){
  'use strict';

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
      botao.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      },true);
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
    adicionarBotao();
    var observador=new MutationObserver(adicionarBotao);
    observador.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',iniciar,{once:true});
  }else{
    iniciar();
  }
})();