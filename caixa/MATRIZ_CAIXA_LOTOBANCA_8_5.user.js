
 // ==UserScript==
 // @name         Matriz Caixa Lotobanca 8.5
 // @namespace    thor.matriz.caixa.lotobanca
 // @version      8.5-caixa.1
 // @description  Cópia independente da Matriz 8.5 para resultados Caixa da Lotobanca
 // @match        https://turbo.lotobanca.com/loterias-alternativas/resultados-caixa*
 // @run-at       document-start
 // @grant        none
 // ==/UserScript==

 (function () {
   'use strict';

   const API = 'caixa-lotobanca-resultados';
   const KEY = 'matriz_caixa_lotobanca_v85';
   const PANEL = 'matriz-caixa-lotobanca-v85';
   const ZONE = 'America/Sao_Paulo';
   const INTERVAL = 60000;

   const SIZES = {
     'Lotomania': 20,
     'Lotofácil': 15,
     'Mega-Sena': 6,
     'Quina': 5,
     'Dia de Sorte': 7,
     'Dupla Sena': 6
   };

   const LIMITS = {
     'Lotomania': 100,
     'Lotofácil': 25,
     'Mega-Sena': 60,
     'Quina': 80,
     'Dia de Sorte': 31,
     'Dupla Sena': 50
   };

   const SHORT = {
     'Lotomania': 'Lotomania',
     'Lotofácil': 'Lotofácil',
     'Mega-Sena': 'Mega-Sena',
     'Quina': 'Quina',
     'Dia de Sorte': 'Dia de Sorte',
     'Dupla Sena': 'Dupla Sena'
   };

   const names = Object.keys(SIZES);

   let tab = 'Todas';
   let calls = 0;
   let responses = 0;
   let lastValid = 0;
   let lastNew = 0;
   let lastUpdate = '';
   let problem = '';
   let pending = false;
   let refreshing = false;
   let template = null;

   const clean = x => String(x ?? '').trim();

   const normalize = x => clean(x)
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')
     .toLowerCase();

   function load() {
     try {
       const data = JSON.parse(
         localStorage.getItem(KEY) || '{}'
       );

       return data &&
         typeof data === 'object' &&
         !Array.isArray(data)
           ? data : {};
     } catch {
       return {};
     }
   }

   function save(data) {
     localStorage.setItem(
       KEY,
       JSON.stringify(data)
     );
   }

   function target(url) {
     try {
       const u = new URL(url, location.href);
       const host = u.hostname.toLowerCase();
       const allowed = host === 'api.lotobanca.com' || host === 'turbo.lotobanca.com';
       const path = u.pathname.toLowerCase();
       const resultRoute = /parse|function|result|loteria|sorteio|concurso|caixa/i.test(path);
       const privateRoute = /login|auth|session|user|wallet|aposta|bilhete/i.test(path);
       return allowed && resultRoute && !privateRoute;
     } catch {
       return false;
     }
   }

   function nameOf(value) {
     const s = normalize(value);

     return names.find(name =>
       s.includes(normalize(name))
     ) || null;
   }

   function numbers(value, name) {
     const items = Array.isArray(value)
       ? value
       : typeof value === 'string' &&
         /^[\d\s,;|.-]+$/.test(value)
           ? value.match(/\d{1,3}/g) || []
           : null;

     if (!items || items.length !== SIZES[name]) {
       return null;
     }

     if (!items.every(x =>
       typeof x === 'number' ||
       /^\d{1,3}$/.test(String(x))
     )) return null;

     const ns = items.map(Number);
     const min =
       name === 'Lotomania' ? 0 : 1;

     if (
       ns.some(n =>
         !Number.isInteger(n) ||
         n < min ||
         n > LIMITS[name]
       ) ||
       new Set(ns).size !== ns.length
     ) return null;

     return ns;
   }

   function brazilDateTime(value) {
     if (!value) {
       return { data: '', horario: '' };
     }

     if (typeof value === 'string') {
       const s = value.trim();
       const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}:\d{2}))?/);
       if (br) return { data: `${br[3]}-${br[2]}-${br[1]}`, horario: br[4] || '' };
       if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { data: s, horario: '' };

       if (
         /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s) &&
         !/(Z|[+-]\d{2}:\d{2})$/i.test(s)
       ) {
         return {
           data: s.slice(0, 10),
           horario: s.slice(11, 16)
         };
       }
     }

     const raw =
       typeof value === 'object' && value.iso
         ? value.iso
         : value;

     const date = new Date(
       typeof raw === 'number' && raw < 1e11
         ? raw * 1000
         : raw
     );

     if (Number.isNaN(date.getTime())) {
       return { data: '', horario: '' };
     }

     const parts = new Intl.DateTimeFormat(
       'en-GB',
       {
         timeZone: ZONE,
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         hourCycle: 'h23'
       }
     ).formatToParts(date);

     const p = Object.fromEntries(
       parts.map(x => [x.type, x.value])
     );

     return {
       data: `${p.year}-${p.month}-${p.day}`,
       horario: `${p.hour}:${p.minute}`
     };
   }

   function inspect(payload) {
     const history = load();
     const visited = new WeakSet();

     let valid = 0;
     let added = 0;

     function register(item) {
       const name = nameOf(
         item.lotteryName || item.lotteryKey || item.modalidade || item.loteria || item.nomeLoteria || item.nome || item.name || item.game || ''
       );

       if (!name) return;

       const draw = clean(item.sorteioNumber ?? item.numeroConcurso ?? item.numero ?? item.concurso ?? item.contestNumber ?? item.drawNumber);

       if (!/^\d{1,9}$/.test(draw)) return;

       const nums = numbers(item.resultNumbers ?? item.listaDezenas ?? item.dezenasSorteadasOrdemSorteio ?? item.dezenas ?? item.numeros ?? item.numbers ?? item.resultado, name);

       if (!nums) return;

       const dt = brazilDateTime(item.scheduledAt ?? item.dataApuracao ?? item.dataSorteio ?? item.data ?? item.drawDate ?? item.date);

       if (!dt.data) return;

       valid++;

       const id = name + '_' + draw;

       const obj = {
         modalidade: name,
         concurso: draw,
         data: dt.data,
         horario: dt.horario,
         dezenas: nums,
         scheduledAt: item.scheduledAt
       };

       if (!history[id]) added++;

       history[id] = {
         ...history[id],
         ...obj
       };

       if (
         name === 'Dupla Sena' &&
         (item.resultNumbers2 || item.listaDezenasSegundoSorteio)
       ) {
         const second = numbers(
           item.resultNumbers2,
           name
         );

         if (second) {
           const id2 = id + '_2';

           if (!history[id2]) added++;

           history[id2] = {
             ...obj,
             sorteio: 2,
             dezenas: second
           };
         }
       }
     }

     function walk(node, depth = 0) {
       if (
         !node ||
         typeof node !== 'object' ||
         visited.has(node) ||
         depth > 18
       ) return;

       visited.add(node);

       if (Array.isArray(node)) {
         for (const child of node.slice(0, 3000)) {
           walk(child, depth + 1);
         }
         return;
       }

       if (
         ['lotteryName','lotteryKey','modalidade','loteria','nomeLoteria','nome','name','game']
           .some(key => key in node)
       ) {
         register(node);
       }

       for (const [key, value] of Object.entries(node)) {
         if (
           /senha|token|auth|session|user|cpf|email|telefone|wallet|saldo/i
             .test(key)
         ) continue;

         if (value && typeof value === 'object') {
           walk(value, depth + 1);
         }
       }
     }

     try {
       walk(payload);

       if (valid) save(history);

       lastValid = valid;
       lastNew = added;

       lastUpdate = new Date()
         .toLocaleTimeString('pt-BR');

       problem = '';
     } catch (e) {
       problem = 'Erro ao processar: ' + e.message;
     }

     scheduleRender();
   }

   function handleResponse(response) {
     responses++;

     if (!response.ok) {
       problem = 'API HTTP ' + response.status;
       scheduleRender();
       return;
     }

     response.clone().json()
       .then(inspect)
       .catch(e => {
         problem = 'Erro JSON: ' + e.message;
         scheduleRender();
       });
   }

   // Guarda uma cópia da requisição original.
   // Os dados permanecem apenas nesta sessão.
   function captureTemplate(input, init) {
     try {
       const request = new Request(input, init);

       if (!target(request.url)) return;

       template = request.clone();
     } catch (e) {
       problem = 'Captura da consulta: ' + e.message;
     }
   }

   const originalFetch = window.fetch;

   if (typeof originalFetch === 'function') {
     window.fetch = function(input, init) {
       let url = '';

       try {
         url = typeof input === 'string'
           ? input
           : input.url;
       } catch {}

       const yes = target(url);

       if (yes) {
         calls++;
         captureTemplate(input, init);
       }

       const promise = originalFetch.apply(
         this,
         arguments
       );

       if (yes) {
         Promise.resolve(promise).then(
           handleResponse,
           e => {
             problem = 'Rede: ' + e.message;
             scheduleRender();
           }
         );
       }

       return promise;
     };
   }

   const XHR = window.XMLHttpRequest;

   if (XHR?.prototype) {
     const open = XHR.prototype.open;
     const send = XHR.prototype.send;
     const setHeader =
       XHR.prototype.setRequestHeader;

     XHR.prototype.open = function(method, url) {
       this.__matriz85 = target(url);

       if (this.__matriz85) {
         this.__matrizInfo = {
           method: String(method).toUpperCase(),
           url: new URL(url, location.href).href,
           headers: {}
         };
       }

       return open.apply(this, arguments);
     };

     XHR.prototype.setRequestHeader =
       function(name, value) {
         if (this.__matrizInfo) {
           this.__matrizInfo.headers[name] = value;
         }

         return setHeader.apply(
           this,
           arguments
         );
       };

     XHR.prototype.send = function(body) {
       if (this.__matriz85) {
         calls++;

         try {
           const info = this.__matrizInfo;

           template = new Request(info.url, {
             method: info.method,
             headers: info.headers,
             body: ['GET', 'HEAD'].includes(info.method)
               ? undefined
               : body,
             credentials: 'include'
           });
         } catch (e) {
           problem = 'Modelo XHR: ' + e.message;
         }

         this.addEventListener(
           'loadend',
           () => {
             responses++;

             try {
               if (this.status !== 200) {
                 throw Error(
                   'HTTP ' + this.status
                 );
               }

               const payload =
                 this.responseType === 'json'
                   ? this.response
                   : JSON.parse(this.responseText);

               inspect(payload);
             } catch (e) {
               problem = 'XHR: ' + e.message;
               scheduleRender();
             }
           },
           { once: true }
         );
       }

       return send.apply(
         this,
         arguments
       );
     };
   }

   async function refreshAutomatic() {
     if (refreshing) return;

     if (!template) {
       problem =
         'Aguardando consulta original da página';
       scheduleRender();
       return;
     }

     refreshing = true;
     problem = 'Atualizando resultados...';
     scheduleRender();

     try {
       const request = template.clone();

       // Repete o POST original com o corpo e
       // cabeçalhos que a própria página usou.
       const response = await originalFetch.call(
         window,
         request
       );

       handleResponse(response);
     } catch (e) {
       problem =
         'Atualização automática: ' + e.message;
       scheduleRender();
     } finally {
       refreshing = false;
     }
   }

   function el(tag, text, css) {
     const e = document.createElement(tag);

     if (text !== undefined) {
       e.textContent = text;
     }

     if (css) e.style.cssText = css;

     return e;
   }

   function render() {
     if (!document.body) return;

     let p = document.getElementById(PANEL);

     if (!p) {
       p = el('aside');
       p.id = PANEL;

       p.style.cssText = `
         position:fixed;
         bottom:8px;
         left:8px;
         right:8px;
         z-index:2147483647;
         background:#161616;
         color:white;
         border:2px solid #e6b638;
         border-radius:12px;
         padding:11px;
         font:13px Arial,sans-serif;
         max-height:47vh;
         overflow:auto;
         box-shadow:0 3px 15px #0008;
       `;

       document.body.append(p);
     }

     p.replaceChildren();

     p.append(
       el('strong', 'MATRIZ CAIXA LOTOBANCA 8.5')
     );

     const history = Object.values(load())
       .filter(x =>
         x &&
         x.modalidade &&
         Array.isArray(x.dezenas)
       );

     p.append(
       el(
         'p',
         `Salvos: ${history.length} | ` +
         `API: ${calls} | ` +
         `Respostas: ${responses} | ` +
         `Válidos: ${lastValid} | ` +
         `Novos: ${lastNew}`,
         'color:#f0c94b;font-size:12px'
       )
     );

     p.append(
       el(
         'p',
         'Atualização automática: 60 segundos' +
         (lastUpdate
           ? ' | Última leitura: ' + lastUpdate
           : ''),
         'color:#ccc;font-size:12px'
       )
     );

     if (problem) {
       p.append(
         el(
           'p',
           problem,
           'color:#ffb0a0'
         )
       );
     }

     const tabs = el(
       'div',
       undefined,
       'display:flex;gap:5px;overflow-x:auto;padding:4px 0 9px'
     );

     for (const name of ['Todas', ...names]) {
       const b = el(
         'button',
         name === 'Todas'
           ? 'Todas'
           : SHORT[name],
         `white-space:nowrap;
          border:1px solid #d8b548;
          border-radius:7px;
          padding:7px 9px;
          font-weight:bold;
          background:${tab === name ? '#e6b638' : '#303030'};
          color:${tab === name ? '#000' : '#fff'}`
       );

       b.onclick = () => {
         tab = name;
         render();
       };

       tabs.append(b);
     }

     p.append(tabs);

     const filtered = history
       .filter(x =>
         tab === 'Todas' ||
         x.modalidade === tab
       )
       .sort((a, b) =>
         (b.data || '').localeCompare(
           a.data || ''
         ) ||
         (b.horario || '').localeCompare(
           a.horario || ''
         ) ||
         Number(b.concurso) -
         Number(a.concurso)
       );

     p.append(
       el(
         'div',
         `${filtered.length} registros nesta aba`,
         'color:#ddd;font-size:12px;margin-bottom:6px'
       )
     );

     for (const x of filtered.slice(0, 30)) {
       const row = el(
         'div',
         undefined,
         'padding:8px 0;border-top:1px solid #444'
       );

       row.append(
         el(
           'div',
           `${x.modalidade} #${x.concurso}` +
           `${x.sorteio === 2 ? ' (2º sorteio)' : ''}` +
           ` | ${x.data || 'sem data'} ` +
           `${x.horario || '--:--'}`,
           'font-weight:bold;margin-bottom:5px'
         )
       );

       const balls = el(
         'div',
         undefined,
         'display:flex;flex-wrap:wrap;gap:4px'
       );

       for (const n of x.dezenas) {
         balls.append(
           el(
             'span',
             String(n).padStart(2, '0'),
             `display:inline-flex;
              align-items:center;
              justify-content:center;
              width:28px;
              height:28px;
              border-radius:50%;
              background:#f2f2f2;
              color:#111;
              font-weight:bold;
              font-size:12px`
           )
         );
       }

       row.append(balls);
       p.append(row);
     }

     const controls = el(
       'div',
       undefined,
       'display:flex;gap:7px;margin-top:10px'
     );

     const update = el(
       'button',
       'Atualizar agora',
       `background:#e6b638;
        color:#000;
        border:0;
        border-radius:7px;
        padding:9px;
        font-weight:bold`
     );

     update.onclick = refreshAutomatic;
     controls.append(update);

     const copy = el(
       'button',
       'Copiar diagnóstico',
       `background:#333;
        color:white;
        border:1px solid #777;
        border-radius:7px;
        padding:9px`
     );

     copy.onclick = async () => {
       const report = [
         'MATRIZ CAIXA LOTOBANCA 8.5',
         'API: ' + calls,
         'Respostas: ' + responses,
         'Válidos: ' + lastValid,
         'Novos: ' + lastNew,
         'Salvos: ' + history.length,
         'Última leitura: ' + lastUpdate,
         'Aviso: ' + problem
       ].join('\n');

       try {
         await navigator.clipboard.writeText(
           report
         );
         copy.textContent = 'Copiado';
       } catch {
         const t = el('textarea');
         t.value = report;
         t.style.cssText =
           'width:100%;height:85px';
         p.append(t);
         t.select();
       }
     };

     controls.append(copy);
     p.append(controls);
   }

   function scheduleRender() {
     if (pending) return;

     pending = true;

     setTimeout(() => {
       pending = false;
       render();
     }, 250);
   }

   if (document.readyState === 'loading') {
     document.addEventListener(
       'DOMContentLoaded',
       render,
       { once: true }
     );
   } else {
     render();
   }

   setTimeout(render, 1500);
   setInterval(render, 15000);
   setInterval(refreshAutomatic, INTERVAL);
 })();