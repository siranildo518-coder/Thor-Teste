"""Coletor Caixa Lotobanca executado no Firefox virtual do GitHub Actions."""
import json
import os
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loterias-alternativas/resultados-caixa"
OUT = Path("caixa/resultados.json")
SIZES = {"lotofacil": 15, "megasena": 6, "quina": 5, "lotomania": 20, "diadesorte": 7, "duplasena": 6}
LIMITS = {"lotofacil": 25, "megasena": 60, "quina": 80, "lotomania": 100, "diadesorte": 31, "duplasena": 50}
LABELS = {"lotofacil": "Lotofácil", "megasena": "Mega-Sena", "quina": "Quina", "lotomania": "Lotomania", "diadesorte": "Dia de Sorte", "duplasena": "Dupla Sena"}
NAME_FIELDS = ("lotteryName", "lotteryKey", "modalidade", "loteria", "nomeLoteria", "nome", "name", "game", "lottery", "type")
NUMBER_FIELDS = ("resultNumbers", "listaDezenas", "dezenasSorteadasOrdemSorteio", "dezenasSorteadas", "dezenas", "numeros", "numbers", "resultado", "winningNumbers", "numbersDrawn", "balls", "result")
DRAW_FIELDS = ("sorteioNumber", "numeroConcurso", "numero", "concurso", "contestNumber", "drawNumber", "draw", "numeroSorteio", "numConcurso", "number")
DATE_FIELDS = ("scheduledAt", "dataApuracao", "dataSorteio", "data", "drawDate", "date", "dataResultado", "dataConcurso", "dateTime", "createdAt")

def norm(value):
    return "".join(c for c in unicodedata.normalize("NFD", str(value or "")) if unicodedata.category(c) != "Mn").lower()

def game_name(item):
    values = [norm(item.get(k)) for k in NAME_FIELDS if item.get(k) is not None]
    for key, label in LABELS.items():
        if any(key in value and "turbo" not in value for value in values):
            return label
    return None

def game_key(name):
    normalized = norm(name).replace(" ", "").replace("-", "")
    return next((key for key, label in LABELS.items() if norm(label).replace(" ", "").replace("-", "") == normalized), None)

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
        local = d.astimezone(ZoneInfo("America/Sao_Paulo"))
        return local.strftime("%Y-%m-%d"), local.strftime("%H:%M")
    except Exception:
        return "", ""

def parse_numbers(value, name):
    key = game_key(name)
    if not key:
        return None
    expected = SIZES[key]
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
    low = 0 if key == "lotomania" else 1
    if len(set(nums)) != expected or any(n < low or n > LIMITS[key] for n in nums):
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
            for child in node[:5000]:
                walk(child, depth + 1)
            return
        name = game_name(node)
        draw = next((str(node.get(k)) for k in DRAW_FIELDS if node.get(k) is not None), "")
        raw_nums = next((node.get(k) for k in NUMBER_FIELDS if node.get(k) is not None), None)
        raw_date = next((node.get(k) for k in DATE_FIELDS if node.get(k) is not None), None)
        if name and draw.isdigit():
            nums = parse_numbers(raw_nums, name)
            date, hour = parse_date(raw_date)
            if nums and date:
                row = {"modalidade": name, "concurso": draw, "data": date, "horario": hour, "dezenas": nums}
                if raw_date:
                    row["scheduledAt"] = raw_date if isinstance(raw_date, str) else date + ("T" + hour if hour else "")
                identity = name + "|" + draw
                found[identity] = row
                second_raw = node.get("resultNumbers2") or node.get("listaDezenasSegundoSorteio")
                second = parse_numbers(second_raw, name) if name == "Dupla Sena" and second_raw else None
                if second:
                    found[identity + "|2"] = {**row, "sorteio": 2, "dezenas": second}
        for key, child in node.items():
            if re.search(r"senha|token|auth|session|user|cpf|email|telefone|wallet|saldo", key, re.I):
                continue
            if isinstance(child, (dict, list)):
                walk(child, depth + 1)
    walk(payload)
    return found

def identity(row):
    return row.get("modalidade", "") + "|" + str(row.get("concurso", "")) + "|" + str(row.get("sorteio", 1))

def schema_field_names(payload):
    """Retorna apenas nomes de campos de formato, nunca valores da resposta."""
    allow = re.compile(r"(lotter|loteria|modal|game|result|contest|concurso|sorteio|draw|number|numero|dezena|data|date|time|hora|scheduled|items|records|list|period|apur)", re.I)
    block = re.compile(r"(user|cpf|email|phone|telefone|token|auth|session|wallet|saldo|senha|balance|account)", re.I)
    names = set()
    seen = set()
    def walk(node, depth=0):
        if depth > 8 or not isinstance(node, (dict, list)) or id(node) in seen:
            return
        seen.add(id(node))
        if isinstance(node, dict):
            for key, value in node.items():
                key = str(key)
                if allow.search(key) and not block.search(key):
                    names.add(key)
                if isinstance(value, (dict, list)):
                    walk(value, depth + 1)
        else:
            for value in node[:1000]:
                if isinstance(value, (dict, list)):
                    walk(value, depth + 1)
    walk(payload)
    return names

def main():
    login = os.getenv("LOTOBANCA_LOGIN", "").strip()
    senha = os.getenv("LOTOBANCA_SENHA", "")
    if not login or not senha:
        raise SystemExit("Credenciais Lotobanca ausentes nos secrets do GitHub Actions; nenhuma consulta foi feita.")
    captured = {}
    json_responses = 0
    expected_fields = set()\n    all_schema_fields = set()
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        page = browser.new_page(locale="pt-BR", timezone_id="America/Sao_Paulo", viewport={"width":1280,"height":720})
        def response_seen(response):
            nonlocal json_responses
            host = urlparse(response.url).hostname or ""
            if host not in ("turbo.lotobanca.com", "api.lotobanca.com") or response.request.resource_type not in ("fetch", "xhr"):
                return
            if "json" not in (response.headers.get("content-type") or "").lower():
                return
            json_responses += 1
            try:
                payload = response.json()
                if isinstance(payload, dict):
                    expected_fields.update(k for k in payload if k in set(NAME_FIELDS + NUMBER_FIELDS + DRAW_FIELDS + DATE_FIELDS + ("result", "results", "data", "items", "sorteios")))
                rows = extract(payload)
                captured.update(rows)
            except Exception:
                pass
        page.on("response", response_seen)
        page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(5000)
        # Replica o login usado pelo Firefox virtual da Matriz Turbo; nunca imprime os valores.
        page.mouse.click(970, 306)
        page.keyboard.insert_text(login)
        page.mouse.click(970, 395)
        page.keyboard.insert_text(senha)
        page.mouse.click(980, 500)
        page.wait_for_timeout(8000)
        # Reabre a página de resultados com a sessão recém-autenticada e recolhe
        # todas as respostas JSON que a própria página solicitar.
        page.goto(SITE, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(10000)
        page.reload(wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(10000)
        browser.close()
    print("Firefox virtual: respostas JSON de resultados:", json_responses)
    print("Campos de resultado reconhecidos:", sorted(expected_fields))\n    print("Campos de histórico observados:", sorted(all_schema_fields)[:100])
    print("Registros Caixa válidos capturados:", len(captured))
    if not captured:
        raise SystemExit("Sem registros Caixa válidos. Arquivo anterior preservado.")
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"tipo":"MATRIZ_CAIXA_LOTOBANCA","fonte":SITE,"records":[]}
    previous = {identity(r): r for r in old.get("records", []) if isinstance(r, dict) and r.get("modalidade") and r.get("concurso")}
    merged = dict(previous)
    changed = 0
    for key, row in captured.items():
        row_id = identity(row)
        if merged.get(row_id) != row:
            changed += 1
            merged[row_id] = row
    print("Concursos anteriores preservados:", len(previous))
    print("Registros novos ou corrigidos:", changed)
    if not changed:
        print("Nenhuma alteração no arquivo; resultados já estavam atualizados.")
        return
    output = {
        "tipo":"MATRIZ_CAIXA_LOTOBANCA",
        "fonte":SITE,
        "dataExportacao":datetime.now(timezone.utc).isoformat(),
        "records":sorted(merged.values(), key=lambda r:(r.get("data",""),r.get("horario",""),int(r.get("concurso",0))), reverse=True)
    }
    OUT.write_text(json.dumps(output, ensure_ascii=False, separators=(",",":")) + "\n", encoding="utf-8")
    print("Total salvo na matriz Caixa:", len(merged))
    print("Modalidades salvas:", ", ".join(sorted({r["modalidade"] for r in merged.values()})))

if __name__ == "__main__":
    main()
