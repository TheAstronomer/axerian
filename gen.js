//!== The Axerian Project !==//
/*=== Final processes ===*/

// TODO: Work on functions genWord(), translate(), translit(), simplify()
// and fix all the FIXMEs

// FIXME: Complete this algorithm
function translate(text) {
    var re = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)\1*|([\w]+)\2*|([!"#$%&\'()*+,\-./:;<=>?@[\\\]^_`{\|}~]+)\3*|(\s+)\4*/g,
        a = text.match(re),
        b = new Array(text.matchAll(re))

    console.log(a, b)
}

// console.log(translate("Hello World"))

// TODO: Transliterate a sentence into another script
function translit(sentence, mode) {
    return null
}

// Normalize an Axerian conlang string
function normalizeAxerian(str) {

}

/*=== Generation ===*/
// Rank consonants, give them weights and returns a
// random selection
function consonant(cons) {
    var rank = [], weight = []
    const sum = arr => arr.reduce((a, b) => a + b, 0)

    // Rank consonants based on position
    for (i in range(cons.length)) {
        rank.push(cons.length - i)
    }
    // Give each consonants a weight based on the sum of
    // indices from the right of the array of integers
    for (i in range(rank.length)) {
        var rand = randint(-16, 16)
        var wt = rank.slice(i, rank.length)
        weight.push(Math.abs(sum(wt) + rand))
    }

    // Return a random weighted selection
    var ind = weightedChoice(weight),
        c = cons[ind]
    return c
}

// Generates a vowel - long or diphthong
// FIXME: Fix diphthong generation
function vowel() {
    var vowel = '', pos = choice(['bef', 'aft'])

    var normal = 'aeiou'.repeat(3) + 'ėy'.repeat(2),
        long = 'áéíóú'.repeat(3) + 'ěý'.repeat(2)

    // Random probabilities
    var rLong = randint(1, 3),
        isLong = true ? (rLong == 1) : false
    var rDiph = randint(1, 9),
        isDiph = true ? (rDiph < 2) : false

    // Returns a random vowel from the list
    vowel = choice(normal)

    // Lengthens that vowel (this is done by
    // adding a diacritic above the vowel)
    if (isLong == true) {
        res = equiv(vowel, normal, long)
        vowel = res
    }

    if (isDiph == true) {
        // Add glide if vowel is not 'i' or 'u'
        if ('aeoėyáéóěý'.includes(vowel)) {
            var n = choice('i', 'u')
            vowel += n
            console.log(vowel, 1)
            // Add 'i' glide if vowel is 'u' and vice versa
        } else if ('ií'.includes(vowel)) {
            vowel += 'u'
            console.log(vowel, 2)
        } else if ('uú'.includes(vowel)) {
            vowel += 'i'
            console.log(vowel, 3)
        }

        // Reverse order if glide comes before vowel
        if (pos == 'bef') {
            var sub = rev(vowel)
            vowel = sub
        }
    }

    // Fallbacks
    if (vowel == '') vowel = choice(normal) // Null vowel

    // Remove extra glide vowel
    if (find(vowel, 'ui') == true || find(vowel, 'iu') == true) {
        var sub = vowel.replace(choice(['i', 'u']), '')
        vowel = sub
    }

    return vowel
}

// for (var i in range(100)) { console.log(vowel()) }

// FIXME: Generate a random syllable structure
function genStruct() {
    // Start with a vowel
    var syl = '1'

    // Generate random integers
    var p1 = randint(1, 11), // onset consonant
        p2 = randint(1, 11), // coda consonant
        p3 = randint(1, 16), // initial consonant glide
        p4 = randint(1, 16), // final consonant glide
        p5 = randint(1, 13) // onset sibilant consonant

    // Probability for another consonant

    // 9 in 11 times the syllable starts with a consonant
    if (1 <= p1 && p1 <= 9) syl = '2' + syl
    // 7 in 11 times the syllable ends in a consonant
    if (1 <= p2 && p2 <= 7) syl += '2'
    // 3 in 16 times the syllable ends in a glide and final consonant
    if (1 <= p3 && p3 <= 3) {
        syl += '4'
        syl = syl.replace('24', '42')
    }
    // 1 in 8 times the syllable starts with a consonant and a glide
    if (1 <= p4 && p4 <= 2) {
        syl += '5'
        syl = syl.replace('25', '52')
    }
    // 2 in 13 times the syllable starts with two consonants and a glide
    if (1 <= p5 && p5 <= 2) syl = '3' + syl

    // Final changes and swaps
    syl = syl.replace('15', '51')
    syl = syl.replace('41', '14')
    syl = syl.replace('145', '15')
    syl = syl.replace('31', '21')

    return syl
}

// FIXME: Generate an actual syllable
function genSyl(st) {
    var list = [], s = st.split("")
    for (i in range(st.length)) {
        list.push(parseInt(s[i]))
    }

    var c = 'tlnrskjzmdvšhgbfđņļŧŗpģwķčĝcżžqĵñħğŵxþ',
        j = 'szšž', m = 'lrjwļŗĵ', f = 'lrjwļŗĵnmņñ'

    var a = new Array();
    for (i in range(list.length)) {
        if (st[i] == 1) a.push(vowel())
        else if (st[i] == 2) a.push(consonant(c))
        else if (st[i] == 3) a.push(consonant(j))
        else if (st[i] == 4) a.push(consonant(m))
        else if (st[i] == 5) a.push(consonant(f))
    }
    return a.join('')
}

// Generates a word from the sum of its parts
function genWord() {
    return null
}

/*=== Phonetic Changes ===*/

// Changes all bright vowels to dim vowels
function darkVowel(word) {
    var bri = "aeiouáéíóúäëïöü", dar = "àèìòùâêîôûāēīōū"

    for (i in range(bri.length)) {
        word = word.split(bri[i]).join(dar[i])
    }
    return word
}

// FIXME: Separates vowels between syllable boundaries
function diaresis(syllables) {
    var vow = "aeiouėy",
        dia = "äëïöüĕÿ",
        l = syllables.length - 1

    for (var i = 0; i < l; i++) {
        next = syllables[i + 1]
        end = syllables[i][l],
            start = syllables[i + 1][0],
            rand = randint(1, 5),
            last = syllables[l]

        if (find(vow, start) == true && find(vow, end) == true) {
            var syl = split(nxt)
            var nue = equiv(start, vow, dia)
            syl[0] = nue
            syllables[i + 1] = syl.join("")
        }
    }
    return syllables
}

// FIXME: Geminate syllables
function geminate(syllables) {
    var /* lab = 'pbm',
        lbd = 'fv',*/
        alv = 'tdn',
        den = 'đŧ',
        sib = 'szcżšžčĝ',
        /* pal = 'ķģņ',
        vel = 'kgñħğ',
        glo = 'q',
        app = 'jĵwlrļŗ',
        oth = 'xþŵ',
        nas = 'mnņñ',
        unv = 'ptķkfŧħsšcč',
        voi = 'bdģgvđğzžżĝ', */

        sharp = sib + alv + den + 'nlr',

        vowels = 'aeiouėyáéíóúěý'

    var l = syllables.length - 1

    for (var i = 0; i < l; i++) {
        var next = syllables[i + 1],
            end = syllables[i][l],
            start = syllables[i + 1][0],
            last = syllables[l],
            rand = randint(1, 5)

        if (rand <= 2 && (find(vowels, start) == false
            && find(vowels, end) == false) && (find(sharp, start) == true
                && find(sharp, end) == true)) {
            nue = next.replace(start, end)
            syllables[i] = nue
            console.log(true)
        }
    }

    var rand1 = randint(1, 7)
    if (rand1 < 2 && find(sharp, last[l]) == false
        && find(vowels, last[l]) == false) {
        last += last[l]
    }
    return syllables
}

// TODO: Removes unwanted consonant sequences between syllables
function simplify() {

}

/*=== Functions from Research ===*/

// Assigns numbers to a string and calculate the result
function gematria(str, s = "abcdefghijklmnopqrstuvwxyz", b = 10) {
    const sum = arr => arr.reduce((a, b) => a + b, 0)

    var l = s.length + Math.floor(s.length - b)
    var ind = []
    for (i in range(l)) {
        var f = ((i % b) + 1) * Math.pow(b, (Math.floor(i / b)))
        ind.push(f)
    }
    ind = sort(set(ind))

    str = normalize(str)
    res = []
    for (i in range(str.length)) {
        res.push(equiv(str[i], s, ind))
    }

    return sum(res)
}

function normalize(str) {
    var re = /([\w]+)\1*/g
    return str.match(re).join("").toLowerCase();
}

// Generate all possible combinations for n items of length l
function combinations(array) {
    return new Array(1 << array.length).fill().map(
        (e1, i) => array.filter((e2, j) => i & 1 << j));
}

// console.log(combinations([1,2,3]).filter(a => a.length == 2))


// Transfer the capitalization of one string to another
function capital(word, trans) {
    const right = (arr, i) => arr.slice(i, arr.length)
    var cap = [], iscap = []

    for (i in range(word.length)) {
        var char = word[i]
        if (find(" !\'#$%&'()*+,-./:;<=>?@[\\]^_`{|}~", char) == true) iscap.push(0)
        else if (char == word[i].toUpperCase()) iscap.push(1)
        else if (char == word[i].toLowerCase()) iscap.push(2)
        else iscap.push(0)
    }

    if (set(iscap) == [0, 1] || set(iscap) == [1, 0]) {
        return trans.toUpperCase()
    }
    else {
        var tra = trans.split(''), i = 0
        while (i < word.length) {
            if (i == trans.length) break
            if (iscap[i] == true) cap.push(tra[i].toUpperCase())
            else (cap.push(tra[i]))
            i += 1
        } return cap.join('') + right(trans, i)
    }
}

// Counts the number of syllables in a word
function sylco(w) {
    w = w.toLowerCase()
    var res = w.split(/[^aeiouy]+/g),
        fil = res.filter(function (el) {
            return el != "";
        });

    var syl = 0
    for (var p in sub) {
        if (w.match(sub[p])) syl -= 1
    }
    for (var p in add) {
        if (w.match(add[p])) syl += 1
    }

    syl += fil.length
    if (syl <= 0) syl = 1

    return syl
}

// Converts a number to a base with a custom digit set
function toAnyBase(num, base, digits) {
    if (!Number.isInteger(base) || base < 2)
        throw new RangeError('toAnyBase() base argument must be an integer >= 2')
    if (!Number.isFinite(num)) return num.toString()
    if (num < 0) return '-' + toAnyBase(-num, base)

    var inv_base = 1 / base

    var result = '',
        residual

    // Integer part:
    residual = Math.trunc(num)
    do {
        result = digits.charAt(residual % base) + result
        residual = Math.trunc(residual * inv_base)
    } while (residual != 0)

    // Fractional part:
    residual = num % 1;
    if (residual != 0) {
        result += '.';
        var max = 1000;
        do {
            residual *= base;
            result += digits.charAt(Math.trunc(residual))
            residual %= 1;
        } while (residual != 0 && --max != 0)
    }

    return result
}

/*=== JS Functions with Python equivalents ===*/

// Python set() function
function set(arr) {
    return arr.reduce(function (a, val) {
        if (a.indexOf(val) === -1) {
            a.push(val)
        }
        return a
    }, [])
}

// Reverse a string (recursive)
function rev(str) {
    if (str === '') return ''
    else return rev(str.substr(1)) + str.charAt(0)
}

// Convert an element from one to the other
function equiv(i, a, b) {
    return b[a.indexOf(i)]
}

// Check if an element is in an array
function contains(a, obj) {
    var i = a.length
    while (i--) {
        if (a[i] === obj) {
            return true
        }
    }
    return false
}

// Choose a random element from an array
function choice(a) {
    return a[Math.floor(Math.random() * a.length)]
}

// Generate a random integer
function randint(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// Range function for Python-like syntax
function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt)
}

// Boolean function to search function
function find(st, sb) {
    return true ? search(st, sb) == sb : false
}

// Search a string inside another (recursive)
function search(st, sb) {
    const left = (arr, i) => arr.slice(0, i)
    const right = (arr, i) => arr.slice(i, arr.length)

    if (st.length >= sb.length) {
        if (left(st, sb.length) == sb) return sb
        else return search(right(sb, 1), sb)
    } else {
        return null
    }
}

// Weighted random choice
function weightedChoice(weights) {
    var totalWeight = 0,
        i, random

    for (i = 0; i < weights.length; i++) {
        totalWeight += weights[i]
    }

    random = Math.random() * totalWeight

    for (i = 0; i < weights.length; i++) {
        if (random < weights[i]) return i
        random -= weights[i]
    }

    return -1
}

/*=== List of regexes ===*/
var sub = [/cial/, /tia/, /cius/, /cious/, /uiet/,
    /gious/, /geous/, /priest/, /giu/, /dge/, /ion/, /iou/,
    /sia$/, /.che$/, /.ched$/, /.abe$/, /.ace$/, /.ade$/,
    /.age$/, /.aged$/, /.ake$/, /.ale$/, /.aled$/, /.ales$/,
    /.ane$/, /.ame$/, /.ape$/, /.are$/, /.ase$/, /.ashed$/,
    /.asque$ /, /.ate$/, /.ave$/, /.azed$/, /.awe$/, /.aze$/,
    /.aped$/, /.athe$/, /.athes$/, /.ece$/, /.ese$/, /.esque$/,
    /.esques$/, /.eze$/, /.gue$/, /.ibe$/, /.ice$/, /.ide$/,
    /.ife$/, /.ike$/, /.ile$/, /.ime$/, /.ine$/, /.ipe$/,
    /.iped$/, /.ire$/, /.ise$/, /.ished$/, /.ite$/, /.ive$/,
    /.ize$/, /.obe$/, /.ode$/, /.oke$/, /.ole$/, /.ome$/,
    /.one$/, /.ope$/, /.oque$/, /.ore$/, /.ose$/, /.osque$/,
    /.osques$/, /.ote$/, /.ove$/, /.pped$/, /.sse$/, /.ssed$/,
    /.ste$/, /.ube$/, /.uce$/, /.ude$/, /.uge$/, /.uke$/, /.ule$/,
    /.ules$/, /.uled$/, /.ume$/, /.une$/, /.upe$/, /.ure$/, /.use$/,
    /.ushed$/, /.ute$/, /.ved$/, /.we$/, /.wes$/, /.wed$/, /.yse$/,
    /.yze$/, /.rse$/, /.red$/, /.rce$/, /.rde$/, /.ily$/, /.ely$/,
    /.des$/, /.gged$/, /.kes$/, /.ced$/, /.ked$/, /.med$/, /.mes$/,
    /.ned$/, /.[sz]ed$/, /.nce$/, /.rles$/, /.nes$/, /.pes$/, /.tes$/,
    /.res$/, /.ves$/, /ere$/],
    add = [/ia/, /riet/, /dien/, /ien/, /iet/, /iu/, /iest/, /io/,
        /ii/, /ily/, /.oala$/, /.iara$/, /.ying$/, /.earest/,
        /.arer/, /.aress/, /.eate$/, /.eation$/, /[aeiouym]bl$/,
        /[aeiou]{3}/, /^mc/, /ism/, /^mc/, /asm/, /([^aeiouy])1l$/,
        /[^l]lien/, /^coa[dglx]./, /[^gq]ua[^auieo]/, /dnt$/]
