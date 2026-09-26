(function(){
  'use strict';
  if(window.__thorExportarJogosC4)return;
  window.__thorExportarJogosC4=true;

  function jogosDaTela(){
    var painel=document.getElementById('geradorFiltroTabPanelJogos')||document;
    return Array.from(painel.querySelectorAll('.gerador-jogo-row')).map(function(linha){
      return Array.from(linha.querySelectorAll('.gerador-jogo-ball')).map(function(bola){
        var n=parseInt((bola.textContent||'').replace(/\D/g,''),10);
        return Number.isFinite(n)?String(n).padStart(2,'0'):'';
      }).filter(Boolean).join(' ');
    }).filter(Boolean);
  }

  function titulo(){
    var el=document.getElementById('geradorFiltroTitulo');
    return ((el&&el.textContent)||'Jogos THOR LOTERIAS').trim();
  }

  function avisar(msg){
    var antigo=document.getElementById('thorExportarAvisoC4');
    if(antigo)antigo.remove();
    var aviso=document.createElement('div');
    aviso.id='thorExportarAvisoC4';
    aviso.textContent=msg;
    aviso.style.cssText='position:fixed;left:50%;bottom:78px;transform:translateX(-50%);z-index:100700;background:#071a30;color:#fff;border:1px solid #31a8ff;border-radius:9px;padding:10px 14px;font:700 12px Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.45);max-width:88%;text-align:center';
    document.body.appendChild(aviso);
    setTimeout(function(){aviso.remove()},2400);
  }

  function textoJogos(){
    var jogos=jogosDaTela();
    if(!jogos.length){avisar('Gere os jogos primeiro.');return null}
    return {jogos:jogos,texto:jogos.join('\n')};
  }

  async function compartilhar(){
    var dados=textoJogos();if(!dados)return;
    var texto=titulo()+'\n\n'+dados.texto;
    try{
      if(navigator.share){
        await navigator.share({title:titulo(),text:texto});
      }else if(navigator.clipboard&&window.isSecureContext){
        await navigator.clipboard.writeText(texto);
        avisar('Jogos copiados para compartilhar.');
      }else{
        var area=document.createElement('textarea');area.value=texto;area.style.position='fixed';area.style.opacity='0';
        document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
        avisar('Jogos copiados para compartilhar.');
      }
    }catch(e){if(e&&e.name!=='AbortError')avisar('Não foi possível compartilhar.')}
    fecharMenu();
  }

  function baixarTxt(){
    var dados=textoJogos();if(!dados)return;
    var conteudo=titulo()+'\r\n\r\n'+dados.jogos.join('\r\n');
    var blob=new Blob(['\ufeff'+conteudo],{type:'text/plain;charset=utf-8'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='jogos-thor-'+Date.now()+'.txt';document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},1500);
    avisar('Arquivo TXT baixado.');
    fecharMenu();
  }

  function fecharMenu(){
    var menu=document.getElementById('thorExportarMenuC4');
    if(menu)menu.style.display='none';
  }

  function montar(){
    var salvar=document.getElementById('gfcSalvarJogosTopo');
    if(!salvar||document.getElementById('thorExportarJogosC4'))return false;
    var linha=salvar.parentElement;
    linha.id='thorAcoesSalvarC4';
    linha.style.position='relative';
    linha.style.display='flex';
    linha.style.gap='7px';
    salvar.style.flex='1';
    salvar.style.width='auto';

    var exportar=document.createElement('button');
    exportar.type='button';exportar.id='thorExportarJogosC4';exportar.textContent='Exportar jogos';
    exportar.style.cssText='display:block;flex:1;width:auto;padding:9px;border-radius:8px;border:1.5px solid #2ca7ff;background:linear-gradient(#36a9ff,#1476d4 48%,#07509e);color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:11px;cursor:pointer;box-shadow:inset 0 2px 2px rgba(255,255,255,.38),inset 0 -3px 4px rgba(0,0,0,.28)';
    linha.appendChild(exportar);

    var menu=document.createElement('div');menu.id='thorExportarMenuC4';
    menu.style.cssText='display:none;position:absolute;z-index:10020;right:0;top:44px;width:50%;min-width:160px;background:linear-gradient(180deg,#14334f,#071a30);border:1.5px solid #7c3aed;border-radius:10px;overflow:hidden;box-shadow:0 7px 18px rgba(0,0,0,.55)';
    menu.innerHTML='<button type="button" id="thorCompartilharC4" style="width:100%;padding:12px 10px;border:0;border-bottom:1px solid #31506c;background:transparent;color:#fff;text-align:left;font:700 12px Arial,sans-serif;">↗ Compartilhar</button><button type="button" id="thorBaixarTxtC4" style="width:100%;padding:12px 10px;border:0;background:transparent;color:#fff;text-align:left;font:700 12px Arial,sans-serif;">▤ Baixar TXT</button>';
    linha.appendChild(menu);

    exportar.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();menu.style.display=menu.style.display==='block'?'none':'block'});
    menu.querySelector('#thorCompartilharC4').addEventListener('click',compartilhar);
    menu.querySelector('#thorBaixarTxtC4').addEventListener('click',baixarTxt);
    document.addEventListener('click',function(e){if(!linha.contains(e.target))fecharMenu()});
    return true;
  }

  if(!montar()){
    var tentativas=0,timer=setInterval(function(){if(montar()||++tentativas>80)clearInterval(timer)},250);
  }
})();