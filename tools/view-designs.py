#!/usr/bin/env python3
"""View the Claude Design export in a browser on this machine — a utility for SESSIONS, not the owner.

    python3 tools/view-designs.py            # serve the export and open the design index
    python3 tools/view-designs.py S4         # open a specific frame (prefix match on the filename)
    python3 tools/view-designs.py --list     # print every frame with its number, and exit

WHY A SERVER AND NOT A DOUBLE-CLICK. Every `.dc.html` frame is self-contained HTML and renders
its static picture from a plain file open. But the export's runtime (`support.js`) loads React
over `fetch`, which browsers block on `file://` — so the two Index canvases' links and the mock
interactions only work over HTTP. One command, no install: this uses Python's own web server.

AND WHAT THIS IS NOT — the owner was explicit. Ruling R-75 (2026-09-02) is about him seeing
INFLOZO'S OWN UI as static pages before dynamic build, and he REJECTED the frame-viewer reading of
it in the same breath: "I do not want to view the exported frames. I want to see the Inflozo UI in
local." His deliverable is step 5b's prototype (see `build-sequence.md`), which needs no server at
all. This tool exists so that a SESSION doing design work can eyeball a frame over HTTP. Do not
offer it to him as the answer to R-75.
"""
import os
import sys
import socket
import threading
import webbrowser
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):  # ponytail: no per-request noise in the owner's terminal
        pass


def frames():
    return sorted(f for f in os.listdir(EXPORT) if f.endswith('.dc.html'))


def pick(arg):
    """Prefix match on the filename, case-insensitive; 'S4' finds 'S4 Editor.dc.html'."""
    a = arg.lower()
    hits = [f for f in frames() if f.lower().startswith(a)]
    exact = [f for f in hits if f.lower().startswith(a + ' ') or f.lower() == a + '.dc.html']
    return (exact or hits)


def main():
    if not os.path.isdir(EXPORT):
        print(f'no export at {EXPORT}')
        return 1

    args = [a for a in sys.argv[1:] if a != '--list']
    if '--list' in sys.argv:
        for f in frames():
            print(f'  {f[:-8]}')
        print(f'\n  {len(frames())} frames. Open one with: python3 tools/view-designs.py <name>')
        return 0

    start = 'Index.dc.html'
    if args:
        hits = pick(args[0])
        if not hits:
            print(f'no frame starts with "{args[0]}" — run with --list to see every name')
            return 1
        if len(hits) > 1 and not hits[0].lower().startswith(args[0].lower() + ' '):
            print(f'"{args[0]}" matches {len(hits)} frames:')
            for h in hits[:12]:
                print(f'  {h[:-8]}')
            return 1
        start = hits[0]

    # A fixed port so the owner's browser tab stays valid across runs; fall back if taken twice.
    for port in (8099, 8199, 0):
        try:
            srv = ThreadingHTTPServer(('127.0.0.1', port),
                                      partial(Quiet, directory=EXPORT))
            break
        except OSError:
            continue
    port = srv.server_address[1]
    url = f'http://127.0.0.1:{port}/{quote(start)}'

    print(f'  serving the design export at http://127.0.0.1:{port}/')
    print(f'  opening {start[:-8]}')
    print(f'  press Ctrl+C here when you are done looking')
    threading.Timer(0.4, webbrowser.open, [url]).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n  stopped')
    return 0


if __name__ == '__main__':
    sys.exit(main())
