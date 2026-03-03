# PermitPath UX/UI Overhaul - UX Architecture Document

## 1. User Flows

### Primary Journey: New Permit Creation
```
Home → New Job → Job Type Selection → (Optional) Photo Upload → AI Analysis → Preview → Save
```

### Secondary Journey: AI Assistant Chat
```
Home → AI Assistant → Message Input → Photo Upload → AI Response → Action Suggestion
```

### Secondary Journey: Job Management
```
Home → My Jobs → Job Card → Preview/Edit/Delete → Update Status
```

## 2. Screen Specifications

### Home Page
**Elements:**
- Hero section with background image
- Value proposition headline
- Primary CTA: "Start New Permit"
- Secondary CTAs: "View My Jobs", "AI Assistant"
- Feature highlights (3 cards)

**Interactions:**
- Tap CTA → Navigate to route
- Hero image parallax (optional)
- Bottom nav active state: Home

### New Job / Wizard Flow
**Elements:**
- Progress indicator (step X of Y)
- Job type selection cards (4 types)
- Form inputs styled with design system
- Navigation: Back, Continue, Skip (where applicable)

**Steps:**
1. Job Type Selection
2. (Optional) Photo Upload
3. AI Analysis Review
4. Permit Requirements Preview

### AI Permit Assistant
**Elements:**
- Banner image (3:1 aspect)
- Chat message area
- Message input with photo button
- Message bubbles (user: right, AI: left)
- Loading states

### My Jobs Page
**Elements:**
- Header with title
- Job cards (title, type, status badge, date)
- Status badges: Draft, Submitted, Approved, Rejected
- Empty state with illustration
- Quick actions: Preview, Edit, Delete

### Help & Support Page
**Elements:**
- Icon grid: Chat AI, Call County, Email Support
- FAQ accordions
- Contact information card

### Settings Page
**Elements:**
- Section grouping
- Toggle switches
- Form inputs
- Account management options

## 3. Edge Cases (18)

### Navigation & Flow
1. **EC-01** User taps back button mid-wizard - save draft or discard?
2. **EC-02** User loses connection during AI analysis - retry mechanism
3. **EC-03** User uploads unsupported photo format - validation error
4. **EC-04** User tries to access wizard without selecting job type - redirect
5. **EC-05** User refreshes page mid-wizard - state persistence

### Content & Data
6. **EC-06** Empty job list - show illustration + CTA to create
7. **EC-07** Long job list - implement scroll with bottom nav visible
8. **EC-08** Job title too long - truncate with ellipsis
9. **EC-09** AI response too long - scrollable message area
10. **EC-10** Photo upload fails - error state with retry

### Device & Accessibility
11. **EC-11** Small screen (320px) - responsive layout
12. **EC-12** Large screen (desktop) - max-width container
13. **EC-13** Landscape orientation - maintain usability
14. **EC-14** Keyboard navigation - focus management
15. **EC-15** Screen reader - proper ARIA labels
16. **EC-16** High contrast mode - color adaptation

### Error States
17. **EC-17** Network error on My Jobs load - offline state
18. **EC-18** Settings save failure - error notification

## 4. Validation Rules

### Form Inputs
- Job title: Required, 3-100 characters
- Photos: Max 5MB each, JPG/PNG only
- Message input: Max 500 characters

### State Transitions
- Draft → Submitted: Must have title + job type
- Submitted → Approved: External process (display only)

## 5. Accessibility Requirements

- WCAG 2.1 Level AA compliance
- 44px minimum touch targets
- Focus indicators visible
- Color contrast 4.5:1 minimum
- Screen reader labels on all interactive elements
- Skip to content link

## 6. Responsive Breakpoints

- Mobile: 320px - 767px (primary)
- Tablet: 768px - 1023px
- Desktop: 1024px+ (max-width: 1200px, centered)

## 7. Animation Specifications

- Page transitions: 200ms fade + 10px slide
- Button hover: 150ms background color transition
- Card hover: 150ms shadow elevation
- Loading states: 400ms pulse animation
