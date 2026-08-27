"""Inflozo — diagram geometry checker.

    python3 tools/svg-check.py <file.html>      # exits non-zero if any diagram overlaps

The diagrams in the architecture documents are hand-written SVG, and a browser will happily draw
text straight through a box or a connector line through an unrelated shape without complaining.
Written after the owner reported overlapping text in the "pieces" diagram: a connector ran directly
through a box, and the first version of THIS checker missed it because it only parsed simple
two-point paths. It now walks multi-segment paths.

It approximates text width from the font size and character count, which is close enough to catch
real collisions and occasionally flags a near-miss. A near-miss costs a look; an overlap ships.
"""
import re,sys
src=open(sys.argv[1] if len(sys.argv)>1 else 'ARCHITECTURE-IN-PLAIN-ENGLISH.html',encoding='utf8').read()
FS={'tb':14,'t':13,'ts':11.5,'tm':11}; CW={'tb':.58,'t':.56,'ts':.55,'tm':.60}
def segs(d):
    """every straight run in a path, including multi-segment ones with Q corners"""
    pts=[]; 
    for m in re.finditer(r'([MLQ])\s*([\d.]+)\s+([\d.]+)(?:\s+([\d.]+)\s+([\d.]+))?', d):
        c=m[1]
        if c=='Q': pts.append((float(m[4]),float(m[5])))   # curve endpoint
        else:      pts.append((float(m[2]),float(m[3])))
    return [(pts[i],pts[i+1]) for i in range(len(pts)-1)]
bad=0
for i,svg in enumerate(re.findall(r'<svg[^>]*viewBox="0 0 (\d+) (\d+)"(.*?)</svg>', src, re.S),1):
    W,H,body=int(svg[0]),int(svg[1]),svg[2]
    rects=[(float(m[1]),float(m[2]),float(m[1])+float(m[3]),float(m[2])+float(m[4]),m[5])
           for m in re.finditer(r'<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*class="([^"]*)"',body)]
    out=[]
    # text: overflow and box-crossing
    for m in re.finditer(r'<text x="([\d.]+)" y="([\d.]+)"([^>]*)>(.*?)</text>',body,re.S):
        x,y,a,t=float(m[1]),float(m[2]),m[3],re.sub(r'<[^>]+>','',m[4])
        cls=(re.search(r'class="(\w+)"',a) or [None,'ts'])[1]; fs=FS.get(cls,11.5)
        w=len(t)*fs*CW.get(cls,.55); x0=x-w/2 if 'middle' in a else x
        if x0<-2 or x0+w>W+2: out.append(f'TEXT OVERFLOWS FRAME  [{t[:40]}] {x0:.0f}..{x0+w:.0f} of {W}')
        for rx0,ry0,rx1,ry1,rc in rects:
            ins = x0>=rx0-4 and x0+w<=rx1+4 and y-fs>=ry0-4 and y+2<=ry1+4
            hit = not (x0+w<rx0 or x0>rx1 or y+2<ry0 or y-fs>ry1)
            if hit and not ins: out.append(f'TEXT OVER BOX  [{t[:36]}] {x0:.0f}..{x0+w:.0f} vs box {rx0:.0f}..{rx1:.0f} ({rc})')
    # paths: a segment passing THROUGH a box interior (endpoints touching an edge are fine)
    for pm in re.finditer(r'<path d="([^"]+)"',body):
        for (ax,ay),(bx,by) in segs(pm[1]):
            for rx0,ry0,rx1,ry1,rc in rects:
                if ax==bx and rx0+2<ax<rx1-2:
                    lo,hi=sorted((ay,by))
                    if lo<ry1-2 and hi>ry0+2: out.append(f'LINE CUTS BOX  vertical x={ax:.0f} y{lo:.0f}..{hi:.0f} through ({rc}) {rx0:.0f}..{rx1:.0f}/{ry0:.0f}..{ry1:.0f}')
                if ay==by and ry0+2<ay<ry1-2:
                    lo,hi=sorted((ax,bx))
                    if lo<rx1-2 and hi>rx0+2: out.append(f'LINE CUTS BOX  horizontal y={ay:.0f} x{lo:.0f}..{hi:.0f} through ({rc})')
    if out:
        bad+=len(out); print(f'\n── diagram {i} ({W}x{H}) ──')
        for o in sorted(set(out)): print('  '+o)
print(f'\n{bad} real issue(s)' if bad else 'all diagrams clean')
sys.exit(1 if bad else 0)
