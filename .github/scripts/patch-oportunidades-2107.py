from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace("const APP_VERSAO_ATUAL = '2026-09-11-2054';", "const APP_VERSAO_ATUAL = '2026-09-11-2107';")

marker = '''  out.innerHTML = `
    <div style="background:#fff;border:1.5px solid #E7DFF5;border-radius:13px;padding:8px 10px;margin-bottom:8px;">'''

insert = '''  const oportunidadesHtml = conferindo
    ? (FAIXAS_PREMIACAO_GERADOR[g.code] || []).map(f=>{
        const qtd = distribuicaoAcertos.get(f.h) || 0;
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 7px;border-bottom:1px solid #F0EAF7;"><span style="font-family:'Baloo 2',sans-serif;font-size:11px;font-weight:700;color:#4B5563;">${f.label}</span><span style="font-family:'Baloo 2',sans-serif;font-size:11px;font-weight:800;color:${qtd ? '#1F9D74' : '#8B7C9E'};">${qtd} cart${qtd===1?'ão':'ões'} premiado${qtd===1?'':'s'}</span></div>`;
      }).join('')
    : '';

'''

if 'const oportunidadesHtml = conferindo' not in s:
    if marker not in s:
        raise SystemExit('marcador out.innerHTML nao encontrado')
    s = s.replace(marker, insert + marker, 1)

old = '''      ${resumoPremiacaoGerador(g.code)}
    </div>'''
new = '''      ${resumoPremiacaoGerador(g.code)}
      ${conferindo ? `<div style="margin-top:7px;border:1px solid #EFE7F7;border-radius:10px;overflow:hidden;background:#FCFAFF;"><div style="padding:5px 7px;background:#F6F0FC;font-family:'Baloo 2',sans-serif;font-size:11px;font-weight:800;color:#7E22CE;">🏆 Oportunidades de premiação</div>${oportunidadesHtml}</div>` : ''}
    </div>'''

if '🏆 Oportunidades de premiação' not in s:
    if old not in s:
        raise SystemExit('marcador resumo nao encontrado')
    s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')

sw = Path('sw.js')
t = sw.read_text(encoding='utf-8')
t = re.sub(r"const CACHE_NAME = 'thor-loterias-[^']+';", "const CACHE_NAME = 'thor-loterias-2026-09-11-2107';", t, count=1)
sw.write_text(t, encoding='utf-8')

# trigger 2107
