import json
import os
import urllib.request
from pathlib import Path

endpoint = os.environ.get("LOTOBANCA_API_URL")
if not endpoint:
    raise SystemExit("Falta configurar LOTO BANCA API URL")
request = urllib.request.Request(endpoint, data=b"{}", headers={"Content-Type": "application/json"}, method="POST")
with urllib.request.urlopen(request, timeout=25) as response:
    payload = json.load(response)
print("Consulta realizada. Resposta recebida:", type(payload).__name__)
