"""Coleta separada dos resultados CAIXA publicados na Lotobanca."""
import json
import os
import re
import time
import unicodedata
from urllib.parse import urlparse
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from playwright.sync_api import sync_playwright

SITE = "https://turbo.lotobanca.com/loterias-alternativas/resultados-caixa"
ARQUIVO = Path("caixa/resultados.json")
JANELA_SEGUNDOS = 6 * 60
INTERVALO_SEGUNDOS = 20
TIPOS = {
    "lotofacil": ("Lotofácil", 15, 1, 25),
    "megasena": ("Mega-Sena", 6, 1, 60),
    "quina": ("Quina", 5, 1, 80),
    "lotomania": ("Lotomania", 20, 0, 99),
    "diadesorte": ("Dia de Sorte", 7, 1, 31),
    "duplasena": ("Dupla Sena", 6, 1, 50),
}
CAMPOS_NOME = ("lotteryName", "lotteryKey", "modalidade", "loteria", "nomeLoteria", "nome", "name", "title", "game", "lottery", "type")
CAMPOS_CONCURSO = ("concursoNumber", "displayNumber", "sorteioNumber", "concurso", "numeroConcurso", "numero", "contestNumber", "drawNumber", "contest")
CAMPOS_DEZENAS = ("resultNumbers", "listaDezenas", "winningNumbers", "dezenas", "numeros", "números", "numbers", "resultado", "result")
CAMPOS_DATA = ("scheduledAt", "dataSorteio", "dataApuracao", "data", "drawDate", "date")
CAMPOS_HORA = ("horario", "hora", "time", "drawTime")
IGNORAR = ("senha", "token", "auth", "session", "user", "cpf", "email", "telefone", "wallet", "saldo", "aposta", "bilhete")


def norm(value):
    raw = "".join(c for c in unicodedata.normalize("NFD", str(value or ""))
                  if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]", "", raw)


def primeiro(node, keys):
    for key in keys:
        value = node.get(key)
        if value not in (None, ""):
            return value
    return None


def modalidade(nome):
    texto = norm(nome)
    for key, (rotulo, *_resto) in TIPOS.items():
        if key in texto and "turbo" not in texto:
            return key, rotulo
    return None, None


def dezenas_lista(value):
    if isinstance(value, str):
        if not re.fullmatch(r"[0-9\s,;|.\-]+", value):
            return None
        value = re.findall(r"\d{1,3}", value)
    if not isinstance(value, list):
        return None
    try:
        return [int(str(item).strip()) for item in value]
    except (ValueError, TypeError):
        return None


def data_hora(value, hora_value=None):
    if not value:
        return "", str(hora_value or "")[:5]
    raw = str(value).strip()
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(ZoneInfo("America/Sao_Paulo"))
        return parsed.strftime("%Y-%m-%d"), (str(hora_value or parsed.strftime("%H:%M"))[:5])
    except (ValueError, TypeError, OverflowError):
        pass
    for fmt in ("%d/%m/%Y %H:%M", "%d/%m/%Y", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(raw, fmt)
            default_time = parsed.strftime("%H:%M") if "%H" in fmt else ""
            return parsed.strftime("%Y-%m-%d"), str(hora_value or default_time)[:5]
        except ValueError:
            continue
    return raw[:10], str(hora_value or "")[:5]


def extrair(payload):
    encontrados = {}
    visitados = set()

    def walk(node, depth=0):
        if depth > 20 or not isinstance(node, (dict, list)) or id(node) in visitados:
            return
        visitados.add(id(node))
        if isinstance(node, list):
            for item in node[:5000]:
                walk(item, depth + 1)
            return

        tipo, rotulo = next((m for m in (modalidade(node.get(k)) for k in CAMPOS_NOME) if m[0]), (None, None))
        if tipo:
            numero = str(primeiro(node, CAMPOS_CONCURSO) or "").strip()
            raw_nums = primeiro(node, CAMPOS_DEZENAS)
            nums = dezenas_lista(raw_nums)
            total, minimo, maximo = TIPOS[tipo][1:]
            if numero.isdigit() and nums and len(nums) == total and len(set(nums)) == total and all(minimo <= n <= maximo for n in nums):
                data, hora = data_hora(primeiro(node, CAMPOS_DATA), primeiro(node, CAMPOS_HORA))
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data):
                    return
                sorteio = str(node.get("sorteio") or "1")
                registro = {
                    "modalidade": rotulo,
                    "concurso": numero,
                    "data": data,
                    "horario": hora,
                    "dezenas": nums,
                }
                if tipo == "duplasena":
                    registro["sorteio"] = sorteio
                if isinstance(node.get("scheduledAt"), str):
                    registro["scheduledAt"] = node["scheduledAt"]
                encontrados[(tipo, numero, sorteio)] = registro
                if tipo == "duplasena":
                    second = dezenas_lista(node.get("resultNumbers2") or node.get("listaDezenasSegundoSorteio"))
                    if second and len(second) == total and len(set(second)) == total and all(minimo <= n <= maximo for n in second):
                        encontrados[(tipo, numero, "2")] = {**registro, "sorteio": 2, "dezenas": second}

        for key, value in node.items():
            if not any(bad in str(key).lower() for bad in IGNORAR):
                walk(value, depth + 1)

    walk(payload)
    return list(encontrados.values())


def chave(row):
    return (norm(row.get("modalidade")), str(row.get("concurso", "")), str(row.get("sorteio", "1")))


def gravar(payloads):
    novos = {}
    for payload in payloads:
        for row in extrair(payload):
            novos[chave(row)] = row
    if not novos:
        return 0

    ARQUIVO.parent.mkdir(parents=True, exist_ok=True)
    if ARQUIVO.exists():
        atual = json.loads(ARQUIVO.read_text(encoding="utf-8"))
        if atual.get("tipo") != "MATRIZ_CAIXA_LOTOBANCA" or not isinstance(atual.get("records"), list):
            raise ValueError("Formato da fonte Caixa nao reconhecido; arquivo preservado.")
    else:
        atual = {"tipo": "MATRIZ_CAIXA_LOTOBANCA", "fonte": SITE, "records": []}

    unidos = {chave(row): row for row in atual["records"] if isinstance(row, dict)}
    adicionados = 0
    alterados = False
    for key, row in novos.items():
        if key not in unidos:
            unidos[key] = row
            adicionados += 1
            alterados = True
        elif unidos[key] != row:
            unidos[key] = row
            alterados = True

    records = sorted(unidos.values(), key=lambda row: (
        str(row.get("data", "")), int(row.get("concurso", 0) or 0), str(row.get("modalidade", "")), int(row.get("sorteio", 1) or 1)
    ), reverse=True)
    # Manter historico amplo em uma fonte enxuta para o aplicativo futuro.
    # Preservar todos os registros existentes.
    if alterados or not ARQUIVO.exists():
        atual["tipo"] = "MATRIZ_CAIXA_LOTOBANCA"
        atual["fonte"] = SITE
        atual["dataExportacao"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
        atual["records"] = records
        ARQUIVO.write_text(json.dumps(atual, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    return adicionados


def main():
    respostas = []
    erros_rede = []
    campos = set()
    capturados = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720}, locale="pt-BR")
        page = context.new_page()

        def capturar(response):
            try:
                parsed = urlparse(response.url)
                host = parsed.hostname or ""
                if not (host == "lotobanca.com" or host.endswith(".lotobanca.com") or "/V3-sorteios-caixa-listar-sorteios" in parsed.path):
                    return
                if "caixa" not in parsed.path.lower():
                    return
                if response.request.resource_type not in ("xhr", "fetch"):
                    return
                if response.status != 200 or "json" not in response.headers.get("content-type", "").lower():
                    return
                payload = response.json()
                if isinstance(payload, (dict, list)):
                    respostas.append(payload)
                    for row in extrair(payload):
                        capturados.add(chave(row))
                    def scan(v, depth=0):
                        if depth > 10: return
                        if isinstance(v, dict):
                            for k, child in v.items():
                                if re.search(r"lotter|concurso|sorteio|result|number|dezena|scheduled|draw|date", k, re.I) and not re.search(r"user|token|auth|senha|account", k, re.I): campos.add(k)
                                if not any(bad in k.lower() for bad in IGNORAR): scan(child, depth+1)
                        elif isinstance(v, list):
                            for child in v[:100]: scan(child, depth+1)
                    scan(payload)
            except Exception:
                return

        page.on("response", capturar)
        page.on("requestfailed", lambda request: erros_rede.append(request.resource_type))
        page.goto(SITE, wait_until="domcontentloaded", timeout=45000)

        login = os.getenv("LOTOBANCA_LOGIN", "").strip()
        senha = os.getenv("LOTOBANCA_SENHA", "")
        if login and senha:
            # Mesmo acesso Chromium já usado pelo coletor da Matriz Turbo.
            try:
                page.wait_for_timeout(2500)
                page.mouse.click(970, 306)
                page.keyboard.insert_text(login)
                page.mouse.click(970, 395)
                page.keyboard.insert_text(senha)
                page.mouse.click(980, 500)
                page.wait_for_timeout(7000)
                page.goto(SITE, wait_until="domcontentloaded", timeout=30000)
            except Exception:
                pass

        inicio = time.monotonic()
        novos = 0
        while time.monotonic() - inicio < JANELA_SEGUNDOS:
            page.wait_for_timeout(INTERVALO_SEGUNDOS * 1000)
            novos = gravar(respostas)
            if novos:
                break
            try:
                page.reload(wait_until="domcontentloaded", timeout=30000)
            except Exception:
                pass

        print("Fonte consultada: Lotobanca / resultados Caixa")
        print("Respostas JSON da página:", len(respostas))
        print("Novos concursos Caixa gravados:", novos)
        print("Registros Caixa válidos reconhecidos:", len(capturados))
        print("Campos de formato Caixa:", sorted(campos))
        if not respostas:
            print("Não houve resposta JSON de resultados na página.")
        context.close()
        browser.close()

    if not capturados:
        raise SystemExit("Nenhum registro Caixa reconhecido; histórico preservado.")
    if not ARQUIVO.exists() or not json.loads(ARQUIVO.read_text(encoding="utf-8")).get("records"):
        raise SystemExit("A página da Lotobanca não forneceu concursos Caixa válidos; arquivo separado preservado.")
    print("Arquivo separado atualizado:", ARQUIVO.as_posix())


if __name__ == "__main__":
    main()
