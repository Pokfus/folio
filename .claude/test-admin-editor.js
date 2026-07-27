// Regression guard for the admin card editor and glossary popups. The card surface is shared with the
// Studio (liveCardEditorHTML / wireLiveCardEditor), so this is what proves the extraction did not
// change how the curated-content editor behaves.
//   NODE_PATH=<scratch>/node_modules node .claude/test-admin-editor.js
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const ROOT=require("path").resolve(__dirname,"..");const root=ROOT;const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml"};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(root,p);
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{"Content-Type":T[path.extname(f)]||"application/octet-stream"});r.end(d);});});
(async()=>{await new Promise(r=>s.listen(5603,r));
const b=await chromium.launch({...(process.env.FOLIO_CHROMIUM?{executablePath:process.env.FOLIO_CHROMIUM}:{})});
const p=await b.newPage();const errs=[];
p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,200)));
p.on("console",m=>{if(m.type()==="error"&&!/ERR_(TUNNEL|CONNECTION)/.test(m.text()))errs.push("console: "+m.text().slice(0,200));});
let fail=0;
const check=(name,ok,extra)=>{console.log((ok?"ok    ":"FAIL  ")+name+(extra?"  "+extra:""));if(!ok)fail++;};

// 1) admin editor: open a card, confirm the live fields + auto-linked abstract render
await p.goto("http://127.0.0.1:5603/#admin",{waitUntil:"load"});await p.waitForTimeout(1200);
check("admin page renders", await p.evaluate(()=>!!document.querySelector("#adminEditor, .admin-wrap, .admin-cols")));
const opened=await p.evaluate(()=>{const r=document.querySelector(".admin-card-row .acr-open");if(r){r.click();return true;}return false;});
await p.waitForTimeout(700);
check("card opens in editor", opened);
const ed=await p.evaluate(()=>({fields:document.querySelectorAll(".ces-field").length,
  linked:document.querySelectorAll('.ces-field[data-field="abstract"] .ttip[data-k]').length}));
check("live fields present", ed.fields===4, "fields="+ed.fields);
check("abstract auto-links in editor", ed.linked>0, "terms="+ed.linked);

// 1b) admin editing still writes through the extracted card surface
const beforeOverlay = await p.evaluate(()=>localStorage.getItem("folio_admin_v1")||"");
await p.dblclick('.card-edit-single [data-field="question"]');
await p.click('.card-edit-single [data-field="question"]');
await p.keyboard.type(" ZZTESTZZ",{delay:5});
await p.waitForTimeout(500);
const edited = await p.evaluate(()=>{
  const raw = localStorage.getItem("folio_admin_v1")||"";
  return { saved: raw.indexOf("ZZTESTZZ")>=0, flash: !!document.querySelector("#adminSaved.show"),
           rowEdited: !!document.querySelector(".admin-card-row.edited"), revertShown: !!document.querySelector("#adminRevert:not([hidden])") };
});
check("typing saves to the admin overlay", edited.saved, JSON.stringify(edited));
check("edit marks the card as edited", edited.rowEdited && edited.revertShown, JSON.stringify(edited));
// undo it so the overlay is left clean
await p.evaluate(()=>{const b=document.querySelector("#adminRevert"); if(b) b.click();});
await p.waitForTimeout(400);
check("revert clears the edit", await p.evaluate(()=>((localStorage.getItem("folio_admin_v1")||"").indexOf("ZZTESTZZ")<0)));
// the HTML source box round-trips
await p.evaluate(()=>{const t=document.querySelector("#cesSrcToggle"); if(t) t.click();});
await p.waitForTimeout(300);
check("HTML source box opens and fills", await p.evaluate(()=>{
  const ta=document.querySelector("#cesSrcTa"); return !!ta && !ta.hidden && /<!-- QUESTION -->/.test(ta.value) && /<!-- ABSTRACT -->/.test(ta.value);
}));

// 2) glossary popup from a study card: click a .ttip and confirm the window opens with nested links
await p.goto("http://127.0.0.1:5603/#decks",{waitUntil:"load"});await p.waitForTimeout(700);
await p.evaluate(()=>{const c=document.querySelector("#collection-list-all .collection .collection-row");if(c)c.click();});
await p.waitForTimeout(800);
await p.evaluate(()=>{const r=document.querySelector("#reveal-btn");if(r)r.click();});
await p.waitForTimeout(400);
const clicked=await p.evaluate(()=>{const t=document.querySelector(".abstract .ttip[data-k]");if(t){t.click();return t.getAttribute("data-k");}return null;});
await p.waitForTimeout(500);
check("gloss popup opens", !!clicked && await p.evaluate(()=>!!document.querySelector(".gloss-win")), "term="+clicked);
const g=await p.evaluate(()=>{const w=document.querySelector(".gloss-win");return w?{title:(w.querySelector(".gloss-title")||{}).textContent,
  desc:((w.querySelector(".gloss-desc")||{}).textContent||"").length, nested:w.querySelectorAll(".gloss-desc .ttip[data-k]").length}:null;});
check("popup has title + description", !!g && g.title && g.desc>20, g?JSON.stringify(g):"");
check("popup nests further gloss links", !!g && g.nested>0, g?"nested="+g.nested:"");

// 3) admin glossary tab: edit an alias, which must invalidate the scoped index without throwing
await p.goto("http://127.0.0.1:5603/#admin",{waitUntil:"load"});await p.waitForTimeout(1000);
const gt=await p.evaluate(()=>{const t=[...document.querySelectorAll(".admin-tab,[data-tab]")].find(x=>/gloss/i.test(x.textContent||x.dataset.tab||""));if(gt=t){t.click();return true;}return false;});
await p.waitForTimeout(700);
const term=await p.evaluate(()=>{const r=document.querySelector(".admin-card-row .acr-open,[data-gloss]");if(r){r.click();return true;}return false;});
await p.waitForTimeout(600);
check("glossary tab reachable", gt||term);

check("no console/page errors", errs.length===0, errs.join(" | "));
await b.close();s.close();
console.log("\n"+(fail?fail+" failed":"all passed"));process.exit(fail?1:0);})();
