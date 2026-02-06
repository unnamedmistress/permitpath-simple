# PermitPath Design System

## 1. Brand Personality
**Keywords:** calm, trustworthy, efficient, warm, civicgrade

**Mood:** Reassuring and capablereducing anxiety for applicants while communicating official credibility.

**Visual Style:** Clean, modern civic design with soft warmth, clear hierarchy, and minimal friction.

**Why this personality?**
- **Homeowners** are anxious about approvals and timelineswarm neutrals and clear progress reduce stress.
- **Contractors** are rushedhighcontrast actions and efficient layout reduce timetotask.
- **Government staff** need efficiency and legitimacyformal structure, consistent patterns, and professional typography convey trust.

---

## 2. Color System

### 2.1 Core Palette
**Primary (Evergreen):** #1F5A4C
- **Rationale:** Conveys stability and growth without the generic government blue.
- **Psychology:** Trust, progress, calm competence.
- **Use cases:** Primary CTAs, active states, key progress indicators.

**Secondary (Slate):** #475467
- **Rationale:** Professional neutrality that pairs with evergreen.
- **Use cases:** Secondary buttons, subheaders, muted UI elements.

### 2.2 Semantic Accents
- **Success:** #2E8540 (Approved, completed steps)
- **Warning:** #B54708 (Pending review, missing info)
- **Error:** #B42318 (Rejected, blocked)
- **Info:** #175CD3 (Help, education, neutral system alerts)

**Status indicators must use icon + text + color.**

### 2.3 Neutral Scale (Backgrounds & Borders)
- **N0:** #F8FAFC (page background)
- **N1:** #F1F5F9 (cards)
- **N2:** #E2E8F0 (borders, dividers)
- **N3:** #CBD5E1 (disabled outlines)
- **N4:** #94A3B8 (muted text)
- **N5:** #0F172A (primary text)

### 2.4 Color Tokens
`css
:root {
  --primary-600: #1F5A4C;
  --primary-500: #2B6A5B;
  --primary-100: #E6F1EE;

  --secondary-600: #475467;
  --secondary-200: #E2E8F0;

  --success-600: #2E8540;
  --warning-600: #B54708;
  --error-600: #B42318;
  --info-600: #175CD3;

  --neutral-0: #F8FAFC;
  --neutral-1: #F1F5F9;
  --neutral-2: #E2E8F0;
  --neutral-3: #CBD5E1;
  --neutral-4: #94A3B8;
  --neutral-5: #0F172A;
}
`

**Why NOT typical government blue?**
Because PermitPath must feel civicgrade yet modern and empathetic. Evergreen signals calm progress and warmth without appearing outdated or bureaucratic.

---

## 3. Typography

### 3.1 Font Families
- **Headings:** Inter
- **Body:** Inter
- **Data/Numbers:** JetBrains Mono

### 3.2 Type Scale
`css
--text-xs: 0.75rem;   /* Helper text */
--text-sm: 0.875rem;  /* Secondary info */
--text-base: 1rem;    /* Body */
--text-lg: 1.125rem;  /* Emphasis */
--text-xl: 1.25rem;   /* Section headers */
--text-2xl: 1.5rem;   /* Page titles */
--text-3xl: 1.875rem; /* Hero */
`

### 3.3 Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 3.4 Usage
- Page titles: 1.51.875rem, 600700
- Section headers: 1.25rem, 600
- Body: 1rem, 400500
- Labels: 0.875rem, 500

---

## 4. Spacing System
`css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
`

---

## 5. Grid & Layout
- **Container:** maxwidth 1200px
- **Grid:** 12column
- **Gutters:** 24px desktop, 16px mobile
- **Breakpoints:**
  - xs: 320
  - sm: 640
  - md: 768
  - lg: 1024
  - xl: 1280

---

## 6. Elevation & Shadows
`css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.08);
--shadow-md: 0 4px 8px rgba(15, 23, 42, 0.12);
--shadow-lg: 0 12px 24px rgba(15, 23, 42, 0.16);
`

---

## 7. Component Library

### 7.1 Permit Application Card
- **Radius:** 12px
- **Shadow:** --shadow-md
- **Hover:** translateY(-2px), shadow-lg, border color primary
- **Header:** permit ID + icon
- **Status chip:** icon + text + color

### 7.2 Buttons
- **Primary:** Filled, evergreen, white text
- **Secondary:** Outline, evergreen text
- **Tertiary:** Text only
- **Danger:** Filled red, confirmation required

### 7.3 Form Inputs
- Height: 48px
- Border: 1px solid neutral-2
- Focus: 2px primary, subtle glow
- Error: error-600 border + inline error text
- Success: success-600 border + icon

### 7.4 Stepper
- Horizontal on desktop, scrollable on mobile
- Completed steps show checkmark + label
- Current step highlighted with primary ring

### 7.5 Document Upload
- Draganddrop area with dashed border
- Keyboard button for file picker
- Thumbnails 120x120
- Progress bars with percentages

---

## 8. Iconography
- Use outlined icons for neutral states
- Use filled icons for status emphasis
- Always pair with text labels

---

## 9. Motion & Animation
- Duration: 200300ms
- Easing: cubic-bezier(0.2, 0.6, 0.2, 1)
- Use transform/opacity only
- Respect prefers-reduced-motion

---

## 10. Accessibility Rules
- Contrast AA minimum
- 4448px touch targets
- Keyboard accessible for all interactions
- ria-live for autosave and status updates
