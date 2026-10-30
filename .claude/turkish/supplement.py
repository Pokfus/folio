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

FROM A2 UP THE PROGRAMME GIVES NO VOCABULARY, and says so.  Its A2 table
(p. 255, "Açıklamalar") reads: "A1 izlence tablolarında 'söz varlığı'
verilmesine karşın seviye ve konular göz önünde bulundurularak sınırlama
olmaması açısından A2'de 'Söz Varlığı' kısmı verilmemiştir" -- the column was
left out so as not to LIMIT the level -- and B1, B2 and C1 have none either.
What each level still states is its SCOPE: ten themes, each with "Örnek
Konular" (suggested topics), and the grammar list.  So from A2 the inventory is
FOLIO'S, written here for the programme's own topics, theme by theme with the
page -- the UKBI arrangement, where the board states the scope and the generator
writes the words -- and the deck's description says exactly that.  Only the
closed classes the A2 grammar list itself names (`GRAMMAR_A2`) are the
programme's words.  This was found while building A2 (Oct 2026); the plan had
assumed every level carried a column.

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


# Ortaöğretim A2, pp. 255-264.  FOLIO'S words for the programme's "Örnek Konular" (the topics quoted in
# each theme's line); the programme lists no A2 vocabulary.  Words A1 taught are dropped by `select.py`.
A2 = [
    (255, "1 Tatil Dönüşü — holiday memories and places, the first week at school, new friends", [
        "anı", "plaj", "kumsal", "otel", "köy", "şehir", "kasaba", "ada", "göl", "nehir", "fotoğraf",
        "hediye", "dönem", "ders", "sınav", "not", "tanış-", "tanıştır-", "tanı-", "öğren-", "öğret-",
        "anlat-", "hatırla-", "unut-", "eğlen-", "eğlenceli", "sıkıcı", "memnun", "tekrar",
    ]),
    (256, "2 Hafta Sonu Planın Ne? — weekend plans, clubs, cinema, theatre, concerts, posters, tickets", [
        "gezi", "etkinlik", "kulüp", "kurs", "sinema", "tiyatro", "konser", "film", "sergi", "afiş",
        "program", "gişe", "davet", "buluş-", "katıl-", "izle-", "seyret-", "gez-", "bit-", "bitir-",
        "boş", "eğlence", "ücretsiz",
    ]),
    (257, "3 Bir Günüm — daily routines, hobbies, the timetable, after-school activities", [
        "kahvaltı", "satranç", "şarkı", "çizelge", "teneffüs", "ödev", "kalk-", "hazırlan-", "duş",
        "fırça", "fırçala-", "erken", "geç", "dakika", "saniye", "çeyrek", "hobi",
    ]),
    (258, "4 Şimdi Haberler — the news (technology, music, art, sport), the weather, the seasons", [
        "haber", "gazete", "dergi", "televizyon", "internet", "teknoloji", "sanat", "sanatçı", "şarkıcı",
        "takım", "maç", "kazan-", "kaybet-", "yarışma", "ödül", "olay", "kaza", "yangın", "deprem",
        "derece", "fırtına", "şimşek", "niçin", "niye",
    ]),
    (259, "5 Dedemin Mesleği Bana Göre mi? — careers, professions, the extended family, preferences", [
        "meslek", "kariyer", "işçi", "memur", "avukat", "hâkim", "mimar", "çiftçi", "satıcı", "kuaför",
        "berber", "pilot", "gazeteci", "yazar", "ressam", "eczacı", "aile", "akraba", "kuzen", "yeğen",
        "torun", "eş", "koca", "enişte", "yenge", "abla", "ağabey", "abi", "anneanne", "babaanne",
        "evli", "bekâr", "evlen-", "tercih", "seç-", "beğen-", "hayal", "maaş", "şirket", "ofis",
        "çalışkan", "tembel",
    ]),
    (260, "6 Hayat Birlikte Güzel — rules at home, at school, in traffic, in shops", [
        "kural", "yasak", "uy-", "dikkat", "dikkatli", "çöp", "temiz", "kirli", "temizle-", "sessiz",
        "gürültü", "saygı", "komşu", "apartman", "misafir", "paylaş-", "ceza", "kask", "hız", "yavaş",
        "hızlı", "kasa", "fiş", "indirim", "öde-",
    ]),
    (261, "7 Akıllı İletişim — technology, smartphones, games, instructions, complaints", [
        "telefon", "akıllı", "bilgisayar", "tablet", "ekran", "uygulama", "mesaj", "şifre", "şarj", "pil",
        "kablo", "düğme", "aç-", "kapat-", "indir-", "yükle-", "gönder-", "kullan-", "talimat", "oyun",
        "şikâyet", "dilekçe", "bozuk", "bozul-", "tamir", "garanti",
    ]),
    (262, "8 Spor Yapıyorum Sağlıklı Besleniyorum — sports, games, healthy eating, habits, shopping", [
        "futbol", "basketbol", "voleybol", "tenis", "yüzme", "koşu", "antrenman", "sağlık", "sağlıklı",
        "sağlıksız", "beslenme", "beslen-", "diyet", "vitamin", "sebze", "meyve", "kalori", "yağlı",
        "şişman", "zayıf", "alışkanlık", "egzersiz", "blog",
    ]),
    (263, "9 Bir Hikâyem Var — tales, stories, fables (animal names), memories, feelings", [
        "masal", "hikâye", "kahraman", "prens", "prenses", "kral", "kraliçe", "aslan", "kurt", "tilki",
        "ayı", "kaplan", "tavşan", "kaplumbağa", "karga", "yılan", "maymun", "kuş", "eşek", "duygu",
        "korku", "kork-", "sevinç", "sevin-", "kız-", "ağla-", "gül-", "şaşır-", "utan-", "mutluluk",
        "üzüntü", "merak", "meraklı",
    ]),
    (264, "10 Gezi-Yorum — travel, work, transport and accommodation, tourism, camping and nature", [
        "seyahat", "yolculuk", "turist", "turizm", "rehber", "harita", "pasaport", "vize", "havalimanı",
        "istasyon", "liman", "otogar", "bavul", "çadır", "tabiat", "doğa", "çiçek", "şelale", "kıyı",
        "tur", "kirala-", "kültür", "kültürel", "tarih", "tarihi",
    ]),
]

# §7, A2 (p. 83): the closed classes and fixed words its grammar list names (and theme 8's indefinites).
GRAMMAR_A2 = [  # the programme's own words
    "hem", "veya", "belki", "ya", "mesela", "örneğin", "sebep", "gerek", "lazım", "zorunda",
    "kesinlikle", "mutlaka", "sadece", "ayrıca", "aynı", "beğen-", "tercih", "seç-", "hoşlan-",
    "cevap", "birkaç", "birçok", "çoğu", "hepsi", "hiçbiri",
]

# Ortaöğretim B1, pp. 265-274, and B1+, pp. 275-284 -- B1+ folded into B1 on request (Oct 2026).
# FOLIO'S words for each theme's "Örnek Konular"; the programme lists no B1 vocabulary.
B1 = [
    (265, "B1 1 Dostluk Köprüsü — the start of a course, new friendships, feelings, enrolment, places", [
        "arkadaşlık", "dostluk", "kayıt", "başvuru", "belge", "form", "imza", "kimlik", "bölüm", "kampüs",
        "yurt", "salon", "tesis", "his", "heyecan", "yalnızlık", "samimi", "utangaç", "kaygı", "tanıtım",
    ]),
    (266, "B1 2 Hayatın İçinden — school elections, club choices, school and current news, subject choice", [
        "seçim", "aday", "oy", "kampanya", "seçmek", "temsilci", "başkan", "konuşma", "destek",
        "desteklemek", "duyuru", "güncel", "fen", "bilim", "sosyal", "alan", "kafe", "ders", "toplum",
    ]),
    (267, "B1 3 Eğlence Zamanı — entertainment in the past, traditions, festivals and holidays, music", [
        "gelenek", "geleneksel", "festival", "bayram", "kutlama", "kutlamak", "tören", "eğlenmek", "çalgı",
        "enstrüman", "davul", "zurna", "saz", "gitar", "piyano", "keman", "nota", "tür", "halk", "oyun",
        "şenlik", "seyirci", "sahne",
    ]),
    (268, "B1 4 Afiyet Olsun — menus, healthy eating, fast food, recipes, Turkish cuisine, table manners", [
        "tarif", "malzeme", "pişirmek", "kızartmak", "haşlamak", "doğramak", "karıştırmak", "fırın",
        "tencere", "tava", "tabak", "bardak", "peçete", "sofra", "çorba", "pilav", "salata", "tatlı",
        "baharat", "tuz", "un", "kıyma", "sos", "lezzetli", "taze", "acıkmak", "doymak", "susamak",
        "ziyafet", "görgü",
    ]),
    (269, "B1 5 Doğaya Kulak Ver — pollution, environmental awareness, people and nature, recycling", [
        "çevre", "kirlilik", "kirletmek", "atık", "plastik", "cam", "kâğıt", "geri dönüşüm", "enerji",
        "doğal", "korumak", "zarar", "tüketim", "tüketmek", "israf", "hava", "toprak", "duman", "sorumluluk",
        "bilinç", "gezegen",
    ]),
    (270, "B1 6 Dostluk Kazansın — famous athletes, competitions, traditional sports, fair play", [
        "sporcu", "şampiyon", "şampiyona", "müsabaka", "yarış", "rakip", "hakem", "taraftar", "stadyum",
        "madalya", "kupa", "gol", "skor", "beraberlik", "güreş", "okçuluk", "ahlak", "kural", "hile",
        "dürüst", "centilmen", "yenmek", "yenilmek",
    ]),
    (271, "B1 7 Teknoloji Çağı — technical texts, manuals, instructions, requests and complaints, the future", [
        "kılavuz", "cihaz", "makine", "alet", "teknik", "gelişme", "icat", "fayda", "faydalı", "zararlı",
        "talep", "istek", "şikâyet", "robot", "yapay", "dijital", "elektrik", "kurulum", "ayar", "sorunsuz",
    ]),
    (272, "B1 8 Evvel Zaman İçinde — tales, stories, legends, jokes, fables", [
        "efsane", "fıkra", "fabl", "masal", "dev", "cin", "peri", "padişah", "sultan", "saray", "köylü",
        "kurnaz", "akıllı", "aptal", "ders", "sonunda", "evvel", "olay", "kahraman",
    ]),
    (273, "B1 9 Kendini Keşfet — personality, empathy, personalities and professions, future jobs", [
        "kişilik", "özellik", "karakter", "empati", "sabır", "sabırlı", "cesur", "cesaret", "kibar", "kaba",
        "cömert", "cimri", "sorumlu", "yetenek", "yetenekli", "güven", "özgüven", "anket", "hedef",
    ]),
    (274, "B1 10 Sanal Dünya, Sanal İletişim — social media, online dangers, online shopping", [
        "sosyal medya", "hesap", "profil", "paylaşım", "takipçi", "beğeni", "yorum", "sanal", "zorbalık",
        "korsan", "tehlike", "tehlikeli", "güvenli", "kişisel", "gizlilik", "dolandırıcı", "sipariş",
        "kargo", "ödeme", "kredi kartı", "site",
    ]),
    (275, "B1+ 1 Ben, Arkadaşlarım ve Çevrem — letters between friends, personality, interests, plans", [
        "mektup", "zarf", "pul", "posta", "ilgi", "uğraş", "merak", "plan", "planlamak", "çevre", "mahalle",
        "semt", "kişilik",
    ]),
    (276, "B1+ 2 Birlikte Yaşıyoruz — family communication, neighbours, helping each other, cultures", [
        "iletişim", "komşuluk", "yardımlaşma", "dayanışma", "kültür", "birlik", "saygı", "hoşgörü",
        "anlayış", "fark", "farklılık", "ortak", "bağ", "ilişki", "tartışma", "tartışmak", "barış",
    ]),
    (277, "B1+ 3 Şimdi Haberler — news texts on culture, art, sport, the economy, education, health", [
        "haber", "manşet", "muhabir", "röportaj", "ekonomi", "ekonomik", "fiyat", "artış", "düşüş",
        "eğitim", "öğretim", "üniversite", "hastalık", "tedavi", "aşı", "salgın", "açıklama", "rapor",
    ]),
    (278, "B1+ 4 Dünya Bir Sahne — theatre and cinema, posters, advertisements, traditional Turkish stage arts", [
        "oyuncu", "rol", "senaryo", "yönetmen", "perde", "sahne", "gösteri", "reklam", "ilan", "afiş",
        "karagöz", "meddah", "kukla", "alkış", "alkışlamak", "eleştiri", "modern",
    ]),
    (279, "B1+ 5 Büyük Buluşlar Çılgın Mucitler — inventions, science fairs, inventors", [
        "buluş", "mucit", "icat", "keşif", "keşfetmek", "bilim insanı", "deney", "fuar", "proje",
        "araştırma", "araştırmak", "sonuç", "başarı", "başarısız", "ilginç", "tasarım",
    ]),
    (280, "B1+ 6 Kıyafetler ve Renkler — choosing clothes, sizes, returns and exchanges", [
        "kıyafet", "elbise", "etek", "pantolon", "ceket", "takım", "ayakkabı", "beden", "numara", "dar",
        "bol", "uygun", "iade", "değişim", "değiştirmek", "fatura", "kumaş", "pamuk", "yün", "moda",
        "renkli", "koyu", "açık",
    ]),
    (281, "B1+ 7 İnsanlar ve Mekânlar — homes across cultures, journeys into the past, famous buildings", [
        "mekân", "yapı", "bina", "saray", "kule", "piramit", "tapınak", "kale", "müze", "antik", "tarihî",
        "yüzyıl", "ziyaret", "ziyaret etmek", "mimari", "kalıntı", "medeniyet", "uygarlık",
    ]),
    (282, "B1+ 8 Kıssadan Hisse — comics, cartoons, jokes, fables, riddles, tongue-twisters, comedy", [
        "çizgi", "karikatür", "mizah", "bilmece", "tekerleme", "espri", "gülünç", "komedi", "hisse",
        "anlam", "mesaj",
    ]),
    (283, "B1+ 9 Bayramınız Kutlu Olsun — holiday mornings, traditions, festivals, ceremonies, gifts", [
        "bayram", "gelenek", "görenek", "tören", "kutlama", "hediyeleşmek", "ziyaret", "akraba", "şeker",
        "kurban", "ramazan", "tebrik", "kutlu", "mübarek",
    ]),
    (284, "B1+ 10 Doğayı Keşfediyorum — alone in nature, camping, natural events, landforms, wildlife", [
        "doğa", "canlı", "vahşi", "yaban", "hayvan", "bitki", "habitat", "yeryüzü", "ova", "vadi", "tepe",
        "yayla", "mağara", "çöl", "volkan", "sel", "çığ", "kuraklık", "iklim", "duyuru",
    ]),
]

# §7, B1 (p. 84): the conjunctions and postpositions its grammar list names.
GRAMMAR_B1 = [  # the programme's own words
    "keşke", "eğer", "sanki", "üzere", "doğru", "karşı", "değin", "dek", "dolayı", "yalnız", "ancak",
    "karşın", "rağmen", "fakat", "bile", "ise", "yanı sıra", "ayrıca", "hatta", "aksine", "hariç",
    "öncelikle", "artık", "itibaren", "dolayısıyla", "yüzünden", "sayesinde", "örnek", "yine",
]

# Ortaöğretim B2, pp. 285-294.  FOLIO'S words for each theme's "Örnek Konular"; the programme lists no
# B2 vocabulary.
B2 = [
    (285, "B2 1 Dünyayı Dönüştürenler — biographies of scientists and historical figures, discoveries, events", [
        "biyografi", "hayat hikâyesi", "doğmak", "ölüm", "dönem", "çağ", "imparatorluk", "imparator", "fetih",
        "fethetmek", "devrim", "reform", "olgu", "kaşif", "bilgin", "düşünür", "filozof", "kuram", "yayımlamak",
        "eser", "katkı", "etkilemek", "infografik", "dizge", "sıralamak", "kronoloji", "anlatım",
    ]),
    (286, "B2 2 Mecazların Dünyası — idioms and proverbs, poetry, humour, folk songs, stories, legends", [
        "mecaz", "mecazi", "deyim", "atasözü", "şiir", "şair", "dize", "kafiye", "türkü", "edebiyat",
        "anlatıcı", "öykü", "simge", "sembol", "benzetme", "abartı", "gerçek", "ima", "ironi", "anlamak",
        "yorumlamak", "nükte",
    ]),
    (287, "B2 3 Bir Açık Hava Müzesi: Anadolu — historical and natural sites, travel writing, outsiders' views", [
        "Anadolu", "katalog", "peribacası", "antik kent", "harabe", "ören yeri", "kazı", "arkeolog", "arkeoloji",
        "heykel", "kabartma", "mozaik", "tiyatro", "tapınak", "seyyah", "seyahatname", "gezgin", "izlenim",
        "miras", "eşsiz", "büyüleyici", "kalıntı", "tarih öncesi", "medeniyet",
    ]),
    (288, "B2 4 Kariyer Planım — career aptitude tests, personality inventories, jobs of the future", [
        "eğilim", "envanter", "yetkinlik", "beceri", "deneyim", "tecrübe", "özgeçmiş", "mülakat", "staj",
        "stajyer", "işveren", "çalışan", "terfi", "istifa", "emeklilik", "sektör", "alan", "uzmanlık",
        "girişimci", "serbest", "mesai", "verimli", "hedef", "motivasyon",
    ]),
    (289, "B2 5 Türkiye'de Öğrenci Olmak — the education system, housing, universities, applications, permits", [
        "eğitim sistemi", "lisans", "yüksek lisans", "doktora", "fakülte", "rektör", "dekan", "akademisyen",
        "burs", "harç", "kontenjan", "barınma", "konut", "kira", "broşür", "başvurmak", "denklik", "diploma",
        "transkript", "oturma izni", "vize", "pasaport", "noter", "tercüme", "onaylamak", "belgelemek",
        "kayıt yaptırmak", "dönem", "yurt",
    ]),
    (290, "B2 6 Geleceğin Dünyası — science and technology, online shopping, consumerism, AI, utopia", [
        "yapay zekâ", "kodlama", "algoritma", "yazılım", "donanım", "otomasyon", "otomatik", "veri", "ağ",
        "tüketici", "tüketim", "çılgınlık", "reklam", "marka", "ütopya", "distopya", "kurgu", "bilim kurgu",
        "uluslararası", "küresel", "yenilik", "ilerleme", "insansız",
    ]),
    (291, "B2 7 Kültür Atlası — marriage rituals, customs and beliefs, from birth to death, seasonal festivals", [
        "ritüel", "âdet", "inanç", "batıl", "gelin", "damat", "nişan", "kına", "çeyiz", "nikâh", "söz",
        "belgesel", "doğum", "sünnet", "cenaze", "yas", "taziye", "nevruz", "takvim", "uğur", "uğursuz",
        "nazar", "dilek", "isim koymak",
    ]),
    (292, "B2 8 Sular Isınıyor — natural disasters, pollution, global warming, recycling, renewable energy", [
        "afet", "doğal afet", "deprem", "sel", "heyelan", "tsunami", "kasırga", "orman yangını", "küresel ısınma",
        "iklim değişikliği", "sera", "karbon", "emisyon", "fosil", "yakıt", "yenilenebilir", "güneş enerjisi",
        "rüzgâr", "nükleer", "sürdürülebilir", "önlem", "tedbir", "buzul", "erimek", "kuraklık",
    ]),
    (293, "B2 9 Kitap Kurdu — the history of writing, e-books, reviews, libraries, literary texts, book fairs", [
        "kitap kurdu", "yazı", "matbaa", "basım", "yayınevi", "yayımcı", "baskı", "e-kitap", "sesli kitap",
        "eleştirmen", "değerlendirme", "özet", "bülten", "edebî", "roman", "romancı", "öykü", "deneme",
        "anı", "okur", "okuyucu", "imza günü", "kitapçı", "raf", "serüven",
    ]),
    (294, "B2 10 Müziğin Dünyası — Turkish song and folk song, musicians' lives, world music and instruments", [
        "müzisyen", "besteci", "beste", "bestelemek", "söz yazarı", "söyleşi", "albüm", "konser", "orkestra",
        "koro", "şef", "solist", "melodi", "ritim", "ezgi", "nota", "tarz", "caz", "klasik", "halk müziği",
        "bağlama", "ud", "kanun", "ney", "flüt",
    ]),
]

# §7, B2 (p. 84): the conjunctions and fixed expressions its grammar list names.
GRAMMAR_B2 = [  # the programme's own words
    "oysaki", "hâlbuki", "meğerse", "mademki", "ne var ki", "veyahut", "lâkin", "dahi", "öyleyse", "oysa",
    "yeter ki", "bilakis", "bari", "bundan böyle", "şayet", "takdirde", "süresince", "ilaveten", "oranla",
    "nispetle", "kıyasla", "varsaymak", "farz etmek", "muhtemelen", "olanaklı", "olası", "öngörmek",
]

LEVELS = {"a1": A1, "a2": A2, "b1": B1, "b2": B2}
GRAMMAR = {"a1": GRAMMAR_A1, "a2": GRAMMAR_A2, "b1": GRAMMAR_B1, "b2": GRAMMAR_B2}
GRAMMAR_PAGE = {"a1": 83, "a2": 83, "b1": 84, "b2": 84}
LISTED = {"a1"}        # the levels whose inventory is the programme's own column (the rest are Folio's)

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
    rows.append((GRAMMAR_PAGE.get(level, 83), "grammar list", GRAMMAR.get(level, [])))
    for page, theme, words in rows:
        for w in words:
            h = infinitive(w[:-1]) if w.endswith("-") else w
            if h not in seen:
                seen.add(h)
                out.append((h, page, theme))
    return out
