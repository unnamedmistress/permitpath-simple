---
name: studio-beast
description: Multi-agent studio orchestrator that turns an app concept into a build-ready product.
---

# STUDIO BEAST ORCHESTRATOR

## Overview
All-in-one autonomous product development system for OpenClaw.

## Capabilities
- **Concept Reinvention** using jobs-to-be-done framework
- **UX/UI Design** with 15+ edge cases and visual system
- **Build Planning** with 15+ tasks and test strategy (12+ e2e scenarios)
- **Codex Implementation** via CLI with continuous testing
- **Browser QA** with real-app verification  
- **Accessibility Baseline** ensuring WCAG 2.1 Level AA
- **Autonomous Iteration** up to 6 cycles

## Non-Negotiables
1. **Turn Limits**: Max 5 turns per agent per stage
2. **Acceptance Criteria**: 10+ testable criteria required
3. **Edge Cases**: 15+ scenarios required
4. **Test Plan**: 12+ e2e scenarios required
5. **Accessibility**: WCAG 2.1 Level AA baseline
6. **Git Commits**: Clean history with descriptive messages
7. **Always Runnable**: App never broken in git

## Agent Details

### Product Strategist  
- **Input**: Raw concept
- **Output**: 
- **Key**: Jobs-to-be-done, 3 pivots, 10+ acceptance criteria
- **Constraints**: Max 5 turns, pick ONE pivot

### UX Architect
- **Input**: PRD
- **Output**:   
- **Key**: Primary/secondary journeys, 15+ edge cases, validation rules
- **Constraints**: Max 5 turns, must map to acceptance criteria

### UI Creative Director
- **Input**: PRD + UX Flows
- **Output**: 
- **Key**: 3 visual directions (pick 1), components, 1 bold choice
- **Constraints**: Max 5 turns, NO code, must justify choices

### Tech Lead
- **Input**: All design docs
- **Output**: 
- **Key**: Architecture, 15+ ordered tasks, 12+ e2e test scenarios
- **Constraints**: Max 5 turns, tasks must have dependencies

### Codex Coder
- **Input**: BUILD_PLAN + QA feedback (on iterations)
- **Output**: Working code + CHANGELOG.md
- **Key**: Codex CLI workflow, tests always pass, clean commits
- **Constraints**: Max 5 turns/cycle, never commit broken code, 70%+ coverage

### Browser QA
- **Input**: Running app + acceptance criteria
- **Output**: 
- **Key**: Test all criteria, PASS/FAIL, severity assessment
- **Constraints**: Max 5 turns, must use real browser

### Accessibility QA
- **Input**: Design docs (phase 1) + running app (phase 2)
- **Output**:  + append to QA_REPORT
- **Key**: Keyboard nav, focus states, labels, contrast, ARIA
- **Constraints**: Max 5 turns total, WCAG 2.1 Level AA

### Orchestrator
- **Role**: Coordinate agents, enforce limits, make iteration decisions
- **Decision Logic**: 
  

## Workflow Stages

### Phase 1: Sequential Design
1. Product Strategist (5 min)
2. UX Architect (5 min)  
3. UI Creative Director (5 min)
4. Accessibility QA - Design (3 min)
5. Tech Lead (5 min)

### Phase 2: Iteration Loop (max 6 cycles)
6. Codex Coder (30 min)
7. Browser QA (15 min)
8. Accessibility QA - Code (5 min)
9. Orchestrator Decision  Iterate or Release

### Phase 3: Release
10. Tag release, generate notes
11. Deploy

## Success Criteria
- [x] All acceptance criteria PASS
- [x] No BLOCKER or CRITICAL issues  
- [x] Browser QA confirms e2e scenarios pass
- [x] Accessibility baseline checks pass
- [x] Build reproducible with clean git history

## Time & Cost Estimates

| Phase | Duration | Cost |
|-------|----------|------|
| Design | 45 min | .80 |
| Build (1-3 cycles) | 30-90 min | -6 |
| Release | 5 min | bash.20 |
| **Total** | **2-3 hrs** | **~** |

With mini model: ~-4

## Configuration

See  for system requirements and guardrails.
See  for agent definitions.
See  for detailed agent instructions.

## Version
2.0.0 - Production Ready (February 6, 2026)
