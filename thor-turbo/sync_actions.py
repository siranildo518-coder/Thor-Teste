#!/usr/bin/env python3
"""Importa resultados de uma fonte JSON autorizada. Nunca fabrica sorteios."""
import json, os, pathlib, urllib.request
path=pathlib.Path("thor-turbo/resultados.json")
url=os.environ.get("THOR_RESULTS_SOURCE_URL","").strip()
if not url:
    raise SystemExit("CONFIGURACAO PENDENTE: configure THOR_RESULTS_SOURCE_URL com endpoint JSON autorizado da Lotobanca. Nenhum resultado alterado.")
if not url.startswith("https://"):
    raise SystemExit("A fonte deve usar HTTPS.")
req=urllib.request.Request(url,headers={"Accept":"application/json","User-Agent":"ThorTurbo-Sync/1.0"})
with urllib.request.urlopen(req,timeout=25) as response:
    incoming=json.load(response)
if not isinstance(incoming,dict) or not isinstance(incoming.get("records"),list):
    raise SystemExit("Fonte nao retornou objeto JSON com records.")
old=json.loads(path.read_text(encoding="utf-8"))
sizes={"Lotomania Turbo":20,"Lotofácil Turbo":15,"Mega-Sena Turbo":6,"Quina Turbo":5,"Dia de Sorte Turbo":7,"Dupla Sena Turbo":6}
def valid(r):
    return isinstance(r,dict) and r.get("modalidade") in sizes and str(r.get("concurso","")).isdigit() and isinstance(r.get("dezenas"),list) and len(r["dezenas"])==sizes[r["modalidade"]] and all(isinstance(n,int) and 0<=n<=100 for n in r["dezenas"])
new=incoming["records"]
if not new or not all(valid(r) for r in new):
    raise SystemExit("Fonte vazia ou com concursos invalidos; arquivo preservado.")
def key(r): return (r["modalidade"],str(r["concurso"]),r.get("sorteio",1))
merged={key(r):r for r in old.get("records",[]) if valid(r)}
before=set(merged)
for r in new: merged[key(r)]=r
if set(merged)==before:
    print("Nenhum concurso novo.")
else:
    from datetime import datetime,timezone
    old["records"]=sorted(merged.values(),key=lambda r:(r["modalidade"],int(r["concurso"])),reverse=True)
    old["dataExportacao"]=datetime.now(timezone.utc).isoformat().replace("+00:00","Z")
    path.write_text(json.dumps(old,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Novos concursos: {len(set(merged)-before)}")
