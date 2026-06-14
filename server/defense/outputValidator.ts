/**
 * server/defense/outputValidator.ts
 * Last line of defense: scans model output for leaked system-instruction
 * fragments, injection echoes, or PII before it reaches the user.
 */
export interface ValidationResult {
  clean: boolean;
  violations: string[];
  sanitizedOutput: string;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class OutputValidator {
  private readonly SYSTEM_FRAGMENTS = [
    'CNA_COACH_SYSTEM_INSTRUCTION',
    'You are a Certified Nursing Assistant career coach',
    'LIVE_VOICE_SYSTEM_INSTRUCTION',
    'systemInstruction',
    'PROMPT SECURITY',
    'these instructions',
  ];

  private readonly FORBIDDEN_PATTERNS: RegExp[] = [
    /\[SYSTEM\][\s\S]*?\[\/SYSTEM\]/i,
    /```+\s*system[\s\S]*?```/i,
    /<system>[\s\S]*?<\/system>/i,
    /"role"\s*:\s*"system"[\s\S]*?\}/i,
    /---\s*system[\s\S]*?\n---/i,
  ];

  private readonly PII_PATTERNS: { pattern: RegExp; type: string }[] = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
    { pattern: /\b(?:\d[ -]?){13,16}\b/g, type: 'CREDIT_CARD' },
    { pattern: /\bMR(?:N|#)?\s*[:#-]?\s*\d{4,10}\b/gi, type: 'MRN' },
  ];

  private readonly CRISIS_FALLBACK =
    "I'm sorry, I can't help with that. If you're having a tough time, you can call or text 988 anytime for support.";

  validate(output: string, _requestId: string): ValidationResult {
    const violations: string[] = [];
    let sanitizedOutput = output ?? '';
    let severity: ValidationResult['severity'] = 'NONE';

    const lower = sanitizedOutput.toLowerCase();
    for (const fragment of this.SYSTEM_FRAGMENTS) {
      if (lower.includes(fragment.toLowerCase())) {
        violations.push(`SYSTEM_FRAGMENT:"${fragment}"`);
        severity = 'CRITICAL';
      }
    }

    for (const re of this.FORBIDDEN_PATTERNS) {
      if (re.test(sanitizedOutput)) {
        violations.push(`FORBIDDEN_PATTERN:${re.source}`);
        severity = 'CRITICAL';
      }
    }

    for (const { pattern, type } of this.PII_PATTERNS) {
      if (pattern.test(sanitizedOutput)) {
        violations.push(`PII_LEAK:${type}`);
        sanitizedOutput = sanitizedOutput.replace(pattern, '[REDACTED]');
        if (severity !== 'CRITICAL') severity = 'HIGH';
      }
      pattern.lastIndex = 0;
    }

    if (severity === 'CRITICAL') {
      sanitizedOutput = this.CRISIS_FALLBACK;
    }

    return { clean: violations.length === 0, violations, sanitizedOutput, severity };
  }
}
