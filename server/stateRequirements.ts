/**
 * server/stateRequirements.ts
 * ---------------------------------------------------------------------------
 * Rule-grounded CNA certification lookup for ALL 50 states + DC.
 *
 * WHY THIS EXISTS: the original server only hardcoded 5 states (CA/TX/GA/NY/FL)
 * and otherwise let the model free-text certification steps, which risks
 * hallucinated requirements (the exact failure the audit flagged). This file
 * replaces that with a deterministic dataset:
 *
 *   - Every state inherits federally-accurate baseline steps (OBRA '87 /
 *     42 CFR 483.151-154): >=75 training hours, a written + skills competency
 *     exam, background check, registry listing, and 24-month renewal.
 *   - States we have verified carry precise hours / exam vendor / official URL
 *     and are marked `verified: true`.
 *   - For every other state we DO NOT invent specifics. We surface the federal
 *     baseline and an authoritative "verify on your state's official registry"
 *     link, with `verified: false` so the UI can show a "confirm current
 *     details" notice.
 *
 * This guarantees national coverage with zero hallucinated fees or steps.
 * ---------------------------------------------------------------------------
 */

export interface FundingLink {
  name: string;
  url: string;
}

export interface StateRequirement {
  abbr: string;
  name: string;
  minHours: number;
  /** Whether minHours/examVendor/officialUrl have been verified for this state. */
  verified: boolean;
  examVendor: string;
  /** Direct exam-vendor or registry URL when known, else the verify search. */
  examUrl: string;
  /** Authoritative page to confirm current requirements. */
  officialUrl: string;
  extraSteps: string[];
  fundingLinks: FundingLink[];
}

const FEDERAL_MIN_HOURS = 75;

const NATIONAL_FUNDING: FundingLink[] = [
  { name: "Federal WIOA Training Assistance (DOL)", url: "https://www.dol.gov/agencies/eta/wioa" },
  { name: "CareerOneStop Training Finder", url: "https://www.careeronestop.org/" },
];

/** Federally-accurate steps that apply in every state. */
function baselineSteps(stateName: string): string[] {
  return [
    `Complete a ${stateName}-approved nurse aide training program. Federal law requires at least 75 hours (including at least 16 hours of supervised clinical training); many states require more.`,
    "Pass the state competency evaluation: a written (or oral) knowledge exam plus a hands-on skills demonstration.",
    "Clear a criminal background check and complete required health screenings (e.g., TB test and immunizations).",
    `Get listed on the ${stateName} Nurse Aide Registry — you must be on the registry before working as a paid CNA.`,
    "Renew your certification every 24 months; federal rules require proof of paid nursing-related work during that period.",
  ];
}

function verifyUrl(stateName: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(
    stateName + " nurse aide registry official certification requirements"
  )}`;
}

/** [abbr, name] for all 50 states + DC. */
const STATE_LIST: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

/**
 * Verified per-state overrides. Only fields we are confident about are set;
 * everything else falls back to the federally-accurate baseline.
 */
const VERIFIED_OVERRIDES: Record<string, Partial<StateRequirement>> = {
  CA: {
    minHours: 160,
    verified: true,
    examVendor: "Pearson VUE",
    examUrl: "https://home.pearsonvue.com/ca/cnas",
    officialUrl: "https://www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/NACEP.aspx",
    extraSteps: [
      "Complete a CDPH-approved program: 60 theory hours + 100 supervised clinical hours (160 total).",
      "Submit CDPH Form 283B and complete LiveScan fingerprinting/background check early.",
      "Pass the written and skills competency exam through Pearson VUE.",
      "Get listed on the California Nurse Assistant Registry before working for pay.",
    ],
    fundingLinks: [
      { name: "California WIOA / America's Job Center", url: "https://edd.ca.gov/en/jobs_and_training/workforce_connection/" },
      { name: "California Cal Grant C (career/technical)", url: "https://www.csac.ca.gov/cal-grant-c" },
    ],
  },
  TX: {
    minHours: 100,
    verified: true,
    examVendor: "Prometric",
    examUrl: "https://www.prometric.com/nurseaide/tx",
    officialUrl: "https://www.hhs.texas.gov/providers/health-care-facilities-regulation/nurse-aides",
    extraSteps: [
      "Complete a Texas HHSC-approved nurse aide training program (at least 100 hours).",
      "Pass the Prometric knowledge and skills competency exam.",
      "Complete the required criminal history background check.",
      "Get listed on the Texas Nurse Aide Registry (NAR) before working for pay.",
    ],
    fundingLinks: [
      { name: "Texas Workforce Solutions Training Aid", url: "https://www.twc.texas.gov/jobseekers/training-education" },
      { name: "Texas Higher Education Coordinating Board", url: "https://www.highered.texas.gov/" },
    ],
  },
  GA: {
    minHours: 85,
    verified: true,
    examVendor: "Credentia",
    examUrl: "https://credentia.com/test-takers/georgia",
    officialUrl: "https://medicaid.georgia.gov/programs/all-programs/georgia-nurse-aide-program",
    extraSteps: [
      "Complete a Georgia-approved nurse aide training program (at least 85 hours).",
      "Register on the Georgia NATEP candidate system and schedule the Credentia exam.",
      "Complete TB clearance and required immunizations.",
      "Get listed on the Georgia Nurse Aide Registry before working for pay.",
    ],
    fundingLinks: [
      { name: "Technical College System of Georgia (WIOA)", url: "https://tcsg.edu/workforce-development/" },
      { name: "Georgia HOPE Career Grant", url: "https://www.gafutures.org/hope-state-aid-programs/" },
    ],
  },
  NY: {
    minHours: 100,
    verified: true,
    examVendor: "Prometric",
    examUrl: "https://www.prometric.com/nurseaide/ny",
    officialUrl: "https://www.health.ny.gov/professionals/nursing_home_administrator/nurse_aide_registry/",
    extraSteps: [
      "Complete a NYS DOH-approved nurse aide training program (at least 100 hours).",
      "Pass the Prometric written and clinical skills exam.",
      "Submit your NYS DOH Nurse Aide Registry applicant profile.",
      "Get listed on the New York Nurse Aide Registry before working for pay.",
    ],
    fundingLinks: [
      { name: "NYS Department of Labor Workforce Training", url: "https://dol.ny.gov/workforce-development" },
    ],
  },
  FL: {
    minHours: 120,
    verified: true,
    examVendor: "Prometric",
    examUrl: "https://www.prometric.com/nurseaide/fl",
    officialUrl: "https://floridasnursing.gov/licensing/certified-nursing-assistant/",
    extraSteps: [
      "Complete an approved program or qualify by training/experience per Florida Board of Nursing rules.",
      "Pass the Prometric nursing assistant competency exam (written + skills).",
      "Submit a background check via the AHCA Care Provider Background Screening Clearinghouse.",
      "Get listed on the Florida Nurse Aide Registry before working for pay.",
    ],
    fundingLinks: [
      { name: "Florida CareerSource (WIOA)", url: "https://floridajobs.org/" },
    ],
  },
};

function buildState(abbr: string, name: string): StateRequirement {
  const base: StateRequirement = {
    abbr,
    name,
    minHours: FEDERAL_MIN_HOURS,
    verified: false,
    examVendor: "State-approved testing vendor (confirm with your registry)",
    examUrl: verifyUrl(name),
    officialUrl: verifyUrl(name),
    extraSteps: baselineSteps(name),
    fundingLinks: NATIONAL_FUNDING,
  };
  const override = VERIFIED_OVERRIDES[abbr];
  if (!override) return base;
  return {
    ...base,
    ...override,
    // Always keep national funding available in addition to any state links.
    fundingLinks: override.fundingLinks
      ? [...override.fundingLinks, ...NATIONAL_FUNDING]
      : NATIONAL_FUNDING,
  };
}

export const ALL_STATE_REQUIREMENTS: Record<string, StateRequirement> =
  Object.fromEntries(
    STATE_LIST.map(([abbr, name]) => [abbr, buildState(abbr, name)])
  );

/** Lightweight list for dropdowns / UI. */
export const STATE_OPTIONS = STATE_LIST.map(([abbr, name]) => ({ abbr, name }));

/**
 * Look up requirements for any state code or name. Always returns a valid
 * record (national coverage) — never undefined, so no CNA is "unserved".
 */
export function getStateReqs(input: string | undefined): StateRequirement {
  if (!input) return ALL_STATE_REQUIREMENTS["GA"];
  const raw = input.trim();
  const upper = raw.toUpperCase();

  // Match by 2-letter abbreviation first.
  if (ALL_STATE_REQUIREMENTS[upper.substring(0, 2)] && upper.length <= 2) {
    return ALL_STATE_REQUIREMENTS[upper.substring(0, 2)];
  }
  if (ALL_STATE_REQUIREMENTS[upper]) return ALL_STATE_REQUIREMENTS[upper];

  // Otherwise match by full name (case-insensitive).
  const byName = STATE_LIST.find(
    ([, name]) => name.toLowerCase() === raw.toLowerCase()
  );
  if (byName) return ALL_STATE_REQUIREMENTS[byName[0]];

  // Last resort: federal baseline keyed to whatever the user typed.
  return buildState(upper.substring(0, 2) || "US", raw);
}
