(function(){
 function $(x){return document.getElementById(x)}
 function carregarCalculoThor3(){
   if(document.getElementById('thor3FalhaProb'))return;
   var s=document.createElement('script');s.id='thor3FalhaProb';s.src='./falha-prob-thor3.js?v=thor3';document.head.appendChild(s);
 }
 function instalar(){
   carregarCalculoThor3();
   var drawer=$('drawer'); if(!drawer)return;
   var b=$('menuGeradorPalpites');
   if(!b){var ref=$('menuAtualizar')||$('menuPadroes');if(!ref)return;b=document.createElement('button');b.className='drawer-item';b.id='menuGeradorPalpites';b.type='button';b.innerHTML='<span class="ic">🎯</span> Gerador de Palpites';ref.parentNode.insertBefore(b,ref)}
   b.onclick=function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();location.href='./gerador.html?v=base142-gerador-aba-1'};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar,{once:true});else instalar();
 var o=new MutationObserver(function(){if($('drawer'))instalar()});o.observe(document.documentElement,{childList:true,subtree:true});
})();