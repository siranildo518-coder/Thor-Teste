// ==UserScript==
// @name         THOR - Matriz 8.5 sincronizar GitHub
// @namespace    thor.lototurbo.sync
// @version      1.1.0
// @description  Publica no Thor-Teste os resultados ja capturados pela Matriz 8.5
// @match        https://turbo.lotobanca.com/loto-turbo/resultados*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      api.github.com
// ==/UserScript==

(function () {
  'use strict';
  const MATRIX_KEY = 'matriz_loto_turbo_v8';
  const TOKEN_KEY = 'thor_turbo_github_fine_grained_token';
  const REPO = 'siranildo518-coder/Thor-Teste';
  const BRANCH = 'main';
  const FILE = 'thor-turbo/resultados.json';
  const URL = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
  const SIZES = {'Lotomania Turbo':20,'Lotofácil Turbo':15,'Mega-Sena Turbo':6,'Quina Turbo':5,'Dia de Sorte Turbo':7,'Dupla Sena Turbo':6};
  let busy = false;
  let lastMessage = 'Aguardando configuração';

  function show(message) {
    lastMessage = message;
    if (!document.body) return;
    let panel = document.getElementById('thor-matriz-github-sync');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'thor-matriz-github-sync';
      panel.style.cssText = 'position:fixed;top:6px;right:6px;z-index:2147483646;max-width:220px;padding:8px;border:1px solid #e6b638;border-radius:8px;background:#171717;color:#f4d36c;font:12px Arial,sans-serif;box-shadow:0 2px 8px #0007';
      document.body.appendChild(panel);
    }
    panel.textContent = 'Matriz → GitHub: ' + message;
  }

  function api(method, url, token, payload) {
    return new Promise((resolve, reject) => GM_xmlhttpRequest({
      method, url, timeout:30000,
      headers: {
        'Accept':'application/vnd.github+json',
        'Authorization':'Bearer ' + token,
        'X-GitHub-Api-Version':'2022-11-28',
        ...(payload ? {'Content-Type':'application/json'} : {})
      },
      data: payload ? JSON.stringify(payload) : undefined,
      onload: response => {
        let obj = {};
        try { obj = JSON.parse(response.responseText); } catch (_) {}
        if (response.status >= 200 && response.status < 300) resolve(obj);
        else reject(new Error('GitHub HTTP ' + response.status + ': ' + (obj.message || 'falha')));
      },
      onerror: () => reject(new Error('Falha de conexão com GitHub')),
      ontimeout: () => reject(new Error('Tempo esgotado'))
    }));
  }

  function decodeBase64(text) {
    const bytes = Uint8Array.from(atob(text.replace(/\s/g, '')), ch => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  function encodeBase64(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }
  function valid(row) {
    return row && Object.prototype.hasOwnProperty.call(SIZES, row.modalidade) &&
      /^\d{1,9}$/.test(String(row.concurso)) &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(row.data)) &&
      Array.isArray(row.dezenas) && row.dezenas.length === SIZES[row.modalidade] &&
      row.dezenas.every(n => Number.isInteger(Number(n)));
  }
  function identity(row) {
    return row.modalidade + '|' + String(row.concurso) + '|' + (row.sorteio === 2 ? '2' : '1');
  }
  function matrixRows() {
    try {
      const data = JSON.parse(localStorage.getItem(MATRIX_KEY) || '{}');
      if (!data || typeof data !== 'object') return [];
      return (Array.isArray(data) ? data : Object.values(data).flatMap(value => Array.isArray(value) ? value : [value])).filter(valid);
    } catch (_) { return []; }
  }

  async function synchronize() {
    if (busy) return;
    const token = GM_getValue(TOKEN_KEY, '');
    if (!token) { show('configure acesso no menu do Tampermonkey'); return; }
    const incoming = matrixRows();
    if (!incoming.length) { show('aguardando resultados da Matriz 8.5'); return; }
    busy = true;
    try {
      const current = await api('GET', URL + '?ref=' + encodeURIComponent(BRANCH) + '&v=' + Date.now(), token);
      const database = decodeBase64(current.content);
      if (!Array.isArray(database.records)) throw new Error('Formato de resultados.json desconhecido');
      // Preserva integralmente os registros existentes, inclusive entradas antigas.
      const existing = new Map(database.records.filter(valid).map((row, i) => [identity(row), i]));
      let added = 0;
      for (const row of incoming) {
        if (!existing.has(identity(row))) {
          database.records.push(row);
          existing.set(identity(row), database.records.length - 1);
          added++;
        }
      }
      if (!added) { show('sincronizado; ' + database.records.length + ' registros'); return; }
      database.dataExportacao = new Date().toISOString();
      await api('PUT', URL, token, {
        message: 'Thor Turbo: importar ' + added + ' resultados da Matriz 8.5',
        content: encodeBase64(database),
        sha: current.sha,
        branch: BRANCH
      });
      show('enviados ' + added + ' novos; total ' + database.records.length);
    } catch (error) {
      show('erro: ' + error.message);
    } finally { busy = false; }
  }

  GM_registerMenuCommand('Configurar token GitHub Thor-Teste', () => {
    const value = prompt('Cole um token fine-grained com acesso SOMENTE ao Thor-Teste e permissao Contents: Read and write. Nunca envie seu token pelo chat.');
    if (value && value.trim()) {
      GM_setValue(TOKEN_KEY, value.trim());
      synchronize();
    }
  });
  GM_registerMenuCommand('Enviar resultados da Matriz agora', synchronize);
  GM_registerMenuCommand('Apagar autorização GitHub deste script', () => {
    GM_setValue(TOKEN_KEY, '');
    show('autorização apagada');
  });
  setTimeout(() => { show(lastMessage); synchronize(); }, 3000);
  setInterval(synchronize, 60000);
})();