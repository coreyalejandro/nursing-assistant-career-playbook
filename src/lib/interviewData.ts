export interface InterviewQuestion {
  id: string;
  topic: string;
  question: string;
  rubricHint: string;
}

export interface FeedbackResult {
  hasSTAR: boolean;
  hasMetrics: boolean;
  hasSafetyLanguage: boolean;
  score: number; // 0-100
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q-1",
    topic: "Resident Aggression & Redirection",
    question: "Tell me about a time you de-escalated an agitated or confused resident who was refusing crucial hygiene care.",
    rubricHint: "Looking for validation therapy, maintaining dignity, avoidance of physical control, and alert safety protocols."
  },
  {
    id: "q-2",
    topic: "Fall Intervention",
    question: "How have you handled discovering a resident on the floor? Walk me through your clinical protocol and documentation guidelines.",
    rubricHint: "Looking for neck-stabilization, call for assist, vitals recording, reporting to charge nurse, and incident report filing."
  },
  {
    id: "q-3",
    topic: "Understaffed Shift Prioritization",
    question: "Describe a situation where your shift was severely understaffed. How did you organize your rounds to ensure clinical safety?",
    rubricHint: "Looking for call-light prioritization, sensory hazard sweeps, team-sharing lift work, and nursing oversight communications."
  },
  {
    id: "q-4",
    topic: "Infection Control Challenge",
    question: "Share an example where you corrected an infection control mistake by a peer or handled a room with highly infectious contact precautions.",
    rubricHint: "Looking for gentle peer redirection, correct order of PPE donning/doffing, and strict sanitizing intervals."
  },
  {
    id: "q-5",
    topic: "Reporting Clinical Decline",
    question: "Describe a moment when you noticed a minor physical or behavioral change in a resident. What was the change, and how did you act on it?",
    rubricHint: "Looking for objective documentation, precise timeline logs, immediate charge-nurse alerting, and vitals updates."
  }
];

export function analyzeResponse(response: string): FeedbackResult {
  const text = response.trim();
  
  if (text.length < 15) {
    return {
      hasSTAR: false,
      hasMetrics: false,
      hasSafetyLanguage: false,
      score: 10,
      strengths: ["Submitted a basic attempt."],
      gaps: ["The response is far too brief to evaluate properly."],
      recommendations: ["Expand your answer with a detailed description of the situation, the action you took, and the eventual outcome."]
    };
  }

  // Check for STAR method indicator keywords
  const starKeywords = [
    /\b(situation|task|action|result)\b/i,
    /\b(when i was|my duty was|i decided to|as a result)\b/i,
    /\b(problem|solved|led to|consequently)\b/i
  ];
  const hasSTAR = starKeywords.some(pattern => pattern.test(text)) || text.length > 250;

  // Check for quantified metrics (numbers like 15%, 5 patients, weekly, 3 times)
  const metricKeywords = [
    /\d+/,
    /\b(percent|%|hours|patients|shifts|residents|times|weekly|daily)\b/i
  ];
  const hasMetrics = metricKeywords.some(pattern => pattern.test(text));

  // Check for safety and clinical validation vocabulary
  const safetyKeywords = [
    /\b(safety|protocol|call light|bed alarm|hoyer|lift|vitals|nurse|report|infection|sterile|sanitizer|wash|glove|mask|gait belt|transfer)\b/i,
    /\b(validation|calm|redirect|de-escalat|comfort|dignity|privacy)\b/i
  ];
  const hasSafetyLanguage = safetyKeywords.some(pattern => pattern.test(text));

  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];
  let score = 30;

  if (hasSTAR) {
    score += 25;
    strengths.push("Excellent structural narrative progression. You effectively describe a concrete incident from initiation to clinical resolution.");
  } else {
    gaps.push("Narrative structure is slightly flat. It is difficult to map high-level actions to precise starting triggers.");
    recommendations.push("Utilize the STAR framework explicitly: first name the situation, list your exact clinical task, detail the hands-on actions you took, and close with the final safe outcome.");
  }

  if (hasMetrics) {
    score += 25;
    strengths.push("Quantified outcome tracking is present. Grounding your record in actual numbers (residents, percentages, or frequencies) establishes strong professional credibility.");
  } else {
    gaps.push("Lacks numeric validation. The response mentions results in a purely qualitative form.");
    recommendations.push("Inject raw numeric data! For example, mention exactly how many residents you supported (e.g., 'coordinated bounds for 15 residents') or the outcomes achieved (e.g., 'resulting in 100% compliant shift summaries').");
  }

  if (hasSafetyLanguage) {
    score += 20;
    strengths.push("Rich in certified safety vocabulary. Direct mention of transfer sensors, nurse alerts, decontamination protocols, or patient redirection proves high clinical competence.");
  } else {
    gaps.push("CNA technical vocabulary density is slightly low.");
    recommendations.push("Incorporate direct board terminologies such as 'PointClickCare charting', 'charge nurse handover', 'gait belt alignment', or 'infection control guidelines'.");
  }

  // Refine recommendations if outstanding
  if (score === 100) {
    strengths.push("Atlanta Board Ready score! Your statement is perfectly optimized for screening systems and senior clinical interviews.");
  }

  return {
    hasSTAR,
    hasMetrics,
    hasSafetyLanguage,
    score,
    strengths,
    gaps,
    recommendations
  };
}
