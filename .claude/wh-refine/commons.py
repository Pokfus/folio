#!/usr/bin/env python3
# c.py search "query" [n]   |  c.py info "File:A.jpg|File:B.jpg"  | c.py get URL out
import sys, time, json, subprocess, urllib.parse, re, html
UA="Mozilla/5.0 (compatible; FolioStudyResearch/1.0)"
API="https://commons.wikimedia.org/w/api.php"
def curl(url, out=None):
    for attempt in range(2):
        time.sleep(45)
        cmd=["curl","-sSL","-A",UA,"--max-time","60","-w","\n%{http_code}",url]
        if out: cmd=["curl","-sSL","-A",UA,"--max-time","60","-o",out,"-w","%{http_code}",url]
        r=subprocess.run(cmd,capture_output=True,text=not out)
        txt=r.stdout if not out else r.stdout.decode()
        code=txt.strip().split("\n")[-1]
        body="\n".join(txt.split("\n")[:-1]) if not out else ""
        if code=="429" or "too many requests" in body.lower()[:500]:
            if attempt==0:
                print("429, waiting 60",file=sys.stderr); time.sleep(60); continue
            print("RATE_LIMITED",file=sys.stderr); sys.exit(42)
        return code, body
def strip(s): return html.unescape(re.sub(r"<[^>]+>","",s or "")).strip()
cmd=sys.argv[1]
if cmd=="search":
    n=sys.argv[3] if len(sys.argv)>3 else "15"
    q=urllib.parse.urlencode({"action":"query","list":"search","srnamespace":"6","srsearch":sys.argv[2],"srlimit":n,"format":"json"})
    code,b=curl(API+"?"+q); d=json.loads(b)
    for s in d["query"]["search"]: print(s["title"], "|", s.get("size"))
elif cmd=="info":
    q=urllib.parse.urlencode({"action":"query","titles":sys.argv[2],"prop":"imageinfo","iiprop":"url|extmetadata|size","iiurlwidth":"1280","format":"json"})
    code,b=curl(API+"?"+q); d=json.loads(b)
    for p in d["query"]["pages"].values():
        if "imageinfo" not in p: print(p["title"],"MISSING"); continue
        ii=p["imageinfo"][0]; m=ii.get("extmetadata",{})
        g=lambda k: strip(m.get(k,{}).get("value",""))
        print("==",p["title"], ii.get("width"),"x",ii.get("height"))
        print("  thumb:",ii.get("thumburl"))
        print("  artist:",g("Artist")[:150]); print("  lic:",g("LicenseShortName")); print("  desc:",g("ImageDescription")[:300]); print("  date:",g("DateTimeOriginal")[:60])
elif cmd=="get":
    code,_=curl(sys.argv[2],sys.argv[3]); print(code)
