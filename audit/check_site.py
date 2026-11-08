"""Dependency-free source checks. Run from the repository root."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import json

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index', 'about', 'services', 'bridal', 'courses', 'gallery', 'contact', '404']

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.headings, self.issues = [], [], [], []
        self.feed(text)
    def handle_starttag(self, tag, pairs):
        a = dict(pairs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'img' and 'alt' not in a: self.issues.append('Missing alt')
        if len(tag) == 2 and tag[0] == 'h' and tag[1].isdigit(): self.headings.append(int(tag[1]))
        for key in ['href', 'src', 'data-full']:
            if a.get(key): self.refs.append(a[key])
        for key in ['srcset', 'imagesrcset']:
            for candidate in a.get(key, '').split(','):
                if candidate.strip(): self.refs.append(candidate.strip().split()[0])

docs = {p + '.html': Document((ROOT / (p + '.html')).read_text(encoding='utf-8')) for p in PAGES}
result = {}
for name, doc in docs.items():
    issues = list(doc.issues)
    issues += ['Duplicate ID: ' + k for k,v in Counter(doc.ids).items() if v > 1]
    if doc.headings.count(1) != 1: issues.append('Expected exactly one h1')
    for before, after in zip(doc.headings, doc.headings[1:]):
        if after > before + 1: issues.append(f'Heading jump h{before} -> h{after}')
    for ref in doc.refs:
        u = urlsplit(ref)
        if u.scheme == 'tel':
            if ref != 'tel:+919523262455': issues.append('Unexpected telephone: ' + ref)
        elif u.netloc == 'wa.me':
            if u.scheme != 'https' or u.path != '/919523262455': issues.append('Unexpected WhatsApp: ' + ref)
        elif not u.scheme and not u.netloc:
            path = unquote(u.path).lstrip('/') or name
            if not (ROOT / path).is_file(): issues.append('Missing file: ' + ref)
            elif u.fragment and path in docs and unquote(u.fragment) not in docs[path].ids:
                issues.append('Missing anchor: ' + ref)
    result[name] = {'reference_count': len(doc.refs), 'issues': sorted(set(issues))}
print(json.dumps(result, indent=2))
(ROOT / 'audit/source-results.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
