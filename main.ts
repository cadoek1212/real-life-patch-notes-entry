// Real-Life Patch Notes: The Comedy Changelog — entry program.
//
// Writes one one-line patch note (max 160 chars) to /output/entry.txt.
// No network, no arguments, deterministic: the same input always
// produces the same output file.
//
// Selection mirrors the judge's own rule (RULES.txt): candidates are
// compared pairwise, criteria in priority order, and the first
// criterion where they differ decides — unless a later criterion
// differs by much more (a gap of 3+ points overrides an earlier one).
// Criteria, most important first:
//   1. one-line patch note / changelog for a real-life or human-biology
//      bug, reads as comedy
//   2. genuinely funny: lands on a first read, rests on a real joke
//   3. reads like a real release note: version number, terse
//      engineering register, fix stated as if shipped
//   4. names a specific, recognisable body / daily-life bug — the
//      reader winces and laughs at once
//   5. uses its 160 characters well: no padding, every word working
//
// Scores are 1–5 per criterion, assigned when the candidates were
// drafted and compared against each other in this session.

import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Criterion scores in priority order [c1, c2, c3, c4, c5].
  scores: [number, number, number, number, number];
};

// Weights follow the criterion order: the funniness criterion counts
// most, then register and specificity, then format, then economy.
const WEIGHTS: [number, number, number, number, number] = [2, 3, 2, 2, 1];

const CANDIDATES: Candidate[] = [
  {
    text: "v1.7.3: fixed a bug where the left knee predicted rain 24 hours before the forecast and refused to be wrong about it.",
    scores: [5, 2, 4, 3, 3],
  },
  {
    text: "v3.0.2: fixed a bug where the stomach growled loudly during silent meetings to announce its presence.",
    scores: [5, 4, 4, 4, 4],
  },
  {
    text: "v2.9.0: fixed a bug where yawning in a meeting triggered a chain reaction across all nearby humans.",
    scores: [5, 4, 4, 4, 4],
  },
  {
    text: "v1.4.7: fixed a bug where the brain replayed an embarrassing moment from 2009 at 3 a.m. instead of sleeping.",
    scores: [5, 5, 4, 5, 4],
  },
  {
    text: "v2.2.1: patched the bladder to stop sending low-battery warnings at 2% during long car rides.",
    scores: [5, 4, 5, 5, 4],
  },
  {
    text: "v3.1.0: fixed a bug where the nose sneezed once, paused for effect, then sneezed twice more.",
    scores: [5, 4, 4, 5, 5],
  },
  {
    text: "v1.9.4: fixed a bug where the foot fell asleep during a movie and woke up angry at its owner.",
    scores: [5, 4, 4, 4, 4],
  },
  {
    text: "v2.5.0: patched the hiccups module, which previously required exactly one scare and zero dignity to stop.",
    scores: [5, 4, 4, 4, 3],
  },
  {
    text: "v1.2.8: fixed a bug where the eyes watered at every wedding, funeral, and dog food commercial.",
    scores: [5, 4, 4, 4, 4],
  },
  {
    text: "v3.3.1: fixed a bug where the brain autocorrected 'good morning' to an awkward wave from across the street.",
    scores: [5, 3, 4, 3, 3],
  },
];

function weightedScore(c: Candidate): number {
  let total = 0;
  for (let i = 0; i < 5; i++) total += c.scores[i] * WEIGHTS[i];
  return total;
}

// Pairwise comparison, judge-style. Returns 1 if a wins, -1 if b wins,
// 0 if they are indistinguishable on every criterion.
function compare(a: Candidate, b: Candidate): number {
  let firstDiff: number | null = null;
  let firstDiffWinner: number | null = null;
  for (let i = 0; i < 5; i++) {
    const diff = a.scores[i] - b.scores[i];
    if (diff === 0) continue;
    if (firstDiff === null) {
      firstDiff = i;
      firstDiffWinner = diff > 0 ? 1 : -1;
      continue;
    }
    // A later criterion differing by much more (gap >= 3) overrides
    // the earlier decision.
    if (Math.abs(diff) >= 3 && Math.sign(diff) !== firstDiffWinner) {
      return diff > 0 ? 1 : -1;
    }
  }
  if (firstDiffWinner === null) return 0;
  return firstDiffWinner;
}

function pickWinner(candidates: Candidate[]): Candidate {
  const wins = new Array<number>(candidates.length).fill(0);
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const result = compare(candidates[i], candidates[j]);
      if (result > 0) wins[i]++;
      else if (result < 0) wins[j]++;
    }
  }
  let best = 0;
  for (let i = 1; i < candidates.length; i++) {
    if (wins[i] > wins[best]) {
      best = i;
      continue;
    }
    if (wins[i] !== wins[best]) continue;
    // Tie-breaks: higher weighted score, then shorter text, then
    // earliest candidate — fully deterministic.
    const scoreI = weightedScore(candidates[i]);
    const scoreBest = weightedScore(candidates[best]);
    if (scoreI > scoreBest) best = i;
    else if (scoreI === scoreBest && candidates[i].text.length < candidates[best].text.length) best = i;
  }
  return candidates[best];
}

const winner = pickWinner(CANDIDATES);
const chars = [...winner.text].length;
if (chars < 1 || chars > 160) {
  throw new Error(`entry is ${chars} characters, outside the 1-160 range`);
}
if (winner.text.trim().length === 0) {
  throw new Error("entry is only whitespace");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");
console.log(`entry (${chars} chars): ${winner.text}`);
