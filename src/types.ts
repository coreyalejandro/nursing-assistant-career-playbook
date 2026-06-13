/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClinicalMetrics {
  dailyResidentsCount: string;
  vitalSignsCount: string;
  fallReductionPct: string;
  satisfactionIncreasePct: string;
  trainingCount: string;
  warehousePackagesCount: string;
}

export interface BulletPoint {
  id: string;
  text: string;
}

export interface ExperienceBlock {
  company: string;
  location: string;
  title: string;
  dateRange: string;
  bullets: BulletPoint[];
}

export interface ResumeData {
  professionalSummary: string;
  clinicalCompetencies: string[];
  mobilitySafety: string[];
  systemsAdmin: string[];
  experiences: ExperienceBlock[];
}

export interface CaseStudy {
  title: string;
  type: "success" | "failure";
  challenge: string;
  action: string;
  outcome: string;
  metrics: string;
}

export interface JourneyStage {
  phase: string;
  title: string;
  devParallel: string;
  action: string;
  artifact: string;
  status: "good" | "neutral" | "bad";
  signalStrength: string;
}

export interface GapCell {
  stage: string;
  exists: string;
  missing: string;
  opportunitySize: string;
}

export interface ResourceCard {
  type: string;
  name: string;
  desc: string;
  why: string;
  radar: "Off Radar" | "Known Quantity";
  category: "agency" | "tool" | "community" | "intel";
  url?: string;
  citation?: string;
  licensingBody?: string;
}

export interface PlaybookData {
  resume: ResumeData;
  metrics: ClinicalMetrics;
  caseStudies: CaseStudy[];
  journeyStages: JourneyStage[];
  gaps: GapCell[];
  resources: ResourceCard[];
  editorialBrief: {
    focusTitle: string;
    focusSub: string;
    focusDetails: string;
    vignetteTitle: string;
    vignetteBody: string;
  };
}

export type TargetSector = "general" | "icu_stepdown" | "memory_care" | "private_care" | "warehouse_logistics";
