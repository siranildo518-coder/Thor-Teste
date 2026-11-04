"""Diagnostico da renderizacao, sem registrar dados pessoais nem conteudo da pagina."""
import os
from collections import Counter
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loto-turbo/resultados"

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

def main():
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        js_errors = []
        request_failures = []
        bad_responses = []
        page.on("pageerror", lambda err: js_errors.append(str(err)))
        page.on("requestfailed", lambda req: request_failures.append((urlparse(req.url).hostname or "?", req.failure or "falha")))
        page.on("response", lambda resp: bad_responses.append((resp.status, urlparse(resp.url).hostname or "?")) if resp.status >= 400 else None)
        try:
            response = page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
            print("Firefox iniciou: SIM")
            print("HTTP da pagina:", response.status if response else "sem resposta")
            print("Secrets configurados:", "SIM" if os.getenv("LOTOBANCA_LOGIN") and os.getenv("LOTOBANCA_SENHA") else "NAO")
            page.wait_for_timeout(5000)
            inspect(page, "apos 5 segundos")
            page.wait_for_timeout(7000)
            inspect(page, "apos 12 segundos")
            print("Erros JavaScript:", len(js_errors))
            # Categorias de erro, nunca imprimir mensagens completas nem URLs.
            print("Tipos de erro JS:", dict(Counter(e.split(":")[0][:50] for e in js_errors)))
            print("Requisicoes falhadas:", len(request_failures))
            print("Falhas por dominio:", dict(Counter(host for host, _ in request_failures)))
            print("Falhas por motivo:", dict(Counter(reason[:90] for _, reason in request_failures)))
            print("Respostas HTTP >=400:", dict(Counter(str(status) for status, _ in bad_responses)))
            print("Dominios HTTP >=400:", dict(Counter(host for _, host in bad_responses)))
            print("Credenciais utilizadas: NAO")
            print("Resultados existentes: NAO ALTERADOS")
        except Exception as exc:
            print("Diagnostico interrompido:", type(exc).__name__)
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
