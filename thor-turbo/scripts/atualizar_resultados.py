import json
import os
import urllib.request
from pathlib import Path

endpoint = os.environ.get("LOTOBANCA_API_URL", "https://api.lotobanca.com/parse/functions/loto-turbo-listar-sorteios")
headers = {"Content-Type": "application/json", "Accept": "application/json"}
token = os.environ.get("LOTOBANCA_AUTH_TOKEN", "").strip()
app_id = os.environ.get("LOTOBANCA_APP_ID", "").strip()
if token:
    headers["Authorization"] = token
if app_id:
    headers["X-Parse-Application-Id"] = app_id
body = os.environ.get("LOTOBANCA_REQUEST_BODY", "{}").encode("utf-8")
request = urllib.request.Request(endpoint, data=body, headers=headers, method="POST")
with urllib.request.urlopen(request, timeout=25) as response:
    payload = json.load(response)
print("Resposta recebida:", type(payload).__name__)
if isinstance(payload, dict):
    print("Campos disponíveis:", ", ".join(payload.keys()))
raise SystemExit("Aguardando validação do formato e autorização da API; base preservada.")
