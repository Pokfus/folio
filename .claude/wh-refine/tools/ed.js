// ed.js <id> <path> <old> <new>   path e.g. patch.abstract | patch.question | patch.questions.0 | patch.why.1.a | glossary.description
const fs=require('fs');const [,,id,pth,oldS,newS]=process.argv;const f=process.env.WH_S+'/out/'+id+'.json';
const o=JSON.parse(fs.readFileSync(f,'utf8'));const ks=pth.split('.');let t=o;for(const k of ks.slice(0,-1))t=t[k];const last=ks[ks.length-1];
const s=t[last];if(typeof s!=='string')throw new Error('not a string: '+pth);
const n=s.split(oldS).length-1;if(n!==1){console.error('ERROR: old text occurs '+n+' times in '+id+' '+pth);process.exit(1)}
t[last]=s.replace(oldS,()=>newS);fs.writeFileSync(f,JSON.stringify(o,null,1));console.log('ok',id,pth);
