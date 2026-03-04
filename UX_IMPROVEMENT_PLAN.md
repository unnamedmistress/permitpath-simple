# PermitPath UX/UI Improvement Implementation Plan

## Overview
Transform the PermitPath wizard from an information-heavy, multi-step form into a streamlined, progressive disclosure experience that reduces cognitive load by 75%.

---

## Implementation Strategy

### Phase 1: Job Type Selection (SimplifiedJobTypePage)
**Current Issues:**
- High cognitive load (7/10)
- Visual clutter with duplicate content
- Competing CTAs (banners, checklists)

**Changes:**
1. ✅ Remove duplicate "Notice" disclaimer
2. ✅ Remove "Before you start" checklist
3. ✅ Remove "Try AI chat with photos" banner
4. ✅ Center single question: "What type of work?"
5. ✅ Visual grid with 8 job type tiles (icons)
6. ✅ One-tap selection, auto-advance
7. ✅ Clean white space, minimal UI

### Phase 2: Location Selection (SimplifiedLocationPage)
**Current Issues:**
- Multiple instructional banners
- Moderate cognitive load (5/10)

**Changes:**
1. ✅ Remove "How to choose" banner
2. ✅ Remove "Requirements vary by jurisdiction" banner
3. ✅ Remove "Using your last location" banner
4. ✅ Single heading: "Where is the property?"
5. ✅ Short subtitle: "Select the city or county"
6. ✅ Visual cards with strong selection state (solid bg, checkmark)
7. ✅ Clean vertical list, generous spacing

### Phase 3: Details Form (SimplifiedDetailsPage)
**Current Issues:**
- Critically high cognitive load (9/10)
- 20+ fields like a government form
- Too much optional info upfront

**Changes:**
1. ✅ Reduce to 2 fields max:
   - Property Address (with autocomplete)
   - Property Type (visual cards with icons)
2. ✅ Remove all optional fields (contractor info, budget, timeline, etc.)
3. ✅ Move deferred info to checklist completion flow
4. ✅ Typeform-style: one question at a time, auto-advance
5. ✅ Large, tappable cards for property type selection

### Phase 4: Summary/Checklist Page (TabbedInterface)
**Current Issues:**
- Critically high cognitive load (10/10)
- 45+ content blocks
- No clear hierarchy
- Overwhelming on mobile

**Changes:**
1. ✅ Implement tabbed interface:
   - **Checklist** (default): Action-oriented requirements
   - **Timeline**: Dates and scheduling
   - **Cost**: Fee estimates and quotes
   - **Help**: Forms and contact info

2. ✅ Checklist Tab Redesign:
   - Primary summary header with 3 key metrics:
     * Permit Fee: ~$88
     * Timeline: ~4 Days
     * Required Docs: 3
   - Expanded cards (no accordions by default)
   - Clear "Upload" / "Apply Online" buttons
   - Remove: "What's Normal", "What Happens Next", "Job Info" sections

3. ✅ Visual Improvements:
   - Consistent typography scale
   - Iconography for each tab
   - Generous white space
   - Purposeful color usage

---

## Technical Implementation

### New Components to Create:
1. `JobTypeGrid.tsx` - Visual 8-tile job selector
2. `LocationSelector.tsx` - Clean location cards
3. `SimpleAddressForm.tsx` - Address + property type only
4. `TabbedChecklist.tsx` - Main tabbed interface
5. `SummaryHeader.tsx` - 3-metric summary component
6. `ProgressiveDisclosureWrapper.tsx` - Animation/transition handler

### Pages to Modify:
1. `JobTypePage.tsx` - Complete redesign
2. `LocationPage.tsx` - Simplify
3. `DetailsPage.tsx` - Radical reduction
4. `WizardPage.tsx` - Add tabbed interface

### Routing Changes:
- Keep existing routes for backward compatibility
- Add new simplified routes as `/simple/*`
- Feature flag to switch between flows

---

## Testing Checklist

### Browser Relay Testing:
- [ ] Job Type Page: Single focus, no clutter
- [ ] Location Page: Clean selection, clear visual states
- [ ] Details Page: Max 2 fields, auto-advance
- [ ] Checklist Tab: 3 metrics visible, actionable cards
- [ ] Timeline Tab: Date info isolated
- [ ] Cost Tab: Fee estimates visible
- [ ] Help Tab: Contact/forms accessible
- [ ] Mobile: All pages usable, no overflow

### Metrics to Validate:
- [ ] Content blocks reduced from 45+ to <12 on summary
- [ ] Form fields reduced from 20+ to 2
- [ ] Cognitive load score reduced from 9/10 to 3/10
- [ ] Time to complete wizard < 30 seconds
