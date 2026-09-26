(function(){
  'use strict';
  if(window.__thorCopiarTodosC2)return;
  window.__thorCopiarTodosC2=true;

  function jogosDaTela(){
    return Array.from(document.querySelectorAll('#out .game')).map(function(card){
      return Array.from(card.querySelectorAll('.ball')).map(function(ball){
        var n=parseInt((ball.textContent||'').replace(/\D/g,''),10);
        return Number.isFinite(n)?String(n).padStart(2,'0'):'';
      }).filter(Boolean).join(' ');
    }).filter(Boolean);
  }

  function copiarFallback(texto){
    var area=document.createElement('textarea');
    area.value=texto;
    area.setAttribute('readonly','');
    area.style.position='fixed';
    area.style.opacity='0';
    document.body.appendChild(area);
    area.select();
    var ok=false;
    try{ok=document.execCommand('copy')}catch(_){}
    area.remove();
    return ok;
  }

  async function copiarTodos(){
    var jogos=jogosDaTela();
    var status=document.getElementById('status');
    if(!jogos.length){
      if(status)status.textContent='Gere os jogos antes de copiar.';
      return;
    }
    var texto=jogos.join('\n');
    var ok=false;
    try{
      if(navigator.clipboard&&window.isSecureContext){
        await navigator.clipboard.writeText(texto);
        ok=true;
      }
    }catch(_){}
    if(!ok)ok=copiarFallback(texto);
    if(status)status.textContent=ok
      ? '✓ '+jogos.length+' jogos copiados. Agora é só colar no Mobile Loterias.'
      : 'Não foi possível copiar. Tente novamente.';
    var btn=document.getElementById('copiarTodosJogosC2');
    if(btn&&ok){
      var antigo=btn.innerHTML;
      btn.innerHTML='✓ COPIADOS';
      setTimeout(function(){btn.innerHTML=antigo},1800);
    }
  }

  function montar(){
    var salvar=document.getElementById('salvar');
    if(!salvar||document.getElementById('copiarTodosJogosC2'))return false;
    var linha=document.createElement('div');
    linha.id='acoesJogosC2';
    salvar.parentNode.insertBefore(linha,salvar);
    linha.appendChild(salvar);
    var copiar=document.createElement('button');
    copiar.id='copiarTodosJogosC2';
    copiar.type='button';
    copiar.innerHTML='▣ COPIAR TODOS';
    copiar.onclick=copiarTodos;
    linha.appendChild(copiar);

    var css=document.createElement('style');
    css.id='copiarTodosJogosC2Css';
    css.textContent=
      '#acoesJogosC2{display:flex;gap:7px;width:94%;margin:9px 3% 0;align-items:stretch}'+
      '#acoesJogosC2 #salvar,#copiarTodosJogosC2{display:none;flex:1;width:auto!important;margin:0!important;height:36px;border:2px solid #ff9a00;border-radius:8px;color:#fff;font-size:11px;font-weight:900;box-shadow:inset 0 2px 2px rgba(255,255,255,.45),inset 0 -4px 6px rgba(0,0,0,.42),0 3px 0 #884100;text-shadow:0 1px 2px #000}'+
      '#acoesJogosC2 #salvar{background:linear-gradient(#36a9ff,#1476d4 45%,#07509e)}'+
      '#copiarTodosJogosC2{background:linear-gradient(#39ec77,#13bd4e 46%,#087b31)}'+
      '#acoesJogosC2 #salvar[style*="display: block"],#acoesJogosC2 #salvar[style*="display:block"]{display:block!important}'+
      '#acoesJogosC2 #salvar[style*="display: block"]+#copiarTodosJogosC2,#acoesJogosC2 #salvar[style*="display:block"]+#copiarTodosJogosC2{display:block}'+
      '#acoesJogosC2 button:active{transform:translateY(2px);box-shadow:inset 0 3px 5px rgba(0,0,0,.42),0 1px 0 #884100}';
    document.head.appendChild(css);

    var obs=new MutationObserver(function(){
      copiar.style.display=jogosDaTela().length?'block':'none';
    });
    obs.observe(document.getElementById('out'),{childList:true,subtree:true});
    return true;
  }

  if(!montar()){
    var tentativas=0;
    var timer=setInterval(function(){if(montar()||++tentativas>40)clearInterval(timer)},250);
  }
})();