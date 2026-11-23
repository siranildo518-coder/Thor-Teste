"""Coletor independente: resultados da Caixa publicados na Lotobanca, via Firefox virtual."""
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loterias-alternativas/resultados-caixa"
OUT = Path("caixa/resultados.json")
SIZES = {"lotofacil": 15, "megasena": 6, "quina": 5, "lotomania": 20, "diadesorte": 7, "duplasena": 6}
LIMITS = {"lotofacil": 25, "megasena": 60, "quina": 80, "lotomania": 100, "diadesorte": 31, "duplasena": 50}
LABELS = {"lotofacil": "Lotofácil", "megasena": "Mega-Sena", "quina": "Quina", "lotomania": "Lotomania", "diadesorte": "Dia de Sorte", "duplasena": "Dupla Sena"}

def norm(value):
    return "".join(c for c in unicodedata.normalize("NFD", str(value or "")) if unicodedata.category(c) != "Mn").lower()

def game_name(item):
    raw = norm(item.get("lotteryName") or item.get("lotteryKey") or item.get("modalidade") or item.get("loteria") or item.get("nomeLoteria") or item.get("nome") or item.get("name") or item.get("game"))
    if "turbo" in raw:
        return None
    for key, label in LABELS.items():
        if key in raw:
            return label
    return None

def parse_date(value):
    if isinstance(value, dict):
        value = value.get("iso") or value.get("date")
    if isinstance(value, (int, float)):
        value = datetime.fromtimestamp(value / 1000 if value > 10**11 else value, timezone.utc).isoformat()
    s = str(value or "").strip()
    br = re.match(r"^(\d{2})/(\d{2})/(\d{4})(?:[ T](\d{2}:\d{2}))?", s)
    if br:
        return f"{br.group(3)}-{br.group(2)}-{br.group(1)}", br.group(4) or ""
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return s, ""
    try:
        d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        local = d.astimezone(__import__("zoneinfo").ZoneInfo("America/Sao_Paulo"))
        return local.strftime("%Y-%m-%d"), local.strftime("%H:%M")
    except Exception:
        return "", ""

def parse_numbers(value, name):
    expected = SIZES[norm(name).replace(" ", "").replace("-", "")]
    if isinstance(value, str):
        if not re.fullmatch(r"[\d\s,;|.\-]+", value):
            return None
        value = re.findall(r"\d{1,3}", value)
    if not isinstance(value, list) or len(value) != expected:
        return None
    try:
        nums = [int(x) for x in value]
    except (ValueError, TypeError):
        return None
    low = 0 if name == "Lotomania" else 1
    if len(set(nums)) != expected or any(n < low or n > LIMITS[norm(name).replace(" ", "").replace("-", "")] for n in nums):
        return None
    return nums

def extract(payload):
    found = {}
    visited = set()
    def walk(node, depth=0):
        if depth > 18 or not isinstance(node, (dict, list)) or id(node) in visited:
            return
        visited.add(id(node))
        if isinstance(node, list):
            for child in node[:3000]:
                walk(child, depth + 1)
            return
        name = game_name(node)
        draw = str(node.get("sorteioNumber") or node.get("numeroConcurso") or node.get("numero") or node.get("concurso") or node.get("contestNumber") or node.get("drawNumber") or "")
        if name and draw.isdigit():
            raw_nums = node.get("resultNumbers") or node.get("listaDezenas") or node.get("dezenasSorteadasOrdemSorteio") or node.get("dezenas") or node.get("numeros") or node.get("numbers") or node.get("resultado")
            nums = parse_numbers(raw_nums, name)
            raw_date = node.get("scheduledAt") or node.get("dataApuracao") or node.get("dataSorteio") or node.get("data") or node.get("drawDate") or node.get("date")
            date, hour = parse_date(raw_date)
            if nums and date:
                row = {"modalidade": name, "concurso": draw, "data": date, "horario": hour, "dezenas": nums}
                if raw_date:
                    row["scheduledAt"] = raw_date if isinstance(raw_date, str) else date + ("T" + hour if hour else "")
                found[name + "|" + draw] = row
                second_raw = node.get("resultNumbers2") or node.get("listaDezenasSegundoSorteio")
                second = parse_numbers(second_raw, name) if name == "Dupla Sena" and second_raw else None
                if second:
                    found[name + "|" + draw + "|2"] = {**row, "sorteio": 2, "dezenas": second}
        for key, child in node.items():
            if re.search(r"senha|token|auth|session|user|cpf|email|telefone|wallet|saldo", key, re.I):
                continue
            if isinstance(child, (dict, list)):
                walk(child, depth + 1)
    walk(payload)
    return found

def main():
    captured = []
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        page = browser.new_page(locale="pt-BR", timezone_id="America/Sao_Paulo")
        def response_seen(response):
            host = urlparse(response.url).hostname or ""
            if host not in ("turbo.lotobanca.com", "api.lotobanca.com") or response.request.resource_type not in ("fetch", "xhr"):
                return
            if "json" not in (response.headers.get("content-type") or "").lower():
                return
            try:
                rows = extract(response.json())
                if rows:
                    captured.extend(rows.values())
            except Exception:
                pass
        page.on("response", response_seen)
        page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(12000)
        page.reload(wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(10000)
        browser.close()
    unique = {r["modalidade"] + "|" + str(r["concurso"]) + "|" + str(r.get("sorteio", 1)): r for r in captured}
    if not unique:
        raise SystemExit("Firefox não recebeu resultados Caixa válidos da página Lotobanca; arquivo existente preservado.")
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"tipo": "MATRIZ_CAIXA_LOTOBANCA", "fonte": SITE, "records": []}
    records = old.get("records", [])
    by_id = {r["modalidade"] + "|" + str(r["concurso"]) + "|" + str(r.get("sorteio", 1)): r for r in records if isinstance(r, dict) and r.get("modalidade") and r.get("concurso")}
    before = len(by_id)
    by_id.update(unique)
    output = {
        "tipo": "MATRIZ_CAIXA_LOTOBANCA",
        "fonte": SITE,
        "dataExportacao": datetime.now(timezone.utc).isoformat(),
        "records": sorted(by_id.values(), key=lambda r: (r.get("data", ""), r.get("horario", ""), int(r.get("concurso", 0))), reverse=True)
    }
    OUT.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("Firefox virtual: leitura Caixa válida confirmada.")
    print("Registros recebidos:", len(unique))
    print("Registros novos:", max(0, len(by_id) - before))
    print("Total no arquivo:", len(by_id))

if __name__ == "__main__":
    main()
