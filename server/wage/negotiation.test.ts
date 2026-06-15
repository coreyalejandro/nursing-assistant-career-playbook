import { computeTargetBand, buildPitch } from './negotiation';

describe('computeTargetBand', () => {
  it('produces a band at or above the market for an experienced worker', () => {
    const b = computeTargetBand({ median: 21.5, p25: 18.5, p75: 24.5, yearsExperience: 13 });
    expect(b.targetLow).toBeGreaterThanOrEqual(b.median);
    expect(b.targetHigh).toBeGreaterThanOrEqual(b.targetLow);
    expect(b.stretch).toBeGreaterThan(b.targetHigh);
    expect(b.rationale).toContain('13 years');
  });

  it('always aims above the current wage when provided', () => {
    const b = computeTargetBand({ median: 20, p25: 17, p75: 22, yearsExperience: 2, currentWage: 26 });
    expect(b.targetLow).toBeGreaterThan(26);
    expect(b.targetHigh).toBeGreaterThan(b.targetLow);
  });

  it('caps the experience premium for very long careers', () => {
    const young = computeTargetBand({ median: 20, p25: 17, p75: 22, yearsExperience: 1 });
    const veteran = computeTargetBand({ median: 20, p25: 17, p75: 22, yearsExperience: 40 });
    expect(veteran.targetHigh).toBeGreaterThan(young.targetHigh);
    // premium capped at 25% over median → high stays within a sane bound
    expect(veteran.targetHigh).toBeLessThan(20 * 1.4);
  });

  it('handles missing/zero stats without NaN', () => {
    const b = computeTargetBand({ median: 0, p25: 0, p75: 0, yearsExperience: 0 });
    expect(Number.isNaN(b.targetLow)).toBe(false);
    expect(Number.isNaN(b.targetHigh)).toBe(false);
  });
});

describe('buildPitch', () => {
  const band = computeTargetBand({ median: 21.5, p25: 18.5, p75: 24.5, yearsExperience: 13 });

  it('includes the band numbers and a singular/plural correct year phrase', () => {
    const { pitch, talkingPoints } = buildPitch({ role: 'CNA', location: 'Atlanta, GA', yearsExperience: 13 }, band);
    expect(pitch).toContain('13 years');
    expect(pitch).toContain('Atlanta, GA');
    expect(talkingPoints.length).toBeGreaterThanOrEqual(4);
    expect(talkingPoints[0]).toContain('$');
  });

  it('weaves in provided strengths', () => {
    const { pitch } = buildPitch({ yearsExperience: 5, strengths: ['15% fall reduction', 'EHR accuracy'] }, band);
    expect(pitch).toContain('15% fall reduction');
  });

  it('adds an employer talking point when employers are present', () => {
    const { talkingPoints } = buildPitch({ yearsExperience: 5 }, band, [{ name: 'Piedmont Atlanta' }]);
    expect(talkingPoints.some((t) => t.includes('Piedmont Atlanta'))).toBe(true);
  });

  it('uses singular year wording for one year', () => {
    const { pitch } = buildPitch({ yearsExperience: 1 }, band);
    expect(pitch).toContain('1 year ');
  });
});
