# PermitPath UX/UI Overhaul - Product Requirements Document

## 1. Executive Summary

**Product:** PermitPath - Contractor Permit Assistant
**Objective:** Redesign the application with a professional, trustworthy design system that increases user confidence and completion rates.
**Timeline:** 1 Phase (Design + Build)
**Success Metric:** Professional brand perception, 15+ edge cases covered, WCAG 2.1 AA compliance

## 2. Problem Statement

The current PermitPath application lacks visual polish and professional consistency. Contractors need to trust the tool with official permit processes. A generic design erodes confidence in the app's authority and expertise.

## 3. Target Users

- **Primary:** Residential contractors (HVAC, electrical, roofing, plumbing)
- **Age Range:** 25-55
- **Tech Comfort:** Mixed (some tech-hesitant)
- **Location:** Primarily Pinellas County, FL
- **Pain Points:** Complex permit paperwork, uncertainty about requirements, time-consuming research

## 4. Jobs To Be Done

1. **When I** need to pull a permit, **I want to** quickly find requirements, **so I can** start the job without delay.
2. **When I** start a new project, **I want to** know exactly what documents I need, **so I can** gather them efficiently.
3. **When I** have permit questions, **I want to** get accurate answers fast, **so I can** avoid permit rejection.
4. **When I** manage multiple jobs, **I want to** track permit status, **so I can** plan my work schedule.

## 5. Core Pivots Selected

### Pivot: Professional Authority
Transform from "generic tool" to "official permit partner" through:
- Blueprint-inspired color palette
- Architect/blueprint visual language
- Trust signals throughout

## 6. Acceptance Criteria (12)

### Visual Design
- [AC-01] Color palette uses Blueprint Blue (#0A3A7E) as primary brand color
- [AC-02] All 6 screens implement new design system consistently
- [AC-03] Typography uses Inter font with defined hierarchy
- [AC-04] 8px grid spacing system applied throughout

### Components
- [AC-05] Button components: Primary, Secondary, Destructive, Ghost variants
- [AC-06] Input fields with 44px minimum touch targets
- [AC-07] Card components with consistent shadow/border treatment
- [AC-08] Navigation maintains bottom nav with proper active states

### Assets
- [AC-09] Hero image (16:9) generated and integrated
- [AC-10] 4 job type icons created (SVG style)
- [AC-11] AI assistant banner image generated (3:1)
- [AC-12] Empty state illustration created (4:3)

## 7. Out of Scope
- New feature development
- Backend changes
- Database schema changes
- Authentication flow changes

## 8. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Asset generation delays | Medium | Medium | Generate assets early, parallel to component work |
| Component breaking changes | Low | High | Maintain shadcn/ui patterns, incremental updates |
| Mobile responsive issues | Medium | Medium | Test at multiple breakpoints during build |

## 9. Release Criteria
- All 12 acceptance criteria PASS
- WCAG 2.1 Level AA baseline achieved
- Browser QA confirms no blockers
- App remains runnable throughout
