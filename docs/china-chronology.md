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

## Mythology and legend

Filled batch by batch, from the source each row names. A myth is dated by the text that first attests it
(`docs/china-refinement-audit.md`, "Myth register", holds the versions).

| event | the collection says | source |
|---|---|---|

## Neolithic and the Xia

| event | the collection says | source |
|---|---|---|

## Shang

| event | the collection says | source |
|---|---|---|

## Later periods

To be filled from `cnh-101` on.

## Chronology pins

The figures each refined card's date line must carry. One line per card, `cnh-NNN: figure; figure`. Only a
figure that is on the date line is pinned. **A protected card is pinned to its line as it stands** — the pin
records what the other thread wrote, so a draft that drops one of its figures from the line is caught.

```chronology-pins
cnh-008: 2700; 2600
cnh-010: 2357
cnh-011: 2255
cnh-012: 2205; 1989
cnh-014: 2436; 2188
cnh-016: 2697
cnh-039: 219; 1594; 1856
cnh-055: 2070; 1600
cnh-057: 2070; 1600
cnh-058: 2070; 1600
cnh-068: 1600
cnh-073: 1250; 1192; 1201; 1181
cnh-074: 1200
```
