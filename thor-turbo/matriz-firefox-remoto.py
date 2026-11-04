"""Teste isolado de Firefox remoto. Nunca grava resultados nem credenciais."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as BrowserTimeout

SITE = "https://turbo.lotobanca.com/loto-turbo/resultados"

def main():
    cpf = os.getenv("LOTOBANCA_LOGIN", "").strip()
    senha = os.getenv("LOTOBANCA_SENHA", "")
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        try:
            response = page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)
            print("Firefox iniciou: SIM")
            print("HTTP da pagina:", response.status if response else "sem resposta")
            print("Dominio final:", urlparse(page.url).hostname)
            print("Campos de senha visiveis:", page.locator('input[type="password"]:visible').count())
            print("Campos de texto visiveis:", page.locator('input[type="text"]:visible, input[type="email"]:visible, input:not([type]):visible').count())
            print("Secrets configurados:", "SIM" if cpf and senha else "NAO")
            # Não arriscar submeter login sem validar previamente os campos reais do site.
            print("Login automatico: AGUARDANDO VALIDACAO DA TELA")
            print("Resultados existentes: NAO ALTERADOS")
        except BrowserTimeout:
            print("Falha: tempo limite ao abrir pagina")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
