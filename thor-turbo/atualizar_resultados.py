#!/usr/bin/env python3
"""Atualiza resultados Turbo sem substituir a base por dados vazios."""
import datetime as dt
import json
import os
import pathlib
import urllib.request

BASE = pathlib.Path("thor-turbo/resultados.json")
URL = "https://api.lotobanca.com/parse/functions/loto-turbo-listar-sorteios"
cookie = os.getenv("LOTO_TURBO_COOKIE", "").strip()
headers = {"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "ThorTurboSync/1.0"}
if cookie:
    headers["Cookie"] = cookie
req = urllib.request.Request(URL, data=b"{}", headers=headers, method="POST")
with urllib.request.urlopen(req, timeout=30) as response:
    payload = json.load(response)

def find_rows(value, depth=0):
    if depth > 5:
        return []
    if isinstance(value, list):
        if value and isinstance(value[0], dict):
            return value
        return []
    if isinstance(value, dict):
        for key in ("records", "resultados", "sorteios", "dados", "items", "results", "result", "data"):
            if key in value:
                found = find_rows(value[key], depth + 1)
                if found:
                    return found
    return []

def numbers(v):
    if isinstance(v, list):
        try:
            return [int(x) for x in v]
        except (TypeError, ValueError):
            return []
    if isinstance(v, str):
        import re
        return [int(x) for x in __import__("re").findall(r"\d+", v)]
    return []

def normalize(row):
    if not isinstance(row, dict):
        return None
    modality = next((row[k] for k in ("modalidade", "loteria", "nomeModalidade", "lotteryName") if isinstance(row.get(k), str) and row[k].strip()), None)
    contest = next((row[k] for k in ("concurso", "numeroConcurso", "sorteioNumber", "numeroSorteio") if row.get(k) is not None), None)
    nums = next((numbers(row.get(k)) for k in ("dezenas", "numeros", "bolas", "resultNumbers") if numbers(row.get(k))), [])
    if not modality or not str(contest).isdigit() or not 5 <= len(nums) <= 50 or len(set(nums)) != len(nums):
        return None
    out = {"modalidade": modality, "concurso": str(contest), "dezenas": nums}
    for k in ("data", "horario", "scheduledAt", "sorteio"):
        if row.get(k) is not None:
            out[k] = row[k]
    if "scheduledAt" not in out and row.get("scheduledAt"):
        out["scheduledAt"] = row["scheduledAt"]
    return out

incoming = [r for row in find_rows(payload) if (r := normalize(row))]
if not incoming:
    raise SystemExit("API sem resultados validos: base existente preservada.")
old = json.loads(BASE.read_text(encoding="utf-8"))
existing = old.get("records", [])
if not isinstance(existing, list):
    raise SystemExit("Base existente invalida: nenhuma alteracao.")

def key(row):
    return (str(row.get("modalidade", "")).strip().lower(), str(row.get("concurso", "")), str(row.get("sorteio", 1)))
merged = {key(row): row for row in existing if isinstance(row, dict)}
added = 0
for row in incoming:
    k = key(row)
    if k not in merged:
        merged[k] = row
        added += 1
if not added:
    print(f"Sem novos concursos; {len(existing)} registros preservados.")
else:
    old["records"] = list(merged.values())
    old["dataExportacao"] = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    BASE.write_text(json.dumps(old, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Novos registros: {added}; total: {len(old['records'])}.")
