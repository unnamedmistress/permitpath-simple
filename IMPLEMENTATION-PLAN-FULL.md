# PermitPath Smart Guided Questions - Full Implementation Plan

**Goal:** Transform PermitPath from basic Q&A into an intelligent permit advisor with:
- ✅ Smart guided questions that adapt based on answers
- ✅ Accurate routing to exact permit portals (city/county)
- ✅ Automatic engineering requirement detection
- ✅ Cost estimates, timelines, and direct application links
- ✅ Pinellas County as the reference implementation

**Timeline:** 3-4 weeks full-time development

---

## 📁 File Structure

```
permitpath-simple/
├── api/
│   ├── health.js                    (existing)
│   ├── location.js                  (existing)
│   ├── permit.js                    (existing - MODIFY)
│   ├── permit-image.js              (existing)
│   └── guided-permit.js             (NEW - main guided flow endpoint)
│
├── public/
│   ├── index.html                   (existing - MAJOR REFACTOR)
│   ├── style.css                    (existing - ADDITIONS)
│   ├── app.js                       (NEW - separate from HTML)
│   └── components/                  (NEW - UI components)
│       ├── question-renderer.js
│       ├── progress-bar.js
│       └── result-display.js
│
├── lib/                             (NEW - core logic)
│   ├── GuidedQuestionEngine.js      (NEW - question flow logic)
│   ├── PermitDatabase.js            (NEW - portal links & rules)
│   ├── EngineeringDetector.js       (NEW - engineering determination)
│   ├── CostEstimator.js             (NEW - cost calculations)
│   └── AnswerGenerator.js           (NEW - enhanced AI prompts)
│
├── data/                            (NEW - permit data)
│   ├── permit-portals.json          (NEW - jurisdiction links)
│   ├── engineering-rules.json       (NEW - state/project rules)
│   ├── question-trees.json          (NEW - project question flows)
│   └── pinellas-county.json         (NEW - Pinellas-specific data)
│
├── locationService.js               (existing)
├── permitService.js                 (existing - MODIFY)
├── server.js                        (existing)
├── package.json                     (existing - ADD DEPENDENCIES)
└── vercel.json                      (existing)
```

---

## 🏗️ Implementation Phases

### Phase 1: Core Architecture (Week 1 - Days 1-5)
**Goal:** Build the foundational guided question engine

#### Day 1: Data Structures & Database
**Tasks:**
1. Create JSON data files with Pinellas County data
2. Build `PermitDatabase.js` class
3. Build `EngineeringDetector.js` class

**Deliverables:**
- `data/permit-portals.json`
- `data/engineering-rules.json`
- `data/pinellas-county.json`
- `lib/PermitDatabase.js`
- `lib/EngineeringDetector.js`

#### Day 2-3: Guided Question Engine
**Tasks:**
1. Create `question-trees.json` with 5 project types
2. Build `GuidedQuestionEngine.js` class
3. Implement conditional question logic
4. Add answer validation

**Deliverables:**
- `data/question-trees.json`
- `lib/GuidedQuestionEngine.js`
- Unit tests for question logic

#### Day 4: Cost Estimator
**Tasks:**
1. Build `CostEstimator.js` class
2. Add Pinellas County fee data
3. Add engineering cost estimates
4. Create cost breakdown formatter

**Deliverables:**
- `lib/CostEstimator.js`
- Cost calculation tests

#### Day 5: Answer Generator
**Tasks:**
1. Build `AnswerGenerator.js` class
2. Create enhanced system prompts with guided context
3. Add metadata enrichment
4. Format actionable next steps

**Deliverables:**
- `lib/AnswerGenerator.js`
- Integration with OpenAI API

---

### Phase 2: API Development (Week 1-2 - Days 6-9)
**Goal:** Create backend endpoints for guided flow

#### Day 6: New API Endpoint
**Tasks:**
1. Create `/api/guided-permit.js`
2. Implement question flow state management
3. Add answer collection endpoints
4. Build result generation endpoint

**Deliverables:**
- `/api/guided-permit.js` (4 endpoints)
- API documentation

#### Day 7: Modify Existing APIs
**Tasks:**
1. Enhance `permitService.js` with guided context
2. Update `/api/permit.js` to use new context
3. Add metadata to responses
4. Backward compatibility for existing calls

**Deliverables:**
- Updated `permitService.js`
- Updated `/api/permit.js`
- Regression tests

#### Day 8-9: Testing & Error Handling
**Tasks:**
1. Test all API endpoints
2. Add comprehensive error handling
3. Create mock data for testing
4. Load testing

**Deliverables:**
- API test suite
- Error handling documentation

---

### Phase 3: Frontend Development (Week 2 - Days 10-14)
**Goal:** Build beautiful UI for guided questions

#### Day 10: UI Component Architecture
**Tasks:**
1. Extract JavaScript from `index.html` to `app.js`
2. Create component structure
3. Build state management
4. Set up event handling

**Deliverables:**
- `public/app.js`
- Component architecture

#### Day 11: Question Components
**Tasks:**
1. Build `question-renderer.js`
2. Support all question types (text, select, multi-select, number)
3. Add input validation
4. Create progress bar component

**Deliverables:**
- `public/components/question-renderer.js`
- `public/components/progress-bar.js`
- CSS for question UI

#### Day 12: Result Display
**Tasks:**
1. Build `result-display.js` component
2. Create rich answer cards
3. Add "Apply Now" buttons with portal links
4. Format engineering requirements
5. Display cost breakdowns
6. Show timeline estimates

**Deliverables:**
- `public/components/result-display.js`
- CSS for result cards

#### Day 13: Refactor Main HTML
**Tasks:**
1. Simplify `index.html`
2. Update to use new components
3. Improve mobile responsiveness
4. Add loading states
5. Polish animations

**Deliverables:**
- Refactored `public/index.html`
- Updated `public/style.css`

#### Day 14: Frontend Testing
**Tasks:**
1. Manual testing of all flows
2. Mobile testing
3. Cross-browser testing
4. Accessibility audit

**Deliverables:**
- QA test results
- Bug fixes

---

### Phase 4: Integration & Enhancement (Week 3 - Days 15-19)
**Goal:** Connect all pieces and enhance with AI

#### Day 15: End-to-End Integration
**Tasks:**
1. Connect frontend to guided API
2. Test complete user flows
3. Fix integration issues
4. Add error recovery

**Deliverables:**
- Working end-to-end flow
- Integration tests

#### Day 16: AI Enhancement
**Tasks:**
1. Fine-tune system prompts with guided context
2. Test AI answer quality
3. Add follow-up question suggestions
4. Improve answer formatting

**Deliverables:**
- Enhanced AI prompts
- Answer quality tests

#### Day 17: City vs County Routing
**Tasks:**
1. Implement jurisdiction detection logic
2. Route to correct permit portal
3. Handle edge cases (border addresses)
4. Add fallback search

**Deliverables:**
- Smart routing logic
- Portal link tests

#### Day 18: Image Upload Integration
**Tasks:**
1. Integrate image upload with guided flow
2. Allow image at question step
3. Pass image context to GPT-4 Vision
4. Display image analysis in results

**Deliverables:**
- Image integration
- Vision API tests

#### Day 19: Polish & Edge Cases
**Tasks:**
1. Handle edge cases
2. Add helpful error messages
3. Create loading states
4. Polish UI/UX

**Deliverables:**
- Edge case handling
- Polish pass

---

### Phase 5: Testing, Documentation & Deployment (Week 3-4 - Days 20-21)
**Goal:** Production-ready release

#### Day 20: Comprehensive Testing
**Tasks:**
1. Full regression testing
2. Performance testing
3. Security audit
4. User acceptance testing

**Deliverables:**
- Test report
- Bug fixes
- Performance report

#### Day 21: Documentation & Deployment
**Tasks:**
1. Write user documentation
2. Create admin guide for adding jurisdictions
3. Deploy to Vercel
4. Monitor deployment
5. Announce launch

**Deliverables:**
- User guide
- Admin documentation
- Production deployment

---

## 📦 Detailed Implementation Specs

### 1. Data Files Specification

#### `data/question-trees.json`

```json
{
  "hot-water-heater": {
    "name": "Hot Water Heater",
    "category": "mechanical",
    "description": "Water heater installation or replacement",
    "icon": "🔥",
    "questions": [
      {
        "id": "replacement",
        "text": "Are you replacing an existing water heater?",
        "type": "yes-no",
        "helpText": "New installation requires more extensive permits",
        "required": true,
        "impact": {
          "no": {
            "levelModifier": 1,
            "note": "New installation requires gas line/electrical work"
          }
        }
      },
      {
        "id": "same-location",
        "text": "Will it be in the same location as the existing one?",
        "type": "yes-no",
        "condition": {
          "field": "replacement",
          "equals": "yes"
        },
        "helpText": "Moving location requires new gas line or venting",
        "required": true,
        "impact": {
          "no": {
            "levelModifier": 1,
            "note": "Relocating requires gas/venting permit"
          }
        }
      },
      {
        "id": "fuel-type",
        "text": "Are you keeping the same fuel type?",
        "type": "select",
        "options": [
          { "value": "same-gas", "label": "Yes, staying with gas" },
          { "value": "same-electric", "label": "Yes, staying with electric" },
          { "value": "gas-to-electric", "label": "Switching from gas to electric" },
          { "value": "electric-to-gas", "label": "Switching from electric to gas" }
        ],
        "helpText": "Fuel conversion requires additional permits",
        "required": true,
        "impact": {
          "gas-to-electric": {
            "levelModifier": 1,
            "permits": ["electrical"],
            "note": "Electrical panel and circuit upgrade may be needed"
          },
          "electric-to-gas": {
            "levelModifier": 1,
            "permits": ["gas", "venting"],
            "note": "Gas line installation and venting required"
          }
        }
      },
      {
        "id": "capacity",
        "text": "What is the capacity of the new water heater?",
        "type": "select",
        "options": [
          { "value": "same-smaller", "label": "Same size or smaller" },
          { "value": "larger", "label": "Larger capacity" }
        ],
        "helpText": "Larger capacity may require service upgrades",
        "required": true,
        "impact": {
          "larger": {
            "note": "Verify electrical/gas service capacity",
            "additionalChecks": ["electrical-service", "gas-line-size"]
          }
        }
      }
    ],
    "baseLevel": 1,
    "typicalCost": {
      "pinellas": {
        "min": 75,
        "max": 150,
        "level1": 75,
        "level2": 200
      }
    }
  },
  
  "bathroom-remodel": {
    "name": "Bathroom Remodel",
    "category": "remodel",
    "description": "Bathroom renovation or remodeling",
    "icon": "🚿",
    "questions": [
      {
        "id": "scope",
        "text": "What changes are you making? (Select all that apply)",
        "type": "multi-select",
        "options": [
          { 
            "value": "cosmetic", 
            "label": "Cosmetic only (tile, paint, fixtures in same spots)",
            "icon": "🎨"
          },
          { 
            "value": "moving-fixtures", 
            "label": "Moving plumbing fixtures (sink, toilet, shower)",
            "icon": "🚰"
          },
          { 
            "value": "removing-walls", 
            "label": "Removing or moving walls",
            "icon": "🔨"
          },
          { 
            "value": "electrical", 
            "label": "Adding outlets, lighting, or electrical",
            "icon": "💡"
          },
          { 
            "value": "expanding", 
            "label": "Expanding the bathroom size",
            "icon": "📐"
          },
          { 
            "value": "hvac", 
            "label": "Changing ventilation or HVAC",
            "icon": "🌬️"
          }
        ],
        "helpText": "Select everything that applies to your project",
        "required": true,
        "minSelections": 1
      },
      {
        "id": "wall-type",
        "text": "Are any of the walls you're removing load-bearing?",
        "type": "select",
        "condition": {
          "field": "scope",
          "contains": "removing-walls"
        },
        "options": [
          { "value": "yes", "label": "Yes, they're load-bearing" },
          { "value": "no", "label": "No, they're not load-bearing" },
          { "value": "unknown", "label": "I'm not sure" }
        ],
        "helpText": "Load-bearing walls support the structure above. If unsure, choose 'I'm not sure' and we'll recommend an engineer assessment.",
        "required": true,
        "impact": {
          "yes": {
            "levelModifier": 2,
            "engineering": true,
            "engineeringReason": "Removing load-bearing walls requires structural calculations for beam sizing and support"
          },
          "unknown": {
            "levelModifier": 1,
            "engineering": true,
            "engineeringReason": "Engineer assessment needed to determine if walls are load-bearing"
          }
        }
      },
      {
        "id": "plumbing-extent",
        "text": "How extensive is the plumbing work?",
        "type": "select",
        "condition": {
          "field": "scope",
          "contains": "moving-fixtures"
        },
        "options": [
          { "value": "minor", "label": "Just replacing fixtures in same locations" },
          { "value": "relocate", "label": "Moving fixtures to new locations (within bathroom)" },
          { "value": "new-fixtures", "label": "Adding new fixtures (extra sink, bidet, etc.)" }
        ],
        "required": true
      },
      {
        "id": "expansion-size",
        "text": "How much are you expanding the bathroom?",
        "type": "select",
        "condition": {
          "field": "scope",
          "contains": "expanding"
        },
        "options": [
          { "value": "small", "label": "Small (under 50 sq ft)" },
          { "value": "medium", "label": "Medium (50-100 sq ft)" },
          { "value": "large", "label": "Large (over 100 sq ft)" }
        ],
        "required": true,
        "impact": {
          "small": { "levelModifier": 2, "engineering": true },
          "medium": { "levelModifier": 2, "engineering": true },
          "large": { "levelModifier": 2, "engineering": true }
        }
      }
    ],
    "baseLevel": 0,
    "determination": {
      "level0": {
        "condition": "scope === ['cosmetic']",
        "permitNeeded": false
      },
      "level2": {
        "condition": "scope.includes('moving-fixtures') && !scope.includes('expanding') && wall-type !== 'yes'",
        "permitNeeded": true,
        "engineering": false
      },
      "level3": {
        "condition": "scope.includes('expanding') || wall-type === 'yes' || wall-type === 'unknown'",
        "permitNeeded": true,
        "engineering": true
      }
    }
  },
  
  "deck": {
    "name": "Deck",
    "category": "exterior",
    "description": "Deck construction or replacement",
    "icon": "🪵",
    "questions": [
      {
        "id": "size",
        "text": "What is the approximate size of the deck?",
        "type": "number",
        "unit": "square feet",
        "placeholder": "e.g., 200",
        "helpText": "Calculate: Length × Width. Example: 10 ft × 20 ft = 200 sq ft",
        "required": true,
        "validation": {
          "min": 1,
          "max": 2000,
          "errorMessage": "Please enter a valid deck size between 1 and 2000 square feet"
        }
      },
      {
        "id": "height",
        "text": "How high will the deck be above the ground?",
        "type": "select",
        "options": [
          { "value": "under-30", "label": "Under 30 inches (about 2.5 feet)" },
          { "value": "30-72", "label": "30 inches to 6 feet" },
          { "value": "over-72", "label": "Over 6 feet" }
        ],
        "helpText": "Measure from ground to top of deck surface. Height affects engineering requirements.",
        "required": true,
        "impact": {
          "over-72": {
            "levelModifier": 2,
            "engineering": true,
            "engineeringReason": "Decks over 6 feet require structural engineering for safety"
          }
        }
      },
      {
        "id": "attached",
        "text": "Will the deck be attached to your house?",
        "type": "yes-no",
        "helpText": "Attached decks connect to the house with a ledger board",
        "required": true
      },
      {
        "id": "second-floor",
        "text": "Is this a second-floor or elevated deck?",
        "type": "yes-no",
        "helpText": "Second-floor decks always require engineering",
        "required": true,
        "impact": {
          "yes": {
            "levelModifier": 3,
            "engineering": true,
            "engineeringReason": "Second-floor decks require comprehensive structural engineering"
          }
        }
      },
      {
        "id": "flood-zone",
        "text": "Is your property in a flood zone (A or V)?",
        "type": "select",
        "options": [
          { "value": "no", "label": "Not in a flood zone" },
          { "value": "yes-a", "label": "Yes, Zone A" },
          { "value": "yes-v", "label": "Yes, Zone V (high velocity)" },
          { "value": "unknown", "label": "I don't know" }
        ],
        "helpText": "Check your FEMA flood map or property documents",
        "required": true,
        "impact": {
          "yes-a": { "additionalRequirements": ["flood-zone-application", "elevation-certificate"] },
          "yes-v": { "additionalRequirements": ["flood-zone-application", "elevation-certificate"], "engineering": true }
        }
      }
    ],
    "baseLevel": 1,
    "determination": {
      "level1": {
        "condition": "size < 200 && height === 'under-30' && !second-floor",
        "engineering": false
      },
      "level2": {
        "condition": "(size >= 200 && size <= 400) || height === '30-72'",
        "engineering": "(size > 200 && attached) || height === '30-72'"
      },
      "level3": {
        "condition": "size > 400 || height === 'over-72' || second-floor",
        "engineering": true
      }
    }
  }
}
```

#### `data/permit-portals.json`

```json
{
  "FL": {
    "Pinellas County": {
      "type": "county",
      "name": "Pinellas County Building Services",
      "jurisdiction": "unincorporated",
      "serviceAreas": [
        "Unincorporated Pinellas County",
        "Belleair Beach",
        "Belleair Shore",
        "Indian Rocks Beach",
        "Kenneth City",
        "Safety Harbor",
        "Oldsmar"
      ],
      "portal": {
        "main": "https://aca-prod.accela.com/PINELLAS/",
        "building": "https://pinellas.gov/building/",
        "forms": "https://pinellas.gov/permitting-guide/",
        "permitSearch": "https://aca-prod.accela.com/PINELLAS/Cap/CapHome.aspx?module=Building",
        "createAccount": "https://aca-prod.accela.com/pinellas/Default.aspx"
      },
      "contact": {
        "phone": "(727) 464-3888",
        "inspections": "(727) 453-4000",
        "email": "buildingservices@pinellas.gov",
        "residential": "(727) 464-3888 ext 3",
        "commercial": "(727) 464-3927",
        "express": "(727) 464-3741"
      },
      "hours": {
        "office": "Monday-Friday 8:00 AM - 5:00 PM",
        "inspectionCutoff": "3:30 PM for next-day service"
      },
      "reviewTimes": {
        "express": {
          "target": "same-day",
          "days": 0
        },
        "residentialSimple": {
          "target": "14 days",
          "days": 14
        },
        "residentialComplex": {
          "target": "14 days",
          "days": 14
        },
        "commercial": {
          "target": "21 days",
          "days": 21
        }
      },
      "permitTypes": {
        "express": {
          "name": "Express Permit",
          "description": "Same-day permits for like-for-like replacements",
          "timeline": "Same day or next business day",
          "cost": { "min": 75, "max": 200 },
          "examples": [
            "Water heater replacement (same location/fuel)",
            "A/C replacement (like-for-like)",
            "Window/door replacement (same size)",
            "Re-roofing (same materials)",
            "Garage door replacement",
            "Electrical service upgrade"
          ],
          "applyUrl": "https://aca-prod.accela.com/PINELLAS/"
        },
        "residential": {
          "name": "Residential Permit",
          "description": "Standard residential construction and remodeling",
          "timeline": "14 days review (target)",
          "cost": { "min": 200, "max": 3000 },
          "requirements": [
            "Sealed plans by FL architect/engineer",
            "Energy code forms",
            "Product approval list",
            "2 surveys/site plans",
            "Habitat permit form (exterior work)",
            "NOC if project > $5,000"
          ],
          "applyUrl": "https://aca-prod.accela.com/PINELLAS/"
        }
      },
      "fees": {
        "express": {
          "waterHeater": 75,
          "hvac": 100,
          "reRoof": 150,
          "windows": 75
        },
        "residential": {
          "minorRemodel": { "min": 300, "max": 600 },
          "bathroomRemodel": { "min": 400, "max": 800 },
          "deck": { "min": 300, "max": 1000 },
          "addition": { "min": 1000, "max": 2500 },
          "newHome": { "min": 3000, "max": 8000 }
        },
        "feeScheduleUrl": "https://pinellascounty.openbook.questica.com/#/budget-book/FY26AdoptedBudget/e44e4cc9-7244-449d-af19-83123b9c6037"
      },
      "specialRequirements": {
        "floodZone": {
          "zones": ["A", "V"],
          "requirements": [
            "Elevation certificate",
            "Flood zone application",
            "Lowest floor = BFE + 1 ft",
            "FEMA 50% rule compliance"
          ]
        },
        "ownerBuilder": {
          "allowed": true,
          "conditions": [
            "1-2 family residence or farm building",
            "Own occupancy (not for sale within 1 year)",
            "Must appear in person with state ID",
            "Full-time onsite supervision required",
            "Licensed contractors still needed for trades"
          ],
          "formUrl": "https://pinellas.gov/services/owner-contractor-affidavit/"
        }
      }
    },
    
    "St. Petersburg": {
      "type": "city",
      "name": "City of St. Petersburg Development Services",
      "jurisdiction": "city-limits",
      "portal": {
        "main": "https://aca-prod.accela.com/STPETE/",
        "building": "https://www.stpete.org/government/departments_offices/development_services/building_permits",
        "forms": "https://www.stpete.org/government/departments_offices/development_services/forms"
      },
      "contact": {
        "phone": "(727) 893-7356",
        "email": "devservices@stpete.org"
      },
      "note": "St. Petersburg has its own permit portal. Properties in St. Pete city limits use this portal, NOT Pinellas County."
    },
    
    "Clearwater": {
      "type": "city",
      "name": "City of Clearwater Building Department",
      "jurisdiction": "city-limits",
      "portal": {
        "main": "https://www.myclearwater.com/government/departments/engineering-services/building-services",
        "apply": "https://aca-prod.accela.com/CLEARWATER/"
      },
      "contact": {
        "phone": "(727) 562-4950",
        "email": "buildingservices@myclearwater.com"
      }
    }
  }
}
```

#### `data/engineering-rules.json`

```json
{
  "global": {
    "alwaysRequired": [
      "Second-story addition",
      "Foundation modifications",
      "Major structural beam/column work",
      "Load-bearing wall removal"
    ],
    "neverRequired": [
      "Cosmetic interior work",
      "Like-for-like replacements",
      "Fence installation (non-retaining)",
      "Minor plumbing fixtures"
    ]
  },
  
  "byState": {
    "FL": {
      "name": "Florida",
      "hurricaneZone": true,
      "seismicZone": false,
      "global": {
        "hurricaneWindLoads": true,
        "productApprovalRequired": true,
        "floodZoneCommon": true
      },
      
      "byProject": {
        "deck": {
          "heightThreshold": 30,
          "heightUnit": "inches",
          "areaThreshold": 200,
          "areaUnit": "square feet",
          "rules": {
            "under30AndUnder200": {
              "engineering": false,
              "note": "Simple permit, no engineering"
            },
            "over30OrOver200Attached": {
              "engineering": true,
              "reason": "Height over 30\" or large attached deck requires structural engineering for ledger board and support calculations"
            },
            "secondFloor": {
              "engineering": true,
              "reason": "Second-floor decks always require comprehensive structural engineering"
            }
          },
          "engineeringCost": {
            "min": 800,
            "max": 2000,
            "typical": 1200
          }
        },
        
        "solar": {
          "engineeringRequired": true,
          "reason": "Florida requires roof load calculations for hurricane wind loads",
          "requirements": [
            "Roof structural analysis",
            "Wind uplift calculations",
            "Electrical calculations"
          ],
          "engineeringCost": {
            "min": 800,
            "max": 2500,
            "typical": 1500
          }
        },
        
        "pool": {
          "engineeringRequired": true,
          "reason": "In-ground pools require structural engineering for hurricane zone",
          "requirements": [
            "Soil report",
            "Foundation engineering",
            "Barrier/fence compliance"
          ],
          "engineeringCost": {
            "min": 1500,
            "max": 3000,
            "typical": 2000
          }
        },
        
        "bathroom-remodel": {
          "triggers": {
            "loadBearingWallRemoval": {
              "engineering": true,
              "reason": "Removing load-bearing walls requires structural calculations for beam sizing and support"
            },
            "unknownWallType": {
              "engineering": true,
              "engineeringType": "assessment",
              "reason": "Engineer assessment needed to determine if walls are load-bearing before removal"
            },
            "expandingFootprint": {
              "engineering": true,
              "reason": "Additions require foundation, framing, and roof engineering"
            }
          },
          "engineeringCost": {
            "assessment": { "min": 200, "max": 500 },
            "beamCalculations": { "min": 500, "max": 1500 },
            "fullAddition": { "min": 1500, "max": 3000 }
          }
        },
        
        "retaining-wall": {
          "heightThreshold": 48,
          "heightUnit": "inches",
          "rules": {
            "under48": {
              "engineering": false,
              "note": "Under 4 ft typically doesn't require engineering"
            },
            "over48": {
              "engineering": true,
              "reason": "Retaining walls over 4 ft require engineering for soil pressure and stability"
            }
          },
          "engineeringCost": {
            "min": 800,
            "max": 2000
          }
        }
      },
      
      "byCounty": {
        "Pinellas": {
          "specificRules": {
            "openings": {
              "threshold": 16,
              "unit": "inches",
              "engineering": true,
              "reason": "Pinellas County requires engineering for all openings 16\" or greater"
            }
          }
        }
      }
    },
    
    "CA": {
      "name": "California",
      "hurricaneZone": false,
      "seismicZone": true,
      "global": {
        "seismicCalculations": true,
        "energyComplianceStrict": true
      },
      
      "byProject": {
        "deck": {
          "heightThreshold": 30,
          "seismicRequired": true,
          "rules": {
            "anyDeck": {
              "engineering": true,
              "reason": "California requires seismic calculations for all decks in most jurisdictions"
            }
          }
        },
        
        "solar": {
          "engineeringRequired": true,
          "reason": "Seismic and roof load calculations required",
          "engineeringCost": {
            "min": 1000,
            "max": 3000,
            "typical": 2000
          }
        }
      }
    }
  }
}
```

---

### 2. Core Classes Specification

#### `lib/GuidedQuestionEngine.js`

```javascript
/**
 * GuidedQuestionEngine
 * Manages question flow with conditional logic
 */
class GuidedQuestionEngine {
  constructor(projectType, questionTrees) {
    this.projectType = projectType;
    this.config = questionTrees[projectType];
    this.answers = {};
    this.questionHistory = [];
    this.currentQuestionIndex = 0;
  }

  /**
   * Get the next question based on current answers
   */
  getNextQuestion() {
    const questions = this.config.questions;
    
    for (let i = this.currentQuestionIndex; i < questions.length; i++) {
      const question = questions[i];
      
      // Check if this question should be shown based on conditions
      if (question.condition && !this.evaluateCondition(question.condition)) {
        continue; // Skip this question
      }
      
      this.currentQuestionIndex = i;
      return {
        question,
        questionNumber: this.questionHistory.length + 1,
        totalQuestions: this.estimateTotalQuestions(),
        progress: this.calculateProgress()
      };
    }
    
    return null; // All questions answered
  }

  /**
   * Evaluate if a condition is met
   */
  evaluateCondition(condition) {
    const { field, equals, contains, notEquals } = condition;
    const answerValue = this.answers[field];
    
    if (equals !== undefined) {
      return answerValue === equals;
    }
    
    if (contains !== undefined) {
      return Array.isArray(answerValue) && answerValue.includes(contains);
    }
    
    if (notEquals !== undefined) {
      return answerValue !== notEquals;
    }
    
    return true;
  }

  /**
   * Record an answer and move to next question
   */
  answerQuestion(questionId, answer, questionData) {
    this.answers[questionId] = answer;
    this.questionHistory.push({
      questionId,
      answer,
      timestamp: new Date()
    });
    
    this.currentQuestionIndex++;
    return this.getNextQuestion();
  }

  /**
   * Validate an answer against question requirements
   */
  validateAnswer(questionId, answer) {
    const question = this.config.questions.find(q => q.id === questionId);
    if (!question) {
      return { valid: false, error: 'Question not found' };
    }

    // Check required
    if (question.required && (answer === null || answer === undefined || answer === '')) {
      return { valid: false, error: 'This question is required' };
    }

    // Check validation rules
    if (question.validation) {
      const { min, max, pattern, errorMessage } = question.validation;
      
      if (question.type === 'number') {
        const num = parseFloat(answer);
        if (isNaN(num)) {
          return { valid: false, error: 'Please enter a valid number' };
        }
        if (min !== undefined && num < min) {
          return { valid: false, error: errorMessage || `Minimum value is ${min}` };
        }
        if (max !== undefined && num > max) {
          return { valid: false, error: errorMessage || `Maximum value is ${max}` };
        }
      }
      
      if (pattern && !new RegExp(pattern).test(answer)) {
        return { valid: false, error: errorMessage || 'Invalid format' };
      }
    }

    // Check multi-select min selections
    if (question.type === 'multi-select' && question.minSelections) {
      if (!Array.isArray(answer) || answer.length < question.minSelections) {
        return { 
          valid: false, 
          error: `Please select at least ${question.minSelections} option(s)` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate current progress percentage
   */
  calculateProgress() {
    const totalEstimated = this.estimateTotalQuestions();
    const current = this.questionHistory.length;
    return Math.round((current / totalEstimated) * 100);
  }

  /**
   * Estimate total questions based on current answers
   */
  estimateTotalQuestions() {
    let total = 0;
    for (const question of this.config.questions) {
      if (!question.condition || this.evaluateCondition(question.condition)) {
        total++;
      }
    }
    return Math.max(total, this.config.questions.length * 0.6); // Estimate at least 60%
  }

  /**
   * Get summary of all answers
   */
  getSummary() {
    return {
      projectType: this.projectType,
      projectName: this.config.name,
      answers: this.answers,
      questionHistory: this.questionHistory,
      timestamp: new Date()
    };
  }

  /**
   * Allow editing previous answer
   */
  goBackToQuestion(questionId) {
    const index = this.questionHistory.findIndex(h => h.questionId === questionId);
    if (index === -1) {
      return { success: false, error: 'Question not found in history' };
    }

    // Remove this and all subsequent answers
    this.questionHistory = this.questionHistory.slice(0, index);
    
    // Rebuild answers object
    this.answers = {};
    for (const entry of this.questionHistory) {
      this.answers[entry.questionId] = entry.answer;
    }

    // Set current index to this question
    this.currentQuestionIndex = this.config.questions.findIndex(q => q.id === questionId);
    
    return { success: true, question: this.getNextQuestion() };
  }

  /**
   * Get all questions and answers for review
   */
  getReviewSummary() {
    return this.questionHistory.map(entry => {
      const question = this.config.questions.find(q => q.id === entry.questionId);
      return {
        question: question.text,
        answer: this.formatAnswer(entry.answer, question),
        questionId: entry.questionId
      };
    });
  }

  /**
   * Format answer for display
   */
  formatAnswer(answer, question) {
    if (question.type === 'yes-no') {
      return answer === 'yes' ? 'Yes' : 'No';
    }
    
    if (question.type === 'select') {
      const option = question.options.find(opt => opt.value === answer);
      return option ? option.label : answer;
    }
    
    if (question.type === 'multi-select') {
      return answer.map(val => {
        const option = question.options.find(opt => opt.value === val);
        return option ? option.label : val;
      }).join(', ');
    }
    
    if (question.type === 'number' && question.unit) {
      return `${answer} ${question.unit}`;
    }
    
    return answer;
  }
}

module.exports = GuidedQuestionEngine;
```

#### `lib/PermitDatabase.js`

```javascript
/**
 * PermitDatabase
 * Access permit portal data and jurisdiction information
 */
class PermitDatabase {
  constructor(permitPortals) {
    this.portals = permitPortals;
  }

  /**
   * Get permit portal for a location
   */
  getPortal(location) {
    const state = location.stateShort;
    const jurisdiction = location.likelyCityLimits ? location.city : location.county;
    
    // Check state exists
    if (!this.portals[state]) {
      return {
        found: false,
        reason: 'state-not-found',
        searchUrl: this.generateSearchUrl(location)
      };
    }

    // Check if city has its own portal (priority)
    if (location.likelyCityLimits && this.portals[state][location.city]) {
      return {
        found: true,
        type: 'city',
        jurisdiction: location.city,
        portal: this.portals[state][location.city],
        source: 'database'
      };
    }

    // Check county portal
    if (this.portals[state][location.county]) {
      const countyPortal = this.portals[state][location.county];
      
      // Check if city is served by county
      if (location.likelyCityLimits && countyPortal.serviceAreas) {
        if (countyPortal.serviceAreas.includes(location.city)) {
          return {
            found: true,
            type: 'county-services-city',
            jurisdiction: location.county,
            city: location.city,
            portal: countyPortal,
            note: `${location.city} building permits are handled by ${location.county}`,
            source: 'database'
          };
        } else {
          return {
            found: false,
            reason: 'city-not-in-county-service-area',
            possiblePortal: countyPortal,
            note: `${location.city} may have its own permit portal. Please verify.`,
            searchUrl: this.generateSearchUrl(location)
          };
        }
      }

      // Unincorporated area
      return {
        found: true,
        type: 'county',
        jurisdiction: location.county,
        portal: countyPortal,
        source: 'database'
      };
    }

    // No portal found
    return {
      found: false,
      reason: 'jurisdiction-not-found',
      searchUrl: this.generateSearchUrl(location)
    };
  }

  /**
   * Generate search URL for unknown jurisdictions
   */
  generateSearchUrl(location) {
    const jurisdiction = location.likelyCityLimits ? location.city : location.county;
    const query = `${jurisdiction} ${location.stateShort} building permit application`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  /**
   * Get permit type info for a jurisdiction
   */
  getPermitTypeInfo(location, permitLevel) {
    const portalData = this.getPortal(location);
    if (!portalData.found || !portalData.portal.permitTypes) {
      return null;
    }

    const permitTypes = portalData.portal.permitTypes;
    
    switch (permitLevel) {
      case 0:
        return null; // No permit needed
      case 1:
        return permitTypes.express || null;
      case 2:
      case 3:
        return permitTypes.residential || permitTypes.commercial || null;
      default:
        return null;
    }
  }

  /**
   * Get fee estimate for a project
   */
  getFeeEstimate(location, projectType, permitLevel) {
    const portalData = this.getPortal(location);
    if (!portalData.found || !portalData.portal.fees) {
      return null;
    }

    const fees = portalData.portal.fees;
    
    // Try to get specific project fee
    if (fees.express && fees.express[projectType]) {
      return {
        amount: fees.express[projectType],
        type: 'fixed',
        category: 'express'
      };
    }

    if (fees.residential && fees.residential[projectType]) {
      return {
        min: fees.residential[projectType].min,
        max: fees.residential[projectType].max,
        type: 'range',
        category: 'residential'
      };
    }

    // Fallback to general ranges
    if (permitLevel === 1 && fees.express) {
      return {
        min: 75,
        max: 200,
        type: 'range',
        category: 'express',
        note: 'Typical express permit range'
      };
    }

    if ((permitLevel === 2 || permitLevel === 3) && fees.residential) {
      return {
        min: 300,
        max: 3000,
        type: 'range',
        category: 'residential',
        note: 'Varies by project scope'
      };
    }

    return null;
  }

  /**
   * Get review timeline estimate
   */
  getReviewTimeline(location, permitLevel) {
    const portalData = this.getPortal(location);
    if (!portalData.found || !portalData.portal.reviewTimes) {
      return null;
    }

    const times = portalData.portal.reviewTimes;
    
    switch (permitLevel) {
      case 1:
        return times.express || { target: 'same-day', days: 0 };
      case 2:
        return times.residentialSimple || times.commercial || { target: '2-3 weeks', days: 14 };
      case 3:
        return times.residentialComplex || times.commercial || { target: '3-4 weeks', days: 21 };
      default:
        return null;
    }
  }

  /**
   * Get contact information
   */
  getContactInfo(location) {
    const portalData = this.getPortal(location);
    if (!portalData.found || !portalData.portal.contact) {
      return null;
    }

    return portalData.portal.contact;
  }

  /**
   * Get special requirements for a jurisdiction
   */
  getSpecialRequirements(location) {
    const portalData = this.getPortal(location);
    if (!portalData.found || !portalData.portal.specialRequirements) {
      return {};
    }

    return portalData.portal.specialRequirements;
  }
}

module.exports = PermitDatabase;
```

#### `lib/EngineeringDetector.js`

```javascript
/**
 * EngineeringDetector
 * Determines if engineering is required based on project details
 */
class EngineeringDetector {
  constructor(engineeringRules) {
    this.rules = engineeringRules;
  }

  /**
   * Main method to determine if engineering is required
   */
  isRequired(projectType, answers, location) {
    const state = location.stateShort;
    const county = location.county;

    // Check global always-required triggers
    const globalCheck = this.checkGlobalRules(answers);
    if (globalCheck.required) {
      return globalCheck;
    }

    // Check state-specific rules
    const stateRules = this.rules.byState[state];
    if (!stateRules) {
      return {
        required: false,
        confidence: 'low',
        note: 'No specific rules for this state. Contact local building department.'
      };
    }

    // Check project-specific rules
    const projectRules = stateRules.byProject[projectType];
    if (projectRules && projectRules.engineeringRequired === true) {
      return {
        required: true,
        reason: projectRules.reason,
        requirements: projectRules.requirements || [],
        cost: projectRules.engineeringCost,
        confidence: 'high'
      };
    }

    // Check detailed rules based on answers
    if (projectRules && projectRules.rules) {
      const rulesCheck = this.evaluateProjectRules(projectRules.rules, answers);
      if (rulesCheck) {
        return {
          ...rulesCheck,
          cost: projectRules.engineeringCost
        };
      }
    }

    // Check triggers (for remodels, etc.)
    if (projectRules && projectRules.triggers) {
      const triggerCheck = this.checkTriggers(projectRules.triggers, answers);
      if (triggerCheck.required) {
        return {
          ...triggerCheck,
          cost: projectRules.engineeringCost[triggerCheck.costKey] || projectRules.engineeringCost
        };
      }
    }

    // Check county-specific rules
    if (stateRules.byCounty && stateRules.byCounty[county]) {
      const countyCheck = this.checkCountyRules(stateRules.byCounty[county], answers);
      if (countyCheck.required) {
        return countyCheck;
      }
    }

    // Default: not required
    return {
      required: false,
      confidence: 'high',
      note: 'Based on the information provided, engineering is not required.'
    };
  }

  /**
   * Check global always-required rules
   */
  checkGlobalRules(answers) {
    const alwaysRequired = this.rules.global.alwaysRequired || [];
    
    // Check for keywords in answers
    const answerString = JSON.stringify(answers).toLowerCase();
    for (const keyword of alwaysRequired) {
      if (answerString.includes(keyword.toLowerCase())) {
        return {
          required: true,
          reason: `${keyword} always requires engineering`,
          confidence: 'high'
        };
      }
    }

    return { required: false };
  }

  /**
   * Evaluate project-specific rules
   */
  evaluateProjectRules(rules, answers) {
    // Deck example
    if (answers.height === 'over-72' && rules.over30OrOver200Attached) {
      return {
        required: true,
        reason: rules.over30OrOver200Attached.reason,
        confidence: 'high'
      };
    }

    if (answers['second-floor'] === 'yes' && rules.secondFloor) {
      return {
        required: true,
        reason: rules.secondFloor.reason,
        confidence: 'high'
      };
    }

    if (answers.size >= 200 && answers.attached === 'yes' && rules.over30OrOver200Attached) {
      return {
        required: true,
        reason: rules.over30OrOver200Attached.reason,
        confidence: 'medium'
      };
    }

    return null;
  }

  /**
   * Check engineering triggers (for remodels)
   */
  checkTriggers(triggers, answers) {
    // Check load-bearing wall removal
    if (answers['wall-type'] === 'yes' && triggers.loadBearingWallRemoval) {
      return {
        required: true,
        reason: triggers.loadBearingWallRemoval.reason,
        confidence: 'high',
        costKey: 'beamCalculations'
      };
    }

    if (answers['wall-type'] === 'unknown' && triggers.unknownWallType) {
      return {
        required: true,
        engineeringType: 'assessment',
        reason: triggers.unknownWallType.reason,
        confidence: 'medium',
        costKey: 'assessment'
      };
    }

    // Check footprint expansion
    if (answers.scope && answers.scope.includes('expanding') && triggers.expandingFootprint) {
      return {
        required: true,
        reason: triggers.expandingFootprint.reason,
        confidence: 'high',
        costKey: 'fullAddition'
      };
    }

    return { required: false };
  }

  /**
   * Check county-specific rules
   */
  checkCountyRules(countyRules, answers) {
    if (countyRules.specificRules) {
      // Example: Pinellas County opening rule
      if (countyRules.specificRules.openings) {
        const openingRule = countyRules.specificRules.openings;
        // This would need specific logic based on plans
        // For now, just note it as a requirement
        return {
          required: false,
          note: `Note: ${openingRule.reason}`
        };
      }
    }

    return { required: false };
  }

  /**
   * Get engineering cost estimate
   */
  getCostEstimate(engineeringResult) {
    if (!engineeringResult.required || !engineeringResult.cost) {
      return null;
    }

    const cost = engineeringResult.cost;
    
    if (typeof cost === 'number') {
      return {
        amount: cost,
        type: 'fixed',
        formatted: `$${cost.toLocaleString()}`
      };
    }

    if (cost.min && cost.max) {
      return {
        min: cost.min,
        max: cost.max,
        typical: cost.typical || Math.round((cost.min + cost.max) / 2),
        type: 'range',
        formatted: `$${cost.min.toLocaleString()} - $${cost.max.toLocaleString()}`,
        typicalFormatted: cost.typical ? `$${cost.typical.toLocaleString()}` : null
      };
    }

    return null;
  }

  /**
   * Get timeline estimate for engineering
   */
  getEngineeringTimeline(engineeringResult) {
    if (!engineeringResult.required) {
      return null;
    }

    const type = engineeringResult.engineeringType || 'full';
    
    const timelines = {
      assessment: {
        weeks: 1,
        description: '1 week for engineer site visit and assessment'
      },
      beamCalculations: {
        weeks: 2,
        description: '1-2 weeks for beam calculations and sealed plans'
      },
      full: {
        weeks: 3,
        description: '2-3 weeks for complete structural engineering'
      }
    };

    return timelines[type] || timelines.full;
  }

  /**
   * Generate explanation for user
   */
  explainRequirement(engineeringResult, location) {
    if (!engineeringResult.required) {
      return {
        title: '✅ Engineering Not Required',
        message: 'Based on your project details, a licensed engineer is not needed.',
        explanation: 'You can proceed with standard permit application.',
        nextSteps: []
      };
    }

    const costEstimate = this.getCostEstimate(engineeringResult);
    const timeline = this.getEngineeringTimeline(engineeringResult);

    return {
      title: '🔧 Licensed Engineer Required',
      message: engineeringResult.reason,
      explanation: `A licensed structural engineer must review your project, perform calculations, and create stamped/sealed drawings. This is required by ${location.city || location.county} building code.`,
      requirements: engineeringResult.requirements || [
        'Site visit and assessment',
        'Structural calculations',
        'Sealed engineering drawings',
        'Submission with permit application'
      ],
      cost: costEstimate,
      timeline: timeline,
      nextSteps: [
        {
          step: 1,
          action: `Hire licensed structural engineer`,
          detail: costEstimate ? costEstimate.formatted : '$500-3,000',
          tip: 'Look for engineers with residential experience in your area'
        },
        {
          step: 2,
          action: 'Engineer site visit and plans review',
          detail: timeline ? `${timeline.weeks} week(s)` : '1-3 weeks'
        },
        {
          step: 3,
          action: 'Receive sealed engineering drawings',
          detail: 'Engineer stamps and signs plans'
        },
        {
          step: 4,
          action: 'Submit engineered plans with permit',
          detail: 'Include engineering with permit application'
        }
      ],
      findEngineer: {
        searchQuery: `structural engineer ${location.city || location.county} ${location.stateShort}`,
        searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`structural engineer ${location.city || location.county} ${location.stateShort}`)}`
      }
    };
  }
}

module.exports = EngineeringDetector;
```

---

### 3. API Endpoint Specification

#### `/api/guided-permit.js`

```javascript
const GuidedQuestionEngine = require('../lib/GuidedQuestionEngine');
const PermitDatabase = require('../lib/PermitDatabase');
const EngineeringDetector = require('../lib/EngineeringDetector');
const PermitService = require('../permitService');

// Load data files
const questionTrees = require('../data/question-trees.json');
const permitPortals = require('../data/permit-portals.json');
const engineeringRules = require('../data/engineering-rules.json');

// Initialize services
const permitDB = new PermitDatabase(permitPortals);
const engineeringDetector = new EngineeringDetector(engineeringRules);

// In-memory session storage (for serverless, use Redis or database in production)
const sessions = new Map();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, sessionId, projectType, answer, questionId, location } = req.body || {};

  try {
    // START: Initialize new session
    if (action === 'start' && req.method === 'POST') {
      if (!projectType || !location) {
        return res.status(400).json({ 
          error: 'Missing required fields: projectType, location' 
        });
      }

      const newSessionId = generateSessionId();
      const engine = new GuidedQuestionEngine(projectType, questionTrees);
      
      sessions.set(newSessionId, {
        engine,
        projectType,
        location,
        startedAt: new Date()
      });

      const firstQuestion = engine.getNextQuestion();
      
      return res.status(200).json({
        sessionId: newSessionId,
        projectType,
        projectName: questionTrees[projectType].name,
        ...firstQuestion
      });
    }

    // ANSWER: Submit answer and get next question
    if (action === 'answer' && req.method === 'POST') {
      if (!sessionId || !questionId || answer === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: sessionId, questionId, answer' 
        });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const { engine } = session;

      // Validate answer
      const validation = engine.validateAnswer(questionId, answer);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: validation.error,
          questionId
        });
      }

      // Record answer
      const nextQuestion = engine.answerQuestion(questionId, answer);
      
      if (nextQuestion) {
        // More questions remain
        return res.status(200).json({
          hasMore: true,
          ...nextQuestion
        });
      } else {
        // All questions answered - generate result
        const result = await generatePermitResult(
          engine,
          session.location,
          permitDB,
          engineeringDetector
        );
        
        return res.status(200).json({
          hasMore: false,
          complete: true,
          result
        });
      }
    }

    // BACK: Go back to previous question
    if (action === 'back' && req.method === 'POST') {
      if (!sessionId || !questionId) {
        return res.status(400).json({ 
          error: 'Missing required fields: sessionId, questionId' 
        });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const result = session.engine.goBackToQuestion(questionId);
      
      return res.status(200).json(result);
    }

    // REVIEW: Get summary of all answers for review
    if (action === 'review' && req.method === 'GET') {
      const urlSessionId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('sessionId');
      
      if (!urlSessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      const session = sessions.get(urlSessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const summary = session.engine.getReviewSummary();
      
      return res.status(200).json({
        projectType: session.projectType,
        location: session.location,
        answers: summary
      });
    }

    // Invalid action
    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('[Guided Permit] Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to process guided permit request'
    });
  }
};

/**
 * Generate final permit result from answers
 */
async function generatePermitResult(engine, location, permitDB, engineeringDetector) {
  const summary = engine.getSummary();
  const projectType = summary.projectType;
  const answers = summary.answers;

  // Determine permit level (0-3)
  const permitLevel = determinePermitLevel(projectType, answers, questionTrees[projectType]);

  // Get portal information
  const portalData = permitDB.getPortal(location);

  // Check engineering requirements
  const engineeringResult = engineeringDetector.isRequired(projectType, answers, location);
  const engineeringExplanation = engineeringDetector.explainRequirement(engineeringResult, location);

  // Get cost estimate
  const permitFee = permitDB.getFeeEstimate(location, projectType, permitLevel);
  const engineeringCost = engineeringDetector.getCostEstimate(engineeringResult);

  // Get timeline
  const reviewTimeline = permitDB.getReviewTimeline(location, permitLevel);
  const engineeringTimeline = engineeringDetector.getEngineeringTimeline(engineeringResult);

  // Get contact info
  const contact = permitDB.getContactInfo(location);

  // Generate AI-enhanced answer
  const aiAnswer = await generateAIAnswer(
    summary,
    location,
    permitLevel,
    portalData,
    engineeringExplanation,
    permitFee,
    reviewTimeline
  );

  return {
    permitNeeded: permitLevel > 0,
    permitLevel,
    permitLevelName: getPermitLevelName(permitLevel),
    projectType,
    answers: engine.getReviewSummary(),
    
    jurisdiction: {
      type: portalData.type,
      name: portalData.jurisdiction,
      state: location.state
    },
    
    portal: portalData.found ? {
      mainUrl: portalData.portal.portal.main,
      applyUrl: portalData.portal.portal.main,
      formsUrl: portalData.portal.portal.forms,
      searchUrl: portalData.portal.portal.permitSearch
    } : {
      searchUrl: portalData.searchUrl,
      note: 'Direct portal link not available. Click to search for your jurisdiction.'
    },
    
    engineering: {
      required: engineeringResult.required,
      ...engineeringExplanation,
      cost: engineeringCost,
      timeline: engineeringTimeline
    },
    
    cost: {
      permit: permitFee,
      engineering: engineeringCost,
      total: calculateTotalCost(permitFee, engineeringCost)
    },
    
    timeline: {
      review: reviewTimeline,
      engineering: engineeringTimeline,
      total: calculateTotalTimeline(reviewTimeline, engineeringTimeline)
    },
    
    contact: contact,
    
    aiAnswer: aiAnswer.answer,
    
    nextSteps: generateNextSteps(
      permitLevel,
      portalData,
      engineeringResult,
      location
    ),
    
    timestamp: new Date().toISOString()
  };
}

/**
 * Determine permit level from answers
 */
function determinePermitLevel(projectType, answers, config) {
  // Check config determination rules
  if (config.determination) {
    for (const [level, rule] of Object.entries(config.determination)) {
      if (evaluateDeterminationRule(rule, answers)) {
        return parseInt(level.replace('level', ''));
      }
    }
  }

  // Fallback to base level
  return config.baseLevel || 1;
}

/**
 * Evaluate determination rule
 */
function evaluateDeterminationRule(rule, answers) {
  // Simple eval (in production, use a proper expression evaluator)
  try {
    const condition = rule.condition;
    // This is simplified - in production, use a safe expression evaluator
    return eval(condition.replace(/(\w+)/g, match => {
      if (match === 'scope' || match === 'wallType' || match === 'height' || match === 'size') {
        return JSON.stringify(answers[match] || answers[match.replace(/([A-Z])/g, '-$1').toLowerCase()]);
      }
      return match;
    }));
  } catch (e) {
    return false;
  }
}

/**
 * Get permit level name
 */
function getPermitLevelName(level) {
  const names = {
    0: 'No Permit Required',
    1: 'Express Permit',
    2: 'Standard Permit',
    3: 'Complex Permit with Engineering'
  };
  return names[level] || 'Unknown';
}

/**
 * Generate AI-enhanced answer
 */
async function generateAIAnswer(summary, location, permitLevel, portalData, engineeringExplanation, permitFee, reviewTimeline) {
  const permitService = new PermitService(process.env.OPENAI_API_KEY);
  
  const systemPrompt = `You are a building permit expert. Provide clear, actionable guidance.

PROJECT: ${summary.projectName}
ANSWERS: ${JSON.stringify(summary.answers, null, 2)}

LOCATION: ${location.fullAddress}
JURISDICTION: ${portalData.jurisdiction || location.county}

PERMIT LEVEL: ${getPermitLevelName(permitLevel)}
${permitLevel === 0 ? 'NO PERMIT REQUIRED' : ''}

${portalData.found ? `
APPLY HERE: ${portalData.portal.portal.main}
CONTACT: ${portalData.portal.contact.phone}
` : ''}

ENGINEERING: ${engineeringExplanation.title}
${engineeringExplanation.message}

COST: ${permitFee ? `$${permitFee.min}-$${permitFee.max}` : 'Contact jurisdiction'}
TIMELINE: ${reviewTimeline ? reviewTimeline.target : 'Contact jurisdiction'}

Provide a clear, friendly answer with:
1. YES/NO - Do they need a permit?
2. WHY - Brief explanation
3. WHAT TYPE - Express, Standard, Complex
4. COST - Fee estimate
5. TIMELINE - How long
6. ENGINEERING - Required? Why? Cost?
7. NEXT STEPS - Exact actions with links

Use simple language and emoji. Be specific to this location.`;

  const userPrompt = 'Based on my answers, what do I need to do to get my permit?';

  try {
    const response = await permitService.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    return {
      answer: response.choices[0].message.content,
      model: 'gpt-4o-mini',
      tokens: response.usage.total_tokens
    };
  } catch (error) {
    console.error('[AI Answer] Error:', error);
    // Return a basic answer if AI fails
    return {
      answer: generateBasicAnswer(summary, permitLevel, portalData, engineeringExplanation),
      model: 'fallback',
      error: error.message
    };
  }
}

/**
 * Generate basic answer without AI
 */
function generateBasicAnswer(summary, permitLevel, portalData, engineeringExplanation) {
  if (permitLevel === 0) {
    return `✅ **Good news! No permit required** for ${summary.projectName}.\n\nYou can proceed with your project without a building permit. However, make sure to follow any zoning regulations that may apply.`;
  }

  const permitName = getPermitLevelName(permitLevel);
  const engineeringText = engineeringExplanation.required 
    ? `\n\n🔧 **Engineering Required:** ${engineeringExplanation.message}` 
    : '';

  return `📋 **${permitName} Required**\n\nFor your ${summary.projectName} project, you need to apply for a ${permitName}.${engineeringText}\n\n${portalData.found ? `**Apply here:** ${portalData.portal.portal.main}` : '**Contact your local building department for application details.**'}`;
}

/**
 * Generate next steps
 */
function generateNextSteps(permitLevel, portalData, engineeringResult, location) {
  const steps = [];

  if (permitLevel === 0) {
    steps.push({
      step: 1,
      action: 'No permit needed!',
      detail: 'You can start your project.',
      icon: '✅'
    });
    return steps;
  }

  if (engineeringResult.required) {
    steps.push(...engineeringResult.nextSteps);
  } else {
    if (portalData.found) {
      steps.push({
        step: 1,
        action: 'Create permit portal account',
        detail: `Visit ${portalData.portal.name}`,
        link: portalData.portal.portal.main,
        icon: '👤'
      });

      steps.push({
        step: 2,
        action: 'Gather required documents',
        detail: 'Plans, surveys, forms as listed above',
        icon: '📄'
      });

      steps.push({
        step: 3,
        action: 'Submit permit application online',
        detail: 'Upload all documents and pay fee',
        link: portalData.portal.portal.main,
        icon: '📤'
      });

      steps.push({
        step: 4,
        action: 'Wait for review',
        detail: 'Check portal for status updates',
        icon: '⏰'
      });

      steps.push({
        step: 5,
        action: 'Address any corrections',
        detail: 'Respond to reviewer comments if needed',
        icon: '✏️'
      });

      steps.push({
        step: 6,
        action: 'Receive permit approval',
        detail: 'Print permit and post at job site',
        icon: '✅'
      });

      steps.push({
        step: 7,
        action: 'Schedule inspections',
        detail: `Call ${portalData.portal.contact.inspections} before 3:30 PM`,
        icon: '🔍'
      });
    } else {
      steps.push({
        step: 1,
        action: 'Contact local building department',
        detail: `Search for ${location.city || location.county} building permits`,
        link: portalData.searchUrl,
        icon: '🔍'
      });
    }
  }

  return steps;
}

/**
 * Calculate total cost
 */
function calculateTotalCost(permitFee, engineeringCost) {
  if (!permitFee && !engineeringCost) return null;

  const permitMin = permitFee?.min || permitFee?.amount || 0;
  const permitMax = permitFee?.max || permitFee?.amount || 0;
  const engMin = engineeringCost?.min || engineeringCost?.amount || 0;
  const engMax = engineeringCost?.max || engineeringCost?.amount || 0;

  return {
    min: permitMin + engMin,
    max: permitMax + engMax,
    formatted: `$${(permitMin + engMin).toLocaleString()} - $${(permitMax + engMax).toLocaleString()}`
  };
}

/**
 * Calculate total timeline
 */
function calculateTotalTimeline(reviewTimeline, engineeringTimeline) {
  const reviewDays = reviewTimeline?.days || 0;
  const engWeeks = engineeringTimeline?.weeks || 0;
  const engDays = engWeeks * 7;

  const totalDays = reviewDays + engDays;
  const totalWeeks = Math.ceil(totalDays / 7);

  return {
    days: totalDays,
    weeks: totalWeeks,
    formatted: `${totalWeeks} weeks`,
    breakdown: {
      engineering: engineeringTimeline ? `${engWeeks} weeks` : null,
      review: reviewTimeline ? reviewTimeline.target : null
    }
  };
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## ⏰ Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Core Architecture** | 5 days | Data files, core classes, question engine |
| **Phase 2: API Development** | 4 days | Guided API endpoint, enhanced permit service |
| **Phase 3: Frontend Development** | 5 days | UI components, refactored HTML, styling |
| **Phase 4: Integration** | 5 days | End-to-end flow, AI enhancement, polish |
| **Phase 5: Testing & Deploy** | 2 days | QA, documentation, production deployment |
| **TOTAL** | **21 days** | Full production system |

---

## 🚀 Getting Started

### Immediate Next Steps:

1. **Review this plan** - Any questions or changes?
2. **Set priorities** - Which 5 project types to implement first?
3. **Gather data** - Any additional jurisdictions to add?
4. **Start Phase 1** - Begin with data files and core classes

### Ready to begin?

Say "start Phase 1" and I'll begin implementing:
- `data/question-trees.json` with your top 5 projects
- `data/permit-portals.json` with Pinellas County + others
- `data/engineering-rules.json` with state rules
- `lib/GuidedQuestionEngine.js`
- `lib/PermitDatabase.js`
- `lib/EngineeringDetector.js`

Let me know when you're ready! 🎯
