// THOR 3 - cálculo histórico de falha sem saturar tudo em 99%
// Usa suavização Bayesiana da taxa de não repetição + frequência de ausência + atraso atual.
// É um índice histórico comparativo; sorteios continuam independentes.
(function(){
  calcularFalhaDezenas = async function(numerosAlvo, qtd, gameParam){
    const game = gameParam || tendGameAtual;
    const ultimo = await fetchConcursoLoteria(game);
    if(!ultimo || !ultimo.concurso) throw new Error('resposta inválida da API');
    const numeroUltimo = ultimo.concurso;
    const totalBuscar = qtd + 1;
    const numeros = [];
    for(let c=numeroUltimo;c>numeroUltimo-totalBuscar && c>0;c--) numeros.push(c);

    const concursos = new Array(numeros.length);
    concursos[0] = ultimo;
    const pendentes = numeros.slice(1).map((c,idx)=>
      fetchConcursoLoteria(game,c).then(data=>{concursos[idx+1]=data;}).catch(()=>{concursos[idx+1]=null;})
    );
    await Promise.all(pendentes);

    const repetiu={}, apareceu={}, presenca={}, atraso={};
    numerosAlvo.forEach(n=>{repetiu[n]=0;apareceu[n]=0;presenca[n]=0;atraso[n]=null;});

    let pares=0, concursosValidos=0;
    concursos.forEach(data=>{
      if(!data) return;
      concursosValidos++;
      const dez=(data.dezenas||[]).map(d=>parseInt(d,10));
      numerosAlvo.forEach(n=>{if(dez.includes(n)) presenca[n]++;});
    });

    for(let i=1;i<concursos.length;i++){
      const anterior=concursos[i], seguinte=concursos[i-1];
      if(!anterior||!seguinte) continue;
      const dezAnterior=(anterior.dezenas||[]).map(d=>parseInt(d,10));
      const dezSeguinte=(seguinte.dezenas||[]).map(d=>parseInt(d,10));
      pares++;
      numerosAlvo.forEach(n=>{
        if(dezAnterior.includes(n)){
          apareceu[n]++;
          if(dezSeguinte.includes(n)) repetiu[n]++;
        }
      });
    }

    concursos.forEach((data,idx)=>{
      if(!data) return;
      const dez=(data.dezenas||[]).map(d=>parseInt(d,10));
      numerosAlvo.forEach(n=>{if(atraso[n]===null && dez.includes(n)) atraso[n]=idx;});
    });
    numerosAlvo.forEach(n=>{if(atraso[n]===null) atraso[n]=concursos.length;});

    const linhas=numerosAlvo.map(n=>{
      const base=apareceu[n];
      // Beta(1,1): evita 0/100 quando a amostra é pequena.
      const falhas=Math.max(0,base-repetiu[n]);
      const taxaNaoRepetir=(falhas+1)/(base+2);
      const taxaAusencia=concursosValidos>0 ? 1-(presenca[n]/concursosValidos) : 0.5;
      const atrasoNorm=Math.min(atraso[n]/Math.max(1,qtd),1);
      // Mantém a não repetição como fator principal e usa os demais apenas para desempatar/refinar.
      const pct=Math.max(1,Math.min(99,(0.65*taxaNaoRepetir+0.25*taxaAusencia+0.10*atrasoNorm)*100));
      return {n,repetiu:repetiu[n],apareceu:base,pct,atraso:atraso[n],presenca:presenca[n]};
    });
    return {linhas,pares,numeroUltimo};
  };
})();