import { describe, it, expect } from "vitest";
import { computeKeywordMatch, tokenize } from "@/lib/analysis/job-match";

describe("tokenize", () => {
  it("lowercases and removes stop words", () => {
    expect(tokenize("The React and Node")).toEqual(["react", "node"]);
  });

  it("keeps tech tokens with symbols", () => {
    expect(tokenize("C++ and C#")).toContain("c++");
    expect(tokenize("C++ and C#")).toContain("c#");
  });
});

describe("computeKeywordMatch", () => {
  it("returns 100 when all job keywords are present", () => {
    const result = computeKeywordMatch(
      "Experienced React TypeScript developer",
      "React TypeScript",
    );
    expect(result.matchScore).toBe(100);
    expect(result.missingKeywords).toHaveLength(0);
  });

  it("identifies missing keywords", () => {
    const result = computeKeywordMatch("React developer", "React Kubernetes");
    expect(result.matchScore).toBe(50);
    expect(result.missingKeywords).toContain("kubernetes");
  });

  it("handles empty job description", () => {
    const result = computeKeywordMatch("anything", "");
    expect(result.matchScore).toBe(0);
  });
});
