"""Local audit server: no cached assets; capture page errors before site scripts."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import os
os.chdir(Path(__file__).resolve().parents[1])
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        path = urlsplit(self.path).path.lstrip('/')
        if path in [p.name for p in Path('.').glob('*.html')]:
            source = Path(path).read_text(encoding='utf-8')
            capture = '''<script>window.auditErrors=[];window.addEventListener('error',e=>{if(e.message)window.auditErrors.push(e.message)});window.addEventListener('unhandledrejection',e=>window.auditErrors.push(String(e.reason)));const auditError=console.error;console.error=(...args)=>{window.auditErrors.push(args.join(' '));auditError.apply(console,args)};</script>'''
            payload = source.replace('<head>', '<head>'+capture, 1).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type','text/html; charset=utf-8')
            self.send_header('Content-Length',str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            self.headers.__delitem__('If-Modified-Since')
            super().do_GET()
    def log_message(self, *args): pass
ThreadingHTTPServer(('127.0.0.1',8766), Handler).serve_forever()
