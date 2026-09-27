(function(){
'use strict';
var API='https://servicebus2.caixa.gov.br/portaldeloterias/api/';
var slugs={lotofacil:'lotofacil',megasena:'megasena',quina:'quina',lotomania:'lotomania',duplasena:'duplasena',timemania:'timemania',diadesorte:'diadesorte',supersete:'supersete',maismilionaria:'maismilionaria'};
var cache={};window.THOR_MELHORES_HISTORICO=window.THOR_MELHORES_HISTORICO||{};
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
 cache[l]=cache[l]||{}; cache[l][n]=d;window.THOR_MELHORES_HISTORICO[l]=window.THOR_MELHORES_HISTORICO[l]||[];var hist=window.THOR_MELHORES_HISTORICO[l],item={numero:n,dezenas:a};var pos=hist.findIndex(function(x){return Number(x.numero)===n});if(pos>=0)hist[pos]=item;else hist.push(item);hist.sort(function(x,y){return Number(y.numero)-Number(x.numero)});
 if(numero())numero().textContent=n;
 var c=bolas(); if(c){c.innerHTML='';var cs=cor(l);a.forEach(function(x){var b=document.createElement('span');b.className='thor-md-bola';b.textContent=x;b.style.background='linear-gradient(180deg,'+cs[0]+','+cs[1]+')';c.appendChild(b)})}
 var t=tela(),base=Number(t&&t.dataset.calculoConcurso)||0;if(t&&base&&n>base){var mapa={};a.forEach(function(x){mapa[String(Number(x))]=1});t.querySelectorAll('.thor-md-fixar-bola,.thor-md-excluir-bola').forEach(function(b){var sp=b.querySelector('span'),ok=sp&&mapa[String(Number(sp.textContent))];b.classList.toggle('thor-md-sorteada',!!ok)})}
 return true;
}
async function buscar(l,n){
 if(!slugs[l])return;
 if(n&&cache[l]&&cache[l][n]){render(cache[l][n],l);return}
 var u=API+slugs[l]+(n?'/'+n:'');
 try{var r=await fetch(u,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);var d=await r.json();render(d,l)}catch(e){console.warn('THOR Teste: resultado automático indisponível',l,n||'ultimo',e)}
}
async function carregarHistorico(l,qtd,concursoBase){qtd=Math.max(1,Math.min(100,Number(qtd)||10));var atual=Number(concursoBase||numero()&&numero().textContent);if(!atual){await buscar(l);atual=Number(numero()&&numero().textContent)}if(!atual)return [];var tarefas=[];for(var i=0;i<qtd;i++){var n=atual-i;if(cache[l]&&cache[l][n])continue;tarefas.push((async function(num){var u=API+slugs[l]+'/'+num;try{var r=await fetch(u,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)return;var d=await r.json();var a=dezenas(d,l),nn=Number(d.numero||d.numeroConcurso);if(nn&&a.length){cache[l]=cache[l]||{};cache[l][nn]=d;window.THOR_MELHORES_HISTORICO[l]=window.THOR_MELHORES_HISTORICO[l]||[];var h=window.THOR_MELHORES_HISTORICO[l],it={numero:nn,dezenas:a},p=h.findIndex(function(x){return Number(x.numero)===nn});if(p>=0)h[p]=it;else h.push(it);h.sort(function(x,y){return Number(y.numero)-Number(x.numero)})}}catch(_){}})(n))}await Promise.all(tarefas);return (window.THOR_MELHORES_HISTORICO[l]||[]).filter(function(x){return Number(x.numero)<=atual}).slice(0,qtd)}
window.THOR_CARREGAR_HISTORICO=carregarHistorico;
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
 if(a)a.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();var t=tela();if(t){var gf=t.querySelector('#thorMdFixarBolas'),ge=t.querySelector('#thorMdExcluirBolas'),bf=t.querySelector('#thorMdResultadoFixar'),be=t.querySelector('#thorMdResultadoExcluir');if(gf)gf.innerHTML='';if(ge)ge.innerHTML='';if(bf)bf.style.display='none';if(be)be.style.display='none';delete t.dataset.calculoConcurso}navegar(-1)},true);
 if(p)p.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();navegar(1)},true);
 atualizar(); return true;
}
var mo=new MutationObserver(function(){ligar()});mo.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar,{once:true});else ligar();
setInterval(function(){var t=tela();if(t&&t.classList.contains('ativo'))atualizar()},300000);
})();