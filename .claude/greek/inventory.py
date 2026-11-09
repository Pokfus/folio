#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Greek word list was found published (see `greek_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`ένας:num`) where the spelling
is shared and the level wants one reading first.  Spellings are Wiktionary's
headwords: monotonic, a verb by its first person singular present (`τρώω`), a
noun in the nominative singular, an adjective in the masculine.  An
alternative spelling Wiktionary files under another headword (`αδερφός` for
`αδελφός`) resolves through it, and the card prints the spelling written here.
"""

A1 = [
    ('pronouns', 'εγώ εσύ αυτός εμείς εσείς μου σου του της μας σας τους'),
    ('articles', 'ο ένας:article'),
    ('questions', 'τι ποιος πού πότε γιατί πώς πόσος'),
    ('prepositions and place words', 'σε από με για χωρίς μέχρι μετά πριν κοντά μακριά πάνω κάτω '
                                     'μέσα έξω δίπλα μπροστά πίσω εδώ εκεί'),
    ('conjunctions and particles', 'και ή αλλά ότι που επειδή αν να θα δεν μην όχι ναι πολύ λίγο '
                                   'επίσης μόνο ακόμα'),
    ('greetings and politeness', 'γεια καλημέρα καλησπέρα καληνύχτα ευχαριστώ παρακαλώ συγγνώμη '
                                 'χαίρετε αντίο εντάξει'),
    ('numbers', 'ένας:num δύο τρεις τέσσερις πέντε έξι επτά οκτώ εννέα δέκα έντεκα δώδεκα είκοσι '
                'τριάντα πενήντα εκατό χίλια πρώτος δεύτερος τρίτος μισός'),
    ('time', 'ώρα λεπτό μέρα νύχτα πρωί βράδυ μεσημέρι απόγευμα σήμερα αύριο χθες τώρα αργότερα '
             'εβδομάδα μήνας χρόνος νωρίς αργά πάντα ποτέ συχνά'),
    ('days', 'Δευτέρα Τρίτη Τετάρτη Πέμπτη Παρασκευή Σάββατο Κυριακή'),
    ('months', 'Ιανουάριος Φεβρουάριος Μάρτιος Απρίλιος Μάιος Ιούνιος Ιούλιος Αύγουστος Σεπτέμβριος '
               'Οκτώβριος Νοέμβριος Δεκέμβριος'),
    ('family', 'οικογένεια μητέρα μαμά πατέρας μπαμπάς αδελφός αδελφή γιος κόρη άντρας γυναίκα '
               'σύζυγος παππούς γιαγιά θείος θεία παιδί αγόρι κορίτσι φίλος φίλη μωρό'),
    ('people and yourself', 'όνομα ηλικία χώρα πόλη χωριό γλώσσα ελληνικά αγγλικά δουλειά μαθητής '
                            'φοιτητής δάσκαλος γιατρός άνθρωπος κύριος κυρία'),
    ('food and drink', 'φαγητό νερό καφές τσάι γάλα ψωμί κρασί μπίρα τυρί κρέας ψάρι αβγό φρούτο '
                       'μήλο πορτοκάλι ντομάτα σαλάτα ζάχαρη αλάτι πρωινό λάδι πατάτα ρύζι'),
    ('shopping and money', 'λεφτά χρήματα ευρώ τιμή μαγαζί αγορά φτηνός ακριβός αγοράζω πουλάω '
                           'πληρώνω δίνω παίρνω'),
    ('the home', 'σπίτι δωμάτιο πόρτα παράθυρο τραπέζι καρέκλα κρεβάτι κουζίνα μπάνιο βιβλίο στυλό '
                 'τηλέφωνο κλειδί διαμέρισμα'),
    ('the town and getting about', 'δρόμος αυτοκίνητο λεωφορείο τρένο ταξί εισιτήριο σταθμός '
                                   'ξενοδοχείο νοσοκομείο σχολείο γραφείο τράπεζα δεξιά αριστερά '
                                   'ευθεία αεροδρόμιο θάλασσα εστιατόριο φαρμακείο'),
    ('the body and feeling ill', 'κεφάλι μάτι αυτί μύτη στόμα χέρι πόδι κοιλιά δόντι άρρωστος πόνος '
                                 'φάρμακο πυρετός'),
    ('weather', 'καιρός ζέστη κρύο βροχή ήλιος αέρας χιόνι ζεστός κρύος'),
    ('colours', 'χρώμα κόκκινος μπλε κίτρινος πράσινος μαύρος άσπρος'),
    ('describing', 'μεγάλος μικρός καινούργιος νέος παλιός ωραίος κακός καλός χαρούμενος ψηλός '
                   'εύκολος δύσκολος πολύς όλος κάθε κάτι τίποτα κάποιος'),
    ('everyday verbs', 'είμαι έχω κάνω πηγαίνω έρχομαι τρώω πίνω κοιμάμαι ξυπνάω κάθομαι βλέπω ακούω '
                       'μιλάω λέω διαβάζω γράφω καταλαβαίνω ξέρω θέλω μπορώ μένω περπατάω βρίσκω '
                       'ανοίγω κλείνω ρωτάω σκέφτομαι αγαπώ αρέσω δουλεύω μαθαίνω'),
]

INVENTORY = {'a1': A1}
