// Revenue Leakage — scoring logic, reverse-engineered verbatim from the live
// compiled bundle at https://upadhyaymehul9-prog.github.io/revenue-leakage-review/
// Pairs with revenueLeakageData.ts (the 14-section, 118-question bank).
//
// TWO OUTPUTS:
//   1. Readiness score (0–100) + band  — how well controls are documented.
//   2. Estimated annual leakage range (₹ lossMin..lossMax) — money at risk.
// A SEPARATE "measured" track (KPI inputs, `rf` in the bundle) is NOT included
// here — see notes at the bottom.

import type { LeakageSection, LeakageQuestion, Severity } from '../data/revenueLeakageData';

// ─── Constants (exact values from the bundle) ──────────────────────────────
export const SEVERITY_WEIGHT: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }; // ka

export type AnswerKey = 'evidence' | 'nodoc' | 'partial' | 'no' | 'na';
// score    → readiness credit (1..0)
// lossFactor → fraction of the estimated leakage that is "live" for this answer
export const ANSWER_OPTIONS: Record<Exclude<AnswerKey, 'na'>, { label: string; score: number; lossFactor: number }> = {
  evidence: { label: 'Yes — with evidence',  score: 1,   lossFactor: 0   },
  nodoc:    { label: 'Yes — not documented', score: 0.6, lossFactor: 0.4 },
  partial:  { label: 'Partial',              score: 0.3, lossFactor: 0.7 },
  no:       { label: 'No',                   score: 0,   lossFactor: 1   },
};
export const SKIP: AnswerKey = 'na'; // "not applicable" — excluded from scoring AND loss (qt)

// UI helpers (order + display copy) — verbatim wording from the original tool.
export const ANSWER_ORDER: AnswerKey[] = ['evidence', 'nodoc', 'partial', 'no', 'na'];
export const ANSWER_UI: Record<AnswerKey, { label: string; hint: string }> = {
  evidence: { label: '✅ Yes — with evidence', hint: 'We can show the report / register / log' },
  nodoc: { label: '🟡 Yes — not documented', hint: 'It happens, but informally / verbally' },
  partial: { label: '⚠️ Partial', hint: 'Done sometimes, or only in some areas' },
  no: { label: '❌ No', hint: 'Not done at all' },
  na: { label: 'N/A', hint: 'Not applicable to this hospital' },
};
export const EFFORT_LABEL: Record<string, string> = { q: 'Quick win', p: 'Project', i: 'Investment' };

const STREAM_FRACTION = { pharmacy: 0.2, ot: 0.25, lab: 0.12, bed: 0.15, inventory: 0.1, opd: 0.15 } as const; // Mr
const REF_REVENUE = 15_000_000;      // ru — assumed annual revenue for a 100-bed hospital (₹1.5 Cr)
const DEFAULT_TPA_PCT = 35;          // nu
const REVENUE_CAP_FRACTION = 0.2;    // wa — total leakage capped at 20% of annual revenue
const SYSTEMIC_MULT_CAP = 0.25;      // Zh — systemic multiplier ranges 1.00–1.25

// Overlapping control pairs — used to (a) de-duplicate overlapping leakage and
// (b) raise a contradiction flag when the two answers disagree strongly. (au)
export const OVERLAP_PAIRS: { a: string; b: string; label: string }[] = [
  { a: 'b6',  b: 'in8', label: 'High-value implant / consumable traceability' },
  { a: 'b10', b: 'm5',  label: 'Leadership leakage reporting' },
  { a: 'bd4', b: 'm7',  label: 'Bed occupancy vs. billing reconciliation' },
  { a: 'p1',  b: 'p5',  label: 'Pharmacy issue-vs-billing controls' },
  { a: 'op1', b: 'op2', label: 'OPD consultation capture controls' },
  { a: 'b12', b: 'r8',  label: 'Charge lag vs. DNFB discipline' },
  { a: 'b8',  b: 'e1',  label: 'ER charge capture controls' },
];

// ─── Inputs ────────────────────────────────────────────────────────────────
export interface HospitalInputs {
  revenueLakh?: number;  // annual revenue in ₹ lakh (preferred size input)
  beds?: number;         // used to estimate revenue when revenueLakh is absent
  pharmacyLakh?: number; // pharmacy revenue in ₹ lakh (else derived as 20% of total)
  tpaPct?: number;       // TPA/insurance share of revenue (else default 35%)
}
export type Answers = Record<string, AnswerKey>;

export interface StreamBases {
  total: number; pharmacy: number; tpa: number; ot: number; lab: number;
  bed: number; inventory: number; opd: number; [k: string]: number;
}

// Derive each revenue stream's rupee base from the hospital inputs.
export function computeStreamBases(i: HospitalInputs) {
  const rev = i.revenueLakh ?? NaN;
  const beds = i.beds ?? NaN;
  let total: number, sizeAssumed = false;
  if (rev > 0) total = rev * 1e5;                                        // ₹ lakh → ₹
  else if (beds > 0) total = Math.min(10, Math.max(0.1, beds / 100)) * REF_REVENUE;
  else { total = REF_REVENUE; sizeAssumed = true; }

  const ph = (i.pharmacyLakh ?? NaN) * 1e5;
  const tpaGiven = i.tpaPct != null && i.tpaPct >= 0 && i.tpaPct <= 100;
  const tpaPct = tpaGiven ? (i.tpaPct as number) : DEFAULT_TPA_PCT;

  return {
    bases: {
      total,
      pharmacy: ph > 0 ? ph : total * STREAM_FRACTION.pharmacy,
      tpa: total * (tpaPct / 100),
      ot: total * STREAM_FRACTION.ot,
      lab: total * STREAM_FRACTION.lab,
      bed: total * STREAM_FRACTION.bed,
      inventory: total * STREAM_FRACTION.inventory,
      opd: total * STREAM_FRACTION.opd,
    } as StreamBases,
    sizeAssumed,
    pharmacyDerived: !(ph > 0),
    tpaDerived: !tpaGiven,
  };
}

// Raw per-question leakage range, before the answer's lossFactor is applied.
// Systemic questions contribute 0 direct loss — they feed the systemic multiplier instead.
function rawLoss(q: LeakageQuestion, bases: StreamBases) {
  if (q.systemic) return { min: 0, max: 0 };
  const base = q.stream ? bases[q.stream] ?? 0 : 0;
  return { min: base * (q.leakagePctMin ?? 0), max: base * (q.leakagePctMax ?? 0) };
}

export type ScoreResult = ReturnType<typeof computeScore>;

export function computeScore(sections: LeakageSection[], answers: Answers, inputs: HospitalInputs) {
  const { bases, sizeAssumed } = computeStreamBases(inputs);
  const perQuestionLoss: Record<string, { min: number; max: number }> = {};
  let systemicAccum = 0;

  const sectionScores = sections.map((sec) => {
    let wScore = 0, wSum = 0, lossMin = 0, lossMax = 0;
    const gaps: Array<LeakageQuestion & { answer: AnswerKey; lMin: number; lMax: number }> = [];
    for (const q of sec.questions) {
      const key = answers[q.id];
      if (!key || key === SKIP) continue;                 // unanswered / N/A
      const opt = ANSWER_OPTIONS[key as Exclude<AnswerKey, 'na'>];
      if (!opt) continue;
      const w = SEVERITY_WEIGHT[q.severity] ?? 1;
      wSum += w;
      wScore += opt.score * w;
      if (opt.lossFactor > 0) {
        const raw = rawLoss(q, bases);
        const lMin = raw.min * opt.lossFactor;
        const lMax = raw.max * opt.lossFactor;
        lossMin += lMin; lossMax += lMax;
        if (lMax > 0) perQuestionLoss[q.id] = { min: lMin, max: lMax };
        if (q.systemic) systemicAccum += (q.severity === 'CRITICAL' ? 0.05 : 0.03) * opt.lossFactor;
        gaps.push({ ...q, answer: key, lMin, lMax });
      }
    }
    return {
      id: sec.id,
      readinessPct: wSum > 0 ? Math.round((wScore / wSum) * 100) : 0,
      lossMin, lossMax, gaps,
      answered: sec.questions.filter((q) => answers[q.id]).length,
      scorable: sec.questions.filter((q) => answers[q.id] && answers[q.id] !== SKIP).length,
      total: sec.questions.length,
    };
  });

  // De-duplicate overlapping leakage: for each pair where BOTH sides show loss,
  // subtract the smaller of the two (they describe the same rupees).
  let dupMin = 0, dupMax = 0;
  for (const p of OVERLAP_PAIRS) {
    const a = perQuestionLoss[p.a], b = perQuestionLoss[p.b];
    if (a && b) { dupMin += Math.min(a.min, b.min); dupMax += Math.min(a.max, b.max); }
  }

  // Contradiction flags: same pairs, raised when the two readiness scores differ by ≥ 0.6.
  const flags = OVERLAP_PAIRS.filter((p) => {
    const A = answers[p.a], B = answers[p.b];
    if (!A || !B || A === SKIP || B === SKIP) return false;
    const sa = ANSWER_OPTIONS[A as Exclude<AnswerKey, 'na'>]?.score ?? 0;
    const sb = ANSWER_OPTIONS[B as Exclude<AnswerKey, 'na'>]?.score ?? 0;
    return Math.abs(sa - sb) >= 0.6;
  }).map((p) => ({ ...p, ansA: answers[p.a], ansB: answers[p.b] }));

  const sysMult = 1 + Math.min(SYSTEMIC_MULT_CAP, systemicAccum);

  const sumMin = Math.max(0, sectionScores.reduce((s, x) => s + x.lossMin, 0) - dupMin);
  const sumMax = Math.max(0, sectionScores.reduce((s, x) => s + x.lossMax, 0) - dupMax);
  const withSysMin = sumMin * sysMult;
  const withSysMax = sumMax * sysMult;
  const cap = bases.total * REVENUE_CAP_FRACTION;
  const scale = withSysMax > cap ? cap / withSysMax : 1;   // scale both ends so max never exceeds the cap
  const lossMin = Math.round(withSysMin * scale);
  const lossMax = Math.round(withSysMax * scale);

  // Overall readiness across ALL answered questions (same weighted formula).
  let gScore = 0, gSum = 0;
  for (const sec of sections) for (const q of sec.questions) {
    const key = answers[q.id];
    if (!key || key === SKIP) continue;
    const opt = ANSWER_OPTIONS[key as Exclude<AnswerKey, 'na'>];
    if (!opt) continue;
    const w = SEVERITY_WEIGHT[q.severity] ?? 1;
    gSum += w; gScore += opt.score * w;
  }
  const readinessPct = gSum > 0 ? Math.round((gScore / gSum) * 100) : 0;

  return {
    readinessPct,
    band: readinessBand(readinessPct),
    lossMin, lossMax,
    capped: scale < 1,
    sysMult, dupMin, dupMax,
    flags,
    sectionScores,
    bases,
    sizeAssumed,
  };
}

// Readiness bands (ou): thresholds on the 0–100 readiness score.
export function readinessBand(v: number) {
  if (v >= 90) return { lvl: 4, name: 'Optimized' };
  if (v >= 70) return { lvl: 3, name: 'Measured' };
  if (v >= 50) return { lvl: 2, name: 'Enforced' };
  if (v >= 25) return { lvl: 1, name: 'Documented' };
  return { lvl: 0, name: 'Ad-hoc' };
}

// Indian-currency formatter (te). NOTE: the < ₹1L branch is inferred (the bundle
// slice was truncated); Cr/L thresholds are verbatim.
export function formatINR(v: number) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}k`;
  return `₹${Math.round(v)}`;
}

// ─── NOT extracted here ──────────────────────────────────────────────────────
// The bundle has a SECOND scoring track: a KPI set (`rf`, ~9 KPIs) where the user
// enters real numbers (e.g. denial %, DNFB days). Each KPI has status(value) and
// loss(value, streamBases) functions producing a "measured" leakage figure (Kt)
// shown alongside this questionnaire "estimate". Say the word and I'll extract the
// KPI definitions the same way I did the question bank.
