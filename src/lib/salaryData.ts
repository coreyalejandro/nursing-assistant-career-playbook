export interface WageRow {
  facilityType: string;
  medianWage: number;
  topDecileWage: number;
  openingsIndex: "Very High" | "High" | "Moderate";
}

export interface CertPremium {
  certName: string;
  averageWageBump: number;
  roleDescription: string;
}

export interface DemandSkill {
  skillName: string;
  importancePct: number; // 0-100%
  growthTrend: "Rising" | "Stable" | "Critical";
}

export const FACILITY_WAGES: WageRow[] = [
  {
    facilityType: "Hospitals & Acute Care Networks",
    medianWage: 23.50,
    topDecileWage: 27.00,
    openingsIndex: "Very High"
  },
  {
    facilityType: "Skilled Nursing Facilities (SNFs)",
    medianWage: 21.75,
    topDecileWage: 24.50,
    openingsIndex: "Very High"
  },
  {
    facilityType: "Memory Care & Dementia Units",
    medianWage: 22.25,
    topDecileWage: 25.25,
    openingsIndex: "Very High"
  },
  {
    facilityType: "Assisted Living Facilities (ALFs)",
    medianWage: 19.50,
    topDecileWage: 22.00,
    openingsIndex: "High"
  },
  {
    facilityType: "Home Health & Hospice Care Agencies",
    medianWage: 20.25,
    topDecileWage: 23.75,
    openingsIndex: "High"
  }
];

export const CERTIFICATION_PREMIUMS: CertPremium[] = [
  {
    certName: "Certified Medication Aide (CMA)",
    averageWageBump: 2.75,
    roleDescription: "Authorized to administer routine medications, freeing RN time and shifting CNA liability models."
  },
  {
    certName: "Advanced Safety / CDC STEADI Endorsement",
    averageWageBump: 1.50,
    roleDescription: "Identified fall prevention champion capable of auditing floor structures and tracking gait telemetry."
  },
  {
    certName: "CPR & BLS Instructor Certification",
    averageWageBump: 1.25,
    roleDescription: "Enables facility-wide peer testing and emergency protocol drills, reducing outer education budgets."
  },
  {
    certName: "Restorative Aide Specialist",
    averageWageBump: 1.75,
    roleDescription: "Works under physical therapy guidance to maintain resident physical ranges and mobility scores."
  }
];

export const DEMAND_SKILLS: DemandSkill[] = [
  { skillName: "PointClickCare / EHR Tracking", importancePct: 92, growthTrend: "Critical" },
  { skillName: "Patient Transfer & Hoyer Lift Safety", importancePct: 88, growthTrend: "Critical" },
  { skillName: "Infection Prevention & Sterile Audits", importancePct: 85, growthTrend: "Critical" },
  { skillName: "Dementia Care & Redirection Tactics", importancePct: 79, growthTrend: "Rising" },
  { skillName: "Orthostatic Vitals Registration", importancePct: 72, growthTrend: "Stable" },
  { skillName: "Wound Dressing & Clean Support", importancePct: 65, growthTrend: "Stable" }
];
