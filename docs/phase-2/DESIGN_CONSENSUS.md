# Design Consensus

## Debates Summary

### Debate Round 1: Color Palette
**Designer:** Proposed a warm, civic-trust palette centered on deep evergreen (trust, stability) with a warm amber accent (urgency without alarm) and a soft neutral canvas. Rationale: calm anxious homeowners, keep contractors moving, and preserve official legitimacy for government staff without the generic  government blue.

**UX Engineer:** Challenged palette breadth and token explosion. Proposed: one primary hue with a disciplined neutral range, and semantic accents (success/warn/error/info) derived from standard accessible hues. Suggested limiting to ~24 color tokens total with 8 semantic slots.

**Accessibility Advocate:** Checked contrast ratios and color-blind safety. Required darker primary for contrast on white and mandated icons + labels for all statuses. Rejected low-contrast yellow on white for Pending. Required a deeper amber or pairing with an outline/badge and text.

**Resolution:** Adopted a **deep evergreen** primary that passes WCAG AA on white, a **muted slate** secondary, and **semantic accents** tuned for contrast. All status indicators must combine color + icon + text. Reduced palette to **one primary, one secondary, four semantic, and a 6step neutral scale**.

---

### Debate Round 2: Form UX
**Designer:** Advocated a multi-step wizard (max 5 steps) with progress tracking to reduce cognitive load. Proposed autosave with visible feedback and a strong sense of progression.

**UX Engineer:** Flagged autosave frequency as a performance concern and risk of race conditions. Proposed **debounced autosave (500ms)** on blur + periodic save every 30s, and moving costly validation to step transitions.

**Accessibility Advocate:** Flagged step indicator accessibility gaps and missing screen reader notifications for autosave. Required keyboard-accessible step navigation, ria-live announcements for Draft saved, and proper ria values for progress.

**Resolution:** Multi-step wizard approved with **accessible stepper**, **debounced autosave**, and **screen-reader announcements**. Validation is step-level with inline errors. Progress bar includes text + ARIA.

---

### Debate Round 3: Mobile vs Desktop Priority
**Designer:** Proposed mobile-first layout and large touch targets, with compact desktop version to preserve density.

**UX Engineer:** Warned about large assets and heavy animations on lowend devices; required performance budgets and reduced motion support.

**Accessibility Advocate:** Required 48x48px touch targets on mobile, and alternative controls for any swipe/gesture interactions.

**Resolution:** **Mobile-first** with progressive enhancement on desktop. Enforced touch target size, spacing, and reducedmotion support. Animations limited to transform/opacity only.

---

## Final Decisions

### Color Palette (Approved by all agents)
- **Primary:** #1F5A4C (Evergreen)
- **Secondary:** #475467 (Slate)
- **Success:** #2E8540
- **Warning:** #B54708
- **Error:** #B42318
- **Info:** #175CD3
- **Neutrals:** #F8FAFC, #F1F5F9, #E2E8F0, #CBD5E1, #94A3B8, #0F172A

### Typography (Approved)
- **Headings:** Inter (clean, modern, widely supported)
- **Body:** Inter (readable, consistent)
- **Data/Numbers:** JetBrains Mono (IDs, permit codes, timestamps)
- **Weights:** 400/500/600/700

### Component Patterns (Approved)
- Permit Application Card with status chip + progress bar
- Multi-step wizard with accessible stepper
- Document upload with drag-and-drop + keyboard alternative
- Button hierarchy with primary/secondary/tertiary/danger

### Interaction Design (Approved)
- Consistent hover/active/focus states
- Autosave on blur with 500ms debounce
- Step transitions 300ms, transform/opacity only
- Toast notifications for real-time status changes

### Accessibility Compliance (Certified)
- WCAG 2.1 AA contrast for text and interactive elements
- Keyboard navigation for all interactive elements
- Screen reader announcements for status + autosave
- 4448px touch targets and adequate spacing

## Disagreements and Trade-offs
- **Brand color warmth:** Kept warmer neutrals but constrained to a tight range to avoid contrast issues.
- **Autosave frequency:** Reduced from continuous to debounced to protect performance.
- **Icon usage:** Icons mandatory for status; increased UI density slightly to protect accessibility.
