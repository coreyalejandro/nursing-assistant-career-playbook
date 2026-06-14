/**
 * server/defense/inputFilter.ts
 * Defense-in-depth prompt-injection filter.
 *
 * Three layers, evaluated in order:
 *   1. STRUCTURAL  — injection *syntax* (role tags, template/SSTI, encode/repeat
 *      directives). Always blocks.
 *   2. HIGH_SIGNAL — tokens that are never legitimate from a CNA user
 *      ("DAN mode", "ignore previous instructions", "rot13", …). Always blocks.
 *   3. CONTEXT_GATED — phrases that CAN be legitimate workplace questions
 *      ("disregard safety settings", "system instructions"). Blocked ONLY when
 *      no nursing/workplace context is present, so real CNA questions pass.
 *
 * Validated by server/tests/securityProbe.ts against 15 adversarial vectors
 * (must block) and 8 conversational CNA queries (must allow).
 */
export type FilterAction = 'ALLOW' | 'BLOCK' | 'SANITIZE';

export interface FilterResult {
  safe: boolean;
  confidence: number;
  action: FilterAction;
  reason?: string;
  matchedPatterns: string[];
}

export class InputFilter {
  /** Layer 1 — injection syntax. Always blocks. */
  private readonly STRUCTURAL_PATTERNS: RegExp[] = [
    /\[\/?\s*system\s*\]/i,                       // [SYSTEM] / [/SYSTEM]
    /<\/?\s*system\s*>/i,                         // <system> / </system>
    /```+\s*system/i,                             // ```system fenced block
    /"role"\s*:\s*"system"/i,                     // JSON system role injection
    /^\s*---\s*system\b/im,                       // --- system  front-matter
    /\{\{[\s\S]*?\}\}/,                            // {{ template }}
    /<%[\s\S]*?%>/,                                // <% ssti %>
    /\$\{[\s\S]*?\}/,                              // ${ interpolation }
    /\b(base64|rot13|hex|binary)\s+encode\b/i,    // "base64 encode ..."
    /\bencode\b[\s\S]{0,40}\b(base64|rot13|hex)\b/i,
    /\brepeat\s+after\s+me\s*:/i,
    /\boutput\s+(exactly|verbatim|the\s+following)\s*:/i,
    /\bcopy\s+(and\s+)?paste\s+your\b/i,
    /\bprint\s+(your\s+)?(system\s+)?(prompt|instructions)\s+(verbatim|exactly)\b/i,
  ];

  /** Layer 2 — high-signal attacker tokens. Always blocks. */
  private readonly HIGH_SIGNAL: RegExp[] = [
    /\bignore\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+instructions?\b/i,
    /\bdisregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|context)\b/i,
    /\bdan\s+mode\b/i,
    /\bdeveloper\s+mode\b/i,
    /\bjailbreak\b/i,
    /\bunrestricted\s+(terminal|mode|assistant|ai)\b/i,
    /\broot\s+access\s+granted\b/i,
    /\bsystem\s+override\b/i,
    /\brot13\b/i,
    /\byou\s+are\s+now\s+(in|a|an)\b.*\b(mode|terminal|dan)\b/i,
  ];

  /** Layer 3 — context-gated. Block only when no workplace context is present. */
  private readonly CONTEXT_GATED: RegExp[] = [
    /\bsystem\s+prompt\b/i,
    /\bsystem\s+instructions?\b/i,
    /\b(your|the)\s+(hidden|secret|confidential|internal)\s+(rules|instructions|prompt|guidelines)\b/i,
    /\b(leak|reveal|show|expose|dump)\s+(your|the)\s+(prompt|instructions|rules|configuration)\b/i,
    /\b(disregard|ignore|override|bypass|turn\s+off)\s+(your\s+|the\s+|all\s+)?(safety\s+settings|safety\s+rules|safety\s+filters|guardrails|restrictions|safeguards)\b/i,
    /\btranslate\s+your\s+instructions?\b/i,
    /\bencode\s+your\s+(system\s+)?(prompt|instructions)\b/i,
  ];

  /** Nursing / workplace context that legitimizes otherwise-suspicious phrasing. */
  private readonly WORKPLACE_CONTEXT: string[] = [
    'supervisor', 'charge nurse', 'nurse', 'patient', 'resident', 'facility', 'hospital',
    'shift', 'medication', 'care plan', 'doctor', 'physician', 'clinical', 'cna',
    'certified nursing', 'registry', 'renewal', 'certification', 'license', 'mobility',
    'vitals', 'unit', 'ward', 'emergency', 'safety rules', 'patient safety',
  ];

  private hasWorkplaceContext(lower: string): boolean {
    return this.WORKPLACE_CONTEXT.some((c) => lower.includes(c));
  }

  analyze(input: string): FilterResult {
    const text = (input ?? '').toString();
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const matchedPatterns: string[] = [];

    if (!trimmed) {
      return { safe: true, confidence: 0, action: 'ALLOW', matchedPatterns: [] };
    }

    for (const re of this.STRUCTURAL_PATTERNS) {
      if (re.test(trimmed)) {
        matchedPatterns.push(`STRUCTURAL:${re.source}`);
        return { safe: false, confidence: 0.97, action: 'BLOCK', reason: 'Injection syntax detected', matchedPatterns };
      }
    }

    for (const re of this.HIGH_SIGNAL) {
      if (re.test(trimmed)) {
        matchedPatterns.push(`HIGH_SIGNAL:${re.source}`);
        return { safe: false, confidence: 0.95, action: 'BLOCK', reason: 'Known attack pattern detected', matchedPatterns };
      }
    }

    const gated = this.CONTEXT_GATED.filter((re) => re.test(trimmed));
    if (gated.length > 0) {
      if (this.hasWorkplaceContext(lower)) {
        // Legitimate workplace question that happens to mention sensitive terms.
        return { safe: true, confidence: 0.3, action: 'ALLOW', reason: 'Sensitive terms within workplace context', matchedPatterns: [] };
      }
      matchedPatterns.push(...gated.map((re) => `CONTEXT_GATED:${re.source}`));
      return { safe: false, confidence: 0.8, action: 'BLOCK', reason: 'Prompt-manipulation attempt without workplace context', matchedPatterns };
    }

    if (trimmed.length > 3000) {
      return { safe: false, confidence: 0.6, action: 'SANITIZE', reason: 'Input length anomaly', matchedPatterns: ['LENGTH'] };
    }

    return { safe: true, confidence: 0, action: 'ALLOW', matchedPatterns: [] };
  }
}
