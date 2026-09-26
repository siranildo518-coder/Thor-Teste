// THOR LOTERIAS — análise exclusiva da aba Tendência
(function(){
  function instalar(){
    const seletor=document.getElementById('tendQtdSelect');
    if(seletor && seletor.tagName==='SELECT'){
      const input=document.createElement('input');
      input.id='tendQtdSelect';
      input.type='number'; input.inputMode='numeric'; input.min='2'; input.max='300'; input.value=seletor.value||'25';
      input.placeholder='Quantidade de concursos';
      input.className=seletor.className;
      input.style.cssText=(seletor.getAttribute('style')||'')+';width:100%;box-sizing:border-box;text-align:center;font-weight:800;';
      seletor.replaceWith(input);
    }

    window.renderTendencia=function(validos,min,max,total,numeroUltimo,presenca,atraso){
      const cont=document.getElementById('tendConteudo');
      if(!cont) return;
      if(!validos||!validos.length){cont.innerHTML='<div class="res-error">Sem dados suficientes para calcular a tendência.</div>';return;}
      const nums=[]; for(let n=min;n<=max;n++) nums.push(n);
      const media=nums.reduce((s,n)=>s+(presenca[n]||0),0)/Math.max(1,nums.length);
      const metade=Math.max(1,Math.floor(validos.length/2));
      const recentes=validos.slice(0,metade);
      const anteriores=validos.slice(metade);
      function freq(lista,n){let c=0;lista.forEach(d=>{if((d.dezenas||[]).map(Number).includes(n))c++;});return lista.length?c/lista.length:0;}
      const linhas=nums.map(n=>{
        const geral=(presenca[n]||0)/total;
        const fr=freq(recentes,n), fa=freq(anteriores,n);
        const movimento=fr-fa;
        const base=(presenca[n]||0)-media;
        const score=base+(movimento*total*.75)-(Math.min(atraso[n]||0,total)*.08);
        return {n,p:presenca[n]||0,a:atraso[n]||0,geral,movimento,score};
      }).sort((a,b)=>b.score-a.score||b.p-a.p||a.n-b.n);
      const qtdMostrar=Math.min(8,Math.max(5,Math.round(nums.length*.28)));
      const altas=linhas.slice(0,qtdMostrar);
      const quedas=linhas.slice(-qtdMostrar).reverse();
      const bola=(x,tipo)=>{
        const alta=tipo==='alta';
        const cor=alta?'#18e879':'#ff4d6d', fundo=alta?'rgba(12,93,53,.28)':'rgba(105,18,39,.28)';
        const mov=x.movimento*100;
        return `<div style="display:flex;align-items:center;gap:10px;padding:9px 10px;margin:7px 0;border:1.5px solid ${cor};border-radius:13px;background:${fundo};box-shadow:0 0 9px ${cor}66,inset 0 0 10px ${cor}22;"><span style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;background:radial-gradient(circle at 32% 25%,#fff,${cor} 42%,#071421 76%);color:#fff;font-weight:1000;font-size:15px;box-shadow:0 0 10px ${cor};">${String(x.n).padStart(2,'0')}</span><div style="min-width:0;flex:1;"><strong style="color:${cor};font-size:13px;">${alta?'🔥 EM ALTA':'❄️ EM QUEDA'}</strong><div style="font-size:11.5px;color:#e7edf8;margin-top:2px;">Saiu ${x.p}x · ${(x.geral*100).toFixed(1).replace('.',',')}% · atraso ${x.a}</div><div style="font-size:10.5px;color:#aebbd0;">Movimento recente: ${mov>=0?'+':''}${mov.toFixed(1).replace('.',',')} p.p.</div></div></div>`;
      };
      cont.innerHTML=`<div style="margin:12px 0;padding:11px 12px;border-radius:12px;background:#0b1425;border:1px solid #31486f;color:#dce7f8;font-size:11.5px;line-height:1.35;">Análise dos últimos <strong style="color:#fff;">${total}</strong> concursos, até o Nº <strong style="color:#fff;">${numeroUltimo}</strong>. O ranking combina frequência do período com o movimento dos concursos mais recentes.</div><div style="font-weight:900;color:#20f08a;margin:13px 2px 5px;font-size:15px;">🔥 MAIORES TENDÊNCIAS — EM ALTA</div>${altas.map(x=>bola(x,'alta')).join('')}<div style="font-weight:900;color:#ff6682;margin:17px 2px 5px;font-size:15px;">❄️ DEZENAS EM QUEDA</div>${quedas.map(x=>bola(x,'queda')).join('')}<div style="font-size:10.5px;color:#8997ac;text-align:center;margin:12px 4px;">Estatística histórica; cada sorteio continua sendo independente.</div>`;
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',instalar); else instalar();
})();