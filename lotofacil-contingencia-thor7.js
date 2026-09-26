(function(){
'use strict';
// THOR 7 V3.9 - Lotofácil: usa contingência 3780 enquanto a API oficial estiver atrasada e volta automaticamente à API quando ela avançar.
const LF3780={numero:3780,dataApuracao:'15/09/2026',listaDezenas:['01','02','03','04','05','06','07','12','15','16','17','19','21','22','23']};
function numero(d){return Number(d&&(d.numero||d.concurso||d.numero_concurso)||0)}
function dezenas(d){const a=d&&(d.listaDezenas||d.dezenas||d.numeros||d.lista_dezenas)||[];return Array.isArray(a)?a.map(String):[]}
function dataResultado(d){return d&&(d.dataApuracao||d.data||d.data_sorteio||d.dataSorteio)||''}
function ehLotofacil(b){return (b&&b.textContent||'').trim().toLowerCase()==='lotofácil'||(b&&b.textContent||'').trim().toLowerCase()==='lotofacil'}
function ativa(){return Array.from(document.querySelectorAll('#thorJogosLoterias .thorJogoLoteria')).find(ehLotofacil)}
function aplicar(d){const b=document.getElementById('thorJogosResultado');if(!b||!d)return;const n=numero(d),ds=dezenas(d),dt=dataResultado(d);if(!n||!ds.length)return;const nome=b.querySelector('.jr-nome'),meta=b.querySelector('.jr-meta'),bolas=b.querySelector('.jr-bolas');if(nome)nome.textContent='Lotofácil';if(meta){meta.style.display='inline-block';meta.textContent='Concurso '+n+(dt?' · '+dt:'')}if(bolas)bolas.innerHTML=ds.map(x=>'<span class="jr-bola">'+String(x).padStart(2,'0')+'</span>').join('');try{localStorage.setItem('thor_teste_resultado_lotofacil',JSON.stringify(d))}catch(_){} }
async function atualizar(){const botao=ativa();if(!botao||!botao.classList.contains('ativa'))return;let d=null;try{const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);const r=await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil?_thor='+Date.now(),{cache:'no-store',signal:ctrl.signal,headers:{Accept:'application/json'}});clearTimeout(timer);if(r.ok)d=await r.json()}catch(_){}if(!d||numero(d)<3780||!dezenas(d).length)d=LF3780;if(botao.classList.contains('ativa'))aplicar(d)}
function ligar(){const bar=document.getElementById('thorJogosLoterias');if(!bar)return false;bar.querySelectorAll('.thorJogoLoteria').forEach(b=>{if(ehLotofacil(b)&&!b.dataset.thorLfContingencia){b.dataset.thorLfContingencia='1';b.addEventListener('click',()=>setTimeout(atualizar,80))}});const b=ativa();if(b&&b.classList.contains('ativa'))setTimeout(atualizar,100);return true}
let t=0;function iniciar(){if(ligar())return;if(++t<50)setTimeout(iniciar,200)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();