#!/usr/bin/env python3
# w.py wh-NNN src title desc credit alt why   |  w.py wh-NNN none why
import sys, json
a=sys.argv[1:]; i=a[0]
if a[1]=="none": o={"id":i,"image":None,"why":a[2]}; line=f"- {i}: none. {a[2]}"
else:
    o={"id":i,"image":dict(src=a[1],title=a[2],desc=a[3],credit=a[4],alt=a[5]),"why":a[6]}; line=f"- {i}: {a[6]}"
json.dump(o,open(f"{i}.json","w"),ensure_ascii=False,indent=1)
p=open("PROGRESS.md").read().splitlines()
p=[l for l in p if not l.startswith(f"- {i}:")]+[line]
open("PROGRESS.md","w").write("\n".join(p)+"\n"); print(line)
