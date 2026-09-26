(function(){
  function iniciar(){
    var head=document.querySelector('.head'),controls=document.querySelector('.controls'),out=document.getElementById('out'),status=document.getElementById('status'),go=document.getElementById('gerar'),save=document.getElementById('salvar');
    if(!head||!controls||!out||!go||window.__thorGeradorVisual)return;window.__thorGeradorVisual=true;
    head.innerHTML='<img class="thor-gerador-topo" src="./gerador-topo-v319.jpg" alt="Gerador de Palpites">';
    var baseLabel=controls.querySelector('label[for="conc"],.label'),baseInput=document.getElementById('conc');
    if(baseLabel)baseLabel.textContent='BASE DE ANÁLISE — concursos anteriores (3 a 100)';
    if(baseInput){baseInput.min='3';baseInput.max='100';if(baseInput.value==='50')baseInput.value='10'}
    var dezenas=document.createElement('div');dezenas.id='thorQtdDezenas';dezenas.innerHTML='<label class="label" for="qtdDezenas">QUANTAS DEZENAS USAR? <small>Digite de 1 a 30</small></label><input class="field" id="qtdDezenas" type="number" min="1" max="30" value="15" inputmode="numeric">';controls.insertBefore(dezenas,controls.firstChild);
    document.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('.opt').forEach(function(x){x.classList.remove('active')});b.classList.add('active')})});
    var modes=document.createElement('div');modes.className='thor-mode-wrap';modes.innerHTML='<div class="thor-mode-title"><b>3</b> TIPO DE PALPITE</div><button class="thor-mode active" type="button">⚙ Sequencial</button><button class="thor-mode" type="button">⤨ Aleatório</button><button class="thor-mode" type="button">▥ Equilibrado</button>';controls.after(modes);
    modes.querySelectorAll('.thor-mode').forEach(function(b){b.onclick=function(){modes.querySelectorAll('.thor-mode').forEach(function(x){x.classList.remove('active')});b.classList.add('active')}});
    var title=document.createElement('div');title.className='thor-results-title';title.innerHTML='<span>★ SEUS PALPITES</span><small>GERADOS COM BASE NA ESTATÍSTICA</small>';out.before(title);
    var actions=document.createElement('div');actions.className='thor-actions';actions.innerHTML='<button class="thor-action thor-clear" type="button">🗑 LIMPAR</button>';actions.insertBefore(save,actions.lastChild);go.after(actions);
    actions.querySelector('.thor-clear').onclick=function(){out.innerHTML='';save.style.display='none';status.textContent='Palpites limpos.'};
    out.addEventListener('click',function(e){var b=e.target.closest('.copy-game');if(!b)return;var nums=[].map.call(b.closest('.game').querySelectorAll('.ball'),function(x){return x.textContent.trim()}).join(' ');if(navigator.clipboard)navigator.clipboard.writeText(nums);status.textContent='Jogo copiado.'});
    var obs=new MutationObserver(function(){out.querySelectorAll('.game').forEach(function(g){if(g.querySelector('.copy-game'))return;var b=document.createElement('button');b.className='copy-game';b.type='button';b.textContent='▣ Copiar';g.appendChild(b)})});obs.observe(out,{childList:true,subtree:true});
    var footer=document.createElement('div');footer.className='thor-footer';footer.textContent='SONHE · ANALISE · JOGUE · BOA SORTE!';document.querySelector('.body').appendChild(footer);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
