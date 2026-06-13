import React, { createContext, useContext, useReducer } from "react";
import { PlaybookData, TargetSector } from "../types";

export interface CNAResume {
  personalInfo: {
    fullName: string;
    cityState: string;
    email: string;
    phone: string;
    professionalSummary: string;
  };
  certifications: Array<{
    id: string;
    name: string;
    licenseNumber: string;
    state: string;
    issueDate: string;
    expirationDate: string;
  }>;
  cprDetails: {
    provider: string;
    expirationDate: string;
  };
  workHistory: Array<{
    id: string;
    employer: string;
    facilityType: string;
    dates: string;
    shiftPattern: string[]; // "Days", "Evenings", "Nights", "Weekends"
    responsibilities: string;
    quantifiedOutcome: string;
  }>;
  clinicalSkills: string[];
  physicalCapabilities: string[];
  languages: Array<{
    id: string;
    language: string;
    proficiency: string; // "Conversational", "Professional", "Fluent", "Native"
  }>;
  availability: {
    [day: string]: string[]; // e.g. "Monday": ["Days", "Nights"]
  };
  references: Array<{
    id: string;
    name: string;
    title: string;
    facility: string;
    phone: string;
    email: string;
    relationship: string;
  }>;
}

export interface PlaybookState {
  resume: CNAResume;
  targetSector: TargetSector;
  selectedFacilityType: string;
  compliancePercentage: number;
  complianceChecked: string[];
  interviewAnswers: Record<string, string>;
  activeTab: string;
  studyPlanDownloaded: boolean;
  userInterventions: Record<string, string>; // custom contribution statements for the cards
}

export const DEFAULT_RESUME_STATE: CNAResume = {
  personalInfo: {
    fullName: "[Your Name]",
    cityState: "Atlanta, GA",
    email: "[Your Email]",
    phone: "[Your Phone]",
    professionalSummary: "Dedicated Certified Nursing Assistant (CNA) with over 13 years of dynamic experience across advanced clinical spheres, geriatric safety wards, and medication logistics. Proven capability in reducing floor falls under specialized CDC STEADI protocols, managing point-of-care electronic health record (EHR) charts, and delivering compassionate ADL assistance with clinical precision.",
  },
  certifications: [
    {
      id: "cert-1",
      name: "Certified Nursing Assistant (CNA)",
      licenseNumber: "CNA-2026-6129",
      state: "Georgia",
      issueDate: "2013-04-15",
      expirationDate: "2027-04-15",
    },
  ],
  cprDetails: {
    provider: "American Heart Association (AHA) BLS",
    expirationDate: "2027-05-20",
  },
  workHistory: [
    {
      id: "work-1",
      employer: "Decatur Center for Nursing and Healing",
      facilityType: "SNF",
      dates: "Feb 2024 – Present",
      shiftPattern: ["Days", "Weekends"],
      responsibilities: "Deliver continuous daily vitals tracking and supportive care indicators for over 35 sub-acute residents. Administer safe physical transfers using Hoyer lifts, stand-assist rigs, and gait belts with strict alignment to injury prevention criteria.",
      quantifiedOutcome: "Reduced patient floor falls by 15% shift-over-shift through tight collaboration on specialized bed and chair alarm testing procedures.",
    },
    {
      id: "work-2",
      employer: "Healing Hands Care",
      facilityType: "Private Care",
      dates: "Oct 2020 – Feb 2024",
      shiftPattern: ["Evenings", "Weekends"],
      responsibilities: "Managed daily personal assistance and medication reminder plans for complex geriatric clients. Logged shift-by-shift skin integrity matrices and infection control standards.",
      quantifiedOutcome: "Boosted client care satisfaction levels by 10% through customized care planning and thorough daily redirection programs.",
    },
    {
      id: "work-3",
      employer: "Sanofi General Logistics",
      facilityType: "Hospital",
      dates: "Mar 2017 – Oct 2020",
      shiftPattern: ["Nights"],
      responsibilities: "Maintained complete sorting, labelling, and inventory compliance metrics for over 500 sterile pharmaceutical shipments weekly in temperature-monitored distribution lanes.",
      quantifiedOutcome: "Sustained a perfect 100% product labeling accuracy and clean sterile handling scorecard to eliminate patient supply path delays.",
    },
  ],
  clinicalSkills: [
    "Vital Signs",
    "Transfer Assistance",
    "Infection Control",
    "EHR Documentation",
    "Hoyer Lift",
    "Dementia Care",
    "Incontinence Care",
  ],
  physicalCapabilities: [
    "Lift 50+ lbs",
    "Stand 8+ hours",
    "Frequent bending/kneeling",
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Native" },
    { id: "lang-2", language: "Spanish", proficiency: "Conversational" },
  ],
  availability: {
    Monday: ["Days", "Evenings"],
    Tuesday: ["Days", "Evenings"],
    Wednesday: ["Days", "Evenings"],
    Thursday: ["Days", "Evenings"],
    Friday: ["Days", "Evenings"],
    Saturday: ["Days", "Evenings", "Weekends"],
    Sunday: ["Days", "Evenings", "Weekends"],
  },
  references: [
    {
      id: "ref-1",
      name: "Dr. Elena Vance",
      title: "Clinical Care Director",
      facility: "Decatur Health Center",
      phone: "555-019-3829",
      email: "evance@decaturcare.org",
      relationship: "Supervisor",
    },
  ],
};

export const INITIAL_STATE: PlaybookState = {
  resume: DEFAULT_RESUME_STATE,
  targetSector: "general",
  selectedFacilityType: "General",
  compliancePercentage: 35,
  complianceChecked: ["item-1", "item-3", "item-4", "item-8", "item-12", "item-15", "item-19"],
  interviewAnswers: {},
  activeTab: "/",
  studyPlanDownloaded: false,
  userInterventions: {
    falls: "Assisted the clinical team in auditing resident bed sensors and verifying floor friction zones weekly.",
    ehr: "Ensured double-verification of medication reminder logs in PointClickCare before signing off shift telemetry.",
    satisfaction: "Instituted active hourly comfort polling, immediately routing concerns to shift nurse leads.",
  },
};

// Base64 state serializers for URL sharing (Section 4)
export function encodeResumeState(resume: CNAResume): string {
  try {
    const jsonStr = JSON.stringify(resume);
    return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    console.error("Failed to encode state", e);
    return "";
  }
}

export function decodeResumeState(base64: string): CNAResume | null {
  try {
    const raw = atob(base64);
    const decoded = decodeURIComponent(Array.prototype.map.call(raw, (c) => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(decoded) as CNAResume;
  } catch (e) {
    console.error("Failed to decode share state", e);
    return null;
  }
}

type Action =
  | { type: "UPDATE_PERSONAL_INFO"; payload: Partial<PlaybookState["resume"]["personalInfo"]> }
  | { type: "UPDATE_CPR"; payload: Partial<PlaybookState["resume"]["cprDetails"]> }
  | { type: "UPDATE_WORK_HISTORY"; payload: PlaybookState["resume"]["workHistory"] }
  | { type: "UPDATE_CLINICAL_SKILLS"; payload: string[] }
  | { type: "UPDATE_PHYSICAL_CAPABILITIES"; payload: string[] }
  | { type: "UPDATE_LANGUAGES"; payload: PlaybookState["resume"]["languages"] }
  | { type: "UPDATE_AVAILABILITY"; payload: PlaybookState["resume"]["availability"] }
  | { type: "UPDATE_REFERENCES"; payload: PlaybookState["resume"]["references"] }
  | { type: "UPDATE_CERTIFICATIONS"; payload: PlaybookState["resume"]["certifications"] }
  | { type: "SET_CURRENT_SECTOR"; payload: TargetSector }
  | { type: "SET_FACILITY_TYPE"; payload: string }
  | { type: "TOGGLE_COMPLIANCE_ITEM"; payload: string }
  | { type: "SET_INTERVIEW_ANSWER"; payload: { questionId: string; answer: string } }
  | { type: "UPDATE_USER_INTERVENTION"; payload: { cardId: string; text: string } }
  | { type: "SET_ROUTE"; payload: string }
  | { type: "LOAD_FULL_STATE"; payload: PlaybookState };

export function playbookReducer(state: PlaybookState, action: Action): PlaybookState {
  switch (action.type) {
    case "UPDATE_PERSONAL_INFO":
      return {
        ...state,
        resume: {
          ...state.resume,
          personalInfo: { ...state.resume.personalInfo, ...action.payload },
        },
      };
    case "UPDATE_CPR":
      return {
        ...state,
        resume: {
          ...state.resume,
          cprDetails: { ...state.resume.cprDetails, ...action.payload },
        },
      };
    case "UPDATE_WORK_HISTORY":
      return {
        ...state,
        resume: {
          ...state.resume,
          workHistory: action.payload,
        },
      };
    case "UPDATE_CLINICAL_SKILLS":
      return {
        ...state,
        resume: {
          ...state.resume,
          clinicalSkills: action.payload,
        },
      };
    case "UPDATE_PHYSICAL_CAPABILITIES":
      return {
        ...state,
        resume: {
          ...state.resume,
          physicalCapabilities: action.payload,
        },
      };
    case "UPDATE_LANGUAGES":
      return {
        ...state,
        resume: {
          ...state.resume,
          languages: action.payload,
        },
      };
    case "UPDATE_AVAILABILITY":
      return {
        ...state,
        resume: {
          ...state.resume,
          availability: action.payload,
        },
      };
    case "UPDATE_REFERENCES":
      return {
        ...state,
        resume: {
          ...state.resume,
          references: action.payload,
        },
      };
    case "UPDATE_CERTIFICATIONS":
      return {
        ...state,
        resume: {
          ...state.resume,
          certifications: action.payload,
        },
      };
    case "SET_CURRENT_SECTOR":
      return {
        ...state,
        targetSector: action.payload,
      };
    case "SET_FACILITY_TYPE":
      return {
        ...state,
        selectedFacilityType: action.payload,
      };
    case "TOGGLE_COMPLIANCE_ITEM": {
      const isChecked = state.complianceChecked.includes(action.payload);
      const updatedChecked = isChecked
        ? state.complianceChecked.filter((id) => id !== action.payload)
        : [...state.complianceChecked, action.payload];
      // calculate completion percentage based on total 20 items
      const completion = Math.round((updatedChecked.length / 20) * 100);
      return {
        ...state,
        complianceChecked: updatedChecked,
        compliancePercentage: Math.min(100, completion),
      };
    }
    case "SET_INTERVIEW_ANSWER":
      return {
        ...state,
        interviewAnswers: {
          ...state.interviewAnswers,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    case "UPDATE_USER_INTERVENTION":
      return {
        ...state,
        userInterventions: {
          ...state.userInterventions,
          [action.payload.cardId]: action.payload.text,
        },
      };
    case "SET_ROUTE":
      return {
        ...state,
        activeTab: action.payload,
      };
    case "LOAD_FULL_STATE":
      return {
        ...action.payload,
      };
    default:
      return state;
  }
}

const PlaybookContext = createContext<{
  state: PlaybookState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function PlaybookProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playbookReducer, INITIAL_STATE);

  // Sync state cleanly with location pathing & load shared resume params
  React.useEffect(() => {
    const handlePopState = () => {
      dispatch({ type: "SET_ROUTE", payload: window.location.pathname });
    };
    window.addEventListener("popstate", handlePopState);
    
    // Check for share parameters on app load
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get("share");
    if (sharedParam) {
      const decodedResume = decodeResumeState(sharedParam);
      if (decodedResume) {
        dispatch({
          type: "LOAD_FULL_STATE",
          payload: {
            ...INITIAL_STATE,
            resume: decodedResume,
            activeTab: "/resume" // direct user to resume view
          }
        });
      }
    } else {
      dispatch({ type: "SET_ROUTE", payload: window.location.pathname });
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <PlaybookContext.Provider value={{ state, dispatch }}>
      {children}
    </PlaybookContext.Provider>
  );
}

export function usePlaybook() {
  const context = useContext(PlaybookContext);
  if (!context) {
    throw new Error("usePlaybook must be used inside a PlaybookProvider");
  }
  return context;
}
