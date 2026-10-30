"""The inventory each level's scope names, as headwords.

THE SOURCE.  Türkçenin Yabancı Dil Olarak Öğretimi Programı (Türkiye Maarif
Vakfı, 2nd ed., Istanbul, Nov 2020; approved by MEB Talim ve Terbiye Kurulu,
decision 36 of 11.11.2020), the ORTAÖĞRETIM (secondary school) syllabus tables,
§8.5.  Each theme's table has a "Söz Varlığı" (vocabulary) column; it is READ
here, one theme at a time, with the page beside it, and typed in as headwords.
Nothing else is taken from the document: no outcome, theme text or example
sentence reaches a card (the document is all rights reserved -- see
`docs/turkish-decks-plan.md` §2).

HOW AN ENTRY IS WRITTEN.
  * A verb is written as the programme writes it, as a STEM WITH A HYPHEN
    (`git-`), and `headwords()` turns it into the dictionary's infinitive
    (`gitmek`) by vowel harmony on the stem's last vowel.  That is the one thing
    derived here, and it is the infinitive suffix only, which has no exceptions.
  * A verb phrase (`müzik dinle-`, `hasta ol-`) is entered as its words: the
    deck teaches words, and the phrase deck will teach the phrase.
  * A compound the dictionary carries as an entry of its own (`baş ağrısı`,
    `meyve suyu`) is entered whole; `select.py` reports any it cannot find.
  * A CATEGORY the column names without listing it ("Haftanın günleri", "Mevsim
    ve ay adları", "Sayılar (1-1000 Arası)") is filled with its members here.
    Those members are Folio's, not the programme's, and are marked `# category`.
  * The closed classes A1's grammar list (§7, p. 83) names -- the personal and
    demonstrative pronouns, `burası/şurası/orası`, `ne/kim`, the time and
    frequency adverbs, `en`, `ile/ve/ama/çünkü`, the ordinals, `var/yok`,
    `değil`, `gibi/kadar`, `göre`, and "temel soru ifadeleri" -- are listed under
    `GRAMMAR_A1` with the same marking.

THE ALPHABET WORDS ARE KEPT.  Theme 1's column is a list of example words for
each letter (`J: Japon, jeton, jet`), chosen for their letter rather than their
level, and a few are odd at A1 (`iskelet`, `zürafa`).  They are the programme's
own A1 vocabulary all the same, so they are taught; only the proper noun
`Japon` is left out, the deck teaching no names.
"""

# Ortaöğretim A1, pp. 243-254.  (page, theme, [entries])
A1 = [
    (243, "1 Tanışalım — alphabet example words", [
        "araba", "ayna", "bayrak", "balık", "ceket", "cami", "çanta", "çay", "domates", "dudak",
        "ev", "ekmek", "fare", "fil", "göz", "güneş", "ağaç", "öğretmen", "halı", "hastane",
        "ırmak", "ışık", "inek", "iki", "ip", "iskelet", "jeton", "jet", "kalem", "kitap",
        "limon", "lamba", "masa", "muz", "nine", "nane", "otobüs", "okul", "ördek", "öğrenci",
        "para", "peynir", "pencere", "radyo", "resim", "saat", "sınıf", "şapka", "şeker", "top",
        "tarak", "uçak", "uçurtma", "üzüm", "ütü", "valiz", "vazo", "yumurta", "yıldız", "zeytin",
        "zürafa",
    ]),
    (244, "2 Sınıftayız", [
        "defter", "kitap", "kalem", "silgi", "sıra", "masa", "sandalye", "pencere", "çanta",
        "sınıf", "kat", "kütüphane", "öğretmen", "oda", "laboratuvar", "kantin", "müdür",
        "gezdir-", "göster-", "gir-", "çık-", "gel-", "git-", "tanıt-", "otur-",
    ]),
    (245, "3 Ailem ve Evim", [
        "anne", "baba", "dede", "nine", "amca", "dayı", "teyze", "hala", "kardeş",
        "oku-", "yaz-", "git-", "koş-", "yürü-", "uyu-",
        "oda", "salon", "mutfak", "banyo", "tuvalet", "lavabo", "balkon", "bahçe", "dolap", "masa",
        "yatak", "koltuk", "ayna", "sandalye",
        "alt", "üst", "yan", "arka", "ön", "iç", "dış",
        "doktor", "öğretmen", "şoför", "aşçı", "mühendis", "polis", "oyuncu",
        "hastane", "okul", "karakol", "kedi", "köpek",
    ]),
    (246, "4 Bir Günüm", [
        "her", "gün", "akşam", "hafta sonu", "sabah", "öğle", "öğleden sonra",
        "genellikle", "bazen", "ara sıra", "sık sık", "asla", "hiçbir zaman",
        "uyan-", "yat-", "uyu-", "giy-", "giyin-", "yıka-", "oyna-", "dinlen-", "sev-", "çalış-",
        # "Haftanın günleri"
        "pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar",  # category
        "kitap", "oku-", "müzik", "dinle-", "spor", "yap-", "resim",
    ]),
    (247, "5 Şehir Gezisi", [
        "otobüs", "bisiklet", "uçak", "tren", "taksi", "metro", "gemi", "tramvay",
        "in-", "bin-", "otur-", "bağla-", "uç-", "sür-", "git-", "dön-",
        "karşı", "ön", "arka", "sağ", "sol", "iç", "dış", "orta",
        "sokak", "cadde", "kaldırım", "tabela", "trafik", "ışık", "durak", "yaya geçidi",
        "üst geçit", "alt geçit", "müze", "park", "lokanta",
    ]),
    (248, "6 Çarşı Pazar", [
        # "Sayılar (1-1000 Arası)"
        "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on",  # category
        "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan", "yüz", "bin",  # category
        "kilo", "gram", "litre", "tane", "adet", "kutu", "koli", "paket",
        "elma", "portakal", "domates", "salatalık", "biber", "peynir", "zeytin", "bal", "yağ",
        "şeker", "ekmek", "et", "tavuk", "yumurta", "süt", "yoğurt", "çay", "meyve suyu",
        "pahalı", "ucuz", "az", "çok", "şekerli", "şekersiz", "tuzlu", "tuzsuz",
        "menü", "garson", "yemek", "çatal", "kaşık",
    ]),
    (250, "7 Bugün Hava Nasıl?", [
        "güneş", "güneşli", "yağmur", "yağmurlu", "bulut", "bulutlu", "sis", "sisli", "kar", "karlı",
        "buz", "buzlu", "sıcak", "soğuk", "rüzgâr", "rüzgârlı",
        "yağ-", "es-", "bat-", "doğ-", "üşü-", "terle-",
        # "Mevsim ve ay adları"
        "mevsim", "ilkbahar", "yaz", "sonbahar", "kış",  # category
        "ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül",  # category
        "ekim", "kasım", "aralık",  # category
        "atkı", "şapka", "eldiven", "bot", "çizme", "tişört", "şort", "terlik", "çorap", "gömlek",
        "palto", "kazak",
        "siyah", "beyaz", "kırmızı", "mavi", "sarı", "yeşil", "pembe", "mor", "turuncu",
        "pahalı", "ucuz", "güzel", "uzun", "kısa", "büyük", "küçük",
        "mutlu", "mutsuz", "neşeli", "üzgün", "heyecanlı", "sinirli", "şaşkın",
        "kuzey", "güney", "doğu", "batı", "dün", "bugün", "yarın",
    ]),
    (251, "8 Geçmiş Olsun", [
        "dün", "sabah", "akşam", "geçen", "ay", "hafta", "önce",
        "grip", "nezle", "baş ağrısı", "ateş", "diş ağrısı", "mide bulantısı", "kulak ağrısı",
        "öksürük", "hastane", "hasta", "doktor", "serum", "hemşire", "iğne", "ilaç", "reçete",
        "el", "yüz", "yıka-", "tırnak", "kes-", "tara-", "ol-", "muayene", "tak-", "et-", "ağrı-",
        "ayak", "parmak", "bacak", "kol", "göz", "saç", "burun", "baş", "diş", "dil", "dudak", "ağız",
        "kıvırcık", "düz", "ela",
    ]),
    (253, "9 Davetlisiniz", [
        "dün", "akşam", "geçen", "hafta", "önce", "yarın", "gün", "sonra",
    ]),
    (254, "10 Tatil Planım", [
        "tatil", "plan", "rezervasyon", "dağ", "orman", "deniz", "konaklama", "fiyat", "ücret", "bilet",
        "yarın", "akşam", "sonra", "gelecek", "hafta", "ay", "yıl",
        "günlük", "kişilik", "tek", "manzaralı", "tam", "pansiyon",
        "kamp", "bisiklet", "yürüyüş", "yüz-", "at", "balık", "tut-",
    ]),
]

# §7 "Düzeylere Göre Dil Yapıları Listesi", A1 (p. 83): the closed classes it names.
GRAMMAR_A1 = [  # category
    "ben", "sen", "o", "biz", "siz", "onlar", "bu", "şu", "burası", "şurası", "orası",
    "ne", "kim", "nasıl", "nerede", "nereye", "nereden", "ne zaman", "kaç", "neden", "hangi",
    "biri", "bazı", "hiç",
    "dün", "bugün", "yarın", "önce", "şimdi", "sonra", "bazen", "ara sıra", "her zaman", "genellikle",
    "daha", "en", "ile", "ve", "ama", "çünkü", "birinci", "ikinci", "üçüncü",
    "saat", "buçuk", "yarım", "var", "yok", "değil", "gibi", "kadar", "göre", "beri",
]

LEVELS = {"a1": A1}
GRAMMAR = {"a1": GRAMMAR_A1}

BACK = set("aıou")
VOWELS = set("aeıioöuüâîû")


def infinitive(stem):
    """`git` -> `gitmek`, `oku` -> `okumak`: the infinitive suffix by the stem's last vowel."""
    last = [c for c in stem if c in VOWELS][-1]
    return stem + ("mak" if last in BACK or last == "â" else "mek")


def headwords(level):
    """[(headword, page, theme)] in the order read, first occurrence kept."""
    out, seen = [], set()
    rows = [(p, t, ws) for p, t, ws in LEVELS.get(level, [])]
    rows.append((83, "grammar list", GRAMMAR.get(level, [])))
    for page, theme, words in rows:
        for w in words:
            h = infinitive(w[:-1]) if w.endswith("-") else w
            if h not in seen:
                seen.add(h)
                out.append((h, page, theme))
    return out
