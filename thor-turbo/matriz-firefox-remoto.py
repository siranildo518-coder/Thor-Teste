"""Diagnóstico seguro do login no Firefox remoto, sem enviar credenciais."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as BrowserTimeout

SITE = "https://turbo.lotobanca.com/loto-turbo/resultados"
LOGIN_WORDS = ("entrar", "login", "acessar", "iniciar sessão", "fazer login", "sign in")

def report(page, stage):
    print("Etapa:", stage)
    print("Dominio:", urlparse(page.url).hostname)
    print("Frames:", len(page.frames))
    for i, frame in enumerate(page.frames[:8]):
        try:
            fields = frame.locator("input:visible")
            passwords = frame.locator('input[type="password"]:visible')
            print(f"Frame {i}: campos={fields.count()}, senhas={passwords.count()}")
            # Somente metadados do formulario, nunca valores, CPF ou senha.
            for j in range(min(fields.count(), 5)):
                inp = fields.nth(j)
                print("Campo:", {
                    "tipo": inp.get_attribute("type") or "text",
                    "autocomplete": inp.get_attribute("autocomplete") or "",
                    "placeholder": (inp.get_attribute("placeholder") or "")[:60],
                })
        except Exception as exc:
            print("Frame inacessivel:", type(exc).__name__)

def main():
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        try:
            response = page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(5000)
            print("Firefox iniciou: SIM")
            print("HTTP da pagina:", response.status if response else "sem resposta")
            print("Secrets configurados:", "SIM" if os.getenv("LOTOBANCA_LOGIN") and os.getenv("LOTOBANCA_SENHA") else "NAO")
            report(page, "pagina inicial")
            found = False
            for frame in page.frames:
                for word in LOGIN_WORDS:
                    if found:
                        break
                    for selector in (f'button:has-text("{word}")', f'a:has-text("{word}")', f'[role="button"]:has-text("{word}")'):
                        try:
                            el = frame.locator(selector).first
                            if el.count() and el.is_visible(timeout=1000):
                                print("Acionando controle de login:", word)
                                el.click(timeout=5000)
                                page.wait_for_timeout(2500)
                                found = True
                                break
                        except Exception:
                            continue
            if found:
                report(page, "apos abrir login")
            else:
                print("Controle de login nao localizado automaticamente.")
            print("Credenciais utilizadas: NAO")
            print("Resultados existentes: NAO ALTERADOS")
        except BrowserTimeout:
            print("Falha: tempo limite ao abrir pagina")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
