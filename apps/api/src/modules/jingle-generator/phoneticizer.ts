/**
 * Phoneticizer — converts shop names into singable phonetic lyrics.
 *
 * Handles abbreviations (JW -> "Jay Double-Yew"), numbers (A1 -> "Ay-One"),
 * symbols (& -> "And"), and passes regular words through unchanged.
 */

const LETTER_PHONETICS: Record<string, string> = {
  A: 'Ay',
  B: 'Bee',
  C: 'See',
  D: 'Dee',
  E: 'Ee',
  F: 'Eff',
  G: 'Jee',
  H: 'Aych',
  I: 'Eye',
  J: 'Jay',
  K: 'Kay',
  L: 'El',
  M: 'Em',
  N: 'En',
  O: 'Oh',
  P: 'Pee',
  Q: 'Cue',
  R: 'Arr',
  S: 'Ess',
  T: 'Tee',
  U: 'Yoo',
  V: 'Vee',
  W: 'Double-Yew',
  X: 'Ex',
  Y: 'Why',
  Z: 'Zee',
};

const SYMBOL_MAP: Record<string, string> = {
  '&': 'And',
  '+': 'Plus',
  '@': 'At',
  '#': 'Number',
  '%': 'Percent',
  '/': 'Slash',
};

const ONES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numberToWords(n: number): string {
  if (n < 0) return 'Negative ' + numberToWords(-n);
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one === 0 ? TENS[ten] : `${TENS[ten]}-${ONES[one]}`;
  }
  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return remainder === 0
      ? `${ONES[hundred]} Hundred`
      : `${ONES[hundred]} Hundred ${numberToWords(remainder)}`;
  }
  // 4+ digits: spell each digit
  return n
    .toString()
    .split('')
    .map((d) => ONES[parseInt(d, 10)])
    .join(' ');
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

function hasVowel(word: string): boolean {
  return word.split('').some((ch) => VOWELS.has(ch.toUpperCase()));
}

function isAbbreviation(word: string): boolean {
  // All uppercase AND (no vowels OR length <= 3)
  if (word !== word.toUpperCase()) return false;
  if (!/^[A-Z]+$/.test(word)) return false;
  return !hasVowel(word) || word.length <= 3;
}

function spellOutLetters(word: string): string {
  return word
    .split('')
    .map((ch) => LETTER_PHONETICS[ch.toUpperCase()] || ch)
    .join(' ');
}

function processMixedAlphanumeric(token: string): string {
  // Split into runs of letters vs digits
  const parts = token.match(/[A-Za-z]+|\d+/g);
  if (!parts) return token;

  return parts
    .map((part) => {
      if (/^\d+$/.test(part)) {
        return numberToWords(parseInt(part, 10));
      }
      // Single uppercase letter in mixed context → phonetic
      if (part.length === 1 && /^[A-Z]$/.test(part)) {
        return LETTER_PHONETICS[part] || part;
      }
      // Multi-letter abbreviation
      if (isAbbreviation(part)) {
        return spellOutLetters(part);
      }
      return part;
    })
    .join('-');
}

function processToken(token: string): string {
  // Check if token is a pure symbol
  if (SYMBOL_MAP[token]) return SYMBOL_MAP[token];

  // Check for symbol characters within token
  const symbolChars = Object.keys(SYMBOL_MAP);
  for (const sym of symbolChars) {
    if (token.includes(sym)) {
      return token
        .split(sym)
        .map((part) => (part ? processToken(part) : ''))
        .filter(Boolean)
        .join(` ${SYMBOL_MAP[sym]} `);
    }
  }

  // Pure number
  if (/^\d+$/.test(token)) {
    return numberToWords(parseInt(token, 10));
  }

  // Mixed alphanumeric (e.g. "A1", "5Star")
  if (/[A-Za-z]/.test(token) && /\d/.test(token)) {
    return processMixedAlphanumeric(token);
  }

  // Pure abbreviation (all caps, no vowels or <= 3 chars)
  if (isAbbreviation(token)) {
    return spellOutLetters(token);
  }

  // Regular word — pass through
  return token;
}

export function phoneticize(shopName: string): string {
  return shopName
    .split(/\s+/)
    .map(processToken)
    .join(' ');
}
