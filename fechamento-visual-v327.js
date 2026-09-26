(function(){
  var dados={MS:['Mega-Sena','6 dezenas de 1 a 60',['10','33','60'],'#11bd48'],LF:['Lotofácil','15 dezenas de 1 a 25',['01','12','25'],'#ba14e1'],QN:['Quina','5 dezenas de 1 a 80',['07','28','80'],'#087cf0'],DIA:['Dia de Sorte','7 dezenas de 1 a 31',['03','17','31'],'#f0b300'],LM:['Lotomania','50 dezenas de 1 a 100',['12','37','100'],'#ee202a'],TM:['Timemania','10 dezenas de 1 a 80',['11','45','80'],'#05bbb8'],DS:['Dupla Sena','6 dezenas de 1 a 50',['08','25','50'],'#f47708'],S7:['Super Sete','7 números de 0 a 9',['03','07','09'],'#7a36e8']};
  function decorar(){
    var lista=document.getElementById('geradorLoteriaLista');if(!lista)return;
    lista.querySelectorAll('.gerador-loteria-btn').forEach(function(b){if(b.dataset.thorVisual)return;var d=dados[b.dataset.code];if(!d)return;b.dataset.thorVisual='1';b.style.setProperty('--fc',d[3]);b.innerHTML='<span class="thor-fecha-icon">☘</span><span class="thor-fecha-nome">'+d[0]+'</span><span class="thor-fecha-sub">'+d[1]+'</span><span class="thor-fecha-bolas">'+d[2].map(function(n){return '<i class="thor-fecha-bola">'+n+'</i>'}).join('')+'</span><span class="thor-fecha-seta">›</span>'});
    if(lista.children.length&&!lista.querySelector('.thor-fecha-rodape')){var r=document.createElement('div');r.className='thor-fecha-rodape';r.textContent='☘  BOA SORTE!  ☘';lista.appendChild(r)}
  }
  function iniciar(){var lista=document.getElementById('geradorLoteriaLista');if(!lista)return;new MutationObserver(decorar).observe(lista,{childList:true});decorar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
