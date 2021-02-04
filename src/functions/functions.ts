var normalizedLookup = { 'à': 'à', 'á': 'á', 'ā': 'ā', 'è': 'è', 'é': 'é', 'ē': 'ē', 'ì': 'ì', 'í': 'í', 'ī': 'ī', 'ò': 'ò', 'ó': 'ó', 'ō': 'ō', 'ù': 'ù', 'ú': 'ú', 'ū': 'ū', 'm̀': 'm̀', 'ḿ': 'ḿ', 'm̄': 'm̄', 'g̀': 'g̀', 'ǵ': 'ǵ', 'ḡ': 'ḡ' }
var nonNormalizedRegex = /(?:à|á|ā|è|é|ē|ì|í|ī|ò|ó|ō|ù|ú|ū|m̀|ḿ|m̄|g̀|ǵ|ḡ)/g;

function normalizeReplacer(nonNormalized) {
  return normalizedLookup[nonNormalized];
}

function normalize(string) {
  if (typeof String.prototype.normalize === 'function') {
    return string.normalize();
  } else {
    return string.replace(nonNormalizedRegex, normalizeReplacer);
  }
}

const JYUTPING_INITIAL_TO_YALE_INITIAL = {
  "": "",
  "b": "b",
  "p": "p",
  "m": "m",
  "f": "f",
  "d": "d",
  "t": "t",
  "n": "n",
  "l": "l",
  "g": "g",
  "k": "k",
  "ng": "ng",
  "h": "h",
  "gw": "gw",
  "kw": "kw",
  "w": "w",
  "z": "j",
  "c": "ch",
  "s": "s",
  "j": "y"
};

const JYUTPING_FINAL_TO_YALE_FINAL = {
  "a": "a",
  "aa": "a",
  "aai": "aai",
  "aau": "aau",
  "aam": "aam",
  "aan": "aan",
  "aang": "aang",
  "aap": "aap",
  "aat": "aat",
  "aak": "aak",
  "ai": "ai",
  "au": "au",
  "am": "am",
  "an": "an",
  "ang": "ang",
  "ap": "ap",
  "at": "at",
  "ak": "ak",
  "e": "e",
  "ei": "ei",
  "eu": "(eu)",
  "em": "(em)",
  "en": "(en)",
  "eng": "eng",
  "ep": "(ep)",
  "ek": "ek",
  "i": "i",
  "iu": "iu",
  "im": "im",
  "in": "in",
  "ing": "ing",
  "ip": "ip",
  "it": "it",
  "ik": "ik",
  "o": "o",
  "oet": "(oet)",
  "oi": "oi",
  "ou": "ou",
  "on": "on",
  "ong": "ong",
  "ot": "ot",
  "ok": "ok",
  "oe": "eu",
  "oeng": "eung",
  "oek": "euk",
  "eoi": "eui",
  "eon": "eun",
  "eot": "eut",
  "u": "u",
  "ui": "ui",
  "un": "un",
  "ung": "ung",
  "ut": "ut",
  "uk": "uk",
  "yu": "yu",
  "yun": "yun",
  "yut": "yut",
  "m": "m",
  "ng": "ng"
};

const JYUTPING_INITIALS = Object.keys(JYUTPING_INITIAL_TO_YALE_INITIAL);
const JYUTPING_FINALS = Object.keys(JYUTPING_FINAL_TO_YALE_FINAL);

const JYUTPING_TONE_TO_YALE_COMBINING_ACCENT = {
  1: "\u0304",
  2: "\u0301",
  3: "",
  4: "\u0300",
  5: "\u0301",
  6: ""
};

const jyutpingWord = new RegExp(`\\b(?:(?:${JYUTPING_INITIALS.join('|')})(?:${JYUTPING_FINALS.join('|')})(?:[1-6]{1}))+\\b`, 'gi');
const jyutpingSyllable = new RegExp(`(${JYUTPING_INITIALS.join('|')})(${JYUTPING_FINALS.join('|')})([1-6]{1})`, 'gi');

/* CONVERSION */

function capitalization(initial, final) {
  var syllable = initial + final;
  if (syllable.toUpperCase() === syllable) {
    return "capitals";
  } else if (syllable[0].toUpperCase() === syllable[0]) {
    return "initial-capitals";
  } else {
    return "lower-case";
  }
}

function jyutpingComponentsToYaleComponents(initial, final) {
  let yaleInitial = JYUTPING_INITIAL_TO_YALE_INITIAL[initial.toLowerCase()];
  let yaleFinal = JYUTPING_FINAL_TO_YALE_FINAL[final.toLowerCase()];

  // Yale treats "y" as an initial when paired with a final beginning with "y".
  if (yaleInitial === "y" && yaleFinal.charAt(0) === "y") {
    yaleFinal = yaleFinal.substring(1);
  }

  switch (capitalization(initial, final)) {
    case "capitals":
      yaleInitial = yaleInitial.toUpperCase();
      yaleFinal = yaleFinal.toUpperCase();
    break;
    case "initial-capitals":
      if (yaleInitial.length >= 1) {
        yaleInitial = yaleInitial[0].toUpperCase() + yaleInitial.slice(1);
      } else {
        yaleFinal = yaleFinal[0].toUpperCase() + yaleFinal.slice(1);
      }
    break;
  }

  return {
    yaleInitial,
    yaleFinal
  };
}

function jyutpingComponentsToYale(initial, final, tone) {
  let { yaleInitial, yaleFinal } = jyutpingComponentsToYaleComponents(initial, final);

  // Identify the position in the strings where we need to make our changes.
  let accentIndex, insertionPoint;

  if (yaleFinal.toLowerCase() === "m") {
    accentIndex = 1;
    insertionPoint = 1;
  } else if (yaleFinal.toLowerCase() === "ng") {
    accentIndex = 2;
    insertionPoint = 2;
  } else {
    const firstVowelMatch = /[aeiou]/i.exec(yaleFinal);
    const lastVowelMatch = /^(.*[aeiou]*[aeiou]{1})/i.exec(yaleFinal);
    accentIndex = firstVowelMatch.index + 1;
    insertionPoint = lastVowelMatch[1].length;
  }

  // Insert the combining accent directly following the vowel.
  const combiningAccent = JYUTPING_TONE_TO_YALE_COMBINING_ACCENT[tone];
  yaleFinal = yaleFinal.substring(0, accentIndex) + combiningAccent + yaleFinal.substring(accentIndex);

  // For low tones, insert the "h" in the correct position.

  var lowToneMark = 'h';
  if (capitalization(yaleInitial, yaleFinal) === "capitals") {
    lowToneMark = "H";
  }

  if (tone > 3) {
    let adjustedInsertionPoint = insertionPoint + combiningAccent.length;
    yaleFinal = yaleFinal.substring(0, adjustedInsertionPoint) + lowToneMark + yaleFinal.substring(adjustedInsertionPoint);
  }

  yaleInitial = yaleInitial ? yaleInitial : '';
  return yaleInitial + yaleFinal;
}

/**
 * Convert Jyutping to Yale
 * @customfunction
 * @helpUrl https://github.com/cantonese/cantonese-for-excel#cantonesejyutpingtoyale
 * @param {string} jyutping String containing Jyutping romanization.
 * @returns {string} String with Jyutping romanization converted to Yale.
 */
export function jyutpingToYale(jyutping) {
  var wordMatch;
  let wordCursor = 0;
  let wordIndex = 0;
  let wordLastIndex = 0;

  var syllableMatches;

  let output = '';

  while ((wordMatch = jyutpingWord.exec(jyutping)) !== null) {
    const word = wordMatch[0];

    wordIndex = wordMatch.index;
    wordLastIndex = jyutpingWord.lastIndex;

    output += jyutping.substring(wordCursor, wordIndex);

    while ((syllableMatches = jyutpingSyllable.exec(word)) !== null) {
      const initial = syllableMatches[1];
      const final = syllableMatches[2];
      const tone = syllableMatches[3];

      output += jyutpingComponentsToYale(initial, final, tone);
    }

    wordCursor = wordLastIndex;
  }

  output += jyutping.slice(wordLastIndex);

  return normalize(output);
}
