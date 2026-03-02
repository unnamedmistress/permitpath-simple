# PermitPath Upgrade Plan

**Date:** March 2, 2026  
**Audience:** Product, engineering, QA, contractor advisors  
**Goal:** Remove user confusion in the existing permit workflow and add a contractor-friendly AI chat flow with image upload.

## 1. Executive Summary

PermitPath already has strong permit logic and checklist scaffolding, but user feedback shows breakdowns in clarity, trust, and flow completion. The biggest issues are unclear language, vague requirement details, missing guidance after checklist generation, and unreliable create-job behavior.

This plan focuses on two tracks:

1. **Clarity and reliability upgrades to the current wizard/checklist experience** (fastest path to higher completion).
2. **AI Chat + image upload experience** that lets contractors describe work naturally, attach site photos, and get understandable guidance at a 4th grade reading level.

Expected outcomes:

- Higher `Create Job` success and completion rates.
- Fewer support contacts caused by unclear labels and vague requirements.
- Faster time-to-first-action for contractors.
- Improved trust via plain language, direct links, cost/timeline ranges, and transparent next steps.

## 2. Priority Matrix (High / Medium / Low)

| Priority | Feedback Issue | Why Priority | Target Outcome | Owner |
|---|---|---|---|---|
| High | 1) Unclear terminology at start | First-screen confusion blocks all downstream flow | User understands exactly what to do in <30 sec | Product + Frontend |
| High | 2) "Jurisdiction" wording confusion | Core step misunderstood, causes wrong selections | Location question understood immediately | Content + Frontend |
| High | 4) Silent failure on Create Job | Hard blocker; users cannot proceed | 100% visible success or actionable error state | Frontend + QA |
| High | 6) No next-step guidance | Users do not know submission process | Clear post-checklist action path + timeline | Product + Frontend |
| Medium | 3) Vague requirement descriptions | Low confidence; unclear compliance tasks | Requirement cards include source, action, details | Content + Data |
| Medium | 5) Vague success message | Missed expectation-setting moment | Specific “what happens next” messaging | Content + Frontend |
| Medium | 7) No category explanations | Users unsure what/where/how to upload | Category helper text + file rules + examples | UX + Frontend |
| Medium | 8) Need Help section unclear | Users do not know when/how to contact county | Labeled contact card with scope/hours/link | Content + Frontend |
| Low | Analytics/telemetry gaps | Limits optimization pace | Event instrumentation for funnel diagnosis | Frontend + Data |
| Low | Legacy API mismatch risk for image flow | Existing `api/permit-image.js` references old service | Stable implementation path for new AI feature | Backend |

## 3. Detailed Fix Specifications by Feedback Issue

### Issue 1: Unclear terminology at the start

**Current location:** `src/pages/NewJobPage.tsx` header + `src/components/wizard/SmartWizard.tsx` step intro copy.

**Problems:**

- Hero text says "AI-powered permit requirements" but not the user task.
- No checklist of what to prepare before starting.

**Fix spec:**

- Replace top copy with task-based heading and 3-step instruction panel.
- Add "Before you start" prep list above Step 1.
- Add a lightweight time estimate badge (example: "Takes about 3-5 minutes").

**Content example:**

- Heading: "Start a Permit Job"
- Subtext: "Tell us where the job is and what work you are doing. We will build your permit checklist."
- Prep list:
  - "Job address"
  - "Type of work (roof, electrical, plumbing, etc.)"
  - "Any photos or notes you already have"

**Acceptance criteria:**

- 90%+ users can answer "What do I do here?" in usability test without moderator help.
- First-step bounce rate reduced by at least 20%.

### Issue 2: Confusing language: "Jurisdiction"

**Current location:** Step 2 in `src/components/wizard/SmartWizard.tsx`.

**Problems:**

- Prompt says "Select the jurisdiction," which is internal/legal language.

**Fix spec:**

- Change label to "Where is the job located?"
- Keep jurisdiction in backend model, but hide legal term from primary copy.
- Add helper note: "This tells us which building department handles your permit."

**Acceptance criteria:**

- Step 2 completion time drops.
- Wrong-location corrections decrease.

### Issue 3: Vague requirement descriptions

**Current location:** requirement rendering in `src/components/requirements/RequirementsDisplay.tsx`; generated data from `src/services/requirements.ts` and `src/data/permitLogic.ts`.

**Problems:**

- Requirement cards do not answer: where to get forms, whether something must be owned vs obtained, and insurance coverage thresholds.

**Fix spec:**

- Expand requirement schema with:
  - `actionType` (`provide_existing`, `obtain_new`, `verify`, `upload`)
  - `sourceUrl` (official form or agency page)
  - `minimumCriteria` (example: "$500,000 general liability")
  - `whoCanHelp` (county desk, licensing board, insurance agent)
  - `plainLanguageWhy`
- Update requirement card UI with "What this means" and "How to do it" accordion.

**Acceptance criteria:**

- Every required item includes either direct link or explicit "call this office" instruction.
- Reduced support tickets mentioning "Which form do I use?"

### Issue 4: Silent failure on Create Job button

**Current location:** `src/components/wizard/SmartWizard.tsx` completion + `src/pages/NewJobPage.tsx` `handleWizardComplete`.

**Problems:**

- Loading appears, no navigation, no visible failure reason in some cases.

**Fix spec:**

- Add explicit transition state machine (`idle`, `creating`, `created`, `failed`).
- Wrap `onComplete` with timeout guard and structured error handling.
- Show persistent inline error banner if navigation fails, with Retry and "Back to Home".
- Add telemetry events:
  - `create_job_clicked`
  - `create_job_success`
  - `create_job_failed` (+reason)
  - `create_job_navigation_failed`

**Acceptance criteria:**

- Zero silent failures in QA matrix.
- Any failure shows user-friendly message within 2 seconds.

### Issue 5: Vague success message

**Current location:** Step 4 confirmation box in `src/components/wizard/SmartWizard.tsx`.

**Problems:**

- "Ready to create your job?" does not explain result.

**Fix spec:**

- Replace with explicit post-click summary:
  - "When you click Create Job, we will open your checklist page."
  - "You can upload files, mark items done, and see next actions."
- Include visible count of required and optional items.

**Acceptance criteria:**

- Users can predict next screen before clicking.

### Issue 6: No guidance on next steps

**Current location:** `src/pages/WizardPage.tsx` "Next Steps" card.

**Problems:**

- No submission workflow explanation, timeline, or post-completion process.

**Fix spec:**

- Add "Permit Journey" timeline module with 5 stages:
  - Build checklist
  - Collect documents
  - Submit application
  - County review
  - Inspections + final approval
- Show estimated durations per stage using jurisdiction + job type defaults from existing timeline data (`TimelineEstimate`).
- Add "What happens after you submit" section.
- Add clear CTA buttons: "Open county application", "Call permit desk", "Print checklist".

**Acceptance criteria:**

- 80%+ users can explain next step after checklist completion in test sessions.

### Issue 7: No explanations of requirement categories

**Current location:** `src/components/requirements/RequirementsDisplay.tsx`.

**Problems:**

- Category labels show counts only; no format guidance.

**Fix spec:**

- Add expandable category help text with:
  - Accepted file formats (`PDF`, `JPG`, `PNG`).
  - Multiple upload rules (when to combine vs separate).
  - Whether photo/scanned/electronic signatures are accepted (jurisdiction-specific where available).
- Add a "Good upload example" per category.

**Acceptance criteria:**

- Upload error rate decreases.
- Fewer incomplete submissions due to formatting misunderstandings.

### Issue 8: Need Help section is unclear

**Current location:** right rail card in `src/pages/WizardPage.tsx`.

**Problems:**

- Contact card doesn’t say what county can help with; phone label/hours/site missing.

**Fix spec:**

- Replace generic card with structured "County Permit Help" panel:
  - "Call for: form questions, status checks, inspection booking, rejected application fixes"
  - Labeled phone, hours, website, address/map link.
  - Notes for jurisdiction handoffs (e.g., Largo served by Clearwater office).
- Pull from `src/data/jurisdictionData.ts` to keep data centralized.

**Acceptance criteria:**

- Help interactions increase while repeated confusion questions decrease.

## 4. New Feature: AI Chat Interface (with Image Upload)

### Product intent

Let contractors explain the job in plain language, upload 1-5 photos, and receive:

- permit type(s) likely needed,
- direct link(s) to apply,
- estimated costs,
- expected timeline,
- plain-language next steps at a 4th grade reading level.

### Experience flow

1. User opens "AI Permit Assistant" from New Job page.
2. User types short job description (or speaks via mobile keyboard dictation).
3. User uploads images (job site, equipment, plans, existing conditions).
4. AI returns structured card set:
   - "What permit you likely need"
   - "Where to apply"
   - "How much it may cost"
   - "How long it may take"
   - "What to do now"
5. User clicks "Create Job from this" to pre-fill wizard fields and requirements.

### Response constraints

- Reading level target: grade 4.
- Sentence length target: <= 12 words average.
- Use bullets and action verbs.
- Mandatory disclaimer: "This is guidance. County rules can change."

### Safety/quality guardrails

- Never claim legal certainty.
- Show confidence badges (High / Medium / Low).
- If confidence low, ask clarifying questions before final recommendation.
- Log model version and prompt template version per response.

## 5. UI/UX Mockup Descriptions

### Mockup A: New Job "Start" Screen

- Top: "Start a Permit Job" + 3-step instruction line.
- Mid: "Before you start" checklist (address, work type, photos).
- Bottom: Primary CTA "Start with guided form" and secondary CTA "Try AI chat with photos".

### Mockup B: AI Chat Composer

- Left: chat transcript.
- Right or bottom drawer: photo tray (thumbnails, remove, reorder).
- Input prompt placeholder: "Tell me the work in simple words."
- Upload button label: "Add job photos (up to 5)".

### Mockup C: AI Analysis Result Cards

- Card 1: "Permit type likely needed"
- Card 2: "Apply here" (official URL button)
- Card 3: "Cost range"
- Card 4: "Timeline"
- Card 5: "Do this now" checklist
- Footer actions: "Use this plan", "Ask follow-up", "Start over"

### Mockup D: Improved Wizard Step 4 + Create Job

- Explicit message: "Click Create Job to open your checklist."
- Required/optional counts.
- If error: inline red banner with Retry button and support path.

### Mockup E: Checklist Page Right Rail

- "County Permit Help" card with phone label, hours, website.
- "Where to submit" card with map + portal link.
- "Typical timeline" card with stage-by-stage estimates.

## 6. Implementation Roadmap

## Phase 0 (Week 0-1): Plan + instrumentation

1. Align copy deck and taxonomy (replace jargon).
2. Add telemetry events for key funnel points.
3. Create UX acceptance checklist for each issue.

## Phase 1 (Week 1-2): Critical fixes

1. Rework start screen + prep guide.
2. Replace "jurisdiction" copy with location-first language.
3. Fix Create Job failure handling and explicit success/failure states.
4. Expand Next Steps on Wizard page with clear submission path.

## Phase 2 (Week 2-3): Clarity depth

1. Enrich requirement card schema and rendering.
2. Add category format guidance and upload rules.
3. Replace Help card with structured county contact info.
4. Content QA pass for grade-4 readability.

## Phase 3 (Week 3-5): AI chat + image MVP

1. Build chat entry point + conversation UI using existing chat component patterns (`ChatPanel`, `PhotoUpload`).
2. Add image upload pipeline (signed URL + storage + metadata).
3. Add multimodal analysis endpoint returning structured permit guidance.
4. Add "Create Job from AI" prefill bridge.
5. Add fallback behavior when model unavailable.

## Phase 4 (Week 5-6): QA hardening + release

1. End-to-end tests for guided form and AI chat paths.
2. Prompt/policy QA and safety checks.
3. Contractor pilot (5-10 users), tune copy and logic.
4. Roll out with feature flag and monitor metrics.

## 7. Content Rewrite Examples (4th Grade Reading Level)

### Start screen

- Old: "AI-powered permit requirements for Pinellas County contractors"
- New: "Tell us about your job. We will make your permit checklist."

### Location step

- Old: "Select the jurisdiction"
- New: "Where is the job located?"
- Helper: "We use this to find the right permit office."

### Requirement clarity

- Old: "Completed permit application form"
- New: "Fill out the roof permit form. Get it here: [link]. Upload the signed PDF."

- Old: "Valid Florida contractor license"
- New: "You must already have this license. If you do not, call DBPR before filing."

- Old: "General liability insurance certificate"
- New: "Upload proof of insurance. Minimum: $500,000 coverage. Ask your agent for a COI PDF."

### Success message

- Old: "Ready to create your job?"
- New: "Click Create Job to open your checklist page."

### Need Help card

- Old: "Contact Pinellas County Building for assistance"
- New: "Call the permit desk for form help, status checks, and inspection booking."

## 8. Technical Architecture for Image Upload + AI Analysis

### High-level architecture

1. **Frontend (React):**
   - New `AiPermitAssistantPage` and/or panel.
   - Reuse `ChatPanel` for conversation UI.
   - Extend `PhotoUpload` to support multiple files + progress.

2. **Upload service:**
   - Client requests signed upload URL from backend.
   - Client uploads images to storage bucket.
   - Client sends uploaded image references + prompt to analysis endpoint.

3. **AI analysis API:**
   - New endpoint, example `POST /api/permit-assistant/analyze`.
   - Input: `description`, `jurisdiction`, `imageRefs[]`, optional `address`.
   - Output (structured JSON):
     - `permitTypes[]`
     - `applicationLinks[]`
     - `estimatedCostRange`
     - `estimatedTimeline`
     - `nextSteps[]`
     - `confidence`
     - `readingLevelScore`

4. **Knowledge/rules layer:**
   - Use existing jurisdiction data + permit fee/timeline data as grounding context.
   - Merge AI inference with deterministic county links from `jurisdictionData` and `permitFees`.

5. **Guardrails:**
   - Validate output shape server-side.
   - Reject non-compliant outputs and reprompt with stricter template.
   - Apply readability check via existing `src/utils/readingLevel.ts`.

### Data model additions

- `AiAnalysisSession`
  - `id`, `userId`, `createdAt`, `jurisdiction`, `description`, `imageRefs`, `model`, `promptVersion`, `result`, `confidence`.
- `ImageAsset`
  - `id`, `storagePath`, `mimeType`, `sizeBytes`, `uploadedAt`, `checksum`.

### Reliability + observability

- Request timeout + retry policy.
- Error taxonomy: upload error, analysis timeout, invalid output, policy block.
- Logs/metrics: latency p95, error rate, fallback rate, low-confidence rate.

### Security + privacy

- Accept only image MIME types and size limits.
- Strip metadata where feasible.
- Signed URLs with short TTL.
- No secrets in client code.

## 9. Testing Plan

### Unit tests

- Copy mapping and label replacement tests.
- Requirement schema transform tests.
- Readability scoring tests (grade <= 4 target for templated sections).
- AI response parser/validator tests.

### Integration tests

- Wizard path: start -> analyze -> create -> navigate.
- Create Job failure simulation must show inline actionable error.
- Requirement cards show source links and criteria.
- Need Help card renders jurisdiction-specific contact data.

### End-to-end tests

- Contractor happy path (no AI chat).
- AI chat path with 3 images + natural-language prompt.
- AI low-confidence path triggers clarifying question.
- Mobile upload path and retry after network interruption.

### QA/UAT

- Scripted usability sessions with small contractors.
- Measure comprehension checkpoints (what to do, where to apply, what comes next).
- Accessibility checks (keyboard, contrast, screen reader labels).

## 10. Success Metrics

### Funnel metrics

- `start_screen_to_step1` conversion
- `step2_location_completion_rate`
- `create_job_success_rate`
- `wizard_to_checklist_navigation_success_rate`
- `checklist_completion_rate`

### Clarity metrics

- Time-to-first-valid-action on New Job page.
- % users correctly explaining next step in moderated tests.
- Reduction in support tickets containing: "jurisdiction", "which form", "what next".

### AI feature metrics

- AI chat adoption rate.
- Image upload success rate.
- % AI responses meeting reading-level threshold.
- Follow-up clarification rate (lower is better after tuning).
- "Create Job from AI" conversion rate.

### Quality/SLO targets

- Create Job silent failure rate: **0%**.
- AI analysis API p95 latency: **< 8s**.
- AI output schema validation pass rate: **>= 99%**.
- Overall task completion uplift after rollout: **+25% target**.

---

## Suggested Ownership Map

- **Product/UX:** copy rewrites, onboarding flow, mockups, success criteria.
- **Frontend:** wizard updates, error states, category helper UI, AI chat UI.
- **Backend:** upload signing, multimodal analysis endpoint, output validation.
- **Data/Content Ops:** official links dataset maintenance, coverage thresholds, timeline defaults.
- **QA:** end-to-end scenarios, readability audits, accessibility checks.

## Contractor-Friendly Definition of Done

A contractor can open PermitPath, understand what to do in under 30 seconds, complete job setup without hidden failure, know exactly what each requirement means, and use chat + photos to get clear permit type, application link, cost range, and timeline in plain language.
