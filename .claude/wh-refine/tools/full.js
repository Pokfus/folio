const fs=require('fs');const S=process.env.WH_S;
for(const id of process.argv.slice(2)){const o=JSON.parse(fs.readFileSync(S+'/out/'+id+'.json','utf8'));const p=o.patch;
const s=x=>(x||'').replace(/<sup class="fn" data-fn="(\d+)"><\/sup>/g,'[$1]').replace(/<[^>]+>/g,'');
console.log('=====',id);console.log(s(p.abstract));(p.why||[]).forEach(w=>console.log('Q:',w.q,'\nA:',s(w.a)));
console.log('SRC:');p.sources.forEach((x,i)=>console.log(i+1,s(x).slice(0,230)));
if(o.glossary){console.log('GL:',s(o.glossary.description));}
console.log('CHANGES:',o.changes);console.log('NOTES:',o.notes);}
