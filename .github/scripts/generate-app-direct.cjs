const fs = require('fs');

const appPath = 'app-main.html';
const corePath = 'index-core-thor7.html';
const indexPath = 'index.html';
const outPath = 'app-direct.html';

let html = fs.readFileSync(appPath, 'utf8');
const core = fs.readFileSync(corePath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');

const marker = '.then(function(html){';
const start = core.indexOf(marker);
const end = core.lastIndexOf('document.open();document.write(html);document.close()');
if (start < 0 || end < 0) throw new Error('Transformação do index-core não encontrada');

const body = core.slice(start + marker.length, end);
const transform = new Function('html', body + '; return html;');
html = transform(html);

// Evita troca visual escuro -> roxo antes do login/home.
html = html.replace(
  '<style id="thorBootEscuroApp">html,body{background:#07101f!important}body{background:#07101f!important}#overlayListaResultados{background:#07101f!important}</style>',
  '<style id="thorBootEscuroApp">#overlayListaResultados{background:#07101f!important}</style>'
);
html = html.replace(
  '<style id="thorInicioSemFlash">html,body{background:#07101f!important}#overlayListaResultados{visibility:hidden!important;background:#07101f!important}',
  '<style id="thorInicioSemFlash">#overlayListaResultados{visibility:hidden!important;background:#07101f!important}'
);

// Reaproveita automaticamente os scripts extras que o index injeta no modo antigo.
const extras = [];
const re = /<script src=\\\"([^"]+)\\\"><\\\\\/script>/g;
let m;
while ((m = re.exec(index))) {
  const src = m[1].replace(/\\\\/g, '');
  if (!extras.includes(src)) extras.push(src);
}
if (extras.length && !html.includes('frequencia-concorrencia-thor7.js')) {
  const tags = extras.map(src => '<script src="' + src + '"></script>').join('');
  html = html.replace('</body>', tags + '</body>');
}

fs.writeFileSync(outPath, html);
console.log('app-direct.html gerado:', html.length, 'bytes; scripts extras:', extras.length);
