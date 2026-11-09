"""Atualiza a base Matriz 8.5 com sorteios conferidos pela Lotobanca."""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import HTTPRedirectHandler, Request, build_opener
from zoneinfo import ZoneInfo

BASE = Path(__file__).with_name("resultados.json")
MODOS = {
    "megasena": ("Mega-Sena Turbo", 6, 60),
    "quina": ("Quina Turbo", 5, 80),
    "lotofacil": ("Lotofácil Turbo", 15, 25),
    "lotomania": ("Lotomania Turbo", 20, 100),
    "diadesorte": ("Dia de Sorte Turbo", 7, 31),
    "duplasena": ("Dupla Sena Turbo", 6, 50),
}


class Direto(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def validar(bolas, quantidade, maximo, minimo=1):
    if not isinstance(bolas, list) or len(bolas) != quantidade:
        raise ValueError("Quantidade de dezenas inesperada")
    if not all(re.fullmatch(r"[0-9]{1,3}", str(n)) for n in bolas):
        raise ValueError("Dezena inválida")
    numeros = list(map(int, bolas))
    if len(set(numeros)) != quantidade or not all(minimo <= n <= maximo for n in numeros):
        raise ValueError("Dezenas repetidas ou fora da faixa")
    return numeros


def chave(row):
    return row["modalidade"], str(row["concurso"]), int(row.get("sorteio", 1))


def main():
    headers = {"X-Parse-Application-Id": "ZYSP5Z9DjE2YdSuWEQeMwhqw2JcErt",
               "X-Parse-Client-Key": "HeQgDhK5dCTuLDsuU5ExaCkt2546wE",
               "X-Parse-Revocable-Session": "1", "Content-Type": "application/json"}
    opener = build_opener(Direto())

    def post(rota, dados):
        req = Request("https://api.lotobanca.com/parse/" + rota,
                      json.dumps(dados).encode(), headers)
        with opener.open(req, timeout=25) as resposta:
            return json.load(resposta)

    user = os.environ["LB_USER"].strip()
    if re.fullmatch(r"[\d. -]+", user):
        user = re.sub(r"\D", "", user)
    login = post("login", {"username": user, "password": os.environ["LB_PASS"]})
    headers["X-Parse-Session-Token"] = login["sessionToken"]
    headers["Content-Type"] = "text/plain; charset=utf-8"
    base = json.loads(BASE.read_text(encoding="utf-8"))
    registros = base["records"]
    posicoes = {chave(row): i for i, row in enumerate(registros)}
    novos = 0
    for slug, (nome, qtd, maximo) in MODOS.items():
        codigo = "lototurbo_" + slug
        pagina = 0
        vistos = set()
        while True:
            dados = post("functions/loto-turbo-listar-sorteios",
                         {"lotteryKey": codigo, "status": "CONFERIDO", "isVisible": True,
                          "limit": 50, "skip": pagina})
            sorteios = dados["result"]["sorteios"]
            if not isinstance(sorteios, list) or (pagina == 0 and not sorteios):
                raise ValueError("Sem resultados para " + nome)
            encontrou_base = False
            for s in sorteios:
                if s["lotteryKey"] != codigo or s["status"] != "CONFERIDO":
                    raise ValueError("Filtro inesperado para " + nome)
                concurso = str(s["sorteioNumber"])
                if not concurso.isdigit() or concurso in vistos:
                    raise ValueError("Concurso inválido ou página repetida")
                vistos.add(concurso)
                data = datetime.fromisoformat(s["scheduledAt"].replace("Z", "+00:00"))
                if data.tzinfo is None:
                    raise ValueError("Horário sem fuso")
                local = data.astimezone(ZoneInfo("America/Sao_Paulo"))
                grupos = [s["resultNumbers"]]
                if slug == "duplasena":
                    grupos.append(s["resultNumbers2"])
                for indice, bolas in enumerate(grupos, 1):
                    row = dict(modalidade=nome, concurso=concurso, data=local.strftime("%Y-%m-%d"),
                               horario=local.strftime("%H:%M"), scheduledAt=s["scheduledAt"],
                               dezenas=validar(bolas, qtd, maximo, 0 if slug == "lotomania" else 1))
                    if indice == 2:
                        row["sorteio"] = indice
                    key = chave(row)
                    if key in posicoes:
                        encontrou_base = True
                        registros[posicoes[key]].update(row)
                    else:
                        posicoes[key] = len(registros)
                        registros.append(row)
                        novos += 1
            pagina += len(sorteios)
            if encontrou_base or len(sorteios) < 50:
                break
        print(nome, "· concurso", max(map(int, vistos)))
    antigo = json.loads(BASE.read_text(encoding="utf-8"))
    if antigo["records"] != registros:
        registros.sort(key=lambda r: (r["modalidade"], -int(r["concurso"]), int(r.get("sorteio", 1))))
        base["dataExportacao"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        BASE.write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Novos registros:", novos)


if __name__ == "__main__":
    main()
