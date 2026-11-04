"""Diagnostico de renderizacao da Lotobanca, sem revelar conteudo ou credenciais."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loto-turbo/resultados"

def inspect(page, label):
    print("Etapa:", label)
    print("Dominio final:", urlparse(page.url).hostname)
    print("Titulo presente:", bool(page.title().strip()))
    print("HTML bytes:", len(page.content().encode("utf-8")))
    print("Texto visivel caracteres:", len(page.locator("body").inner_text(timeout=5000)))
    print("Inputs totais:", page.locator("input").count())
    print("Inputs visiveis:", page.locator("input:visible").count())
    print("Botoes totais:", page.locator("button").count())
    print("Links totais:", page.locator("a").count())
    print("Frames:", len(page.frames))
    print("Elemento root:", page.locator("#root").count())
    print("Elemento app:", page.locator("#app").count())
    print("Scripts:", page.locator("script").count())
    print("Formulario:", page.locator("form").count())

def main():
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        errors = []
        failed = []
        page.on("pageerror", lambda error: errors.append(type(error).__name__))
        page.on("requestfailed", lambda request: failed.append(urlparse(request.url).hostname or "desconhecido"))
        try:
            response = page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
            print("Firefox iniciou: SIM")
            print("HTTP da pagina:", response.status if response else "sem resposta")
            print("Secrets configurados:", "SIM" if os.getenv("LOTOBANCA_LOGIN") and os.getenv("LOTOBANCA_SENHA") else "NAO")
            page.wait_for_timeout(4000)
            inspect(page, "apos 4 segundos")
            page.wait_for_timeout(8000)
            inspect(page, "apos 12 segundos")
            print("Erros JavaScript (quantidade):", len(errors))
            print("Requisicoes falhadas (quantidade):", len(failed))
            print("Dominios com falhas:", sorted(set(failed))[:10])
            print("Credenciais utilizadas: NAO")
            print("Resultados existentes: NAO ALTERADOS")
        except Exception as exc:
            print("Diagnostico falhou:", type(exc).__name__)
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
