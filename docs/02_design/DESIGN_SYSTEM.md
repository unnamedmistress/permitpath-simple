# PermitPath Design System

## 1. Brand Personality
**Keywords:** Trustworthy, calm, efficient, human, precise  
**Mood:** Reassuring and professionalreducing anxiety while guiding users confidently through complex permit steps.  
**Visual Style:** Modern civic clarityclean structure, friendly warmth, and decisive hierarchy.

**Why this personality?**  
Homeowners feel anxious and need reassurance; contractors are rushed and need speed; government staff need clarity and accuracy. The personality blends calm neutrality with warm accents to humanize official processes without sacrificing precision.

---

## 2. Color Palette

### Primary Family (Teal)
- **Primary 700:** #0B5F5A (Active/hover states)  
- **Primary 600:** #0F766E (Primary buttons, links, focus outline)  
- **Primary 500:** #14B8A6 (Accents, highlights)  
- **Primary 100:** #DFF5F3 (Tints, backgrounds, banners)

### Secondary Family (Slate)
- **Secondary 700:** #334155 (Secondary emphasis, headings)  
- **Secondary 600:** #475569 (Secondary buttons, subheadings)

### Semantic Colors
- **Success 600:** #16A34A (Approved, completed)  
- **Warning 600:** #B45309 (Pending/needs review)  
- **Error 600:** #DC2626 (Rejected, blocked)  
- **Info 600:** #2563EB (Guidance, help, info)

### Neutrals
- **Background 50:** #F8FAFC  
- **Background 100:** #F1F5F9  
- **Surface 200:** #E2E8F0  
- **Border 300:** #CBD5E1  
- **Text 900:** #0F172A  
- **Text 700:** #334155  
- **Text 500:** #64748B

**Why NOT typical government blue?**  
Blue is overused in municipal software and can feel cold or bureaucratic. Teal conveys trust and stability while feeling more human and modern, aligning with a guidance, not red tape tone.

---

## 3. Typography System

### Font Families
- **Headings:** Inter (400700)  modern, highly legible, professional.  
- **Body:** System UI stack (SF/Segoe/Roboto)  fast load, consistent readability in long forms.  
- **Data/Numbers:** IBM Plex Mono  clarity for IDs, permit codes, and fees.

### Type Scale
`css
--text-xs: 0.75rem;   /* helper text */
--text-sm: 0.875rem;  /* secondary info */
--text-base: 1rem;    /* body text */
--text-lg: 1.125rem;  /* emphasis */
--text-xl: 1.25rem;   /* section headers */
--text-2xl: 1.5rem;   /* page titles */
--text-3xl: 1.875rem; /* hero text */
`

### Weights
- Regular: 400  
- Medium: 500  
- Semibold: 600  
- Bold: 700

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

## 5. Elevation & Shadows
`css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
--shadow-md: 0 4px 10px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 10px 24px rgba(15, 23, 42, 0.12);
`

---

## 6. Grid & Layout
- **Max content width:** 1200px  
- **Gutters:** 24px desktop, 16px mobile  
- **Column grid:** 12 columns desktop, 4 columns mobile  
- **Layout rule:** Single column on mobile, twocolumn form layout at 1024px.

### Breakpoints
`css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
`

---

## 7. Component Library

### Permit Application Card
- **Radius:** 12px  
- **Shadow:** var(--shadow-md)  
- **Border:** 1px solid #E2E8F0  
- **Hover:** shadow-lg + translateY(-2px)  
- **Status line:** icon + text + semantic color

### Form Inputs
- **Height:** 48px  
- **Radius:** 10px  
- **Border:** 1px solid #CBD5E1  
- **Focus:** 2px outline in Primary 600 + subtle glow  
- **Error:** red border + icon + inline message  
- **Success:** green border + check icon  
- **Disabled:** neutral background + 50% opacity

### Button Hierarchy
- **Primary:** solid teal, high contrast  
- **Secondary:** outline with teal border  
- **Tertiary:** text-only  
- **Danger:** red with confirmation dialog

### Status Badges
- **Pending:** Amber + clock icon  
- **In Review:** Blue + eye icon  
- **Approved:** Green + check icon  
- **Rejected:** Red + X icon  
- **On Hold:** Orange + pause icon

---

## 8. Iconography
- **Style:** Rounded, minimal line icons (1.5px stroke).  
- **Sources:** Lucide or custom SVG set.  
- **Requirement:** All icons paired with text labels for status.

---

## 9. Motion & Animation
- **Default duration:** 200300ms  
- **Easing:** cubic-bezier(0.2, 0.8, 0.2, 1)  
- **Respect:** prefers-reduced-motion  
- **Do:** transform/opacity only

---

## 10. Responsive Strategy
- **Mobile first.**  
- Permit cards stack vertically on small screens.  
- Form wizard stepper becomes horizontal scrollable bar on mobile.  
- Touch targets 48x48 minimum on mobile.

---

## 11. Design Tokens (Example)
`css
:root {
  --primary-600: #0F766E;
  --primary-700: #0B5F5A;
  --secondary-600: #475569;
  --success-600: #16A34A;
  --warning-600: #B45309;
  --error-600: #DC2626;
  --info-600: #2563EB;
  --bg-50: #F8FAFC;
  --text-900: #0F172A;
  --border-300: #CBD5E1;
}
`

---

## 12. Accessibility Guarantees
- Text contrast  4.5:1  
- Touch targets  44x44px (48x48 mobile)  
- Focus indicators high contrast  
- Keyboard navigation for all controls



---

## 13. Role-Based Layout Variants

### Homeowner Dashboard
- Primary hero: Start a Permit card with step-by-step intro.
- Secondary: My Permits list sorted by status.
- Educational panel: What permits do I need? with simple FAQs.

### Contractor Dashboard
- Dense list view with filters (status, client, deadline).
- Quick actions pinned: Upload documents, Request inspection.
- Emphasis on speed: bulk actions available.

### Government Staff Dashboard
- Queue-first layout with SLA timers and priority tags.
- Permit details split pane: list on left, details on right.
- Audit log visible in a fixed panel.

---

## 14. Additional Component Patterns

### Stepper / Progress Bar
- Circular steps with labels; max 5 steps.
- Completed step shows check icon + success color.
- Current step uses primary color ring.

### Table (Review Queue)
- Sticky header with column sort.
- Row hover with subtle background tint.
- Status column includes icon + text.

### Search & Filters
- Search input with magnifier icon.
- Filter chips with clear x for removal.
- Filter count badge on mobile.

### Notifications Panel
- Group by permit; newest first.
- Each item includes time stamp, status change, and action link.
- Unread items highlighted with background tint.

### Empty States
- Friendly illustration + concise action text.
- Primary action button + optional learn-more link.

---

## 15. Microcopy Guidelines
- Use plain language, avoid legal jargon.
- Prefer action verbs: Upload documents, Review details.
- Error text should explain fix: File too large (max 10MB).
- Confirmation text includes next steps.

---

## 16. Data Visualization
- Use minimal charts: progress bars, simple timelines.
- Avoid complex graphs unless required.
- Always include text labels and accessible descriptions.

---

## 17. Design Tokens  Extended
`css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --focus-ring: 0 0 0 3px rgba(15, 118, 110, 0.35);
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 350ms;
}
`

---

## 18. Icon Set Requirements
- Use a consistent 24px grid.
- Stroke width 1.5px.
- Use filled icons only for critical alerts.
- Provide aria-label on all icons.

---

## 19. Accessibility in Design
- Maintain minimum contrast ratios.
- Avoid color-only signals; always pair with text.
- Provide focus outlines on all interactive elements.
- Ensure readable line length (4575 chars).
