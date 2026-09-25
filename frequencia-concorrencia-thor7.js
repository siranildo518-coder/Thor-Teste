// THOR 7 V3.7 - limita chamadas simultaneas ao historico oficial da CAIXA.
// Evita que analises de 100+ concursos percam resultados por excesso de requisicoes paralelas.
(function(){
'use strict';
if(window.__thorFetchCaixaLimitado)return;
window.__thorFetchCaixaLimitado=true;
const fetchOriginal=window.fetch.bind(window);
const fila=[];
let ativos=0;
const LIMITE=6;
function proximo(){
  while(ativos<LIMITE&&fila.length){
    const item=fila.shift();
    if(item.signal&&item.signal.aborted){item.reject(new DOMException('Aborted','AbortError'));continue;}
    ativos++;
    fetchOriginal(item.input,item.init).then(item.resolve,item.reject).finally(function(){ativos--;proximo();});
  }
}
window.fetch=function(input,init){
  let url='';
  try{url=typeof input==='string'?input:(input&&input.url)||'';}catch(_){}
  if(!/servicebus2\.caixa\.gov\.br\/portaldeloterias\/api\//i.test(url))return fetchOriginal(input,init);
  return new Promise(function(resolve,reject){
    const signal=init&&init.signal;
    if(signal&&signal.aborted){reject(new DOMException('Aborted','AbortError'));return;}
    fila.push({input:input,init:init,resolve:resolve,reject:reject,signal:signal});
    proximo();
  });
};
})();
