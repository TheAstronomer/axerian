//?? PROJECT AXERIA | AKALIA | NEZOLA ??//
/* The Art of Language Generation, Analysis & Translation */
/** Run the following command:
npm i xregexp randexp lodash underscore genex chance mathjs core-js slice numeral plexis voca moment datejs sugar utility preludejs lazy.js ramda mout string foswig i18next markov-strings underscore.string magic-string sprintf-js accounting-js random-weighted-choice markovian-nlp compromise natural underscore-query nlp-syllables syllable grapheme-splitter array-comprehensions oxford-dictionary cmu-pronouncing-dictionary wordlist-english
*/

//! NPM Dependencies !/
var XRegExp = require("xregexp"),
    _ = require("lodash"),
    Sugar = require("sugar"),
    RandExp = require("randexp"),
    Lazy = require("lazy.js"),
    genex = require("genex"),
    $ = require("underscore"),
    rwc = require("random-weighted-choice"),
    chance = require("chance").Chance(),
    math = require("mathjs"),
    { SliceString, SliceArray, range } = require("slice"),
    forOf = require("array-comprehensions");

// Object instantiation
require("underscore-query")(_);

// Language processing libraries (focused on English)
var Dictionary = require("oxford-dictionary"),
    cmu = require("cmu-pronouncing-dictionary"),
    wordlist = require("wordlist-english"),
    natural = require("natural"),
    syllable = require("syllable"),
    graphemeSplit = require("grapheme-splitter"),
    nlp = require("compromise"),
    nlpSyllables = require("nlp-syllables");

/* Native function extensions */
Sugar.Array.extend();
Sugar.Date.extend();
Sugar.Function.extend();
Sugar.Number.extend();
Sugar.Object.extend();
Sugar.RegExp.extend();
Sugar.String.extend();

//* Lists of Letters */
/**--------------------------------------------------------
Old Axerian Graphemes
АЯБЦЧДЂЕЭӘФГЏҔҒҺХІЫЈҨКӃЛԒМНӇҤОӨПԚРҎСШТЋУҮВԜѴѮИЗЅЖѰ ЪЬ
аябцчдђеэәфгџҕғһхіыјҩкӄлԓмнӈҥоөпԛрҏсштћуүвԝѵѯизѕжѱ ъь
---------------------------------------------------------*/

//! Regexes !//
const normals = XRegExp("([\\pL\\pM]+)|(\\pN+)|(\\pZ+)|(\\pC+)", "g"),
    nospaces = XRegExp("([\\pL\\pM]+)|(\\pN+)|(\\pC+)", "g"),
    letters = XRegExp("([\\pL\\pM]+)", "g"),
    numbers = XRegExp("(\\pN+)", "g"),
    symbols = XRegExp("([\\pP\\pS]+)", "g"),
    specials = XRegExp("(\\pC+)", "g"),
    spaces = XRegExp("(\\pZ+)", "g"),
    lower = XRegExp("\\p{Ll}", "g"),
    upper = XRegExp("\\p{Lu}", "g"),
    allchars = XRegExp(
        "([\\pL\\pM]+)|(\\pN+)|([\\pP\\pS]+)|(\\pZ+)|(\\pC+)",
        "g"
    );

// ? VOWEL CLASS
const MONO = /[aeEioOuUy]/; // monophthongs
const IP = /[aeEoOuy]/; // i-diphthongs
const UP = /[aeEioO]/; // u-diphthongs
const YP = /[aeiou]/; // y-diphthongs
const IUP = /[aeEoOy]/; // i/u-diphthongs

const DIPH = XRegExp.union([
    XRegExp.union([IP, /i/], "", {
        conjunction: "none",
    }),
    XRegExp.union([UP, /u/], "", {
        conjunction: "none",
    }),
    XRegExp.union([YP, /y/], "", {
        conjunction: "none",
    }),
]);

const EP = /[ao]/;
const OP = /[ae]/;

const EODIPH = XRegExp.union([
    XRegExp.union([EP, /e/], "", {
        conjunction: "none",
    }),
    XRegExp.union([OP, /o/], "", {
        conjunction: "none",
    }),
    XRegExp.union([/e/, EP], "", {
        conjunction: "none",
    }),
    XRegExp.union([/o/, OP], "", {
        conjunction: "none",
    }),
]);

const TRIPH = XRegExp.union([
    XRegExp.union([/i/, IP, /i/], "", {
        conjunction: "none",
    }),
    XRegExp.union([/u/, UP, /u/], "", {
        conjunction: "none",
    }),
    XRegExp.union([/i/, IUP, /u/], "", {
        conjunction: "none",
    }),
    XRegExp.union([/u/, IUP, /i/], "", {
        conjunction: "none",
    }),
]);

const VOW = XRegExp.union([MONO, DIPH, EODIPH]);
const DIPHS = XRegExp.union([DIPH, EODIPH]);
const ALLVOW = XRegExp.union([MONO, DIPH, EODIPH, TRIPH]);

// ? CONSONANT CLASS
const ALLCONS = /[bcCdDXfgGhHjJklLmnNQpqrRsStTvwxzZ]/;

// * Manner of articulation
const UNV = /[pftTsScCk]/; // Unvoiced
const VOI = /[bvdDzZXGg]/; // Voiced
const NAS = /[mnNQ]/; // Nasals
const SMV = /[jJ]/; // Semivowels
const VSM = /[jw]/; // Velar semivowels
const CLI = /[jlr]/; // Common liquids
const PLI = /[jJLNR]/; // Palatal liquids
const LIQ = /[lnrLNR]/; // Liquids

// * Place of articulation
const LAB = /[bpmfv]/; // Labials
const DEN = /[dtnDT]/; // Final liquids
const ALV = /[szSZcXCG]/; // Final liquids
const PAL = /[jJLNR]/; // Final liquids
const VEL = /[kgwQH]/; // Final liquids
const GLO = /[hq]/; // Glottal consonants

// * All occasions
const CONS = /[bcCdDXfgGhHjJklLmnNQpqrRsStTvwzZ]/;

// * Initial and medial consonants
const CONJ = /[bcCdDXfgGhHklmnQprsStTvwzZ]j|[kgQH]w/; // Initial only
const CONL = /[pftTsSkbvdDzZg][lr]/;

// * Medial consonants
const GCON = /([bcCdDXfgGhHjJklLmnNQpqrRsStTvwzZ])\1/; // Also final
const DCON = /[pk]t|tk|[bg]d|dg|p[sS]|ks|x|[bg][zZ]/;
const NCON = /m[bpfv]|n[dtDTszSZcXCG]|N[dtSZCG]|Q[kgxH]/;
const LCON = /l[pftTsScCkbvdDzZXGgnr]|n[tTsScCkdDzZXGglr]|r[pftTsScCkbvdDzZXGgln]|m[pbfv]|Q[kgHx]/;
const SCON = /s[ptcknlr]|z[bdXgnlr]|S[ptCknlr]|Z[bdGgnlr]/;

// * Final consonants
const LCONF = /l[pftTsScCkbvdDzZXGgn]|n[pftTsScCkbvdDzZXGg]|r[pftTsScCkbvdDzZXGgln]/;
const SCONF = /[sS][ptk]|[zZ][bdg]/;

// * Triple consonants (initial and medial)
const SCONL = /[sS]([ptk][rj]|k[w])|[zZ]([bdg][rj]|g[w])/;

// * Triple consonants (medial and final)
const LCONJ = /[lr]([bcCdDXfgGhHklmnQprsStTvwzZ]j|[kgQH]w)/;
const LDCON = /[lrsS][ptk]|[lrzZ][bgd]/;
const NDCON = /m[pb]|n[dt]/;

const seq = {
    vow: {
        mono: genex(MONO).generate(), // Single vowels
        diph: genex(DIPH).generate(), // I/U-glide diphthongs
        diphs: genex(DIPHS).generate(), // I/U/E/O-glide diphthongs
        eodiph: genex(EODIPH).generate(), // E/O-glide diphthongs
        triph: genex(TRIPH).generate(), // Triphthongs (single-syllable)
        vow: genex(VOW).generate(), // Possible vowel combinations
        allvow: genex(ALLVOW).generate(), // All vowel combinations
    },
    cons: {
        allcons: genex(ALLCONS).generate(), // Single consonants
        cons: genex(CONS).generate(), // Initial, medial, final
        conj: genex(CONJ).generate(), // Initial, medial
        conl: genex(CONL).generate(), // Initial, medial
        gcon: genex(GCON).generate(), // Medial, final
        dcon: genex(DCON).generate(), // Medial
        ncon: genex(NCON).generate(), // Medial
        lcon: genex(LCON).generate(), // Medial
        scon: genex(SCON).generate(), // Medial
        lconf: genex(LCONF).generate(), // Final
        sconf: genex(SCONF).generate(), // Final
        sconl: genex(SCONL).generate(), // Initial, medial
        lconj: genex(LCONJ).generate(), // Medial, final
        ldcon: genex(LDCON).generate(), // Medial, final
        ndcon: genex(NDCON).generate(), // Medial, final
    },
};

//! Syllable Counter !//
const ones = [
    /^[^aeiou]?ion/,
    /^[^aeiou]?ised/,
    /^[^aeiou]?iled/,

    // -ing, -ent
    /[aeiou][n][gt]$/,

    // -ate, -age
    /\wa[gt]e$/,
];

const all_spaces = / /g,
    ends_with_vowel = /[aeiouy]$/,
    starts_with_e_then_specials = /^e[sm]/,
    starts_with_e = /^e/,
    ends_with_noisy_vowel_combos = /(eo|eu|ia|oa|ua|ui)$/i,
    starts_with_single_vowel_combos = /^(eu)/i,
    aiouy = /[aiouy]/,
    ends_with_ee = /ee$/,
    whitespace_dash = /\s\-/,
    starts_with_consonant_vowel = /^[^aeiouy][h]?[aeiouy]/,
    joining_consonant_vowel = /^[^aeiou][e]([^d]|$)/,
    cvcv_same_consonant = /^([^aeiouy])[aeiouy]\1[aeiouy]/,
    cvcv_same_vowel = /^[^aeiouy]([aeiouy])[^aeiouy]\1/,
    cvcv_known_consonants = /^([tg][aeiouy]){2}/,
    only_one_or_more_c = /^[^aeiouy]+$/;

// Suffix fixes
function postprocess(arr) {
    // Trim whitespace
    arr = arr.map(function(w) {
        return w.trim();
    });
    arr = arr.filter(function(w) {
        return w !== "";
    });
    // if (arr.length > 2) {return arr;}
    let l = arr.length;
    if (l > 1) {
        let suffix = arr[l - 2] + arr[l - 1];
        for (let i = 0; i < ones.length; i++) {
            if (suffix.match(ones[i])) {
                arr[l - 2] = arr[l - 2] + arr[l - 1];
                arr.pop();
            }
        }
    }

    // Since the open syllable detection is overzealous,
    // sometimes need to rejoin incorrect splits
    if (arr.length > 1) {
        let first_is_open =
            (arr[0].length === 1 || arr[0].match(starts_with_consonant_vowel)) &&
            arr[0].match(ends_with_vowel);
        let second_is_joining = arr[1].match(joining_consonant_vowel);

        if (first_is_open && second_is_joining) {
            let possible_combination = arr[0] + arr[1];
            let probably_separate_syllables =
                possible_combination.match(cvcv_same_consonant) ||
                possible_combination.match(cvcv_same_vowel) ||
                possible_combination.match(cvcv_known_consonants);

            if (!probably_separate_syllables) {
                arr[0] = arr[0] + arr[1];
                arr.splice(1, 1);
            }
        }
    }

    if (arr.length > 1) {
        let second_to_last_is_open =
            arr[arr.length - 2].match(starts_with_consonant_vowel) &&
            arr[arr.length - 2].match(ends_with_vowel);
        let last_is_joining =
            arr[arr.length - 1].match(joining_consonant_vowel) &&
            ones.every((re) => !arr[arr.length - 1].match(re));

        if (second_to_last_is_open && last_is_joining) {
            let possible_combination = arr[arr.length - 2] + arr[arr.length - 1];
            let probably_separate_syllables =
                possible_combination.match(cvcv_same_consonant) ||
                possible_combination.match(cvcv_same_vowel) ||
                possible_combination.match(cvcv_known_consonants);

            if (!probably_separate_syllables) {
                arr[arr.length - 2] = arr[arr.length - 2] + arr[arr.length - 1];
                arr.splice(arr.length - 1, 1);
            }
        }
    }

    if (arr.length > 1) {
        let single = arr[0] + arr[1];
        if (single.match(starts_with_single_vowel_combos)) {
            arr[0] = single;
            arr.splice(1, 1);
        }
    }

    if (arr.length > 1) {
        if (arr[arr.length - 1].match(only_one_or_more_c)) {
            arr[arr.length - 2] = arr[arr.length - 2] + arr[arr.length - 1];
            arr.splice(arr.length - 1, 1);
        }
    }

    return arr;
}

function syllables(str) {
    let all = [];

    if (str.match(" ")) {
        return str.split(all_spaces).map(function(s) {
            return syllables(s);
        });
    }

    // Method is nested because it's called recursively
    let doer = function(w) {
        let vow = /[aeiouy]$/;
        let chars = w.split("");
        let before = "";
        let after = "";
        let current = "";
        for (let i = 0; i < chars.length; i++) {
            before = chars.slice(0, i).join("");
            current = chars[i];
            after = chars.slice(i + 1, chars.length).join("");
            let candidate = before + chars[i];

            // It's a consonant that comes after a vowel
            if (before.match(ends_with_vowel) && !current.match(ends_with_vowel)) {
                if (after.match(starts_with_e_then_specials)) {
                    candidate += "e";
                    after = after.replace(starts_with_e, "");
                }
                all.push(candidate);
                return doer(after);
            }

            // Unblended vowels ('noisy' vowel combinations)
            if (candidate.match(ends_with_noisy_vowel_combos)) {
                // 'io' is noisy, not in 'ion'
                all.push(before);
                all.push(current);
                return doer(after); // Recursion
            }

            // If candidate is followed by a CV, assume consecutive open syllables
            if (
                candidate.match(ends_with_vowel) &&
                after.match(starts_with_consonant_vowel)
            ) {
                all.push(candidate);
                return doer(after);
            }
        }
        // If still running, end last syllable
        if (str.match(aiouy) || str.match(ends_with_ee)) {
            //allow silent trailing e
            all.push(w);
        } else {
            all[all.length - 1] = (all[all.length - 1] || "") + w; // Append it to the last one
        }
        return null;
    };

    str.split(whitespace_dash).forEach(function(s) {
        doer(s);
    });
    all = postprocess(all);

    // For words like 'tree' and 'free'
    if (all.length === 0) {
        all = [str];
    }
    // Filter blanks
    all = all.filter(function(s) {
        return s !== "" && s !== null && s !== undefined;
    });

    return all;
}

//* Word Lists */
// Fetch pronunciation information of every English word
function listWords(obj) {
    let entries = [];
    for (const prop in obj) entries.push({ word: prop, pron: obj[prop] });
    return entries;
}

// listWords(cmu);

//* Syllable and Word Formation *//

// ? Word generation
function genWord(syl) {
    var cons = "tlnrskjzmdvShgbpfDNLTRwCGcXqJQHx",
        vows = "aeiouy".repeat(3) + "OUOUE",
        finals = "tlnrskzmdvSgbpfZ",
        geminates = "tlnrskzmdvSgbpfDNLTRCGcX",
        finalGemi = "nm";
    var word = [];
    const genCon = (cons) => {
        var rank = range(1, cons.length + 1),
            sr = SliceArray(...rank),
            wt = sr.map((i) => math.sum(sr[[i]]) + 1);
        return chance.weighted(cons.split(""), wt);
    };
    if (syl == 1) {
        // * Isolated
        var Syl = "";
        // ! Initial consonants
        var cp = chance.weighted([1, 2, 3], [13, 2, 1]),
            cp1 = chance.weighted([1, 2], [15, 1]);
        var vp = chance.weighted([1, 2, 3], [13, 5, 1]);
        var vc = chance.bool({
                likelihood: 10,
            }),
            vc1 = chance.bool({
                likelihood: 10,
            });
        var mc = genCon(cons, 2),
            mc1 = genCon(cons, 2);
        var mv = chance.pickone(vows);
        if (!vc) {
            switch (cp) {
                case 1:
                    Syl += mc;
                    break;
                case 2:
                    var med = chance.pickone("snl");
                    switch (med) {
                        case "s":
                            var mc = genCon(
                                cons
                                .split("")
                                .filter((i) => "ptcknlrbdXgCG".includes(i))
                                .join(""),
                                2
                            );
                            var sel = chance.pickone(seq.cons.scon.filter((i) => i[1] == mc));
                            Syl += sel;
                            break;
                        case "j":
                            var mc = genCon(
                                cons
                                .split("")
                                .filter((i) => "bcCdDXfgGhHklmnQprsStTvwzZ".includes(i))
                                .join(""),
                                2
                            );
                            var sel = chance.pickone(seq.cons.conj.filter((i) => i[0] == mc));
                            Syl += sel;
                            break;
                        case "l":
                            var mc = genCon(
                                cons
                                .split("")
                                .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                .join(""),
                                2
                            );
                            var sel = chance.pickone(seq.cons.conl.filter((i) => i[0] != mc));
                            Syl += sel;
                            break;
                    }
                    break;
                case 3:
                    var mc = genCon(
                        cons
                        .split("")
                        .filter((i) => "ptkbdg".includes(i))
                        .join(""),
                        2
                    );
                    var sel = chance.pickone(seq.cons.sconl.filter((i) => i[1] == mc));
                    Syl += sel;
                    break;
            }
        }
        // ! Vowels
        switch (vp) {
            case 1:
                Syl += mv;
                break;
            case 2:
                var sels = seq.vow.diphs.filter((i) => i.includes(mv)),
                    sel = sels.length < 1 ? mv : chance.pickone(sels);
                Syl += sel;
                break;
            case 3:
                var sels = seq.vow.triph.filter((i) => i.includes(mv)),
                    sel = sels.length < 1 ? mv : chance.pickone(sels);
                Syl += sel;
                break;
        }
        // ! Final consonants
        if (
            chance.bool({
                likelihood: 5,
            })
        ) {
            mc1 = genCon(finalGemi, 2);
            Syl += mc1 + mc1;
        } else if (!vc1) {
            mc1 = genCon(finals, 2);
            switch (cp1) {
                case 1:
                    Syl += mc1;
                    break;
                case 2:
                    med = chance.pickone("sl");
                    switch (med) {
                        case "s":
                            mc1 = genCon(
                                finals
                                .split("")
                                .filter((i) => "ptckbdXgCG".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.scon.filter((i) => i[1] == mc1));
                            break;
                        case "l":
                            mc1 = genCon(
                                finals
                                .split("")
                                .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.lconf.filter((i) => i[0] != mc1));
                            break;
                    }
                    Syl += sel;
                    break;
                case 3:
                    med = chance.pickone("nd");
                    switch (med) {
                        case "n":
                            mc1 = genCon(
                                finals
                                .split("")
                                .filter((i) => "ptkbdg".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.ndcon.filter((i) => i[1] != mc));
                            break;
                        case "d":
                            mc1 = genCon(
                                finals
                                .split("")
                                .filter((i) => "ptkbdg".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.ldcon.filter((i) => i[1] == mc1));
                            break;
                    }
                    Syl += sel;
                    break;
            }
        }
        word = [Syl];
    } else {
        for (var i in range(syl)) {
            var Syl = ""; // ? Final result
            // ? Random Probabilities
            var vp = chance.weighted([1, 2], [13, 7]),
                vc = chance.bool({
                    likelihood: 25,
                });
            switch (true) {
                case i == 0 && syl > 1: // * Initial
                    // ! Consonants
                    var cp = chance.weighted([1, 2, 3], [20, 4, 1]),
                        mc = genCon(cons, 8);
                    if (!vc) {
                        switch (cp) {
                            case 1:
                                Syl += mc;
                                break;
                            case 2:
                                var med = chance.pickone("snl");
                                switch (med) {
                                    case "s":
                                        var mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptcknlrbdXgCG".includes(i))
                                            .join(""),
                                            2
                                        );
                                        var sel = chance.pickone(
                                            seq.cons.scon.filter((i) => i[1] == mc)
                                        );
                                        Syl += sel;
                                        break;
                                    case "j":
                                        var mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "bcCdDXfgGhHklmnQprsStTvwzZ".includes(i))
                                            .join(""),
                                            2
                                        );
                                        var sel = chance.pickone(
                                            seq.cons.conj.filter((i) => i[0] == mc)
                                        );
                                        Syl += sel;
                                        break;
                                    case "l":
                                        var mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                            .join(""),
                                            2
                                        );
                                        var sel = chance.pickone(
                                            seq.cons.conl.filter((i) => i[1] != mc)
                                        );
                                        Syl += sel;
                                        break;
                                }
                                break;
                            case 3:
                                var mc = genCon(
                                    cons
                                    .split("")
                                    .filter((i) => "ptkbdg".includes(i))
                                    .join(""),
                                    2
                                );
                                var sel = chance.pickone(
                                    seq.cons.sconl.filter((i) => i[1] == mc)
                                );
                                Syl += sel;
                                break;
                        }
                    }
                    // ! Vowels
                    var mv = chance.pickone(vows);
                    switch (vp) {
                        case 1:
                            Syl += mv;
                            break;
                        case 2:
                            var sels = seq.vow.diphs.filter((i) => i.includes(mv)),
                                sel = sels.length < 1 ? mv : chance.pickone(sels);
                            Syl += sel;
                            break;
                    }
                    break;
                case syl > 1 && 0 < i && i < syl - 1: // * Medial
                    var cp = chance.weighted([1, 2, 3], [20, 4, 1]),
                        mc = genCon(cons, 8);
                    if (
                        chance.bool({
                            likelihood: 10,
                        })
                    ) {
                        mc = genCon(geminates, 2);
                        Syl += mc + mc;
                    } else if (!vc) {
                        var med, sel;
                        switch (cp) {
                            case 1:
                                Syl += mc;
                                break;
                            case 2:
                                med = chance.pickone("snld");
                                switch (med) {
                                    case "s":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptcknlrbdXgCG".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.scon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "n":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ncon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "l":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.lcon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "d":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.dcon.filter((i) => i[0] == mc)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                            case 3:
                                med = chance.pickone("slnd");
                                switch (med) {
                                    case "s":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.sconl.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "l":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "bcCdDXfgGhHklmnQprsStTvwzZ".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.lconj.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "n":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ndcon.filter((i) => i[1] != mc)
                                        );
                                        break;
                                    case "d":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ldcon.filter((i) => i[1] != mc)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                        }
                    }
                    // ! Vowel
                    var mv = chance.pickone(vows);
                    switch (vp) {
                        case 1:
                            Syl += mv;
                            break;
                        case 2:
                            var sels = seq.vow.diphs.filter((i) => i.includes(mv)),
                                sel = sels.length < 1 ? mv : chance.pickone(sels);
                            Syl += sel;
                            break;
                    }
                    break;
                case syl > 1 && i == syl - 1: // * Final
                    // ! Initial consonants
                    var cp = chance.weighted([1, 2, 3], [20, 4, 1]),
                        cp1 = chance.weighted([1, 2], [15, 1]);
                    var vp = chance.weighted([1, 2], [13, 5]);
                    var vc = chance.bool({
                            likelihood: 10,
                        }),
                        vc1 = chance.bool({
                            likelihood: 10,
                        });
                    var mc = genCon(cons, 2),
                        mc1 = genCon(cons, 2);
                    var mv = chance.pickone(vows);
                    var med = "",
                        sel = "";
                    if (
                        chance.bool({
                            likelihood: 10,
                        })
                    ) {
                        mc = genCon(geminates, 2);
                        Syl += mc + mc;
                    } else if (!vc) {
                        switch (cp) {
                            case 1:
                                Syl += mc;
                                break;
                            case 2:
                                med = chance.pickone("snld");
                                switch (med) {
                                    case "s":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptcknlrbdXgCG".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.scon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "n":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ncon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "l":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.lcon.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "d":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.dcon.filter((i) => i[0] == mc)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                            case 3:
                                med = chance.pickone("slnd");
                                switch (med) {
                                    case "s":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.sconl.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "l":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "bcCdDXfgGhHklmnQprsStTvwzZ".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.lconj.filter((i) => i[1] == mc)
                                        );
                                        break;
                                    case "n":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ndcon.filter((i) => i[1] != mc)
                                        );
                                        break;
                                    case "d":
                                        mc = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ldcon.filter((i) => i[1] != mc)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                        }
                    }
                    // ! Vowels
                    switch (vp) {
                        case 1:
                            Syl += mv;
                            break;
                        case 2:
                            var sels = seq.vow.diphs.filter((i) => i.includes(mv)),
                                sel = sels.length < 1 ? mv : chance.pickone(sels);
                            Syl += sel;
                            break;
                    }
                    // ! Final consonants
                    if (
                        chance.bool({
                            likelihood: 5,
                        })
                    ) {
                        mc1 = genCon(finalGemi, 2);
                        Syl += mc1 + mc1;
                    } else if (!vc1) {
                        mc1 = genCon(finals, 2);
                        switch (cp1) {
                            case 1:
                                Syl += mc1;
                                break;
                            case 2:
                                med = chance.pickone("sl");
                                switch (med) {
                                    case "s":
                                        mc1 = genCon(
                                            finals
                                            .split("")
                                            .filter((i) => "ptckbdXgCG".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.scon.filter((i) => i[1] == mc1)
                                        );
                                        break;
                                    case "l":
                                        mc1 = genCon(
                                            finals
                                            .split("")
                                            .filter((i) => "pftTsScCkbvdDzZXGgn".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.lconf.filter((i) => i[0] != mc1)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                        }
                    }
                    break;
            }
            word.push(Syl);
        }
    }

    // ? Postprocessing
    // Adding diacritics
    var uc = "CDXGHJLNQRSTZEOU",
        di = "ćðżġħĵłńŋŕśþźèöü";
    for (var i in word) {
        var Syl = word[i];
        var newSyl = "";
        for (var letter of Syl) {
            if (uc.includes(letter)) newSyl += di[uc.indexOf(letter)];
            else newSyl += letter;
        }
        word[i] = newSyl;
    }

    if (syl > 1) {
        // Distinguishing vowels in syllables
        var dic = "aeiouyèöü",
            div = "áéíóúýêőű";
        for (var i of range(1, syl)) {
            var newSyl = word[i].split("");
            if (
                /.*[aeiouyëöü]$/.test(word[i - 1]) &&
                /^[aeiouyëöü].*/.test(word[i])
            ) {
                newSyl[0] = div[dic.indexOf(word[i][0])];
                word[i] = newSyl.join("");
            }
        }
    }

    return {
        word: word.join(""),
        syls: word,
        sylc: syl,
    };
}

var arr = [];
for (var i of range(100)) arr.push(genWord(3));
console.log(arr);

//* Translation *//
function isCapital(word) {
    return word
        .split("")
        .map((c) =>
            XRegExp.test(c, upper) ? true : XRegExp.test(c, lower) ? false : null
        );
}

function getWords(str) {
    var arr = _.uniq(
        XRegExp.match(str, nospaces).map((i) => {
            return {
                word: i,
                syl: syllable(i),
                cap: isCapital(i),
            };
        })
    );
    return arr;
}

// Normalize a string
function normalize(str) {
    return XRegExp.match(str, normals).map((i) => i.toLowerCase());
}

// Tokenize string based on Unicode character categories
function tokenizeUnicode(str) {
    return XRegExp.match(str, allchars);
}

// Split into Unicode capture groups
function capture(str) {
    return XRegExp.match(str, allchars)
        .map((s) =>
            XRegExp.test(s, letters) ?
            "w" :
            XRegExp.test(s, numbers) ?
            "n" :
            XRegExp.test(s, symbols) ?
            "s" :
            XRegExp.test(s, specials) ?
            "c" :
            "z"
        )
        .join("");
}

// Transfer capitalization from one string to another
function capitalize(word, trans) {
    var cap = [],
        iscap = word
        .split("")
        .map((c) =>
            XRegExp.test(c, upper) ? 1 : XRegExp.test(c, lower) ? 2 : 0
        );
    if (_.sortedUniq(iscap) == [0, 1]) return trans.toUpperCase();
    else {
        var tra = trans.split(""),
            i = 0;
        while (i < word.length) {
            if (i == trans.length) break;
            if (iscap[i] == 1) cap.push(tra[i].toUpperCase());
            else cap.push(tra[i]);
            i += 1;
        }
        return cap.join("") + sliceArr(trans)[[i, ""]];
    }
}

console.log(capture("Hello World!"));
console.log(syllables("screeched"));
