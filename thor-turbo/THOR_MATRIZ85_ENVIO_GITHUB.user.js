// ==UserScript==
// @name         Thor Turbo - Enviar Matriz 8.5 ao GitHub
// @namespace    thor.lototurbo
// @version      1.0.0
// @description  Sincroniza apenas resultados da Matriz 8.5; exige token GitHub com permissao limitada.
// @match        https://turbo.lotobanca.com/loto-turbo/resultados*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.github.com
// ==/UserScript==
(function(){
'use strict';
const KEY='matriz_loto_turbo_v8';
const API='https://api.github.com/repos/siranildo518-coder/Thor-Teste/contents/thor-turbo/resultados.json';
const VALID={'Lotomania Turbo':[20,0,99],'Lotofácil Turbo':[15,1,25],'Mega-Sena Turbo':[6,1,60],'Quina Turbo':[5,1,80],'Dia de Sorte Turbo':[7,1,31],'Dupla Sena Turbo':[6,1,50]};
let busy=false, lastSignature='', lastSuccess=0;
function parseLocal(){
  let obj;try{obj=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return []}
  const list=Array.isArray(obj)?obj:Object.values(obj||{});
  return list.filter(r=>{const v=VALID[r?.modalidade];return v&&/^\d+$/.test(String(r.concurso))&&Array.isArray(r.dezenas)&&r.dezenas.length===v[0]&&r.dezenas.every(n=>Number.isInteger(n)&&n>=v[1]&&n<=v[2])&&new Set(r.dezenas).size===v[0]&&/^\d{4}-\d{2}-\d{2}$/.test(r.data||'')}).map(r=>({modalidade:r.modalidade,concurso:String(r.concurso),data:r.data,horario:r.horario||'',dezenas:r.dezenas,scheduledAt:r.scheduledAt||null,...(r.sorteio===2?{sorteio:2}:{})}));
}
function key(r){return r.modalidade+'|'+r.concurso+'|'+(r.sorteio||1)}
function request(method,url,token,body){
 return new Promise((resolve,reject)=>GM_xmlhttpRequest({method,url,timeout:30000,headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},data:body?JSON.stringify(body):undefined,onload:r=>{let data;try{data=JSON.parse(r.responseText)}catch{data={}}if(r.status>=200&&r.status<300)resolve(data);else reject(Error('GitHub HTTP '+r.status+' '+(data.message||'')))},onerror:()=>reject(Error('Falha de rede')),ontimeout:()=>reject(Error('Tempo esgotado'))}));
}
const utf8ToBase64=s=>{const bytes=new TextEncoder().encode(s);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(binary)};
const base64ToUtf8=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
function status(msg){let e=document.getElementById('thor-github-sync-status');if(e)e.textContent=msg;console.info('[Thor GitHub]',msg)}
async function sync(force=false){
 if(busy)return;const token=GM_getValue('thor_github_token','');if(!token){status('Configure o token GitHub para ativar o envio');return}
 const local=parseLocal();if(!local.length){status('Aguardando resultados válidos da Matriz 8.5');return}
 const sig=local.length+'|'+local.map(key).sort().join(';');if(!force&&sig===lastSignature&&Date.now()-lastSuccess<300000)return;
 busy=true;status('Verificando '+local.length+' resultados…');
 try{
   for(let attempt=0;attempt<2;attempt++){
     const remote=await request('GET',API+'?t='+Date.now(),token);
     const data=JSON.parse(base64ToUtf8(remote.content));
     const merged=new Map((data.records||[]).map(r=>[key(r),r]));
     let added=0;for(const r of local){if(!merged.has(key(r))){merged.set(key(r),r);added++}}
     if(!added){lastSignature=sig;lastSuccess=Date.now();status('GitHub em dia • '+merged.size+' registros');break}
     data.records=[...merged.values()].sort((a,b)=>String(a.modalidade).localeCompare(String(b.modalidade))||Number(b.concurso)-Number(a.concurso));
     data.dataExportacao=new Date().toISOString();
     try{await request('PUT',API,token,{message:'Tor Turbo: sincronizar '+added+' sorteios da Matriz 8.5',content:utf8ToBase64(JSON.stringify(data,null,2)+'\n'),sha:remote.sha,branch:'main'});lastSignature=sig;lastSuccess=Date.now();status('Enviados '+added+' concursos novos • Total '+merged.size);break}
     catch(e){if(attempt===0&&/409|422/.test(e.message))continue;throw e}
   }
 }catch(e){status('Falha no envio: '+e.message)}finally{busy=false}
}
function ui(){
 const bar=document.createElement('div');bar.style.cssText='position:fixed;bottom:10px;left:10px;right:10px;z-index:2147483647;background:#171717;color:#ffdb4b;border:2px solid #d5a321;border-radius:10px;padding:8px;font:12px system-ui;box-shadow:0 2px 12px #0009;display:flex;align-items:center;gap:8px';
 const text=document.createElement('span');text.id='thor-github-sync-status';text.style.flex='1';text.textContent='Thor GitHub: iniciando…';
 const setup=document.createElement('button');setup.textContent='Configurar';setup.style.cssText='background:#ffd34d;color:#111;border:0;border-radius:6px;padding:8px;font-weight:bold';
 const send=document.createElement('button');send.textContent='Enviar';send.style.cssText=setup.style.cssText;
 setup.onclick=()=>{const current=GM_getValue('thor_github_token','');const value=prompt('Cole aqui SOMENTE no seu Firefox um token GitHub fine-grained restrito ao repositório Thor-Teste, com Contents: Read and write. Nunca compartilhe o token em mensagens, prints ou arquivos.',current?'(token já configurado; digite REMOVER para apagar)':'');if(value===null)return;if(value.trim().toUpperCase()==='REMOVER'){GM_setValue('thor_github_token','');status('Token removido')}else if(value.trim()&&!value.startsWith('(')){GM_setValue('thor_github_token',value.trim());lastSignature='';sync(true)}};
 send.onclick=()=>sync(true);bar.append(text,setup,send);document.body.append(bar)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui,{once:true});else ui();
setTimeout(()=>sync(),3000);setInterval(()=>sync(),60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
})();
