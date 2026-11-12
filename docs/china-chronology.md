# China — the chronology the collection commits to

The dates, conventions and name spellings the China collection (`china`, `cnh-001`–`cnh-1000`) uses, in ONE
place, so that no two cards disagree about when something happened or how a name is spelled. Written in Nov
2026 as Batch 0 of the refinement audit (`docs/china-refinement-audit.md`), on the model of
`docs/rome-chronology.md` and `docs/greece-chronology.md`.

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the old
figure on the day — a correction does not travel on its own. A row is only ever added from a source a batch
actually read; nothing here is carried over from the bulk-written cards unchecked.

`node .claude/cnh-audit.js` reads the `chronology-pins` block at the foot of this file and reports any pinned
card whose date line does not carry its pinned figures. `node .claude/check-cnh-spellings.js` reads the
Spellings table and reports any variant a card's own voice uses.

**The date lines of the cards about one individual human are PROTECTED** (`docs/china-refinement-audit.md`,
"Protected date lines"): they are refined in another thread, and this file pins them to their lines as they
stand. A row below never moves a protected line.

## Conventions

| case | write | not | why |
|---|---|---|---|
| a year under 1000 | `1046 BCE`, `841 BCE`, `219 CE` | `841`, `219 AD` | `cardYears` reads a bare first-millennium number only through the era; the numeral leads |
| a year from 1000 on | `1899`, `1928` | `1899 CE` | no era needed; the house form |
| the era | `BCE` and `CE` | `BC`, `AD` | site-wide (`check-style.js` refuses "AD"); a quotation or a title keeps its own form |
| an approximate range | `c. 1250 – 1046 BCE` | `c. 1250 – c. 1046 BCE` | a `c.` inside a range breaks the era's leftward carry |
| a century | `c. 300 – 200 BCE` | `3rd century BCE` on the line | a century alone yields no sort year; in prose "the 3rd century BCE" is fine. No decade either, on the line or as a value |
| a dynasty's dates | the conventional dates, e.g. Shang `c. 1600 – 1046 BCE`, with whose convention it is in prose | a dynasty's dates as if recorded | dynastic dates are conventions; the Xia's are inferred, the Shang's earlier reigns are not fixed (`docs/china-card-plan.md`, "Names, dates and romanisation") |
| a legendary date | `Traditional` as the label, e.g. `Traditional` `2357 BCE`; the prose names whose reckoning it is | `Reigned 2357 BCE` as if recorded, `after 2070 BCE` | the sage kings' and the Xia's years are later reckonings (the received chronologies, the *Bamboo Annals*, Liu Xin's), not records — on a NON-protected card; a protected line stays as it stands |
| the Xia–Shang–Zhou Chronology Project's dates | `c. 2070 – 1600 BCE` with the prose saying it is the Project's (2000) figure, and contested | the Project's years as fact | the Project is itself a subject of the collection (`cnh-065`) and its dates are argued |
| the first securely dated year | `841 BCE`, the Gonghe regency, said so where it matters | an earlier year given the same weight | the transmitted record's continuous year count begins there (Sima Qian's chronological tables); every earlier year is a reconstruction |
| the Shang kings before Wu Ding | no reign years; a reign is placed in order, not dated | a converted regnal year | only from Wu Ding on do the oracle bones give a dated anchor, and even his years are a reconstruction |
| the lunar year | the Western year a source gives; where a Chinese year straddles two Western ones and it matters, the prose says so | a silent choice | the calendar year began between late January and February |
| a regnal year | the Western year a source prints | a conversion of your own ("the 4th year of Wu Ding = …") | a conversion is a figure no source gives |
| a disputed date | two rows (`Dated` / `Also dated`), or in prose "X puts it…; Y puts it…" | one figure chosen silently; `Or` as a label | the Greece rule |
| a myth, a motif, a text or a concept | the date of the text that attests it (`Attested`, `Written`, `Compiled`) | another man's act ("Sima Qian writes") as its date | a myth has no date of its own; the earliest text that tells it does |
| an excavation | a `Found` / `Excavated` row only on a site or find card, after the dates of the thing itself | a discovery year as the card's only date | a discovery year sorts the card into the modern period |
| a radiocarbon range | the range for the site the source dates, and whose | one site's range for a whole culture | the "date belonging to another site" fault |
| no date a source gives | omit it | an estimate | never estimated |

Questions carry **no dates at all** — no year, century, millennium or decade. Period names (the Neolithic,
the Shang, the Warring States) are fine.

A date line's label is ≤ 16 characters and names **no place and no man** (on a non-protected card): `Attested`,
not `In the Huainanzi`; `Traditional`, not `Sima Qian's date`. Its values only date: no counts ("17 kings",
"81 brothers"), no "before / after / from / to" values. Those go in prose.

## Spellings

Decided in Batch 0 (Nov 2026) from the plan's rule (`docs/china-card-plan.md`, "Names, dates and
romanisation"): **pinyin throughout, keeping a non-pinyin form only where it IS the English name** (Confucius,
Mencius, the Yangtze, the *I Ching*). In English prose pinyin is written **without tone marks** — tone marks
belong only in the card's `pinyin` field — but **ü is kept** (Nüwa, Lüshi Chunqiu, Zhinü), and the apostrophe
before a syllable opening on a, o or e (Chang'e). A name is written joined or split as the house form says,
once for the collection; the variants become glossary aliases, never glossary slugs to rename.

**How it is checked.** `node .claude/check-cnh-spellings.js [--range=cnh-001:cnh-100]` reads the table below
and reports a **reported variant** wherever it stands in a card's question, background, Think it through or
date line, or in the source list OUTSIDE a quoted or italic title (a 19th-century translation is cited as
printed — Legge's *Shû King* stays *Shû King* in its citation), and in the description of every glossary entry
tagged `china`. Variants in the "aliases only" column are legitimate in some sentences (Yin for the late Shang;
Huangdi as the Yellow Emperor's own name) and are not reported.

**Where a glossary slug already exists, its form is the house form** (a slug is never renamed, and the glossary's
title is what a reader sees on every card that links it). Where the plan line and the live answer differ, the **live answer wins** when it is also the glossary slug and
the form English-language scholarship and the reference works use; the decision is recorded in the note.

| house form | reported variants | aliases only (not reported) | note |
|---|---|---|---|
| Nüwa | Nuwa, Nü Wa, Nu Wa, Nügua, Nugua, Nü-kua, Nu Kua | | always with ü in prose |
| Fuxi | Fu Xi, Fu Hsi, Fu-hsi, Fu-Hsi | Paoxi, Taihao | joined, as the slug |
| Pangu | Pan Gu, P'an-ku, P'an Ku | | |
| Shennong | Shen Nong, Shen-nung, Shen Nung | Yandi | Yandi is a figure of his own whom some texts identify with Shennong; never a spelling of him |
| Yellow Emperor | Huang Di, Huang-ti, Hwang-ti, Huang Ti | Huangdi | English name first; *Huangdi* may follow as his Chinese name |
| Chiyou | Chi You, Ch'ih-yu, Ch'ih Yu | | |
| Zhuolu | Zhuo Lu, Cho-lu, Cholu | | |
| Yu the Great | Yü the Great, Ta Yü | Da Yu, Yu | |
| Gun | | Kun, Kuen | Yu's father; "Kun" collides with other words, so nothing is reported |
| Gonggong | Gong Gong, Kung-kung, Kung Kung | | |
| Zhuanxu | Zhuan Xu, Chuan-hsü, Chuan Hsü | | |
| Houyi | Hou Yi, Hou I, Hou-i | Yi, Yi the Archer | joined: the live answer, the slug and Wikipedia's title; the `pinyin` field reads Hòuyì |
| Chang'e | Chang E, Chang-e, Ch'ang-o, Chang'o | Heng'e | Heng'e is the older name the *Huainanzi* uses; a card quoting that text may name it |
| Kuafu | Kua Fu, K'ua-fu, K'ua Fu | | joined: the live answer and slug win over the plan line's "Kua Fu" |
| Jingwei | Jing Wei, Ching-wei, Ching Wei | | |
| Queen Mother of the West | Xi Wangmu, Xi Wang Mu, Hsi Wang Mu, Hsi-wang-mu | Xiwangmu | English name first; *Xiwangmu* (joined) may follow |
| Kunlun | Kun Lun, K'un-lun, Kuenlun, Kuen-lun, Kuen Lun | | |
| Penglai | Peng Lai, P'eng-lai | | |
| Fenghuang | Feng Huang, Feng-huang | | |
| Qilin | Qi Lin, Ch'i-lin, Kylin | | |
| Taotie | Tao Tie, T'ao-t'ieh, Taotieh | | lower case in prose as a noun ("the taotie"), capitalised as a card's answer |
| Shanhaijing | Shan Hai Jing, Shanhai jing, Shanhai Jing, Shan-hai ching, Shan Hai Ching | Classic of Mountains and Seas | English title first; the Chinese title is joined (one word in the official pinyin orthography), and its `pinyin` field reads Shānhǎijīng |
| Chuci | Chu Ci, Chu ci, Ch'u Tz'u, Ch'u-tz'u | Songs of the South, Songs of Chu | joined, as the slug |
| Qu Yuan | Ch'ü Yüan, Qu-yuan, Quyuan | | |
| Jade Emperor | | Yuhuang Dadi, Yudi | |
| Diyu | Di Yu, Ti-yü | | |
| Yanluo | Yan Luo, Yen-lo, Yen Lo | Yama, Yanluowang | Yama where the Indian god is meant |
| Zao Jun | Zaojun, Tsao Chün, Tsao Chun | Zao Shen, Kitchen God | split: the live answer and plan line; the `pinyin` field reads Zàojūn |
| Menshen | Men Shen | door gods | |
| Mazu | Ma Zu, Ma-tsu, Matsu | Tianhou, Lin Moniang | |
| Guandi | Guan Di, Kuan-ti, Kuan Ti | Guan Gong | the god; Guan Yu the man |
| Guan Yu | Kuan Yu, Kuan Yü | | |
| Niulang, Zhinü | Zhinu, Chih-nü, Niu Lang | Cowherd, Weaver Girl | |
| Qixi | Qi Xi, Ch'i-hsi | | |
| Bai Suzhen, Xu Xian | Pai Su-chen, Hsü Hsien | | |
| Lü Dongbin, He Xiangu, Zhongli Quan, Zhang Guolao, Han Xiangzi, Cao Guojiu, Li Tieguai, Lan Caihe | Lu Dongbin, Lü Tung-pin, Ho Hsien-ku | | the Eight Immortals |
| Xia | Hsia | | |
| Shang | | Yin | Yin is the late Shang capital's name and the Zhou name for the dynasty; legitimate in those senses |
| Yinxu | Yin Xu, Yin-hsü, Yin-hsu | | |
| Anyang | An-yang | | |
| Shaokang | Shao Kang, Shao K'ang | | joined, as the answer |
| Taikang | Tai Kang, T'ai K'ang | | joined, for parity with Shaokang (and the more common form in the hundred) |
| Qi of Xia | Ch'i of Hsia | Qi | "Qi" alone collides with the state of Qi and the concept; never reported |
| Jie of Xia | Chieh | Jie | |
| Tang of Shang | Ch'eng T'ang | Cheng Tang, Tang, Da Yi | |
| Pan Geng | Pangeng, P'an Keng | | |
| Wu Ding | Wuding, Wu Ting | | |
| Fu Hao | Fuhao | Fu Zi | |
| Di Xin | Dixin, Ti Hsin | Zhou Xin, King Zhou of Shang | |
| Shangdi | Shang Di, Shang-ti, Shang Ti | Di | Di alone is the oracle bones' own word and is legitimate |
| Erlitou | Erh-li-t'ou, Er Li Tou, Erh-li-tou | | |
| Peiligang, Jiahu, Yangshao, Banpo, Hongshan, Liangzhu, Longshan, Taosi, Shimao | Yang-shao, Pan-p'o, Hung-shan, Liang-chu, Lung-shan, Lungshan | | the type-site names are modern labels; see `docs/china-refinement-audit.md`, "What China adds" 4 |
| Sanxingdui, Panlongcheng, Xibeigang, Zhengzhou | San Xing Dui, Pan Long Cheng, Hsi-pei-kang, Chengchow, Cheng-chou | | |
| Sima Qian | Ssu-ma Ch'ien, Ssu-ma Chien, Si-ma Qian | | |
| Shiji | Shi ji, Shih chi, Shih-chi, Shih Chi | Records of the Grand Historian | English title first |
| Shangshu | Shujing, Shu jing, Shu Ching, Shu ching, Shû King | Book of Documents, Book of History | English title first; Shangshu (the more used of the two Chinese titles) after it; Legge's *Shû King* only in its citation |
| Bamboo Annals | Chu-shu chi-nien | Zhushu jinian | English title first |
| Huainanzi | Huainan zi, Huai-nan-tzu, Huainan Tzu, Huai Nan Tzu | | |
| Zuo Zhuan | Zuozhuan, Zuo zhuan, Tso chuan, Tso Chuan | Zuo Tradition, Zuo Commentary | the glossary slug's form (`Zuo_Zhuan`, used site-wide), though the hundred wrote Zuozhuan 9 times to 3 at Batch 0 |
| Lüshi Chunqiu | Lushi chunqiu, Lushi Chunqiu, Lü-shih ch'un-ch'iu, Lüshi chunqiu | Annals of Lü Buwei | the glossary slug's form (`Lüshi_Chunqiu`) |
| Liezi | Lie zi, Lieh-tzu, Lieh Tzu | | |
| Shijing | Shi jing, Shih ching, Shih Ching | Classic of Poetry, Book of Songs | English title first |
| Yu gong | Yugong, Yü Kung | Tribute of Yu | English title first |
| Gu Jiegang | Ku Chieh-kang | | |
| Zhou | Chou | | the dynasty; Wade–Giles *Chou* only in a cited title (added for the second hundred, Nov 2026) |
| King Wen, King Wu, King Cheng, King Kang, King Zhao, King Mu, King Li, King Xuan, King You, King Ping | Wen Wang, Wu Wang, King Ch'eng, King Chao, King Hsüan, King Yu of Zhou | Ji Chang, Ji Fa | the Zhou kings: "King" and the posthumous name, English order; Ji Chang and Ji Fa as their own names may follow |
| Duke of Zhou | Duke of Chou, Chou Kung | Zhou Gong, Ji Dan | English title first |
| Houji | Hou Ji, Hou Chi, Hou-chi | Lord Millet | joined |
| Mandate of Heaven | T'ien-ming | Tianming | English name first |
| Tian | | T'ien | the god or heaven; lower case "heaven" in ordinary prose; T'ien unreported, a common Wade–Giles surname (田) in cited authors |
| fengjian | feng-chien, Feng-chien | | lower case in prose as a noun, capitalised as a card's answer |
| zongfa | tsung-fa, Tsung-fa | | lower case in prose |
| Haojing | Hao Jing, Hao-ching | Zongzhou, Hao | joined |
| Chengzhou | Cheng Zhou, Ch'eng-chou | Luoyi, Wangcheng | joined |
| Muye | Mu Ye, Mu-yeh | | |
| Gonghe | Gong He, Kung-ho | | the regency; He, the Earl of Gong, the man |
| Xianyun | Xian Yun, Hsien-yün | | |
| Baosi | Bao Si, Pao Ssu, Pao-ssu | | joined: the live answer and the slug; the `pinyin` field reads Bāosì, as Hòuyì |
| Quanrong | Quan Rong, Ch'üan Jung | Dog Rong | joined |
| Spring and Autumn Annals | Ch'un-ch'iu, Chun Qiu | Chunqiu | English title first; Spring and Autumn period for the age |
| Qi, Jin, Chu, Qin, Lu, Song, Wu, Yue, Wei, Han, Zhao, Yan, Zheng | Ch'i, Ch'in, Ch'u, Chin state, Chao state, Cheng state | | the states: name alone in prose ("the state of Qi" where it could be misread); *Jin* is disambiguated from the later dynasties in the card's own words (`docs/china-card-plan.md`) |
| Wey | | | the small state 衛, written Wey to keep it apart from Wei 魏, as the collection's sources do; say so the first time |
| Guan Zhong | Kuan Chung | Guanzi | never "Guanzhong" (the Wei valley region) |
| Chengpu, Kuiqiu, Maling, Changping | Ch'eng-p'u, Cheng Pu, K'uei-ch'iu, Ma Ling, Chang Ping, Ch'ang-p'ing | | the battles and the covenant |
| Goujian | Gou Jian, Kou-chien | | joined: the live answer and the slug; the `pinyin` field reads Gōujiàn |
| Shang Yang | Shang-yang | Wei Yang, Gongsun Yang, Lord Shang | |
| Li Kui, Wu Qi, Sun Bin, Pang Juan, Bai Qi, Su Qin, Zhang Yi, Li Si, Jing Ke, Han Fei | Li K'uei, Wu Ch'i, Sun Pin, P'ang Chüan, Pai Ch'i, Su Ch'in, Chang I, Li Ssu, Ching K'o, Han Fei-tzu | | the Warring States men, surname and name split |
| King Wuling of Zhao | Wu Ling, Wu-ling | | |
| Jixia Academy | Chi-hsia, Ji Xia | Jixia | |
| Zhanguo Ce | Zhanguoce, Zhan Guo Ce, Zhanguo ce, Chan-kuo ts'e, Chan-kuo Ts'e | Strategies of the Warring States | the glossary slug's form |
| Li Sao | Lisao, Li-sao, Li sao | Encountering Sorrow | |
| Qin Shi Huang | Qin Shihuang, Ch'in Shih-huang, Shih Huang-ti | First Emperor, Shi Huangdi, Ying Zheng | the slug's form; "the First Emperor" in prose is fine |
| Laozi, Zhuangzi, Mozi, Xunzi, Han Feizi, Sunzi | Lao Tzu, Lao-tzu, Lao Zi, Chuang Tzu, Chuang-tzu, Mo Tzu, Mo-tzu, Mo Zi, Hsün Tzu, Hsün-tzu, Xun Zi, Han Fei Zi, Sun Zi | Sun Tzu | the thinkers and their books joined; Confucius and Mencius keep their English names (Kongzi, Mengzi as aliases); *Sun Tzu* is left unreported, the English name of the book's title in many editions |

## Mythology and legend

Filled batch by batch, from the source each row names. A myth is dated by the text that first attests it
(`docs/china-refinement-audit.md`, "Myth register", holds the versions).

| event | the collection says | source |
|---|---|---|
| the *Huainanzi* presented to the throne | 139 BCE | Zürn, review of Queen and Puett (`cnh-004`, `cnh-018`) |
| the *Shiji* written (the first full telling of Zhuolu) | c. 100 BCE | Chavannes; Hanmo Zhang 2017 (`cnh-009`) |
| the Three Sovereigns recalled at the Qin court; the First Emperor's title | 221 BCE | Mayers; the *Shiji*, Qin annals (`cnh-002`) |
| Pangu first attested (Wei Zhao's fragment, Xu Zheng) | c. 200 – 300 CE | Lü Zongli; Kalinowski (`cnh-003`) |
| Nüwa: Wei–Jin tomb murals / the Buddhist jewel between the deities at Pingcheng | 220 – 316 CE / 435 CE | Zhao 2019; Ou Li-chuan (`cnh-004`) |
| Fuxi: traditional reign opening / also dated | 3322 BCE / 2852 BCE | Legge; Mayers (`cnh-005`) |
| the *Yijing*'s commentaries (Fuxi's trigrams, Shennong's plough) | c. 500 – 100 BCE | Stanford Encyclopedia (`cnh-005`, `cnh-006`) |
| Shennong: traditional date / the *Shennong bencao jing* compiled | 2737 BCE / 25 – 220 CE | Mayers; the SEP (`cnh-006`) |
| Chiyou: placed by the chronologers (protected line) | c. 2700 – 2600 BCE | Legge (`cnh-008`) |
| Yao's accession in the later traditional chronology (protected line) | 2357 BCE | Bodde; Mayers (`cnh-010`) |
| the *Shanhaijing*: no single date — its oldest parts c. 400 – 300 BCE in one account; existing by c. 100 BCE | c. 400 – 300 BCE / c. 100 BCE | Dorofeeva-Lichtmann; the BEFEO account (`cnh-017`, `cnh-019`, `cnh-020`) |
| the Bin Gong xu cast (the earliest mention of Yu and the flood) | c. 900 – 800 BCE | Cook 2013; Chen 2019 (`cnh-012`, `cnh-013`) |
| Chang'e first told in full (the *Huainanzi*) | 139 BCE | `cnh-015` |
| the Queen Mother: the *Zhuangzi* / the mass cult / Han grave art | c. 400 – 300 BCE / 3 BCE / 206 BCE – 220 CE | `cnh-020` |
| Kunlun: first attested / Han accounts | c. 400 – 300 BCE / 206 BCE – 220 CE | `cnh-019` |
| Shun's accession in the great annals' system (protected line) / the *Bamboo Annals*' | 2255 BCE / 2042 BCE | `cnh-011` |
| the Xia opens in the received systems (protected line) | 2205 BCE / 1989 BCE | `cnh-012` |
| Houyi placed under Ku / under Taikang (protected line) | 2436 BCE / 2188 BCE | Giles (`cnh-014`) |
| Kuafu placed in the Yellow Emperor's age (protected line) | c. 2697 BCE | Mayers (`cnh-016`) |
| Penglai first attested (the *Shiji* finished) | c. 91 BCE | Mayers (`cnh-021`) |
| the Eight Immortals grouped: the Yuan / also dated, the late Southern Song | 1271 – 1368 / c. 1250 – 1279 | Hu Yinglin, via the sources of `cnh-022` |
| the Xishuipo clamshell dragon | c. 6,400 years ago | `cnh-023` |
| the fenghuang: official cult (Huo Guang) / last reported | 84 BCE / 1368 | `cnh-024` |
| the lin caught: the last entry of the *Spring and Autumn Annals* / the *Shuowen* | 481 BCE / c. 100 CE | Chavannes; Legge (`cnh-025`) |
| the Four Symbols: the Zeng Hou Yi lacquer box / the full set | c. 433 BCE / c. 200 – 100 BCE | Hubei Museum; the *Huainanzi* (`cnh-026`) |
| the taotie face first cast (Erligang) | c. 1500 – 1300 BCE | Bagley 2006 (`cnh-027`) |
| the *Shanhaijing* begun (one view) | c. 300 – 200 BCE | `cnh-028` |
| the *Chuci*: the core poems / gathered by Liu Xiang | c. 300 BCE / c. 77 – 6 BCE | `cnh-029` |
| the Jade Emperor: the cult founded / also dated | 1012 / 1116 | `cnh-030` |
| the ten courts take shape (the *Scripture on the Ten Kings*) | c. 800 – 1000 CE | the Met record; Zhang 2008 (`cnh-032`) |
| the first court sacrifice to the stove | c. 133 BCE | Chavannes (`cnh-033`) |
| the door gods attested (the *Lunheng*) | 76 – 84 CE | Forke (`cnh-034`) |
| the zodiac animals attested (Shuihudi daybook) / years named by animals | c. 217 BCE / c. 100 CE | the Shuihudi daybook project; Hong Kong Observatory (`cnh-035`) |
| the Cowherd and the Weaver Girl: the stars / the lovers | c. 800 BCE / c. 100 – 200 CE | Laing; Ouyang (`cnh-036`) |
| the White Snake: the earliest tale / printed / the first play | c. 1200 – 1400 / 1624 / 1738 | `cnh-037` |
| Mazu: traditional life / first honoured / named Tianfei / UNESCO listing | 960 – 987 CE / 1122 / 1281 / 30 September 2009 | the *Tianfei xiansheng lu*; Yao 2015 (`cnh-038`) |
| Guan Yu dies / made a god / named a sage (protected line) | 219 CE / 1594 / 1856 | `cnh-039`; one study dates the Wanli title 1614 |
| the legendary period: Fuxi's traditional year / the first sure year | 2852 BCE / 841 BCE | Mayers (`cnh-040`) |

## Neolithic and the Xia

| event | the collection says | source |
|---|---|---|
| the Neolithic: domestication / the Late Neolithic | c. 8000 – 6000 BCE / c. 2500 – 2000 BCE | Lee et al. 2007; Stevens et al. 2024 (`cnh-041`) |
| the earliest pottery (Xianrendong, Upper Palaeolithic) | 20,000 – 12,000 BP | `cnh-041`, `cnh-051` |
| Peiligang culture / also dated | c. 9000 – 7000 BP / c. 9000 – 7500 BP | the cal BP of `cnh-042`'s sources 2 and 3 |
| rice grown (Shangshan) / millet grown / the first fields | c. 9400 BP / c. 5800 BCE / c. 6000 BP | `cnh-043` |
| Jiahu lived in / excavated / re-excavated | c. 7000 – 5500 BCE / 1984 – 1987 / 2001 | `cnh-044` |
| Yangshao culture / also dated | c. 5000 – 3000 BCE / c. 5000 – 2700 BCE | Li et al.; Xiong et al. (`cnh-045`) |
| Banpo first settled / excavated | c. 4800 BCE / 1954 – 1957 | the Banpo Museum (`cnh-046`) |
| Hongshan culture / its ritual peak | c. 4500 – 3000 BCE / c. 5800 – 5300 BP | Ning; Drennan et al.; Xu (`cnh-047`) |
| Liangzhu culture | c. 3300 – 2300 BCE | `cnh-048` |
| Liangzhu jade / also dated | c. 3300 – 2200 BCE / c. 3200 – 2000 BCE | the Cleveland Museum; Liu 2003 (`cnh-049`) |
| Longshan culture / also dated | c. 3000 – 1900 BCE / c. 2600 – 1900 BCE | Yang 2019; Underhill 1994 (`cnh-050`) |
| the earliest pottery / diverse forms / painted wares | c. 20,000 – 19,000 BP / c. 9000 – 7000 BP / c. 5000 – 3000 BCE | `cnh-051` |
| Sanxingdui in use / pits filled / pits found | c. 1700 – 1000 BCE / c. 1200 – 1000 BCE / 1986 | PNAS 2026; Bagley (`cnh-053`) |
| the Xia: traditional opening / the *Bamboo Annals*' / reconstructed (the Chronology Project) | 2205 BCE / 1989 BCE / c. 2070 – 1600 BCE | `cnh-054`; protected lines `cnh-012`, `cnh-055`, `cnh-057`, `cnh-058` |
| the *Tribute of Yu* written | c. 500 – 200 BCE | Dorofeeva-Lichtmann 2021 (`cnh-056`) |
| the Songs of the Five Sons first attested (Mei Ze's copy) | 317 – 322 CE | `cnh-059` |
| the *Bamboo Annals* compiled / found | c. 299 BCE / 279 CE | `cnh-060` |
| the Doubting Antiquity School: Gu Jiegang's letter / the first *Gushi bian* volume | 1923 / 1926 | Chen Minzhen 2019; Hummel (`cnh-061`) |
| Erlitou culture / also dated | c. 1800 – 1530 BCE / c. 1900 – 1500 BCE | Xie 2020; Liu 2003 (`cnh-062`) |
| the Erlitou site occupied / found | c. 1750 – 1530 BCE / 1959 | Xie et al.; Lee (`cnh-063`) |
| Erlitou's foundry / its first bronze vessels | c. 1800 – 1700 BCE / c. 1700 – 1600 BCE | Liu 2003 (`cnh-064`) |
| the Chronology Project: ran / results / full report | 1996 – 2000 / 9 November 2000 / 2022 | Shaughnessy 2023; Lee (`cnh-065`) |

## Shang

| event | the collection says | source |
|---|---|---|
| the Shang (the Chronology Project's) and its phases | c. 1600 – 1046 BCE; early c. 1600 – 1400, middle c. 1400 – 1250, late c. 1250 – 1050 BCE | `cnh-066` |
| the Basic Annals of Yin written | c. 100 BCE | `cnh-067` |
| Tang of Shang (protected line) | c. 1600 BCE, in tradition | `cnh-068` |
| Yinxu occupied / the first seasons / World Heritage | c. 1250 – 1046 BCE / 1928 – 1937 / 2006 | Niu 2018; Chang 1986 (`cnh-069`) |
| Shang bronze inscriptions cast | c. 1300 – 1046 BCE | `cnh-070` |
| oracle bone script in use / identified | c. 1250 – 1046 BCE / 1899 | Liu et al. 2021 (`cnh-071`) |
| Shang divination inscribed | c. 1250 – 1046 BCE | `cnh-072` |
| Wu Ding (protected line) / the eclipses | c. 1250 – 1192 BCE / 1201 – 1181 BCE | the Chronology Project (`cnh-073`) |
| Fu Hao's death (protected line) / her tomb buried / excavated | c. 1200 BCE / c. 1250 – 1192 BCE / 1976 | `cnh-074`, `cnh-075` |
| Shang kingship / Shangdi first attested / ancestor worship recorded | c. 1600 – 1046 BCE / c. 1250 BCE / c. 1250 – 1046 BCE | `cnh-076`, `cnh-077`, `cnh-078` |
| human sacrifice in the late Shang record / Xibeigang in use | c. 1250 – 1046 BCE | `cnh-079`, `cnh-080` |
| Chinese ritual bronzes made / piece-mould casting's main use | c. 1600 – 221 BCE / c. 1600 – 256 BCE | `cnh-081`, `cnh-082` |
| the ding first in bronze / the first four-legged ding | c. 1700 – 1600 BCE / c. 1640 – 1400 BCE | `cnh-083` |
| Shang bronze decoration: dense patterns / high relief | c. 1500 – 1300 BCE / c. 1200 BCE | `cnh-084` |
| Shang jade made / the late Shang | c. 1600 – 1046 BCE / c. 1250 – 1046 BCE | `cnh-085` |
| the chariot in Shang China | c. 1200 – 1046 BCE | Rawson et al. 2020 (`cnh-086`) |
| Shang warfare recorded / the Shang seats / the last seat | c. 1250 – 1046 BCE / c. 1600 – 1046 BCE / c. 1250 – 1046 BCE | `cnh-087`, `cnh-088` |
| Zhengzhou Shang City in use (radiocarbon) / found | c. 1509 – 1315 BCE / 1950 | `cnh-089` |
| Panlongcheng / found | c. 1500 – 1300 BCE / 1954 | `cnh-090` |
| Shang agriculture / the countryside | c. 1600 – 1046 BCE | `cnh-091`, `cnh-092` |
| the Shang calendar attested / eclipses seen | c. 1250 – 1046 BCE / 1201 – 1181 BCE | `cnh-093` |
| Shang writing / the first modern shapes (clerical script) | c. 1250 – 1046 BCE / c. 200 BCE | `cnh-094` |
| the Shang exchange sphere / chariots arrive | c. 1500 – 1000 BCE / c. 1200 BCE | `cnh-095` |
| Shang bronze / radiogenic lead arrives | c. 1600 – 1046 BCE / c. 1400 BCE | `cnh-096` |
| cowries in use / their peak | c. 3300 BCE – 220 CE / c. 1600 – 650 BCE | Peng and Zhu 1995 (`cnh-097`) |
| Shang music attested (Feng's end date) | c. 1300 – 1050 BCE | `cnh-098` |
| the Anyang workshops / Shang burial practice | c. 1250 – 1046 BCE | `cnh-099`, `cnh-100` |

## Western Zhou, Eastern Zhou and Qin (the second hundred)

Filled batch by batch from `cnh-101` (B11 on). **The protected lines** of the second hundred's individuals
(`cnh-102`, `113`–`115`, `132`, `133`, `135`–`137`, `147`–`149`, `151`, `159`, `166`–`168`, `174`, `182`, `186`, `189`,
`192`, `195`) are pinned below to their lines as they stood on main on 2026-11-12, and are not rows of this table.

| event | the collection says | source |
|---|---|---|
| Shang royal women attested (Wu Ding to the conquest) | c. 1250 – 1046 BCE | Lee 2002 (`cnh-101`) |
| the fall of the Shang: the Project / Nivison / Liu Xin | 1046 BCE / 1040 BCE / 1122 BCE | `cnh-103` |
| Muye: the Project / one reading of the Li gui / traditional | 1046 BCE / 1044 BCE / 1122 BCE | Lee 2002 (`cnh-104`) |
| the Zhou account composed (the Western Zhou chapters) | c. 1046 – 771 BCE | Schaberg; Lee (`cnh-105`) |
| the Shang in later memory: the Shiji / the bones identified | c. 100 BCE / 1899 | `cnh-106` |
| the oracle-bone archives inscribed | c. 1250 – 1046 BCE | `cnh-107` |
| Shang chronology: conventional / Liu Xin's end / the eclipses | c. 1600 – 1046 BCE / 1122 BCE / 1201 – 1181 BCE | Pankenier (`cnh-108`) |
| first chariots beyond the Urals / wheat in central China / the chariot in China | c. 2000 – 1800 BCE / c. 1500 BCE / c. 1200 BCE | `cnh-109` |
| the first securely dated year | 841 BCE | `cnh-110` |
| the Zhou dynasty / Western / Eastern | c. 1046 – 256 BCE / c. 1046 – 771 BCE / 770 – 256 BCE | `cnh-111` |
| the Western Zhou / the first dated year / the capital lost | c. 1046 – 771 BCE / 841 BCE / 771 BCE | `cnh-112` |
| the Three Guards rise | c. 1042 BCE (no end year in any source read) | `cnh-116` |
| the Mandate attested / recast under the Western Han | c. 1046 – 771 BCE / 206 BCE – 8 CE | `cnh-117` |
| the Shuowen's definition of tian / presented | 100 CE / 121 CE | Legge (`cnh-118`) |
| fengjian practised | c. 1046 – 771 BCE | `cnh-119` |
| the eastern colonies under the kings / as rival states | c. 1046 – 771 BCE / 770 – 221 BCE | `cnh-120` |

## Later periods

To be filled from `cnh-201` on.

## Chronology pins

The figures each refined card's date line must carry. One line per card, `cnh-NNN: figure; figure`. Only a
figure that is on the date line is pinned. **A protected card is pinned to its line as it stands** — the pin
records what the other thread wrote, so a draft that drops one of its figures from the line is caught.

```chronology-pins
cnh-002: 221
cnh-003: 200; 300
cnh-004: 139; 220; 316; 435
cnh-005: 3322; 2852; 500; 100
cnh-006: 2737; 500; 100; 25; 220
cnh-008: 2700; 2600
cnh-009: 100
cnh-010: 2357
cnh-011: 2255
cnh-012: 2205; 1989
cnh-014: 2436; 2188
cnh-013: 900; 800
cnh-015: 139
cnh-016: 2697
cnh-017: 100
cnh-018: 139
cnh-019: 400; 300; 206; 220
cnh-020: 400; 300; 3; 206; 220
cnh-021: 91
cnh-022: 1271; 1368; 1250; 1279
cnh-023: 6,400
cnh-024: 84; 1368
cnh-025: 481; 100
cnh-026: 433; 200; 100
cnh-027: 1500; 1300
cnh-028: 300; 200
cnh-029: 300; 77; 6
cnh-030: 1012; 1116
cnh-032: 800; 1000
cnh-033: 133
cnh-034: 76; 84
cnh-035: 217; 100
cnh-036: 800; 100; 200
cnh-037: 1200; 1400; 1624; 1738
cnh-038: 960; 987; 1122; 1281; 2009
cnh-039: 219; 1594; 1856
cnh-040: 2852; 841
cnh-041: 8000; 6000; 2500; 2000
cnh-042: 9000; 7000; 7500
cnh-043: 9400; 5800; 6000
cnh-044: 7000; 5500; 1984; 1987; 2001
cnh-045: 5000; 3000; 2700
cnh-046: 4800; 1954; 1957
cnh-047: 4500; 3000; 5800; 5300
cnh-048: 3300; 2300
cnh-049: 3300; 2200; 3200; 2000
cnh-050: 3000; 2600; 1900
cnh-051: 20,000; 19,000; 9000; 7000; 5000; 3000
cnh-053: 1700; 1000; 1200; 1986
cnh-054: 2205; 1989; 2070; 1600
cnh-055: 2070; 1600
cnh-056: 500; 200
cnh-057: 2070; 1600
cnh-058: 2070; 1600
cnh-059: 317; 322
cnh-060: 299; 279
cnh-061: 1923; 1926
cnh-062: 1800; 1530; 1900; 1500
cnh-063: 1750; 1530; 1959
cnh-064: 1800; 1700; 1600
cnh-065: 1996; 2000; 2022
cnh-066: 1600; 1046; 1400; 1250; 1050
cnh-067: 100
cnh-068: 1600
cnh-069: 1250; 1046; 1928; 1937; 2006
cnh-070: 1300; 1046
cnh-071: 1250; 1046; 1899
cnh-072: 1250; 1046
cnh-073: 1250; 1192; 1201; 1181
cnh-074: 1200
cnh-075: 1250; 1192; 1976
cnh-076: 1600; 1046
cnh-077: 1250
cnh-078: 1250; 1046
cnh-079: 1250; 1046
cnh-080: 1250; 1046
cnh-081: 1600; 221
cnh-082: 1600; 256
cnh-083: 1700; 1600; 1640; 1400
cnh-084: 1500; 1300; 1200
cnh-085: 1600; 1046; 1250
cnh-086: 1200; 1046
cnh-087: 1250; 1046
cnh-088: 1600; 1250; 1046
cnh-089: 1509; 1315; 1950
cnh-090: 1500; 1300; 1954
cnh-091: 1600; 1046
cnh-092: 1600; 1046
cnh-093: 1250; 1046; 1201; 1181
cnh-094: 1250; 1046; 200
cnh-095: 1500; 1000; 1200
cnh-096: 1600; 1046; 1400
cnh-097: 3300; 220; 1600; 650
cnh-098: 1300; 1050
cnh-099: 1250; 1046
cnh-100: 1250; 1046
cnh-102: 1105; 1075; 1046
cnh-113: 1112; 1100; 1050
cnh-114: 1097; 1046; 1043
cnh-115: 1042; 1035
cnh-132: 992; 976; 922
cnh-133: 877; 841; 828
cnh-135: 827; 782
cnh-136: 795; 781; 780; 771
cnh-137: 781; 779; 771
cnh-147: 685; 643; 650
cnh-148: 720; 685; 645; 656
cnh-149: 696; 654; 636; 632; 628
cnh-151: 613; 591; 606
cnh-159: 496; 465; 473; 472
cnh-166: 455; 407; 395
cnh-167: 424; 387; 403
cnh-168: 390; 340; 338
cnh-174: 325; 299; 307; 295
cnh-182: 332; 280; 258
cnh-186: 332; 314; 295
cnh-189: 227
cnh-192: 259; 247; 221; 210
cnh-195: 280; 214; 208
cnh-101: 1250; 1046
cnh-103: 1046; 1040; 1122
cnh-104: 1046; 1044; 1122
cnh-105: 1046; 771
cnh-106: 1046; 100; 1899
cnh-107: 1250; 1046
cnh-108: 1600; 1046; 1122; 1201; 1181
cnh-109: 1250; 1046; 2000; 1800; 1500; 1200
cnh-110: 1250; 1046; 100; 841
cnh-111: 1046; 256; 771; 770
cnh-112: 1046; 771; 841
cnh-116: 1042
cnh-117: 1046; 771; 206; 8
cnh-118: 1046; 771; 100
cnh-119: 1046; 771
cnh-120: 1046; 771; 770; 221
```
