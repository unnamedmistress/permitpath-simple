# PermitPath: 12-Week Validation Sprint
**Goal: Prove contractors + homeowners will pay before expanding beyond Pinellas County**

---

## 🎯 Success Metrics (Week 12)

| Metric | Target | Stretch Goal |
|--------|--------|--------------|
| **Paid Homeowner Reports** | 50 ($500 revenue) | 100 ($1,000) |
| **Contractor Signups** | 10 @ $49/mo ($490 MRR) | 25 ($1,225 MRR) |
| **Data Accuracy** | 95% validated | 98% |
| **Photo Extraction Success** | 80% auto-fill rate | 90% |
| **User NPS** | +40 | +60 |

**If you hit targets: This is a real business. Go full-time.**  
**If you miss: Pivot to B2B-only or slow-burn side project.**

---

## 📅 Week-by-Week Breakdown

### WEEKS 1-4: Finish MVP (Feature Complete)

**Week 1: Photo AI Extraction**

**Monday-Tuesday:** OpenAI GPT-4 Vision Integration
```typescript
// File: src/lib/photoExtraction.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export async function extractElectricalPanelData(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `Analyze this electrical panel photo and extract:
                 - Main breaker amperage (look for number on main disconnect)
                 - Manufacturer/brand (Square D, Siemens, GE, Eaton, etc.)
                 - Total circuit breaker spaces (count slots)
                 - Approximate empty spaces
                 - Service type if visible (overhead/underground)
                 - Any visible code violations or safety issues
                 
                 Return as JSON with fields:
                 {
                   "amperage": "150A",
                   "manufacturer": "Square D",
                   "totalSpaces": 30,
                   "emptySpaces": 12,
                   "serviceType": "overhead|underground|unknown",
                   "condition": "good|fair|poor",
                   "violations": ["description"],
                   "confidence": 0.95
                 }
                 
                 If you can't determine a field, use "unknown".`
        },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    }]
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

export async function extractWaterHeaterData(imageUrl: string) {
  // Similar prompt for water heaters
  // Extract: type, fuel, capacity, manufacturer, age, condition
}

export async function extractHVACData(imageUrl: string) {
  // Similar prompt for HVAC units
  // Extract: brand, model, tonnage, SEER, age
}
```

**Wednesday-Thursday:** Image Upload to Firebase Storage
```typescript
// File: src/lib/storage.ts

import { storage } from "@/integrations/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadPhoto(
  file: File,
  jobId: string
): Promise<string> {
  // Create storage reference
  const timestamp = Date.now();
  const filename = `${jobId}/${timestamp}-${file.name}`;
  const storageRef = ref(storage, `permit-photos/${filename}`);
  
  // Upload file
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const url = await getDownloadURL(storageRef);
  return url;
}
```

**Friday:** Integration + Testing
- Wire photo upload → Firebase → AI extraction → checklist auto-fill
- Test with 10 real photos of panels
- Measure accuracy (target: 80%+)

**Saturday-Sunday:** Handle edge cases
- What if AI extraction fails? (Manual fallback)
- What if confidence < 0.7? (Ask user to confirm)
- What if photo is blurry? (Request retake)

---

**Week 2: Payment Integration**

**Monday-Wednesday:** Stripe Setup
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// File: src/lib/stripe.ts

import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

// API route: /api/create-checkout
export async function createCheckoutSession(jobId: string, userEmail: string) {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId,
      userEmail,
      amount: 999, // $9.99 in cents
      successUrl: `${window.location.origin}/success?jobId=${jobId}`,
      cancelUrl: `${window.location.origin}/wizard/${jobId}`
    })
  });
  
  const session = await response.json();
  return session;
}
```

**Thursday-Friday:** PDF Export (For $9.99 Reports)
```typescript
// File: src/lib/pdfExport.ts

import jsPDF from 'jspdf';

export function generatePermitReport(job: Job, checklist: ChecklistItem[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Pinellas County Permit Report', 20, 20);
  doc.setFontSize(10);
  doc.text(`Job Type: ${job.jobType}`, 20, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Checklist
  let y = 50;
  doc.setFontSize(14);
  doc.text('Permit Requirements:', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  checklist.forEach((item, i) => {
    doc.text(`${i + 1}. ${item.title}`, 25, y);
    y += 5;
    if (item.value) {
      doc.setTextColor(100);
      doc.text(`   ${item.value}`, 25, y);
      doc.setTextColor(0);
      y += 5;
    }
    y += 3;
  });
  
  // Legal Citations
  y += 10;
  doc.setFontSize(12);
  doc.text('Legal References:', 20, y);
  // Add code citations...
  
  // Footer
  doc.setFontSize(8);
  doc.text('Generated by PermitPath.app - Always verify with building department', 20, 280);
  
  return doc.output('blob');
}
```

**Weekend:** Test end-to-end payment flow
- Free lookup → Paywall → Stripe checkout → PDF delivery

---

**Week 3: Polish UI/UX**

**Monday-Tuesday:** Mobile Optimization
- Test on real iPhone/Android
- Fix any layout issues
- Optimize photo upload for mobile camera

**Wednesday:** Add Onboarding Tutorial
```tsx
// First-time user experience
<Tutorial steps={[
  { title: "Welcome!", text: "I'll help you figure out what permits you need." },
  { title: "Take Photos", text: "Upload photos and I'll extract the details automatically." },
  { title: "Get Your Report", text: "Preview your permit checklist, then download the full report." }
]} />
```

**Thursday-Friday:** Error Handling & Edge Cases
- What if user abandons mid-flow? (Save progress)
- What if photo upload fails? (Retry logic)
- What if payment fails? (Clear error messages)

**Weekend:** Load Testing
- Simulate 100 concurrent users
- Optimize any slow API calls
- Test Firestore scaling

---

**Week 4: Content & Marketing Prep**

**Monday-Wednesday:** Landing Page SEO
```html
<!-- File: index.html - Update meta tags -->
<title>Pinellas County Permit Requirements - PermitPath</title>
<meta name="description" content="Get instant permit requirements for Pinellas County. Water heaters, HVAC, electrical, roofing, bathrooms. Upload photos for AI-powered guidance.">

<!-- Local Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "PermitPath",
  "description": "AI-powered permit guidance for Pinellas County contractors and homeowners",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 27.9659,
      "longitude": -82.8001
    },
    "geoRadius": "50 miles"
  }
}
</script>
```

**Thursday-Friday:** Create 3 Blog Posts (SEO)
1. **"Pinellas County Permit Guide 2024"** (2,000 words)
   - All permit types
   - Fee schedules
   - Timeline estimates
   - Common mistakes

2. **"Do I Need a Permit to Replace My Water Heater in Pinellas County?"** (1,500 words)
   - Yes/no flowchart
   - Tank vs. tankless differences
   - Express permit process
   - Real example

3. **"Top 9 Permits Homeowners Get Wrong in Pinellas County"** (1,800 words)
   - HVAC, electrical, bathroom, etc.
   - What happens if you skip permits
   - How to fix unpermitted work

**Weekend:** Set up Google Ads
- Campaign 1: "Pinellas County permit requirements"
- Campaign 2: "Water heater permit Clearwater"
- Campaign 3: "Bathroom remodel permit St Petersburg"
- Budget: $20/day ($140/week)

---

### WEEKS 5-8: Private Beta with 20 Contractors

**Week 5: Recruit Beta Testers**

**Monday:** Create Outreach List
```bash
# Sources:
- Pinellas County permit records (last 6 months)
- Angi Pro listings (Pinellas plumbers, electricians)
- Thumbtack contractors (filter by Pinellas)
- Facebook groups: "Pinellas Contractors"
- LinkedIn: Search "plumber Clearwater FL"

# Goal: 100 email addresses
```

**Tuesday-Thursday:** Cold Email Campaign
```
Subject: Free tool to speed up your Pinellas County permits

Hi [Name],

I'm building a tool for Pinellas County contractors to simplify permits.

Instead of digging through county PDFs and calling the permit office, 
you answer a few questions (or upload a photo) and get:

✓ Exact permit requirements
✓ Fee breakdown
✓ Required documents
✓ Timeline estimates

I'm looking for 20 local contractors to test it for free through March.

In exchange: Your feedback helps me make it better for everyone.

Interested? Hit reply and I'll send you access.

Thanks,
[Your Name]
PermitPath
```

**Friday:** Follow-up Calls
- Call contractors who opened email but didn't reply
- Offer personal demo over Zoom
- Goal: 20 commitments by end of week

**Weekend:** Set up beta cohort
- Create "Pro" accounts (free for 3 months)
- Send welcome email with getting-started guide
- Schedule weekly check-in calls

---

**Week 6-7: Beta Usage & Feedback**

**Daily Tasks:**
- Monitor beta user activity (Mixpanel/PostHog)
- Send 1-on-1 messages: "How's it going? Any issues?"
- Fix bugs reported within 24 hours

**Weekly Check-in Calls (Friday):**
```
Questions to ask:
1. Did you use PermitPath this week? How many times?
2. What permit types did you look up?
3. Was the data accurate? Any errors?
4. Did photo upload work for you?
5. Would you pay $49/month for this after beta ends?
6. What features are missing?
7. Who else should I talk to?
```

**Feedback Incorporation:**
- Prioritize by frequency (if 10/20 say same thing, fix it)
- Ship fixes weekly (not daily - batch updates)

**Key Metrics to Track:**
| Metric | Target |
|--------|--------|
| Active weekly users | 15/20 (75%) |
| Permits looked up | 100 total |
| Photo uploads | 50 |
| Data accuracy validated | 95%+ |
| "Would pay" responses | 10/20 (50%) |

---

**Week 8: Beta Retrospective**

**Monday-Tuesday:** Analyze Usage Data
```sql
-- Questions to answer:
- Which permit types most popular? (Focus there)
- Which features unused? (Cut them)
- What's the drop-off rate? (Fix friction)
- Average time to complete permit lookup? (Optimize)
```

**Wednesday:** Survey Beta Users
```
Quick Survey (5 questions):

1. Rate PermitPath accuracy: 1-10
2. Would you recommend to other contractors? Y/N
3. What's the #1 feature we should add?
4. Would you pay $49/month after beta ends?
5. Can we use your quote as a testimonial?
```

**Thursday-Friday:** Iterate Based on Feedback
- Fix top 3 complaints
- Add #1 most-requested feature (if quick)
- Polish UI based on usability issues

**Weekend:** Prepare for Public Launch
- Finalize pricing tiers
- Write launch email
- Set up analytics for homeowner funnel

---

### WEEKS 9-12: Public Launch & Revenue Validation

**Week 9: Soft Launch (Homeowners)**

**Monday:** Publish Blog Posts (SEO kickoff)
- "Pinellas County Permit Guide 2024"
- "Do I Need a Permit for My Water Heater?"
- "Top 9 Permit Mistakes"
- Share on Facebook groups (homeowner groups)

**Tuesday-Thursday:** Google Ads Campaign Launch
```
Campaign 1: Search Ads
Keywords:
- "pinellas county permit requirements" ($1.50 CPC)
- "water heater permit clearwater" ($2.00 CPC)
- "bathroom permit st petersburg" ($1.75 CPC)

Budget: $30/day
Expected: 15 clicks/day → 450 clicks in 30 days
Conversion: 5% → 22 trials → 11 paid reports @ $9.99 = $110

Campaign 2: Display Ads (Retargeting)
Show ads to people who visited but didn't convert
Budget: $10/day
```

**Friday:** Facebook Ads Test
```
Audience: Pinellas County homeowners, age 35-65, interested in:
- Home improvement
- DIY
- Home Depot / Lowe's

Ad Creative:
"Replacing your water heater? Make sure you get the right permit.
PermitPath tells you exactly what you need in 60 seconds."

Budget: $10/day test
```

**Weekend:** Monitor & Optimize
- Check ad performance
- Adjust bids
- A/B test ad copy

---

**Week 10: Iterate Based on Homeowner Behavior**

**Monday:** Analyze Funnel
```
Conversion Funnel:
1. Landing page visit → 1,000 visitors
2. Start permit lookup → 300 (30%)
3. Complete lookup → 150 (15%)
4. Click "Get Report" → 75 (7.5%)
5. Pay $9.99 → 30 (3%)

Where's the drop-off? Optimize that step.
```

**Tuesday-Thursday:** A/B Tests
- **Test 1:** Free preview vs. immediate paywall
- **Test 2:** $9.99 vs. $7.99 pricing
- **Test 3:** "Download Report" vs. "Get Your Permit Guide"
- **Test 4:** Photos required vs. optional

**Friday:** Contractor Upsell Push
Email beta testers:
```
Subject: Your free Pro plan ends in 21 days

Hi [Name],

Your free PermitPath Pro access expires March 31st.

We'd love to keep you onboard at $49/month.

But first: We want to make sure it's worth it for you.

Quick question - what would make PermitPath a "must-have" 
tool that you'd pay for monthly?

Hit reply and let me know.

Thanks,
[Your Name]
```

**Weekend:** Prep conversion campaign
- Design "last 7 days" discount email
- Create comparison chart (Pro vs. Free)
- Record demo video (Loom)

---

**Week 11: Push for Contractor Conversions**

**Monday:** Send Conversion Email
```
Subject: Lock in $39/month (before price goes up)

[Name],

Your free trial ends in 7 days.

I want to offer you a deal:
Sign up by Friday → $39/month (instead of $49)

That's locked in forever - even when we raise prices.

Why pay for PermitPath?
- Save 2+ hours per week on permit research
- Never mis-quote permit fees again
- Photo AI extracts panel/equipment specs automatically

[CTA: Lock in $39/month →]

This offer expires Friday at midnight.

Thanks,
[Your Name]
```

**Tuesday-Friday:** Personal Outreach
- Call the 5 most active beta users
- Ask: "What would it take for you to sign up?"
- Offer custom pricing if needed (gather intel on willingness to pay)

**Weekend:** Analyze Results
```
Beta Conversion:
- 20 beta users
- Goal: 10 paid signups (50%)
- If < 5: Why? (Price too high? Not valuable enough?)
- If > 10: You have product-market fit!
```

---

**Week 12: Final Push & Decision Point**

**Monday-Wednesday:** Homeowner Report Push
- Double Google Ads budget ($60/day)
- Offer: "First 100 reports at $7.99 (save $2)"
- Email anyone who started but didn't finish

**Thursday:** Tally Results
```
Homeowner Revenue (12 weeks):
- Reports sold: ____
- Revenue: $____ 
- Target: 50 reports ($500)

Contractor Revenue (MRR):
- Signups: ____
- MRR: $____
- Target: 10 @ $49 = $490/month
```

**Friday: Decision Point**

**If you HIT targets (50 reports + 10 contractors):**
```
✅ You have product-market fit
✅ Validated willingness to pay
✅ Proven data accuracy (95%+)

Next steps:
1. Raise seed round ($500k-1M)
   - Use: 2 engineers, 1 data researcher, 1 sales
   - Goal: Expand to 20 jurisdictions in 12 months

2. OR: Bootstrap slow
   - Keep day job
   - Reinvest revenue into expansion
   - Add 1 jurisdiction per month

3. Apply to accelerators
   - Y Combinator
   - Techstars
   - Local Florida accelerators
```

**If you MISS targets (< 25 reports or < 5 contractors):**
```
⚠️ Dig deeper:

Homeowners didn't buy → Why?
- Too expensive? (Try $4.99)
- Don't trust accuracy? (Add testimonials)
- Didn't find you? (SEO/ads need work)

Contractors didn't convert → Why?
- Not saving time? (Add more features)
- Don't trust tech? (Need sales calls, not self-serve)
- Price too high? (Try $29/month)

Options:
A. Pivot to contractor-only B2B (easier sale)
B. Pivot to B2B2C (sell to building depts)
C. Keep as nights/weekends project (slow burn)
D. Sell to competitor / partner with building dept
```

---

## 🎯 Week-by-Week Checklist

### Week 1: ☐ Photo AI Extraction
- [ ] Integrate OpenAI GPT-4 Vision API
- [ ] Firebase Storage for image uploads
- [ ] Extract electrical panel data
- [ ] Extract water heater data
- [ ] Extract HVAC data
- [ ] Test on 10 real photos
- [ ] Handle extraction failures (fallback to manual)

### Week 2: ☐ Payment Integration
- [ ] Stripe account setup
- [ ] Create checkout session API
- [ ] Test $9.99 purchase flow
- [ ] PDF export functionality
- [ ] Email delivery of reports
- [ ] Success/cancel pages

### Week 3: ☐ Polish UI/UX
- [ ] Mobile optimization (test on real devices)
- [ ] Add onboarding tutorial
- [ ] Error handling for all edge cases
- [ ] Save progress (don't lose user data)
- [ ] Load testing (100 concurrent users)

### Week 4: ☐ Content & SEO
- [ ] Update landing page meta tags
- [ ] Write 3 SEO blog posts
- [ ] Set up Google Ads ($20/day budget)
- [ ] Create Facebook presence
- [ ] Schema markup for local SEO

### Week 5: ☐ Recruit Beta Testers
- [ ] Build list of 100 contractors
- [ ] Send cold email campaign
- [ ] Follow-up calls (20 commits)
- [ ] Create "Pro" beta accounts
- [ ] Welcome email + onboarding

### Week 6-7: ☐ Beta Feedback Loop
- [ ] Monitor daily usage
- [ ] Weekly check-in calls (Fridays)
- [ ] Fix bugs within 24 hours
- [ ] Track accuracy validation
- [ ] Measure "would pay" sentiment

### Week 8: ☐ Beta Retrospective
- [ ] Analyze usage data
- [ ] Survey all beta users
- [ ] Iterate based on top feedback
- [ ] Get testimonial quotes (3-5)
- [ ] Prepare for public launch

### Week 9: ☐ Soft Launch (Homeowners)
- [ ] Publish blog posts
- [ ] Launch Google Ads
- [ ] Test Facebook Ads
- [ ] Monitor conversion funnel
- [ ] A/B test ad creative

### Week 10: ☐ Optimize Conversion
- [ ] Analyze funnel drop-offs
- [ ] Run A/B tests (pricing, copy)
- [ ] Email beta users (conversion reminder)
- [ ] Iterate based on data

### Week 11: ☐ Contractor Conversions
- [ ] Send "trial ending" emails
- [ ] Offer early-bird pricing
- [ ] Personal outreach calls (top 10)
- [ ] Address objections
- [ ] Close deals

### Week 12: ☐ Final Push & Decision
- [ ] Double ad budget (last sprint)
- [ ] Homeowner discount offer
- [ ] Tally final results
- [ ] **Make go/no-go decision**
- [ ] Plan next phase (raise/bootstrap/pivot)

---

## 📊 Daily Metrics Dashboard

**Set up PostHog, Mixpanel, or Google Analytics 4 to track:**

### Homeowner Funnel
```
Landing page views
  ↓ (30% expected)
Started permit lookup
  ↓ (50% expected)
Completed lookup
  ↓ (50% expected)
Clicked "Get Report"
  ↓ (40% expected)
Purchased report ($9.99)

Overall conversion: 3-5% (industry standard for SaaS)
```

### Contractor Funnel
```
Beta invite sent
  ↓ (20% expected)
Signed up for beta
  ↓ (75% expected)
Used tool 3+ times
  ↓ (50% expected)
Said "would pay"
  ↓ (80% expected)
Actually paid

Overall conversion: 6-10% (beta to paid)
```

### Data Quality
```
Photos uploaded: _____
Successful extractions: _____% (target: 80%)
User corrections submitted: _____
Data accuracy confirmed: _____% (target: 95%)
```

---

## 💰 Financial Projections (Week 12)

### Best Case
```
Homeowner Reports:
- 100 reports @ $9.99 = $999

Contractor Signups:
- 25 @ $49/month = $1,225 MRR
- Annual value: $14,700

Total First 12 Weeks: $15,699
Implied Annual Run Rate: $68k ARR
```

### Base Case
```
Homeowner Reports:
- 50 reports @ $9.99 = $500

Contractor Signups:
- 10 @ $49/month = $490 MRR
- Annual value: $5,880

Total First 12 Weeks: $6,380
Implied Annual Run Rate: $28k ARR
```

### Worst Case
```
Homeowner Reports:
- 10 reports @ $9.99 = $100

Contractor Signups:
- 2 @ $49/month = $98 MRR
- Annual value: $1,176

Total First 12 Weeks: $1,276
Implied Annual Run Rate: $5.5k ARR

↓
Signals: Not enough demand or wrong approach
Action: Pivot or shelve
```

---

## 🚨 Red Flags to Watch For

### Week 4 Red Flags
- [ ] Beta recruitment < 10 contractors (market doesn't care)
- [ ] Photo AI accuracy < 70% (tech doesn't work yet)
- [ ] Can't finish all 9 permit types (scope too big)

**Action:** Narrow scope to 3 permit types (water heater, HVAC, electrical)

### Week 8 Red Flags
- [ ] < 5 active weekly beta users (not sticky)
- [ ] Data accuracy < 90% (can't trust it)
- [ ] < 5 say "would pay" (no willingness to pay)

**Action:** Major pivot (B2B-only? Different geography? Contractor focus?)

### Week 12 Red Flags
- [ ] < 10 homeowner reports sold (no consumer demand)
- [ ] < 3 contractor conversions (no B2B demand)
- [ ] High churn (signups cancel within 30 days)

**Action:** Honest assessment - is this a business or a feature?

---

## ✅ Go/No-Go Decision Framework (Week 12)

### ✅ GO FULL-TIME IF:
```
1. ✅ 50+ homeowner reports sold
2. ✅ 10+ contractor signups @ $49/mo
3. ✅ 95%+ data accuracy validated
4. ✅ Strong testimonials from beta users
5. ✅ Clear path to expand (5 more jurisdictions)
6. ✅ You're excited to work on this daily

Next step: Raise seed or bootstrap aggressively
```

### ⏸️ KEEP AS SIDE PROJECT IF:
```
1. ⚠️ 25-50 homeowner reports (modest demand)
2. ⚠️ 5-10 contractor signups (some traction)
3. ✅ Data accuracy good (95%+)
4. ⚠️ You're not sure about full-time commitment

Next step: Slow growth, reinvest revenue, revisit in 6 months
```

### 🛑 PIVOT OR SHELVE IF:
```
1. ❌ < 10 homeowner reports (no consumer demand)
2. ❌ < 3 contractor signups (no B2B demand)
3. ❌ Data accuracy issues (can't trust it)
4. ❌ Beta users churned (didn't find value)
5. ❌ You're not excited anymore

Options:
A. Pivot to contractors-only (easier sale)
B. Pivot to B2B2C (sell to building departments)
C. Sell to competitor (HomeAdvisor, Thumbtack)
D. Open-source and move on
```

---

## 🎯 My Recommendation

**This is a better opportunity than MenuSpy**, but only if you can prove demand in 12 weeks.

Don't spend 6 months building a multi-jurisdiction platform before validating.

**Win Pinellas County first.** 

If contractors pay $49/month and homeowners pay $9.99/report in ONE county, you have a $10M+ business.

If they don't, you learned in 12 weeks instead of 12 months.

---

**Want help with:**
- Week 1: Photo AI extraction code?
- Week 2: Stripe integration?
- Week 5: Contractor outreach emails?
- Week 9: Landing page copy?

I can help you execute any part of this plan.

The strategic analysis is done. Now it's execution time.
