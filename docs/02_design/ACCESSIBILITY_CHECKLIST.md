# Accessibility Checklist  WCAG 2.1 AA

## 1. Color Contrast Matrix
- **Primary 600 (#0F766E) on white:** PASS (4.5:1)  
- **Secondary 600 (#475569) on white:** PASS  
- **Text 900 (#0F172A) on Background 50:** PASS  
- **Warning 600 (#B45309) on white:** PASS  
- **Error 600 (#DC2626) on white:** PASS  
- **Success 600 (#16A34A) on white:** PASS

**Requirement:** No status uses color alone. Always pair with icon + label.

---

## 2. Keyboard Navigation
- [ ] All interactive elements reachable by Tab
- [ ] Visible focus outlines on all controls
- [ ] Skip to main content link
- [ ] Stepper is keyboard navigable (Enter/Space to select)
- [ ] Modal focus trap + Escape to close
- [ ] No keyboard traps

---

## 3. Forms & Validation
- [ ] Every input has a <label>
- [ ] ria-required set for required inputs
- [ ] Errors use ria-live= assertive
- [ ] ria-invalid set when errors present
- [ ] Help text uses ria-describedby
- [ ] Autosave confirmation announced via ria-live=polite

---

## 4. Screen Reader Support
- [ ] Status changes announced (aria-live)
- [ ] Progress steps announced Step X of Y
- [ ] Upload progress announced with %
- [ ] Thumbnails have meaningful alt text
- [ ] Links are descriptive (no click here)

---

## 5. Touch Target Compliance
- [ ] Minimum 44x44px (48x48 on mobile)
- [ ] 8px spacing between interactive elements
- [ ] No overlapping tap targets

---

## 6. Motion & Animation
- [ ] prefers-reduced-motion supported
- [ ] No flashing > 3 times per second
- [ ] Animations use transform/opacity only

---

## 7. Document Upload Accessibility
- [ ] Draganddrop not required (button available)
- [ ] File list is focusable with role=list
- [ ] Remove file buttons accessible
- [ ] Upload errors announced

---

## 8. ARIA Landmarks
- [ ] 
ole=main
- [ ] 
ole=navigation
- [ ] 
ole=banner
- [ ] 
ole=contentinfo

---

## 9. Manual Test Scenarios
1. **Homeowner w/ screen reader:** Can start permit, fill form, upload docs, submit.
2. **Contractor w/ keyboard only:** Can navigate lists, open permits, update docs.
3. **Gov staff w/ low vision:** Can review statuses with large text + contrast.

---

## 10. Compliance Signoff
**Level A:** all items pass  
**Level AA:** all items pass  
**Best Practices:**  80% pass before launch



---

## 11. Assistive Tech Testing
- Screen readers: NVDA, JAWS, VoiceOver
- Browsers: Chrome, Edge, Safari
- Keyboard-only navigation in all flows
- High-contrast mode validation

---

## 12. ARIA Requirements by Component
- Stepper: 
ole= tablist, steps as 
ole=tab with ria-selected.
- Progress bars: 
ole=progressbar with aria-valuenow/aria-label.
- Toasts: 
ole=status for info, 
ole=alert for errors.
- Modals: ria-modal=true, labelledby, describedby.

---

## 13. Accessible Microcopy
- Buttons: Upload documents (not Click here).
- Links: View permit details for PERMIT2024001234.
- Errors: Email required. Please enter a valid email address.

---

## 14. Review Signoff Criteria
- 0 critical issues (Level A)
- 0 AA contrast failures
- All keyboard flows tested endtoend
- Screen reader walkthrough successful

PY