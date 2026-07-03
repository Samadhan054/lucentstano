/**
 * "Hardcore" Text Comparison Utility for Stenography
 * Uses a diff-style algorithm to handle missing/extra words with resync.
 */
export const compareText = (original, user) => {
  const getWords = (str) => 
    str.replace(/[^\w\s]/g, '')
       .trim()
       .split(/\s+/)
       .filter(Boolean);
  
  const targetOrig = getWords(original);
  const inputOrig = getWords(user);
  
  const targetLower = targetOrig.map(w => w.toLowerCase());
  const inputLower = inputOrig.map(w => w.toLowerCase());
  
  // Matrix for LCS (Longest Common Subsequence) / Diff
  const n = targetLower.length;
  const m = inputLower.length;
  
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (targetLower[i - 1] === inputLower[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find differences
  let i = n, j = m;
  const analysis = [];
  let mistakes = 0;
  let correct = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && targetLower[i - 1] === inputLower[j - 1]) {
      // Check original casing
      if (targetOrig[i - 1] === inputOrig[j - 1]) {
        analysis.unshift({ word: targetOrig[i - 1], status: 'correct' });
        correct++;
      } else {
        // Casing mismatch: count as a mistake
        analysis.unshift({ 
          word: inputOrig[j - 1], 
          status: 'mistake', 
          type: 'case_mismatch', 
          info: `Capitalization mistake (Expected: "${targetOrig[i - 1]}")` 
        });
        mistakes++;
      }
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Insertion (Extra word typed by user)
      analysis.unshift({ word: inputOrig[j - 1], status: 'mistake', type: 'extra', info: 'Extra word' });
      mistakes++;
      j--;
    } else {
      // Deletion (Missing word from target)
      analysis.unshift({ word: targetOrig[i - 1], status: 'mistake', type: 'missing', info: 'Missing word' });
      mistakes++;
      i--;
    }
  }

  const accuracy = targetOrig.length > 0 
    ? Math.round((correct / targetOrig.length) * 100) 
    : 0;
  
  return {
    accuracy,
    mistakes,
    totalWords: targetOrig.length,
    userWords: inputOrig.length,
    analysis
  };
};
