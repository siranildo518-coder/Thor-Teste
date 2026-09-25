// THOR 7 V3.14 - Análise > Gerar: quantidade de dezenas digitável (1 a 30).
(function(){
'use strict';
function instalar(){
  const select=document.getElementById('gerarTopoSelect');
  if(!select||document.getElementById('gerarTopoInput'))return false;

  const input=document.createElement('input');
  input.type='number';
  input.id='gerarTopoInput';
  input.min='1';
  input.max='30';
  input.value=select.value||'6';
  input.inputMode='numeric';
  input.setAttribute('aria-label','Quantas dezenas usar, de 1 a 30');
  input.style.cssText='background:linear-gradient(135deg,#E5E7EB,#9CA3AF);width:92px;padding:7px 10px;font-size:11.5px;border:0;border-radius:10px;color:#111;outline:none;';

  select.style.display='none';
  select.parentNode.insertBefore(input,select.nextSibling);

  function sincronizar(disparar){
    let n=parseInt(input.value,10);
    if(Number.isNaN(n))return;
    n=Math.max(1,Math.min(30,n));
    input.value=String(n);
    let opt=Array.from(select.options).find(o=>o.value===String(n));
    if(!opt){
      opt=document.createElement('option');
      opt.value=String(n);
      opt.textContent='Top '+n+(n===1?' dezena':' dezenas');
      select.appendChild(opt);
    }
    select.value=String(n);
    if(disparar)select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  input.addEventListener('input',function(){
    let n=parseInt(input.value,10);
    if(!Number.isNaN(n)&&n>=1&&n<=30)sincronizar(true);
  });
  input.addEventListener('change',()=>sincronizar(true));
  input.addEventListener('blur',()=>sincronizar(true));
  sincronizar(false);
  return true;
}

if(!instalar()){
  const obs=new MutationObserver(function(){if(instalar())obs.disconnect();});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>obs.disconnect(),30000);
}
})();