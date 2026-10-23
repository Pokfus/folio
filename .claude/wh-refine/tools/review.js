// review.js <id>...  — read the drafts. WH_S must be set. flags to the right.
const fs=require('fs');const S=process.env.WH_S;
const NW=/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)(-(one|two|three|four|five|six|seven|eight|nine))?\b/gi;
const strip=s=>(s||'').replace(/<span class="blank">_____<\/span>/g,'_____').replace(/<sup[^>]*><\/sup>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const wc=s=>strip(s).split(' ').filter(Boolean).length;
for(const id of process.argv.slice(2)){
 let o;try{o=JSON.parse(fs.readFileSync(S+'/out/'+id+'.json','utf8'))}catch(e){console.log('=====',id,'NO DRAFT',e.message);continue}
 const p=o.patch||{};const cur=JSON.parse(fs.readFileSync(S+'/cur/'+id+'.json','utf8')).card;
 console.log('\n=====',id,cur.answer,'| src',(cur.sources||[]).length,'->',(p.sources||[]).length,'| diff',p.difficulty,'| undat',p.undatable,'| loc',o.locator?JSON.stringify(o.locator):'null','| pins',o.pins);
 const qs=[p.question,...(p.questions||[])];
 qs.forEach((q,i)=>{const t=strip(q);const f=[];const n=wc(q);if(n<20||n>34)f.push('LEN'+n);
  if(/\d/.test(t))f.push('DIGIT');if(/_____\s*[.?!]?\s*$/.test(t))f.push('ENDBLANK');if(/^(Its|His|Her|Their|It|They)\b/.test(t))f.push('PRONOUN');
  const nw=t.match(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/gi);if(nw)f.push('NUMWORD:'+nw.join(','));
  const ans=(cur.answer||'').toLowerCase().split(/\s+/).filter(w=>w.length>3);
  for(const w of ans){if(t.toLowerCase().includes(w.replace(/[^a-zà-ÿ]/g,'')))f.push('ANSWORD:'+w)}
  console.log(`Q${i}[${n}] ${t}  ${f.join(' ')}`)});
 console.log('DATE:',(p.answerDate===''?'(empty)':strip((p.answerDate||'').replace(/<\/span><span class="dt-v">/g,' = ').replace(/<span class="dt-k">/g,' ‖ '))));
 const ab=p.abstract||'';const sents=ab.replace(/ <br><br> /g,' ').split(/<\/sup>\s+(?=[A-Z<"'‘“])/);
 const bw=wc(ab.replace(/\([^)]*\)/g,''));const wfl=[];if(bw<270||bw>285)wfl.push('WORDS'+bw);
 if(/\.\.\s*<sup/.test(ab))wfl.push('DOUBLEDOT');if(/<sup[^>]*><\/sup>\s*\./.test(ab))wfl.push('SUP-DOT');if(/[^.!?'"”’)>]<sup/.test(ab.replace(/<i>|<\/i>/g,'')))wfl.push('SUP-NOPUNCT');
 if(/<sup[^>]*><\/sup>[,;:]/.test(ab))wfl.push('SUP-BEFORE-PUNCT');
 const nws=strip(ab).match(NW);
 console.log(`ABS [${bw}w, ${sents.length}s, mean ${(bw/Math.max(sents.length,1)).toFixed(1)}] ${wfl.join(' ')} numwords:${nws?nws.slice(0,8).join(','):'-'}`);
 console.log('   ',strip(ab).slice(0,420));
 (p.why||[]).forEach((w,i)=>{const a=strip(w.a);const f=[];if(!/^Why\b/.test(w.q))f.push('NOT-WHY');const n=a.split(' ').length;if(n<12||n>60)f.push('A'+n);
  if(/\.\.\s*<sup/.test(w.a)||/<sup[^>]*><\/sup>\s*\./.test(w.a))f.push('PUNCT');
  console.log(`W${i} ${w.q} ${f.join(' ')}\n     …${a.slice(-110)}`)});
 const g=o.glossary;console.log('GLOSS:',g?strip(g.description).slice(0,260)+' ['+(g.date||'')+'] src'+(g.sources||[]).length:'null');
 console.log('NOTES:',(o.notes||'').slice(0,500));
 if(o.refused)console.log('REFUSED:',String(o.refused).slice(0,400));
}
