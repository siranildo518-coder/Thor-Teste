(function(){
  'use strict';
  var tela=null;

  function criarTela(){
    if(tela&&document.body.contains(tela))return tela;
    var estilo=document.getElementById('thorMelhoresDezenasCss');
    if(!estilo){
      estilo=document.createElement('style');
      estilo.id='thorMelhoresDezenasCss';
      estilo.textContent='#thorMelhoresDezenasTela{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:100000!important;display:none;overflow:hidden!important;margin:0!important;padding:0!important;background:linear-gradient(180deg,#03142b 0%,#061d38 44%,#020914 100%)!important;font-family:Arial,sans-serif}#thorMelhoresDezenasTela.ativo{display:block!important}#thorMelhoresDezenasCabecalho{position:absolute!important;top:0!important;left:0!important;right:0!important;z-index:10!important;width:100%!important;max-width:none!important;height:33.333vw!important;min-height:120px!important;max-height:260px!important;margin:0!important;padding:0!important;background-color:#03142b!important;background-image:url("https://siranildo518-coder.github.io/Thor-Teste/melhores-dezenas-topo-c9.jpg?v=thor7-c11")!important;background-repeat:no-repeat!important;background-position:center center!important;background-size:100% 100%!important}#thorMelhoresDezenasVoltar{position:absolute!important;top:16px!important;left:16px!important;z-index:12!important;width:46px!important;height:46px!important;margin:0!important;padding:0!important;border:2px solid #f5a000!important;border-radius:12px!important;background:rgba(0,8,20,.86)!important;color:#fff!important;font-size:30px!important;font-weight:900!important;line-height:38px!important;box-shadow:0 2px 8px rgba(0,0,0,.6)!important}#thorMelhoresDezenasConteudo{position:absolute!important;left:0!important;right:0!important;top:clamp(120px,33.333vw,260px)!important;bottom:0!important;overflow-y:auto!important;overflow-x:hidden!important;min-height:0!important;padding:16px!important;box-sizing:border-box!important;z-index:11!important}.thor-md-seletor{max-width:430px;margin:-14px auto 0}.thor-md-label{display:block;margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.7px;color:#a9c8e8;text-transform:uppercase}.thor-md-select{width:100%;height:32px;box-sizing:border-box;padding:0 42px 0 14px;border:1px solid #f0a000;border-radius:10px;background:linear-gradient(180deg,#102b4b,#07192e);color:#fff;font-size:14px;font-weight:800;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 3px 0 #a96900;appearance:none;-webkit-appearance:none}.thor-md-select-wrap{position:relative}.thor-md-select-wrap:after{content:"⌄";position:absolute;right:14px;top:1px;color:#f0a000;font-size:22px;font-weight:900;pointer-events:none}.thor-md-select option{background:#07192e;color:#fff}';
      document.head.appendChild(estilo);
    }
    tela=document.createElement('section');
    tela.id='thorMelhoresDezenasTela';
    tela.setAttribute('aria-label','Melhores dezenas');
    tela.innerHTML='<header id="thorMelhoresDezenasCabecalho"></header><main id="thorMelhoresDezenasConteudo"><div class="thor-md-seletor"><div class="thor-md-select-wrap"><select id="thorMdLoteria" class="thor-md-select"><option value="" selected disabled>Selecionar loteria</option><option>Lotofácil</option><option>Mega-Sena</option><option>Quina</option><option>Lotomania</option><option>Dupla Sena</option><option>Timemania</option><option>Dia de Sorte</option><option>Super Sete</option><option>+Milionária</option></select></div></div></main>';
    document.body.appendChild(tela);
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