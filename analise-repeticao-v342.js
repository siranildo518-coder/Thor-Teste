(function(){
  function melhorar(){
    var cont=document.getElementById('tendConteudo');if(!cont)return;
    var card=cont.querySelector('.stat-card');if(!card||card.dataset.thorRep)return;
    var titulo=card.querySelector('.stat-card-title');if(!titulo||!/(repeti)/i.test(titulo.textContent))return;
    var mediaLinha=card.querySelector('.stat-line'),media=(mediaLinha&&mediaLinha.textContent.match(/[\d,.]+$/)||['0'])[0];
    var nota=cont.querySelector('.stat-note-dark'),total=(nota&&nota.textContent.match(/últimos\s+(\d+)/i)||['','0'])[1];
    var linhas=[];card.querySelectorAll('.stat-line').forEach(function(el,i){if(i===0)return;var t=el.textContent.trim(),m=t.match(/^(\d+\s+repetidas):\s*(\d+x)\s*\(([^)]+)\)/i);if(!m)return;var pct=parseFloat(m[3].replace('.','').replace(',','.'))||0;linhas.push('<div class="thor-rep-linha"><span>'+m[1]+':</span><span>'+m[2]+' ('+m[3]+')</span><span class="thor-rep-barra"><i style="width:'+Math.min(100,pct)+'%"></i></span><span class="thor-rep-pct">'+m[3]+'</span></div>')});
    card.dataset.thorRep='1';card.classList.add('thor-repeticao');card.innerHTML='<div class="thor-rep-titulo">▥ &nbsp; ANÁLISE DE REPETIÇÃO</div><div class="thor-rep-resumo"><div class="thor-rep-box"><div class="thor-rep-icone">⟳</div><div class="thor-rep-dado">Média de repetição<strong>'+media+'</strong></div></div><div class="thor-rep-box"><div class="thor-rep-icone">▤</div><div class="thor-rep-dado">Total de concursos<strong>'+total+'</strong></div></div></div><div class="thor-rep-dist-titulo">Distribuição:</div><div class="thor-rep-linhas">'+linhas.slice(0,4).join('')+'</div>';
  }
  function iniciar(){var c=document.getElementById('tendConteudo');if(!c)return;new MutationObserver(melhorar).observe(c,{childList:true,subtree:true});melhorar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
