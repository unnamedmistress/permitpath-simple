# Accessibility Checklist (WCAG 2.1 AA)

## Color Contrast Matrix
- Primary (#1F5A4C) on white: **Pass** (AA)
- Secondary (#475467) on white: **Pass** (AA)
- Error (#B42318) on white: **Pass** (AA)
- Warning (#B54708) on white: **Pass** (AA)
- Success (#2E8540) on white: **Pass** (AA)
- Info (#175CD3) on white: **Pass** (AA)

**Rule:** Color is never the sole indicatoricons + text labels required.

---

## Keyboard Navigation
- All interactive elements reachable by Tab
- Enter/Space activates buttons and stepper
- Skip links: Skip to main content, Skip to permit list
- Escape closes modals

---

## Form Accessibility
- Every input has <label>
- aria-required + visible indicator
- Errors announced via ria-live= assertive
- Help text linked with ria-describedby

---

## Document Upload Accessibility
- Draganddrop has keyboard alternative
- Choose Files button (focusable)
- File list uses role=list
- Remove buttons accessible with keyboard
- Upload progress announced

---

## Touch Targets
- Minimum 44x44px
- Mobile preferred 48x48px
- 8px minimum spacing between targets

---

## Screen Reader Requirements
- Status icons: aria-label=Status: Pending Review
- Document thumbnails: alt=Floor plan uploaded Jan 15 2024 2.3MB
- Links descriptive (no click here)
- Modals: aria-modal=true + focus trap

---

## Compliance Checklist
### Level A (Critical)
- [ ] All images have alt text
- [ ] All form inputs labeled
- [ ] No keyboard traps
- [ ] Color not sole indicator

### Level AA (Required)
- [ ] Text contrast  4.5:1
- [ ] Touch targets  44x44px
- [ ] Error messages identify error
- [ ] Help text for complex inputs

### Best Practices
- [ ] Headings hierarchical
- [ ] Focus visible
- [ ] ARIA landmarks
- [ ] Reduced motion respected
