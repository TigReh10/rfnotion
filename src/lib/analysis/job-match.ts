/**
 * Deterministic, dependency-free keyword overlap scorer.
 * Used as a fast pre-filter before invoking the AI job-match engine,
 * and is fully unit-testable without external services.
 */

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "a", "an", "to", "of", "in",
  "on", "at", "is", "be", "as", "or", "we", "this", "that", "from", "by", "it", "have", "has",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export function keywordSet(text: string): Set<string> {
  return new Set(tokenize(text));
}

export interface KeywordMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

/**
 * Computes a 0-100 match score based on how many job-description keywords
 * appear in the resume.
 */
export function computeKeywordMatch(resumeText: string, jobText: string): KeywordMatchResult {
  const resume = keywordSet(resumeText);
  const job = keywordSet(jobText);

  if (job.size === 0) {
    return { matchScore: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of job) {
    if (resume.has(kw)) matched.push(kw);
    else missing.push(kw);
  }

  const matchScore = Math.round((matched.length / job.size) * 100);
  return { matchScore, matchedKeywords: matched, missingKeywords: missing };
}
