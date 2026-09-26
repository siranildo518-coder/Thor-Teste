// THOR 7 V109 - fixa somente o topo visual da tela inicial; login e trava preservados.
(function(){'use strict';if(window.__thorTopoFixoV109)return;window.__thorTopoFixoV109=1;
function instalar(){
 var alvo=null,imgs=Array.from(document.images||[]);
 for(var i=0;i<imgs.length;i++){var im=imgs[i],r=im.getBoundingClientRect();if(r.top>=0&&r.top<120&&r.width>300&&r.height>100){alvo=im;break}}
 if(!alvo)return false;
 var topo=alvo.parentElement;
 if(!topo)return false;
 topo.style.position='sticky';topo.style.top='0';topo.style.zIndex='500';topo.style.background='#07101f';
 return true;
}
function iniciar(){var n=0,t=setInterval(function(){if(instalar()||++n>50)clearInterval(t)},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();