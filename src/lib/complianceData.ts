export interface ComplianceItem {
  id: string;
  category: "CDC STEADI" | "CMS Guidelines" | "Dementia Protocols" | "Clinical Safety";
  title: string;
  description: string;
  rationale: string;
}

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "item-1",
    category: "CDC STEADI",
    title: "Orthostatic Blood Pressure Measurement",
    description: "Able to correctly perform and record lying, sitting, and standing blood pressure changes.",
    rationale: "Ensures early identification of postural hypotension risks in high-fall-risk residents."
  },
  {
    id: "item-2",
    category: "CDC STEADI",
    title: "Gait & Balance Assessment Assistance",
    description: "Supports physical therapists with standard Timed Up and Go (TUG) or 4-Stage Balance tests.",
    rationale: "Assists the clinical nursing team with tracking physical decline benchmarks."
  },
  {
    id: "item-3",
    category: "CDC STEADI",
    title: "Home & Floor Hazard Analysis",
    description: "Systematic auditing of floor cables, liquid spills, sliding rugs, and lighting quality.",
    rationale: "CDC benchmarks verify that environmental modification acts as a primary fall block."
  },
  {
    id: "item-4",
    category: "CDC STEADI",
    title: "Sensory Aid Verification Protocol",
    description: "Double-checking that resident eyeglasses are clean and hearing aids have fresh batteries daily.",
    rationale: "Poor sensory integration is a massive, completely preventable contributor to major floor slips."
  },
  {
    id: "item-5",
    category: "CDC STEADI",
    title: "Footwear Safety Check",
    description: "Ensures residents are fitted with snug, non-slip, flat-soled support shoes.",
    rationale: "Loose slippers or high socks on slick vinyl floors represent critical incident triggers."
  },
  {
    id: "item-6",
    category: "CMS Guidelines",
    title: "Resident Rights & Choice Accommodation",
    description: "Provides ADL assist while actively supporting resident privacy, clothing choice, and waking hours preferences.",
    rationale: "Required by CMS F-Tag 561 to maintain dignity, agency, and self-determination."
  },
  {
    id: "item-7",
    category: "CMS Guidelines",
    title: "Proper Mechanical Lift (Hoyer) Execution",
    description: "Requires mandatory secondary team member verification and strict manufacturer weight adherence.",
    rationale: "CMS safety codes list single-helper mechanical transfers as high-severity abuse risks."
  },
  {
    id: "item-8",
    category: "CMS Guidelines",
    title: "Patient Hand Hygiene standards",
    description: "Mandatory hand rubbing or soap cleansing before and after every resident dining assistance period.",
    rationale: "Mitigates localized gastrointestinal and healthcare-associated transmission pipelines."
  },
  {
    id: "item-9",
    category: "CMS Guidelines",
    title: "Pressure Injury Prevention (F-726)",
    description: "Maintains standard 2-hour turning schedules with complete friction-free pull sheet lifting.",
    rationale: "Exposes SNFs to severe state-level regulatory non-compliance citations if skin deterioration occurs."
  },
  {
    id: "item-10",
    category: "CMS Guidelines",
    title: "Abuse & Neglect Reporting Chains",
    description: "Understands immediate reporting windows for witnessed or suspected administrative neglect.",
    rationale: "Federal mandate requires report filing within 2 hours for serious bodily injury events."
  },
  {
    id: "item-11",
    category: "Dementia Protocols",
    title: "Behavioral Redirection & Validation",
    description: "Communicates using validation techniques rather than argumentative correction during sundowning escalation.",
    rationale: "Directly minimizes panic, cardiovascular stress, and sudden combative outbursts."
  },
  {
    id: "item-12",
    category: "Dementia Protocols",
    title: "Wandering & Elopement Safety Alarms",
    description: "Understands electronic door-band signaling and immediate localized response measures.",
    rationale: "Elopement to freezing or warm exterior hazards carries critical life-safety implications."
  },
  {
    id: "item-13",
    category: "Dementia Protocols",
    title: "De-escalation via Environmental Stimuli",
    description: "Lowers glare, reduces volume spikes, and utilizes soft familiar patterns to comfort residents.",
    rationale: "Aggitated residents frequently respond well to calm, visually decluttered spaces."
  },
  {
    id: "item-14",
    category: "Dementia Protocols",
    title: "Challenging Care Refusal Handlers",
    description: "Employs peer-switches or cooling-off periods when residents strongly block critical hygiene tasks.",
    rationale: "Prevents escalating gentle cleaning sessions into traumatic physical standoffs."
  },
  {
    id: "item-15",
    category: "Clinical Safety",
    title: "Standard Precaution Hand Washing",
    description: "Executes friction cleansing for a minimum of 20 seconds before and after donning clinical gloves.",
    rationale: "The highest frequency failure point for cross-viral spreading inside clinical environments."
  },
  {
    id: "item-16",
    category: "Clinical Safety",
    title: "Foley Catheter Care Protocols",
    description: "Checks that bags remain below bladder level with zero floor contact or tubing twists.",
    rationale: "Improper positioning accounts for over 80% of preventable Catheter-Associated UTIs."
  },
  {
    id: "item-17",
    category: "Clinical Safety",
    title: "EHR Accuracy & Point-of-Care Logging",
    description: "Logs nourishment intake, fluid output, bowel checks, and physical mobility logs in PointClickCare.",
    rationale: "Ensures immediate billing, audits, and clinical tracking accuracy for insurance adjusters."
  },
  {
    id: "item-18",
    category: "Clinical Safety",
    title: "Medical Error Prevention Protocol",
    description: "Double-checks resident identification wristbands before passing supplement snacks or feeding trays.",
    rationale: "Directly combats severe diabetic or allergen administrative mismatches."
  },
  {
    id: "item-19",
    category: "Clinical Safety",
    title: "Emergency Response & Rapid Code Alerting",
    description: "Accurately identifies localized distress signals, choking symptoms, and initiates CPR/BLS call-chains.",
    rationale: "Saves fragile seconds before arrival of emergency nursing and advanced life teams."
  },
  {
    id: "item-20",
    category: "Clinical Safety",
    title: "Chemical Spill & SDS Tracking",
    description: "Familiar with localized Safety Data Sheets (SDS) and clean instructions for sterilizing concentrates.",
    rationale: "Protects respiratory safety and dermal skin boundaries for both staff and elderly clients."
  }
];
