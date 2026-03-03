# PermitPath Feature Plan: Cost Calculator, Form Downloads & Realistic Timelines

**Date:** March 3, 2026  
**Priority:** High - Revenue-impacting features  
**Estimated Effort:** 3-4 weeks

---

## Executive Summary

Three features that turn PermitPath from a "checklist helper" into a "business tool":

1. **Exact Cost Calculator** - No more "~$50-150" guesses
2. **Real Form Downloads** - PDFs fetched directly from city sites
3. **Complete Timeline** - Including inspections (the real bottleneck)

**Impact:** Contractors can quote customers accurately, avoid surprise costs, and schedule crews efficiently.

---

## 1. 💰 COST CALCULATOR

### Current State
- Shows vague ranges like "$50-150"
- No breakdown
- No city-specific pricing
- No historical data

### Target State
**"Water Heater Replacement in Clearwater: $87.50"**

#### Core Features

| Feature | User Story | Data Source |
|---------|-----------|-------------|
| Exact Fee Lookup | "I need to know it's $87.50, not ~$50-150" | Pinellas County fee schedule PDFs |
| Cost Breakdown | "What's the permit fee vs inspection fee vs plan review?" | Itemized fee schedules |
| Historical Averages | "What did similar jobs cost?" | Cached/synthesized data |
| Quote Generator | "Generate customer quote with permit cost built in" | Template + calculations |
| City Comparison | "What if I do the job in Largo instead?" | Multi-jurisdiction lookup |

#### Fee Schedule Data Sources

```typescript
// src/data/feeSchedules.ts
interface FeeSchedule {
  jurisdiction: Jurisdiction;
  jobType: JobType;
  baseFee: number;           // $87.50
  calculationMethod: 'flat' | 'valuation' | 'sqft' | 'fixture';
  
  // Breakdown
  permitFee: number;         // $75.00
  planReviewFee: number;     // $0 (if exempt) or $50
  inspectionFee: number;     // $25 (per inspection)
  stateSurcharge: number;    // $7.50 (FL state fee)
  
  // Additional costs
  revisions: number;         // $50 per revision
  reInspection: number;    // $100 if failed first time
  sameDayFee: number;      // $150 for expedited
  
  // Calculator
  calculator: (params: CalcParams) => DetailedCost;
}
```

#### Implementation Tasks

**Phase 1: Data Collection (Week 1)**
- [ ] Scrape/parse Pinellas County fee schedule PDFs
- [ ] Extract fees for top 10 job types per jurisdiction
- [ ] Create feeSchedule database schema
- [ ] Build fee calculator engine

**Phase 2: UI Implementation (Week 2)**
- [ ] Add "Cost Calculator" step in wizard (after location selection)
- [ ] Show exact fee with animated counter (builds from $0 to final)
- [ ] Expandable breakdown accordion
- [ ] "What impacts this cost?" helper section
- [ ] Historical comparison sparkline ("Similar jobs averaged $85")

**Phase 3: Quote Generator (Week 3)**
- [ ] Create quote templates (PDF generation)
- [ ] Pre-fill contractor info from profile
- [ ] Add mark-up calculator ("You charge customer: $___")
- [ ] Save/share quote options

#### UI Mock

```
┌─────────────────────────────────────────┐
│  💰 Your Permit Cost                      │
│                                          │
│  Water Heater Replacement               │
│  Clearwater, FL                          │
│                                          │
│  $87.50                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━ (animated)      │
│                                          │
│  [>] Breakdown                          │
│     Base permit fee:        $75.00       │
│     Inspection fee:         $25.00       │
│     State surcharge:       -$12.50      │
│     ─────────────────────               │
│     Your total:            $87.50        │
│                                          │
│  📊 Jobs like this in Clearwater:       │
│     Average: $85  Low: $75  High: $125  │
│                                          │
│  [Generate Quote for Customer]          │
└─────────────────────────────────────────┘
```

---

## 2. 📋 ACTUAL FORM DOWNLOAD

### Current State
- Says "Complete permit application form"
- No link, no download, no preview
- Contractor has to hunt city websites

### Target State
**"Click to download the official Clearwater Building Permit Application"**

#### Core Features

| Feature | User Story | Technical Approach |
|---------|-----------|-------------------|
| Direct PDF Links | "Give me the actual PDF, not a description" | Scrape/link to official city forms |
| Form Preview | "Show me what this looks like before I download" | PDF.js preview viewer |
| Pre-Fill Fields | "Don't make me write my license # for the 50th time" | PDF-lib to modify PDFs |
| Field Guide | "Which boxes do I fill out?" | Annotated preview with highlights |
| Related Forms | "What else might I need?" | Dependency mapping |

#### Form Library Structure

```typescript
// src/data/formLibrary.ts
interface PermitForm {
  id: string;
  jurisdiction: Jurisdiction;
  jobTypes: JobType[];
  
  // Source
  officialUrl: string;           // https://clearwater.gov/permits/form.pdf
  directDownloadUrl: string;   // CDN or cached copy
  lastVerified: Date;
  
  // Metadata
  formName: string;
  description: string;           // "Building Permit Application"
  pages: number;
  fileSize: string;             // "245 KB"
  
  // Fields we can pre-fill
  fillableFields: FormField[];
  
  // User guidance
  contractorFields: string[];    // Fields YOU fill
  cityFields: string[];        // Fields CITY fills
  commonMistakes: string[];     // "Don't forget page 2 signature"
  
  // Related
  requiredFor: RequirementId[];
  commonlyNeededWith: string[]; // Other form IDs
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'signature' | 'date';
  page: number;
  position: { x: number; y: number; width: number; height: number };
  prefillsFrom: 'contractor.profile' | 'job.address' | 'job.description' | null;
}
```

#### Form Sources

| Jurisdiction | Form Source | Method |
|-------------|-------------|--------|
| Pinellas County | https://pinellas.gov/building/permits/ | Scrape + cache |
| Clearwater | https://www.myclearwater.com/permits | Scrape + cache |
| St Petersburg | https://stpete.org/permits | Scrape + cache |
| Largo | https://www.largo.com/building | Scrape + cache |

#### Implementation Tasks

**Phase 1: Form Discovery (Week 1)**
- [ ] Map official form URLs for top 5 jurisdictions
- [ ] Create form metadata database
- [ ] Build form download/cache system
- [ ] Verify links are current (weekly check)

**Phase 2: Download UI (Week 2)**
- [ ] Add "Download Forms" step in wizard
- [ ] List required forms per job type
- [ ] PDF preview component (first page thumbnail)
- [ ] Direct download buttons
- [ ] "Open in browser" option

**Phase 3: Pre-Fill (Week 3-4)**
- [ ] Map contractor profile fields to PDF fields
- [ ] Implement PDF-lib pre-fill service
- [ ] Generate pre-filled PDFs
- [ ] "Download blank" vs "Download pre-filled" options

**Phase 4: Smart Guidance (Week 4)**
- [ ] Annotated form viewer (highlight fields)
- [ ] Field-by-field help tooltips
- [ ] Common mistakes warnings
- [ ] "Print these pages" helper (some forms are multi-purpose)

#### UI Mock

```
┌─────────────────────────────────────────┐
│  📋 Forms You Need                        │
│                                          │
│  Building Permit Application            │
│  ┌─────────────┐                         │
│  │ ▓▓▓▓▓▓▓▓▓ │  Preview                 │
│  │ ▓ FORM ▓▓▓ │                         │
│  │ ▓▓▓▓▓▓▓▓▓ │  [👁 Preview] [⬇ Download]│
│  └─────────────┘                         │
│                                          │
│  [✓] Pre-fill with my info              │
│      Company: ABC Contracting           │
│      License: FL-12345                  │
│                                          │
│  ℹ️ You fill: Pages 1-3                  │
│  ℹ️ City fills: Page 4 (permit #)       │
│                                          │
│  💡 Also commonly needed:               │
│     - Electrical Sub-permit             │
│     - Plot plan (you draw this)         │
└─────────────────────────────────────────┘
```

---

## 3. ⏰ REALISTIC TIMELINE (Including Inspections)

### Current State
- "2-4 weeks" - vague and incomplete
- No inspection scheduling
- No calendar integration
- No notifications

### Target State
**"Apply → Approved → Inspected → Final → Start Work: 18 days"**

#### Complete Workflow

```
[Apply] → [Under Review] → [Approved] → [Schedule Inspection] → 
[Inspection Complete] → [Final Approval] → [✅ START WORK]
   ↑                      ↓                    ↓
   └──── Revisions ──────┘     Re-inspection? ──┘
```

#### Core Features

| Feature | User Story | Data Source |
|---------|-----------|-------------|
| Inspection Requirements | "What inspections do I need?" | Permit logic database |
| Scheduling Estimates | "How long to get an inspection slot?" | Historical data + city APIs |
| Complete Timeline | "When can I ACTUALLY start work?" | Combined workflow engine |
| Calendar Export | "Add these dates to my Google Calendar" | iCal/ICS generation |
| Waitlist Notifications | "Tell me when inspection slots open" | Background polling + push |
| Worst-Case Planning | "What if I fail inspection?" | Branching timeline scenarios |

#### Timeline Data Model

```typescript
// src/services/timelineEngine.ts
interface CompleteTimeline {
  jobId: string;
  startDate: Date;           // When they applied
  targetStartWork: Date;     // When they can ACTUALLY start
  
  stages: TimelineStage[];
  
  // Risks/delays
  contingentDates: ContingentDate[]; // "If X happens, add Y days"
  
  // Scheduling
  inspectionSlots?: InspectionSlot[];
  recommendedBookingDate: Date; // "Book by March 15 to hit target"
}

interface TimelineStage {
  name: string;              // "Rough-in Inspection"
  type: 'approval' | 'inspection' | 'final';
  estimatedDuration: { min: number; max: number; typical: number };
  startDate?: Date;
  endDate?: Date;
  
  // Scheduling
  requiresScheduling: boolean;
  schedulingLeadTime: number;  // Days ahead to book
  schedulingMethod: 'online' | 'phone' | 'contractor-scheduled';
  schedulingUrl?: string;      // Direct link
  
  // Pass/fail
  canFail: boolean;
  retryDelay: number;          // Days before re-inspection
  
  // Dependencies
  dependsOn: string[];       // Previous stage IDs
  blocksWorkStart: boolean;    // Can't start until complete
}

interface InspectionSlot {
  date: Date;
  timeWindow: string;        // "8am-12pm"
  available: boolean;
  city: Jurisdiction;
  inspectionType: string;
}
```

#### Inspection Data Sources

| City | Online Scheduling | Data Method |
|------|------------------|-------------|
| Pinellas County | ✅ Yes | API scrape |
| Clearwater | ✅ Yes | API scrape |
| St Petersburg | ⚠️ Phone/Online | Hybrid |
| Largo | ⚠️ Phone only | Manual + crowd |

#### Implementation Tasks

**Phase 1: Timeline Engine (Week 1)**
- [ ] Map complete permit workflows (include inspections)
- [ ] Build timeline calculation engine
- [ ] Add contingent/worst-case paths
- [ ] Create timeline visualization component

**Phase 2: Inspection Integration (Week 2-3)**
- [ ] Scrape available inspection slots (where possible)
- [ ] Build "Book Inspection" action links
- [ ] Add scheduling reminder system
- [ ] Create calendar export feature

**Phase 3: Notifications (Week 3-4)**
- [ ] Background polling for slot availability
- [ ] Push/email notifications
- [ ] "Slots opened" alerts
- [ ] "Book now" reminder system

**Phase 4: Smart Scheduling (Week 4)**
- [ ] "Optimal booking date" calculator
- [ ] Weather integration (exterior work)
- [ ] Crew availability sync (future)
- [ ] Multi-job scheduling optimization

#### UI Mock

```
┌─────────────────────────────────────────┐
│  ⏰ Your Complete Permit Timeline       │
│                                          │
│  Target Start Work: March 25            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                          │
│  ▉▉▉▉▉▉▉▉░░░░░░░░  Submit Application  │
│  Mar 3 → 2-3 days                      │
│                                          │
│  ░░░░░░░░▉▉▉▉▉▉▉▉░░  Under Review       │
│  Mar 5-7 → 3-5 days                    │
│                                          │
│  ░░░░░░░░░░░░▉▉▉▉🟡  Approved!          │
│  [Schedule Inspection →]                │
│                                          │
│  ⚠️ Inspection Wait: 3-5 days            │
│  Typical first available: Mar 12-14     │
│                                          │
│  📅 Recommended: Book by Mar 10         │
│                                          │
│  [Add to Calendar] [Notify When Open]  │
│                                          │
│  ───────────────────────────────        │
│  Worst case: If revision needed (+5d)   │
│  Worst case: If inspection fails (+7d)  │
└─────────────────────────────────────────┘
```

---

## Implementation Order

**Recommended Priority:**

| Rank | Feature | Impact | Effort | Weeks |
|------|---------|--------|--------|-------|
| 1 | Cost Calculator | 🔥🔥🔥 High | Medium | 1-2 |
| 2 | Realistic Timeline | 🔥🔥🔥 High | High | 2-3 |
| 3 | Form Downloads | 🔥🔥 Medium | High | 2-4 |

**Rationale:**
- Cost calculator is highest immediate value + easiest to implement
- Timeline is critical for scheduling but complex due to data sources
- Form downloads are valuable but require PDF processing complexity

---

## Technical Dependencies

### New Services Required

```
src/
├── services/
│   ├── feeCalculator.ts        # Cost calculation engine
│   ├── feeScraper.ts           # Fetch/update fee schedules
│   ├── formLibrary.ts          # Form metadata & downloads
│   ├── formPrefiller.ts        # PDF pre-fill using pdf-lib
│   ├── timelineEngine.ts       # Complete timeline calculation
│   └── inspectionScheduler.ts  # Slot checking & notifications
├── components/
│   ├── cost/
│   │   ├── CostCalculator.tsx
│   │   ├── CostBreakdown.tsx
│   │   └── QuoteGenerator.tsx
│   ├── forms/
│   │   ├── FormDownloader.tsx
│   │   ├── FormPreview.tsx
│   │   └── PrefillSettings.tsx
│   └── timeline/
│       ├── TimelineViewer.tsx
│       ├── InspectionScheduler.tsx
│       └── CalendarExport.tsx
```

### New Dependencies

```json
{
  "pdf-lib": "^1.17.1",        // PDF modification
  "pdfjs-dist": "^3.11.174",   // PDF preview
  "react-pdf": "^7.5.1",       // React PDF viewer
  "ics": "^3.5.0",             // Calendar export
  "cheerio": "^1.0.0-rc.12",   // Web scraping
  "puppeteer": "^21.5.0"       // PDF scraping (optional)
}
```

### Data Storage

- Fee schedules: Local JSON + periodic refresh
- Form library: Metadata in JSON, PDFs cached locally
- Timeline templates: Static JSON per jurisdiction
- User quotes: LocalStorage or Firebase
- Calendar events: Generated on-demand

---

## Success Metrics

| Feature | Metric | Target |
|---------|--------|--------|
| Cost Calculator | Contractor quotes generated | >50% of jobs |
| | Time to quote | <2 min (down from hunting) |
| Form Downloads | Forms accessed per job | 100% |
| | Time spent finding forms | <30 sec |
| Timeline | Inspections scheduled via app | >30% |
| | "On schedule" start rate | >80% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Fee schedules change | Weekly scrape jobs + manual verification |
| Form URLs break | Health check cron + fallback to official URL |
| Cities block scraping | Proxy rotation + respectful rate limits |
| Inspection data unavailable | Graceful fallback to "call to schedule" |
| PDF generation complex | Start with downloads, add pre-fill later |

---

## Next Steps

1. **Approve this plan** → Prioritize which feature first
2. **Data gathering** → I'll scrape fee schedules and form URLs
3. **Proof of concept** → Cost calculator for one city (Clearwater)
4. **Full implementation** → Roll out to all features

Ready to proceed?