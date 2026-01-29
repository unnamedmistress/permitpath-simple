# PermitPath Intelligent Permit Reasoning - Testing Guide

## Quick Test Scenarios

### Test 1: Cosmetic Work (NO PERMIT)

**Setup:**
1. Create new job: Bathroom Remodel
2. Address: "123 Main St, St Petersburg, FL"
3. Complete checklist items
4. Click "View Summary" → Goes to Details Page

**Answer Details Questions:**
- Moving fixtures? → **"Replacing in same location only"**
- Adding water lines? → **"No, using existing connections"**
- Modifying drainage? → **"No, drainage stays the same"**
- Adding circuits? → **"No, just replacing existing fixtures"**
- Relocating outlets? → **"No, same locations"**
- Removing walls? → **"No, walls stay as-is"**
- Changing layout? → **"No, same layout"**
- Estimated cost? → **"$500 - $2,000"**

**Expected Result:**
```
❌ NO permit needed because:
- You are only replacing a vanity in the same location
- No plumbing connections are being moved
- This is cosmetic work covered under maintenance exemption

Legal Basis:
Florida Residential Code §R105.2 (Exemptions): 
Cosmetic work not requiring a permit: painting, wallpapering, 
tiling (surface only), fixture replacement in same location without 
altering supply/drainage
```

---

### Test 2: Moving Sink (PLUMBING PERMIT)

**Setup:**
1. Create new job: Bathroom Remodel
2. Address: "456 Beach Blvd, St Petersburg, FL"
3. Complete checklist
4. Details Page

**Answer Details Questions:**
- Moving fixtures? → **"Moving fixtures to new locations"**
- Which fixtures? → **"Moving sink from left wall to right wall"**
- Adding water lines? → **"Yes, adding/extending lines"**
- Modifying drainage? → **"No, drainage stays the same"**
- Adding circuits? → **"No, just replacing existing fixtures"**
- Removing walls? → **"No, walls stay as-is"**
- Changing layout? → **"No, same layout"**
- Estimated cost? → **"$2,000 - $5,000"**

**Expected Result:**
```
✅ YES - Permit Required. Here's why:
- You are MOVING plumbing fixtures (Moving sink from left wall to right wall)
- You are adding or extending water supply lines

Permit Types You'll Need:
- Plumbing Permit

Code References:
Florida Residential Code §P105.2: Permits required for 
alterations to water or drainage systems

Where to Submit Your Permit:
St. Petersburg Construction Services & Permitting Division
Address: Municipal Services Center (MSC), One 4th Street North
St. Petersburg, FL 33701
Phone: (727) 893-7231
Online Portal: https://stpe-egov.aspgov.com/Click2GovBP/

How to Fill Out Your Permit Application:
[Shows 7-step guide]

Step 4: Describe the Work
Use this description:
"Bathroom remodel including: moving plumbing fixtures 
(Moving sink from left wall to right wall), adding water 
supply lines. No structural changes to load-bearing elements."
```

---

### Test 3: Full Renovation (MULTIPLE PERMITS)

**Setup:**
1. Create new job: Bathroom Remodel
2. Address: "789 Harbor Dr, Clearwater, FL" (Note: Different city!)
3. Complete checklist
4. Details Page

**Answer Details Questions:**
- Moving fixtures? → **"Moving fixtures to new locations"**
- Which fixtures? → **"Moving everything - sink, toilet, shower"**
- Adding water lines? → **"Yes, adding/extending lines"**
- Modifying drainage? → **"Yes, changing drainage"**
- Adding circuits? → **"Yes, adding new circuits"**
- Electrical details? → **"Adding circuit for heated floor"**
- Relocating outlets? → **"Yes, relocating electrical"**
- Removing walls? → **"Yes, removing or changing walls"**
- Structural details? → **"Removing wall between toilet and vanity area"**
- Changing layout? → **"Yes, changing layout"**
- Estimated cost? → **"$10,000+"**

**Expected Result:**
```
✅ YES - Permit Required. Here's why:
- You are MOVING plumbing fixtures (Moving everything - sink, toilet, shower)
- You are adding or extending water supply lines
- You are modifying drainage or waste systems
- You are adding NEW electrical circuits to the panel
- You are relocating electrical outlets or switches
- You are removing or altering walls (structural modification)
- You are changing the bathroom layout or footprint

Permit Types You'll Need:
- Plumbing Permit
- Electrical Permit
- Building Permit

Code References:
Florida Residential Code §P105.2: Permits required for 
alterations to water or drainage systems

Florida Residential Code §E3801.2: Permits required for 
electrical alterations, including new circuits and relocated wiring

Florida Residential Code §R105.2: Building permits required 
for structural alterations and repairs

National Electrical Code §210.8: GFCI protection required 
for bathroom receptacles

Where to Submit Your Permit:
📍 Your Location: 789 Harbor Dr, Clearwater, FL

Clearwater Building Services
Address: 100 S Myrtle Avenue, Clearwater, FL 33756
Phone: (727) 562-4980
[Different jurisdiction detected!]

Required Inspections:
1. Rough Plumbing (before covering walls)
2. Rough Electrical (before covering walls)
3. Framing/Structural (if walls altered)
4. Final Plumbing
5. Final Electrical
6. Final Building

How to Fill Out Your Permit Application:
[7-step guide]

Step 4: Describe the Work
"Bathroom remodel including: moving plumbing fixtures 
(Moving everything - sink, toilet, shower), adding water 
supply lines, modifying drainage system, adding electrical 
circuits, relocating electrical outlets/switches, 
removing/altering walls. No structural changes to 
load-bearing elements."
```

---

### Test 4: Pinellas County Unincorporated Area

**Setup:**
1. Address: "555 Country Road, Largo, FL" (Unincorporated area)
2. Complete job

**Expected Jurisdiction Result:**
```
Where to Submit Your Permit:
Pinellas County Building Services
Address: 400 South Fort Harrison Avenue, 2nd Floor
Clearwater, FL 33756
Phone: (727) 464-3207
Hours: Monday - Friday: 8:00 AM - 5:00 PM
[Shows county building department, not city]
```

---

## Manual Testing Checklist

### DetailsPage Testing
- [ ] Progress bar updates correctly
- [ ] Questions appear in correct order
- [ ] Conditional questions show/hide based on answers
- [ ] Visual feedback on selected options
- [ ] Back button works
- [ ] Text input questions require input before continuing
- [ ] Auto-advance works for option selections
- [ ] Final question navigates to preview
- [ ] Data is saved to job.detailedScope

### PermitReasoning Testing
- [ ] NO PERMIT shows green checkmark
- [ ] YES PERMIT shows yellow warning
- [ ] Reasons are specific and accurate
- [ ] Code citations display correctly
- [ ] Links to code sections work
- [ ] Permit types listed correctly
- [ ] Exemption reason shows for cosmetic work

### SubmissionGuide Testing
- [ ] Jurisdiction detected correctly from address
- [ ] St. Petersburg → St. Pete building dept
- [ ] Clearwater → Clearwater building dept
- [ ] Unincorporated → Pinellas County building dept
- [ ] Address formats correctly
- [ ] Google Maps link works
- [ ] Phone numbers are clickable
- [ ] Email links work
- [ ] Online portal link works
- [ ] Hours display correctly

### ApplicationGuide Testing
- [ ] Shows 7 steps
- [ ] Work description generates correctly from scope
- [ ] Copy to clipboard works (if implemented)
- [ ] Document checklist matches permit types
- [ ] Plumbing permit → fixture schedule checkbox
- [ ] Electrical permit → load calc checkbox
- [ ] Over $5k → Notice of Commencement checkbox
- [ ] Fee estimate is reasonable
- [ ] Inspection list matches permit types
- [ ] Step numbering is correct

### Flow Testing
- [ ] WizardPage → DetailsPage for bathroom remodel
- [ ] WizardPage → PreviewPage for other job types
- [ ] DetailsPage → PreviewPage after completion
- [ ] PreviewPage → DetailsPage back button works
- [ ] PreviewPage → WizardPage back button works
- [ ] Data persists across navigation

### Edge Cases
- [ ] No address provided → defaults to Pinellas County
- [ ] Address with typo → still detects city if possible
- [ ] All "No" answers → correctly shows NO PERMIT
- [ ] All "Yes" answers → shows all permit types
- [ ] $0 estimated cost → doesn't break
- [ ] Very high estimated cost → fee estimate adjusts

---

## Automated Testing (Future)

### Unit Tests
```typescript
// Test permit logic
describe('determinePermitRequirements', () => {
  it('should require NO permit for cosmetic work', () => {
    const scope = { cosmeticOnly: true };
    const result = determinePermitRequirements('SMALL_BATH_REMODEL', scope);
    expect(result.required).toBe(false);
  });
  
  it('should require plumbing permit when moving fixtures', () => {
    const scope = { movingPlumbingFixtures: true };
    const result = determinePermitRequirements('SMALL_BATH_REMODEL', scope);
    expect(result.required).toBe(true);
    expect(result.permitTypes).toContain('Plumbing Permit');
  });
});

// Test jurisdiction detection
describe('getBuildingDepartment', () => {
  it('should detect St. Petersburg from address', () => {
    const dept = getBuildingDepartment('123 Main St, St Petersburg, FL');
    expect(dept.name).toContain('St. Petersburg');
  });
  
  it('should default to Pinellas County for unknown address', () => {
    const dept = getBuildingDepartment('Unknown Address');
    expect(dept.name).toContain('Pinellas County');
  });
});
```

---

## Visual Regression Testing

### Screenshots to Capture
1. DetailsPage - First question
2. DetailsPage - Mid-progress
3. PreviewPage - NO PERMIT (cosmetic)
4. PreviewPage - YES PERMIT (single permit)
5. PreviewPage - YES PERMIT (multiple permits)
6. SubmissionGuide - St. Pete
7. SubmissionGuide - County
8. ApplicationGuide - Full view

---

## Performance Testing

### Metrics to Check
- [ ] DetailsPage loads in < 500ms
- [ ] Question transitions are smooth (< 100ms)
- [ ] PreviewPage with all components loads in < 1s
- [ ] No memory leaks on navigation
- [ ] Type checking completes without errors

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces questions correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Alt text on icons

---

## User Acceptance Criteria

✅ **Success Criteria:**
1. User can determine if permit is needed WITHOUT calling building dept
2. User understands WHY permit is/isn't needed
3. User knows EXACTLY where to submit permit
4. User has step-by-step instructions to follow
5. User can copy work description for application
6. User knows what inspections to schedule

🎯 **Goal:** Reduce confusion and make permit process transparent and approachable.
