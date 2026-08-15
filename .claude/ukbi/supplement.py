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
from ukbi_level import LEVEL

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

SECTIONS_1 = {
    'pronouns': PRONOUNS, 'numbers': NUMBERS, 'days': DAYS, 'months': MONTHS,
    'time': TIME, 'questions': QUESTIONS, 'places': PLACES,
    'conjunctions': CONJUNCTIONS, 'greetings': GREETINGS, 'people': PEOPLE,
    'food': FOOD, 'lodging': LODGING, 'money': MONEY, 'health': HEALTH,
    'transport': TRANSPORT, 'body': BODY, 'colours': COLOURS,
    'adjectives': ADJECTIVES, 'verbs': VERBS, 'particles': PARTICLES,
    'nature': NATURE, 'talking': TALKING,
}


# ===========================================================================
# LEVEL 2 — MARGINAL.  A DIFFERENT INVENTORY, NOT A LONGER ONE.
# ===========================================================================
# Terbatas is survival; Marginal is the step past it, and UKBI draws the line
# itself rather than leaving it to be guessed.  Its descriptor says a candidate
# here "memiliki kemahiran yang tidak memadai" -- proficiency that is not
# adequate -- and can manage **keperluan kemasyarakatan yang sederhana**, simple
# community purposes, while being unready for complex community communication,
# for any **keprofesian** (professional) purpose, and for **keilmiahan**
# (academic) purposes at all.  Semenjana, the level above, is where
# straightforward workplace communication begins.
#
# THAT EXCLUSION IS THE MOST USEFUL THING THE DESCRIPTOR SAYS, and it is
# obeyed.  The obvious way to write an intermediate list is to reach for the
# workplace -- rapat, laporan, atasan, jabatan, perusahaan -- and every one of
# those belongs to a level this one explicitly cannot reach.  So this inventory
# is social and domestic: the life a person lives among neighbours rather than
# the one they live at a desk.  A handful of school words are here because
# talking about going to school is social, and the academic register they open
# onto is not.
#
# A word already taught at level 1 costs nothing to list -- `words_below()`
# excludes it against the SHIPPED deck -- so a section is written whole for
# readability rather than pruned against the level below by hand.

# --------------------------------------------------------- describing people
L2_PEOPLE = """
sifat ramah sopan sabar rajin malas jujur sombong pandai pintar
cantik tampan gemuk kurus rambut wajah kulit dewasa remaja bayi
tetangga tamu sahabat kenalan masyarakat warga penduduk
"""

# ------------------------------------------------------------- how you feel
L2_FEELINGS = """
perasaan marah kecewa bangga malu khawatir gembira bahagia
kesal rindu kaget heran bosan tenang nyaman puas
"""

# ---------------------------------------------------------------- the house
L2_HOME = """
dapur halaman atap dinding lantai jendela tangga lemari
kasur bantal selimut handuk sabun cermin lampu listrik sampah
sapu mencuci memasak membersihkan memperbaiki menyimpan membuang
"""

L2_CLOTHES = """
pakaian baju celana rok kemeja jaket sepatu sandal topi tas
kacamata ukuran memakai melepas
"""

# ------------------------------------------------------------- what you eat
L2_FOOD = """
sarapan goreng merebus resep bumbu bawang cabai kecap minyak
mentega keju kue camilan asam pahit hambar kenyang memesan
sayuran daging ikan telur beras mi
"""

# ------------------------------------------------- shopping and errands
L2_ERRANDS = """
belanja kasir antre menawar kembali bank tunai
paket menerima mengirim alamat prangko
"""

# ------------------------------------------------------------- going places
L2_TRAVEL = """
perjalanan liburan wisata penginapan peta arah belok menyeberang
jembatan persimpangan macet berangkat tiba terlambat penumpang sopir
bensin parkir kecelakaan
"""

# ------------------------------------------------------------ being unwell
L2_HEALTH = """
kesehatan sehat penyakit flu luka berdarah istirahat olahraga
memeriksa sembuh perawat rumah
"""

# ------------------------------------------------------- weather and country
L2_NATURE = """
musim banjir gempa awan petir badai sejuk lingkungan
sawah kebun tanah batu pasir langit bintang tanaman
kucing anjing burung sapi kambing kuda tikus nyamuk semut ular
"""

# ---------------------------------------------------------- telling a story
L2_NARRATION = """
akhirnya nyata biasanya tiba-tiba sementara sejak hingga
zaman abad peristiwa kejadian cerita
bercerita menceritakan menjelaskan mengundang menawarkan menolak
berjanji mengucapkan berita koran televisi radio
"""

# ------------------------------------------------------- saying what you think
L2_OPINION = """
pendapat setuju alasan contoh misalnya sebaiknya
padahal walaupun meskipun apalagi tentu
"""

# ------------------------------------------------------- how much, how many
L2_QUANTITY = """
jumlah meter liter potong butir lembar pasang
seluruh sebagian kira-kira sekitar paling kurang
"""

# ------------------------------------------------- what a neighbourhood does
# The community half of `kemasyarakatan`: the festivals, the observances and
# the customs a person is expected to be able to talk about with neighbours.
L2_COMMUNITY = """
agama masjid gereja doa berdoa puasa upacara tradisi adat budaya
undangan pesta pernikahan menikah lahir meninggal
kampung desa
hari raya
ulang tahun
"""

# --------------------------------------------------------- school, but not study
# Marginal cannot reach `keilmiahan`, so this is deliberately six words about
# ATTENDING a school rather than any of the vocabulary of studying in one.
L2_SCHOOL = """
pelajaran kelas ujian tugas siswa mahasiswa
"""

# --------------------------------------------------------------- doing things
L2_VERBS = """
mengunjungi mengajak mengantar jemput meminjam mengembalikan
menolong menjaga memilih gagal mengajar bermain berenang menari
menyanyi menggambar menonton tertawa menangis tersenyum berteriak
berbaring pindah nyala mematikan mengunci menghitung mengubah
mengikuti membawa mengangkat menarik mendorong melempar menendang
"""

# ------------------------------------------------------------- describing it
L2_ADJECTIVES = """
ramai sepi sibuk santai aman menarik lucu serius lengkap
berbeda mirip asli palsu modern indah jelek keras lembut tajam
basah kering tebal tipis berat ringan luas sempit gelap terang
dangkal sunyi
"""

# --------------------------------------------------------------- the body
L2_BODY = """
leher bahu punggung dada jari kuku lidah bibir pipi dagu jantung darah
"""

SECTIONS_2 = {
    'people': L2_PEOPLE, 'feelings': L2_FEELINGS, 'home': L2_HOME,
    'clothes': L2_CLOTHES, 'food': L2_FOOD, 'errands': L2_ERRANDS,
    'travel': L2_TRAVEL, 'health': L2_HEALTH, 'nature': L2_NATURE,
    'narration': L2_NARRATION, 'opinion': L2_OPINION,
    'quantity': L2_QUANTITY, 'community': L2_COMMUNITY,
    'school': L2_SCHOOL, 'verbs': L2_VERBS, 'adjectives': L2_ADJECTIVES,
    'body': L2_BODY,
}


# ===========================================================================
# LEVEL 3 — SEMENJANA.  THE LEVEL THAT OPENS THE WORKPLACE.
# ===========================================================================
# UKBI's descriptor is what decides this, and for once the line it draws is a
# door rather than a wall.  A candidate at Semenjana "memiliki kemahiran yang
# cukup memadai" -- reasonably adequate proficiency -- and can communicate for
# **keperluan sintas**, for **keprofesian yang tidak kompleks** and for
# **kemasyarakatan yang tidak kompleks**: survival, NON-COMPLEX PROFESSIONAL and
# non-complex community purposes.  What stays shut is the academic register:
# "Dalam berkomunikasi untuk keperluan **keilmiahan**, yang bersangkutan sangat
# terkendala."  (ukbi.kemendikdasmen.go.id/front-new/page/predikat, quoted.)
#
# SO THIS INVENTORY IS THE ONE LEVEL 2 REFUSED TO WRITE.  Marginal's header says
# in as many words that the obvious way to write an intermediate list is to reach
# for the workplace -- rapat, laporan, atasan, jabatan, perusahaan -- and that
# every one of those belongs to a level Marginal explicitly cannot reach.  This
# is that level, so those words are here, and the two headers should be read
# together: the same list is wrong one level down and right one level up, and
# the descriptor is what says which.
#
# WHAT IS STILL EXCLUDED, and it is the harder half to hold to.  `keilmiahan` is
# out, so there is no `hipotesis`, `metodologi`, `variabel`, `kutipan`,
# `analisis`, `disertasi` -- none of the vocabulary of writing or reading
# research.  And `kompleks` is out on both the open registers, so the workplace
# here is the one a person WORKS IN rather than the one they negotiate: a job, a
# rota, a colleague, a payslip, a form to sign, a meeting to attend.  A contract
# is listed because signing one is an ordinary act; the law of contract is not.
#
# THE OTHER HALF OF THIS LEVEL IS NOT A TOPIC AT ALL.  By Semenjana a learner
# needs the connective and abstract vocabulary that lets three sentences become a
# paragraph -- `sehingga`, `meskipun`, `oleh karena itu`, `sebaliknya`, and the
# `ke-...-an` and `peN-...-an` nouns Indonesian builds its abstractions out of
# (`keadaan`, `perubahan`, `peningkatan`, `penyelesaian`).  A frequency list
# built from film dialogue serves those worst of anything, because people do not
# say them aloud: this is the same argument the closed classes made at level 1,
# arriving one level up in another form.

# --------------------------------------------------------------- having a job
L3_WORK = """
pekerjaan karyawan pegawai staf atasan bawahan rekan kantor
perusahaan jabatan tugas jadwal rapat laporan proyek klien
pelanggan gaji upah lembur cuti izin kontrak lamaran wawancara
pengalaman keahlian pelatihan promosi pensiun magang karier
kerja sama
jam kerja
"""

# --------------------------------------------------------- what people do for it
# Trades and professions, which a survival level has no use for and a
# non-complex professional one is largely made of.
L3_TRADE = """
insinyur perawat pengacara akuntan penerjemah wartawan petani
nelayan pedagang penjual pembeli sopir montir tukang pelayan
koki pengusaha buruh seniman penulis pelukis peneliti
arsitek juru masak
"""

# ------------------------------------------------------------ the paperwork
L3_OFFICE = """
dokumen berkas formulir arsip salinan catatan agenda presentasi
stempel cetak
tanda tangan
"""

# --------------------------------------------------------------- money, at a bank
L3_MONEY = """
bank rekening tabungan pinjaman utang kredit bunga biaya tarif
pajak kuitansi anggaran penghasilan pengeluaran untung rugi modal
investasi asuransi tunai
kartu kredit
"""

# ----------------------------------------------------- the state, and its offices
# `kemasyarakatan yang tidak kompleks`: the counter you queue at, not the
# politics behind it.
L3_GOV = """
pemerintah negara kabupaten kecamatan kelurahan paspor visa
identitas akta sertifikat peraturan hukum pengadilan hak kewajiban
penduduk pejabat lembaga kantor pos
warga negara
kartu tanda penduduk
"""

# ------------------------------------------------------------ getting in touch
L3_MEDIA = """
telepon ponsel pesan surel internet situs jaringan sinyal siaran
berita koran majalah radio televisi iklan pengumuman informasi
alamat sandi
"""

# ------------------------------------------------------- somewhere to live in
L3_HOUSING = """
sewa pemilik listrik gas tagihan perbaikan kerusakan
lingkungan perumahan gedung lantai atap dinding pagar halaman
"""

# ---------------------------------------------------------- arranging a journey
L3_TRAVEL = """
tiket keberangkatan kedatangan penerbangan bandara pelabuhan
stasiun terminal penginapan bagasi perjalanan tujuan singgah
kendaraan penumpang jurusan
"""

# --------------------------------------------------------------- being treated
L3_HEALTH = """
klinik apotek resep suntik operasi pemeriksaan gejala penyakit
perawatan kesehatan pasien
"""

# ------------------------------------------------ how a thing happens, and why
# The abstract nouns Indonesian derives rather than borrows.  These are the
# words a paragraph is built out of, and the subtitle corpus has almost none of
# them, because nobody says `penyelesaian` in a film.
L3_PROCESS = """
proses cara langkah tahap sebab akibat hasil syarat aturan contoh
perbedaan persamaan hubungan pengaruh perubahan perkembangan
peningkatan penurunan kemungkinan keputusan pilihan penyelesaian
kesalahan tujuan kegiatan usaha bagian jenis sifat bentuk
"""

# ------------------------------------------------------- joining the sentences
L3_CONNECT = """
sehingga meskipun walaupun namun selain kecuali apabila asal
supaya agar sementara selama pertama-tama misalnya
yaitu bahkan justru sebaliknya bagaimanapun
oleh karena itu
dengan demikian
akan tetapi
di samping itu
"""

# ------------------------------------------------------------- saying what you think
L3_OPINION = """
pendapat alasan bukti sikap tanggapan saran kritik keluhan
permintaan penawaran kesepakatan perjanjian tanggung jawab
kepercayaan harapan kekhawatiran maksud kesan
"""

# -------------------------------------------------------- measuring and comparing
L3_QUANTITY = """
jumlah sebagian seluruh setengah seperempat persen sekitar ukuran
lebar jarak kecepatan rata-rata kira-kira tambahan
"""

# --------------------------------------------------------------- time, at length
L3_TIME = """
masa zaman abad periode jarang biasanya dahulu kelak mendatang
belakangan
"""

# ---------------------------------------------------------- describing precisely
L3_ADJ = """
penting utama umum khusus resmi tetap aman berbahaya sulit rumit
sederhana jelas tepat wajar layak pantas mampu sanggup siap luang
mendadak langsung wajib mungkin pasti
"""

# ---------------------------------------------------------------- doing things
L3_VERBS = """
mengatur urus menangani menyelesaikan memutuskan menyarankan
mengusulkan menolak setuju banding menjelaskan
sebut menganggap memperhatikan harap butuh
memerlukan menyediakan menggunakan memanfaatkan meningkatkan
mengurangi memperbaiki mengganti melanjutkan menghentikan berusaha
berhasil hadap mendukung mengatasi
menerima mengirim mendaftar lapor membayar
"""

SECTIONS_3 = {
    'work': L3_WORK, 'trades': L3_TRADE, 'office': L3_OFFICE,
    'money': L3_MONEY, 'the state': L3_GOV, 'media': L3_MEDIA,
    'housing': L3_HOUSING, 'travel': L3_TRAVEL, 'health': L3_HEALTH,
    'process': L3_PROCESS, 'connectives': L3_CONNECT,
    'opinion': L3_OPINION, 'quantity': L3_QUANTITY, 'time': L3_TIME,
    'adjectives': L3_ADJ, 'verbs': L3_VERBS,
}


# ===========================================================================
# LEVEL 4 — MADYA.  THE SAME WORLD, DONE WELL.
# ===========================================================================
# Every level below this one is defined by what it CANNOT do.  Madya is the
# first that is defined by doing something properly: a candidate here "mampu
# berkomunikasi untuk keperluan sintas dan kemasyarakatan **dengan baik**" --
# for survival and community purposes WELL, both now unqualified, where
# Semenjana could manage only the `tidak kompleks` end of the community
# register.  What is still short is the top of the professional one ("masih
# mengalami kendala dalam hal keprofesian yang kompleks") and `keilmiahan`,
# which is shut at every level below Unggul.
# (ukbi.kemendikdasmen.go.id/front-new/page/predikat, quoted.)
#
# SO THE STEP IS BREADTH AND REGISTER RATHER THAN A NEW TOPIC.  Level 3 opened
# the workplace at its plainest -- a job, a rota, a payslip, a bank, a
# government counter.  This level is the community that surrounds it and the
# formal register the same person is expected to use in it: the organisation
# rather than the desk, the procedure rather than the task, the letter rather
# than the message, the neighbourhood association rather than the neighbour.
#
# WHAT `dengan baik` MEANS FOR A WORD LIST, and it is the harder half.  Doing
# something well is not doing more of it, so a third of this inventory is not a
# topic at all: it is the vocabulary of PRECISION -- the hedges (`agaknya`,
# `tampaknya`, `barangkali`), the qualifiers (`terutama`, `khususnya`, `pada
# dasarnya`), the contrastives Indonesian is rich in and English is not
# (`sedangkan`, `melainkan`, `padahal`), and the `ke-...-an` abstractions a
# formal sentence is built out of.  A frequency list built from film dialogue
# is at its worst here for the reason it is worst on the closed classes: these
# are written words, and people do not say them aloud.
#
# STILL NOT ACADEMIC.  No `hipotesis`, no `metodologi`, no `variabel`, no
# `kutipan`.  The line is that a Madya candidate can read and write about the
# world; `keilmiahan` is writing about the literature.
#
# (THIS COMMENT ONCE SAID "and that is Unggul's", WHICH THE BOARD'S OWN
# DESCRIPTORS CONTRADICT, and the slip is worth leaving on the record because of
# its shape: it was a claim about the NEXT level written while building this one,
# from the assumption that a ladder opens one door per rung.  Unggul's descriptor
# does not mention `keilmiahan` at all, and Sangat Unggul's -- one rung higher
# still -- says "Untuk kepentingan akademik yang kompleks, yang bersangkutan
# masih memiliki kendala".  The academic door is the LAST one and it opens at
# Istimewa.  Read the descriptor of the level you are naming, not the one you
# are building.)

# ------------------------------------------------------ organisations and roles
L4_ORG = """
organisasi badan panitia anggota ketua wakil sekretaris bendahara
pengurus divisi cabang pusat yayasan perkumpulan pimpinan
"""

# ------------------------------------------------------------- how work is done
L4_PROC = """
prosedur kebijakan ketentuan persyaratan target sasaran
evaluasi penilaian pengawasan pelaksanaan perencanaan
pengelolaan pengembangan penerapan pencapaian
"""

# ------------------------------------------------------------ writing a letter
# The formal-letter register, which is a real genre in Indonesian and is
# examined: `perihal` heads the subject line, `sehubungan dengan` opens the
# body, `terlampir` introduces the enclosure.
L4_CORR = """
lampiran undangan pemberitahuan balasan salam hormat
dengan hormat
atas perhatian
"""

# ------------------------------------------------------------ talking it over
L4_MEET = """
diskusi musyawarah mufakat usul keberatan kesimpulan pembahasan
peserta pemimpin risalah
"""

# ------------------------------------------------------------------- commerce
L4_TRADE = """
perdagangan pemasaran pesanan persediaan gudang
kualitas mutu produk jasa layanan konsumen pesaing keuntungan
kerugian perjanjian pembayaran tagihan
"""

# ------------------------------------------------- rules, and what breaks them
L4_LAW = """
pasal sanksi denda pelanggaran perizinan pengaduan saksi tuntutan
putusan keadilan kejahatan korban tersangka pengadilan pembelaan
"""

# ---------------------------------------------------------- living among people
# `kemasyarakatan` at full breadth, which is what this level's descriptor opens.
# `gotong royong` and `kerja bakti` are the words for the thing itself and have
# no English equivalent worth the name.
L4_CIVIC = """
sumbangan iuran arisan ronda pemilihan calon suara kampanye
kependudukan kesejahteraan kemiskinan pengangguran
gotong royong
kerja bakti
"""

# ------------------------------------------------ school, described from outside
# Attending, funding and finishing an education -- not studying a subject, which
# is `keilmiahan` and is shut.
L4_EDU = """
pendidikan universitas fakultas dosen ijazah beasiswa semester
kuliah keterampilan penyuluhan pengajaran
"""

# ---------------------------------------------------------- the health system
L4_HEALTH = """
pengobatan vaksin imunisasi gizi olahraga tular wabah
rawat inap
rawat jalan
"""

# ---------------------------------------------------- the world it happens in
L4_ENV = """
sampah limbah pencemaran polusi banjir gempa bencana
iklim kebakaran pertanian perkebunan peternakan perikanan
pelestarian sumber daya
"""

# ------------------------------------------------------------- what is reported
L4_MEDIA = """
media pers narasumber opini pembaca pendengar liputan penyiaran
"""

# ------------------------------------------------------- the abstractions
# Indonesian derives these rather than borrowing them, so `ke-...-an` is the
# single most productive thing a learner can be shown at this level.
L4_ABSTRACT = """
kejujuran kebebasan peduli kesadaran keberhasilan kegagalan
kemajuan keamanan nyaman kesulitan kemudahan kekuatan
kelemahan kelebihan kekurangan keperluan kepentingan kebutuhan
kemampuan keinginan kebiasaan kenyataan keterangan kehidupan
"""

# ------------------------------------------------------- saying it exactly
L4_DISCOURSE = """
sebenarnya sesungguhnya terutama sebagaimana
sedangkan melainkan padahal seandainya barangkali agak
tampaknya adapun maka bahwa
antara lain
dengan kata lain
oleh sebab itu
"""

# ------------------------------------------------------------ how, and how much
L4_ADV = """
secara amat terlalu hampir nyaris segera perlahan turut
sekaligus masing-masing saling
"""

# ------------------------------------------------------------------ doing it
L4_VERBS = """
susun rencana laksana kembang terap awas pimpin bina bahas
timbang tentu tetap capai jamin mengajukan serah terbit umum wakil ganti
oleh hasil biaya tanggung larang sedia atur nilai
"""

# ------------------------------------------------------------- describing it
L4_ADJ = """
sah sukarela mandiri terbuka tertutup teratur tertib rapi
teliti cermat bijaksana adil tegas hemat mewah
berkala
"""

SECTIONS_4 = {
    'organisations': L4_ORG, 'procedure': L4_PROC, 'letters': L4_CORR,
    'meetings': L4_MEET, 'commerce': L4_TRADE, 'law': L4_LAW,
    'civic life': L4_CIVIC, 'education': L4_EDU, 'health': L4_HEALTH,
    'environment': L4_ENV, 'media': L4_MEDIA, 'abstractions': L4_ABSTRACT,
    'precision': L4_DISCOURSE, 'adverbs': L4_ADV, 'verbs': L4_VERBS,
    'adjectives': L4_ADJ,
}

# ===========================================================================
# LEVEL 5 — UNGGUL.  THE COMPLEX PROFESSIONS, WHICH IS MADYA'S OWN LIMIT.
# ===========================================================================
# THE DOOR THIS LEVEL OPENS IS NAMED BY THE LEVEL BELOW IT, in as many words.
# Madya's descriptor ends "tetapi masih mengalami kendala dalam hal keprofesian
# yang KOMPLEKS"; Unggul's says the candidate "tidak terkendala dalam
# berkomunikasi untuk keperluan keprofesian, baik keprofesian yang sederhana
# MAUPUN KOMPLEKS".  So the step is not a new subject area chosen here -- it is
# the one thing the previous level says it cannot do, lifted.  Level 3 opened
# the professions at their plainest and level 4 refused to go further; this is
# where the ceiling comes off.
# (ukbi.kemendikdasmen.go.id/front-new/page/predikat, quoted.)
#
# AND THE ACADEMIC DOOR IS STILL SHUT, which had to be read rather than
# assumed -- see the note at the foot of the Madya header, which asserted the
# opposite.  Unggul's descriptor does not mention `keilmiahan` at all, and
# Sangat Unggul's, a rung higher, still says "Untuk kepentingan akademik yang
# kompleks, yang bersangkutan masih memiliki kendala".  So no `hipotesis`, no
# `metodologi`, no `variabel`, no `sitasi`, no `tinjauan pustaka` here.
# `analisis` and `evaluasi` are not academic words -- they are what any
# professional does on a Tuesday -- and the test is whether the word belongs to
# RESEARCH or to WORK.
#
# (THIS COMMENT ONCE ENDED "writing about the literature is Istimewa's", WHICH
# IS THE MADYA SLIP AGAIN, ONE LEVEL ALONG AND WRITTEN BY SOMEONE WHO HAD JUST
# CORRECTED IT.  Sangat Unggul's descriptor constrains the COMPLEX academic
# case, which is a statement that the ordinary one is within reach -- so the
# student's register belongs to level 6 and only its hardest end to level 7.
# TWICE IS A PATTERN AND THE CAUSE IS STRUCTURAL: writing a level's header
# requires saying where the things it excludes DO belong, and the ready answer
# is always "the next level's", which is a guess dressed as a boundary.  Say
# only what THIS level's descriptor says, and name another level solely by
# quoting its own.)
#
# WHAT COMPLEX PROFESSIONAL INDONESIAN ACTUALLY IS, and this is the part a
# frequency list is worst at.  Measured while drafting: of the professional
# vocabulary that belongs at this level a large share is COMPOUND -- Indonesian
# builds its technical terminology out of two or three ordinary words rather
# than borrowing a Latinism, so severance is `pemutusan hubungan kerja`, cash
# flow is `arus kas`, a stakeholder is a `pemangku kepentingan`, governance is
# `tata kelola` and a shareholder is a `pemegang saham`.  **A segmented
# frequency list cannot see one of them**, and neither can a learner who has
# been taught the parts.  So the multi-word machinery this file grew for
# `terima kasih` does its heaviest work here, and each of these is carried by
# the dictionary as an entry in its own right.
#
# ITS OTHER HALF IS THE BADAN BAHASA'S OWN COINAGES.  Computing is where the
# standard language has been most deliberately built -- `perangkat lunak`,
# `peladen`, `unduh`, `unggah`, `daring`, `luring`, `peramban`, `tautan` -- and
# those, rather than the English words everyone says, are what UKBI tests.

# ------------------------------------------------ agreements, and what binds
L5_CONTRACT = """
klausul adendum wanprestasi batal pembatalan mengikat
surat kuasa
pihak ketiga
serah terima
"""

# ------------------------------------------------------- the documents themselves
# `risalah` (minutes) is level 4's; these are the papers a complex job turns on.
L5_DOC = """
proposal ringkasan pendahuluan
latar belakang
ruang lingkup
kerangka acuan
berita acara
sebagai berikut
"""

# ---------------------------------------------------------- running the work
L5_PROJ = """
tenggat capaian indikator tinjauan pemantauan pengujian
kemitraan koordinasi wewenang delegasi kendala hambatan
pemangku kepentingan
tata kelola
tata cara
tata tertib
"""

# ------------------------------------------------------------ the books
L5_FIN = """
neraca piutang laba penyusutan pembukuan akuntansi audit
obligasi dividen faktur
arus kas
laporan keuangan
buku besar
pajak penghasilan
suku bunga
nilai tukar
pasar modal
bursa efek
"""

# ------------------------------------------------------- what a company IS
L5_CORP = """
firma koperasi meterai
perseroan terbatas
badan hukum
anggaran dasar
rapat umum
pemegang saham
dewan direksi
juru bicara
tenaga ahli
konsultan
"""

# ------------------------------------------------------------ arguing it out
L5_NEG = """
perundingan konsesi kompromi tawar argumen bantahan sanggah
penolakan usulan pertimbangan runding
"""

# ------------------------------------------------ hiring, paying, and letting go
L5_HR = """
rekrutmen seleksi kualifikasi mutasi kinerja tunjangan insentif
pesangon lowongan
upah minimum
tenaga kerja
sumber daya manusia
pemutusan hubungan kerja
"""

# --------------------------------------------------------- courts and rights
L5_LAW = """
gugatan penggugat tergugat arbitrase mediasi notaris lisensi
paten perdata pidana kasasi sita gugat tuntut langgar
hak cipta
merek dagang
"""

# ----------------------------------------------------- making and checking things
L5_TECH = """
spesifikasi kalibrasi pemeliharaan instalasi rekayasa rakit
toleransi tegangan katup turbin pembangkit sertifikasi akreditasi
tera henti
rantai pasok
pangsa pasar
jaminan mutu
kendali mutu
nilai tambah
"""

# ------------------------------------------------- the language of computing
L5_IT = """
peladen unduh unggah daring luring peramban tautan peranti
pemrograman algoritma
perangkat lunak
perangkat keras
basis data
kata sandi
"""

# ------------------------------------------------------------- the clinic
L5_MED = """
diagnosis rujukan anestesi kedaluwarsa
rekam medis
gawat darurat
efek samping
tekanan darah
"""

# ------------------------------------------------------- the state as employer
L5_ADMIN = """
regulasi birokrasi otonomi desentralisasi subsidi retribusi
instansi kementerian dinas penyelenggaraan penetapan
pengambilan penyediaan perolehan pengadaan penanganan selenggara
"""

# ------------------------------------------------- integrity, and its failures
# A complex professional register is largely a register for saying that
# something has gone wrong without saying who did it.
L5_ETHIC = """
asas norma etika integritas transparansi akuntabilitas
gratifikasi penyalahgunaan
konflik kepentingan
aturan main
"""

# ---------------------------------------------------------- judging it
L5_QUAL = """
strategis efisien optimal rinci mendasar berkelanjutan mutlak
tuntas tegak tanggap
"""

# ------------------------------------------------- joining a complex argument
L5_DISC = """
kendati berupa yakni umpama sebaliknya
"""

# --------------------------------------------------------------- doing it
L5_VERBS = """
tunjuk tinjau pantau kelola hitung catat sunting edar
tempa tampung tunda tolak dukung tuju urai simpul susut tukar pinjam
"""

SECTIONS_5 = {
    'agreements': L5_CONTRACT, 'documents': L5_DOC, 'running the work': L5_PROJ,
    'the books': L5_FIN, 'companies': L5_CORP, 'negotiation': L5_NEG,
    'employment': L5_HR, 'courts': L5_LAW, 'making things': L5_TECH,
    'computing': L5_IT, 'the clinic': L5_MED, 'administration': L5_ADMIN,
    'integrity': L5_ETHIC, 'judgement': L5_QUAL, 'connectives': L5_DISC,
    'verbs': L5_VERBS,
}

# ===========================================================================
# LEVEL 6 — SANGAT UNGGUL.  THE ACADEMIC DOOR, OPENED PART OF THE WAY.
# ===========================================================================
# THE DESCRIPTOR'S ADJECTIVE IS WHAT MAKES THIS LEVEL POSSIBLE TO WRITE.  Sangat
# Unggul says the candidate "tidak memiliki kendala dalam berkomunikasi untuk
# keperluan sintas, sosial, dan keprofesian" -- every door below is fully open --
# and then: "Untuk kepentingan akademik yang KOMPLEKS, yang bersangkutan masih
# memiliki kendala."  Constraining the complex case is a statement that the
# ORDINARY one is within reach, so this is where `keilmiahan` begins, and only
# its hardest end waits for Istimewa, whose own descriptor is the first to list
# `keilmiahan` among the things with no kendala at all.
# (ukbi.kemendikdasmen.go.id/front-new/page/predikat, quoted.)
#
# WHICH IS TO SAY: THIS IS THE STUDENT'S REGISTER, NOT THE PROFESSOR'S.  The
# vocabulary of doing a piece of work and writing it up -- a research design, a
# sample, a table of results, an argument with evidence under it, a bibliography
# -- rather than the specialist discourse of any one discipline.  So `skripsi`,
# `sitasi`, `daftar pustaka` and `simpulan` are here; the internal terminology of
# a field is not, and neither is a word that only a monograph would use.
#
# AND MUCH OF THE OBVIOUS LIST WAS ALREADY TAUGHT, which is worth knowing before
# drafting one.  Measured against the five decks below: `penelitian`, `hipotesis`,
# `teori`, `metode`, `analisis`, `data`, `sampel`, `populasi`, `filsafat`,
# `psikologi`, `statistik` and some seventy more had already arrived on
# frequency alone, because film dialogue talks about science.  What is left for
# the inventory is the part a corpus of speech never says out loud: the
# APPARATUS -- the bibliography, the abbreviations, the parts of a paper -- and
# the vocabulary of assessing a claim.
#
# THE LANGUAGE-ABOUT-LANGUAGE SECTION IS NOT A FLOURISH.  UKBI is a test OF
# Indonesian, its reading section is largely about how the language works, and
# `kaidah`, `imbuhan`, `ragam baku`, `sinonim` and `ejaan` are the words a
# candidate meets in the paper itself.
#
# THE ACADEMIC REGISTER'S SET PHRASES HAD TO BE WRITTEN IN BY HAND, AND THE
# FIRST DRAFT OF THIS INVENTORY CARRIED NOT ONE.  Every earlier level got its
# phrases free: `estimate_phrases` finds them in the corpus, and levels 2-5
# shipped 19, 31, 56, 100 and 124 that way.  A film corpus does not say `daftar
# pustaka`, so at this level the estimator found none above `PHRASE_MIN` and the
# level shipped with **zero multi-word entries** -- which `check-ukbi.js` caught
# and which nothing else could have, since a deck of 2,500 single words is a
# perfectly ordinary-looking deck.  The register is full of them: a bibliography
# is `daftar pustaka` and nothing shorter, a benchmark is `tolok ukur`, a
# university is a `perguruan tinggi`.
#
# TWO SIGNS OF THE GAP WERE ALREADY IN THIS FILE and neither was read as one.
# The judgement section carried bare `tolok`, which outside `tolok ukur` is a
# word almost nobody uses, and the citation section carried bare `pustaka`; a
# HALF of a set phrase standing alone in an inventory is what the missing whole
# looks like.  **And the header above this one already promised `daftar
# pustaka`** -- prose describing a list it had drifted out of.  Fifteen were
# added, every one confirmed present in the dictionary and absent from levels
# 1-5 first: eight of the obvious candidates (`hak cipta`, `ilmu pengetahuan`,
# `sumber daya`, `tata bahasa`, `kata kerja`, `kata benda`, `kata ganti`, `di
# samping itu`) turned out to have arrived on frequency at a lower level
# already, which is the same finding as the seventy single words above.

# --------------------------------------------------------- doing the research
L6_RESEARCH = """
variabel kuesioner meneliti mengkaji menelaah pengamatan pengkajian
kuantitatif kualitatif deskriptif komparatif empiris sistematis
"""

# ---------------------------------------------------- the parts of the writing
L6_PAPER = """
abstrak simpulan paragraf alinea uraian paparan pemaparan ikhtisar
sinopsis rangkuman resensi telaah kajian
kata pengantar
karya ilmiah
"""

# ---------------------------------------------------------- the apparatus
# What a corpus of speech never contains and a paper cannot do without.
L6_CITE = """
pustaka sitasi rujuk acuan indeks glosarium jilid terbitan cetakan
naskah salinan penerjemahan pengarang penyusun penyunting menyunting
daftar pustaka
catatan kaki
"""

# ------------------------------------------------------------ the university
L6_STUDY = """
skripsi tesis disertasi penguji wisuda magister kurikulum silabus
praktikum lokakarya politeknik hibah akademik jenjang
perguruan tinggi
tugas akhir
mata kuliah
"""

# ------------------------------------------------- argument and what holds it up
L6_ARGUE = """
premis dalil nalar penalaran deduksi induksi inferensi generalisasi
abstraksi implikasi kontradiksi paradoks hakikat esensi
sudut pandang
sebagai contoh
"""

# ------------------------------------------------------- judging a claim
L6_JUDGE = """
objektif valid sahih andal mutakhir terperinci saksama
patokan tolok pedoman kriteria parameter klasifikasi bobot taraf
tolok ukur
"""

# ------------------------------------------------------------- the fields
L6_FIELD = """
keilmuan humaniora linguistik sosiologi antropologi
"""

# --------------------------------------------------------- figures and shapes
L6_NUM = """
persentase median korelasi diagram bagan
berbanding lurus
"""

# ------------------------------------------------- the language about language
L6_LANG = """
kaidah ejaan imbuhan awalan akhiran sinonim antonim semantik gramatika
kosakata perbendaharaan leksikon tesaurus ensiklopedia aksara abjad
dialek ragam lisan
bahasa baku
kata sifat
kata depan
"""

# ---------------------------------------------------------------- letters
L6_LIT = """
prosa kritik lakon amanat majas perumpamaan peribahasa
bait larik pantun syair
"""

# ------------------------------------------------------------- the record
L6_HIST = """
sejarawan prasasti babad hikayat khazanah
"""

# ------------------------------------------------------- the wider abstractions
L6_ABSTRACT = """
lingkup cakupan ranah wacana konteks padan pandang
nirlaba swadaya swasembada kurun milenium ikhtiar penekanan
akal sehat
dan lain-lain
"""

SECTIONS_6 = {
    'research': L6_RESEARCH, 'the writing': L6_PAPER, 'the apparatus': L6_CITE,
    'the university': L6_STUDY, 'argument': L6_ARGUE, 'judgement': L6_JUDGE,
    'the fields': L6_FIELD, 'figures': L6_NUM, 'language about language': L6_LANG,
    'letters': L6_LIT, 'the record': L6_HIST, 'abstractions': L6_ABSTRACT,
}

# A LEVEL WITH NO INVENTORY OF ITS OWN GETS NONE, and that is deliberate rather
# than an omission: `select.py` would then fill the whole level from frequency,
# which is exactly what this file exists to stop, so the run says so out loud.
# ===========================================================================
# LEVEL 7 — ISTIMEWA.  THE LAST DOOR, AND THE FIRST INVENTORY THAT HAD TO BE
# MINED FROM THE DICTIONARY RATHER THAN RECALLED.
# ===========================================================================
# ISTIMEWA IS THE ONLY PREDICATE WHOSE DESCRIPTOR LISTS `keilmiahan` AMONG THE
# THINGS WITH NO KENDALA AT ALL.  It opens "Predikat ini menunjukkan bahwa
# peserta uji memiliki kemahiran yang sempurna dalam berkomunikasi dengan
# menggunakan bahasa Indonesia, baik lisan maupun tulis" and goes on: "Dengan
# kemahiran ini yang bersangkutan tidak memiliki kendala dalam berkomunikasi
# untuk keperluan personal, sosial, keprofesian, dan keilmiahan."  Level 6
# constrains the complex end of academic work; here the constraint is gone.
# (ukbi.kemendikdasmen.go.id/front-new/page/predikat, quoted.)
#
# BOTH SOURCES FAIL AT THIS LEVEL AND THEY FAIL DIFFERENTLY -- see the TARGET
# comment in `ukbi_level.py` for the measurement.  The short version: the corpus
# has 1,344 words left and every one of them is counted fewer than fifty times,
# and the dictionary has never heard of `metodologi`, `paradigma`,
# `epistemologi`, `kutipan` or `merujuk`.  A hand-written inventory of 352
# scholarly candidates yielded 61 usable, a 17% hit rate, because English
# Wiktionary's Indonesian is thinnest exactly where Istimewa lives.
#
# **SO THIS INVENTORY WAS MINED, WHICH IS THE FINDING TO CARRY.** Every earlier
# level was written from what an inventory of the field ought to contain and
# then checked; at this level that method returns mostly words the dictionary
# cannot gloss, and the check does not help because there is nothing to
# substitute.  The list below was instead read OUT of the dictionary: filter to
# untaught single-word headwords with a real part of speech and a gloss that is
# not a pointer, then take the formal-register morphology Indonesian actually
# uses -- `-isme` for doctrines, `-is` for adherents and analytic adjectives,
# `-itas` for measurable qualities, `ke-…-an` for abstractions, `peN-…-an` for
# processes -- and read the result.  254 usable against 4 rejected, where
# recall managed 61 against 64.  **Ask what the dictionary HAS before writing
# down what the level ought to cover**; at every level below, the two agreed.
#
# THE MINING NEEDED A QUALITY FILTER AND THE ONE THAT WORKED IS PEDAGOGICAL.
# Taken raw the suffix families yield 1,717 words and the tail of Wiktionary's
# Indonesian is padded with one-off coinages -- `agapisme`, `adenomiosis`,
# `keteranalisisan`, `ketersedotan`, `keterkutukan`, `jouska`.  Restricting to
# derivations of a root the learner ALREADY HAS cuts it to 435 and the quality
# changes completely: `keandalan` from `andal`, `absurditas` from `absurd`,
# `keterbacaan` from `terbaca`, `pemidanaan` from `pidana`.  That is also the
# right thing to teach at the top of a ladder -- the formal register built on
# vocabulary already in place -- so the filter and the pedagogy agree.  The 435
# were then read one by one; roughly half are here.
#
# WHAT IS DELIBERATELY NOT HERE: the internal terminology of any single
# discipline, which is a specialist's vocabulary rather than a proficient
# reader's, and the multi-word technical entries the dictionary is full of
# (`wisatawan psikosentris`, `metode gaya berat`, `adenosina difosfat`).
#
# AND THE PHRASES WERE WRITTEN IN FROM THE START HERE, BECAUSE LEVEL 6 HAD
# ALREADY PAID FOR THAT LESSON.  `estimate_phrases` finds none at either level --
# the corpus is subtitles and subtitles do not say `alih aksara` -- so an
# inventory that lists only single words ships a deck with no multi-word entry
# in it at all, which is what level 6 did and what `check-ukbi.js` caught.  The
# first draft of THIS inventory made the same mistake, and the same guard would
# have caught it again; the phrases below were mined the same way the single
# words were.  **A prediction written down in CLAUDE.md is only worth having if
# the next level acts on it**, and the honest record is that this one did not
# until the file assertion was re-read.
#
# The mining also shows why they had to be chosen rather than swept: Wiktionary's
# Indonesian multi-word section is largely seeded specialist glossaries -- `afasia
# Broca`, `aktivasi makrofag`, `alopesia androgenetik` -- so a keyword sweep
# returns a medical dictionary.  These are the general formal-register compounds
# a proficient reader meets, and `garis besar` was dropped from them for having
# only the gloss "bigger line".

# ---------------------------------------------- doctrines and movements
# The -isme family IS the register: a scholarly argument in Indonesian names
# positions, and this is how it names them.
L7_ISM = """
absolutisme absurdisme atomisme determinisme fatalisme
formalisme fundamentalisme fungsionalisme globalisme humanisme
imperialisme individualisme internasionalisme kolektivisme
kolonialisme komersialisme konstitusionalisme liberalisme materialisme
modernisme nasionalisme parasitisme profesionalisme radikalisme
rasionalisme realisme regionalisme romantisisme sentralisme
simbolisme sosialisme spesialisme strukturalisme tradisionalisme
elektromagnetisme favoritisme federalisme verbalisme dadaisme
"""

# ------------------------------------------------------- the adherent
L7_IST = """
absolutis fatalis fundamentalis humanis imperialis
kolonialis liberalis materialis rasionalis realis
minimalis panelis ideolog cendekia budiman
"""

# --------------------------------------------- measurable qualities, -itas
L7_ITAS = """
abnormalitas absurditas adaptabilitas aktualitas ambiguitas
disabilitas ekstremitas elastisitas fatalitas fleksibilitas
imunitas legalitas mobilitas modalitas modernitas
netralitas normalitas personalitas polaritas porositas
profesionalitas rasionalitas relevansi konsistensi
spesialitas spontanitas totalitas validitas vitalitas
"""

# ------------------------------------------------- abstractions, ke-…-an
L7_KEAN = """
keandalan keabsahan keaktualan keabnormalan keabsurdan
keberagaman keberlangsungan kebermaknaan keberterimaan kecermatan
kekompleksan kekreatifan kemandirian kemanjuran kemodernan
kemutlakan kepakaran kepopuleran keproduktifan kepustakaan
keradikalan kesalingan kesanggupan kesejalanan kesejatian
kesepadanan kesepahaman keseragaman keserasian kesesuaian
ketajaman keteladanan ketelitian keterbacaan keterdesakan
keterlihatan ketersediaan ketertutupan ketuntasan keutamaan
kewajaran kecukupan kepahaman kesudahan keusangan
kebahasaan kearsipan kekerabatan kemasyarakatan kewartawanan
"""

# ---------------------------------------------------- processes, peN-…-an
L7_PEAN = """
pembakuan pembedaan pembobotan pemidanaan pematuhan
pemusatan penangkalan pendelegasian penjenjangan penjumlahan
pembelahan pembubaran pemekaran perikatan perpajakan
pewarisan perkamusan perulangan perbanyakan peruntukan
persangkaan pertanggungan pelambatan pembiasan pembuahan
"""

# ----------------------------------------------- analytic adjectives
L7_ADJ = """
alfabetis arkeologis atmosferis birokratis ekologis
elektronis empatis ideologis magnetis prosais
sensoris sistemis akrobatis agamais
atributif deduktif ekspresif formatif induktif
spekulatif suksesif transitif
"""

# ------------------------------------- the disciplines and their people
L7_FIELD = """
aksiologi ontologi etimologi epidemiologi
falsafah antologi bibliografi anotasi kolegium
akademikus budayawan kimiawan statistikawan rekayasawan
antariksawan wisudawan seminaris juru tulis
ilmu sosial
ilmu alam
ilmu bumi
studi kasus
dan sebagainya
"""

# ------------------------------------------------------------ argument
L7_ARGUE = """
denotasi konotasi silogisme paradoksal
sanggah antitesis polemik argumentatif dogma
dogmatis hakiki lugas
"""

# ------------------------------------------------------------ language
L7_LANG = """
diksi frasa klausa fonetik fonem
morfem hipernim sintaksis idiom perbahasaan
epos alegori antagonis
alih aksara
akar kata
kata majemuk
kata dasar
kata serapan
bahasa daerah
juru bahasa
karya sastra
"""

# ------------------------------------------ law and the formal register
L7_LAW = """
abolisi anulasi dispensasi arbitrer fatwa
hasutan yurisprudensi litigasi legislasi praperadilan
replik prerogatif selambat-lambatnya
alat bukti
hak asasi manusia
tata negara
tata usaha
tata krama
abdi negara
administrasi publik
pihak berwenang
kekayaan intelektual
akar rumput
lembaga swadaya masyarakat
"""

# ------------------------------------------------------------- economy
L7_ECON = """
fiskal deflasi aktuaris jenama pailit
likuidasi divestasi spekulan
akuntan publik
badan usaha
neraca perdagangan
angka kematian
angka kelahiran
"""

# ------------------------------------------------------------- science
L7_SCI = """
hayati anorganik zarah inersia friksi
katalisis harmonisasi peradangan
"""

SECTIONS_7 = {
    'doctrines': L7_ISM, 'the adherent': L7_IST, 'measurable qualities': L7_ITAS,
    'abstractions': L7_KEAN, 'processes': L7_PEAN, 'analytic adjectives': L7_ADJ,
    'the disciplines': L7_FIELD, 'argument': L7_ARGUE, 'language': L7_LANG,
    'law and the formal register': L7_LAW, 'economy': L7_ECON, 'science': L7_SCI,
}

LEVELS = {'1': SECTIONS_1, '2': SECTIONS_2, '3': SECTIONS_3, '4': SECTIONS_4,
          '5': SECTIONS_5, '6': SECTIONS_6, '7': SECTIONS_7}


def sections():
    return LEVELS.get(LEVEL, {})


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
    for name, block in sections().items():
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
    print(f'    supplement: {len(uniq)} items across {len(sections())} sections')
    if missing:
        print(f'    NOT IN THE DICTIONARY ({len(missing)}): '
              + ', '.join(f'{w} [{s}]' for w, s in missing))
