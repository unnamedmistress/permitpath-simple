# UX_SPEC  Interaction & Behavior Specifications

## 1. Global Interaction Principles
- **All animations** use transform/opacity only (GPU accelerated).  
- **Hover** is optional; every hover interaction has a focus equivalent.  
- **Auto-save** is non-blocking and debounced.  
- **All status changes** have icon + text and aria-live announcement.  

---

## 2. Permit Application Card States
`	ypescript
PermitCardStates {
  default: {
    elevation: 'shadow-md',
    transition: 'all 200ms ease',
    cursor: 'pointer',
    borderColor: 'var(--border-300)'
  },
  hover: {
    elevation: 'shadow-lg',
    transform: 'translateY(-2px)',
    borderColor: 'var(--primary-600)'
  },
  focus: {
    outline: '2px solid var(--primary-600)',
    outlineOffset: '2px'
  },
  active: {
    transform: 'translateY(0)',
    elevation: 'shadow-sm'
  },
  loading: {
    opacity: 0.6,
    cursor: 'wait',
    overlay: 'spinner + Loading permit'
  }
}
`

---

## 3. MultiStep Form Wizard
`	ypescript
FormWizardBehavior {
  nextStep: {
    trigger: 'Continue button',
    validation: 'All required fields in current step',
    animation: 'slide-left 300ms ease-out',
    autosave: 'save draft before transition'
  },
  previousStep: {
    trigger: 'Back button',
    animation: 'slide-right 300ms ease-out',
    preserveData: true
  },
  stepIndicator: {
    completed: 'green check icon + label',
    current: 'primary circle + label',
    upcoming: 'gray circle + label',
    clickable: 'completed steps only',
    keyboard: 'tab to step, enter/space to jump',
    mobileDisplay: 'scrollable step bar'
  },
  autoSave: {
    trigger: 'onBlur + after file upload',
    debounceMs: 500,
    feedback: 'inline Draft saved + aria-live polite',
    error: 'toast + Retry action'
  }
}
`

---

## 4. Document Upload UX
`	ypescript
DocumentUploadUX {
  entry: {
    dragDrop: true,
    chooseFilesButton: true,
    keyboardAccessible: true
  },
  validation: {
    allowedTypes: ['pdf','jpg','png'],
    maxFileSizeMb: 10,
    totalLimitMb: 50
  },
  preview: {
    thumbSize: '120x120',
    click: 'open preview modal',
    remove: 'X button + confirm'
  },
  progress: {
    type: 'linear',
    percent: true,
    cancelable: true,
    retryOnFailure: true,
    ariaLive: 'assertive'
  }
}
`

---

## 5. Notification System
`	ypescript
NotificationSystem {
  inApp: {
    location: 'header bell',
    badgeCount: true,
    panel: 'top-right slide',
    grouping: 'by permit, newest first'
  },
  toast: {
    trigger: 'status change while online',
    durationMs: 5000,
    action: 'View Details',
    dismissible: true
  },
  email: {
    trigger: 'all status changes',
    template: 'html + text',
    cta: 'deep link to permit'
  },
  sms: {
    trigger: 'critical only',
    optIn: true,
    vendor: 'Twilio'
  }
}
`

---

## 6. Component State Matrix (All components)
- **Default**: normal state  
- **Hover**: visual affordance  
- **Focus**: 2px outline, high contrast  
- **Active**: pressed state  
- **Disabled**: 50% opacity, no pointer events  
- **Loading**: spinner, aria-busy= true  
- **Error**: red outline + inline message

---

## 7. Performance Budgets
`
Initial Load:
- FCP < 1.5s
- TTI < 3s
- Bundle < 250KB gzipped

Assets:
- Hero image < 100KB (WebP)
- Illustrations < 20KB each (SVG)
- Icons < 30KB total (sprite)

Forms:
- Validation response < 100ms
- Autosave <= 1 request/500ms
- Upload chunking > 5MB

Animation:
- 60fps; transform/opacity only
- prefers-reduced-motion support
`

---

## 8. Responsive & Mobile
- Mobile first, single column.  
- Cards stack vertically.  
- Sticky action bar for mobile submit.  
- Touch targets 48x48, spacing 8px.  
- Swipe gestures optional with button equivalents.

---

## 9. Error Handling & Recovery
- Inline form errors below fields + aria-live.  
- Global errors shown as toast with retry.  
- Upload failures show per-file retry.  
- Draft conflict: show Keep mine / Load latest.

---

## 10. Loading Strategy
- Skeletons for permit list and details.  
- Inline spinners for button actions.  
- Keep layout stable to avoid CLS.



---

## 11. Navigation & Information Architecture
- Global nav: Dashboard, My Permits, Start Permit, Notifications, Profile.
- Breadcrumbs on detail pages.
- Back to list always visible.
- Search across permits by ID, address, applicant name.

---

## 12. Filters & Sorting
- Default sort: most urgent first.
- Filters: status, date range, permit type, assigned reviewer.
- Clear all filters button.
- Persist filter state per user.

---

## 13. Empty & Edge States
- No permits: show illustration + CTA.
- No results: show Try removing filters.
- Network error: inline banner + retry.
- Autosave failure: non-blocking warning.

---

## 14. RoleBased Views
- Homeowner: simplified view, fewer fields visible, guidance tips.
- Contractor: bulk actions enabled, faster upload path.
- Staff: audit log panel visible, SLA timers, queue metrics.

---

## 15. Telemetry & UX Metrics
- Track: form step completion rate, upload success rate, time-to-submit.
- Capture: error frequency by field.
- Monitor: abandonment points per step.

---

## 16. Microinteraction Inventory
- Saved indicator: fade in 200ms, hold 1200ms, fade out 200ms.
- Button press: 2px translateY, 100ms.
- Success toast: slide-in 250ms, auto-dismiss 5000ms.
- Skeletons: subtle shimmer, 1.5s loop.

PY

---

## 11. Navigation & Information Architecture
- Global nav: Dashboard, My Permits, Start Permit, Notifications, Profile.
- Breadcrumbs on detail pages.
- Back to list always visible.
- Search across permits by ID, address, applicant name.

---

## 12. Filters & Sorting
- Default sort: most urgent first.
- Filters: status, date range, permit type, assigned reviewer.
- Clear all filters button.
- Persist filter state per user.

---

## 13. Empty & Edge States
- No permits: show illustration + CTA.
- No results: show Try removing filters.
- Network error: inline banner + retry.
- Autosave failure: non-blocking warning.

---

## 14. RoleBased Views
- Homeowner: simplified view, fewer fields visible, guidance tips.
- Contractor: bulk actions enabled, faster upload path.
- Staff: audit log panel visible, SLA timers, queue metrics.

---

## 15. Telemetry & UX Metrics
- Track: form step completion rate, upload success rate, time-to-submit.
- Capture: error frequency by field.
- Monitor: abandonment points per step.

---

## 16. Microinteraction Inventory
- Saved indicator: fade in 200ms, hold 1200ms, fade out 200ms.
- Button press: 2px translateY, 100ms.
- Success toast: slide-in 250ms, auto-dismiss 5000ms.
- Skeletons: subtle shimmer, 1.5s loop.
