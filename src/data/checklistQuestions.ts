import { ChecklistQuestions, QuestionStep } from "@/types";

// Questions for Electrical Panel permits
const ELECTRICAL_PANEL_QUESTIONS: { [jurisdiction: string]: ChecklistQuestions } = {
  PINELLAS: {
    "Panel Specifications": [
      {
        id: "panel-amperage",
        intro: "Let's start with the basics about your electrical panel. This info goes straight to your permit application! 📋",
        question: "What's the main breaker size? Look at the big switch at the top of your panel — it should have a number on it.",
        options: [
          { label: "100 Amps", value: "100A" },
          { label: "150 Amps", value: "150A" },
          { label: "200 Amps", value: "200A" },
          { label: "I'm not sure", value: "unknown" }
        ],
        field: "amperage",
        followUp: {
          unknown: "No worries! Take a photo of your panel and I'll find it for you. 📷"
        }
      },
      {
        id: "panel-brand",
        question: "What brand is the panel? There's usually a logo or name on the inside of the door.",
        options: [
          { label: "Square D", value: "Square D" },
          { label: "Siemens", value: "Siemens" },
          { label: "Eaton/Cutler-Hammer", value: "Eaton" },
          { label: "GE", value: "GE" },
          { label: "Other brand", value: "other" }
        ],
        field: "manufacturer"
      },
      {
        id: "panel-spaces",
        question: "How many circuit breaker spaces does the panel have? Count all the slots (even empty ones).",
        options: [
          { label: "20 spaces", value: "20" },
          { label: "30 spaces", value: "30" },
          { label: "40 spaces", value: "40" },
          { label: "I'll take a photo", value: "photo" }
        ],
        field: "spaces"
      }
    ],
    "Service Entrance": [
      {
        id: "service-type",
        intro: "Now let's document how power comes into your home. This is called the 'service entrance'. 🏠",
        question: "How does the power line connect to your house?",
        options: [
          { label: "Overhead (wires from pole)", value: "overhead" },
          { label: "Underground (buried cable)", value: "underground" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "serviceType"
      },
      {
        id: "meter-location",
        question: "Where is your electric meter located?",
        options: [
          { label: "Outside on wall", value: "exterior_wall" },
          { label: "In garage", value: "garage" },
          { label: "On power pole", value: "pole" },
          { label: "I'll show you (photo)", value: "photo" }
        ],
        field: "meterLocation"
      }
    ],
    "Grounding System": [
      {
        id: "ground-rod",
        intro: "Grounding keeps you safe from electrical surges. Let's document your grounding system. ⚡",
        question: "Can you see a copper rod driven into the ground near your panel or meter?",
        options: [
          { label: "Yes, I see it", value: "visible" },
          { label: "No, can't find it", value: "not_visible" },
          { label: "I'll take a photo", value: "photo" }
        ],
        field: "groundRodVisible"
      },
      {
        id: "water-bond",
        question: "Is there a green or bare copper wire clamped to your main water pipe?",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "Not sure / can't see", value: "unknown" }
        ],
        field: "waterBond"
      }
    ],
    "Load Calculation": [
      {
        id: "home-sqft",
        intro: "The inspector needs to know your home can handle all its electrical needs. Let's figure that out! 🔌",
        question: "Roughly how big is your home?",
        options: [
          { label: "Under 1,500 sq ft", value: "small" },
          { label: "1,500 - 2,500 sq ft", value: "medium" },
          { label: "2,500 - 4,000 sq ft", value: "large" },
          { label: "Over 4,000 sq ft", value: "xlarge" }
        ],
        field: "homeSqft"
      },
      {
        id: "ac-type",
        question: "What kind of air conditioning do you have?",
        options: [
          { label: "Central AC", value: "central" },
          { label: "Window units", value: "window" },
          { label: "Heat pump", value: "heat_pump" },
          { label: "No AC", value: "none" }
        ],
        field: "acType"
      },
      {
        id: "electric-appliances",
        question: "Do you have any of these? (Pick all that apply, or 'None')",
        options: [
          { label: "Electric stove/range", value: "electric_range" },
          { label: "Electric water heater", value: "electric_wh" },
          { label: "Electric dryer", value: "electric_dryer" },
          { label: "None of these", value: "none" }
        ],
        field: "electricAppliances"
      }
    ],
    "Permit Documents": [
      {
        id: "docs-ready",
        intro: "Almost done! Let's make sure you have everything for the permit office. 📄",
        question: "Do you have a diagram or photo showing your panel layout?",
        options: [
          { label: "Yes, I'll upload it", value: "has_diagram" },
          { label: "No, can you help?", value: "need_help" },
          { label: "What's a panel layout?", value: "explain" }
        ],
        field: "hasDiagram",
        followUp: {
          explain: "A panel layout shows which breaker controls what. Take a photo of your panel with the door open — I'll help you create one!"
        }
      }
    ]
  },
  TAMPA: {
    // Tampa has similar questions but can be customized
    "Panel Specifications": [
      {
        id: "panel-amperage",
        intro: "Let's document your electrical panel for the City of Tampa permit. 📋",
        question: "What's the main breaker size? Check the big switch at the top.",
        options: [
          { label: "100 Amps", value: "100A" },
          { label: "150 Amps", value: "150A" },
          { label: "200 Amps", value: "200A" },
          { label: "I'm not sure", value: "unknown" }
        ],
        field: "amperage"
      },
      {
        id: "panel-brand",
        question: "What brand is the panel?",
        options: [
          { label: "Square D", value: "Square D" },
          { label: "Siemens", value: "Siemens" },
          { label: "Eaton", value: "Eaton" },
          { label: "GE", value: "GE" },
          { label: "Other", value: "other" }
        ],
        field: "manufacturer"
      }
    ],
    "Service Details": [
      {
        id: "service-type",
        intro: "Now let's look at how power gets to your home. 🏠",
        question: "Is your electric service overhead or underground?",
        options: [
          { label: "Overhead (wires from pole)", value: "overhead" },
          { label: "Underground", value: "underground" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "serviceType"
      }
    ],
    "Safety Requirements": [
      {
        id: "ground-visible",
        intro: "Tampa requires specific safety features. Let's check those. ⚡",
        question: "Can you see a grounding rod near your panel?",
        options: [
          { label: "Yes", value: "visible" },
          { label: "No", value: "not_visible" },
          { label: "I'll take a photo", value: "photo" }
        ],
        field: "groundRodVisible"
      }
    ],
    "Final Review": [
      {
        id: "review-ready",
        intro: "Great job! Let's wrap up your permit package. 📄",
        question: "Ready to preview your permit documents?",
        options: [
          { label: "Yes, show me!", value: "ready" },
          { label: "I need to add more photos", value: "more_photos" },
          { label: "Go back and review", value: "review" }
        ],
        field: "reviewStatus"
      }
    ]
  }
};

// Questions for Water Heater permits
const WATER_HEATER_QUESTIONS: { [jurisdiction: string]: ChecklistQuestions } = {
  PINELLAS: {
    "Unit Specifications": [
      {
        id: "wh-type",
        intro: "Let's document your new water heater! This will help speed up your permit. 🚿",
        question: "What type of water heater are you installing?",
        options: [
          { label: "Tank (traditional)", value: "tank" },
          { label: "Tankless", value: "tankless" },
          { label: "Heat pump", value: "heat_pump" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "type"
      },
      {
        id: "wh-fuel",
        question: "What powers the water heater?",
        options: [
          { label: "Electric", value: "electric" },
          { label: "Natural gas", value: "gas" },
          { label: "Propane", value: "propane" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "fuel"
      },
      {
        id: "wh-capacity",
        question: "What's the tank size (or BTU for tankless)?",
        options: [
          { label: "40 gallons", value: "40gal" },
          { label: "50 gallons", value: "50gal" },
          { label: "75 gallons", value: "75gal" },
          { label: "Tankless", value: "tankless" },
          { label: "I'll check the label", value: "photo" }
        ],
        field: "capacity"
      }
    ],
    "Installation Location": [
      {
        id: "wh-location",
        intro: "Where you put the water heater matters for safety codes. 📍",
        question: "Where will the water heater be installed?",
        options: [
          { label: "Garage", value: "garage" },
          { label: "Utility closet", value: "closet" },
          { label: "Outside", value: "exterior" },
          { label: "Attic", value: "attic" },
          { label: "Other location", value: "other" }
        ],
        field: "location"
      },
      {
        id: "wh-pan",
        question: "Will there be a drain pan under the water heater?",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "What's a drain pan?", value: "explain" }
        ],
        field: "hasPan",
        followUp: {
          explain: "A drain pan catches water if the tank leaks. It's required in most indoor locations to protect your home from water damage."
        }
      }
    ],
    "Venting (Gas Units)": [
      {
        id: "wh-venting",
        intro: "If you have a gas water heater, we need to document the venting. 💨",
        question: "How is/will the water heater be vented?",
        options: [
          { label: "Through the roof", value: "roof" },
          { label: "Through the wall (power vent)", value: "wall" },
          { label: "It's electric (no vent)", value: "electric" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "ventType"
      }
    ]
  },
  TAMPA: {
    "Unit Specifications": [
      {
        id: "wh-type",
        intro: "Let's document your water heater for the Tampa permit! 🚿",
        question: "What type of water heater?",
        options: [
          { label: "Tank (traditional)", value: "tank" },
          { label: "Tankless", value: "tankless" },
          { label: "Heat pump", value: "heat_pump" }
        ],
        field: "type"
      },
      {
        id: "wh-fuel",
        question: "Electric or gas?",
        options: [
          { label: "Electric", value: "electric" },
          { label: "Gas", value: "gas" }
        ],
        field: "fuel"
      }
    ],
    "Location & Safety": [
      {
        id: "wh-location",
        intro: "Tampa has specific location requirements. 📍",
        question: "Where is it being installed?",
        options: [
          { label: "Garage", value: "garage" },
          { label: "Inside home", value: "interior" },
          { label: "Outside", value: "exterior" }
        ],
        field: "location"
      }
    ]
  }
};

// Questions for Small Bathroom Remodel permits - Pinellas County
const SMALL_BATH_REMODEL_QUESTIONS: { [jurisdiction: string]: ChecklistQuestions } = {
  PINELLAS: {
    "Scope Assessment": [
      {
        id: "scope-type",
        intro: "Let's figure out your bathroom project! I'll ask a few questions to determine what permits you need. 🛁",
        question: "What work are you doing in this bathroom?",
        options: [
          { label: "Just cosmetic (paint, mirror, towel bars)", value: "cosmetic" },
          { label: "Replacing fixtures in same spots", value: "fixtures_same" },
          { label: "Moving plumbing to new locations", value: "plumbing_move" },
          { label: "Adding or moving electrical", value: "electrical" },
          { label: "Full gut remodel", value: "full" }
        ],
        field: "scopeType",
        legalSource: {
          label: "FBC Section 105.2 - Work Exempt from Permit",
          url: "https://codes.iccsafe.org/content/FLBC2023P1/chapter-1-scope-and-administration#FLBC2023P1_Ch01_Sec105.2",
          description: "Lists work that is exempt from building permits, including minor repairs and cosmetic changes."
        }
      },
      {
        id: "water-damage",
        question: "Is this repair work from water damage?",
        options: [
          { label: "Yes, had a leak or flood", value: "yes" },
          { label: "No, just upgrading", value: "no" }
        ],
        field: "waterDamage"
      }
    ],
    "Plumbing Work": [
      {
        id: "fixture-changes",
        intro: "Let's document any plumbing changes. 🔧",
        question: "Are you changing any plumbing fixtures?",
        options: [
          { label: "Replacing toilet (same spot)", value: "toilet_same" },
          { label: "Replacing sink/vanity (same spot)", value: "sink_same" },
          { label: "Moving toilet or sink to new location", value: "moving" },
          { label: "Adding new fixture", value: "adding" },
          { label: "No plumbing changes", value: "none" }
        ],
        field: "fixtureChanges",
        legalSource: {
          label: "Florida Plumbing Code",
          url: "https://codes.iccsafe.org/content/FLPC2023P1",
          description: "Requirements for plumbing fixtures, drains, water supply, and venting systems."
        }
      },
      {
        id: "drain-work",
        question: "Does this involve cutting into the floor or walls for new drain lines?",
        options: [
          { label: "Yes, new drain routing", value: "yes" },
          { label: "No, using existing drains", value: "no" }
        ],
        field: "drainWork"
      }
    ],
    "Electrical Work": [
      {
        id: "electrical-scope",
        intro: "Let's check on the electrical side of things. ⚡",
        question: "What electrical work is involved?",
        options: [
          { label: "None - keeping existing", value: "none" },
          { label: "Replacing light fixture (same wiring)", value: "light_replace" },
          { label: "Adding new outlet", value: "new_outlet" },
          { label: "Installing exhaust fan", value: "exhaust_fan" },
          { label: "Adding heated floors", value: "heated_floor" }
        ],
        field: "electricalScope",
        legalSource: {
          label: "NEC Article 210.8 - GFCI Protection",
          url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
          description: "Requires GFCI protection for outlets in bathrooms and other wet locations."
        }
      },
      {
        id: "gfci-check",
        question: "Are all outlets near water GFCI protected?",
        options: [
          { label: "Yes, they have Test/Reset buttons", value: "yes" },
          { label: "Not sure - I'll take a photo", value: "photo" },
          { label: "No GFCI currently", value: "no" }
        ],
        field: "hasGfci",
        followUp: {
          no: "GFCI outlets are required by code in all bathrooms. This will need to be addressed as part of your project."
        }
      }
    ],
    "Drywall Repairs": [
      {
        id: "drywall-scope",
        intro: "Let's document any drywall work. 🔨",
        question: "Do you need to repair or replace drywall?",
        options: [
          { label: "No drywall work", value: "none" },
          { label: "Small patch repair (under 4 sq ft)", value: "small_patch" },
          { label: "Replacing one wall section", value: "one_wall" },
          { label: "Multiple walls or ceiling", value: "multiple" }
        ],
        field: "drywallScope"
      },
      {
        id: "drywall-exposure",
        question: "Will the drywall work expose any plumbing or electrical?",
        options: [
          { label: "Yes, pipes/wires will be visible", value: "yes" },
          { label: "No, just surface patching", value: "no" },
          { label: "Not sure", value: "unknown" }
        ],
        field: "exposesUtilities",
        followUp: {
          yes: "If plumbing or electrical will be exposed, those systems need inspection before closing the wall."
        }
      }
    ],
    "Ventilation": [
      {
        id: "vent-type",
        intro: "Bathrooms need proper ventilation to prevent mold. 💨",
        question: "How is the bathroom ventilated?",
        options: [
          { label: "Has window that opens", value: "window" },
          { label: "Has exhaust fan to outside", value: "fan_exterior" },
          { label: "Fan vents to attic", value: "fan_attic" },
          { label: "No fan, no window", value: "none" }
        ],
        field: "ventilationType",
        legalSource: {
          label: "FBC Residential R303 - Ventilation",
          url: "https://codes.iccsafe.org/content/FLRC2023P1/chapter-3-building-planning#FLRC2023P1_Ch03_SecR303",
          description: "Requirements for bathroom ventilation including exhaust fan CFM ratings."
        },
        followUp: {
          fan_attic: "Venting to the attic is not code compliant. The exhaust must vent to the exterior.",
          none: "A bathroom without a window requires a mechanical exhaust fan vented to the exterior."
        }
      }
    ],
    "NOC Requirements": [
      {
        id: "project-value",
        intro: "Almost done! Let's check if you need a Notice of Commencement. 📄",
        question: "What's the estimated total project value?",
        options: [
          { label: "Under $2,500", value: "under_2500" },
          { label: "$2,500 - $5,000", value: "2500_5000" },
          { label: "Over $5,000", value: "over_5000" }
        ],
        field: "projectValue",
        legalSource: {
          label: "Florida Statute 713.13 - Notice of Commencement",
          url: "https://www.flsenate.gov/Laws/Statutes/2023/713.13",
          description: "Requires recording a Notice of Commencement for construction projects over $2,500."
        },
        followUp: {
          over_5000: "You'll need to record a Notice of Commencement with the Pinellas County Clerk before starting work."
        }
      }
    ]
  }
};

// Main export function to get questions for a specific job
export function getChecklistQuestions(
  jobType: string,
  jurisdiction: string
): ChecklistQuestions {
  const questionsByJobType: Record<string, { [jurisdiction: string]: ChecklistQuestions }> = {
    ELECTRICAL_PANEL: ELECTRICAL_PANEL_QUESTIONS,
    WATER_HEATER: WATER_HEATER_QUESTIONS,
    SMALL_BATH_REMODEL: SMALL_BATH_REMODEL_QUESTIONS
  };

  const questionsForType = questionsByJobType[jobType];
  if (!questionsForType) {
    console.warn(`No questions found for job type: ${jobType}`);
    return {};
  }

  const questionsForJurisdiction = questionsForType[jurisdiction];
  if (!questionsForJurisdiction) {
    console.warn(`No questions found for jurisdiction: ${jurisdiction}`);
    return {};
  }

  return questionsForJurisdiction;
}

// Get questions for a specific checklist item
export function getQuestionsForItem(
  jobType: string,
  jurisdiction: string,
  itemTitle: string
): QuestionStep[] {
  const allQuestions = getChecklistQuestions(jobType, jurisdiction);
  return allQuestions[itemTitle] || [];
}

// Get the first incomplete checklist item's questions
export function getFirstIncompleteQuestions(
  jobType: string,
  jurisdiction: string,
  checklistItems: { title: string; status: string }[]
): { itemTitle: string; questions: QuestionStep[] } | null {
  const allQuestions = getChecklistQuestions(jobType, jurisdiction);
  
  for (const item of checklistItems) {
    if (item.status !== "COMPLETE" && allQuestions[item.title]) {
      return {
        itemTitle: item.title,
        questions: allQuestions[item.title]
      };
    }
  }
  
  return null;
}
