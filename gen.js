var XRegExp = require("xregexp"),
    genex = require("genex"),
    RandExp = require("randexp"),
    rwc = require("random-weighted-choice"),
    chance = require("chance").Chance(),
    { SliceArray, SliceString } = require("slice"),
    { range, uniq, initial } = require("lodash"),
    { sum } = require("mathjs");

// ? VOWEL CLASS

const MONO = /[aeEioOuUy]/; // monophthongs
const IP = /[aeEoOuy]/; // i-diphthongs
const UP = /[aeEioO]/; // u-diphthongs
const YP = /[aeEioOuU]/; // y-diphthongs
const IUP = /[aeEoOy]/; // i/u-diphthongs

const DIPH = XRegExp.union([
    XRegExp.union([IP, /i/], "", { conjunction: "none" }),
    XRegExp.union([UP, /u/], "", { conjunction: "none" }),
    XRegExp.union([YP, /y/], "", { conjunction: "none" }),
]);

const EP = /[ao]/;
const OP = /[ae]/;

const EODIPH = XRegExp.union([
    XRegExp.union([EP, /e/], "", { conjunction: "none" }),
    XRegExp.union([OP, /o/], "", { conjunction: "none" }),
    XRegExp.union([/e/, EP], "", { conjunction: "none" }),
    XRegExp.union([/o/, OP], "", { conjunction: "none" }),
]);

const TRIPH = XRegExp.union([
    XRegExp.union([/i/, IP, /i/], "", { conjunction: "none" }),
    XRegExp.union([/u/, UP, /u/], "", { conjunction: "none" }),
    XRegExp.union([/i/, IUP, /u/], "", { conjunction: "none" }),
    XRegExp.union([/u/, IUP, /i/], "", { conjunction: "none" }),
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
const CONL = /[pftTsSkbvdDzZg][lr]|[ptkbdg][LR]/;

// * Medial consonants
const GCON = /([bcCdDXfgGhHjJklLmnNQpqrRsStTvwzZ])\1/; // Also final
const DCON = /[pk]t|tk|[bg]d|dg|p[sS]|ks|x|[bg][zZ]/;
const NCON = /m[bpfv]|n[dtDTszSZcXCG]|N[dtSZCG]|Q[kgxH]/;
const LCON = /l[pftTsScCkbvdDzZXGgnNrR]|n[pftTsScCkbvdDzZXGglLrR]|r[pftTsScCkbvdDzZXGglLnN]/;
const SCON = /s[ptcknlr]|z[bdXgnlr]|S[ptCknlr]|Z[bdGgnlr]/;

// * Final consonants
const LCONF = /l[pftTsScCkbvdDzZXGgn]|n[pftTsScCkbvdDzZXGglr]|r[pftTsScCkbvdDzZXGgln]/;
const SCONF = /[sS][ptk]|[zZ][bdg]/;

// * Triple consonants (initial and medial)
const SCONL = /[sS]([ptk][rj]|k[w])|[zZ]([bdg][rj]|g[w])/;

// * Triple consonants (medial and final)
const LCONJ = /[lr]([bcCdDXfgGhHklmnQprsStTvwzZ]j|[kgQH]w)/;
const LDCON = /[lrsS](p[tk]|t[pk]|kt)|[lrzZ](b[dg]|d[bg]|gd)/;
const NDCON = /m(pt|bd)|n(tk|dg)/;

// console.log(genex(SCONF).generate());

const seq = {
    vow: {
        mono: genex(MONO).generate(),
        diph: genex(DIPH).generate(),
        diphs: genex(DIPHS).generate(),
        eodiph: genex(EODIPH).generate(),
        triph: genex(TRIPH).generate(),
        vow: genex(VOW).generate(),
        allvow: genex(ALLVOW).generate(),
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

// ? Word generation
function genWord(syl) {
    var cons = "tlnrskjzmdvShgbpfDNLTRwCGcXqJQHx",
        vows = "aeiouyOU".repeat(2) + "E",
        geminates = "tlnrskzmdvSgbpfDNLTRCGcX";
    var word = [];
    const genCon = (cons) => {
        var rank = range(1, cons.length + 1),
            sr = SliceArray(...rank),
            wt = sr.map((i) => sum(sr[[i]]) + 1);
        return chance.weighted(cons.split(""), wt);
    };
    if (syl == 1) {
        // * Isolated
        var Syl = "";
        // ! Initial consonants
        var cp = chance.weighted([1, 2, 3], [13, 2, 1]),
            cp1 = chance.weighted([1, 2, 3], [13, 2, 1]);
        var vp = chance.weighted([1, 2, 3], [13, 5, 1]);
        var vc = chance.bool({ likelihood: 10 }),
            vc1 = chance.bool({ likelihood: 10 });
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
        }
        // ! Final consonants
        if (chance.bool({ likelihood: 10 })) {
            mc1 = genCon(geminates, 2);
            Syl += mc1 + mc1;
        } else if (!vc1) {
            var med = "",
                sel = "";
            switch (cp1) {
                case 1:
                    Syl += mc;
                    break;
                case 2:
                    med = chance.pickone("sl");
                    switch (med) {
                        case "s":
                            mc1 = genCon(
                                cons
                                .split("")
                                .filter((i) => "ptckbdXgCG".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.scon.filter((i) => i[1] == mc1));
                            break;
                        case "l":
                            mc1 = genCon(
                                cons
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
                                cons
                                .split("")
                                .filter((i) => "ptkbdg".includes(i))
                                .join(""),
                                2
                            );
                            sel = chance.pickone(seq.cons.ndcon.filter((i) => i[1] != mc));
                            break;
                        case "d":
                            mc1 = genCon(
                                cons
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
                vc = chance.bool({ likelihood: 25 });
            switch (true) {
                case i == 0 && syl > 1: // * Initial
                    // ! Consonants
                    cp = chance.weighted([1, 2, 3], [13, 2, 1]);
                    var mc = genCon(cons, 8);
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
                    cp = chance.weighted([1, 2, 3], [13, 2, 1]);
                    var mc = genCon(cons, 8);
                    if (chance.bool({ likelihood: 10 })) {
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
                                            seq.cons.ldcon.filter((i) => i[1] == mc)
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
                    var cp = chance.weighted([1, 2, 3], [13, 2, 1]),
                        cp1 = chance.weighted([1, 2, 3], [13, 2, 1]);
                    var vp = chance.weighted([1, 2], [13, 5]);
                    var vc = chance.bool({ likelihood: 10 }),
                        vc1 = chance.bool({ likelihood: 10 });
                    var mc = genCon(cons, 2),
                        mc1 = genCon(cons, 2);
                    var mv = chance.pickone(vows);
                    var med = "",
                        sel = "";
                    if (chance.bool({ likelihood: 10 })) {
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
                                            seq.cons.ldcon.filter((i) => i[1] == mc)
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
                    if (chance.bool({ likelihood: 10 })) {
                        mc1 = genCon(geminates, 2);
                        Syl += mc1 + mc1;
                    } else if (!vc1) {
                        switch (cp1) {
                            case 1:
                                Syl += mc1;
                                break;
                            case 2:
                                med = chance.pickone("sl");
                                switch (med) {
                                    case "s":
                                        mc1 = genCon(
                                            cons
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
                                            cons
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
                            case 3:
                                med = chance.pickone("nd");
                                switch (med) {
                                    case "n":
                                        mc1 = genCon(
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
                                        mc1 = genCon(
                                            cons
                                            .split("")
                                            .filter((i) => "ptkbdg".includes(i))
                                            .join(""),
                                            2
                                        );
                                        sel = chance.pickone(
                                            seq.cons.ldcon.filter((i) => i[1] == mc1)
                                        );
                                        break;
                                }
                                Syl += sel;
                                break;
                        }
                    }
            }
            word.push(Syl);
        }
    }

    // ? Postprocessing
    // Adding diacritics
    var uc = "CDXGHJLNQRSTZEOU",
        di = "ċðżġħÿłńŋŕśþźåøü";
    for (var i in word) {
        var syl = word[i];
        var newSyl = "";
        for (var letter of syl) {
            if (uc.includes(letter)) newSyl += di[uc.indexOf(letter)];
            else newSyl += letter;
        }
        word[i] = newSyl;
    }

    // Distinguishing vowels in syllables
    var dic = "aeiouyåøü",
        div = "aeiouyǻǿű";
    for (var i of range(1, syl)) {
        if (/.*[aeiouyåøü]$/.test(word[i - 1]) && /^[aeiouyåøü].*/.test(word[i])) {
            var newSyl = syl.split("");
            newSyl[0] = div[dic.indexOf(word[i][0])]
            word[i] = newSyl.join("");
        }
    }
    return word.join("");
}

for (var i of range(200)) console.log(genWord(2));
