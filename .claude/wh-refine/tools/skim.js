global.window={};
const path='/home/user/folio/';
const ids=process.argv.slice(2);
for(const id of ids){const c=JSON.parse(require('fs').readFileSync(process.env.WH_S+'/cur/'+id+'.json','utf8'));
const k=c.card||c; console.log('=====',id,k.answer,'| diff',k.difficulty,'| tags',(k.tags||[]).join(','),'| undat',k.undatable,'| loc',JSON.stringify(k.locator)||'-','| src',(k.sources||[]).length);
console.log('DATE:',(k.answerDate||'').replace(/<[^>]+>/g,' | ').replace(/\s+/g,' '));
console.log('ABS:',(k.abstract||'').replace(/<sup[^>]*><\/sup>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,1500));}
