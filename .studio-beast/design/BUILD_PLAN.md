# PermitPath UX/UI Overhaul - Build Plan

## 1. Architecture Overview

### Tech Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **State:** React Context + TanStack Query

### File Structure
```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # BottomNav, etc.
│   ├── home/             # Home page components
│   ├── jobs/             # Job card components
│   ├── wizard/           # Wizard step components
│   └── ai-chat/          # AI chat components
├── pages/                # Page components
├── hooks/                # Custom hooks
├── lib/                  # Utilities
├── styles/               # Global styles
└── types/                # TypeScript types
```

## 2. Implementation Tasks (15)

### Phase 1: Design System Setup
| # | Task | Depends On | Files Changed |
|---|------|------------|---------------|
| T1 | Update tailwind.config.ts with new color palette | - | tailwind.config.ts |
| T2 | Configure CSS variables for design tokens | T1 | src/index.css |
| T3 | Update button variants (primary, secondary, destructive, ghost) | T1 | src/components/ui/button.tsx |
| T4 | Update input field styling | T1 | src/components/ui/input.tsx +
| T5 | Create/Update card component styles | T1 | src/components/ui/card.tsx |

### Phase 2: Asset Generation
| # | Task | Depends On | Files Changed |
|---|------|------------|---------------|
| T6 | Generate hero image (architect/blueprint) | - | public/images/hero.jpg |
| T7 | Generate job type icons (4 SVGs) | - | public/icons/*.svg |
| T8 | Generate AI banner image | - | public/images/ai-banner.jpg |
| T9 | Generate empty state illustration | - | public/images/empty-state.jpg |
| T10 | Generate help icons (3 SVGs) | - | public/icons/help-*.svg |

### Phase 3: Screen Redevelopment
| # | Task | Depends On | Files Changed |
|---|------|------------|---------------|
| T11 | Redevelop Home Page with hero, CTAs, features | T1-T6 | src/pages/HomePage.tsx |
| T12 | Redevelop New Job / Wizard Flow | T1, T7 | src/pages/NewJobPage.tsx, WizardPage.tsx |
| T13 | Redevelop AI Permit Assistant | T1, T8 | src/pages/AiPermitAssistantPage.tsx |
| T14 | Redevelop My Jobs Page with cards | T1, T9 | src/pages/MyJobsPage.tsx |
| T15 | Redevelop Help & Support, Settings Pages | T1, T10 | src/pages/HelpPage.tsx, SettingsPage.tsx |

### Phase 4: Navigation Polish
| # | Task | Depends On | Files Changed |
|---|------|------------|---------------|
| T16 | Update BottomNav with new styling | T1 | src/components/layout/BottomNav.tsx |

## 3. E2E Test Scenarios (12)

### Home Page Tests
| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| E1 | CTA navigation | Click "Start New Permit" | Navigate to /new |
| E2 | Hero visibility | Load home page | Hero image visible, text readable |
| E3 | Feature cards display | Scroll to features | 3 feature cards visible |

### Wizard Flow Tests
| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| E4 | Job type selection | Click "Roofing" card | Card selected, Continue enabled |
| E5 | Wizard progression | Select type → Continue | Advance to next step |
| E6 | Form validation | Submit empty form | Error states shown |

### AI Assistant Tests
| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| E7 | Send message | Type message → Send | Message appears in chat |
| E8 | Photo upload | Click attach → Select photo | Photo preview shown |
| E9 | AI response | Send message | AI response displays |

### My Jobs Tests
| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| E10 | Job card display | Create job → Go to My Jobs | Card visible with correct info |
| E11 | Empty state | Delete all jobs | Empty state illustration shown |
| E12 | Job actions | Click card → Edit | Navigate to edit view |

## 4. Test Data Strategy

### Mock Jobs
```javascript
const mockJobs = [
  { id: 1, title: "Roof Repair - 123 Main St", type: "roofing", status: "draft" },
  { id: 2, title: "Water Heater Install", type: "water_heater", status: "submitted" },
  { id: 3, title: "Electrical Panel Upgrade", type: "electrical", status: "approved" },
];
```

## 5. Dependency Graph

```
T1 (Tailwind Config)
├── T2 (CSS Variables)
├── T3 (Button Variants)
├── T4 (Input Styling)
├── T5 (Card Styles)
│   ├── T11 (Home Page) ← T6 (Hero Image)
│   ├── T12 (Wizard) ← T7 (Job Icons)
│   ├── T13 (AI Assistant) ← T8 (AI Banner)
│   ├── T14 (My Jobs) ← T9 (Empty State)
│   └── T15 (Help/Settings) ← T10 (Help Icons)
│       └── T16 (BottomNav)
```

## 6. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Asset generation fails | Low | High | Use placeholders, iterate |
| Component styling conflicts | Medium | Medium | Test incrementally |
| Mobile responsiveness issues | Medium | Medium | Test on real devices |
| Accessibility violations | Low | High | Automated + manual testing |

## 7. Success Criteria

- [ ] All T1-T16 complete
- [ ] All E1-E12 passing
- [ ] WCAG 2.1 Level AA met
- [ ] App runnable throughout
- [ ] Clean git history
