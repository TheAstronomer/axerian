# -*- coding: UTF-8 -*-

import random, bisect, re, string, math

# Axerian - Version 4.1 #
# Challenge: Build a lexicon using Python!

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
    cap = []; upper = string.ascii_uppercase
    isCap = [True if word[i] in upper else False for i in range(len(word))]

    # Convert all characters to uppercase if all are uppercase
    if set(isCap) == {True}: return trans.upper()
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
    word = word.lower()
    # exception_add are words that need extra syllables
    # exception_del are words that need less syllables
    exception_add = ['serious','crucial']
    exception_del = ['fortunately','unfortunately']
    co_one = ['cool','coach','coat','coal','count','coin','coarse','coup','coif','cook','coign','coiffe','coof','court']
    co_two = ['coapt','coed','coinci']
    pre_one = ['preach']
    syls = 0 #added syllable number
    disc = 0 #discarded syllable number
    #1) if letters < 3: return 1
    if len(word) <= 3:
        syls = 1
        return syls
    #2) if doesn't end with "ted" or "tes" or "ses" or "ied" or "ies", discard "es" and "ed" at the end.
    # if it has only 1 vowel or 1 set of consecutive vowels, discard. (like "speed", "fled" etc.)
    if word[-2:] == "es" or word[-2:] == "ed":
        doubleAndtripple_1 = len(re.findall(r'[eaoui][eaoui]',word))
        if doubleAndtripple_1 > 1 or len(re.findall(r'[eaoui][^eaoui]',word)) > 1:
            if word[-3:] == "ted" or word[-3:] == "tes" or word[-3:] == "ses" or word[-3:] == "ied" or word[-3:] == "ies":
                pass
            else:
                disc+=1
    #3) discard trailing "e", except where ending is "le"
    le_except = ['whole','mobile','pole','male','female','hale','pale','tale','sale','aisle','whale','while']
    if word[-1:] == "e":
        if word[-2:] == "le" and word not in le_except:
            pass
        else:
            disc+=1
    #4) check if consecutive vowels exists, triplets or pairs, count them as one.
    doubleAndtripple = len(re.findall(r'[eaoui][eaoui]',word))
    tripple = len(re.findall(r'[eaoui][eaoui][eaoui]',word))
    disc+=doubleAndtripple + tripple
    #5) count remaining vowels in word.
    numVowels = len(re.findall(r'[eaoui]',word))
    #6) add one if starts with "mc"
    if word[:2] == "mc":
        syls+=1
    #7) add one if ends with "y" but is not surrouned by vowel
    if word[-1:] == "y" and word[-2] not in "aeoui":
        syls +=1
    #8) add one if "y" is surrounded by non-vowels and is not in the last word.
    for i,j in enumerate(word):
        if j == "y":
            if (i != 0) and (i != len(word)-1):
                if word[i-1] not in "aeoui" and word[i+1] not in "aeoui":
                    syls+=1
    #9) if starts with "tri-" or "bi-" and is followed by a vowel, add one.
    if word[:3] == "tri" and word[3] in "aeoui":
        syls+=1
    if word[:2] == "bi" and word[2] in "aeoui":
        syls+=1
    #10) if ends with "-ian", should be counted as two syllables, except for "-tian" and "-cian"
    if word[-3:] == "ian":
    #and (word[-4:] != "cian" or word[-4:] != "tian"):
        if word[-4:] == "cian" or word[-4:] == "tian":
            pass
        else:
            syls+=1
    #11) if starts with "co-" and is followed by a vowel, check if exists in the double syllable dictionary, if not, check if in single dictionary and act accordingly.
    if word[:2] == "co" and word[2] in 'eaoui':
        if word[:4] in co_two or word[:5] in co_two or word[:6] in co_two:
            syls+=1
        elif word[:4] in co_one or word[:5] in co_one or word[:6] in co_one:
            pass
        else:
            syls+=1
    #12) if starts with "pre-" and is followed by a vowel, check if exists in the double syllable dictionary, if not, check if in single dictionary and act accordingly.
    if word[:3] == "pre" and word[3] in 'eaoui':
        if word[:6] in pre_one:
            pass
        else:
            syls+=1
    #13) check for "-n't" and cross match with dictionary to add syllable.
    negative = ["doesn't", "isn't", "shouldn't", "couldn't","wouldn't"]
    if word[-3:] == "n't":
        if word in negative:
            syls+=1
        else:
            pass
    #14) Handling the exceptional words.
    if word in exception_del:
        disc+=1
    if word in exception_add:
        syls+=1
    # calculate the output
    return numVowels - disc + syls

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
    isLong = False; isDiph = False
    randLong = random.randint(1, 3) # Long vowel
    if randLong == 1: isLong = True
    randDiph = random.randint(1, 15) # Diphthong
    if randLong == 1: isDiph = True

    # Generates a random short vowel
    vowel = random.choice(normal)
    if isLong == True: # Long vowel
        lon = long[normal.index(vowel)]; vowel = lon

    # Adds a i or u glide
    if isDiph == True:
        if vowel in "aeoėyáéóěý":
            vow = "ui"; val = random.choice(vow); vowel += vow
        else:
            if vowel in "ií" and len(vowel) < 2: vow = "u"; vowel += vow
            elif vowel in "uú" and len(vowel) < 2: vow = "i"; vowel += vow
        if prob == "before": vowel = vowel[::-1]
    if vowel == "": vowel = random.choice(normal) # Fallback
    new = ""
    if "ui" in vowel:
        new = vowel.replace(random.choice(["i", "u"]), "")
        vowel = new
    elif "iu" in vowel:
        new = vowel.replace(random.choice(["i", "u"]), "")
        vowel = new

    return vowel # Returns a vowel or diphthong

# Generate random syllable structure
def genStruct():
    syl = "v" # Start with a vowel

    p1 = random.randint(1, 11); p2 = random.randint(1, 11)
    p3 = random.randint(1, 16); p4 = random.randint(1, 16)
    p5 = random.randint(1, 13);

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
    spelling = []
    init = "szšž"; meds = "lrjwļŗĵ"; fins = "lrjwļŗĵnmņñ"
    cons = "tlnrskjzmdvšhgbfđņļŧŗpģwķčĝcżžqĵñħğŵxþ"
    for j in st:
        letters = list(j)
        for i in range(len(letters)):
            if letters[i] == "c": spelling.append(genCon(cons))
            elif letters[i] == "l": spelling.append(genCon(meds))
            elif letters[i] == "i": spelling.append(genCon(init))
            elif letters[i] == "s": spelling.append(genCon(fins))
            elif letters[i] == "v": spelling.append(genVow())
    return "".join(spelling)

# Removes unwanted consonant sequences between syllables
def simplify(syllables):
    # Constant strings
    cons = 'bcdfghjklmnpqrstvwxzñþčđĝğģħĵķļņŗšŧŵżž'; vowels = "aeiouėyáéíóúěý"
    chars = "aàbcčdđeèėfgĝģğhħiìjĵkķlļmnņñoòpqrŗsštŧuùvwŵxyzżžþáéíóúěýâêîôû"

    # Consonants divided into phonetic qualities
    lab = "pbm"; lbd = "fv"; alv = "tdn"; den = "đŧ"
    sib = "szcżšžčĝ"; pal = "ķģņ"; vel = "kgñħğ"
    glo = "q"; app = "jĵwlrļŗ"; oth = "xþŵ"
    nas = "mnņñ"; unv = "ptķkfŧħsšcč"; voi = "bdģgvđğzžżĝ"
    bad = []; exc = []; pos = [i + j for i in cons for j in cons]

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

    for i in range(len(pos)):
        one, two = pos[i][0], pos[i][1]
        if one in "xþ":
            if two in nas or two in app: exc.append(pos[i])
        elif two in "xþ":
            if one in app: exc.append(pos[i])
        # elif one in "h":
            # if two in nas: exc.append(pos[i])
    bad = [i for i in bad if i not in exc]

    for i in range(len(syllables)-1):
        # Checks for cross-syllabic consonant clusters.
        pre = syllables[i]; nxt = syllables[i+1];
        end = syllables[i][-1]; start = syllables[i+1][0]

        if start not in vowels or end not in vowels:
            # Do voicing assimilations
            if start in voi and end in unv: # Ending with unvoiced consonant
                new = nxt.replace(start, unv[voi.index(start)])
                syllables[i+1] = new
            elif start in unv and end in voi: # Ending with voiced consonant
                new = nxt.replace(start, voi[unv.index(start)])
                syllables[i+1] = new
            elif start in unv and end in nas: # Ending with nasal consonant
                new = nxt.replace(start, voi[unv.index(start)])
                syllables[i+1] = new

            # Removes bad consonant combinations
            if (end + start) in bad:
                new = nxt.replace(start, end)
                syllables[i+1] = new

    # Removes bad consonant combinations
    for i in range(len(syllables)):
        toReplace = syllables[i]; toReplace2 = syllables[i]
        if toReplace[:2] in bad:
            new = toReplace.replace(syllables[i][:2], syllables[i][0])
            syllables[i] = new
        if toReplace2[-2:] in bad:
            new1 = toReplace2[i].replace(syllables[i][-2:], syllables[i][-1])
            syllables[i] = new1

    if (syllables[0][0] in nas + app) and syllables[0][1] in cons:
        new = syllables[0].replace(syllables[0][0], "")
        syllables[0] = new

    return syllables

# Apply gemination
def geminate(syllables):
    # Consonants divided into phonetic qualities
    lab = "pbm"; lbd = "fv"; alv = "tdn"; den = "đŧ"
    sib = "szcżšžčĝ"; pal = "ķģņ"; vel = "kgñħğ"
    glo = "qh"; app = "jĵwlrļŗ"; oth = "xþŵ"
    nas = "mnņñ"; unv = "ptķkfŧħsšcč"; voi = "bdģgvđğzžżĝ"

    # Only sharp consonants can lengthen.
    sharp = sib + alv + den + "lr"

    # Replaces the starting consonant in a syllable with the
    # ending consonant of the syllable before it
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

# diaresis vowels
def diaresis(syllables):
    # Replace the starting character of a syllable with an accented version
    vowels = "aeiouėy"; sylVowels = "äëïöüĕÿ"
    for i in range(len(syllables)-1):
        nxt, end, start = syllables[i+1], syllables[i][-1], syllables[i+1][0]
        if start in vowels and end in vowels:
            syl = list(nxt); new = sylVowels[vowels.index(start)]
            syl[0] = new; syllables[i+1] = "".join(syl)
    return syllables

# Replace all vowels in a word with their dim equivalent
def dimVow(syllables):
    bri = "aeiouáéíóúäëïöü"; dim = "àèìòùâêîôûāēīōū"
    for i in range(len(syllables)):
        res = [dim[bri.index(syllables[i][j])] if syllables[i][j] in bri else syllables[i][j] for j in range(len(syllables[i]))]
        syllables[i] = "".join(res)
    return syllables

# Generate a word
def genWord(num):
    structure = ["".join(genStruct()) for i in range(num)] # Syllable structure
    syllables = [genSyl(structure[i]) for i in range(len(structure))] # Actual syllable

    # Apply the three above functions
    syllables = geminate(syllables)
    syllables = diaresis(syllables)
    syllables = simplify(syllables)

    dim = False; word = ""
    ran1 = random.randint(1, 5)

    if ran1 < 3: # Replace all the vowels in a word if vowels are dim
        dim = True
        syllables = dimVow(syllables)
        # Replace 3 or more instances of the same character with 2
        word = re.sub(r'(.)\1{2,}', r'\1\1', "".join(syllables))
        return word
    else:
        word = re.sub(r'(.)\1{2,}', r'\1\1', "".join(syllables))
        return word

# Translate a text into gibberish
def translate(text):
    find = re.findall(r'([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)\1*|([\w]+)\2*|([!"#$%&\'()*+,\-./:;<=>?@[\\\]^_`{\|}~]+)\3*|(\s+)\4*', text)
    split = [next(s for s in list(find[i]) if s != "") for i in range(len(find))] # Regex-splitted string
    tag = [next(i + 1 for i, j in enumerate(list(find[i])) if j) for i in range(len(find))] # Capture group of split string
    # Generate words, convert all numbers to base 16 or leave punctuation as they are
    sen = ["".join(dimVow(list(genVow()))[0]).title() if tag[i] == 2 and len(split[i]) == 1 and split[i] in string.ascii_uppercase else "".join(dimVow(list(genVow()))[0]) if tag[i] == 2 and len(split[i]) == 1 and split[i] in string.ascii_lowercase else capitalize(split[i], genWord(sylco(split[i]))) if tag[i] == 2 else toBase(float(split[i]), 16, "0123456789ΧΛΓΔИΣ") + ":" if tag[i] == 1 else (split[i]) for i in range(len(split))]
    return "".join(sen)

# Transliterate a sentence into another script
def translit(sentence, mode):
    extras = " 0123456789ΧΛΓΔИΣ" + string.punctuation + "\n\t\v"
    standard = "aáäàâābcčdđeéëèêēėěĕfgĝģğhħiíïìîījĵkķlļmnņñoóöòôōpqrŗsštŧuúüùûūvwŵxyýÿzżžþ"
    standard += standard.upper() + extras
    siragil = ""
    siragil += ""
    siragil += " " + string.punctuation + "\n\t\v"

    conv = list(sentence)
    if mode == 0: output = sentence
    elif mode == 1:
        out = [siragil[standard.index(i)] for i in conv]
        for i in range(len(out)-1):
            pre = conv[i]; nxt = conv[i+1]
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

print(translit("Hello World!\nThis is cool!", 1))
