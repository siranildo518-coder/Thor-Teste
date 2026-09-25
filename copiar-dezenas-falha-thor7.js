// Versao de trabalho: corrige COPIAR pelo ID real gerarTopoSelect. Login, senha e trava intocados.
(function(){'use strict';
const ID='thorBtnCopiarFalhas';
function montar(){
 if(document.getElementById(ID))return true;
 const sel=document.getElementById('gerarTopoSelect');if(!sel)return false;
 const wrap=document.createElement('span');wrap.id='thorCopiarFalhasWrap';wrap.style.cssText='display:inline-flex;align-items:center;margin-left:10px;vertical-align:middle;';
 const btn=document.createElement('button');btn.id=ID;btn.type='button';btn.textContent='COPIAR';btn.style.cssText='border:1px solid #72a7ff;border-radius:7px;padding:6px 12px;background:linear-gradient(180deg,#4f96ff 0%,#1765d8 55%,#0843a5 100%);color:#fff;font-size:11px;font-weight:900;letter-spacing:.2px;box-shadow:inset 0 2px 2px rgba(255,255,255,.65),inset 0 -3px 3px rgba(0,0,0,.3),0 3px 0 #06377f,0 5px 7px rgba(0,0,0,.28);text-shadow:0 1px 1px rgba(0,0,0,.5);white-space:nowrap;';wrap.appendChild(btn);sel.insertAdjacentElement('afterend',wrap);
 btn.onpointerdown=()=>btn.style.transform='translateY(2px)';btn.onpointerup=()=>btn.style.transform='';
 btn.onclick=async function(){
  const preview=document.getElementById('gerarTopoPreview')||[...document.querySelectorAll('div')].find(e=>/Dezenas selecionadas com esse filtro/i.test(e.textContent||''));if(!preview)return;
  const limite=Math.max(1,Math.min(30,parseInt(sel.value,10)||30));
  const nums=[];[...preview.querySelectorAll('span,button,div')].forEach(e=>{if(nums.length>=limite)return;const t=(e.textContent||'').trim();if(/^\d{1,2}$/.test(t)){const n=parseInt(t,10);if(n>=1&&n<=99&&!nums.includes(n))nums.push(n)}});if(!nums.length)return;
  const out=nums.map(n=>String(n).padStart(2,'0')).join(' ');try{await navigator.clipboard.writeText(out);btn.textContent='COPIADO ✓';setTimeout(()=>btn.textContent='COPIAR',900)}catch(e){prompt('Copie as dezenas:',out)}
 };return true;
}
let n=0;function iniciar(){if(!montar()&&++n<200)setTimeout(iniciar,150)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();new MutationObserver(()=>{if(!document.getElementById(ID))montar()}).observe(document.documentElement,{childList:true,subtree:true});
})();