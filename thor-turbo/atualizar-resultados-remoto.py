"""Extracao conservadora de sorteios da API, sem armazenar dados de sessao."""
import json
import re
import unicodedata
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from pathlib import Path

ARQUIVO = Path("thor-turbo/resultados.json")
MODALIDADES = {
    "Lotomania Turbo": (20, 0, 100),
    "Lotofácil Turbo": (15, 1, 25),
    "Mega-Sena Turbo": (6, 1, 60),
    "Quina Turbo": (5, 1, 80),
    "Dia de Sorte Turbo": (7, 1, 31),
    "Dupla Sena Turbo": (6, 1, 50),
}

def norm(v):
    return "".join(c for c in unicodedata.normalize("NFD", str(v or ""))
                   if unicodedata.category(c) != "Mn").lower()

def extrair(payload):
    saida = {}
    visitados = set()
    def walk(node, depth=0):
        if depth > 18 or not isinstance(node, (list, dict)) or id(node) in visitados:
            return
        visitados.add(id(node))
        if isinstance(node, list):
            for x in node[:3000]:
                walk(x, depth+1)
            return
        nome_bruto = norm(node.get("lotteryName") or node.get("lotteryKey"))
        aliases = {
            "lototurbo_lotomania": "Lotomania Turbo",
            "lototurbo_lotofacil": "Lotofácil Turbo",
            "lototurbo_megasena": "Mega-Sena Turbo",
            "lototurbo_quina": "Quina Turbo",
            "lototurbo_diadesorte": "Dia de Sorte Turbo",
            "lototurbo_duplasena": "Dupla Sena Turbo",
        }
        nome = aliases.get(nome_bruto) or next((n for n in MODALIDADES if norm(n) in nome_bruto), None)
        if nome:
            qtd, minimo, maximo = MODALIDADES[nome]
            numero = str(node.get("sorteioNumber") or "")
            agendado = node.get("scheduledAt")
            grupos = [(1, node.get("resultNumbers"))]
            if nome == "Dupla Sena Turbo":
                grupos.append((2, node.get("resultNumbers2")))
            for indice, dezenas in grupos:
                if isinstance(dezenas, str) and re.fullmatch(r"[0-9\\s,;|.\\-]+", dezenas):
                    dezenas = re.findall(r"\\d{1,3}", dezenas)
                if not (isinstance(dezenas, list) and len(dezenas) == qtd
                        and numero.isdigit() and isinstance(agendado, str)):
                    continue
                try:
                    nums = [int(x) for x in dezenas]
                    dt = datetime.fromisoformat(agendado.replace("Z", "+00:00"))
                    if dt.tzinfo is None:
                        raise ValueError("data sem timezone")
                    if (len(set(nums)) == qtd and all(minimo <= x <= maximo for x in nums)
                            and all(str(x).strip().isdigit() for x in dezenas)):
                        local = dt.astimezone(ZoneInfo("America/Sao_Paulo"))
                        registro = {
                            "modalidade": nome, "concurso": numero,
                            "data": local.strftime("%Y-%m-%d"),
                            "horario": local.strftime("%H:%M"),
                            "dezenas": nums,
                            "scheduledAt": agendado,
                        }
                        if indice == 2:
                            registro["sorteio"] = 2
                        chave = (nome, numero, agendado, indice)
                        saida[chave] = registro
                except (TypeError, ValueError, OverflowError):
                    pass
        for k, v in node.items():
            if not any(t in k.lower() for t in ("senha", "token", "auth", "session", "user", "cpf", "email", "telefone", "wallet", "saldo")):
                walk(v, depth+1)
    walk(payload)
    return list(saida.values())

def chave(r):
    return (str(r.get("modalidade", "")), str(r.get("concurso", "")),
            str(r.get("scheduledAt", "")), int(r.get("sorteio", 1)))

def atualizar(payloads):
    novos = {}
    for payload in payloads:
        for r in extrair(payload):
            novos[chave(r)] = r
    if not novos:
        print("Atualizacao: ignorada - nenhum concurso valido")
        return False
    atual = json.loads(ARQUIVO.read_text(encoding="utf-8"))
    if atual.get("tipo") != "THOR_MATRIZ_85" or not isinstance(atual.get("records"), list):
        raise ValueError("Formato existente nao reconhecido; arquivo preservado")
    anteriores = atual["records"]
    unidos = {chave(r): r for r in anteriores}
    acrescentados = 0
    for k, v in novos.items():
        if k not in unidos:
            unidos[k] = v
            acrescentados += 1
    if not acrescentados:
        print("Atualizacao: sem novos concursos; historico preservado")
        return False
    atual["records"] = sorted(unidos.values(), key=lambda r: (str(r.get("scheduledAt", "")), str(r.get("modalidade", "")), int(r.get("sorteio", 1))), reverse=True)
    atual["dataExportacao"] = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    ARQUIVO.write_text(json.dumps(atual, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("Atualizacao: novos concursos adicionados:", acrescentados)
    print("Historico total:", len(atual["records"]))
    return True
