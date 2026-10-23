// rows.js <notesFile>  — notes lines "wh-701<TAB>the main changes" -> ledger table rows
const fs=require('fs');const S=process.env.WH_S;
const bar={1:9,2:8,3:7,4:6,5:5};
const lines=fs.readFileSync(process.argv[2],'utf8').split('\n').filter(l=>/^wh-\d+\t/.test(l));
console.log('| card | bar | sources | the main changes |\n|---|---|---|---|');
for(const l of lines){const [id,...r]=l.split('\t');const note=r.join('\t').trim();
 const cur=JSON.parse(fs.readFileSync(S+'/cur/'+id+'.json','utf8')).card;
 const o=JSON.parse(fs.readFileSync(S+'/out/'+id+'.json','utf8'));const p=o.patch;
 const d=p.difficulty||cur.difficulty;
 console.log(`| \`${id}\` ${cur.answer} | ${bar[d]} | ${(cur.sources||[]).length} → ${(p.sources||[]).length} | ${note} |`)}
