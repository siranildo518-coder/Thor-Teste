"""Matriz Turbo GitHub — diagnóstico independente, sem credenciais e sem alterações de resultados."""
import json
import urllib.error
import urllib.request
from datetime import datetime, timezone

URL = "https://api.lotobanca.com/parse/functions/loto-turbo-listar-sorteios"

def main():
    req = urllib.request.Request(
        URL,
        data=b"{}",
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = resp.status
            body = resp.read(100000)
    except urllib.error.HTTPError as exc:
        status = exc.code
        body = b""
    except Exception as exc:
        print(json.dumps({"status": "erro_de_rede", "tipo": type(exc).__name__}))
        return
    print(json.dumps({
        "matriz": "GitHub teste",
        "horario_utc": datetime.now(timezone.utc).isoformat(),
        "http": status,
        "resposta_json": bool(body and body.lstrip().startswith((b"{", b"["))),
        "observacao": "Teste de acesso apenas. Nenhum resultado foi alterado."
    }, ensure_ascii=False))
    if status in (401, 403):
        print("Acesso nao autorizado. Nao tentar contornar autenticacao.")

if __name__ == "__main__":
    main()
