/**
 * server/wage/negotiation.ts
 * Wage Negotiation Engine — deterministic core.
 *
 * computeTargetBand(): turns market stats + the user's experience into a
 * defensible target wage range (no LLM, fully testable).
 * buildPitch(): produces a personalized, grounded negotiation script and
 * talking points from the band + real employer matches (deterministic, so the
 * numbers in the pitch always match the computed band).
 *
 * Framed as guidance, never a guarantee.
 */
export interface WageStats {
  median: number;
  p25: number;
  p75: number;
}

export interface BandInput extends WageStats {
  yearsExperience: number;
  currentWage?: number;
}

export interface TargetBand {
  targetLow: number;
  targetHigh: number;
  stretch: number;
  median: number;
  rationale: string;
}

export interface NegotiationProfile {
  role?: string;
  location?: string;
  yearsExperience?: number;
  strengths?: string[];
}

export interface Employer {
  name: string;
  wageRange?: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => `$${n.toFixed(2)}`;

export function computeTargetBand(input: BandInput): TargetBand {
  const years = clamp(Number(input.yearsExperience) || 0, 0, 40);
  const median = round2(Math.max(0, Number(input.median) || 0));
  const p75 = round2(Math.max(median, Number(input.p75) || median));

  // Experience premium: ~1.5%/yr, capped at +25% (reached around 17 years).
  const expBoost = Math.min(0.25, years * 0.015);

  let targetLow = Math.max(median * (1 + expBoost * 0.6), p75 * 0.97);
  let targetHigh = Math.max(p75 * (1 + expBoost * 0.5), median * (1 + expBoost));

  // Always aim above the user's current wage if provided.
  if (typeof input.currentWage === 'number' && input.currentWage > 0) {
    targetLow = Math.max(targetLow, input.currentWage * 1.05);
    targetHigh = Math.max(targetHigh, input.currentWage * 1.12);
  }
  if (targetHigh < targetLow) targetHigh = targetLow * 1.08;

  const stretch = targetHigh * 1.08;

  const rationale =
    `Anchored to a local median of ${money(median)}/hr (BLS OEWS, SOC 31-1131) and ` +
    `${years} year${years === 1 ? '' : 's'} of experience, your defensible target is ` +
    `${money(round2(targetLow))}–${money(round2(targetHigh))}/hr, with a stretch ask near ${money(round2(stretch))}/hr.`;

  return {
    targetLow: round2(targetLow),
    targetHigh: round2(targetHigh),
    stretch: round2(stretch),
    median,
    rationale,
  };
}

export function buildPitch(
  profile: NegotiationProfile,
  band: TargetBand,
  employers: Employer[] = []
): { pitch: string; talkingPoints: string[] } {
  const years = clamp(Number(profile.yearsExperience) || 0, 0, 40);
  const loc = profile.location ? ` in ${profile.location}` : '';
  const role = profile.role || 'Certified Nursing Assistant';
  const strengths = (profile.strengths || []).filter(Boolean);
  const topStrength = strengths[0] || 'measurable results in patient safety and documentation';
  const strengthClause = strengths.length
    ? ` — including ${strengths.slice(0, 3).join(', ')}`
    : '';

  const pitch =
    `Over my ${years || 'several'} year${years === 1 ? '' : 's'} as a ${role}${loc}, ` +
    `I've consistently delivered measurable outcomes${strengthClause}. ` +
    `Based on the local market — a median around ${money(band.median)}/hr — and my experience, ` +
    `I'm targeting ${money(band.targetLow)}–${money(band.targetHigh)}/hr. ` +
    `Given ${topStrength}, I believe that range reflects the value I bring to your team.`;

  const talkingPoints: string[] = [
    `State your target as a range (${money(band.targetLow)}–${money(band.targetHigh)}/hr), not one number — it anchors high while signaling flexibility.`,
    `Lead with one measurable outcome before naming a number (e.g., a fall-rate reduction, EHR/charting accuracy, or de-escalation result).`,
    `If they counter low, ask: "What would it take to reach ${money(band.targetHigh)}/hr within 6–12 months?" to keep the higher number alive.`,
    `Use the stretch figure (${money(band.stretch)}/hr) only if you bring a specialty credential (e.g., CMA, dementia care, CDC STEADI).`,
  ];

  if (employers.length) {
    const names = employers.slice(0, 3).map((e) => e.name).filter(Boolean).join(', ');
    if (names) talkingPoints.push(`Employers currently posting in or near your range: ${names}.`);
  }

  return { pitch, talkingPoints };
}
