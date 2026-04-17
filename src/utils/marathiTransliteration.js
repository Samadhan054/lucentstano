/**
 * High-Performance Marathi Transliteration Engine
 * Converts Hinglish/Phonetic English to Devanagari Marathi
 */

const consonants = {
    'kh': 'ख', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 'jh': 'झ', 'Th': 'ठ', 'Dh': 'ढ', 'th': 'थ', 'dh': 'ध', 'ph': 'फ', 'bh': 'भ', 'sh': 'श', 'shh': 'ष', 'gy': 'ज्ञ', 'dny': 'ज्ञ', 'ksh': 'क्ष',
    'k': 'क', 'g': 'ग', 'j': 'ज', 'T': 'ट', 'D': 'ड', 'N': 'ण', 't': 'त', 'd': 'द', 'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह', 'L': 'ळ'
};

const vowels = {
    'aa': 'ा', 'ai': 'ै', 'au': 'ौ', 'ee': 'ी', 'oo': 'ू',
    'a': '', 'i': 'ि', 'u': 'ु', 'e': 'े', 'o': 'ो'
};

const independentVowels = {
    'aa': 'आ', 'ai': 'ऐ', 'au': 'औ', 'ee': 'ई', 'oo': 'ऊ',
    'a': 'अ', 'i': 'इ', 'u': 'उ', 'e': 'ए', 'o': 'ओ'
};

export const transliterateWord = (word) => {
    if (!word) return "";
    let result = "";
    let i = 0;
    
    while (i < word.length) {
        let matched = false;
        
        // Try matching 3-char clusters (ksh, dny)
        const cluster3 = word.substring(i, i + 3).toLowerCase();
        if (consonants[cluster3]) {
            result += consonants[cluster3];
            i += 3;
            matched = true;
        }
        
        if (!matched) {
            // Try matching 2-char clusters
            const cluster2 = word.substring(i, i + 2).toLowerCase();
            if (consonants[cluster2]) {
                result += consonants[cluster2];
                i += 2;
                matched = true;
            } else if (vowels[cluster2] && i > 0) {
                result += vowels[cluster2];
                i += 2;
                matched = true;
            } else if (independentVowels[cluster2] && i === 0) {
                result += independentVowels[cluster2];
                i += 2;
                matched = true;
            }
        }
        
        if (!matched) {
            // Match single char
            const char = word[i].toLowerCase();
            if (consonants[char]) {
                result += consonants[char];
            } else if (vowels[char] && i > 0) {
                result += vowels[char];
            } else if (independentVowels[char] && i === 0) {
                result += independentVowels[char];
            } else {
                result += word[i]; // Non-mapping characters
            }
            i++;
        }
    }
    return result;
};

export const transliterateSentence = (sentence) => {
    return sentence.split(' ').map(transliterateWord).join(' ');
};
