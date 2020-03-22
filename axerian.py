# -*- coding: UTF-8 -*-

import random, bisect, re, string, math

# Axerian - Version 4.1 #
# Challenge: Build a lexicon using Python!

# Some regex string constants
sub = ['cial','tia','cius','cious','uiet','gious','geous','priest','giu','dge','ion','iou','sia$','.che$','.ched$','.abe$','.ace$','.ade$','.age$','.aged$','.ake$','.ale$','.aled$','.ales$','.ane$','.ame$','.ape$','.are$','.ase$','.ashed$','.asque$','.ate$','.ave$','.azed$','.awe$','.aze$','.aped$','.athe$','.athes$','.ece$','.ese$','.esque$','.esques$','.eze$','.gue$','.ibe$','.ice$','.ide$','.ife$','.ike$','.ile$','.ime$','.ine$','.ipe$','.iped$','.ire$','.ise$','.ished$','.ite$','.ive$','.ize$','.obe$','.ode$','.oke$','.ole$','.ome$','.one$','.ope$','.oque$','.ore$','.ose$','.osque$','.osques$','.ote$','.ove$','.pped$','.sse$','.ssed$','.ste$','.ube$','.uce$','.ude$','.uge$','.uke$','.ule$','.ules$','.uled$','.ume$','.une$','.upe$','.ure$','.use$','.ushed$','.ute$','.ved$','.we$','.wes$','.wed$','.yse$','.yze$','.rse$','.red$','.rce$','.rde$','.ily$','.ely$','.des$','.gged$','.kes$','.ced$','.ked$','.med$','.mes$','.ned$','.[sz]ed$','.nce$','.rles$','.nes$','.pes$','.tes$','.res$','.ves$','ere$']
add = ['ia','riet','dien','ien','iet','iu','iest','io','ii','ily','.oala$','.iara$','.ying$','.earest','.arer','.aress','.eate$','.eation$','[aeiouym]bl$','[aeiou]{3}','^mc', 'ism','^mc', 'asm','([^aeiouy])1l$','[^l]lien','^coa[dglx].','[^gq]ua[^auieo]','dnt$']

# Setup and compile regex strings
reSub = [re.compile(s) for s in sub]
reAdd = [re.compile(s) for s in add]

# Selects an item at random
def choose(choices):
    values, weights = zip(*choices)
    total = 0
    cumWeights = []
    for w in weights:
        total += w
        cumWeights.append(total)
    x = random.random() * total
    i = bisect.bisect(cumWeights, x)
    return values[i]

# Finds a substring in a string
def find(st, sb):
    if len(st) >= len(sb):
        if st[:len(sb)] == sb: return sb
        else: return find(st[1:], sb)

# Converts a number to a base with a custom digit set
def toBase(num, base, digit):
    if len(digit) == 0: digit = string.printable
    mod = abs(num); inv = 1 / base

    # Parses each digit into its string with the index.
    def parse(n):
        fin = ""; res = math.trunc(n)
        while res != 0: # Integer part
            fin = digit[res % base] + fin
            res = math.trunc(res * inv)
        res = n % 1
        if res != 0: fin += "." # Point
        while res != 0: # Floating point part
            res *= base
            fin += digit[math.trunc(res)]
            res %= 1
        return fin

    if base < 2: return None # Non-valid base < 2
    if num > 0: return parse(mod) # Positive integer
    elif num < 0: return "-" + parse(mod)
    else: return digit[0]

# Transfers the capitalization of one string into another
def capitalize(word, trans):
    cap = []; upper = string.ascii_uppercase; lower = string.ascii_lowercase
    isCap = [True if word[i] in upper else False if word[i] in lower else None for i in range(len(word))]

    # Convert all characters to uppercase if all are uppercase
    if set(isCap) == {True, None}: return trans.upper()
    else: # Else convert only the characters at corresponding indices
        tra = list(trans); i = 0
        while i < len(word):
            if i == len(trans): break
            if isCap[i] == True: cap.append(tra[i].upper())
            else: cap.append(tra[i])
            i += 1
        return "".join(cap) + trans[i:] # Add remaining characters

# Counts number of syllables in an English word
def sylco(word):
    # Count the number of vowels in the word and remove blank strings
    vowels = re.split(r'[^aeiouy]+', word.lower())
    vowels = [a for a in vowels if a != ""]

    syllables = 0
    for p in reSub: # Remove all subsyllables
        if p.match(word): syllables -= 1
    for p in reAdd: # Add certain syllables
        if p.match(word): syllables += 1
    syllables += len(vowels)
    if syllables <= 0: syllables = 1

    return syllables

# Rank consonants, give them weights and returns a random selection
def genCon(cons):
    rank = []; weight = []; sel = []

    for i in range(len(cons)): rank.append(len(cons) - i)
    for i in range(len(rank)):
        rand = random.randint(-16, 16)
        weight.append(abs(sum(rank[i:]) + rand))
    for i in range(len(cons)): sel.append(tuple((cons[i], weight[i])))

    return choose(sel)

# Generate a vowel: long vowel or diphthongs
def genVow():
    vowel = "";  lon = ""
    normal = 3*"aeiou" + 2*"ėy"; long = 3*"áéíóú" + 2*"ěý"
    posi = ["before", "after"]; prob = random.choice(posi);
    # ė and y are neutral vowels

    # Random probabilities
    randLong = random.randint(1, 3) # Long vowel
    isLong = True if randLong == 1 else False
    randDiph = random.randint(1, 15) # Diphthong
    isDiph = True if randDiph == 1 else False

    # Generates a random short vowel
    vowel = random.choice(normal)
    if isLong == True: # Long vowel
        lon = long[normal.index(vowel)]; vowel = lon

    # Adds a i or u glide
    if isDiph == True:
        if vowel in "aeoėyáéóěý": vow = "ui"; val = random.choice(vow); vowel += vow
        else:
            if vowel in "ií" and len(vowel) < 2: vow = "u"; vowel += vow
            elif vowel in "uú" and len(vowel) < 2: vow = "i"; vowel += vow
        if prob == "before": vowel = vowel[::-1]

    # Fallbacks
    if vowel == "": vowel = random.choice(normal)
    if "ui" in vowel: new = vowel.replace(random.choice(["i", "u"]), ""); vowel = new
    elif "iu" in vowel: new = vowel.replace(random.choice(["i", "u"]), ""); vowel = new

    return vowel # Returns a vowel or diphthong

# Generate random syllable structure
def genStruct():
    syl = "v" # Start with a vowel

    # Random probabilities
    p1, p2 = random.randint(1, 11), random.randint(1, 11)
    p3, p4 = random.randint(1, 16), random.randint(1, 16)
    p5 = random.randint(1, 13)

    # Append consonants
    if 1 <= p1 <= 9:
        syl = "c" + syl
        if 1 <= p2 <= 7:
            syl += "c"
            if 1 <= p3 <= 3:
                syl = "s" + syl
                syl = syl.replace("sc", "cl")
                if 1 <= p4 <= 2:
                    syl += "s"
                    syl = syl.replace("cs", "sc")
                    if 1 <= p5 <= 2:
                        syl = "i" + syl
    return syl

# Generate syllable based on preset consonant sequences.
def genSyl(st):
    # All consonant sequences to be sorted based on frequency
    c = "tlnrskjzmdvšhgbfđņļŧŗpģwķčĝcżžqĵñħğŵxþ"
    i, m, f = "szšž", "lrjwļŗĵ", "lrjwļŗĵnmņñ"

    # Convert all syllable structure letters and generate individual letters
    return "".join([genVow() if st[a] == "v" else genCon(c) if st[a] == "c" else genCon(i) if st[a] == "i" else genCon(m) if st[a] == "l" else genCon(f) if st[a] == "s" else "" for a in range(len(st))])

# Removes unwanted consonant sequences between syllables
def simplify(syllables):
    # Constant strings
    con, vow = "bcdfghjklmnpqrstvwxzñþčđĝğģħĵķļņŗšŧŵżž", "aeiouėyáéíóúěý"
    chars = "aàbcčdđeèėfgĝģğhħiìjĵkķlļmnņñoòpqrŗsštŧuùvwŵxyzżžþáéíóúěýâêîôû"

    # Consonants divided into phonetic qualities
    lab, lbd, alv, den = "pbm", "fv", "tdn", "đŧ"
    sib, pal, vel = "szcżšžčĝ", "ķģņ", "kgñħğ"
    glo, app, oth, nas = "q", "jĵwlrļŗ", "xþŵ", "mnņñ"
    unv, voi = "ptķkfŧħsšcč", "bdģgvđğzžżĝ"
    bad = []; exc = []; pos = [i + j for i in con for j in con]

    # Filter out bad consonant clusters
    for i in range(len(pos)):
        one, two = pos[i][0], pos[i][1]
        if one == two: pass # Pass double consonants.
        elif one in oth or two in oth: bad.append(pos[i])
        elif one in lbd or two in lbd: # Labiodental consonant combinations
            if one in den or two in den: bad.append(pos[i])
            elif one in pal or two in pal: bad.append(pos[i])
            elif one in glo or two in glo: bad.append(pos[i])
        elif one in lab or two in lab: # Labial consonant combinations
            if one in vel or two in vel: bad.append(pos[i])
            elif one in den or two in den: bad.append(pos[i])
            elif one in pal or two in pal: bad.append(pos[i])
            elif one in glo or two in glo: bad.append(pos[i])
            elif one in lbd or two in lbd: bad.append(pos[i])
        elif one in vel or two in vel: # Velar consonant combinations
            if one in pal or two in pal: bad.append(pos[i])
            elif one in den or two in den: bad.append(pos[i])
            elif one in lab or two in lab: bad.append(pos[i])
            elif one in glo or two in glo: bad.append(pos[i])
            elif one in lbd or two in lbd: bad.append(pos[i])
        elif one in pal or two in pal: # Palatal consonant combinations
            if one in vel or two in vel: bad.append(pos[i])
            elif one in alv or two in alv: bad.append(pos[i])
            elif one in lbd or two in lbd: bad.append(pos[i])
            elif one in den or two in den: bad.append(pos[i])
            elif one in lab or two in lab: bad.append(pos[i])
            elif one in glo or two in glo: bad.append(pos[i])
            elif one in lbd or two in lbd: bad.append(pos[i])
        elif one in glo and two in glo: # Glottal consonants except h
            if two in nas: pass
            elif one in pal or two in pal: bad.append(pos[i])
            elif one in alv or two in alv: bad.append(pos[i])
            elif one in den or two in den: bad.append(pos[i])
            elif one in lab or two in lab: bad.append(pos[i])
            elif one in vel or two in vel: bad.append(pos[i])
            elif one in sib or two in sib: bad.append(pos[i])
            elif one in lbd or two in lbd: bad.append(pos[i])

    # Excpetions to be removed
    for i in range(len(pos)):
        one, two = pos[i][0], pos[i][1]
        if one in "xþ":
            if two in nas or two in app: exc.append(pos[i])
        elif two in "xþ":
            if one in app: exc.append(pos[i])
        # elif one in "h": if two in nas: exc.append(pos[i])
    bad = [i for i in bad if i not in exc]

    # Checks for cross-syllabic consonant clusters.
    for i in range(len(syllables)-1):
        pre, nxt = syllables[i], syllables[i+1]
        end, start = syllables[i][-1], syllables[i+1][0]

        if start not in vow or end not in vow:
            # Do voicing assimilations
            if start in voi and end in unv: new = nxt.replace(start, unv[voi.index(start)]); syllables[i+1] = new
            elif start in unv and end in voi: new = nxt.replace(start, voi[unv.index(start)]); syllables[i+1] = new
            elif start in unv and end in nas: new = nxt.replace(start, voi[unv.index(start)]); syllables[i+1] = new

            # Removes bad consonant combinations
            if (end + start) in bad: new = nxt.replace(start, end); syllables[i+1] = new

    # Removes bad consonant combinations
    for i in range(len(syllables)):
        tr, ts = syllables[i], syllables[i]
        if tr[:2] in bad: new = tr.replace(syllables[i][:2], syllables[i][0]); syllables[i] = new
        if ts[-2:] in bad: nu1 = ts[i].replace(syllables[i][-2:], syllables[i][-1]); syllables[i] = nu1

    # Remove awkward approximant-combinations of words
    if (syllables[0][0] in nas + app) and syllables[0][1] in con: new = syllables[0].replace(syllables[0][0], ""); syllables[0] = new

    return syllables

# Apply gemination
def geminate(syllables):
    # Consonants divided into phonetic qualities
    lab, lbd, alv, den = "pbm", "fv", "tdn", "đŧ"
    sib, pal, vel = "szcżšžčĝ", "ķģņ", "kgñħğ"
    glo, app, oth, nas = "q", "jĵwlrļŗ", "xþŵ", "mnņñ"
    unv, voi = "ptķkfŧħsšcč", "bdģgvđğzžżĝ"

    # Only sharp consonants can lengthen.
    sharp = sib + alv + den + "nlr"

    # Changes all bad consonant combinations with geminated consonants instead
    vowels = "aeiouėyáéíóúěý"
    for i in range(len(syllables)-1):
        nxt, end, start = syllables[i+1], syllables[i][-1], syllables[i+1][0]
        rand = random.randint(1, 5)
        if rand <= 2 and (start not in vowels and end not in vowels) and (start in sharp and end in sharp):
            new = nxt.replace(start, end)
            syllables[i+1] = new

    # Extend the ending of a word with a double consonant
    rand1 = random.randint(1, 7)
    if rand1 < 2 and syllables[-1][-1] in sharp and syllables[-1][-1] not in vowels:
        syllables[-1] += syllables[-1][-1]

    return syllables

# Separates vowels between syllable boundaries
def diaresis(syllables):
    # Replace the starting character of a syllable with an accented version
    vow = "aeiouėy"; dia = "äëïöüĕÿ"

    # Replace starting vowel of syllable with its diaresis equivalent
    for i in range(len(syllables)-1):
        nxt, end, start = syllables[i+1], syllables[i][-1], syllables[i+1][0]
        if start in vow and end in vow:
            syl = list(nxt); new = dia[vow.index(start)]
            syl[0] = new; syllables[i+1] = "".join(syl)

    return syllables

# Replace all vowels in a word with their dark equivalent
def darkVow(syllables):
    bri, dar = "aeiouáéíóúäëïöü", "àèìòùâêîôûāēīōū"

    for i in range(len(syllables)):
        res = [dar[bri.index(syllables[i][j])] if syllables[i][j] in bri else syllables[i][j] for j in range(len(syllables[i]))]
        syllables[i] = "".join(res)

    return syllables

# Generate a word
def genWord(num):
    structure = ["".join(genStruct()) for i in range(num)] # Syllable structure
    syllables = [genSyl(structure[i]) for i in range(len(structure))] # Actual syllable

    # Geminate consonants and simplify combinations, syllabify vowels
    syllables = geminate(syllables); syllables = diaresis(syllables); syllables = simplify(syllables)

    # Replace all the vowels in a word if vowels are dark
    dark = False; ran = random.randint(1, 5)
    if ran < 3: # Word contains dark vowels
        dark = True; syllables = darkVow(syllables)
        # Replace 3 or more repeated characters with 2
        word = re.sub(r'(.)\1{2,}', r'\1\1', "".join(syllables))
        return word
    else:
        word = re.sub(r'(.)\1{2,}', r'\1\1', "".join(syllables))
        return word

# Translate a text into pseudo-conlang
def translate(text):
    con, vow = "tlnrskjzmdvšhgbfđņļŧŗpģwķčĝcżžqĵñħğŵxþ", "aeiouy"
    find = re.findall(r'([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)\1*|([\w]+)\2*|([!"#$%&\'()*+,\-./:;<=>?@[\\\]^_`{\|}~]+)\3*|(\s+)\4*', text)
    split = [next(s for s in list(find[i]) if s != "") for i in range(len(find))] # Regex-splitted string
    tag = [next(i + 1 for i, j in enumerate(list(find[i])) if j) for i in range(len(find))] # Capture group of split string
    # Generate words, convert all numbers to base 16 or leave punctuation as they are
    sen = [capitalize(split[i], "".join(darkVow(list(genVow()))[0])) if len(split[i]) == 1 and tag[i] == 2 and split[i] in vow else capitalize(split[i], genCon(con)) if len(split[i]) == 1 and tag[i] == 2 else capitalize(split[i], genWord(sylco(split[i]))) if tag[i] == 2 else toBase(float(split[i]), 16, "0123456789ΧΛΓΔИΣ") if tag[i] == 1 else split[i] for i in range(len(split))]
    return "".join(sen)

# Transliterate a sentence into another script
def translit(sentence, mode):
    extras = " 0123456789ΧΛΓΔИΣ" + string.punctuation + "\n\t\v"
    standard = "aàbcčdđeèėfgĝģğhħiìjĵkķlļmnņñoòpqrŗsštŧuùvwŵxyzżžþáéíóúěýâêîôûäëïöüĕÿāēīōū"
    standard += standard.upper() + extras
    siragil = ""
    siragil += ""
    siragil += " " + string.punctuation + "\n\t\v"

    conv = list(sentence)
    if mode == 0: output = sentence
    elif mode == 1:
        out = [siragil[standard.index(i)] for i in conv]
        for i in range(len(out)-1):
            pre, nxt = conv[i], conv[i+1]
            if pre == "s" and nxt in string.punctuation + " ": out[i] = ""
            elif pre == "n" and nxt in string.punctuation + " ": out[i] = ""
            elif nxt == "k" and pre in string.punctuation + " ": out[i+1] = ""
            elif nxt == "K" and pre in string.punctuation + " ": out[i+1] = ""
        if conv[-1] == "s": out[-1] = ""
        elif conv[-1] == "n": out[-1] = ""
        elif conv[0] == "k": out[0] = ""
        elif conv[0] == "K": out[0] = ""
        output = "".join(out)

    return output

print(translit(translate("Hello World!\nThis is the Translator in action!"), 0))
