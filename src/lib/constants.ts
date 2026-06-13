export const APP_NAME = "CNA Career Playbook";
export const APP_VERSION = "2.0.0";

export const SHIFT_AVAILABILITY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const SHIFT_TYPES = [
  "Days",
  "Evenings",
  "Nights",
  "Weekends"
];

export const FACILITY_SKILL_ALIGNMENTS: Record<string, string[]> = {
  "Hospital": ["Vital Signs", "Wound Care", "Infection Control", "EHR Documentation", "Emergency Response"],
  "SNF": ["Long-term Care", "Dementia Care", "Transfer Assistance", "Incontinence Care", "EHR Documentation"],
  "Assisted Living": ["ADL Assistance", "Medication Reminders", "Social Engagement", "Transfer Assistance"],
  "Home Health": ["Independence", "Travel Reliability", "Family Education", "Time Management", "Medication Reminders"],
  "Memory Care": ["Behavioral Interventions", "Redirection", "Sundowning Management", "Transfer Assistance", "Dementia Care"]
};

export const CLINICAL_CHECKLIST_CATEGORIES = [
  "CDC STEADI",
  "CMS Guidelines",
  "Dementia Protocols",
  "Clinical Safety"
];
