# Design Consensus

## Debates Summary

### Debate Round 1: Color Palette
**Designer:** Proposes a calm, civicadjacent palette anchored in a deep tealgreen to signal trust without the bureaucratic government blue. Adds warm neutrals to reduce anxiety and a muted coral accent for human warmth. Emphasizes clarity in status colors (green/amber/red) with iconography.  
**UX Engineer:** Flags palette sprawl risk. Recommends limiting to a single primary with tints, a single secondary, and semantic colors, with all other colors derived as shades to keep CSS variables minimal and ensure consistent theming.  
**Accessibility Advocate:** Requires WCAG AA contrast and colorblind safe status colors. Notes that amber and green must be distinguishable by luminance and with icons/text. Requests darker primary shade for links and focus outlines.  
**Resolution:** Final palette uses one primary family (Teal), one secondary family (Slate), and a compact semantic set. All status colors pair with icons + labels. Primary shade adjusted to meet 4.5:1 contrast on white. Amber shifted toward ochre for colorblind separation. All key UI text uses neutral900.

### Debate Round 2: Form UX
**Designer:** Defends a multistep wizard with strong progress feedback and milestones to reduce anxiety and improve completion. Proposes autosave on field blur with Saved microfeedback.  
**UX Engineer:** Warns against excessive autosave calls and animation overuse. Requires debounce and a nonblocking save queue.  
**Accessibility Advocate:** Requires keyboardnavigable stepper, arialive for autosave, and explicit progress text. Calls out the need for Save Draft for those who disable autosave.  
**Resolution:** Multistep wizard accepted with: debounce = 500ms, autosave limited to max 1 request/500ms, a visible Draft saved status and arialive updates, stepper keyboard support, and a manual Save Draft button.

### Debate Round 3: Mobile vs Desktop Priority
**Designer:** Proposes mobilefirst layout due to homeowner usage and field staff reviewing permits on phones.  
**UX Engineer:** Agrees but requires performance budgets and touchsafe layout.  
**Accessibility Advocate:** Demands 48x48 touch targets on mobile, 8px minimum spacing, and alternatives for swipe gestures.  
**Resolution:** Mobilefirst layouts with responsive breakpoints. Touch target minimum set to 48x48 on small screens; swipe gestures are optional enhancements only when keyboard controls exist.

## Final Decisions

### Color Palette (Approved by all agents)
- **Primary:** Teal 600 #0F766E (links, primary buttons, focus outline)  
- **Primary Dark:** Teal 700 #0B5F5A (hover, active)  
- **Primary Light:** Teal 100 #DFF5F3 (tints, backgrounds)
- **Secondary:** Slate 600 #475569 (secondary buttons, neutral emphasis)
- **Success:** Green 600 #16A34A
- **Warning:** Amber 600 #B45309 (shifted toward ochre for contrast)
- **Error:** Red 600 #DC2626
- **Info:** Blue 600 #2563EB
- **Neutrals:** 
  - Background: #F8FAFC / #F1F5F9 / #E2E8F0
  - Text: #0F172A (primary), #334155 (secondary) 
  - Borders: #CBD5E1

### Typography (Approved)
- **Headings:**  Inter (700/600)  modern, trustworthy, highly readable.  
- **Body:** System UI stack  reduces font weight, faster load, consistent readability for long forms.  
- **Data/Numbers:** IBM Plex Mono  clarity for permit IDs, fees, codes.

### Component Patterns (Approved)
- Permit cards: shadowmd, border radius 12px, status line with icon + label.  
- Forms: 48px min height inputs, clear validation, inline help, autosave status.  
- Buttons: Primary/Secondary/Tertiary/Danger hierarchy with clear contrast.

### Interaction Design (Approved)
- Wizard transitions: 300ms slide; progress visible and keyboard accessible.  
- Autosave: debounced, nonblocking, arialive.  
- Uploads: draganddrop + keyboard Choose Files, preview and retry.

### Accessibility Compliance (Certified)
- WCAG 2.1 AA contrast targets enforced.  
- Noncolor status indicators (icons + labels).  
- Keyboard access across all functions.  
- Touch targets 48x48 on mobile.

## Disagreements and Tradeoffs
- **Fonts:** Designer wanted two custom fonts; UX Engineer required system body font to reduce load. Consensus: custom headings only.  
- **Autosave frequency:** Designer wanted instant saves; UX Engineer required debounce. Consensus: 500ms debounce + explicit Save Draft.  
- **Palette size:** Designer proposed 12 color roles; UX Engineer reduced to 8 semantic colors + tints.

