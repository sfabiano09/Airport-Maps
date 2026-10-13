"""Draws the Airport Map Home Screen icon: a map pin above an F-shaped terminal with gates, dark green on light grey.
Run: python3 scripts/make_icon.py  (needs Pillow) -> writes icon-180.png and icon-512.png in the current folder.
To use new icons, give the files a new name and update index.html, manifest.webmanifest and sw.js (iPhones cache icons by name)."""
from PIL import Image, ImageDraw, ImageFont
BG=(226,228,230); FG=(21,94,52); GATE=(21,94,52)
def icon(n, bg=BG, fg=FG, gate=GATE):
    S=n*4; im=Image.new("RGB",(S,S),bg); d=ImageDraw.Draw(im)
    w=S*0.10; r=w/2
    x0=S*0.32; top=S*0.50; bot=S*0.86; xr=S*0.74
    mid=S*0.665; xm=S*0.63
    d.rounded_rectangle([x0,top,x0+w,bot],radius=r,fill=fg)
    d.rounded_rectangle([x0,top,xr,top+w],radius=r,fill=fg)
    d.rounded_rectangle([x0,mid,xm,mid+w],radius=r,fill=fg)
    # gates: small rounded squares parked along the concourses
    g=S*0.048; gap=-S*0.006   # squares sit right against the F
    def sq(cx,cy): d.rounded_rectangle([cx-g/2,cy-g/2,cx+g/2,cy+g/2],radius=g*0.25,fill=gate)
    for x in (0.64,0.72): sq(S*x, top-gap-g/2)                              # above top arm (right of the pin)
    for x in (0.47,0.57): sq(S*x, mid+w+gap+g/2)                            # under middle arm
    sq(xm+gap+g/2, mid+w/2)                                                 # end of middle arm
    sq(xr+gap+g/2, top+w/2)                                                 # end of top arm
    for y in (0.60,0.695,0.79): sq(x0-gap-g/2, S*y)                        # left side of spine, evenly spaced
    # map pin above, tip touching the top arm
    cx,cy,pr=S*0.50,S*0.25,S*0.135
    d.ellipse([cx-pr,cy-pr,cx+pr,cy+pr],fill=fg)
    d.polygon([(cx-pr*0.86,cy+pr*0.5),(cx+pr*0.86,cy+pr*0.5),(cx,cy+pr*1.95)],fill=fg)
    d.ellipse([cx-pr*0.42,cy-pr*0.42,cx+pr*0.42,cy+pr*0.42],fill=bg)
    return im.resize((n,n),Image.LANCZOS)
if __name__=="__main__":
    icon(180).save("icon-180.png"); icon(512).save("icon-512.png")
    # preview on a fake home screen row with the label
    n=240; pad=60
    sheet=Image.new("RGB",(n+2*pad,n+2*pad+50),(60,90,140)); d=ImageDraw.Draw(sheet)
    m=Image.new("L",(n,n),0); ImageDraw.Draw(m).rounded_rectangle([0,0,n-1,n-1],radius=int(n*.225),fill=255)
    sheet.paste(icon(n),(pad,pad),m)
    f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",30); t="Airport Map"
    bb=d.textbbox((0,0),t,font=f); d.text((pad+(n-(bb[2]-bb[0]))/2,pad+n+14),t,font=f,fill=(255,255,255))
    sheet.save("icon-preview.png")
