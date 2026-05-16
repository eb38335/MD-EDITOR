export function printContent(html: string, title: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups to print.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.75;
      color: #111;
      max-width: 800px;
      margin: 2cm auto;
      padding: 0 1cm;
    }
    h1 { font-size: 2em; margin: 1em 0 .4em; border-bottom: 2px solid #ccc; padding-bottom: .2em; }
    h2 { font-size: 1.5em; margin: 1em 0 .4em; border-bottom: 1px solid #ccc; padding-bottom: .2em; }
    h3, h4, h5, h6 { margin: .8em 0 .3em; }
    a { color: #1a56db; }
    code { font-family: 'Courier New', monospace; font-size: .9em; background: #f3f4f6; padding: .1em .3em; border-radius: 3px; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 6px; overflow-x: auto; font-size: .85em; }
    pre code { background: none; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #6366f1; margin: 1em 0; padding: .5em 1em; background: #f5f3ff; color: #444; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: .9em; }
    th { background: #f9fafb; font-weight: bold; text-align: left; padding: .4em .6em; border: 1px solid #d1d5db; }
    td { padding: .4em .6em; border: 1px solid #d1d5db; }
    tr:nth-child(even) td { background: #f9fafb; }
    img { max-width: 100%; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
    ul { list-style: disc; padding-left: 1.5em; }
    ol { list-style: decimal; padding-left: 1.5em; }
    input[type="checkbox"] { margin-right: .4em; }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
