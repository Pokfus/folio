#!/usr/bin/env python3
"""The words a frequency list cannot be trusted to supply, written out by hand.

WHY THIS FILE EXISTS.  The level's words are otherwise chosen by corpus
frequency (see `select.py`), and a frequency list built from film subtitles is
wrong for a survival vocabulary in two directions at once.

  · IT UNDER-SERVES THE CLOSED CLASSES.  Numbers past `dua`, the days, the
    months and the compass points are each a small closed set whose members are
    individually rare and collectively indispensable -- `Kamis` sits outside the
    top 3,000 of the subtitle list, and a survival deck with no word for
    Thursday in it is not a survival deck.  This is the DELE generator's own
    finding (`supplement.py` there exists for the same reason) and it holds
    harder here, because Indonesian marks no tense: the time words carry the
    work that a Spanish or German verb ending would.

  · IT OVER-SERVES WHAT FILM DIALOGUE IS ABOUT.  Measured on the top 500 of the
    OpenSubtitles list, `membunuh` (to kill) outranks `air` (water), and
    `sialan`, `bodoh` and `polisi` all arrive before a single word for food,
    money or a day of the week.  That is an accurate description of what people
    say in films and a poor description of what a beginner in Indonesia needs.

WHAT DECIDES THE CONTENTS, and it is not taste.  Two official descriptors:

  · UKBI's own for this predicate -- a candidate at Terbatas "hanya mampu
    berkomunikasi untuk keperluan SINTAS", is able to communicate for survival
    purposes and no further (ukbi.kemendikdasmen.go.id).  Survival is therefore
    the level's stated scope rather than an assumption made here.
  · Permendikbud No. 27/2017, the Standar Kompetensi Lulusan for BIPA, whose
    level 1 is `memperkenalkan diri` and `memenuhi kebutuhan konkret sehari-hari
    dan rutin` -- self-introduction, and concrete everyday routine needs.

So the sections below are the concrete everyday situations those two name:
introducing yourself, telling the time, eating, sleeping somewhere, getting
about, buying something, and being ill.  Nothing here is a word list published
by anybody, and the deck's own description says so in those words.

EVERY ENTRY IS STANDARD INDONESIAN (bahasa baku), because UKBI tests the
standard language.  Where the colloquial form is the one heard far more often
the standard one is what is listed -- `tidak` and not `nggak`, `tetapi` and not
`tapi`, `di mana` as two words and not `dimana`, which is a misspelling that
UKBI actively tests for.  `select.py` drops the colloquial variants on the
dictionary's own tags; this file is where the standard forms are guaranteed in.

A multi-word entry is deliberate and not a mistake: `terima kasih`, `rumah
sakit` and `apa kabar` are single lexical items that a list of single words
cannot see, and each is carried by the dictionary as an entry in its own right.
"""

# ---------------------------------------------------------------- who you are
PRONOUNS = """
saya aku kamu Anda dia ia kami kita mereka beliau nama umur
"""
# `saya` and `Anda` are the formal pair and are what a candidate is examined on;
# `aku` and `kamu` are informal but standard, and are what the subtitle corpus
# is made of.  Both pairs are taught, which is itself the lesson -- Indonesian
# chooses a pronoun by who is being spoken to.  `Anda` is CAPITALISED in
# standard writing, and that is not a typo: the dictionary files the lowercase
# form as an alternative letter-case spelling, so the capital is the headword.

# --------------------------------------------------------- counting and time
NUMBERS = """
nol satu dua tiga empat lima enam tujuh delapan sembilan sepuluh
sebelas seratus seribu juta
pertama kedua terakhir setengah
dua belas
dua puluh
"""
# eleven to nineteen are `-belas` and the tens are `puluh`, so `sebelas`,
# `dua belas` and `dua puluh` are here as the pattern rather than as a run to
# nineteen: a learner who has those three can build the rest.

DAYS = """
hari Senin Selasa Rabu Kamis Jumat Sabtu Minggu
"""
MONTHS = """
bulan Januari Februari Maret April Mei Juni Juli
Agustus September Oktober November Desember
"""
TIME = """
jam menit detik waktu pagi siang sore malam
sekarang nanti tadi besok kemarin lalu tahun minggu
lama sebentar selalu sering kadang jarang
hari ini
"""
# `kadang` and not `kadang-kadang`: the reduplicated form is the commoner one in
# speech and the dictionary does not carry it as an entry, so it would have been
# dropped in silence.  The run reports any supplement item the dictionary cannot
# resolve, which is how this was found rather than shipped.

# ------------------------------------------------------------- asking things
QUESTIONS = """
apa siapa mana kapan mengapa bagaimana berapa
"""
# `di mana` / `ke mana` are in PLACES below, with the prepositions they are
# built from.  `kenapa` is the everyday variant of `mengapa` and is left to the
# frequency fill, which will bring it in on its own.

# ------------------------------------------------------ putting things where
PLACES = """
di ke dari pada untuk dengan tentang oleh sampai antara
dalam luar atas bawah depan belakang samping dekat jauh
sini situ sana kanan kiri lurus
utara selatan timur barat tempat
di mana
ke mana
"""

CONJUNCTIONS = """
dan atau tetapi karena jika kalau ketika saat
supaya sehingga sebelum setelah kemudian juga
"""

# ---------------------------------------------------------------- politeness
# THE SURVIVAL CORE.  If a candidate at this level has nothing else, these are
# what let them be understood as a person rather than as a problem.
GREETINGS = """
halo selamat sama-sama
maaf permisi tolong silakan ya tidak bukan mohon
selamat pagi
selamat siang
selamat sore
selamat malam
selamat datang
selamat tinggal
sampai jumpa
terima kasih
apa kabar
"""

PEOPLE = """
keluarga ayah ibu bapak anak kakak adik suami istri saudara
nenek kakek teman orang laki-laki perempuan pria wanita
"""

# ------------------------------------------------------------------- eating
FOOD = """
makan minum makanan minuman nasi air roti telur ayam ikan daging
sayur buah garam gula kopi teh susu es lapar haus enak pedas manis
restoran warung piring gelas sendok garpu pisau
"""

# ---------------------------------------------------------- being somewhere
LODGING = """
rumah sekolah kantor pasar toko hotel kamar toilet
jalan kota desa negara pintu kunci kursi meja
kamar mandi
"""

# ------------------------------------------------------------------- buying
MONEY = """
uang harga beli jual bayar mahal murah gratis rupiah kartu
"""

# ------------------------------------------------------------------- unwell
HEALTH = """
sakit dokter obat apotek demam batuk pusing
polisi bantuan bahaya hati-hati
rumah sakit
"""

# -------------------------------------------------------------- getting about
TRANSPORT = """
mobil motor sepeda bus kereta pesawat kapal taksi
naik turun pergi datang tiket berhenti bandara stasiun
"""

BODY = """
kepala tangan kaki mata telinga hidung mulut gigi perut badan
"""

COLOURS = """
warna merah biru hijau kuning hitam putih cokelat
"""

# --------------------------------------------------------- describing things
ADJECTIVES = """
besar kecil panjang pendek tinggi rendah baru lama baik buruk
panas dingin banyak sedikit mudah sulit cepat lambat bersih kotor
benar salah penuh kosong senang sedih lelah
"""

# ------------------------------------------------------------------ doing it
VERBS = """
ada pergi datang makan minum tidur bangun duduk berdiri berjalan
berlari berbicara mendengar melihat membaca menulis belajar bekerja
membeli membuka menutup masuk keluar tahu mau bisa harus boleh suka
tinggal membantu menunggu mencari memberi mengambil membawa memakai
bertanya menjawab mengerti lupa ingat mulai selesai membuat bertemu
"""
# The affixed form is listed where that is the form a learner meets -- `membaca`
# rather than `baca`, `mengerti` rather than the root `erti`, which is Malay and
# is not used in Indonesian at all.  `select.py` collapses each of these into one
# card with its whole affix family on it, and picks whichever member of the
# family the corpus says is commonest as the headword, so listing either member
# here reaches the same card.

# ------------------------------------------------------------------ grammar
PARTICLES = """
sudah belum sedang akan masih pernah jangan mungkin
saja lagi sangat sekali terlalu hanya semua setiap beberapa
sebuah orang buah
"""
# the last three are CLASSIFIERS: Indonesian counts with them (`tiga orang
# guru`, `dua buah buku`) and a learner who has the numbers and not these
# cannot use them.

NATURE = """
cuaca hujan matahari angin laut gunung sungai pantai pohon bunga hewan
"""

TALKING = """
bahasa Indonesia kata buku kertas guru murid telepon surat
"""

SECTIONS = {
    'pronouns': PRONOUNS, 'numbers': NUMBERS, 'days': DAYS, 'months': MONTHS,
    'time': TIME, 'questions': QUESTIONS, 'places': PLACES,
    'conjunctions': CONJUNCTIONS, 'greetings': GREETINGS, 'people': PEOPLE,
    'food': FOOD, 'lodging': LODGING, 'money': MONEY, 'health': HEALTH,
    'transport': TRANSPORT, 'body': BODY, 'colours': COLOURS,
    'adjectives': ADJECTIVES, 'verbs': VERBS, 'particles': PARTICLES,
    'nature': NATURE, 'talking': TALKING,
}


def candidates(known):
    """Every supplement item, resolved against the dictionary `known`.

    A PHRASE IS WRITTEN ON A LINE OF ITS OWN; a line holding several
    space-separated words is a list of single words.  That is the whole rule,
    and it is a rule rather than an inference because inferring it does not
    work.

    The first cut scanned each line for the longest run that happened to be a
    dictionary entry, so that phrases could be written inline.  Indonesian
    compounds freely, so a line of ordinary single words contains phrases by
    accident: `kopi teh susu` was resolved as `kopi` plus `teh susu`, which is
    a real entry meaning milk tea, and the deck silently lost its words for tea
    and for milk and gained one for a drink nobody had asked for.  It shipped at
    rank 500 with a frequency of zero, which is the only reason it was seen.

    Splitting on `.split()` alone is the opposite failure and is the one the
    Spanish generator records: it tore `o sea` into two tokens, the second of
    which is a subjunctive that then passed every downstream check as a word
    with no meaning on it.  Here it would break `terima kasih`, `rumah sakit`,
    `di mana`, `dua belas` and `kamar mandi` -- a fifth of the survival core.
    """
    out, missing = [], []
    for name, block in SECTIONS.items():
        for line in block.strip().splitlines():
            line = line.strip()
            if not line:
                continue
            if ' ' in line and line in known:
                out.append((line, name))          # a phrase, on its own line
                continue
            for w in line.split():
                if w in known:
                    out.append((w, name))
                else:
                    missing.append((w, name))
    return out, missing


if __name__ == '__main__':
    import json, sys
    known = set(json.load(open(sys.argv[1])))
    got, missing = candidates(known)
    seen, uniq = set(), []
    for w, sec in got:
        if w not in seen:
            seen.add(w)
            uniq.append(w)
    json.dump(uniq, open(sys.argv[2], 'w'), ensure_ascii=False)
    print(f'    supplement: {len(uniq)} items across {len(SECTIONS)} sections')
    if missing:
        print(f'    NOT IN THE DICTIONARY ({len(missing)}): '
              + ', '.join(f'{w} [{s}]' for w, s in missing))
