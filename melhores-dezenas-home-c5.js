(function(){
  'use strict';
  var tela=null;

  function criarTela(){
    if(tela&&document.body.contains(tela))return tela;
    var estilo=document.getElementById('thorMelhoresDezenasCss');
    if(!estilo){
      estilo=document.createElement('style');
      estilo.id='thorMelhoresDezenasCss';
      estilo.textContent='#thorMelhoresDezenasTela{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:100000!important;display:none;overflow:hidden!important;margin:0!important;padding:0!important;background:linear-gradient(180deg,#03142b 0%,#061d38 44%,#020914 100%)!important;font-family:Arial,sans-serif}#thorMelhoresDezenasTela.ativo{display:block!important}#thorMelhoresDezenasCabecalho{position:absolute!important;top:0!important;left:0!important;right:0!important;z-index:10!important;width:100%!important;max-width:none!important;height:33.333vw!important;min-height:120px!important;max-height:260px!important;margin:0!important;padding:0!important;background-color:#03142b!important;background-image:url("https://siranildo518-coder.github.io/Thor-Teste/melhores-dezenas-topo-c9.jpg?v=thor7-c11")!important;background-repeat:no-repeat!important;background-position:center center!important;background-size:100% 100%!important}#thorMelhoresDezenasVoltar{position:absolute!important;top:16px!important;left:16px!important;z-index:12!important;width:46px!important;height:46px!important;margin:0!important;padding:0!important;border:2px solid #f5a000!important;border-radius:12px!important;background:rgba(0,8,20,.86)!important;color:#fff!important;font-size:30px!important;font-weight:900!important;line-height:38px!important;box-shadow:0 2px 8px rgba(0,0,0,.6)!important}#thorMelhoresDezenasConteudo{position:absolute!important;left:0!important;right:0!important;top:clamp(120px,33.333vw,260px)!important;bottom:0!important;overflow-y:auto!important;overflow-x:hidden!important;min-height:0!important;padding:16px!important;box-sizing:border-box!important;z-index:11!important}.thor-md-seletor{width:155px;max-width:calc(100vw - 4px);margin:-6px 0 0 -14px}.thor-md-select-wrap:before{content:"☘";position:absolute;left:9px;top:50%;transform:translateY(-52%);z-index:3;color:#ffd22f;font-size:21px;font-weight:900;line-height:1;text-shadow:-1px -1px 0 #fff6a5,1px 1px 0 #8b5800,0 0 7px #fff09a;pointer-events:none}.thor-md-label{display:block;margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.7px;color:#a9c8e8;text-transform:uppercase}.thor-md-select{width:100%;height:32px;box-sizing:border-box;padding:0 42px 0 38px;border:2px solid #ffbd19;border-radius:12px;background:linear-gradient(180deg,#102b4b,#07192e);color:#fff;font-size:12px;font-weight:900;text-align:center;text-align-last:center;outline:none;text-shadow:0 1px 2px rgba(0,0,0,.75);box-shadow:inset 0 3px 0 rgba(255,255,255,.72),inset 0 -3px 0 rgba(62,35,0,.68),inset 0 0 12px rgba(255,220,65,.28),0 3px 0 #a96900,0 5px 10px rgba(0,0,0,.42);appearance:none;-webkit-appearance:none}.thor-md-select-wrap{position:relative}.thor-md-select-wrap:before{content:"☘";position:absolute;left:5px;top:50%;transform:translateY(-50%);z-index:3;color:#ffd32a;font-size:18px;line-height:1;font-weight:900;text-shadow:0 1px 0 #fff5a0,0 2px 2px rgba(75,40,0,.8),0 0 7px rgba(255,225,70,.95);pointer-events:none}.thor-md-select-wrap:after{border-left:1px solid rgba(255,220,80,.85);padding-left:14px}.thor-md-select-wrap:after{box-sizing:border-box;border-left:1px solid rgba(255,214,61,.9);width:36px;text-align:center;right:0!important;top:0!important;height:32px;line-height:27px!important;border-radius:0 10px 10px 0;background:linear-gradient(90deg,rgba(0,0,0,.05),rgba(0,0,0,.32));text-shadow:0 1px 2px #000,0 0 5px #ffd95a!important}.thor-md-select-wrap:after{content:"⌄";position:absolute;right:5px;top:5px;color:#ffc12b;font-size:22px;text-shadow:0 1px 2px rgba(0,0,0,.6);font-weight:900;pointer-events:none}.thor-md-select option{background:#07192e;color:#fff}.thor-md-select.lotofacil{background:linear-gradient(180deg,#b45cff 0%,#8d25e8 20%,#6414b5 52%,#3b086f 100%)!important;border-color:#f0a000!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.42),inset 0 -2px 0 rgba(42,0,79,.7),0 3px 0 #a96900!important;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.55)!important}.thor-md-select.megasena{border-color:#f3ad16!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.42),inset 0 -2px 0 rgba(0,45,18,.7),0 3px 0 #a96900!important}.thor-md-select.quina{border-color:#f3ad16!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.42),inset 0 -2px 0 rgba(0,20,70,.7),0 3px 0 #a96900!important}.thor-md-select.lotomania{border-color:#f3ad16!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.42),inset 0 -2px 0 rgba(80,25,0,.7),0 3px 0 #a96900!important}';
      estilo.textContent+='.thor-md-select-wrap:has(.thor-md-select){filter:drop-shadow(0 4px 3px rgba(0,0,0,.42))}.thor-md-select{border-width:2px!important;border-color:#f5ad00!important;border-radius:14px!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.52),inset 0 -4px 0 rgba(70,35,0,.42),0 3px 0 #a86400,0 0 9px rgba(255,190,20,.25)!important}.thor-md-select-wrap[data-loteria="lotofacil"]:before{color:#d96cff;text-shadow:0 1px #fff,0 2px 2px #3b075a,0 0 8px #e66cff}.thor-md-select-wrap[data-loteria="megasena"]:before{color:#2df27b;text-shadow:0 1px #d9ffe8,0 2px 2px #003d1e,0 0 8px #24ff75}.thor-md-select-wrap[data-loteria="quina"]:before{color:#38a9ff;text-shadow:0 1px #e3f6ff,0 2px 2px #003e78,0 0 8px #39b5ff}.thor-md-select-wrap[data-loteria="lotomania"]:before{color:#ff9d21}.thor-md-select-wrap[data-loteria="duplasena"]:before{color:#ff3d50}.thor-md-select-wrap[data-loteria="diadesorte"]:before,.thor-md-select-wrap[data-loteria="timemania"]:before{color:#ffd629}.thor-md-select-wrap[data-loteria="supersete"]:before{color:#a9f52c}.thor-md-select-wrap[data-loteria="maismilionaria"]:before{color:#30d6dd}';
      estilo.textContent+='.thor-md-select-wrap{border-radius:14px;overflow:visible}.thor-md-select-wrap:after{z-index:5}.thor-md-select-wrap::selection{background:transparent}.thor-md-select{position:relative!important;backdrop-filter:blur(7px) saturate(145%);-webkit-backdrop-filter:blur(7px) saturate(145%)}.thor-md-seletor:before{content:"";position:absolute;pointer-events:none;z-index:4;width:155px;max-width:calc(100vw - 4px);height:18px;border-radius:13px 13px 45% 45%;background:linear-gradient(180deg,rgba(255,255,255,.48),rgba(255,255,255,.16) 52%,rgba(255,255,255,0));mix-blend-mode:screen}.thor-md-seletor{position:relative}';
      document.head.appendChild(estilo);
    }
    tela=document.createElement('section');
    tela.id='thorMelhoresDezenasTela';
    tela.setAttribute('aria-label','Melhores dezenas');
    tela.innerHTML='<header id="thorMelhoresDezenasCabecalho"></header><main id="thorMelhoresDezenasConteudo"><div class="thor-md-seletor"><div class="thor-md-select-wrap"><select id="thorMdLoteria" class="thor-md-select"><option value="" selected disabled>Selecionar loteria</option><option value="lotofacil">Lotofácil</option><option value="megasena">Mega-Sena</option><option value="quina">Quina</option><option value="lotomania">Lotomania</option><option value="duplasena">Dupla Sena</option><option value="timemania">Timemania</option><option value="diadesorte">Dia de Sorte</option><option value="supersete">Super Sete</option><option value="maismilionaria">+Milionária</option></select></div></div></main>';
    document.body.appendChild(tela);
    var sel=tela.querySelector('#thorMdLoteria');
    if(sel){var pintar=function(){sel.classList.remove('lotofacil','megasena','quina','lotomania','duplasena','timemania','diadesorte','supersete','maismilionaria');if(['lotofacil','megasena','quina','lotomania','duplasena','timemania','diadesorte','supersete','maismilionaria'].indexOf(sel.value)>=0)sel.classList.add(sel.value);sel.parentNode.setAttribute('data-loteria',sel.value||'');sel.style.setProperty('background-image',sel.value==='lotofacil'?'linear-gradient(180deg,#b45cff 0%,#8d25e8 20%,#6414b5 52%,#3b086f 100%)':sel.value==='megasena'?'linear-gradient(180deg,#27b66c 0%,#07864a 48%,#04542f 100%)':sel.value==='quina'?'linear-gradient(180deg,#238eea 0%,#0867b8 48%,#064177 100%)':sel.value==='lotomania'?'linear-gradient(180deg,#ffad31 0%,#e87908 48%,#a74600 100%)':sel.value==='duplasena'?'linear-gradient(180deg,#ef4b5b 0%,#b5162b 48%,#680815 100%)':sel.value==='diadesorte'?'linear-gradient(180deg,#ffe45c 0%,#e5ad08 48%,#9a6500 100%)':sel.value==='timemania'?'linear-gradient(180deg,#f7df45 0%,#d5b609 48%,#827000 100%)':sel.value==='supersete'?'linear-gradient(180deg,#d7ff4b 0%,#91c914 48%,#527900 100%)':sel.value==='maismilionaria'?'linear-gradient(180deg,#54c7c7 0%,#198d91 48%,#075457 100%)':'linear-gradient(180deg,#102b4b,#07192e)','important')};sel.addEventListener('change',pintar);pintar();}
    return tela;
  }

  function abrirTela(){criarTela().classList.add('ativo');try{history.pushState({thorMelhoresDezenas:true},'',location.href)}catch(_){}}
  function fecharTela(){if(tela)tela.classList.remove('ativo')}

  function adicionarBotao(){
    var grade=document.getElementById('homeFeatureGrid');
    if(!grade)return false;
    var botao=document.getElementById('thorMelhoresDezenasHome');
    if(!botao){
      botao=document.createElement('button');
      botao.type='button';
      botao.className='home-feature-card';
      botao.id='thorMelhoresDezenasHome';
      botao.style.setProperty('--fc','#f0a000');
      botao.innerHTML='<span class="hfc-icon">◆</span><span><strong>Melhores dezenas</strong><small>Veja as dezenas em destaque</small></span>';
      botao.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();abrirTela()},true);
    }
    var jogos=document.getElementById('thorJogosSalvosHome');
    if(jogos&&jogos.parentNode===grade){if(jogos.nextElementSibling!==botao)grade.insertBefore(botao,jogos.nextSibling)}
    else if(botao.parentNode!==grade){grade.appendChild(botao)}
    return true;
  }

  function iniciar(){
    criarTela();adicionarBotao();window.addEventListener('popstate',fecharTela);
    var observador=new MutationObserver(adicionarBotao);
    observador.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
