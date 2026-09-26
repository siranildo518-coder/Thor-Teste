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
    area.value=texto;area.setAttribute('readonly','');
    area.style.position='fixed';area.style.opacity='0';
    document.body.appendChild(area);area.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(_){}
    area.remove();return ok;
  }

  async function copiarTodos(){
    var jogos=jogosDaTela(),status=document.getElementById('status');
    if(!jogos.length){if(status)status.textContent='Gere os jogos antes de copiar.';return}
    var texto=jogos.join('\n'),ok=false;
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(texto);ok=true}}catch(_){}
    if(!ok)ok=copiarFallback(texto);
    if(status)status.textContent=ok?'✓ '+jogos.length+' jogos copiados. Agora é só colar no Mobile Loterias.':'Não foi possível copiar. Tente novamente.';
    var btn=document.getElementById('copiarTodosJogosC2');
    if(btn&&ok){var antigo=btn.innerHTML;btn.innerHTML='✓ COPIADOS';setTimeout(function(){btn.innerHTML=antigo},1800)}
  }

  function garantirBotao(){
    var actions=document.querySelector('.thor-actions');
    if(!actions)return false;
    var btn=document.getElementById('copiarTodosJogosC2');
    if(!btn){
      btn=document.createElement('button');
      btn.id='copiarTodosJogosC2';btn.type='button';
      btn.innerHTML='▣ COPIAR TODOS';btn.onclick=copiarTodos;
    }
    if(btn.parentNode!==actions)actions.appendChild(btn);
    btn.style.display=jogosDaTela().length?'block':'none';
    return true;
  }

  function instalar(){
    if(!document.getElementById('copiarTodosJogosC2Css')){
      var css=document.createElement('style');css.id='copiarTodosJogosC2Css';
      css.textContent=
        '.thor-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}'+
        '#copiarTodosJogosC2{width:100%;height:46px;margin:0;border:2px solid #76ff9f;border-radius:13px;background:linear-gradient(#39ec77,#13bd4e 46%,#087b31);color:#fff;font-size:11px;font-weight:900;box-shadow:inset 0 2px 2px rgba(255,255,255,.5),inset 0 -4px 6px rgba(0,0,0,.42),0 3px 0 #075d2b;text-shadow:0 1px 2px #000}'+
        '#copiarTodosJogosC2:active{transform:translateY(2px);box-shadow:inset 0 3px 5px rgba(0,0,0,.42),0 1px 0 #075d2b}';
      document.head.appendChild(css);
    }
    garantirBotao();
    var out=document.getElementById('out');
    if(out)new MutationObserver(garantirBotao).observe(out,{childList:true,subtree:true});
    new MutationObserver(garantirBotao).observe(document.body,{childList:true,subtree:true});
    var n=0,t=setInterval(function(){garantirBotao();if(++n>40)clearInterval(t)},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar,{once:true});else instalar();
})();