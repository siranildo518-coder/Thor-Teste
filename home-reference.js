(function(){
  'use strict';
  var HOME_ID='thorRefHomeLite';
  var VERSION='20260912-exactref-01';
  function q(id){return document.getElementById(id)}
  function click(id){var e=q(id);if(e)e.click()}
  function logged(){try{return localStorage.getItem('thor_teste_teste_login_ok_v1')==='1'}catch(e){return true}}
  function hide(){var r=q(HOME_ID);if(r)r.style.display='none';document.documentElement.classList.remove('thor-home-open');document.body.classList.remove('thor-home-open')}
  function show(){var r=q(HOME_ID);if(r&&logged()){r.style.display='block';document.documentElement.classList.add('thor-home-open');document.body.classList.add('thor-home-open');r.scrollTop=0}}
  function go(id){hide();setTimeout(function(){click(id)},20)}
  function resultado(){hide();try{if(typeof openResultadoOverlay==='function')openResultadoOverlay(window.homeGameAtual||window.LOTOFACIL_GAME);else click('btnResultadosAtalho')}catch(e){}}
  function drawer(){hide();try{if(typeof openDrawer==='function')openDrawer();else click('btnMenu')}catch(e){}}

  function makeHome(){
    if(!logged()||q(HOME_ID))return;
    var root=document.createElement('div');
    root.id=HOME_ID;
    root.setAttribute('data-version',VERSION);
    root.innerHTML=''+
      '<div class="thr-exact-stage">'+
        '<img class="thr-exact-image" src="./thor-home-reference.jpg?v='+VERSION+'" alt="THOR LOTERIAS">'+
        '<button class="thr-hot hot-menu" id="thrMenu" aria-label="Menu"></button>'+
        '<button class="thr-hot hot-a1" id="thrAnalise" aria-label="Análise"></button>'+
        '<button class="thr-hot hot-a2" id="thrComb" aria-label="Combinações"></button>'+
        '<button class="thr-hot hot-a3" id="thrJogos" aria-label="Jogos"></button>'+
        '<button class="thr-hot hot-b1" id="thrCalc" aria-label="Calculadora"></button>'+
        '<button class="thr-hot hot-b2" id="thrPalpites" aria-label="Palpites"></button>'+
        '<button class="thr-hot hot-b3" id="thrResultados2" aria-label="Resultados"></button>'+
        '<button class="thr-hot hot-c1" id="thrSequencias" aria-label="Minhas Sequências"></button>'+
        '<button class="thr-hot hot-c2" id="thrAnalisador" aria-label="Analisador de Jogos"></button>'+
        '<button class="thr-hot hot-c3" id="thrConfig" aria-label="Configurações"></button>'+
        '<button class="thr-hot hot-result" id="thrResultados" aria-label="Último resultado"></button>'+
        '<button class="thr-hot hot-home" id="thrInicio" aria-label="Início"></button>'+
        '<button class="thr-hot hot-nav-analysis" id="thrNavAnalise" aria-label="Análise"></button>'+
        '<button class="thr-hot hot-nav-comb" id="thrNavComb" aria-label="Combinações"></button>'+
        '<button class="thr-hot hot-nav-calc" id="thrNavCalc" aria-label="Calculadora"></button>'+
        '<button class="thr-hot hot-nav-games" id="thrNavJogos" aria-label="Jogos"></button>'+
      '</div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('thor-home-open');
    document.body.classList.add('thor-home-open');

    q('thrMenu').onclick=drawer;
    q('thrAnalise').onclick=function(){go('btnTendenciaAtalho')};
    q('thrComb').onclick=function(){go('btnFechamentoAtalho')};
    q('thrJogos').onclick=function(){go('btnJogosSalvosAtalho2')};
    q('thrCalc').onclick=function(){go('btnSimularAtalho')};
    q('thrPalpites').onclick=function(){go('btnAbrirFechamentoAtalho')};
    q('thrResultados').onclick=resultado;
    q('thrResultados2').onclick=resultado;
    q('thrSequencias').onclick=function(){go('menuMinhasSequencias')};
    q('thrAnalisador').onclick=function(){go('menuAnalisadorJogos')};
    q('thrConfig').onclick=drawer;
    q('thrInicio').onclick=function(){show();try{if(typeof goHome==='function')goHome()}catch(e){}};
    q('thrNavAnalise').onclick=q('thrAnalise').onclick;
    q('thrNavComb').onclick=q('thrComb').onclick;
    q('thrNavCalc').onclick=q('thrCalc').onclick;
    q('thrNavJogos').onclick=q('thrJogos').onclick;

    var start=q('btnInicioAtalho');
    if(start)start.addEventListener('click',function(){setTimeout(show,0)},true);
    window.thorShowHome=show;
  }

  function start(){
    if(logged()){makeHome();return}
    var tries=0,t=setInterval(function(){
      if(logged()){clearInterval(t);makeHome()}
      else if(++tries>240)clearInterval(t);
    },500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
