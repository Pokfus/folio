// fixpunct.js [ids...]  — fix ".<sup>…</sup>." and "x<sup>…</sup>." in patch + glossary strings; prints counts. no ids = all out/*.json drafts
const fs=require('fs');const S=process.env.WH_S;
let ids=process.argv.slice(2);if(!ids.length)ids=fs.readdirSync(S+'/out').filter(f=>/^wh-\d+\.json$/.test(f)).map(f=>f.replace('.json',''));
const SUP='(?:<sup[^>]*><\\/sup>)+';
const re1=new RegExp('([.!?])('+SUP+')\\.(?!\\.)','g');   // ".<sup>." -> ".<sup>"
const re2=new RegExp('([^.!?\\s>"\'”’)])('+SUP+')\\.(?!\\.)','g'); // "x<sup>." -> "x.<sup>"
function fx(s){let n=0;for(let i=0;i<4;i++){const before=s;s=s.replace(re1,(m,a,b)=>{n++;return a+b});s=s.replace(re2,(m,a,b)=>{n++;return a+'.'+b});if(s===before)break;}return [s,n]}
function walk(o,cnt){for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'){const [s,n]=fx(v);if(n){o[k]=s;cnt.n+=n}}else if(v&&typeof v==='object')walk(v,cnt)}}
for(const id of ids){const f=S+'/out/'+id+'.json';if(!fs.existsSync(f))continue;const o=JSON.parse(fs.readFileSync(f,'utf8'));const cnt={n:0};walk(o.patch||{},cnt);if(o.glossary)walk(o.glossary,cnt);if(cnt.n){fs.writeFileSync(f,JSON.stringify(o,null,1));console.log(id,'fixed',cnt.n)}}
