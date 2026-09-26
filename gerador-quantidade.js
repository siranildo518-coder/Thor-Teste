// THOR LOTERIAS - quantidade de jogos no gerador
// Base 142 preservada. Permite escolher de 1 a 30 jogos.
(function(){
  function aplicar(){
    var controls=document.querySelector('.controls'), btn=document.getElementById('gerar');
    if(!controls||!btn||document.getElementById('qtdJogos'))return false;
    var bloco=document.createElement('div');
    bloco.id='thorQtdJogos';
    bloco.style.marginTop='10px';
    bloco.innerHTML='<label class="label" for="qtdJogos">Quantidade de jogos (1 a 30)</label><input class="field" id="qtdJogos" type="number" min="1" max="30" value="30" inputmode="numeric">';
    controls.appendChild(bloco);
    var input=document.getElementById('qtdJogos');
    function qtd(){var n=parseInt(input.value,10);if(!Number.isFinite(n))n=30;n=Math.max(1,Math.min(30,n));return n}
    function atualizar(){var n=qtd();btn.innerHTML='🎲 &nbsp; GERAR '+n+' JOGO'+(n===1?'':'S')}
    input.addEventListener('input',atualizar);input.addEventListener('change',function(){input.value=qtd();atualizar()});
    atualizar();
    function instalarRender(){
      if(typeof window.render!=='function')return setTimeout(instalarRender,0);
      if(window.__thorQtdRender)return;
      var original=window.render;
      window.render=function(jogos,key,n){return original((Array.isArray(jogos)?jogos:[]).slice(0,qtd()),key,n)};
      window.__thorQtdRender=true;
    }
    instalarRender();
    return true;
  }
  if(!aplicar())document.addEventListener('DOMContentLoaded',aplicar,{once:true});
})();