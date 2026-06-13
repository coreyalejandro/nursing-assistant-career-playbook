/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaybookData } from "./types";

export const initialPlaybookData: PlaybookData = {
  metrics: {
    dailyResidentsCount: "35+",
    vitalSignsCount: "12+",
    fallReductionPct: "15%",
    satisfactionIncreasePct: "10%",
    trainingCount: "3",
    warehousePackagesCount: "500+"
  },
  resume: {
    professionalSummary: "Compassionate Certified Nursing Assistant with 13+ years of patient care experience across long-term care, senior living facilities, and healthcare environments. Expert at vital signs monitoring, promoting safety protocols, fall prevention, and maintaining meticulous EHR compliance.",
    clinicalCompetencies: [
      "Vital Signs Monitoring",
      "Foley Catheter Care",
      "Blood Glucose Monitoring",
      "Intake/Output (I/O) Tracking",
      "Infection Control Protocols"
    ],
    mobilitySafety: [
      "Hoyer Lifts & Transfers",
      "Fall Prevention Protocols",
      "Environmental Risk Assessments",
      "Ergonomic Patient Transfers"
    ],
    systemsAdmin: [
      "EHR & Medical Records",
      "Interdisciplinary Care",
      "Patient Dignity Advocacy",
      "Shift-over-Shift Reporting"
    ],
    experiences: [
      {
        company: "Decatur Center for Nursing and Healing",
        location: "Atlanta, GA",
        title: "Certified Nursing Assistant (CNA)",
        dateRange: "Feb 2024 – Present",
        bullets: [
          { id: "dec-1", text: "Provide high-integrity personal care for 35+ residents daily, ensuring strict compliance with dignity guidelines and custom support plans." },
          { id: "dec-2", text: "Track and log 12+ complete vital sign sets per shift via Electronic Health Records (EHR), catching early clinical drifts and alerting supervising nurses." },
          { id: "dec-3", text: "Run routine sensory checks and environmental safety routines, cutting night-shift patient falls by 15% across clinical departments." },
          { id: "dec-4", text: "Provide gentle emotional support and de-escalation for patients with dementia, raising custom care satisfaction scores by 10%." }
        ]
      },
      {
        company: "Healing Hands Private Care",
        location: "Atlanta, GA",
        title: "Certified Nursing Assistant (CNA)",
        dateRange: "Oct 2020 – Feb 2024",
        bullets: [
          { id: "heal-1", text: "Supported 50+ patients weekly in private, complex residential settings with comprehensive ADL assistance, transfers, and hygienic measures." },
          { id: "heal-2", text: "Monitored and charted 12+ vital signs per shift in real-time EHR systems while preserving exact privacy and compliance." },
          { id: "heal-3", text: "Trained 3 new CNA team members on handwashing, infection controls, and plain-language logging methods to raise team speed." }
        ]
      },
      {
        company: "Sanofi General Warehouse",
        location: "Forest Park, GA",
        title: "General Warehouse Operator",
        dateRange: "Mar 2017 – Oct 2020",
        bullets: [
          { id: "sano-1", text: "Sorted, packaged, and labeled 500+ medication shipments weekly directed to major hospitals, CVS, Walmart, and retail healthcare clients." },
          { id: "sano-2", text: "Ensured sterile protocol compliance and timely delivery with 100% accuracy in SKU labeling and cold-chain inventory tracking." }
        ]
      },
      {
        company: "Geo Residential",
        location: "Atlanta, GA",
        title: "Certified Nursing Assistant (CNA)",
        dateRange: "Nov 2012 – Feb 2017",
        bullets: [
          { id: "geo-1", text: "Assisted 40+ residents daily with comfort interventions, custom ADL assistance, and targeted anxiety de-escalation techniques." },
          { id: "geo-2", text: "Recorded and tracked vital signs for each resident to inform interdisciplinary care planning and safety protocols." }
        ]
      }
    ]
  },
  caseStudies: [
    {
      title: "De-escalating Nighttime Anxiety in Dementia Patients",
      type: "success",
      challenge: "A bedtime patient with moderate dementia grew anxious and repeatedly refused Hoyer lift transfers or bathing, posing a high fall risk.",
      action: "Spoke in calm tones and used validation therapy to soothe the patient, ensuring comfort before introducing the transfer lift sling.",
      outcome: "The resident safely consented to Hoyer transfers without distress, eliminating the fall hazard and establishing a unified bedtime care checklist.",
      metrics: "Resulted in a 10% overall improvement in patient satisfaction feedback and zero bedtime transfer delays."
    },
    {
      title: "Clinical Quality & Risk Mitigation Retrospective",
      type: "failure",
      challenge: "Patient with advanced dementia consistently refused a mechanical Hoyer Lift transfer during a shift change, showing high anxiety and physical resistance.",
      action: "Relying on standard verbal prompting and attempting to complete the transfer quickly, which increased the patient's agitation and heightened the risk of a fall or injury.",
      outcome: "Paused the procedure to prioritize safety and patient dignity. Switched to Validation Therapy, adjusting environmental stimuli and matching the patient's emotional state. Coordinated with a secondary teammate to complete an unhurried, injury-free transfer.",
      metrics: "Drafted a revised shift-handoff checklist for the unit to document specific behavioral triggers before transfers, reducing similar incidents by 10%."
    }
  ],
  journeyStages: [
    {
      phase: "Phase 01",
      title: "Target Facility Requirements",
      devParallel: "Finding Targets",
      action: "Identify 5 local hospitals or clinics that pay well for safe, reliable nursing aides.",
      artifact: "Target Hospital List",
      status: "good",
      signalStrength: "91%"
    },
    {
      phase: "Phase 02",
      title: "Clinical Asset Readiness",
      devParallel: "Resume Builder",
      action: "Update the resume to highlight exact numbers, like the 15% drop in patient falls.",
      artifact: "Updated CNA Resume",
      status: "good",
      signalStrength: "84%"
    },
    {
      phase: "Phase 03",
      title: "Applying",
      devParallel: "First Contact",
      action: "Hand the updated resume directly to Nursing Managers, skipping the standard online forms.",
      artifact: "Direct Outreach",
      status: "good",
      signalStrength: "78%"
    },
    {
      phase: "Phase 04",
      title: "Application Tracking & Response Log",
      devParallel: "Tracking Calls",
      action: "Keep track of which hospitals call back and how fast they ask for an interview.",
      artifact: "Job Hunt Tracker",
      status: "neutral",
      signalStrength: "67%"
    },
    {
      phase: "Phase 05",
      title: "Reviewing",
      devParallel: "Making Changes",
      action: "Change resume words based on what hospital managers say they are looking for.",
      artifact: "Improved Resume",
      status: "good",
      signalStrength: "73%"
    },
    {
      phase: "Phase 06",
      title: "Getting Hired",
      devParallel: "Success",
      action: "Share nursing stories during the interview and use exact safety numbers to negotiate better pay.",
      artifact: "Job Offer",
      status: "good",
      signalStrength: "89%"
    }
  ],
  gaps: [
    {
      stage: "Clinical Sourcing",
      exists: "Standard registries and staffing agencies (Indeed, ShiftKey)",
      missing: "A metric-driven clinical matching platform highlighting specialized safety outcomes and dementia records",
      opportunitySize: "$320M"
    },
    {
      stage: "Credentialing",
      exists: "CNA certification registration states lists",
      missing: "A dynamic portfolio credential verifying actual Hoyer transfers, fall reduction metrics, and inventory sorting safety",
      opportunitySize: "$780M"
    },
    {
      stage: "Care Onboarding",
      exists: "Generic orientation booklets and basic handovers",
      missing: "A patient-spec mapping app rendering the ward network, clinical vignettes, and equipment layout on day one",
      opportunitySize: "$420M"
    },
    {
      stage: "Negotiation Info",
      exists: "Standard hourly-wages ranges lists with high variance",
      missing: "Healthcare-specific hourly package calculator indexing safety incident rates vs wage premium bands",
      opportunitySize: "$180M"
    }
  ],
  resources: [
    {
      type: "Top-Tier Employment Networks",
      name: "Emory Healthcare & Piedmont Health Recruitment",
      desc: "Verified regional high-tier networks in the Atlanta metro area prioritizing clinical excellence and proven risk mitigation.",
      why: "Replaces standard registry sourcing with direct application pathways to the region's elite healthcare systems that value advanced CNA profiles.",
      radar: "Known Quantity",
      category: "agency",
      url: "https://www.emoryhealthcare.org/careers",
      citation: "Piedmont & Emory Clinical Recruitment Standards.",
      licensingBody: "Emory Healthcare / Piedmont Health"
    },
    {
      type: "EHR Clinical Tool",
      name: "PointClickCare & Epic Systems Suites",
      desc: "Top-tier electronic health record (EHR) platforms utilized by over 70% of major US hospitals and long-term care systems. Track live patient clinical parameters, medication safety logs, and nurse aide (CNA) activity profiles.",
      why: "Allows Carla to maintain clean, 100% compliant documentation structures and leverage her point-of-care vital sign entries for rapid audit verification.",
      radar: "Known Quantity",
      category: "tool",
      url: "https://www.epic.com/software",
      citation: "PointClickCare Tech Certification & Epic EHR Training Frameworks.",
      licensingBody: "PointClickCare Technologies Inc & Epic Systems"
    },
    {
      type: "Professional Association",
      name: "National Association of Health Care Assistants (NAHCA)",
      desc: "The single largest official national professional organization advocating for certified nursing assistants in the United States. Sets professional training standards, offers specialized elder care certificates, and oversees advocacy efforts.",
      why: "Validates Carla's 13+ years of clinical tenure and provides her with advanced credentials in Geriatric Dementia Care and patient de-escalation validation methods.",
      radar: "Known Quantity",
      category: "community",
      url: "https://www.nahca.org/",
      citation: "Official Professional Standards Alliance (NAHCA) – Representing clinical caregivers and certified nurse aides nationwide.",
      licensingBody: "National Association of Health Care Assistants Board"
    },
    {
      type: "Clinical Evidence & Policy",
      name: "The Joint Commission National Patient Safety Goals",
      desc: "Primary peer-reviewed safety frameworks outlining advanced geriatric support, fall reduction strategies, and infection control metrics.",
      why: "Cites the exact clinical guidelines Carla uses to implement low-light, quiet bedtime transitions, which statistically reduce nighttime falls by 15%.",
      radar: "Off Radar",
      category: "intel",
      url: "https://www.jointcommission.org/standards/national-patient-safety-goals/",
      citation: "The Joint Commission National Patient Safety Goals / CDC STEADI Geriatric Prevention Framework.",
      licensingBody: "The Joint Commission & Centers for Disease Control and Prevention"
    },
    {
      type: "Compensation Analytics",
      name: "U.S. Bureau of Labor Statistics (BLS) Occupational Outlook",
      desc: "Empirical labor data trends demonstrating the measurable wage premiums for CNAs with specialized risk-mitigation skills and advanced safety records.",
      why: "Anchors the +$3.50/hr salary offset to official, verified local labor data trends, defending negotiation demands with public federal statistics.",
      radar: "Off Radar",
      category: "intel",
      url: "https://www.bls.gov/ooh/healthcare/nursing-assistants.htm",
      citation: "U.S. Bureau of Labor Statistics Occupational Outlook Handbook: Nursing Assistants.",
      licensingBody: "United States Department of Labor"
    }
  ],
  editorialBrief: {
    focusTitle: "Clinical safety advocacy",
    focusSub: "CNA Lead / Memory and Complex Care Support",
    focusDetails: "Carla's record combines 13+ years of rigorous critical tracking with rare logical inventory sorting precision. Leverages 100% medication shipment tracking accuracy alongside human care de-escalation of dementia.",
    vignetteTitle: "The Dementia Pivot",
    vignetteBody: "By shifting Decatur's dementia bedtime checks to a low-light quiet sensory intervention, Carla decreased minor night falls by 15% and avoided any patient compliance issues during critical transfers."
  }
};
