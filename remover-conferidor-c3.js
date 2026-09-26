(function(){
  'use strict';
  if(document.getElementById('thorRemoverConferidorC3'))return;
  var estilo=document.createElement('style');
  estilo.id='thorRemoverConferidorC3';
  estilo.textContent='#geradorConferenciaResumo{display:none!important}';
  document.head.appendChild(estilo);
})();