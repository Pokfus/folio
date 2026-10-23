// splice.js <sectionsFile> <Bnn> <firstNum> <lastNum>
// sectionsFile has @@LEDGER, @@CHRON, @@PICS blocks. Pins come from $WH_S/out/wh-NNN.json.
const fs=require('fs');const R='/home/user/folio/docs/';const S=process.env.WH_S;
const [,, file, B, a, b]=process.argv;
const txt=fs.readFileSync(file,'utf8');
const sec=n=>{const m=txt.match(new RegExp('@@'+n+'\\n([\\s\\S]*?)(?=\\n@@[A-Z]+\\n|$)'));return m?m[1].replace(/\s+$/,''):''};
let au=fs.readFileSync(R+'wh-refinement-audit.md','utf8');
const led=sec('LEDGER'),pics=sec('PICS');
if(led){const head=led.split('\n')[0];
  if(au.includes(head)) console.log('ledger already present');
  else{const k='### The six unwritten locators';const i=au.indexOf(k);if(i<0)throw new Error('no locators heading');au=au.slice(0,i)+led+'\n\n'+au.slice(i);console.log('ledger inserted')}}
if(pics){ // append rows at the end of file (the Pictures table is last)
  const first=pics.split('\n')[0];
  if(au.includes(first)) console.log('pics already present'); else{au=au.replace(/\s+$/,'')+'\n'+pics+'\n';console.log('pics rows appended')}}
// mark batch done
const re=new RegExp('(\\| '+B+' \\|[^\\n]*\\| )open \\|');
if(re.test(au)){au=au.replace(re,'$1**done 2026-10-23** |');console.log('batch marked')}
fs.writeFileSync(R+'wh-refinement-audit.md',au);
let ch=fs.readFileSync(R+'wh-chronology.md','utf8');
const rows=sec('CHRON');
if(rows){const first=rows.split('\n')[0];
  if(ch.includes(first)) console.log('chron rows already present'); else{
  const k='## Chronology pins';const i=ch.indexOf(k);ch=ch.slice(0,i).replace(/\s+$/,'')+'\n'+rows+'\n\n'+ch.slice(i);console.log('chron rows inserted')}}
// pins
const pinLines=[];
for(let n=+a;n<=+b;n++){const id='wh-'+n;let o;try{o=JSON.parse(fs.readFileSync(S+'/out/'+id+'.json','utf8'))}catch(e){continue}
  const p=(o.pins||'').trim();if(!p)continue;if(new RegExp('^'+id+':','m').test(ch))continue;pinLines.push(id+': '+p)}
if(pinLines.length){const end=ch.lastIndexOf('\n```');ch=ch.slice(0,end)+'\n'+pinLines.join('\n')+ch.slice(end);console.log('pins added',pinLines.length)}
fs.writeFileSync(R+'wh-chronology.md',ch);
