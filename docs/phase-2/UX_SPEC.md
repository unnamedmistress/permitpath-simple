# PermitPath UX Specification

## 1. Interaction Principles
- **Predictable:** All states (hover, focus, loading) are visible and consistent.
- **Fast feedback:** Every action yields visible feedback in < 200ms.
- **Accessible:** Keyboard and screen reader parity with pointer interactions.
- **Calm urgency:** Use color + copy + icon to signal status without panic.

---

## 2. Component State Specifications

### 2.1 Permit Card States
`	ypescript
PermitCardStates {
  default: {
    elevation: 'shadow-md',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  hover: {
    elevation: 'shadow-lg',
    transform: 'translateY(-2px)',
    borderColor: 'var(--primary-500)'
  },
  active: {
    transform: 'translateY(0)',
    elevation: 'shadow-sm'
  },
  focus: {
    outline: '2px solid var(--primary-500)',
    outlineOffset: '2px'
  },
  loading: {
    opacity: 0.6,
    cursor: 'wait',
    overlay: 'Loading spinner'
  }
}
`

### 2.2 Button States
`	ypescript
ButtonStates {
  default: {
    height: '48px',
    radius: '8px'
  },
  hover: {
    transform: 'translateY(-1px)',
    shadow: 'shadow-sm'
  },
  active: {
    transform: 'translateY(0)',
    shadow: 'none'
  },
  focus: {
    outline: '2px solid var(--primary-500)'
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  loading: {
    spinner: true,
    text: 'Submitting'
  }
}
`

---

## 3. Form Wizard Behavior
`	ypescript
FormWizardBehavior {
  nextStep: {
    trigger: 'Click  Continue',
    validation: 'Required fields only',
    animation: 'Slide left 300ms ease-out',
    autosave: 'Save draft before transition'
  },
  previousStep: {
    trigger: 'Click Back',
    validation: 'None',
    animation: 'Slide right 300ms ease-out',
    preserveData: true
  },
  stepIndicator: {
    completed: 'Checkmark + label',
    current: 'Primary ring + label',
    upcoming: 'Muted circle + label',
    clickable: true,
    keyboard: 'Enter/Space to activate',
    mobileDisplay: 'Horizontal scrollable'
  },
  autoSave: {
    trigger: 'On blur of any input',
    debounce: 500,
    feedback: 'Saved indicator (fade in/out 800ms)',
    errorHandling: 'Toast if save fails'
  }
}
`

---

## 4. Document Upload UX
`	ypescript
DocumentUploadUX {
  dragAndDrop: {
    dragOver: {
      visual: 'Border solid + background tint',
      text: 'Drop files here'
    },
    drop: {
      validation: [
        'PDF, JPG, PNG only',
        'Max 10MB per file',
        'Total 50MB per application'
      ],
      feedback: {
        success: 'Thumbnail + filename',
        error: 'Inline error + red border'
      }
    }
  },
  filePreview: {
    thumbnail: '120x120px',
    hover: 'Enlarge',
    click: 'Modal preview',
    remove: 'X button with confirm'
  },
  uploadProgress: {
    indicator: 'Linear progress bar',
    percentage: true,
    cancelable: true,
    errorRetry: 'Retry button'
  }
}
`

---

## 5. Notification System
`	ypescript
NotificationSystem {
  inApp: {
    location: 'Header bell',
    display: 'Slide-down panel',
    persistence: 'Unread until clicked',
    grouping: 'By permit'
  },
  toast: {
    trigger: 'Real-time status change',
    duration: 5000,
    actions: 'View Details',
    dismissible: true
  },
  email: {
    trigger: 'All status changes',
    template: 'HTML + plain text',
    cta: 'Direct link'
  },
  sms: {
    trigger: 'Critical only',
    optIn: true,
    provider: 'Twilio'
  }
}
`

---

## 6. Performance Budgets
- **FCP:** < 1.5s
- **TTI:** < 3s
- **Bundle:** < 250KB gzipped
- **Images:** Hero < 100KB (WebP), illustrations < 20KB (SVG preferred)
- **Icons:** < 30KB total

---

## 7. Animation Standards
- 60fps mandatory
- Transform/opacity only
- Easing: cubic-bezier(0.2, 0.6, 0.2, 1)
- Reduced motion honored

---

## 8. Loading Strategies
- Skeleton loaders for cards and lists
- Inline spinners for button actions
- Progressive disclosure for large forms

---

## 9. State Management
- Form data saved per step
- Optimistic UI for status updates
- Retry queues for failed uploads
