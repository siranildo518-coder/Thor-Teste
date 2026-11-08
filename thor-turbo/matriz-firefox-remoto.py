"""Diagnostico da renderizacao, sem registrar dados pessoais nem conteudo da pagina."""
import os
import importlib.util
from pathlib import Path
from collections import Counter
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loto-turbo/resultados"

API_MATRIZ85 = "loto-turbo-listar-sorteios"
TAMANHOS_MATRIZ85 = {
    "Lotomania Turbo": (20, 0, 100),
    "Lotofácil Turbo": (15, 1, 25),
    "Mega-Sena Turbo": (6, 1, 60),
    "Quina Turbo": (5, 1, 80),
    "Dia de Sorte Turbo": (7, 1, 31),
    "Dupla Sena Turbo": (6, 1, 50),
}

def contar_registros_matriz85(payload):
    """Replica a validacao essencial da Matriz 8.5, sem salvar ou expor dezenas."""
    import unicodedata
    def normalizar(v):
        return "".join(c for c in unicodedata.normalize("NFD", str(v or ""))
                       if unicodedata.category(c) != "Mn").lower()
    visitados = set()
    validos = set()
    def walk(node, depth=0):
        if depth > 18 or not isinstance(node, (dict, list)) or id(node) in visitados:
            return
        visitados.add(id(node))
        if isinstance(node, list):
            for v in node[:3000]:
                walk(v, depth + 1)
            return
        nome_raw = normalizar(node.get("lotteryName") or node.get("lotteryKey"))
        nome = next((n for n in TAMANHOS_MATRIZ85 if normalizar(n) in nome_raw), None)
        if nome:
            tamanho, minimo, maximo = TAMANHOS_MATRIZ85[nome]
            dezenas = node.get("resultNumbers")
            if isinstance(dezenas, str):
                import re
                dezenas = re.findall(r"\\d{1,3}", dezenas) if re.fullmatch(r"[\\d\\s,;|.\\-]+", dezenas) else None
            if isinstance(dezenas, list) and len(dezenas) == tamanho:
                try:
                    nums = [int(x) for x in dezenas]
                    concurso = str(node.get("sorteioNumber") or "")
                    if (all(str(x).strip().isdigit() for x in dezenas)
                            and len(set(nums)) == tamanho
                            and all(minimo <= n <= maximo for n in nums)
                            and concurso.isdigit()
                            and node.get("scheduledAt")):
                        validos.add((nome, concurso))
                except (ValueError, TypeError):
                    pass
        for k, v in node.items():
            if any(x in k.lower() for x in ("senha", "token", "auth", "session", "user", "cpf", "email", "telefone", "wallet", "saldo")):
                continue
            walk(v, depth + 1)
    walk(payload)
    return len(validos)

def diagnosticar_result(payload):
    """Somente formato, contagens e nomes permitidos; nunca valores da resposta."""
    tipos = {dict: "objeto", list: "lista", str: "texto", int: "numero",
             float: "numero", bool: "booleano", type(None): "nulo"}
    def tipo(v):
        return tipos.get(type(v), "outro")
    if not isinstance(payload, dict) or "result" not in payload:
        return {"campo_result": "ausente"}
    value = payload["result"]
    info = {"campo_result": "presente", "tipo": tipo(value)}
    if isinstance(value, list):
        info["quantidade"] = len(value)
        info["tipos_itens"] = dict(Counter(tipo(x) for x in value[:100]))
        if value and isinstance(value[0], dict):
            permitidos = ("lotteryName", "lotteryKey", "sorteioNumber",
                          "resultNumbers", "scheduledAt", "data", "items", "results")
            info["campos_primeiro_item"] = [k for k in permitidos if k in value[0]]
    elif isinstance(value, dict):
        permitidos = ("lotteryName", "lotteryKey", "sorteioNumber",
                      "resultNumbers", "scheduledAt", "data", "items", "results",
                      "sorteios", "error", "code", "message")
        info["campos_reconhecidos"] = [k for k in permitidos if k in value]
        info["total_campos"] = len(value)
        info["tipos_valores"] = dict(Counter(tipo(v) for v in value.values()))
        info["tamanhos_listas"] = sorted((len(v) for v in value.values() if isinstance(v, list)), reverse=True)[:5]
    elif isinstance(value, str):
        info["texto_vazio"] = not bool(value.strip())
        info["comprimento_texto"] = len(value)
    return info

def inspect(page, label):
    print("Etapa:", label)
    print("Dominio final:", urlparse(page.url).hostname)
    print("Titulo presente:", bool(page.title().strip()))
    print("HTML bytes:", len(page.content().encode("utf-8")))
    print("Texto visivel caracteres:", len(page.locator("body").inner_text(timeout=5000)))
    print("Inputs:", page.locator("input").count())
    print("Botoes:", page.locator("button").count())
    print("Links:", page.locator("a").count())
    print("Frames:", len(page.frames))
    print("Scripts:", page.locator("script").count())
    print("Formularios:", page.locator("form").count())
    print("Body filhos:", page.locator("body > *").count())
    print("Body tags:", dict(Counter(page.locator("body > *").evaluate_all("(els) => els.map(e => e.tagName.toLowerCase())"))))
    print("Estado documento:", page.evaluate("document.readyState"))
    print("Flutter views:", page.locator("flutter-view").count())
    print("Semantics hosts:", page.locator("flt-semantics-host").count())
    print("Canvas:", page.locator("canvas").count())
    print("Botoes acessiveis:", page.get_by_role("button").count())
    print("Inputs acessiveis:", page.get_by_role("textbox").count())
    print("Viewport:", page.viewport_size)


# Executado antes dos scripts da pagina, como @run-at document-start da Matriz 8.5.
# Captura a resposta original e repete a mesma requisicao sem guardar credenciais.
MATRIZ_INIT = r"""
(() => {
 const match = u => { try { return new URL(u, location.href).pathname.includes('loto-turbo-listar-sorteios') } catch { return false } };
 const originalFetch = window.fetch;
 let template = null;
 window.__thorMatriz = {calls:0, responses:0, refresh:async () => {
   if (!template) return false;
   const response = await originalFetch.call(window, template.clone());
   window.__thorMatriz.responses++;
   return response.ok;
 }};
 window.fetch = function(input, init) {
   try {
     const req = new Request(input, init);
     if (match(req.url)) { template=req.clone(); window.__thorMatriz.calls++; }
   } catch {}
   return originalFetch.apply(this, arguments);
 };
 const proto=XMLHttpRequest.prototype, open=proto.open, send=proto.send, header=proto.setRequestHeader;
 proto.open=function(method,url) {
   this.__thorRequest=match(url)?{method,url:new URL(url,location.href).href,headers:{}}:null;
   return open.apply(this,arguments);
 };
 proto.setRequestHeader=function(k,v) {
   if(this.__thorRequest)this.__thorRequest.headers[k]=v;
   return header.apply(this,arguments);
 };
 proto.send=function(body) {
   if(this.__thorRequest) {
     try {
       const x=this.__thorRequest;
       template=new Request(x.url,{method:x.method,headers:x.headers,body:/^(GET|HEAD)$/i.test(x.method)?undefined:body,credentials:'include'});
       window.__thorMatriz.calls++;
     } catch {}
   }
   return send.apply(this,arguments);
 };
})();
"""

def main():
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        context.add_init_script(script=MATRIZ_INIT)
        page = context.new_page()
        js_errors = []
        request_failures = []
        bad_responses = []
        auth_requests = []
        auth_signals = []
        result_responses = []
        matriz85_responses = []
        api_diagnostics = []
        payloads_validos = []
        post_login_traffic = []
        page.on("pageerror", lambda err: js_errors.append(str(err)))
        page.on("requestfailed", lambda req: request_failures.append((urlparse(req.url).hostname or "?", req.failure or "falha")))
        page.on("response", lambda resp: bad_responses.append((resp.status, urlparse(resp.url).hostname or "?")) if resp.status >= 400 else None)
        # Registrar apenas metadados de requisicoes POST, nunca URL, corpo, cookies ou tokens.
        page.on("response", lambda resp: auth_requests.append(resp.status) if resp.request.method == "POST" and urlparse(resp.url).hostname in ("turbo.lotobanca.com", "api.lotobanca.com") else None)
        def check_auth_response(resp):
            if resp.request.method != "POST" or urlparse(resp.url).hostname not in ("turbo.lotobanca.com", "api.lotobanca.com"):
                return
            try:
                data = resp.json()
                if not isinstance(data, dict):
                    return
                if isinstance(data.get("sessionToken"), str) and data["sessionToken"]:
                    auth_signals.append("SESSION_TOKEN")
                if data.get("success") is True:
                    auth_signals.append("SUCCESS_TRUE")
                if data.get("success") is False or data.get("error") or data.get("errors"):
                    auth_signals.append("ERROR_REPORTED")
            except Exception:
                pass
        page.on("response", check_auth_response)
        def check_results_response(resp):
            # Apenas observar trafego autorizado do proprio navegador.
            # Nao reproduzir chamadas, nem imprimir URL, dados ou credenciais.
            host = urlparse(resp.url).hostname or ""
            path = urlparse(resp.url).path.lower()
            if host not in ("turbo.lotobanca.com", "api.lotobanca.com"):
                return
            if API_MATRIZ85 not in path:
                return
            if resp.request.resource_type == "document":
                return
            record = {"status": resp.status, "method": resp.request.method}
            # Identificar falha HTTP e formato sem imprimir corpo, chaves
            # livres, URL, token ou qualquer dado da conta.
            diagnostic = {"http": resp.status, "metodo": resp.request.method,
                          "tipo_conteudo": "json" if "json" in (resp.headers.get("content-type") or "").lower() else "outro",
                          "campos_esperados": [], "registros": 0}
            api_diagnostics.append(diagnostic)
            try:
                payload = resp.json()
                expected = ("results", "result", "data", "items", "sorteios", "lotteryName",
                            "lotteryKey", "sorteioNumber", "resultNumbers", "scheduledAt",
                            "error", "code", "message")
                if isinstance(payload, dict):
                    diagnostic["campos_esperados"] = [key for key in expected if key in payload]
                    diagnostic["formato"] = "objeto"
                elif isinstance(payload, list):
                    diagnostic["formato"] = "lista"
                    diagnostic["registros"] = len(payload)
                else:
                    diagnostic["formato"] = type(payload).__name__
                diagnostic["estrutura_result"] = diagnosticar_result(payload)
                diagnostic["registros_validos"] = contar_registros_matriz85(payload)
                if resp.status == 200 and diagnostic["registros_validos"] > 0:
                    payloads_validos.append(payload)
                    spec = importlib.util.spec_from_file_location("extrator_turbo", "thor-turbo/atualizar-resultados-remoto.py")
                    extrator = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(extrator)
                    encontrados = extrator.extrair(payload)
                    if encontrados:
                        recente = max(encontrados, key=lambda x: x["scheduledAt"])
                        diagnostic["ultimo_sorteio_api"] = {"concurso": recente["concurso"], "data": recente["data"], "horario": recente["horario"]}
                        print("Ultimo sorteio retornado pela API:", diagnostic["ultimo_sorteio_api"])
                record["validos_matriz85"] = contar_registros_matriz85(payload)
                record["json"] = isinstance(payload, (list, dict))
                if isinstance(payload, list):
                    record["itens"] = len(payload)
                elif isinstance(payload, dict):
                    record["itens"] = max((len(v) for v in payload.values() if isinstance(v, list)), default=0)
                # Diagnostico apenas estrutural, sem exibir valores, chaves
                # arbitrarias ou qualquer dado pessoal.
                if isinstance(payload, dict):
                    record["raiz"] = "objeto"
                    record["campos_raiz"] = len(payload)
                    record["tipos_raiz"] = dict(Counter(
                        "lista" if isinstance(v, list) else
                        "objeto" if isinstance(v, dict) else
                        "texto" if isinstance(v, str) else
                        "numero" if isinstance(v, (int, float)) else
                        "outro"
                        for v in payload.values()
                    ))
                    record["listas_raiz"] = sorted(
                        (len(v) for v in payload.values() if isinstance(v, list)),
                        reverse=True
                    )[:5]
                    record["objetos_raiz"] = sum(isinstance(v, dict) for v in payload.values())
                    record["listas_aninhadas"] = sorted(
                        (len(nested) for v in payload.values() if isinstance(v, dict)
                         for nested in v.values() if isinstance(nested, list)),
                        reverse=True
                    )[:5]
                elif isinstance(payload, list):
                    record["raiz"] = "lista"
                    record["campos_raiz"] = 0
                    record["tipos_raiz"] = {}
                    record["listas_raiz"] = [len(payload)]
                    record["objetos_raiz"] = 0
                    record["listas_aninhadas"] = []
                else:
                    record["raiz"] = "outro"
            except Exception:
                diagnostic["formato"] = "nao-json-ou-indisponivel"
                record["json"] = False
                record["itens"] = 0
            result_responses.append(record)
            matriz85_responses.append(record)
        page.on("response", check_results_response)
        def traffic_summary(resp):
            host = urlparse(resp.url).hostname or ""
            if host not in ("turbo.lotobanca.com", "api.lotobanca.com"):
                return
            if resp.request.resource_type not in ("fetch", "xhr"):
                return
            # Guardar somente metadados: sem URLs, parametros, headers, cookies ou payloads.
            post_login_traffic.append((resp.request.method, resp.status, host, resp.request.resource_type))
        page.on("response", traffic_summary)
        try:
            response = page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
            print("Firefox iniciou: SIM")
            print("HTTP da pagina:", response.status if response else "sem resposta")
            print("Secrets configurados:", "SIM" if os.getenv("LOTOBANCA_LOGIN") and os.getenv("LOTOBANCA_SENHA") else "NAO")
            page.wait_for_timeout(5000)
            inspect(page, "apos 5 segundos")
            page.wait_for_timeout(7000)
            inspect(page, "apos 12 segundos")
            print("Botoes acessiveis:", page.get_by_role("button").count())
            for index in range(min(page.get_by_role("button").count(), 5)):
                button = page.get_by_role("button").nth(index)
                print("Botao acessivel", index + 1, "visivel:", button.is_visible())
            # Captura somente a pagina deslogada, antes de qualquer uso de credenciais.
            Path("diagnostico").mkdir(exist_ok=True)
            page.screenshot(path="diagnostico/tela-lotobanca.png", full_page=False, timeout=10000)
            print("Captura de tela sem login: salva como artefato")
            print("Erros JavaScript:", len(js_errors))
            # Categorias de erro, nunca imprimir mensagens completas nem URLs.
            print("Tipos de erro JS:", dict(Counter(e.split(":")[0][:50] for e in js_errors)))
            print("Requisicoes falhadas:", len(request_failures))
            print("Falhas por dominio:", dict(Counter(host for host, _ in request_failures)))
            print("Falhas por motivo:", dict(Counter(reason[:90] for _, reason in request_failures)))
            print("Respostas HTTP >=400:", dict(Counter(str(status) for status, _ in bad_responses)))
            print("Dominios HTTP >=400:", dict(Counter(host for _, host in bad_responses)))
            cpf = os.getenv("LOTOBANCA_LOGIN", "").strip()
            senha = os.getenv("LOTOBANCA_SENHA", "")
            if cpf and senha:
                print("Tentativa de login: INICIADA")
                posts_antes = len(auth_requests)
                sinais_antes = len(auth_signals)
                # Coordenadas verificadas na captura da tela Flutter 1280x720.
                # Nao imprimir valores nem capturar imagens apos preencher credenciais.
                page.mouse.click(970, 306)
                page.keyboard.insert_text(cpf)
                page.mouse.click(970, 395)
                page.keyboard.insert_text(senha)
                page.mouse.click(980, 500)
                page.wait_for_timeout(8000)
                print("Tentativa de login: ENVIADA")
                print("POSTs Lotobanca apos clique:", len(auth_requests) - posts_antes)
                print("Status HTTP dos POSTs:", auth_requests[posts_antes:])
                novos_sinais = auth_signals[sinais_antes:]
                print("Sinais de autenticacao:", dict(Counter(novos_sinais)))
                if "SESSION_TOKEN" in novos_sinais:
                    print("Indicador de autenticacao: TOKEN DE SESSAO RECEBIDO")
                elif "ERROR_REPORTED" in novos_sinais:
                    print("Indicador de autenticacao: RESPOSTA COM ERRO - verificar login")
                else:
                    print("Indicador de autenticacao: INDETERMINADO - sem comprovacao de sessao")
                # Nenhum conteudo autenticado ou credencial e gravado em artefatos.
                print("Dominio apos tentativa:", urlparse(page.url).hostname)
                print("Flutter presente apos tentativa:", page.locator("flutter-view").count() > 0)
                print("Observacao: token recebido nao prova acesso a resultados.")
                print("Etapa: verificar leitura dos sorteios pela sessao atual")
                antes_resultados = len(result_responses)
                antes_matriz = len(matriz85_responses)
                antes_trafego = len(post_login_traffic)
                try:
                    page.goto(SITE, wait_until="domcontentloaded", timeout=20000)
                    page.wait_for_timeout(7000)
                    page.reload(wait_until="domcontentloaded", timeout=20000)
                    page.wait_for_timeout(5000)
                    # Repetir a consulta original capturada pela Matriz virtual.
                    # A resposta passa pelo listener de rede e pelo extrator existentes.
                    try:
                        estado = page.evaluate("window.__thorMatriz ? {calls:window.__thorMatriz.calls, responses:window.__thorMatriz.responses} : null")
                        print("Matriz virtual: chamadas capturadas:", estado)
                        if estado and estado["calls"] > 0:
                            repetida = page.evaluate("window.__thorMatriz.refresh()")
                            page.wait_for_timeout(1500)
                            print("Matriz virtual: repeticao da consulta:", "SIM" if repetida else "NAO")
                        else:
                            print("Matriz virtual: nenhuma requisicao original para repetir")
                    except Exception as exc:
                        print("Matriz virtual: falha ao repetir consulta:", type(exc).__name__)
                    novos = result_responses[antes_resultados:]
                    print("API identificada pela Matriz 8.5:", API_MATRIZ85)
                    print("Respostas da API apos navegacao:", len(novos))
                    print("Respostas da API desde abertura:", len(matriz85_responses))
                    print("Diagnostico API Matriz 8.5 (sem dados privados):", api_diagnostics[:8])
                    print("Status HTTP API Matriz 8.5:", dict(Counter(str(x["http"]) for x in api_diagnostics)))
                    print("HTTP 502 na API de sorteios:", sum(x["http"] == 502 for x in api_diagnostics))
                    print("API sem registros validos:", not any(x.get("registros_validos", 0) > 0 for x in api_diagnostics))
                    print("Concursos validos conforme Matriz 8.5:", max((x.get("validos_matriz85", 0) for x in matriz85_responses), default=0))
                    print("Respostas de resultados observadas:", len(novos))
                    print("Status de resultados:", dict(Counter(str(item["status"]) for item in novos)))
                    print("Respostas JSON de resultados:", sum(1 for item in novos if item["json"]))
                    print("Maior lista de sorteios observada:", max((item["itens"] for item in novos), default=0))
                    for idx, item in enumerate(novos[:3], 1):
                        print("Estrutura resposta", idx, ":", {
                            "raiz": item.get("raiz", "nao-json"),
                            "campos_raiz": item.get("campos_raiz", 0),
                            "tipos_raiz": item.get("tipos_raiz", {}),
                            "listas_raiz": item.get("listas_raiz", []),
                            "objetos_raiz": item.get("objetos_raiz", 0),
                            "listas_aninhadas": item.get("listas_aninhadas", []),
                        })
                    print("Leitura confirmada:", "SIM" if any(item["status"] == 200 and item.get("validos_matriz85", 0) > 0 for item in matriz85_responses) else "NAO - diagnostico pendente")
                    trafego = post_login_traffic[antes_trafego:]
                    print("Chamadas XHR/fetch apos navegacao:", len(trafego))
                    print("Chamadas por metodo e status:", dict(Counter(f"{method} HTTP {status}" for method, status, _, _ in trafego)))
                    print("Chamadas por dominio:", dict(Counter(host for _, _, host, _ in trafego)))
                    print("Chamadas por tipo:", dict(Counter(kind for _, _, _, kind in trafego)))
                except Exception as exc:
                    print("Leitura confirmada: NAO -", type(exc).__name__)
            else:
                print("Tentativa de login: IGNORADA (secrets ausentes)")
            if payloads_validos:
                spec = importlib.util.spec_from_file_location("extrator_turbo", "thor-turbo/atualizar-resultados-remoto.py")
                modulo = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(modulo)
                modulo.atualizar(payloads_validos)
            else:
                print("Resultados existentes: NAO ALTERADOS - sem concursos validos")
        except Exception as exc:
            print("Diagnostico interrompido:", type(exc).__name__)
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
