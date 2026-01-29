# Guided Questions & Smart Permit Routing - Research & Implementation Plan

## Executive Summary

Transform PermitPath from a simple Q&A tool into an intelligent permit advisor that:
1. **Asks the right follow-up questions** based on project complexity
2. **Routes users to exact permit applications** (city/county specific)
3. **Determines engineering requirements** automatically
4. **Provides targeted, actionable guidance**

---

## 1. Research: How Permit Complexity Works

### 1.1 Permit Complexity Levels

**Level 0: NO PERMIT NEEDED**
- Interior cosmetic work (paint, flooring, cabinets)
- Minor repairs (like-for-like replacement)
- Landscaping (non-structural)
- **Decision factors:** No structural/electrical/plumbing changes

**Level 1: SIMPLE PERMIT (Over-the-Counter)**
- Hot water heater replacement (same size/location/type)
- HVAC replacement (same capacity)
- Window/door replacement (same size opening)
- Electrical outlet/switch replacement
- **Decision factors:** Like-for-like, no structural changes, no load changes
- **Timeline:** Same-day or 1-3 days
- **Cost:** $50-200
- **Engineering:** Not required

**Level 2: STANDARD PERMIT (Plan Review Required)**
- Bathroom remodel (moving fixtures)
- Kitchen remodel (moving appliances)
- Fence over 6ft
- Deck under 200 sq ft
- Shed under 200 sq ft
- Re-roofing (same materials)
- **Decision factors:** Layout changes, multiple trades, but predictable scope
- **Timeline:** 2-4 weeks review
- **Cost:** $200-1,000
- **Engineering:** Sometimes (structural changes, load-bearing walls)

**Level 3: COMPLEX PERMIT (Full Engineering Required)**
- Room addition
- Structural modifications (removing walls)
- Foundation work
- Second story addition
- Pool (in-ground)
- Solar installation (structural)
- Major electrical service upgrade
- **Decision factors:** Structural calculations, multiple inspections, engineering seals
- **Timeline:** 4-8 weeks review
- **Cost:** $1,000-5,000+
- **Engineering:** Always required

### 1.2 Key Decision Points for Each Project Type

#### Hot Water Heater Replacement
```
Q1: Are you replacing an existing water heater?
  → YES: Continue
  → NO: New installation = Level 2+

Q2: Same location as existing?
  → YES: Continue
  → NO: New location = Level 2 (gas line/venting)

Q3: Same fuel type (gas/electric)?
  → YES: Continue
  → NO: Fuel conversion = Level 2 (gas line permit)

Q4: Same or smaller capacity?
  → YES: Level 1 (Simple)
  → NO: Larger = check gas/electrical capacity (Level 2)

RESULT: Level 1 - Simple permit, no engineering
```

#### Bathroom Remodel
```
Q1: Are you moving any plumbing fixtures?
  → NO: Cosmetic only = Level 0
  → YES: Continue

Q2: Are you removing or modifying walls?
  → NO: Continue
  → YES: Check if load-bearing (Level 3 if yes)

Q3: Are you changing the footprint (expanding)?
  → NO: Level 2 (Standard)
  → YES: Level 3 (Addition permit)

Q4: Are you changing electrical service?
  → Minor (outlets/lights): Part of Level 2
  → Major (sub-panel): Level 3

Q5: Are you changing ventilation/HVAC?
  → NO: Continue
  → YES: Additional mechanical permit

RESULT: Usually Level 2
Engineering needed IF:
- Removing walls
- Expanding footprint
- Structural floor reinforcement
```

#### Deck
```
Q1: Size?
  → Under 200 sq ft AND under 30" high: Level 1-2 (simple)
  → Over 200 sq ft OR over 30" high: Level 2-3

Q2: Attached to house?
  → NO: Freestanding = simpler
  → YES: Ledger board attachment = structural concern

Q3: What height above grade?
  → Under 30": Level 1-2
  → 30" - 6ft: Level 2
  → Over 6ft: Level 3 (engineering required)

Q4: Soil type known?
  → YES: Continue
  → NO: May need soil test (engineering)

RESULT: Level 2-3
Engineering needed IF:
- Over 30" height
- Attached to house
- Poor soil conditions
- Over 200 sq ft in some jurisdictions
```

#### Fence
```
Q1: Height?
  → Under 6ft: Usually no permit OR Level 1
  → 6-8ft: Level 1-2 (permit required)
  → Over 8ft: Level 2 (engineering may be needed)

Q2: Location?
  → Within property lines, not near easements: Continue
  → Near property line: Survey may be required
  → Near utility easement: Utility approval needed

Q3: On a slope?
  → NO: Continue
  → YES: Retaining over 4ft? (Engineering required)

Q4: HOA or historic district?
  → NO: Continue
  → YES: Additional approval required

RESULT: Level 0-2 depending on height
Engineering rarely needed unless retaining wall
```

---

## 2. Guided Question Flow Architecture

### 2.1 Question Tree Structure

```javascript
const PROJECT_TYPES = {
  'hot-water-heater': {
    complexity: 'variable', // Starts Level 1, can escalate
    questions: [
      {
        id: 'replacement',
        text: 'Are you replacing an existing water heater?',
        type: 'yes-no',
        impact: { no: '+1 level' }
      },
      {
        id: 'same-location',
        text: 'Will it be in the same location?',
        type: 'yes-no',
        condition: { replacement: 'yes' },
        impact: { no: '+1 level' }
      },
      {
        id: 'fuel-type',
        text: 'Are you keeping the same fuel type (gas/electric)?',
        type: 'yes-no',
        impact: { no: '+1 level, requires gas permit' }
      },
      {
        id: 'capacity',
        text: 'Is the new unit the same size or smaller?',
        type: 'yes-no',
        impact: { no: 'verify electrical/gas capacity' }
      }
    ],
    determineLevel: (answers) => {
      let level = 1; // Start at simple
      if (!answers.replacement) level = 2;
      if (!answers.sameLocation) level = 2;
      if (!answers.fuelType) level = 2;
      return level;
    }
  },
  
  'bathroom-remodel': {
    complexity: 'variable',
    questions: [
      {
        id: 'scope',
        text: 'What are you changing?',
        type: 'multi-select',
        options: [
          { value: 'fixtures', label: 'Moving plumbing fixtures' },
          { value: 'walls', label: 'Removing or moving walls' },
          { value: 'footprint', label: 'Expanding the bathroom' },
          { value: 'electrical', label: 'Adding electrical outlets/lighting' },
          { value: 'hvac', label: 'Changing ventilation/HVAC' },
          { value: 'cosmetic', label: 'Just cosmetic (tile, vanity, etc)' }
        ]
      },
      {
        id: 'wall-type',
        text: 'Are any walls you\'re removing load-bearing?',
        type: 'select',
        condition: { scope: 'walls' },
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unknown', label: 'Not sure' }
        ],
        impact: { 
          yes: 'Level 3, engineering required',
          unknown: 'Level 3, engineering assessment needed'
        }
      },
      {
        id: 'plumbing-extent',
        text: 'How much plumbing work?',
        type: 'select',
        condition: { scope: 'fixtures' },
        options: [
          { value: 'minor', label: 'Just replacing fixtures in same spots' },
          { value: 'relocate', label: 'Moving fixtures to new locations' },
          { value: 'new', label: 'Adding new fixtures' }
        ]
      }
    ],
    determineLevel: (answers) => {
      if (answers.scope === ['cosmetic']) return 0; // No permit
      if (answers.wallType === 'yes' || answers.wallType === 'unknown') return 3;
      if (answers.scope.includes('footprint')) return 3;
      return 2; // Standard remodel
    },
    engineeringRequired: (answers) => {
      return answers.wallType === 'yes' || 
             answers.wallType === 'unknown' ||
             answers.scope.includes('footprint');
    }
  },
  
  'deck': {
    complexity: 'variable',
    questions: [
      {
        id: 'size',
        text: 'Approximate size of deck?',
        type: 'number',
        unit: 'square feet',
        hint: 'Length × Width'
      },
      {
        id: 'height',
        text: 'Height above ground?',
        type: 'select',
        options: [
          { value: 'under-30', label: 'Under 30 inches' },
          { value: '30-72', label: '30 inches to 6 feet' },
          { value: 'over-72', label: 'Over 6 feet' }
        ]
      },
      {
        id: 'attached',
        text: 'Will the deck be attached to your house?',
        type: 'yes-no'
      },
      {
        id: 'second-floor',
        text: 'Is this a second-floor deck?',
        type: 'yes-no',
        impact: { yes: 'Level 3, engineering required' }
      }
    ],
    determineLevel: (answers) => {
      if (answers.height === 'over-72' || answers.secondFloor) return 3;
      if (answers.size > 200 || answers.height === '30-72') return 2;
      return 1;
    },
    engineeringRequired: (answers) => {
      return answers.height === 'over-72' || 
             answers.secondFloor ||
             (answers.size > 200 && answers.attached);
    }
  },
  
  'fence': {
    complexity: 'simple',
    questions: [
      {
        id: 'height',
        text: 'How tall will the fence be?',
        type: 'number',
        unit: 'feet'
      },
      {
        id: 'location',
        text: 'Where will the fence be located?',
        type: 'select',
        options: [
          { value: 'interior', label: 'Well within my property' },
          { value: 'property-line', label: 'On or near property line' },
          { value: 'easement', label: 'Near utility easement' }
        ]
      },
      {
        id: 'slope',
        text: 'Is your property on a slope?',
        type: 'yes-no'
      },
      {
        id: 'retaining',
        text: 'Will this include a retaining wall over 4 feet?',
        type: 'yes-no',
        condition: { slope: 'yes' }
      }
    ],
    determineLevel: (answers) => {
      if (answers.height < 6) return 0; // Often no permit
      if (answers.retaining) return 3;
      return 1;
    },
    engineeringRequired: (answers) => {
      return answers.retaining || answers.height > 8;
    }
  }
};
```

### 2.2 Dynamic Question Engine

```javascript
class GuidedQuestionEngine {
  constructor(projectType) {
    this.projectType = projectType;
    this.config = PROJECT_TYPES[projectType];
    this.answers = {};
    this.currentQuestionIndex = 0;
  }

  // Get next question based on previous answers
  getNextQuestion() {
    const questions = this.config.questions;
    
    for (let i = this.currentQuestionIndex; i < questions.length; i++) {
      const q = questions[i];
      
      // Check if question should be shown based on conditions
      if (q.condition && !this.meetsCondition(q.condition)) {
        continue; // Skip this question
      }
      
      this.currentQuestionIndex = i;
      return {
        question: q,
        progress: (i + 1) / questions.length
      };
    }
    
    return null; // All questions answered
  }

  // Record answer and get next question
  answerQuestion(questionId, answer) {
    this.answers[questionId] = answer;
    this.currentQuestionIndex++;
    return this.getNextQuestion();
  }

  // Check if answer meets condition for showing next question
  meetsCondition(condition) {
    for (const [key, expectedValue] of Object.entries(condition)) {
      if (Array.isArray(this.answers[key])) {
        if (!this.answers[key].includes(expectedValue)) return false;
      } else {
        if (this.answers[key] !== expectedValue) return false;
      }
    }
    return true;
  }

  // Determine final permit level
  getPermitLevel() {
    return this.config.determineLevel(this.answers);
  }

  // Check if engineering is required
  isEngineeringRequired() {
    if (!this.config.engineeringRequired) return false;
    return this.config.engineeringRequired(this.answers);
  }

  // Get summary of answers for AI context
  getSummary() {
    return {
      projectType: this.projectType,
      answers: this.answers,
      permitLevel: this.getPermitLevel(),
      engineeringRequired: this.isEngineeringRequired()
    };
  }
}
```

---

## 3. Permit Application Link Discovery

### 3.1 Strategy: Smart Link Finding

**Approach 1: Pre-built Database (Best for MVP)**
```javascript
const PERMIT_PORTALS = {
  // Florida
  'FL': {
    'Pinellas County': {
      building: 'https://www.pinellascounty.org/building/',
      apply: 'https://aca-prod.accela.com/PINELLAS/',
      forms: 'https://www.pinellascounty.org/building/forms.htm'
    },
    'St. Petersburg': {
      building: 'https://www.stpete.org/government/departments_offices/development_services/building_permits',
      apply: 'https://aca-prod.accela.com/STPETE/',
      forms: 'https://www.stpete.org/government/departments_offices/development_services/forms'
    },
    'Hillsborough County': {
      building: 'https://www.hillsboroughcounty.org/en/residents/building',
      apply: 'https://epzilla.hcpafl.org/',
      forms: 'https://www.hillsboroughcounty.org/en/residents/building/forms'
    }
  },
  'TX': {
    'Austin': {
      building: 'https://www.austintexas.gov/department/development-services',
      apply: 'https://abc.austintexas.gov/',
      forms: 'https://www.austintexas.gov/page/forms-checklists'
    },
    'Travis County': {
      building: 'https://www.traviscountytx.gov/tnr/building-inspection',
      apply: 'https://www.traviscountytx.gov/tnr/building-inspection/apply',
      forms: 'https://www.traviscountytx.gov/tnr/building-inspection/forms'
    }
  },
  'CA': {
    'Los Angeles': {
      building: 'https://ladbs.org/',
      apply: 'https://permitla.lacity.org/',
      forms: 'https://ladbs.org/services/core-services/plan-check-permit/plan-check-permit-forms'
    }
  }
};
```

**Approach 2: Dynamic Discovery (Future Enhancement)**
```javascript
async function discoverPermitLinks(location) {
  const jurisdiction = location.likelyCityLimits ? location.city : location.county;
  const state = location.stateShort;
  
  // Search patterns
  const searchQueries = [
    `${jurisdiction} ${state} building permit application online`,
    `${jurisdiction} ${state} building department`,
    `${jurisdiction} ${state} permit portal`,
    `site:gov ${jurisdiction} ${state} building permit`
  ];
  
  // Use Google search to find official government sites
  const results = await googleSearch(searchQueries[0]);
  
  // Filter for .gov domains
  const officialSites = results.filter(r => 
    r.url.includes('.gov') || 
    r.url.includes('.us') ||
    r.url.includes('accela.com') // Common permit software
  );
  
  return {
    building: officialSites[0]?.url,
    discovered: true,
    confidence: calculateConfidence(officialSites[0])
  };
}
```

### 3.2 Link Routing Logic

```javascript
function getPermitLinks(location, permitLevel) {
  const jurisdiction = location.likelyCityLimits ? location.city : location.county;
  const state = location.stateShort;
  
  // Check if we have it in our database
  const links = PERMIT_PORTALS[state]?.[jurisdiction];
  
  if (links) {
    return {
      primary: {
        name: jurisdiction,
        building: links.building,
        apply: links.apply,
        forms: links.forms
      },
      source: 'database',
      confidence: 'high'
    };
  }
  
  // Fallback: County portal if city not found
  if (location.likelyCityLimits) {
    const countyLinks = PERMIT_PORTALS[state]?.[location.county];
    if (countyLinks) {
      return {
        primary: {
          name: location.county,
          building: countyLinks.building,
          apply: countyLinks.apply,
          forms: countyLinks.forms,
          note: `City of ${jurisdiction} permits may be handled by ${location.county}`
        },
        source: 'database-fallback',
        confidence: 'medium'
      };
    }
  }
  
  // Last resort: Generic search link
  return {
    primary: null,
    searchUrl: `https://www.google.com/search?q=${encodeURIComponent(jurisdiction + ' ' + state + ' building permit application')}`,
    source: 'search',
    confidence: 'low',
    message: 'We don\'t have the direct link yet. Click to search for your local permit office.'
  };
}
```

---

## 4. Engineering Determination Logic

### 4.1 Engineering Requirements by Project & Jurisdiction

```javascript
const ENGINEERING_RULES = {
  global: {
    // Universal triggers for engineering
    triggers: [
      'structural modifications',
      'load-bearing wall removal',
      'foundation work',
      'second story addition',
      'deck over 6ft height',
      'retaining wall over 4ft',
      'major beam/column work'
    ]
  },
  
  byState: {
    'FL': {
      deck: {
        heightThreshold: 30, // inches
        areaThreshold: 200, // sq ft
        hurricaneZone: true // Requires engineered plans
      },
      pool: {
        engineeringRequired: true, // Always in FL
        reason: 'Hurricane wind loads'
      },
      solar: {
        engineeringRequired: true,
        reason: 'Roof load calculations required'
      }
    },
    
    'CA': {
      seismic: true,
      deck: {
        heightThreshold: 30,
        seismicZone: true
      },
      solar: {
        engineeringRequired: true,
        reason: 'Seismic and roof load'
      }
    },
    
    'TX': {
      deck: {
        heightThreshold: 30,
        areaThreshold: 200
      },
      pool: {
        engineeringRequired: false, // Often not required
        caveat: 'Check local jurisdiction'
      }
    }
  }
};

function determineEngineering(projectType, answers, location) {
  const state = location.stateShort;
  const rules = ENGINEERING_RULES.byState[state] || {};
  const projectRules = rules[projectType] || {};
  
  // Check project-specific rules
  if (projectRules.engineeringRequired === true) {
    return {
      required: true,
      reason: projectRules.reason,
      confidence: 'high'
    };
  }
  
  // Check triggers based on answers
  if (projectType === 'deck') {
    const height = parseHeight(answers.height);
    if (height > projectRules.heightThreshold) {
      return {
        required: true,
        reason: `Deck height over ${projectRules.heightThreshold}" requires structural engineering`,
        confidence: 'high'
      };
    }
    
    if (answers.size > projectRules.areaThreshold && answers.attached) {
      return {
        required: true,
        reason: 'Large attached deck requires ledger board engineering',
        confidence: 'medium'
      };
    }
  }
  
  if (projectType === 'bathroom-remodel' || projectType === 'kitchen-remodel') {
    if (answers.wallType === 'yes') {
      return {
        required: true,
        reason: 'Removing load-bearing walls requires structural engineering',
        confidence: 'high'
      };
    }
    
    if (answers.wallType === 'unknown') {
      return {
        required: true,
        reason: 'Unknown wall type - engineering assessment recommended',
        confidence: 'medium',
        note: 'Engineer can determine if wall is load-bearing'
      };
    }
  }
  
  return {
    required: false,
    confidence: 'high'
  };
}
```

### 4.2 Engineer Requirement Explanation Generator

```javascript
function explainEngineeringNeed(engineeringResult, projectType, location) {
  if (!engineeringResult.required) {
    return {
      title: '✅ Engineering Not Required',
      explanation: 'Based on your project details, a licensed engineer is not needed for this permit.',
      cost: null
    };
  }
  
  const explanations = {
    high: {
      title: '🔧 Licensed Engineer Required',
      explanation: `${engineeringResult.reason}. A licensed structural engineer must:
      
1. Review your project plans
2. Perform structural calculations
3. Stamp and seal the drawings
4. Submit to building department

This is required by ${location.city || location.county} building code.`,
      
      process: [
        'Hire a licensed structural engineer',
        'Engineer visits site and reviews plans',
        'Engineer creates stamped drawings',
        'Submit engineered plans with permit application'
      ],
      
      cost: {
        range: '$500-3,000',
        note: 'Cost varies by project complexity. Simple beam calcs = $500-1,000. Full structural plans = $1,500-3,000+'
      },
      
      timeline: '1-3 weeks for engineering',
      
      findEngineer: {
        search: `structural engineer ${location.city} ${location.stateShort}`,
        tip: 'Look for engineers with local experience in residential projects'
      }
    },
    
    medium: {
      title: '⚠️ Engineering Likely Needed',
      explanation: `${engineeringResult.reason}. 

${engineeringResult.note || 'Check with your building department to confirm.'}`,
      
      recommendation: 'Contact the building department OR hire an engineer for an assessment (typically $200-500 for a visit).',
      
      cost: {
        assessment: '$200-500',
        fullEngineering: '$500-3,000 if required'
      }
    }
  };
  
  return explanations[engineeringResult.confidence] || explanations.medium;
}
```

---

## 5. Enhanced AI Prompt with Guided Context

```javascript
async function getSmartPermitAnswer(projectType, answers, location, permitOffice) {
  const questionEngine = new GuidedQuestionEngine(projectType);
  // Assume answers already collected
  questionEngine.answers = answers;
  
  const summary = questionEngine.getSummary();
  const permitLinks = getPermitLinks(location, summary.permitLevel);
  const engineeringResult = determineEngineering(projectType, answers, location);
  const engineeringExplanation = explainEngineeringNeed(engineeringResult, projectType, location);
  
  const systemPrompt = `You are a building permit expert. Provide a clear, actionable answer.

PROJECT DETAILS:
Type: ${projectType}
Complexity Level: ${summary.permitLevel} (0=none, 1=simple, 2=standard, 3=complex)
Answers: ${JSON.stringify(answers, null, 2)}

LOCATION:
Address: ${location.fullAddress}
Jurisdiction: ${location.likelyCityLimits ? location.city : location.county}
County: ${location.county}
State: ${location.state}

PERMIT OFFICE:
${permitOffice ? permitOffice.name : 'Not found'}
${permitOffice ? permitOffice.address : ''}
${permitOffice ? permitOffice.phone : ''}

PERMIT APPLICATION LINKS:
${permitLinks.primary ? `
Building Dept: ${permitLinks.primary.building}
Apply Online: ${permitLinks.primary.apply}
Forms: ${permitLinks.primary.forms}
` : `Search: ${permitLinks.searchUrl}`}

ENGINEERING:
Required: ${engineeringResult.required ? 'YES' : 'NO'}
${engineeringResult.reason}
${engineeringResult.required ? `Cost: ${engineeringExplanation.cost.range}` : ''}

YOUR ANSWER MUST INCLUDE:
1. ✅ PERMIT NEEDED? Clear yes/no
2. 📋 PERMIT TYPE: Simple/Standard/Complex
3. 💰 ESTIMATED COST: Fee range for this jurisdiction
4. ⏰ TIMELINE: Processing time
5. 🔧 ENGINEERING: Required? Why? Cost estimate if yes
6. 📝 NEXT STEPS: Exact action items with links
7. 🔗 APPLY HERE: Direct link to apply or call

Use simple language. Be specific to ${location.city || location.county}.`;

  const userPrompt = `Based on my answers, do I need a permit and what are my exact next steps?`;

  // Call OpenAI with enriched context
  const response = await openai.chat.completions.create({
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
    metadata: {
      permitLevel: summary.permitLevel,
      engineeringRequired: engineeringResult.required,
      engineeringCost: engineeringExplanation.cost,
      permitLinks: permitLinks,
      jurisdiction: location.likelyCityLimits ? location.city : location.county
    }
  };
}
```

---

## 6. Implementation Phases

### Phase 1: Core Guided Questions (Week 1-2)
- [ ] Implement `GuidedQuestionEngine` class
- [ ] Create question configs for top 5 projects:
  - Hot water heater
  - Bathroom remodel
  - Deck
  - Fence
  - HVAC replacement
- [ ] Build dynamic UI for question flow
- [ ] Add progress indicator
- [ ] Test decision tree logic

### Phase 2: Permit Link Database (Week 2-3)
- [ ] Research and compile top 50 US jurisdictions
- [ ] Build `PERMIT_PORTALS` database
- [ ] Create link routing logic
- [ ] Add fallback search generation
- [ ] Test link accuracy

### Phase 3: Engineering Detection (Week 3-4)
- [ ] Implement `ENGINEERING_RULES` by state
- [ ] Create `determineEngineering()` function
- [ ] Build engineering explanation generator
- [ ] Add engineering cost estimates
- [ ] Test edge cases

### Phase 4: AI Integration (Week 4)
- [ ] Enhance system prompts with guided context
- [ ] Add metadata to API responses
- [ ] Create rich answer formatting
- [ ] Add actionable next steps
- [ ] Test end-to-end flow

### Phase 5: Polish & Expansion (Week 5+)
- [ ] Add 10 more project types
- [ ] Expand to 100+ jurisdictions
- [ ] Add HOA/historic district handling
- [ ] Implement permit cost calculator
- [ ] Add timeline estimator
- [ ] User testing & refinement

---

## 7. Key Differentiators

**What makes this better than current solutions:**

1. **Intelligent Routing**: Not just "here's info" but "click here to apply NOW"
2. **Engineering Clarity**: Clear yes/no on engineering with cost estimates
3. **Guided Discovery**: Asks the RIGHT questions based on project type
4. **Hyperlocal**: City vs county routing, jurisdiction-specific links
5. **Actionable**: Every answer ends with "do THIS next"

**Example User Flow:**

```
User: "Do I need a permit for a deck?"

App: "Let me ask a few quick questions..." (4 questions)
  → Size? 150 sq ft
  → Height? Under 30"
  → Attached? Yes
  → Second floor? No

App: "✅ YES - You need a standard building permit

📋 PERMIT TYPE: Standard (Plan Review)
💰 COST: $275-350 (St. Petersburg)
⏰ TIMELINE: 2-3 weeks review
🔧 ENGINEERING: Not required (under 30" height)

📝 NEXT STEPS:
1. Create deck plans (or hire contractor to draw)
2. Apply online at: [St. Pete Portal Link]
3. Pay permit fee
4. Schedule inspections after approval

🔗 APPLY HERE:
https://aca-prod.accela.com/STPETE/
(Click 'Residential' → 'Deck Permit')

📞 Questions? St. Petersburg Development Services
   (727) 893-7356"
```

---

## 8. Technical Architecture

```
┌─────────────────────────────────────────────────┐
│  User Input: "I want to build a deck"          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GuidedQuestionEngine                            │
│  - Loads deck question tree                      │
│  - Asks: size, height, attached, etc.            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Answer Collection & Validation                  │
│  - Stores responses                              │
│  - Conditional questions                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Analysis Engine                                 │
│  ├─ Determine permit level (0-3)                │
│  ├─ Get permit links from DB/search              │
│  ├─ Check engineering requirements               │
│  └─ Build rich context for AI                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GPT-4 Answer Generation                         │
│  - Uses enriched context                         │
│  - Formats with links and next steps             │
│  - Returns actionable guidance                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Rich Answer Display                             │
│  - Permit needed? Badge                          │
│  - Engineering required? Highlighted             │
│  - Direct apply button                           │
│  - Cost & timeline estimates                     │
└─────────────────────────────────────────────────┘
```

---

## 9. Next Steps

**To start implementation:**

1. Review this plan and approve approach
2. Prioritize project types (start with top 5)
3. Research permit portals for user's jurisdiction (St. Pete, FL?)
4. Build GuidedQuestionEngine class
5. Create first question tree (deck or bathroom)
6. Test with real scenarios

**Questions to answer:**

1. Which project types should we prioritize first?
2. Which states/jurisdictions to focus on initially?
3. Should we build the permit portal database or use dynamic search first?
4. Do you have access to local permit office contacts for research?

Ready to start building? Let me know which phase to begin with!
