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
| Fan Ju | Fan Chü | Fan Sui | the Qin minister of "befriend the distant, attack the near"; the *Shiji* writes 範睢, read Fan Sui by some (added B17) |
| Jixia Academy | Chi-hsia, Ji Xia | Jixia | |
| Zhanguo Ce | Zhanguoce, Zhan Guo Ce, Zhanguo ce, Chan-kuo ts'e, Chan-kuo Ts'e | Strategies of the Warring States | the glossary slug's form |
| Li Sao | Lisao, Li-sao, Li sao | Encountering Sorrow | |
| Qin Shi Huang | Qin Shihuang, Ch'in Shih-huang, Shih Huang-ti | First Emperor, Shi Huangdi, Ying Zheng | the slug's form; "the First Emperor" in prose is fine |
| Laozi, Zhuangzi, Mozi, Xunzi, Han Feizi, Sunzi | Lao Tzu, Lao-tzu, Lao Zi, Chuang Tzu, Chuang-tzu, Mo Tzu, Mo-tzu, Mo Zi, Hsün Tzu, Hsün-tzu, Xun Zi, Han Fei Zi, Sun Zi | Sun Tzu | the thinkers and their books joined; Confucius and Mencius keep their English names (Kongzi, Mengzi as aliases); *Sun Tzu* is left unreported, the English name of the book's title in many editions |
| Shuihudi, Liye, Zhangjiashan, Juyan, Mawangdui | Shui-hu-ti, Shuihu Di, Li Ye, Chang-chia-shan, Chü-yen, Ma Wang Dui, Ma-wang-tui | | the excavated archives and tombs, joined (added for the third hundred, Nov 2026) |
| Meng Tian, Xu Fu, Zhao Gao, Huhai, Fusu, Chen Sheng, Wu Guang, Ziying | Meng T'ien, Hsü Fu, Chao Kao, Hu Hai, Fu Su, Ch'en Sheng, Tzu-ying, Zi Ying | Xu Shi, Qin Er Shi, the Second Emperor | the Qin's end; *Xu Shi* is the *Shiji*'s own other writing of Xu Fu, legitimate in a quotation |
| Lingqu | Ling Qu, Ling-ch'ü | Xing'an Canal | joined, as the slug |
| Xiang Yu, Liu Bang, Fan Zeng, Zhang Liang, Han Xin, Xiao He, Xiang Zhuang | Hsiang Yü, Liu Pang, Fan Tseng, Chang Liang, Han Hsin, Hsiao Ho | | the Chu–Han contention |
| Hong Gate, Gaixia | Hongmen (as a name in English prose), Hung-men, Kai-hsia, Gai Xia | Hongmen | English name first for the feast (the slug `Feast_at_Hong_Gate`); *Hongmen* may follow as its Chinese name |
| Emperor Gaozu, Emperor Hui, Emperor Wen, Emperor Jing, Emperor Wu, Emperor Zhao, Emperor Xuan, Emperor Yuan, Emperor Cheng, Emperor Ai, Emperor Ping, Emperor Guangwu, Emperor Ming, Emperor Zhang, Emperor He, Emperor Ling, Emperor Xian | Kao-tsu, Kao-ti, Wu-ti, Wen-ti, Ching-ti, Kuang-wu, Hsien-ti, Ling-ti | Han Gaozu, Gaodi, Han Wudi, Wudi, Liu Bang, Liu Che, Liu Xiu, Liu Xie | the Han emperors: "Emperor" and the posthumous name, English order; the joined Chinese forms (Han Wudi) are legitimate where a cited title or the `pinyin` field uses them |
| Empress Lü | Empress Lu, Lü Hou, Lu Hou | Lü Zhi, Empress Dowager Lü | with ü in prose |
| Xiongnu | Hsiung-nu, Hiung-nu, Xiong Nu, Xiong-nu | Huns (only where a source makes the comparison) | joined, as the slug |
| chanyu | Ch'an-yü, Shan-yü, Shan-yu | shanyu | the Xiongnu ruler's title, lower case in prose; *shanyu* is a common reading of 單于 in English scholarship and is not reported |
| Modu | Mao-tun, Mo-tun | Maodun, Modun | the slug's form (`Modu_Chanyu`) |
| heqin | ho-ch'in, He Qin, Heqin (mid-sentence) | | lower case in prose |
| Huo Qubing, Wei Qing, Zhang Qian, Li Guangli, Ban Chao, Ban Gu, Ban Zhao, Ban Biao, Dong Zhongshu, Sang Hongyang, Cai Lun, Zhang Heng, Liang Ji | Huo Ch'ü-ping, Wei Ch'ing, Chang Ch'ien, Li Kuang-li, Pan Ch'ao, Pan Ku, Pan Chao, Tung Chung-shu, Sang Hung-yang, Ts'ai Lun, Chang Heng, Liang Chi | | the Han men and women, surname and name split |
| Chang'an, Luoyang | Changan, Ch'ang-an, Chang-an, Lo-yang, Loyang, Luo Yang | | the two capitals; the apostrophe in Chang'an |
| Western Regions | Hsi-yü | Xiyu | English name first |
| Silk Road | | Silk Roads, Seidenstrasse | the modern label (Richthofen, 1877) said so where it matters |
| Hexi Corridor, Nanyue, Dunhuang, Jiuquan, Zhangye, Wuwei | Ho-hsi, Nan-yüeh, Nam Viet, Tun-huang, Chiu-ch'üan | Nam Việt | |
| Shiji, Hanshu, Hou Hanshu, Sanguozhi | Han-shu, Hou Han Shu, Hou-Han-shu, San guo zhi, Sanguo zhi, Sanguo Zhi, San-kuo chih | Hou Han shu | English title first (Book of Han, Book of the Later Han, Records of the Three Kingdoms); the Chinese title joined; *Hou Han shu* is the slug's title and not reported |
| Pei Songzhi | P'ei Sung-chih, Pei Song Zhi | | his notes to the *Sanguozhi* (429 CE) |
| Wang Mang, Liu Xiu, Liu Xin | Liu Hsiu, Liu Hsin | | |
| Red Eyebrows, Lülin, Kunyang | Ch'ih-mei, Chimei, Lu Lin, Lulin, K'un-yang | | English name first for the Red Eyebrows |
| Taixue | T'ai-hsüeh, Tai Xue | Imperial University | English name first where the card says so |
| Yellow Turbans, Zhang Jue, Dong Zhuo, Yuan Shao, Lü Bu | Huang-chin, Chang Chüeh, Zhang Jiao, Tung Cho, Yüan Shao, Lu Bu | Zhang Jiao | *Zhang Jiao* is a common reading of 張角 and is an alias, not reported |
| Cao Cao, Cao Pi, Liu Bei, Zhuge Liang, Sun Quan, Sun Jian, Sun Ce, Sun Hao, Sima Yi, Sima Yan, Guan Yu, Zhang Fei, Zhou Yu, Lu Su, Lu Xun (Wu general) | Ts'ao Ts'ao, Tsao Tsao, Caocao, Ts'ao P'i, Liu Pei, Chu-ko Liang, Zhuge-Liang, Sun Ch'üan, Ssu-ma I, Ssu-ma Yen, Chang Fei, Chou Yü, Lu Hsün | Kongming, Mengde, Yunchang, Xuande | the Three Kingdoms men, surname and name split; Zhuge is one surname |
| Cao Wei, Shu Han, Eastern Wu | Ts'ao Wei, Shu-Han, Shuhan, Dong Wu | Wei, Shu, Wu | the slugs' forms; Wei, Shu and Wu alone where the sentence is plainly about the three states |
| Guandu, Red Cliffs, Wuzhang Plains, Yiling | Kuan-tu, Chibi (in English prose), Ch'ih-pi, Wu-chang | Chibi | English name first for Red Cliffs; *Chibi* may follow |
| tuntian, zhantian | t'un-t'ien, Tun Tian, chan-t'ien | | lower case in prose |
| nine-rank system | Jiupin Zhongzheng (in English prose) | jiupin zhongzheng | English name first |
| Romance of the Three Kingdoms | San-kuo yen-i, Sanguo yanyi (in English prose) | Sanguo yanyi | English title first; *Sanguo yanyi* may follow |
| Jin (the dynasty of 266 – 420) | Chin dynasty | Western Jin, Eastern Jin | disambiguated from the state of Jin and the Jurchen Jin in the card's own words (`docs/china-card-plan.md`) |
| qingtan, menfa | ch'ing-t'an, men-fa | | lower case in prose |
| Seven Sages of the Bamboo Grove, Ji Kang, Ruan Ji, Shan Tao, Xiang Xiu, Liu Ling, Ruan Xian, Wang Rong | Chi K'ang, Juan Chi, Xi Kang | Xi Kang | *Xi Kang* is a common reading of 嵇康 and is an alias |
| Disaster of Yongjia, Emperor Huai, Emperor Min | Yung-chia, Huai-ti, Min-ti | Yongjia disaster, Jin Huaidi, Jin Mindi | the fall of the Western Jin (added for the fourth hundred, Nov 2026) |
| Sixteen Kingdoms, Five Barbarians | Shih-liu kuo, Wu Hu (in English prose) | Shiliu guo, Wu Hu, Five Hu | English names first; both are later labels, said so where it matters |
| Jie, Xianbei, Di, Qiang | Chieh, Hsien-pei, Xian-bei, Xian Bei, Ch'iang | | the peoples of the Five Barbarians with the Xiongnu (row above); never "Ti" for the Di |
| Han-Zhao, Later Zhao, Former Yan, Later Yan, Former Qin, Later Qin, Former Liang, Cheng-Han | Hou Zhao, Hou Chao, Ch'ien Yen, Ch'ien Ch'in, Former Ch'in, Later Ch'in, Ch'eng-Han | Northern Han, Han Zhao, Hanzhao | the Sixteen Kingdoms states, English order (Later, Former) |
| Liu Yuan, Liu Cong, Liu Yao, Shi Le, Shi Hu, Fu Jian, Fu Hong, Wang Meng, Murong Huang, Murong Jun, Murong Ke, Murong Chui, Yao Chang | Liu Ts'ung, Shih Le, Shih Hu, Fu Chien, Mu-jung, Mu Rong | Shi Jilong | the Sixteen Kingdoms rulers and ministers, surname and name split; Murong is one surname |
| Fei River, Fotudeng, Kumarajiva | Fei Shui, Fei-shui, Fo-t'u-teng, Fo Tu Deng, Fotu Deng | Feishui, Fotucheng | |
| Jiankang | Chien-k'ang, Jian Kang | Jianye, Nanjing | the southern capital (Jianye under Wu) |
| lodged commanderies | ch'iao-chün | qiaojun | English name first |
| Eastern Jin, Wang Dao, Zu Ti, Huan Wen, Xie An, Xie Xuan, Wang Xizhi, Tao Yuanming, Gu Kaizhi, Liu Yu | Tung Chin, Tsu T'i, Hsieh An, Hsieh Hsüan, Wang Hsi-chih, T'ao Yüan-ming, Ku K'ai-chih, Liu Yü | Tao Qian, Emperor Wu of Song | the Eastern Jin men, surname and name split; *Tao Qian* is the poet's other name, an alias |
| Liu Song, Southern Qi, Liang, Chen, Hou Jing, Emperor Wu of Liang | Liu Sung, Southern Ch'i, Nan Qi, Hou Ching, Liang Wu-ti | Xiao Yan, Liang Wudi | the Southern dynasties; Liu Song and Southern Qi as named to keep them from the later Song and the state of Qi |
| Northern Wei, Tuoba, Pingcheng, Emperor Xiaowen, Eastern Wei, Western Wei, Northern Qi, Northern Zhou, Yuwen Tai, Gao Huan | Bei Wei, T'o-pa, Toba, P'ing-ch'eng, Hsiao-wen, Northern Ch'i, Northern Chou, Yü-wen T'ai, Kao Huan | Tabgach, Yuan Wei, Xiaowendi | the Northern dynasties |
| Six Garrisons, equal-field system, fubing | Liu Chen, chün-t'ien, fu-ping, Fu Bing, fu bing | juntian, juntianzhi | lower case in prose for the institutions |
| Yungang Grottoes, Longmen Grottoes | Yun-kang, Yun Gang, Lung-men, Long Men | | |
| Shen Yue, Wen Xuan, Xiao Tong | Shen Yüeh, Wen hsüan, Hsiao T'ung | Wenxuan, Selections of Refined Literature | *Wen Xuan* split, as the live answer |
| Sui, Tang | T'ang | | the dynasties; in the `pinyin` field split from cháo, lower case: Suí cháo, Táng cháo |
| Emperor Wen of Sui, Emperor Yang of Sui, Emperor Gaozu of Tang, Emperor Taizong, Emperor Gaozong, Emperor Xuanzong | Yang-ti, T'ai-tsung, Kao-tsung, Hsüan-tsung | Sui Wendi, Sui Yangdi, Tang Gaozu, Tang Taizong, Yang Jian, Yang Guang, Li Yuan, Li Shimin, Li Longji | the Sui and Tang emperors: "Emperor" and the posthumous or temple name, English order; the joined Chinese forms (Tang Taizong) where the `pinyin` field or a cited title uses them |
| Wu Zetian, Wu Zhou | Wu Tse-t'ien, Wu Chao | Wu Zhao, Empress Wu | *Wu Zhao* is her own name, an alias |
| Kaihuang Code, Tang Code, Zhenguan, Kaiyuan | K'ai-huang, Chen-kuan, K'ai-yüan | | the reign periods named as eras |
| jinshi, mingjing, jiedushi, fanzhen, sabao, koufentian, zuyongdiao, Zhengshitang | chin-shih, ming-ching, chieh-tu-shih, Jie Du Shi, fan-chen, sa-pao, k'ou-fen-t'ien, zu yong diao, zu-yong-diao, tsu-yung-tiao, Cheng-shih-t'ang | | lower case in prose for the degrees, offices and taxes, joined |
| Grand Canal, Goguryeo, Wagang, Li Mi, Yuwen Huaji, Dou Jiande, Wang Shichong | Koguryo, Koguryŏ, Kao-kou-li, Wa-kang, Yü-wen Hua-chi, Tou Chien-te | Gaogouli | *Goguryeo* the Korean collection's form |
| Xuanwu Gate, Anxi Protectorate, West Market | Hsüan-wu, Xuanwumen (in English prose), An-hsi | Xuanwumen, Xishi, Protectorate General to Pacify the West | English names first |
| Yang Guifei, Yang Guozhong, Li Linfu, Gao Xianzhi, An Lushan, Shi Siming | Yang Kuei-fei, Li Lin-fu, Kao Hsien-chih, An Lu-shan, An Lu Shan, Shih Ssu-ming | Yang Yuhuan | |
| Jieli (Illig Qaghan) | Hsieh-li, Chieh-li | Xieli, Illig Qaghan | the Eastern Turkic khagan captured in 630; *Xieli* is the dictionary reading of 頡利 and an alias (added B36) |
| Talas, Tibetan Empire, Uyghur Khaganate, Nanzhao | Uighur, Uigur, Nan-chao, Nan Zhao | Tubo, Tufan, Huihe, Huihu | *Uyghur* the house form, *Tubo* the Chinese name an alias |
| Famen Temple, Xuanzang, Huichang | Fa-men, Hsüan-tsang, Hsuan-tsang, Hiuen Tsiang, Xuan Zang, Hui-ch'ang | Famensi, Tripitaka, Tang Sanzang | the *Journey to the West*'s Tang Sanzang said to be the novel's |
| regulated verse, Li Bai, Du Fu, Bai Juyi, Han Yu, Wang Wei, Yuan Zhen | lü-shih, Li Pai, Tu Fu, Po Chü-i, Bo Juyi, Han Yü, Yüan Chen | lüshi, Li Taibai, Li Po | the Tang poets, surname and name split; *Li Po*, the older English name, is an alias legitimate in an "also known as" sentence |
| Huang Chao, Zhu Wen, Li Keyong, Five Dynasties and Ten Kingdoms, Later Liang, Later Tang, Sixteen Prefectures | Huang Ch'ao, Chu Wen, Li K'o-yung, Hou Liang, Hou T'ang | Zhu Quanzhong, Sixteen Prefectures of Yan and Yun | |
| Later Zhou, Later Jin, Later Han (of the Five Dynasties), Former Shu, Later Shu, Wuyue, Southern Tang, Northern Han, Guo Wei, Chai Rong, Shi Jingtang, Li Yu (of the Southern Tang), Feng Dao, Qian Liu, Wang Jian | Hou Chou, Hou Chin, Ch'ien Shu, Hou Shu, Wu-yüeh, Wu-yue, Nan T'ang, Pei Han, Kuo Wei, Ch'ai Jung, Shih Ching-t'ang, Li Yü, Feng Tao, Ch'ien Liu | Hou Zhou, Hou Jin, Nan Tang, Bei Han, Wu Yue, Shizong of Later Zhou, Li Houzhu, Last Ruler of Southern Tang | the Five Dynasties and Ten Kingdoms states and men (added for the fifth hundred, Nov 2026), English order; *Wuyue* joined as the slug; the Ten Kingdoms a later label, said so where it matters |
| Khitan, Liao, Abaoji, Yelü, Shangjing, Nanjing (the Liao southern capital), Yanjing, Chanyuan, Gaoliang River, Bureau of Military Affairs | Ch'i-tan, Kitan, A-pao-chi, Apaoji, Yeh-lü, Yelu, Shang-ching, Yen-ching, Ch'an-yüan, Shanyuan, Kao-liang | Qidan, Kitai, Cathay, Yelü Abaoji, Taizu of Liao, Supreme Capital, Shumiyuan | the Liao written "the Khitan Liao" the first time in prose; *Yanjing* the Liao southern capital, later Beijing; *Kitai* and *Cathay* the names the Khitan gave China abroad, said so where it matters |
| Emperor Taizu of Song, Emperor Taizong of Song, Emperor Zhenzong, Emperor Renzong, Emperor Shenzong, Emperor Zhezong, Emperor Huizong, Emperor Qinzong, Emperor Gaozong of Song, Emperor Xiaozong | T'ai-tsu, Chen-tsung, Jen-tsung, Shen-tsung, Che-tsung, Hui-tsung, Ch'in-tsung, Hsiao-tsung | Song Taizu, Song Taizong, Song Renzong, Song Shenzong, Song Huizong, Song Gaozong, Song Xiaozong, Zhao Kuangyin, Zhao Kuangyi, Zhao Ji, Zhao Gou | the Song emperors in English order, "Emperor" and the temple name; the joined Chinese forms (Song Taizu) where the `pinyin` field or a cited title uses them; *Zhao Kuangyin* and the others their own names |
| Kaifeng, Hangzhou, Lin'an | K'ai-feng, Kai-feng, Pien-ching, Pien-liang, Hang-chou, Hangchow, Lin-an | Bianjing, Dongjing, Bianliang, Eastern Capital, Kinsay, Quinsai | Kaifeng the Northern Song capital (*Bianjing*, *Dongjing* and *Bianliang* its period names, aliases); *Lin'an* the Southern Song name of Hangzhou, used where the sentence is about the court's seat; *Quinsai* Marco Polo's form |
| Fan Zhongyan, Han Qi, Fu Bi, Ouyang Xiu, Wang Anshi, Sima Guang, Su Shi, Su Xun, Su Zhe, Li Qingzhao, Zhao Mingcheng, Zhu Xi, Cai Jing, Qin Hui, Yue Fei, Bao Zheng, Di Qing, Guo Xi, Bi Sheng, Zhang Zeduan, Shen Kuo, Meng Yuanlao, Wu Zimu | Fan Chung-yen, Ou-yang Hsiu, Ouyang Hsiu, Wang An-shih, Wang Anshih, Su Shih, Su Tung-p'o, Li Ch'ing-chao, Ts'ai Ching, Ch'in Kuei, Qin Gui, Yüeh Fei, Pao Cheng, Kuo Hsi, Pi Sheng, Chang Tse-tuan, Shen Kua | Su Dongpo, Dongpo, Yi'an, Zhuzi, Zhu Zi, Judge Bao, Bao Gong, Ssu-ma Kuang, Chu Hsi | the Song men and women, surname and name split; Ouyang and Sima one surname each; *Su Dongpo* the poet's sobriquet, an alias; *Qin Gui* a misreading of 秦檜 (house Qin Hui); *Ssu-ma Kuang* and *Chu Hsi* stand as authors of cited translations and are not reported |
| Zizhi Tongjian, New Policies, Qingli Reforms, palace examination, jiaozi, huizi, jiaochao, Dongjing Meng Hua Lu, Mengliang lu, Kaibao Canon | Tzu-chih t'ung-chien, Zizhi Tong Jian, Ch'ing-li, Chiao-tzu, Hui-tzu, Chiao-ch'ao, Tung-ching meng-hua lu, Meng-liang lu, K'ai-pao | Zizhi tongjian, Comprehensive Mirror, Comprehensive Mirror for Aid in Government, Xinfa, Qingli xinzheng, dianshi, Kaibao zang | the Song books, reforms and notes; the slugs' forms (*Zizhi Tongjian*, *Dongjing Meng Hua Lu*, *Mengliang lu*); *Zizhi tongjian*, as the fourth hundred wrote it, not reported; the currencies lower case in prose |
| Western Xia, Tangut, Li Yuanhao, Khara-Khoto, Haoshuichuan, Xingqing | Hsi Hsia, Hsi-hsia, Tangout, Li Yüan-hao, Kara-Khoto, Khara Khoto, Kharakhoto, Hao-shui-ch'uan, Hsing-ch'ing | Xixia, Xi Xia, Da Xia, Great Xia, Dangxiang, Minyak, Heishui, Heishuicheng, Emperor Jingzong of Western Xia, Weiming Yuanhao, Zhao Yuanhao | English name first (Western Xia; the `pinyin` field Xī Xià, split as Běi Wèi); *Khara-Khoto* hyphenated as the slug |
| Jurchen, Jurchen Jin, Wanyan Aguda, Wuqimai, meng'an mouke, Da Qi, Caizhou, Yehuling, Hubudagang, Huining, Zhongdu, Emperor Shizong of Jin | Ju-chen, Juchen, Djurchen, Jurched, Wan-yen A-ku-ta, A-ku-ta, Akuta, meng-an mou-k'o, mengan mouke, Ta Ch'i, Ts'ai-chou, Yeh-hu-ling, Hu-pu-ta-kang, Chung-tu | Nüzhen, Great Jin, Da Jin, Emperor Taizu of Jin, Jin Taizu, Jin Shizong, Wanyan Yong, Wuzhu, Wanyan Zongbi | always "the Jurchen Jin" the first time in prose (`docs/china-card-plan.md`), never "the Jin" alone where the Jin of 266 – 420 could be meant; *meng'an mouke* lower case in prose |
| Genghis Khan, Ögedei, Möngke, Kublai Khan, Khanbaliq, Dadu, Shangdu, Karakorum, semu, Phagpa, Bayan of the Baarin, Yelü Chucai, Ayurbarwada, Guo Shoujing, zaju, xingsheng, Marco Polo, John of Montecorvino | Jenghiz, Ogodei, Ogedei, Ögödei, Mongke, Mangu, Khubilai, Qubilai, Kubilai, Khan-baliq, Khanbalik, Ta-tu, Shang-tu, Qaraqorum, se-mu, Pagpa, Phags-pa, Yeh-lü Ch'u-ts'ai, Kuo Shou-ching, tsa-chü, hsing-sheng | Chinggis Khan, Chinggis, Temüjin, Cambaluc, Xanadu, Hubilie, Basiba, Buyantu Khan, Emperor Renzong of Yuan, Yuan Renzong | the Mongols and the Yuan: *Genghis Khan* as the slug (*Chinggis Khan* the scholarly form, an alias for an "also known as" sentence); *Khubilai* and *Qubilai*, the scholarly spellings, cited as printed in titles but *Kublai* in the card's voice; *Khanbaliq* and *Dadu* both house forms, the Turkic-Mongol and the Chinese names of one city; *Xanadu* Coleridge's form, an alias |
| Water Margin, Song Jiang, Romance of the Western Chamber, Wang Shifu, Guan Hanqing, Yingying | Shui-hu chuan, Sung Chiang, Hsi-hsiang chi, Wang Shih-fu, Kuan Han-ch'ing, Ying-ying | Shuihu zhuan, Outlaws of the Marsh, Xixiang ji, The Story of the Western Wing | English titles first |
| Ming, Hongwu Emperor, Jianwen Emperor, Yongle Emperor, Hongxi Emperor, Xuande Emperor, Zhengtong Emperor, Wanli Emperor, Chongzhen Emperor, Zhu Yuanzhang, Zhu Di | Hung-wu, Chien-wen, Yung-lo, Hung-hsi, Hsüan-te, Cheng-t'ung, Wan-li, Ch'ung-chen, Chu Yüan-chang, Emperor Hongwu, Emperor Yongle, Emperor Wanli, Emperor Chongzhen | Hongwu, Yongle, Wanli, Ming Taizu, Ming Chengzu, Zhu Yunwen, Zhu Qizhen, Zhu Youjian, Chu Ti | the Ming emperors (added for the sixth hundred, Nov 2026) by reign title + Emperor, never "Emperor Hongwu"; the reign title alone where a sentence names the era; *Zhu Yuanzhang* and *Zhu Di* their own names; the `pinyin` field Míng cháo for the dynasty |
| Grand Secretariat, Central Secretariat, lijia, haijin, single whip, Embroidered Uniform Guard, Donglin, Hu Weiyong | li-chia, hai-chin, Hai Jin, i-t'iao-pien, Tung-lin, Hu Wei-yung | Neige, Zhongshu sheng, Jinyiwei, yitiaobianfa, Donglin Academy, Donglin faction | the Ming institutions, lower case in prose for *lijia*, *haijin* and the single whip |
| Zheng He, treasure voyages, treasure ships, Tumu Crisis, Esen, wokou | Cheng Ho, Zheng Ho, T'u-mu, Yesen, wakō, Wako, wo-k'ou, Wo-k'ou | Ma He, Sanbao, Tumu incident, Esen Taishi, Japanese pirates | the early Ming; *wokou* lower case in prose |
| Imjin War, Matteo Ricci, Jesuits, Wang Yangming, Li Zicheng, Wei Zhongxian | Li Ma-tou, Wang Yang-ming, Wang Shou-jen, Li Tzu-ch'eng, Wei Chung-hsien | Japanese invasions of Korea, Imjin waeran, Bunroku–Keichō, Wanli Korean campaign, Li Madou, Xitai, Wang Shouren | the late Ming; the Korean and Japanese names of the war are aliases, as in the `ko-` and `jp-` collections |
| Qing, Manchu, Nurhaci, Hong Taiji, Dorgon, Eight Banners, queue, Wu Sangui, Three Feudatories, Koxinga | Nurhachi, Hung Taiji, Dorgun, Wu San-kuei, Wu San-gui, Cheng Ch'eng-kung, Coxinga | Ch'ing, Nurgaci, Huang Taiji, Abahai, Aisin Gioro, Later Jin, Sanfan, Zheng Chenggong, Guoxingye | the Qing conquest; *Koxinga* the English name (as *Confucius*), *Zheng Chenggong* his own name, an alias legitimate in an "also known as" sentence; *Ch'ing* stands in cited titles (Hummel) and is not reported; *Later Jin* Nurhaci's state of 1616, never the Five Dynasties' Later Jin without saying so |
| Kangxi Emperor, Yongzheng Emperor, Qianlong Emperor, Dzungar, amban, Grand Council, Siku Quanshu, Heshen, Hong Liangji | K'ang-hsi, Yung-cheng, Ch'ien-lung, Emperor Kangxi, Emperor Yongzheng, Emperor Qianlong, Kang Xi, Qian Long, Zunghar, Jungar, Djungar, Chün-chi ch'u, Ssu-k'u ch'üan-shu, Ho-shen, Hung Liang-chi | Kangxi, Yongzheng, Qianlong, Xuanye, Yinzhen, Hongli, Oirat, Zungharia, Junjichu, Siku quanshu, Complete Library of the Four Treasuries | the high Qing: reign title + Emperor, never "Emperor Kangxi"; *Siku Quanshu* the slug's form (*Siku quanshu*, as the Kanseki Repository citations name the edition, not reported); *amban* lower case in prose; *Zunghar* stands in cited titles (Perdue) and is not reported there |
| Macartney, Canton System, Canton, Guangzhou, Cohong, Lin Zexu, Opium Wars, Treaty of Nanking, Nanjing | Kwangchow, Kuang-chou, Co-hong, Lin Tse-hsü, Lin Tse-hsu, Treaty of Nanjing, Nan-ching | Lord Macartney, Commissioner Lin, Nanking, Hong merchants, Thirteen Factories | *Canton* the period name of the port in the trade (the Canton System a modern label, said so), *Guangzhou* the city otherwise; the *Treaty of Nanking* by its English title, *Nanjing* the city |
| Hong Xiuquan, Taiping, Nian, Cixi, Li Hongzhang, Zeng Guofan, Zuo Zongtang, Self-Strengthening | Hung Hsiu-ch'üan, Hung Hsiu-chuan, T'ai-p'ing, Nien, Tz'u-hsi, Tzu Hsi, Tsu Hsi, Tzu-hsi, Li Hung-chang, Tseng Kuo-fan, Tso Tsung-t'ang | Taiping Heavenly Kingdom, Taiping Tianguo, Empress Dowager Ci Xi, Yehenara, General Tso, Ziqiang, Yangwu | the nineteenth century; *Nien* stands in cited titles (Teng Ssu-yü) and is not reported there |
| Boxers, Yihetuan, Kang Youwei, Liang Qichao, Hundred Days' Reform | I-ho-ch'üan, I-ho-t'uan, K'ang Yu-wei, Kang Yu-wei, Liang Ch'i-ch'ao, Liang Chi-chao, Hundred Days Reform | Yihequan, Boxer Uprising, Righteous and Harmonious Fists, Wuxu Reform | |
| Sun Yat-sen, Puyi, Yuan Shikai, Chiang Kai-shek, Kuomintang, Whampoa, Beiyang government | Sun Yatsen, Sun Yat Sen, P'u-i, Pu-yi, Yuan Shih-k'ai, Yuan Shih-kai, Chiang Kai-Shek, Kuo-min-tang, Pei-yang | Sun Zhongshan, Sun Wen, Sun Yixian, Pu Yi, Xuantong Emperor, Hongxian Emperor, Jiang Jieshi, Jiang Zhongzheng, Guomindang, KMT, Huangpu | the Republic: *Sun Yat-sen* and *Chiang Kai-shek* the English names (house forms, never reported); *Kuomintang* the slug's form, *Guomindang* the pinyin an alias; *Whampoa* the period name of the academy, *Huangpu* an alias |
| Chen Duxiu, Hu Shi, Lu Xun, New Culture Movement, May Fourth Movement | Ch'en Tu-hsiu, Chen Tu-hsiu, Lu Hsün, Lu Hsun | Hu Shih, Zhou Shuren, New Youth, Xin Qingnian | *Hu Shi* in the card's voice; *Hu Shih*, his own English spelling and the slug, cited as printed (an author's name) and not reported |

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
| Chengzhou founded (one reckoning) / the court moves east | c. 1036 BCE / 770 BCE | `cnh-121` |
| Western Zhou royal ritual / bronze inscriptions cast / zongfa practised | c. 1046 – 771 BCE | `cnh-122`, `cnh-123`, `cnh-125` |
| the ritual reform / its scale in force | c. 850 BCE / c. 850 – 600 BCE | `cnh-124` |
| the Documents: oldest chapters / Fu Sheng's text at court / the stone classics cut / Mei Ze's Old Text | c. 1046 – 771 BCE / 179 – 157 BCE / 175 CE / 317 – 322 CE | Chavannes (`cnh-126`) |
| the Shijing: Maspero / another dating / the Wu envoy hears it in Lu | c. 900 – 500 BCE / c. 1200 – 600 BCE / 543 BCE | `cnh-127` |
| the "double dawn" (the Project's calculation) | 21 April 899 BCE | `cnh-128` |
| the well-field attested (the Mencius) / Wang Mang's revival | c. 380 – 300 BCE / 9 CE | `cnh-129` |
| Western Zhou warfare | c. 1046 – 771 BCE | `cnh-130` |
| the Xianyun: the Duo You ding battle (one dating) / the capital sacked | 816 BCE / 771 BCE | Shaughnessy; Li Feng (`cnh-131`) |
| the Gonghe regency: the Project / Zhang 2023 | 841 – 828 BCE / 850 – 837 BCE | `cnh-134` |
| the sack of Haojing | 771 BCE | `cnh-138` |
| the move east: the received date / Legge's conversion / King Ping's reign | 770 BCE / 769 BCE / 770 – 720 BCE | `cnh-139` |
| the Western Zhou / the hoards buried | c. 1046 – 771 BCE / c. 771 BCE | `cnh-140` |
| the Eastern Zhou: the king's end / the last lord's | 770 – 256 BCE / 770 – 249 BCE | `cnh-141` |
| the Spring and Autumn period: two ends / the chronicle | c. 770 – 475 BCE / 770 – 453 BCE / 722 – 481 BCE | `cnh-142` |
| the Spring and Autumn Annals: the Gongyang and Guliang end / the Zuo end | 481 BCE / 479 BCE | `cnh-143` |
| the Zuo Zhuan completed | c. 300 BCE | `cnh-144` |
| the king wounded at Xuge: the Shiji (Chavannes) / Legge | 707 BCE / 706 BCE | `cnh-145` |
| the first hegemony: the Juan meeting / the Shiji / the royal grant | 680 BCE / 679 BCE / 667 BCE | `cnh-146` |
| Kuiqiu: the Shiji / Legge (cnh-147's protected line) | 651 BCE / 650 BCE | `cnh-147` |
| Chengpu | 632 BCE | `cnh-150` |
| Qi: founded / usurped / the old line ends / conquered | c. 1046 BCE / 386 BCE / 379 BCE / 221 BCE | `cnh-152` |
| Jin: traditional founding / usurped by Quwo / split recognised / ended | 1106 BCE / 678 BCE / 403 BCE / 376 BCE | `cnh-153` |
| Chu: kingship claimed / taken / Ying lost / conquered | c. 886 BCE / 703 BCE / 278 BCE / 223 BCE | `cnh-154` |
| Qin: traditional Feizi / made a lord / capital moved / unification | 897 BCE / 770 BCE / 350 BCE / 221 BCE | `cnh-155` |
| Lu: the chronicle / the duke exiled / destroyed | 722 – 481 BCE / 517 BCE / 249 BCE | `cnh-156` |
| Song: the bid to lead / the peace meeting / destroyed | 641 – 637 BCE / 546 BCE / 286 BCE | `cnh-157` |
| Yue: at war with Wu / overthrown by Chu | 510 – 473 BCE / 333 BCE | `cnh-158` |
| covenants: Kuiqiu (Legge) / the Houma and Wenxian tablets | 650 BCE / c. 442 – 424 BCE | `cnh-160` |
| Spring and Autumn warfare | c. 770 – 475 BCE | `cnh-161` |
| the partition of Jin: divided / recognised / dissolved | 453 BCE / 403 BCE / 376 BCE | `cnh-162` |
| the Warring States: three openings | c. 475 / 453 / 403 – 221 BCE | `cnh-163` |
| the seven states formed / conquered | 403 – 386 BCE / 230 – 221 BCE | `cnh-164` |
| Wei: ascendancy / recognised / destroyed | 424 – 340 BCE / 403 BCE / 225 BCE | `cnh-165` |
| Shang Yang's reforms: first / second decrees | 356 BCE / 350 BCE | `cnh-169` |
| Qin after Shang Yang / royal title / Shu taken | 338 – 221 BCE / 325 BCE / 316 BCE | `cnh-170` |
| Warring States warfare / cavalry adopted in Zhao | c. 475 – 221 BCE / 307 BCE | `cnh-171` |
| the crossbow: first known / common / massed at Maling | c. 500 – 400 BCE / c. 400 – 300 BCE / 341 BCE | `cnh-172` |
| mass infantry: Wu and Yue / in use / Yique and Changping | 506 – 476 BCE / 453 – 221 BCE / 293 BCE, 260 BCE | `cnh-173` |
| iron: oldest casting / wide use | c. 500 BCE / c. 400 – 300 BCE | `cnh-175` |
| coinage: the Guanzhuang mint / unified | c. 640 – 550 BCE / 221 BCE | Zhao et al. 2021 (`cnh-176`) |
| cities: the period / Zhao's capital moved / Linzi sacked | 453 – 221 BCE / 386 BCE / 284 BCE | `cnh-177` |
| the alliances: the league / the joint attack / unification | 333 BCE / 318 BCE / 221 BCE | `cnh-178` |
| Zhang Yi in office in Qin | 328 – 312 BCE | Maspero (`cnh-179`) |
| Maling: the Shiji / the Bamboo Annals | 341 BCE / 343 BCE | `cnh-180` |
| Changping | 260 BCE | `cnh-181` |
| the Jixia: active / peak (Meyer) | c. 356 – 221 BCE / 319 – 284 BCE | `cnh-183` |
| the Four Lords active | c. 299 – 238 BCE | `cnh-184` |
| the Zhanguo Ce compiled / the Song editions | c. 100 – 1 BCE / 1146 – 1147 | Chavannes (`cnh-185`) |
| Qu Yuan's rebuke / King Huai trapped / his death in Qin | 311 BCE / 299 BCE / 296 BCE | Chavannes (`cnh-186`) |
| the Li Sao written / Liu Xiang (the collection) | c. 300 BCE / c. 77 – 6 BCE | `cnh-187` |
| the conquest of the six states (Han 230, Zhao 228, Wei 225, Chu 223, Yan 222, Qi 221) | 230 – 221 BCE | Chavannes (`cnh-188`) |
| the last Zhou king dies / the eastern lord annexed: Hirth / Chavannes | 256 BCE / 249 BCE / 250 BCE | `cnh-190` |
| the Qin dynasty: to the surrender / to the last ruler's year / the revolt | 221 – 206 BCE / 221 – 207 BCE / 209 BCE | `cnh-191` |
| the unification / the title huangdi in use | 221 BCE / 221 BCE – 1912 | `cnh-193`, `cnh-194` |
| fengjian abolished / counties formed in Qin / the edict restated | 221 BCE / 350 BCE / 209 BCE | `cnh-196`, `cnh-197`, `cnh-198` |
| the script ordered uniform | 221 BCE | `cnh-199` |
| Qin law: the Yuelu cases / empire-wide / the Shuihudi tomb | 246 – 222 BCE / 221 – 206 BCE / 217 BCE | `cnh-200` |

## Western Han, Xin, Eastern Han and Three Kingdoms (the third hundred)

Filled batch by batch from `cnh-201` (B21 on). **The protected lines** of the third hundred's individuals
(`cnh-206`, `210`, `215`, `216`, `220`, `223`, `226`, `228`, `229`, `237`, `240`, `246`, `254`, `257`, `259`, `261`–`263`,
`265`, `269`–`272`, `274`, `278`, `280`, `281`, `285`, `286`, `289`, `292`, `294`) are pinned below to their lines as they
stood on main on 2026-11-12 (the years only; ages, days and months left out), and are not rows of this table.

| event | the collection says | source |
|---|---|---|
| the Shuihudi texts: copied (Chen Wei) / buried / found | c. 244 – 217 BCE / c. 217 BCE / 1975 | Wang Xiao; Harkness (`cnh-201`) |
| the burning of the books / the killing of the scholars | 213 BCE / 212 BCE | the *Shiji* (`cnh-202`) |
| the imperial highways / the Straight Road | 220 BCE / 212 BCE | the *Shiji* (`cnh-203`) |
| the Lingqu canal: Aurousseau / completed | c. 219 BCE / 214 BCE | `cnh-204` |
| the conquest of the south / the commanderies | c. 221 – 214 BCE / 214 BCE | `cnh-205` |
| Qin's state wall / Meng Tian's campaign / the imperial wall | 306 – 251 BCE / 215 BCE / 214 BCE | Li et al. 2025; Chavannes (`cnh-207`) |
| the mausoleum begun / the burial / works ended | 246 BCE / 210 BCE / 208 BCE | Zhao et al. 2020; Ma et al. 2016 (`cnh-208`) |
| the Terracotta Army made / found | c. 247 – 210 BCE / 1974 | Quinn et al. (`cnh-209`) |
| the Shaqiu plot | 210 BCE | the *Shiji* (`cnh-211`) |
| the fall of the Qin: the revolt / the surrender / also dated | 209 BCE / 206 BCE / 207 BCE | `cnh-212`, as `cnh-191` |
| the Han dynasty / the throne taken / the Xin interregnum | 206 BCE – 220 CE / 202 BCE / 9 – 23 CE | `cnh-213` |
| the Chu–Han Contention / the Hong Canal treaty | 206 – 202 BCE / 203 BCE | Chavannes (`cnh-214`) |
| the Feast at Hong Gate | 206 BCE | Chavannes (`cnh-217`) |
| Gaixia | 202 BCE | Chavannes (`cnh-218`) |
| the founding settlement | 202 BCE | `cnh-219` |
| the Rule of Wen and Jing / Wen / Jing | 180 – 141 BCE / 180 – 157 BCE / 157 – 141 BCE | Chavannes (`cnh-221`) |
| the Rebellion of the Seven States | 154 BCE | `cnh-222` |
| the Han–Xiongnu wars (the first round) | 133 – 119 BCE | `cnh-224` |
| the Xiongnu empire / the split | c. 209 BCE – 100 CE / 48 CE | Lee 2023; de Crespigny (`cnh-225`) |
| heqin begun / abandoned | c. 200 BCE / 133 BCE | Psarras (`cnh-227`) |
| the Silk Road: the first mission / regular contact / named | c. 138 – 126 BCE / 115 BCE / 1877 | Yang; Giles; Waugh (`cnh-230`) |
| the Hexi Corridor conquered / the first commandery: the annals / the geography treatise | 121 BCE / 121 BCE / 115 BCE | Yu Taishan (`cnh-231`) |
| Nanyue founded / a vassal / annexed | 203 BCE / 196 BCE / 111 BCE | the *Shiji* (`cnh-232`) |
| the Four Commanderies / reduced / the Lelang register / the last lost | 108 BCE / 82 BCE / 45 BCE / 314 CE | `cnh-233` |
| the salt and iron monopoly: Wagner / Chavannes / liquor / suspended | 117 BCE / 119 BCE / 98 BCE / 44 – 41 BCE | `cnh-234` |
| the salt and iron debate / the Discourses compiled | 81 BCE / 74 – 49 BCE | `cnh-235` |
| equable transport: first offices / empire-wide | 115 BCE / 110 BCE | Chavannes (`cnh-236`) |
| the Five Classics posts | 136 BCE | the *Hanshu* (`cnh-238`) |
| the Taixue founded / refounded | 124 BCE / 29 CE | `cnh-239` |
| the Shiji written / Chu Shaosun's additions | c. 100 BCE / 48 – 7 BCE | Chavannes (`cnh-241`) |
| Weiyang Palace built / stormed / World Heritage | 199 – 198 BCE / 23 CE / 2014 | the *Shiji*; Gao et al. (`cnh-242`) |
| regional inspectors / governors / inspectors again / governors again | 106 BCE / 7 BCE / 42 CE / 188 CE | de Crespigny (`cnh-243`) |
| the consort clans: the earliest case / the last Han case | 188 – 180 BCE / 189 CE | Theobald (`cnh-244`) |
| the Xin dynasty (Theobald: 8 CE) | 9 – 23 CE | Petersen; Giles (`cnh-245`) |
| Wang Mang as acting emperor / the throne taken | 6 – 8 CE / 9 CE | the *Hanshu* (`cnh-247`) |
| wangtian decreed | 9 CE | the *Hanshu* (`cnh-248`) |
| the wuzhu struck / abolished / restored / superseded | 118 BCE / 9 CE / 40 CE / 621 CE | Thierry; Lacouperie (`cnh-249`) |
| the Yellow River's course change / river works | 11 CE / 69 CE | Ma et al. (`cnh-250`) |
| the Red Eyebrows rise / surrender | 18 CE / 27 CE | Theobald (`cnh-251`) |
| Kunyang | 23 CE | `cnh-252` |
| the Eastern Han | 25 – 220 CE | Theobald (`cnh-253`) |
| Chengjia proclaimed / fell | 25 CE / 36 CE | the *Hou Hanshu* (`cnh-255`) |
| Luoyang the Han capital | 25 – 190 CE | Bielenstein (`cnh-256`) |
| the Protectorate: Cordier / Yu / revived / abandoned | 60 BCE / 59 BCE / 74 CE / 107 CE | `cnh-258` |
| the Book of Han compiled | c. 54 – 80 CE | Theobald (`cnh-260`) |
| the Filial and Incorrupt instituted / the quota reformed / tests added | 134 BCE / 92 CE / 132 CE | the *Hanshu*; de Crespigny (`cnh-264`) |
| the Partisan Prohibitions: the first arrests / revived / lifted | 166 – 167 CE / 169 CE / 184 CE | `cnh-266` |
| the White Horse Temple (traditional) | 68 CE | `cnh-267` |
| the Yellow Turbans rise / remnants active | 184 CE / 184 – 207 CE | Theobald (`cnh-268`) |
| the Three Kingdoms / three emperors at once | 220 – 280 CE / 229 CE | `cnh-273` |
| Guandu | 200 CE | `cnh-275` |
| Red Cliffs | 208 CE | `cnh-276` |
| Cao Wei founded / ended (de Crespigny) / also dated | 220 CE / 266 CE / 265 CE | `cnh-277` |
| Shu Han founded / surrendered | 221 CE / 263 CE | `cnh-279` |
| the Longzhong plan | 207 CE | `cnh-282` |
| the Northern Expeditions (de Crespigny 1991 ends them in 233) | 228 – 234 CE | `cnh-283` |
| Eastern Wu independent / imperial / surrendered | 222 CE / 229 CE / 280 CE | `cnh-284` |
| tuntian revived / abolished by Wei / again by Jin | 196 CE / 264 CE / 266 CE | `cnh-287` |
| the nine-rank system introduced | c. 220 CE | `cnh-288` |
| the Records compiled / Pei Songzhi's commentary | c. 280 – 297 CE / 429 CE | `cnh-290` |
| the Romance: the oldest preface / first printed / the Mao revision | 1494 / 1522 / c. 1679 | West; Theobald (`cnh-291`) |
| the Jin dynasty / also dated / Western / Eastern | 266 – 420 CE / 265 – 420 CE / 266 – 316 CE / 317 – 420 CE | `cnh-293` |
| the conquest of Wu / the surrender | 279 – 280 CE / 1 May 280 CE | de Crespigny (`cnh-295`) |
| zhantian proclaimed | 280 CE | the *Jinshu* (`cnh-296`) |
| the War of the Eight Princes / Zhao Qi's span | 291 – 306 CE / 300 – 306 CE | de Crespigny (`cnh-297`) |
| the great families dominant | c. 220 – 589 CE | `cnh-298` |
| qingtan flourished | c. 240 – 420 CE | Spiro (`cnh-299`) |
| the Seven Sages lived / Ji Kang executed / also dated | 205 – 305 CE / 262 CE / 263 CE | `cnh-300` |

## Sixteen Kingdoms to the Tang (the fourth hundred)

Filled batch by batch from `cnh-301` (B31 on). **The protected lines** of the fourth hundred's individuals
(`cnh-302`, `309`, `312`, `316`–`322`, `327`, `333`, `341`, `344`, `349`, `354`, `356`, `357`, `371`, `373`, `375`, `377`,
`382`, `383`, `388`, `391`–`394`, `396`) are pinned below to their lines as they stood on main on 2026-11-13 (the years
only; ages, days and months left out), and are not rows of this table.

| event | the collection says | source |
|---|---|---|
| the Disaster of Yongjia: Luoyang fell / Emperor Huai killed | 13 July 311 CE / 313 CE | de Crespigny; Theobald (`cnh-301`) |
| the Sixteen Kingdoms | 304 – 439 CE | Theobald; Holcombe (`cnh-303`) |
| the states of the Five Barbarians founded | 304 – 439 CE | Theobald (`cnh-304`) |
| Han-Zhao: founded / imperial title / renamed Zhao / ended | 304 CE / 308 CE / 319 CE / 329 CE | `cnh-305` |
| the Later Zhao (Theobald's table / his heading) / imperial title | 319 – 351 CE / 319 – 350 CE / 330 CE | `cnh-306` |
| the Former Yan: founded / imperial title / conquered | 337 CE / 352 CE / 370 CE | `cnh-307` |
| the Former Qin: founded / Fei River / ended | 351 CE / 383 CE / 394 CE | `cnh-308` |
| the Battle of Fei River | 383 CE | the *Jinshu* (`cnh-310`) |
| the lodged commanderies: in use / the tuduan act / the registers merged | c. 317 – 589 CE / 364 CE / 413 CE | Theobald (`cnh-311`) |
| the Eastern Jin / Sima Rui takes the throne | 317 – 420 CE / 318 CE | `cnh-313` |
| Jiankang: Jianye founded / renamed / capital | 212 CE / 313 CE / 317 – 589 CE | the *Jinshu*; Chittick (`cnh-314`) |
| the Xie: Xie An / Fei River / Xie Lingyun | 320 – 385 CE / 383 CE / 385 – 433 CE | `cnh-315` |
| the Northern and Southern dynasties (the convention) | 420 – 589 CE | Theobald (`cnh-323`) |
| the Liu Song / the Yuanjia era | 420 – 479 CE / 424 – 453 CE | Theobald (`cnh-324`) |
| the Southern Qi / the Yongming era | 479 – 502 CE / 483 – 493 CE | `cnh-325` |
| the Liang / the Hou Jing rebellion | 502 – 557 CE / 548 – 552 CE | `cnh-326`, `cnh-328` |
| the Hou Jing rebellion: Jiankang fell / the Han title | 549 CE / 551 CE | Giles; Theobald (`cnh-328`) |
| the Chen / its founder's death | 557 – 589 CE / 559 CE | `cnh-329` |
| the Northern Wei / the north united | 386 – 534 CE / 439 CE | `cnh-330` |
| the Tuoba: the new seat at Shengle (the *Wei shu*'s count) / the Northern Wei house / the Gaxian inscription / renamed Yuan | 258 CE / 386 – 534 CE / 443 CE / 496 CE | Holmgren; Theobald (`cnh-331`) |
| the equal-field system decreed / abandoned | 485 CE / 780 CE | `cnh-332` |
| Pingcheng the capital | 398 – 494 CE | the *Wei shu* (`cnh-334`) |
| the Yungang caves carved | c. 460 – 524 CE | `cnh-335` |
| Longmen: begun / the imperial caves | c. 494 CE / 500 – 523 CE | Chavannes; the Nelson-Atkins (`cnh-336`) |
| the Six Garrisons revolt | 523 – 529 CE | `cnh-337` |
| the Eastern Wei | 534 – 550 CE | `cnh-338` |
| the Northern Zhou / the conquest of the Qi | 557 – 581 CE / 577 CE | `cnh-339` |
| the fubing: the six armies / hired guards | 542 CE / 722 CE | `cnh-340` |
| the Wen Xuan compiled / Li Shan's commentary | c. 520 – 531 CE / 658 CE | `cnh-342` |
| the Sui / reunification | 581 – 618 CE / 589 CE | `cnh-343` |
| the Sui conquest of Chen / Jiankang taken | 588 – 589 CE / 589 CE | `cnh-345` |
| the Kaihuang Code issued | 581 CE | `cnh-346` |
| the Three Departments set up / recast | 581 CE / 607 CE | `cnh-347` |
| the jinshi founded (Giles) / the examinations ended | 606 CE / 1905 | `cnh-348` |
| the Grand Canal: the first cut / the main works / the northern rebuild (Theobald) / World Heritage | 587 CE / 605 – 610 CE / 1283 – 1291 / 2014 | `cnh-350` |
| the Goguryeo–Sui War / the great invasion | 598 – 614 CE / 612 CE | `cnh-351` |
| the Sui walls: the Lingwu wall / the great levy / the further levy | 585 CE / 607 CE / 608 CE | Mailla; the *Sui shu* (`cnh-352`) |
| the Wagang army | 617 – 618 CE | `cnh-353` |
| the Tang / the Wu Zhou interruption | 618 – 907 CE / 690 – 705 CE | `cnh-355` |
| the Xuanwu Gate ambush / the abdication | 2 July 626 CE / 4 September 626 CE | Cordier (`cnh-358`) |
| the Zhenguan era | 627 – 649 CE | `cnh-359` |
| the Tang Code: revision ordered / revised / commentary | 627 CE / 651 CE / 653 CE | `cnh-360` |
| koufentian: fixed / restated / abandoned | 624 CE / 737 CE / 780 CE | Chen; Ikeda (`cnh-361`) |
| zuyongdiao fixed / replaced | 624 CE / 780 CE | `cnh-362` |
| the mingjing: tiejing added / law added / abolished | 680 CE / 786 CE / 1071 | Wong; Theobald (`cnh-364`) |
| the Battle of Yinshan | 630 CE | `cnh-365` |
| the Anxi Protectorate: founded / seat moved / retaken / lost | 640 CE / 658 CE / 692 CE / c. 787 – 791 CE | Stein; Chavannes (`cnh-366`) |
| Chang'an (Daxing): founded / capital / renamed Xi'an | 582 CE / 583 – 904 CE / 1369 | `cnh-367` |
| the West Market: planned / abandoned / the dig report | 582 CE / 904 CE / 1961 | `cnh-368` |
| the sabao tombs of An Jia and Shi Jun | 579 – 580 CE | `cnh-369` |
| the Sogdian Whirl dancers sent as tribute (Mair) | 718 – 729 CE | `cnh-370` |
| the Wu Zhou proclaimed / ended | 690 CE / 705 CE | `cnh-372` |
| the Kaiyuan era | 713 – 741 CE | `cnh-374` |
| the Battle of Talas | 751 CE | `cnh-376` |
| the An Lushan Rebellion | 755 – 763 CE | `cnh-378` |
| the Hebei provinces: settled / the war over succession / submitted | 763 CE / 781 – 785 CE / 819 CE | O'Byrne; Theobald (`cnh-379`) |
| the jiedushi: first appointed / also dated (Sima Guang) / curbed by the Song | 711 CE / 710 CE / 965 CE | `cnh-380` |
| the two-tax system introduced / superseded by the single whip | 780 CE / 1581 | `cnh-381` |
| the Tibetan Empire / Wencheng sent / Chang'an taken / the sworn treaty | c. 618 – 842 CE / 641 CE / 763 CE / 821 – 822 CE | `cnh-384` |
| the Uyghur Khaganate: founded / the capitals retaken / fell | 744 CE / 757 CE / 840 CE | `cnh-385` |
| Nanzhao: traditional founding / recognised / beat the Tang / fell | 649 CE / 738 CE / 751 CE / 902 CE | `cnh-386` |
| the Famen relic in the capital / the last procession / the crypt sealed | 819 CE / 873 CE / 874 CE | `cnh-387` |
| the Huichang persecution: the decree / eased | 845 CE / 846 CE | `cnh-389` |
| the Huang Chao rebellion / Chang'an held | 875 – 884 CE / 881 – 883 CE | `cnh-395` |
| the Five Dynasties / the Ten Kingdoms | 907 – 960 CE / 902 – 979 CE | `cnh-397` |
| the Later Liang / its founder killed | 907 – 923 CE / 912 CE | `cnh-398` |
| the Later Tang / its founder killed | 923 – 936 CE / 926 CE | `cnh-399` |
| the Sixteen Prefectures promised / handed over | 936 CE / 938 CE | the *Liao shi*; Theobald (`cnh-400`) |

## Five Dynasties to the Yuan (the fifth hundred)

Filled batch by batch from `cnh-401` (B41 on). **The protected lines** of the fifth hundred's individuals
(`cnh-401`, `403`, `407`, `409`, `413`, `420`, `422`–`424`, `428`–`430`, `432`, `434`, `439`, `441`, `442`, `444`, `445`,
`448`, `450`, `451`, `459`, `467`, `475`, `480`, `484`–`486`, `491`, `493`, `496`, `497`) are pinned below to their lines as
they stood on main on 2026-11-13 (the years only, both years of an "X, or Y" death; ages, days and months left out), and
are not rows of this table.

| event | the collection says | source |
|---|---|---|
| the Later Zhou / its founder's death | 951 – 960 CE / 954 CE | Cordier (`cnh-402`); Theobald and Giles 953 |
| the Former Shu | 907 – 925 CE | Theobald (`cnh-404`) |
| Wuyue (the title of 907 / of 902) | 907 – 978 CE / 902 – 978 CE | Chavannes; Clark (`cnh-405`) |
| the Southern Tang | 937 – 975 CE | Theobald; Cordier (`cnh-406`) |
| Yue ware made (the museum records read) | c. 265 – 1127 CE | the Art Institute; the Met (`cnh-408`) |
| the Northern Han | 951 – 979 CE | Cordier; Theobald (`cnh-410`) |
| the Liao (the *Liaoshi*'s founding / the *Zizhi Tongjian*'s) | 907 CE – 1125 / 916 CE – 1125 | Miao (`cnh-411`) |
| the Liao Bureau of Military Affairs adopted | 947 CE | the *Liaoshi*; Theobald (`cnh-414`) |
| the Khitan large script / suppressed by the Jurchen Jin | 920 CE / 1191 | the *Liaoshi*; Theobald (`cnh-415`) |
| the Battle of Gaoliang River | 979 CE | Cordier; Parker (`cnh-416`) |
| the Chanyuan Treaty sworn / revised | 1004 – 1005 / 1042 | `cnh-417` |
| the Fogong pagoda built | 1056 | the Ming gazetteer (`cnh-418`) |
| the Alliance Conducted at Sea: envoys / terms | 1118 / 1120 | Cordier; Theobald (`cnh-419`) |
| the Song / the north lost | 960 – 1279 CE / 1127 | `cnh-421` |
| Kaifeng the Song capital / the great flood | 960 CE – 1127 / 1642 | Tsui; Storozum et al. (`cnh-425`) |
| the Qingli Reforms proposed / abandoned | 1043 / 1045 | Zhang; Cordier (`cnh-426`) |
| the palace examination made regular / abolished | 973 CE / 1905 | the *Songshi*; Theobald (`cnh-427`) |
| the New Policies introduced / repealed | 1069 / 1085 – 1086 | Kojima; Theobald (`cnh-431`) |
| the Zizhi Tongjian commissioned / named / completed / first printed | 1066 / 1067 / 1084 / 1086 | the Siku front matter; Strange (`cnh-433`) |
| the Dongjing Meng Hua Lu's preface | 1147 | `cnh-435` |
| the jiaozi: the state issue / renamed qianyin | 1023 / 1105 – 1107 | the *Songshi*; Theobald (`cnh-436`) |
| Xuzhou: Xiang Yu's capital / Su Shi's iron memorial / coal found | 206 BCE / 1078 / 1079 | Chavannes; Wagner (`cnh-437`) |
| the Quanzhou ship wrecked / Polo's book dictated | c. 1277 / 1298 | `cnh-438` |
| the Kaibao Canon ordered / completed | 971 CE / 983 CE | the *Fozu tongji*; Jiang Wu (`cnh-440`) |
| the Qingming scroll painted / Zhang Zhu's colophon / the Qing version | c. 1100 – 1200 / 1186 / 1736 | Hansen; the Palace Museum (`cnh-443`) |
| the Jingkang sieges / the captives taken north | 1126 / 1127 | the *Songshi* (`cnh-446`) |
| the Battle of Huangtiandang | 1130 | `cnh-447` |
| the Southern Song court settled at Hangzhou / West Lake on the World Heritage list | 1138 / 2011 | Giles (`cnh-449`) |
| the Treaty of Shaoxing agreed / sealed / broken | 1141 / 1142 / 1161 | the *Jinshi* (`cnh-452`) |
| the Battle of Caishi | 1161 | `cnh-453` |
| the huizi first issued / small notes | 1160 / 1163 | the *Songshi*; Theobald (`cnh-454`) |
| Quanzhou a prefecture seat / named / World Heritage | 700 CE / 711 CE / 2021 | `cnh-455` |
| Guan ware: the first kiln / the southern kilns | 1111 – 1117 / c. 1127 – 1279 | `cnh-456` |
| Jian ware made | c. 960 CE – 1279 | Dejoie et al. (`cnh-457`) |
| the Mengliang lu dated / also dated | 1274 / c. 1300 | Cordier; Strassberg (`cnh-458`) |
| Neo-Confucianism: the masters / the ban / the enshrinement | 1017 – 1200 / 1196 – 1202 / 1241 | De Weerdt (`cnh-460`) |
| the Battle of Tangdao | 1161 | `cnh-461` |
| the fire lance first recorded / used by the Jurchen Jin | 1132 / 1232 – 1233 | Andrade; the *Jinshi* (`cnh-462`) |
| the siege of Xiangyang | 1268 – 1273 | the *Yuanshi*; Yule (`cnh-463`) |
| the Battle of Yamen | 1279 | `cnh-464` |
| the Western Xia founded / conquered | 1038 / 1227 | `cnh-465` |
| the Tangut script (dated / also dated) / the Juyong inscription | 1036 / 1037 / 1345 | `cnh-468` |
| the Tangut canon translated / printed | 1038 – 1090 / 1293 – 1302 | Theobald (`cnh-469`) |
| the Battle of Haoshuichuan | 1041 | `cnh-470` |
| Khara-Khoto taken / the last dated text / excavated | 1226 / 1366 / 1908 – 1914 | `cnh-471` |
| the Mongol conquest of the Western Xia / the capital besieged / the last campaign | 1205 – 1227 / 1209 / 1226 – 1227 | `cnh-472` |
| the Jurchen Jin (the *Jinshi* / Qiu Jingjia) | 1115 – 1234 / 1117 – 1234 | `cnh-473` |
| the Battle of Hubudagang | 1115 | `cnh-476` |
| Da Qi founded / abolished | 1130 / 1137 | `cnh-477` |
| the meng'an mouke introduced / ended | 1114 / 1234 | Cordier (`cnh-478`) |
| the Jurchen large script / the small script | 1119 / 1138 | the *Jinshi* (`cnh-479`) |
| the Battle of Yehuling | 1211 | the *Jinshi* (`cnh-481`) |
| the siege of Caizhou / its fall | 1233 – 1234 / 1234 | `cnh-482` |
| the Yuan proclaimed / the conquest ended / driven north | 1271 / 1279 / 1368 | `cnh-483` |
| Khanbaliq founded / named Dadu / taken | 1267 / 1271 / 1368 | the *Yuanshi* (`cnh-487`) |
| the examinations restored (the four groups' quotas) | 1315 | the *Yuanshi* (`cnh-488`) |
| the xingsheng set up | 1260 | `cnh-489` |
| the jiaochao: the first issue / the Zhiyuan notes / the Zhizheng notes | 1260 / 1287 / 1350 | Theobald (`cnh-492`) |
| the Java expedition ordered / fought | 1292 / 1293 | the *Yuanshi* (`cnh-494`) |
| Polo's book dictated | 1298 | `cnh-495` |
| Zhong Sicheng's catalogue / Zang Maoxun's anthology | 1330 / 1615 | `cnh-498` |
| the Western Chamber written / its earliest edition / Julien's translation | c. 1300 / 1498 / 1872 – 1880 | `cnh-499` |
| the David Vases dated / first published | 1351 / 1929 | Pope (`cnh-500`) |

## Ming to the early Republic (the sixth hundred)

Filled batch by batch from `cnh-501` (B51 on). **The protected lines** of the sixth hundred's individuals
(`cnh-504`, `510`, `514`, `516`, `527`, `528`, `532`–`534`, `536`, `538`, `540`, `545`, `549`, `551`, `554`, `555`, `560`,
`565`, `569`, `575`, `576`, `578`, `587`–`589`, `593`) are pinned below to their lines as they stood on main on 2026-11-14
(the years only, both years of an "X, or Y" death; ages, days and months left out), and are not rows of this table.
Dates already set elsewhere that this hundred must agree with: the Yuan driven north 1368 (`cnh-483`), Khanbaliq taken
1368 (`cnh-487`), the Grand Canal's northern rebuild 1283 – 1291 (`cnh-350`), the two-tax system superseded by the
single whip 1581 (`cnh-381`), the examinations ended 1905 (`cnh-348`, `cnh-427`).

| event | the collection says | source |
|---|---|---|
| the Red Turban Rebellions | 1351 – 1368 | Karaseva (`cnh-501`) |
| the Northern Yuan (Theobald's ruler list / his Yuan history) | 1368 – 1388 / 1368 – 1402 | Theobald (`cnh-502`) |
| the Ming | 1368 – 1644 | the *Mingshi* (`cnh-503`) |
| the lijia tried / ordered everywhere | 1370 / 1381 | Theobald; Hucker (`cnh-505`) |
| the Hu Weiyong case: Hu executed / Li Shanchang reached / closed with a pardon | 1380 / 1390 / 1393 | Hucker (`cnh-506`) |
| the Central Secretariat created / adopted by the Yuan / abolished | 220 – 226 CE / 1260 / 1380 | Theobald (`cnh-507`) |
| the Grand Secretariat formed / abolished | 1402 / 8 May 1911 | Dardess; Brunnert and Hagelstrom (`cnh-508`) |
| the Jingnan campaign | 1399 – 1402 | Chan (`cnh-509`) |
| Beijing renamed / made capital / confirmed / its outer wall | 1403 / 1421 / 1441 / 1553 | Sirén; Campbell; Theobald; Cho (`cnh-511`) |
| the Forbidden City ordered / finished / the court moved in / the museum | 1406 / 1420 / 1421 / 1925 | Campbell; the Palace Museum (`cnh-512`) |
| the Yongle Encyclopedia ordered / finished / recopied / burned | 1403 / 1408 / 1562 – 1567 / 1900 | the Library of Congress (`cnh-513`) |
| the treasure voyages: the first order / the span / the last order | 11 July 1405 / 1405 – 1433 / 29 June 1430 | Wade's *Ming Shi-lu* (`cnh-515`) |
| the Tumu Crisis: the army out / the battle / the captive returned | 4 August 1449 / 1 September 1449 / 29 September 1450 | İzbasar (`cnh-517`) |
| the Ming Great Wall: early walls / main building / the hollow towers | 1436 – 1464 / 1465 – 1620 / 1569 – 1571 | Yang, Zhang and Li (`cnh-518`) |
| the wokou's worst raids | 1552 – 1557 | Liu (`cnh-520`) |

## Later periods

To be filled from `cnh-601` on.

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
cnh-206: 250; 221; 209; 215
cnh-210: 219; 210
cnh-215: 233; 207; 206; 202
cnh-216: 247; 206; 202; 195
cnh-220: 241; 195; 180
cnh-223: 156; 141; 87; 119
cnh-226: 209; 201
cnh-228: 140; 121; 117
cnh-229: 195; 138; 126; 114
cnh-237: 179; 134; 104
cnh-240: 145; 110; 98; 86; 74
cnh-246: 45; 16; 9; 23
cnh-254: 5; 25; 57
cnh-257: 32; 73; 102
cnh-259: 32; 92
cnh-261: 45; 117
cnh-262: 50; 62; 105; 121
cnh-263: 78; 132; 139
cnh-265: 141; 159
cnh-269: 174; 184
cnh-270: 140; 149; 189; 192
cnh-271: 154; 190; 196; 202
cnh-272: 181; 189; 220; 234
cnh-274: 155; 208; 220; 217
cnh-278: 187; 220; 226
cnh-280: 161; 221; 223
cnh-281: 181; 207; 223; 234
cnh-285: 182; 200; 229; 252
cnh-286: 200; 219
cnh-289: 179; 239; 251; 249
cnh-292: 242; 264; 280; 283
cnh-294: 236; 266; 290; 280
cnh-302: 300; 313; 316; 317
cnh-309: 337; 357; 385; 383
cnh-312: 232; 310; 349
cnh-316: 276; 317; 339
cnh-317: 266; 313; 321
cnh-318: 312; 347; 373
cnh-319: 303; 353; 361
cnh-320: 365; 405; 427
cnh-321: 344; 364; 406
cnh-322: 363; 417; 420; 422
cnh-327: 464; 502; 549; 527
cnh-333: 467; 471; 499; 496
cnh-341: 441; 488; 513
cnh-344: 541; 581; 604; 589
cnh-349: 569; 589; 604; 618
cnh-354: 618; 619
cnh-356: 566; 617; 618; 626; 635
cnh-357: 598; 626; 649
cnh-371: 624; 690; 705
cnh-373: 685; 712; 756; 713; 762
cnh-375: 719; 745; 756
cnh-377: 703; 755; 756; 757
cnh-382: 727; 779; 781
cnh-383: 715; 716; 763; 780
cnh-388: 602; 629; 645; 664
cnh-391: 701; 742; 762
cnh-392: 712; 758; 770
cnh-393: 772; 815; 846
cnh-394: 768; 819; 824
cnh-396: 852; 904; 907; 912
cnh-401: 892; 936; 942
cnh-403: 921; 954; 959
cnh-407: 937; 961; 976; 978
cnh-409: 882; 932; 953; 954
cnh-413: 872; 907; 926; 916
cnh-420: 1075; 1101; 1125; 1128; 1156
cnh-422: 927; 960; 976; 961
cnh-423: 928; 961; 984
cnh-424: 1010; 1022; 1063; 1033
cnh-428: 1007; 1045; 1072
cnh-429: 1008; 1053; 1057
cnh-430: 1021; 1058; 1069; 1076; 1086
cnh-432: 1019; 1085; 1086
cnh-434: 1047; 1102; 1126
cnh-439: 1041; 1048; 1051
cnh-441: 1037; 1057; 1080; 1086; 1101
cnh-442: 1084; 1101; 1132; 1155
cnh-444: 1023; 1072; 1090
cnh-445: 1082; 1100; 1126; 1120; 1135
cnh-448: 1107; 1127; 1162; 1187
cnh-450: 1103; 1140; 1142
cnh-451: 1091; 1130; 1138; 1155
cnh-459: 1130; 1200
cnh-467: 1003; 1032; 1048; 1038
cnh-475: 1068; 1114; 1115; 1123
cnh-480: 1123; 1161; 1189; 1173
cnh-484: 1190; 1244
cnh-485: 1215; 1260; 1294; 1271
cnh-486: 1236; 1276; 1295
cnh-491: 1285; 1311; 1320; 1313
cnh-493: 1231; 1292; 1293; 1316; 1314
cnh-496: 1247; 1305; 1307; 1328
cnh-497: 1235; 1253; 1269; 1280
cnh-504: 1328; 1344; 1368; 1398
cnh-510: 1360; 1402; 1424
cnh-514: 1371; 1405; 1433; 1435
cnh-516: 1378; 1424; 1425
cnh-527: 1552; 1582; 1610; 1601
cnh-528: 1472; 1506; 1529
cnh-532: 1568; 1620; 1627; 1624
cnh-533: 1606; 1644; 1645
cnh-534: 1627; 1644; 1630
cnh-536: 1559; 1616; 1626
cnh-538: 1592; 1626; 1643; 1636
cnh-540: 1612; 1643; 1650; 1644
cnh-545: 1654; 1661; 1722
cnh-549: 1678; 1722; 1735; 1730
cnh-551: 1711; 1735; 1796; 1799
cnh-554: 1746; 1793; 1799; 1809
cnh-555: 1750; 1776; 1799
cnh-560: 1785; 1838; 1840; 1839; 1850
cnh-565: 1814; 1837; 1851; 1864
cnh-569: 1835; 1861; 1908; 1898
cnh-575: 1866; 1896; 1912; 1925
cnh-576: 1906; 1908; 1912; 1924; 1967
cnh-578: 1859; 1909; 1912; 1916
cnh-587: 1879; 1915; 1921; 1927; 1942
cnh-588: 1891; 1917; 1938; 1942; 1962
cnh-589: 1881; 1904; 1906; 1918; 1936
cnh-593: 1887; 1924; 1926; 1928; 1975
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
cnh-121: 1036; 770
cnh-122: 1046; 771
cnh-123: 1046; 771
cnh-124: 850; 600
cnh-125: 1046; 771
cnh-126: 1046; 771; 179; 157; 175; 317; 322
cnh-127: 900; 500; 1200; 600
cnh-128: 1046; 771; 899
cnh-129: 380; 300; 9
cnh-130: 1046; 771
cnh-131: 816; 771
cnh-134: 841; 828; 850; 837
cnh-138: 771
cnh-139: 770; 769; 720
cnh-140: 1046; 771
cnh-141: 770; 256; 249
cnh-142: 770; 475; 453; 722; 481
cnh-143: 722; 481; 479
cnh-144: 722; 479; 300
cnh-145: 771; 707; 706; 256
cnh-146: 680; 679; 667
cnh-150: 632
cnh-152: 1046; 386; 379; 221
cnh-153: 1106; 678; 403; 376
cnh-154: 886; 703; 278; 223
cnh-155: 897; 770; 350; 221
cnh-156: 722; 481; 517; 249
cnh-157: 641; 637; 546; 286
cnh-158: 510; 473; 333
cnh-160: 650; 442; 424
cnh-161: 770; 475
cnh-162: 453; 403; 376
cnh-163: 475; 453; 403; 221
cnh-164: 403; 386; 230; 221
cnh-165: 424; 340; 403; 225
cnh-169: 356; 350
cnh-170: 338; 221; 325; 316
cnh-171: 475; 221; 453; 307
cnh-172: 500; 400; 300; 341
cnh-173: 506; 476; 453; 221; 293; 260
cnh-175: 500; 400; 300
cnh-176: 640; 550; 221
cnh-177: 453; 221; 386; 284
cnh-178: 333; 318; 221
cnh-179: 328; 312
cnh-180: 341; 343
cnh-181: 260
cnh-183: 356; 221; 319; 284
cnh-184: 299; 238
cnh-185: 100; 1146; 1147
cnh-187: 300; 77; 6
cnh-188: 230; 221
cnh-190: 256; 249; 250
cnh-191: 221; 206; 207; 209
cnh-193: 221
cnh-194: 221; 1912
cnh-196: 221
cnh-197: 350; 221
cnh-198: 221; 209
cnh-199: 221
cnh-200: 246; 222; 221; 206
cnh-201: 244; 217; 1975
cnh-202: 213; 212
cnh-203: 220; 212
cnh-204: 219; 214
cnh-205: 221; 214
cnh-207: 306; 251; 215; 214
cnh-208: 246; 210; 208
cnh-209: 247; 210; 1974
cnh-211: 210
cnh-212: 209; 206; 207
cnh-213: 206; 220; 202; 9; 23
cnh-214: 206; 202; 203
cnh-217: 206
cnh-218: 202
cnh-219: 202
cnh-221: 180; 141; 157
cnh-222: 154
cnh-224: 133; 119
cnh-225: 209; 100; 48
cnh-227: 200; 133
cnh-230: 138; 126; 115; 1877
cnh-231: 121; 115
cnh-232: 203; 196; 111
cnh-233: 108; 82; 45; 314
cnh-234: 117; 119; 98; 44; 41
cnh-235: 81; 74; 49
cnh-236: 115; 110
cnh-238: 136
cnh-239: 124; 29
cnh-241: 100; 48; 7
cnh-242: 199; 198; 23; 2014
cnh-243: 106; 7; 42; 188
cnh-244: 188; 180; 189
cnh-245: 9; 23
cnh-247: 6; 8; 9
cnh-248: 9
cnh-249: 118; 9; 40; 621
cnh-250: 11; 69
cnh-251: 18; 27
cnh-252: 23
cnh-253: 25; 220
cnh-255: 25; 36
cnh-256: 25; 190
cnh-258: 60; 59; 74; 107
cnh-260: 54; 80
cnh-264: 134; 92; 132
cnh-266: 166; 167; 169; 184
cnh-267: 68
cnh-268: 184; 207
cnh-273: 220; 280; 229
cnh-275: 200
cnh-276: 208
cnh-277: 220; 266; 265
cnh-279: 221; 263
cnh-282: 207
cnh-283: 228; 234
cnh-284: 222; 229; 280
cnh-287: 196; 264; 266
cnh-288: 220
cnh-290: 280; 297; 429
cnh-291: 1494; 1522; 1679
cnh-293: 266; 420; 265; 316; 317
cnh-295: 279; 280
cnh-296: 280
cnh-297: 291; 306; 300
cnh-298: 220; 589
cnh-299: 240; 420
cnh-300: 205; 305; 262; 263
cnh-301: 311; 313
cnh-303: 304; 439
cnh-304: 304; 439
cnh-305: 304; 308; 319; 329
cnh-306: 319; 351; 350; 330
cnh-307: 337; 352; 370
cnh-308: 351; 383; 394
cnh-310: 383
cnh-311: 317; 589; 364; 413
cnh-313: 317; 420; 318
cnh-314: 212; 313; 317; 589
cnh-315: 320; 385; 383; 433
cnh-323: 420; 589
cnh-324: 420; 479; 424; 453
cnh-325: 479; 502; 483; 493
cnh-326: 502; 557; 548; 552
cnh-328: 548; 552; 549; 551
cnh-329: 557; 589; 559
cnh-330: 386; 534; 439
cnh-331: 258; 386; 534; 443; 496
cnh-332: 485; 780
cnh-334: 398; 494
cnh-335: 460; 524
cnh-336: 494; 500; 523
cnh-337: 523; 529
cnh-338: 534; 550
cnh-339: 557; 581; 577
cnh-340: 542; 722
cnh-342: 520; 531; 658
cnh-343: 581; 618; 589
cnh-345: 588; 589
cnh-346: 581
cnh-347: 581; 607
cnh-348: 606; 1905
cnh-350: 587; 605; 610; 1283; 1291; 2014
cnh-351: 598; 614; 612
cnh-352: 585; 607; 608
cnh-353: 617; 618
cnh-355: 618; 907; 690; 705
cnh-358: 626
cnh-359: 627; 649
cnh-360: 627; 651; 653
cnh-361: 624; 737; 780
cnh-362: 624; 780
cnh-364: 680; 786; 1071
cnh-365: 630
cnh-366: 640; 658; 692; 787; 791
cnh-367: 582; 583; 904; 1369
cnh-368: 582; 904; 1961
cnh-369: 579; 580
cnh-370: 718; 729
cnh-372: 690; 705
cnh-374: 713; 741
cnh-376: 751
cnh-378: 755; 763
cnh-379: 763; 781; 785; 819
cnh-380: 711; 710; 965
cnh-381: 780; 1581
cnh-384: 618; 842; 641; 763; 821; 822
cnh-385: 744; 757; 840
cnh-386: 649; 738; 751; 902
cnh-387: 819; 873; 874
cnh-389: 845; 846
cnh-395: 875; 884; 881; 883
cnh-397: 907; 960; 902; 979
cnh-398: 907; 923; 912
cnh-399: 923; 936; 926
cnh-400: 936; 938
cnh-402: 951; 960; 954
cnh-404: 907; 925
cnh-405: 907; 978; 902
cnh-406: 937; 975
cnh-408: 265; 1127
cnh-410: 951; 979
cnh-411: 907; 916; 1125
cnh-414: 947
cnh-415: 920; 1191
cnh-416: 979
cnh-417: 1004; 1005; 1042
cnh-418: 1056
cnh-419: 1118; 1120
cnh-421: 960; 1279; 1127
cnh-425: 960; 1127; 1642
cnh-426: 1043; 1045
cnh-427: 973; 1905
cnh-431: 1069; 1085; 1086
cnh-433: 1066; 1067; 1084; 1086
cnh-435: 1147
cnh-436: 1023; 1105; 1107
cnh-437: 206; 1078; 1079
cnh-438: 1277; 1298
cnh-440: 971; 983
cnh-443: 1100; 1200; 1186; 1736
cnh-446: 1126; 1127
cnh-447: 1130
cnh-449: 1138; 2011
cnh-452: 1141; 1142; 1161
cnh-453: 1161
cnh-454: 1160; 1163
cnh-455: 700; 711; 2021
cnh-456: 1111; 1117; 1127; 1279
cnh-457: 960; 1279
cnh-458: 1274; 1300
cnh-460: 1017; 1200; 1196; 1202; 1241
cnh-461: 1161
cnh-462: 1132; 1232; 1233
cnh-463: 1268; 1273
cnh-464: 1279
cnh-465: 1038; 1227
cnh-468: 1036; 1037; 1345
cnh-469: 1038; 1090; 1293; 1302
cnh-470: 1041
cnh-471: 1226; 1366; 1908; 1914
cnh-472: 1205; 1227; 1209; 1226
cnh-473: 1115; 1117; 1234
cnh-476: 1115
cnh-477: 1130; 1137
cnh-478: 1114; 1234
cnh-479: 1119; 1138
cnh-481: 1211
cnh-482: 1233; 1234
cnh-483: 1271; 1279; 1368
cnh-487: 1267; 1271; 1368
cnh-488: 1315; 1368
cnh-489: 1260; 1368
cnh-490: 1279; 1368
cnh-492: 1260; 1287; 1350
cnh-494: 1292; 1293
cnh-495: 1298
cnh-498: 1330; 1615
cnh-499: 1300; 1498; 1872; 1880
cnh-500: 1351; 1929
cnh-501: 1351; 1368
cnh-502: 1368; 1388; 1402
cnh-503: 1368; 1644
cnh-505: 1370; 1381
cnh-506: 1380; 1390; 1393
cnh-507: 220; 226; 1260; 1380
cnh-508: 1402; 1911
cnh-509: 1399; 1402
cnh-511: 1403; 1421; 1441; 1553
cnh-512: 1406; 1420; 1421; 1925
cnh-513: 1403; 1408; 1562; 1567; 1900
cnh-515: 1405; 1433; 1430
cnh-517: 1449; 1450
cnh-518: 1436; 1464; 1465; 1620; 1569; 1571
cnh-520: 1552; 1557
```
