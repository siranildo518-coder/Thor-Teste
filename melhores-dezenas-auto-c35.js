(function(){
'use strict';
var API='https://servicebus2.caixa.gov.br/portaldeloterias/api/';
var slugs={lotofacil:'lotofacil',megasena:'megasena',quina:'quina',lotomania:'lotomania',duplasena:'duplasena',timemania:'timemania',diadesorte:'diadesorte',supersete:'supersete',maismilionaria:'maismilionaria'};
var cache={};
function tela(){return document.getElementById('thorMelhoresDezenasTela')}
function sel(){return document.getElementById('thorMdLoteria')}
function numero(){return document.getElementById('thorMdNumero')}
function bolas(){return document.getElementById('thorMdConcurso')}
function cor(l){return {lotofacil:['#b45cff','#6414b5'],megasena:['#27b66c','#04542f'],quina:['#238eea','#064177'],lotomania:['#ffad31','#a74600'],duplasena:['#ef4b5b','#680815'],timemania:['#f7df45','#827000'],diadesorte:['#ffe45c','#9a6500'],supersete:['#d7ff4b','#527900'],maismilionaria:['#54c7c7','#075457']}[l]||['#4d7198','#07192e']}
function dezenas(d,l){
 var a=d&&d.listaDezenas;
 if(!Array.isArray(a)&&d&&Array.isArray(d.dezenasSorteadasOrdemSorteio))a=d.dezenasSorteadasOrdemSorteio;
 if(!Array.isArray(a))a=[];
 return a.map(function(x){x=String(x);return l==='supersete'?x:x.padStart(2,'0')});
}
function render(d,l){
 if(!d)return false;
 var n=Number(d.numero||d.numeroConcurso);
 var a=dezenas(d,l); if(!n||!a.length)return false;
 cache[l]=cache[l]||{}; cache[l][n]=d;
 if(numero())numero().textContent=n;
 var c=bolas(); if(c){c.innerHTML='';var cs=cor(l);a.forEach(function(x){var b=document.createElement('span');b.className='thor-md-bola';b.textContent=x;b.style.background='linear-gradient(180deg,'+cs[0]+','+cs[1]+')';c.appendChild(b)})}
 return true;
}
async function buscar(l,n){
 if(!slugs[l])return;
 if(n&&cache[l]&&cache[l][n]){render(cache[l][n],l);return}
 var u=API+slugs[l]+(n?'/'+n:'');
 try{var r=await fetch(u,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);var d=await r.json();render(d,l)}catch(e){console.warn('THOR Teste: resultado automático indisponível',l,n||'ultimo',e)}
}
function atualizar(){var s=sel();if(s&&s.value)buscar(s.value)}
function navegar(delta){
 var s=sel(),n=Number(numero()&&numero().textContent);if(!s||!s.value||!n)return;
 buscar(s.value,n+delta);
}
function ligar(){
 var s=sel(),a=document.getElementById('thorMdAnterior'),p=document.getElementById('thorMdProximo');
 if(!s||s.dataset.autoConcurso==='1')return false;
 s.dataset.autoConcurso='1';
 s.addEventListener('change',function(){setTimeout(atualizar,0)});
 if(a)a.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();navegar(-1)},true);
 if(p)p.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();navegar(1)},true);
 atualizar(); return true;
}
var mo=new MutationObserver(function(){ligar()});mo.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar,{once:true});else ligar();
setInterval(function(){var t=tela();if(t&&t.classList.contains('ativo'))atualizar()},300000);
})();