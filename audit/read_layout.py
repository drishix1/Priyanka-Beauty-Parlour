from pathlib import Path
from html import unescape
import re, json
root = Path(__file__).resolve().parent
text = (root / 'layout-dom.html').read_text(encoding='utf-8')
match = re.search(r'<pre id="results">(.*?)</pre>', text, re.S)
rows = json.loads(unescape(match[1]))
(root / 'layout-results.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print('Completed measurements:', len(rows))
for r in rows:
    print(r['page'], r['width'], 'scroll:', r['scrollWidth'], 'outside:', len(r['outside']), 'clipped:', len(r['clipped']), 'small text:', len(r['smallText']), 'small targets:',len(r['smallTargets']))
    if r['outside'] or r['clipped'] or r['smallText']: print(json.dumps({k:r[k] for k in ['outside','clipped','smallText']}))
print('Target samples:', json.dumps(rows[0]['smallTargets']))
