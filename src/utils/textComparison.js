/**
 * "Hardcore" Text Comparison Utility for Stenography
 * Uses a diff-style algorithm to handle missing/extra words with resync.
 */
export const compareText = (original, user) => {
  const normalize = (str) => 
    str.toLowerCase()
       .replace(/[^\w\s]/g, '')
       .trim()
       .split(/\s+/)
       .filter(Boolean);
  
  const target = normalize(original);
  const input = normalize(user);
  
  // Matrix for LCS (Longest Common Subsequence) / Diff
  const n = target.length;
  const m = input.length;
  
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (target[i - 1] === input[j - 1]) {
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
    if (i > 0 && j > 0 && target[i - 1] === input[j - 1]) {
      analysis.unshift({ word: target[i - 1], status: 'correct' });
      correct++;
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Insertion (Extra word typed by user)
      analysis.unshift({ word: input[j - 1], status: 'mistake', type: 'extra', info: 'Extra word' });
      mistakes++;
      j--;
    } else {
      // Deletion (Missing word from target)
      analysis.unshift({ word: target[i - 1], status: 'mistake', type: 'missing', info: 'Missing word' });
      mistakes++;
      i--;
    }
  }

  const accuracy = target.length > 0 
    ? Math.round((correct / target.length) * 100) 
    : 0;
  
  return {
    accuracy,
    mistakes,
    totalWords: target.length,
    userWords: input.length,
    analysis
  };
};
