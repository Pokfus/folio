/* COARSE, OBSCENE AND PREJUDICIAL CONTENT IN THE MANDARIN DECKS — report only, exit 0.
   `node .claude/decks/check-coarse.js [category]`, where a category is one of
   profanity · sexual · body · adult · violence · slur. With none, only the totals are printed.

   WHY IT EXISTS. The nine Mandarin decks are harvested from a film-subtitle corpus, and a subtitle
   corpus contains what films contain. Two findings turned up by ORDINARY READING in four batches —
   阴 (glossed "cloudy") whose third sentence was 你的阴茎很大, and 才 whose English was "I don't give
   a fuck about what you say" — and both were invisible to every other checker here: the sentences are
   grammatical, the translations accurate, they segment cleanly and they speak correctly. Two hits by
   chance in four batches is a rate, so the corpus is swept rather than waited on.

   THE DISCRIMINATOR IS WHETHER THE CARD IS THE COARSE WORD. The Everyday Phrases and Idioms decks
   teach 放屁, 该死, 滚蛋 and 一丝不挂 on purpose, and a phrasebook that left them out would be the
   poorer for it. So a hit is DROPPED where the matched term is the headword (either way round) or
   where the card's own gloss already carries the English word; what is left is coarse content that
   arrived on a card about something else.

   IT IS A REPORT AND CANNOT BE ANYTHING ELSE. Every word in these lists has innocent uses — "naked
   eye", "an ass" the animal, "aroused his curiosity", "a period", 上床睡觉 (to go to bed), 妈的 inside
   妈妈的, 小三 inside 比我小三岁, 高潮 of a performance — and the `violence` and `slur` lists are the
   noisiest of the six, since a corpus of films and idioms is full of killing and of calling people
   fools. READ EVERY FINDING. Nothing here may be swept.

   WHAT A REAL FINDING LOOKS LIKE, from the first full read (Sep 2026), in rough order of how often:
     · THE ENGLISH IS COARSER THAN THE CHINESE. 可恶 ("how annoying") rendered "Shit, where the fuck
       did I put my home keys?"; 搞砸 ("to mess up") as "Don't fuck it up now"; 他倒霉极了 as "He is
       shit out of luck". The card is not teaching an expletive and the translator supplied one.
     · A WORD OF ITS OWN SWALLOWING THE HEADWORD, where that word is obscene: 阴茎 on 阴 and on 茎,
       避孕套 on 避, 混蛋 on 混, 炮友 on 炮.
     · A SENTENCE THAT TEACHES NOTHING AND OFFENDS ANYWAY: a graphic obstetric emergency on 姿势
       ("posture"), an erection on 硬 ("hard"), a prostitute on 监控 ("to monitor").
     · A GENERALISATION ABOUT PEOPLE: "shorter people have more tricks up their sleeves" on 矮, "no man
       can resist the lure of a woman" on 抵挡, a people "on the same plane as savages" on 教养.
     · AND ONE THIS SWEEP FOUND BY ACCIDENT — A CHARACTER ERROR THAT PUT THE HEADWORD THERE. 电灯炮 for
       电灯泡 on 炮, and 别破妈妈发现 for 别被妈妈发现 on 破: the example is on the card ONLY because
       somebody typed the wrong character, and nothing in the pipeline can see it.

   A REPAIR IS `dropEx` PLUS AN AUTHORED `ex`, or `exEn` where only the English is at fault and the
   Chinese is sound — see the header of `mandarin-fix.js`, which is the one way these decks are edited. */
const fs = require("fs");
const deesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/* ENGLISH — matched on word boundaries, grouped by how likely a hit is to be a real problem.
   Every one of these has innocent uses, which is why this is a report read by eye. */
const EN = {
  profanity: ["fuck","fucking","fucked","shit","shitty","bullshit","bitch","bitches","cunt","bastard","damn","damned","goddamn","piss","pissed","crap","asshole","arsehole","wanker","bollocks","prick","twat","motherfucker","screwed","dickhead"],
  sexual: ["penis","vagina","genitals","genital","testicle","testicles","scrotum","anus","clitoris","semen","sperm","ejaculate","erection","orgasm","masturbate","masturbation","porn","pornography","pornographic","condom","condoms","intercourse","foreplay","aroused","horny","libido","virginity","prostitute","prostitution","brothel","whore","slut","pimp","rape","raped","rapist","molest","molested","incest","paedophile","pedophile","sodomy","fetish","erotic","nipple","nipples","buttock","buttocks","testes","vulva","penetration"],
  body: ["breast","breasts","naked","nude","nudity","topless","undress","undressed","bosom","crotch","groin","butt","bum","ass","arse","boobs","tits"],
  adult: ["sex","sexual","sexually","sexy","lust","lustful","seduce","seduced","seductive","affair","mistress","adultery","adulterous","cheating","virgin","pregnant","abortion","miscarriage","menstruation","period","contraception","sterilise","sterilize","castrate","castrated"],
  violence: ["kill","killed","murder","murdered","suicide","suicidal","corpse","slaughter","massacre","torture","tortured","execute","executed","hang","hanged","stab","stabbed","shoot","shot","strangle","strangled","behead","beheaded","drown","drowned","beat","beaten","abuse","abused","assault","assaulted","overdose","addict","addicted","heroin","cocaine","opium","drunk","drunken"],
  slur: ["retard","retarded","idiot","idiots","moron","moronic","stupid","ugly","fat","cripple","crippled","lame","dumb","deaf","blind","insane","crazy","lunatic","mad","freak","loser","losers","savage","savages","primitive","barbarian","barbarians","backward","inferior","greedy","lazy","filthy","dirty","disgusting","vulgar"],
};
/* CHINESE — substring, since Chinese has no word boundary. */
const ZH = {
  profanity: ["他妈的","妈的","操你","靠","傻逼","傻B","混蛋","王八蛋","畜生","滚蛋","放屁","狗屎","该死","妈蛋","去死"],
  sexual: ["阴茎","阴道","阴部","生殖器","睾丸","乳房","乳头","屁眼","肛门","精液","性交","做爱","上床","手淫","自慰","避孕套","安全套","嫖娼","妓女","卖淫","强奸","强暴","乱伦","色情","黄片","春药","高潮","勃起","处女膜","阳痿","性欲","调情"],
  body: ["裸体","赤裸","光着","脱光","屁股","奶子","胸部","下体","阴毛","私处"],
  adult: ["性别","性生活","情人","小三","出轨","外遇","通奸","偷情","处女","怀孕","堕胎","流产","月经","避孕","绝育","阉割","勾引","诱惑"],
  violence: ["杀死","杀害","谋杀","自杀","尸体","屠杀","大屠杀","酷刑","折磨","处决","绞死","刺死","枪杀","勒死","砍头","淹死","毒打","虐待","强迫","吸毒","海洛因","可卡因","鸦片","喝醉","酗酒"],
  slur: ["智障","白痴","傻子","笨蛋","蠢","丑","胖子","瘸子","瞎子","聋子","疯子","变态","废物","没用","下贱","低等","野蛮","落后","懒惰","贪婪","肮脏","恶心","粗俗","小人","心眼多"],
};
const rxEN = {}, rxZH = {};
for (const k of Object.keys(EN)) rxEN[k] = new RegExp("(?<![\\p{L}\\p{N}_])(" + EN[k].join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
for (const k of Object.keys(ZH)) rxZH[k] = new RegExp("(" + ZH[k].join("|") + ")", "gu");

const hits = [];
let blocks = 0;
for (const fn of fs.readdirSync("decks").filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync("decks/" + fn, "utf8"));
  const lvl = fn.replace(/^Mandarin-|\.folio-deck\.json$/g, "");
  for (const c of d.cards || []) {
    const fl = c.fields, hw = fl.Simplified;
    const scan = (where, zh, en, own) => {
      for (const k of Object.keys(EN)) { rxEN[k].lastIndex = 0; for (const m of String(en || "").matchAll(rxEN[k])) if (!own(m[1])) hits.push({ lvl, hw, where, cat: k, hit: m[1], zh, en }); }
      for (const k of Object.keys(ZH)) { rxZH[k].lastIndex = 0; for (const m of String(zh || "").matchAll(rxZH[k])) if (!own(m[1])) hits.push({ lvl, hw, where, cat: k, hit: m[1], zh, en }); }
    };
    const gloss = deesc(String(fl.English || "").replace(/<[^>]*>/g, " ")).toLowerCase();
    /* THE CARD MAY BE THE COARSE WORD, AND THEN IT IS DOING ITS JOB. The Everyday Phrases and Idioms
       decks teach 放屁, 该死 and 滚蛋 on purpose; a phrasebook that left them out would be the poorer
       for it. The fault this sweep exists for is coarse content on a card that is about something
       else — 阴茎 on the card for "cloudy", an obscenity on the card for 才. So a hit is dropped when
       the matched term IS the headword (either way round) or when the card's own gloss already
       carries the English word. */
    const own = (h) => (h.length > 1 && (hw.indexOf(h) >= 0 || h.indexOf(hw) >= 0)) || gloss.indexOf(h.toLowerCase()) >= 0;
    scan("gloss", hw, deesc(String(fl.English || "").replace(/<[^>]*>/g, " ")), own);
    String(fl.Examples || "").split(/(?=<div class="uc-exi)/).forEach((b, i) => {
      const say = (/data-say="([^"]*)"/.exec(b) || [])[1]; if (say === undefined) return;
      blocks++;
      const en = (/<div class="uc-exe">([\s\S]*?)<\/div>/.exec(b) || [])[1] || "";
      scan("e" + (i + 1), deesc(say), deesc(en.replace(/<[^>]*>/g, " ")), own);
    });
  }
}
const want = process.argv[2];   // a category name, or nothing for the totals alone
const order = ["profanity", "sexual", "body", "adult", "violence", "slur"];
console.log("scanned " + blocks + " example blocks + every gloss\n");
for (const cat of order) {
  const rows = hits.filter((h) => h.cat === cat);
  console.log("=== " + cat.toUpperCase() + "  " + rows.length);
  if (want && want !== cat) continue;
  const seen = new Set();
  rows.forEach((h) => {
    const k = h.lvl + h.hw + h.where + h.hit; if (seen.has(k)) return; seen.add(k);
    console.log("   " + h.lvl.replace("HSK-3.0-", "") + "  " + h.hw + "  " + h.where + "  [" + h.hit + "]  " + h.zh + "  /  " + h.en.trim());
  });
}
